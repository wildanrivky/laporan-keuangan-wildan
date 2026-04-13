// API Service untuk komunikasi dengan Google Sheets API

const SHEETS_API_URL = '/api/sheets';

export interface Transaksi {
  id: string;
  tanggal: string;
  deskripsi: string;
  kategori: string;
  jumlah: number;
  tipe: 'debit' | 'credit';
}

export type TransaksiInput = Omit<Transaksi, 'id'>;

export interface Kategori {
  id: string;
  nama: string;
  tipe: 'pemasukan' | 'pengeluaran';
}

export interface Rekening {
  id: string;
  nama: string;
  nomor: string;
  saldo: number;
  jenis: 'Bank' | 'Kas';
}

export interface DashboardData {
  totalPemasukan: number;
  totalPengeluaran: number;
  saldoKas: number;
  labaRugi: number;
  totalTransaksi: number;
  rekening: Rekening[];
  recentTransactions: Transaksi[];
}

class ApiService {
  private async fetchSheets<T>(table: string): Promise<T> {
    try {
      const res = await fetch(`${SHEETS_API_URL}?table=${table}`);
      const data = await res.json();
      return data as T;
    } catch (err: any) {
      console.error('Error fetching:', err.message);
      return { success: false, data: [], message: err.message } as T;
    }
  }

  // Transaksi
  async getTransaksi(tanggalAwal?: string, tanggalAkhir?: string) {
    return this.fetchSheets<{ success: boolean; data: Transaksi[] }>('Transaksi');
  }

  async addTransaksi(data: TransaksiInput) {
    const res = await fetch(SHEETS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'Transaksi', data: { ...data, id: Date.now().toString() } })
    });
    return res.json();
  }

  async deleteTransaksi(id: string) {
    const res = await fetch(`${SHEETS_API_URL}?table=Transaksi&id=${id}`, { method: 'DELETE' });
    return res.json();
  }

  async updateTransaksi(id: string, data: Partial<Transaksi>) {
    const res = await fetch(SHEETS_API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'Transaksi', data, id })
    });
    return res.json();
  }

  // Kategori
  async getKategori() {
    return this.fetchSheets<{ success: boolean; data: Kategori[] }>('Kategori');
  }

  // Rekening
  async getRekening() {
    return this.fetchSheets<{ success: boolean; data: Rekening[] }>('Rekening');
  }

  // Dashboard - hitung dari transaksi dan rekening
  async getDashboard() {
    try {
      const [transaksiRes, rekeningRes] = await Promise.all([
        this.getTransaksi(),
        this.getRekening()
      ]);

      const transactions = transaksiRes.data || [];
      const rekening = rekeningRes.data || [];

      let totalPemasukan = 0;
      let totalPengeluaran = 0;

      transactions.forEach((t: Transaksi) => {
        if (t.tipe === 'debit') {
          totalPemasukan += Number(t.jumlah);
        } else {
          totalPengeluaran += Number(t.jumlah);
        }
      });

      const totalSaldoRekening = rekening.reduce((sum: number, r: Rekening) => sum + Number(r.saldo), 0);

      return {
        success: true,
        data: {
          totalPemasukan,
          totalPengeluaran,
          saldoKas: totalSaldoRekening,
          labaRugi: totalPemasukan - totalPengeluaran,
          totalTransaksi: transactions.length,
          rekening,
          recentTransactions: transactions.slice(-10).reverse()
        }
      };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }

  // Import Transaksi from TSV
  async importTransaksi(tsvData: string) {
    const rows = tsvData.split('\n').filter(row => row.trim());
    const headers = rows[0].split('\t');
    
    for (let i = 1; i < rows.length; i++) {
      const cols = rows[i].split('\t');
      const transaksi = {
        id: Date.now().toString() + i,
        tanggal: cols[headers.indexOf('tanggal')] || new Date().toISOString().split('T')[0],
        deskripsi: cols[headers.indexOf('deskripsi')] || '',
        kategori: cols[headers.indexOf('kategori')] || '',
        jumlah: parseInt(cols[headers.indexOf('jumlah')]) || 0,
        tipe: (cols[headers.indexOf('tipe')] || 'debit') as 'debit' | 'credit'
      };
      await this.addTransaksi(transaksi);
    }
    return { success: true, message: 'Import berhasil' };
  }
}

export const api = new ApiService();

// Helper functions
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR',
    maximumFractionDigits: 0 
  }).format(amount).replace(/\u00A0/g, ' ');
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}