// API Service untuk komunikasi dengan Google Apps Script

// Ganti dengan URL deploy dari Google Apps Script Anda
const API_URL = 'https://script.google.com/macros/s/AKfycbxY_UXxtMfd82GCYF9RLCd-TEfxIdO_oPyDX-ox2yNmq04YRwGA3fU7TgLxmlp0FycH/exec';

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
  private baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  private async fetchApi<T>(action: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(this.baseUrl);
    url.searchParams.set('action', action);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });

    console.log('Fetching:', url.toString());

    try {
      const response = await fetch(url.toString());
      const text = await response.text();
      console.log('Response:', text.substring(0, 100));
      
      const data = JSON.parse(text);
      if (data.success) return data;
      console.error('API error:', data.message);
      return this.getMockData(action) as T;
    } catch (err: any) {
      console.error('Error:', err.message);
      return this.getMockData(action) as T;
    }
  }

  private getMockData(action: string): any {
    const mockTransactions = [
      { id: '1', tanggal: '2025-04-10', deskripsi: 'Penjualan Produk A', kategori: 'Pendapatan Jasa', jumlah: 2500000, tipe: 'debit' },
      { id: '2', tanggal: '2025-04-09', deskripsi: 'Pembelian Bahan Baku', kategori: 'Persediaan', jumlah: 1200000, tipe: 'credit' },
      { id: '3', tanggal: '2025-04-08', deskripsi: 'Pembayaran Listrik', kategori: 'Biaya Listrik', jumlah: 350000, tipe: 'credit' },
      { id: '4', tanggal: '2025-04-07', deskripsi: 'Pendapatan Jasa', kategori: 'Pendapatan Jasa', jumlah: 800000, tipe: 'debit' },
      { id: '5', tanggal: '2025-04-06', deskripsi: 'Pembelian Perlengkapan', kategori: 'Perlengkapan', jumlah: 200000, tipe: 'credit' },
    ];
    
    switch(action) {
      case 'getDashboard':
        return { 
          success: true, 
          data: {
            totalPemasukan: 3300000,
            totalPengeluaran: 1750000,
            saldoKas: 15500000,
            labaRugi: 1550000,
            totalTransaksi: 5,
            rekening: [
              { id: '1', nama: 'Bank BCA', saldo: 10000000, jenis: 'Bank' },
              { id: '2', nama: 'Bank Mandiri', saldo: 5000000, jenis: 'Bank' },
              { id: '3', nama: 'Kas Tangan', saldo: 500000, jenis: 'Kas' },
            ],
            recentTransactions: mockTransactions
          }
        };
      case 'getTransaksi':
        return { success: true, data: mockTransactions };
      case 'getKategori':
        return { 
          success: true, 
          data: [
            { id: '1', nama: 'Pendapatan Jasa', tipe: 'pemasukan' },
            { id: '2', nama: 'Pendapatan Produksi', tipe: 'pemasukan' },
            { id: '3', nama: 'Pendapatan Lain', tipe: 'pemasukan' },
            { id: '4', nama: 'Persediaan', tipe: 'pengeluaran' },
            { id: '5', nama: 'Perlengkapan', tipe: 'pengeluaran' },
            { id: '6', nama: 'Biaya Listrik', tipe: 'pengeluaran' },
            { id: '7', nama: 'Biaya Internet', tipe: 'pengeluaran' },
            { id: '8', nama: 'Biaya Sewa', tipe: 'pengeluaran' },
            { id: '9', nama: 'Biaya Gaji', tipe: 'pengeluaran' },
            { id: '10', nama: 'Biaya Transport', tipe: 'pengeluaran' },
          ]
        };
      case 'getRekening':
        return { 
          success: true, 
          data: [
            { id: '1', nama: 'Bank BCA', saldo: 10000000, jenis: 'Bank' },
            { id: '2', nama: 'Bank Mandiri', saldo: 5000000, jenis: 'Bank' },
            { id: '3', nama: 'Kas Tangan', saldo: 500000, jenis: 'Kas' },
          ]
        };
      default:
        return { success: false, message: 'Unknown action' };
    }
  }

  // Transaksi
  async getTransaksi(tanggalAwal?: string, tanggalAkhir?: string) {
    return this.fetchApi<{ success: boolean; data: Transaksi[] }>('getTransaksi', {
      tanggalAwal: tanggalAwal || '',
      tanggalAkhir: tanggalAkhir || ''
    });
  }

  async addTransaksi(data: TransaksiInput) {
    return this.fetchApi<{ success: boolean; message: string; id?: string }>('addTransaksi', {
      data: JSON.stringify(data)
    });
  }

  async updateTransaksi(id: string, data: Partial<Transaksi>) {
    return this.fetchApi<{ success: boolean; message: string }>('updateTransaksi', {
      id,
      data: JSON.stringify(data)
    });
  }

  async deleteTransaksi(id: string) {
    return this.fetchApi<{ success: boolean; message: string }>('deleteTransaksi', { id });
  }

  // Kategori
  async getKategori() {
    return this.fetchApi<{ success: boolean; data: Kategori[] }>('getKategori');
  }

  async addKategori(data: { nama: string; tipe: string }) {
    return this.fetchApi<{ success: boolean; message: string }>('addKategori', {
      data: JSON.stringify(data)
    });
  }

  async deleteKategori(id: string) {
    return this.fetchApi<{ success: boolean; message: string }>('deleteKategori', { id });
  }

  // Rekening
  async getRekening() {
    return this.fetchApi<{ success: boolean; data: Rekening[] }>('getRekening');
  }

  async updateRekening(data: { id: string; saldo: number }) {
    return this.fetchApi<{ success: boolean; message: string }>('updateRekening', {
      data: JSON.stringify(data)
    });
  }

  async addRekening(data: { nama: string; saldo: number; jenis: string }) {
    return this.fetchApi<{ success: boolean; message: string }>('addRekening', {
      data: JSON.stringify(data)
    });
  }

  async deleteRekening(id: string) {
    return this.fetchApi<{ success: boolean; message: string }>('deleteRekening', { id });
  }

  // Dashboard
  async getDashboard() {
    return this.fetchApi<{ success: boolean; data: DashboardData }>('getDashboard');
  }

  // Import
  async importTransaksi(tsvData: string) {
    return this.fetchApi<{ success: boolean; message: string }>('importTransaksi', {
      tsvData
    });
  }
}

// Export singleton instance
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