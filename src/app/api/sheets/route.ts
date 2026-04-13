import { NextResponse } from 'next/server';
import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID || '1ip9jldvaDt1da2wNyqqrZpIlujByg_YAj_vl_SfWEUI';

function getAuth() {
  const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}');
  
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  });
  
  return auth;
}

async function getSheet(name: string) {
  const auth = await getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  
  let sheet = spreadsheet.data.sheets?.find(s => s.properties?.title === name);
  let sheetId = sheet?.properties?.sheetId;
  
  if (!sheet) {
    const res = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{ addSheet: { properties: { title: name } } }]
      }
    });
    sheetId = res.data.replies?.[0]?.addSheet?.properties?.sheetId;
  }
  
  return { sheets, sheetId };
}

// GET - Ambil data
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const table = searchParams.get('table') || 'Rekening';
  
  try {
    console.log('GET request for table:', table);
    const { sheets } = await getSheet(table);
    
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${table}!A:Z`,
    });
    
    const rows = result.data.values || [];
    if (rows.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }
    
    const headers = rows[0];
    console.log('GET headers:', headers);
    console.log('GET row count:', rows.length - 1);
    
    const data = rows.slice(1).map(row => {
      const obj: any = {};
      headers.forEach((header, i) => {
        obj[header] = row[i] || '';
      });
      return obj;
    });
    
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('GET Error:', error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST - Tambah data
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { table, data } = body;
    
    const { sheets } = await getSheet(table);
    
    // Check if header exists
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${table}!1:1`,
    });
    
    let headers = result.data.values?.[0] || [];
    
    if (headers.length === 0) {
      // Create headers in fixed order
      headers = ['id', 'nama', 'nomor', 'saldo', 'jenis'];
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${table}!1:1`,
        valueInputOption: 'RAW',
        requestBody: { values: [headers] },
      });
    }
    
    // Ensure values match header order
    const values = headers.map(h => {
      const val = data[h];
      if (val === undefined || val === null) return '';
      if (typeof val === 'number') return val;
      return String(val);
    });
    
    // Append row
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${table}!A:Z`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [values] },
    });
    
    return NextResponse.json({ success: true, message: 'Data berhasil ditambahkan' });
  } catch (error: any) {
    console.error('POST Error:', error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PUT - Update data
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { table, data, id } = body;
    
    console.log('PUT request:', { table, id, data });
    
    const { sheets } = await getSheet(table);
    
    // Get all data
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${table}!A:Z`,
    });
    
    const rows = result.data.values || [];
    if (rows.length < 2) {
      return NextResponse.json({ success: false, message: 'Data tidak ditemukan' }, { status: 404 });
    }
    
    const headers = rows[0];
    console.log('Headers:', headers);
    
    const idIndex = headers.indexOf('id');
    
    if (idIndex === -1) {
      return NextResponse.json({ success: false, message: 'Kolom id tidak ditemukan' }, { status: 400 });
    }
    
    // Find row - debug
    console.log('Looking for id:', id, 'type:', typeof id);
    rows.forEach((row, i) => {
      if (i > 0) console.log(`Row ${i}: id=${row[idIndex]}, type=${typeof row[idIndex]}`);
    });
    
    const rowIndex = rows.findIndex((row, i) => i > 0 && String(row[idIndex]) === String(id));
    console.log('Found rowIndex:', rowIndex);
    
    if (rowIndex === -1) {
      return NextResponse.json({ success: false, message: `Data tidak ditemukan, id: ${id}` }, { status: 404 });
    }
    
    // Update row - ensure all columns are in correct order
    const newValues = headers.map(h => {
      const val = data[h];
      console.log(`Header ${h}: value=${val}`);
      if (val === undefined || val === null) return '';
      if (typeof val === 'number') return val;
      return String(val);
    });
    console.log('Updating row with:', newValues);
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${table}!${rowIndex + 1}:${rowIndex + 1}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [newValues] },
    });
    
    return NextResponse.json({ success: true, message: 'Data berhasil diupdate' });
  } catch (error: any) {
    console.error('PUT Error:', error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE - Hapus data
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get('table') || 'Rekening';
    const id = searchParams.get('id');
    
    console.log('DELETE request:', { table, id });
    
    if (!id) {
      return NextResponse.json({ success: false, message: 'ID diperlukan' }, { status: 400 });
    }
    
    const { sheets, sheetId } = await getSheet(table);
    
    // Get all data
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${table}!A:Z`,
    });
    
    const rows = result.data.values || [];
    const headers = rows[0];
    console.log('DELETE headers:', headers);
    const idIndex = headers.indexOf('id');
    
    if (idIndex === -1) {
      return NextResponse.json({ success: false, message: 'Kolom id tidak ditemukan' }, { status: 400 });
    }
    
    // Debug: print all ids
    rows.forEach((row, i) => {
      if (i > 0) console.log(`Row ${i}: id=${row[idIndex]}`);
    });
    
    const rowIndex = rows.findIndex((row, i) => i > 0 && String(row[idIndex]) === String(id));
    console.log('Found rowIndex for delete:', rowIndex);
    
    if (rowIndex === -1) {
      return NextResponse.json({ success: false, message: `Data tidak ditemukan, id: ${id}` }, { status: 404 });
    }
    
    // Delete row - use actual sheetId and correct indices
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex,
              endIndex: rowIndex + 1
            }
          }
        }]
      }
    });
    
    return NextResponse.json({ success: true, message: 'Data berhasil dihapus' });
  } catch (error: any) {
    console.error('DELETE Error:', error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}