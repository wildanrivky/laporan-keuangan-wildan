'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, ArrowUpRight, ArrowDownRight, X, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

type Kategori = {
  id: string;
  nama: string;
  tipe: 'debit' | 'credit';
};

const mockKategori: Kategori[] = [];

export default function KategoriPage() {
  const [kategori, setKategori] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nama: '',
    tipe: 'debit' as 'debit' | 'credit',
  });

  const resetForm = () => ({
    nama: '',
    tipe: 'debit' as 'debit' | 'credit',
  });

  useEffect(() => {
    const fetchKategori = async () => {
      try {
        setLoading(true);
        const result = await api.getKategori();
        if (result.success && result.data) {
          setKategori(result.data.map((k: any) => ({
            id: k.id,
            nama: k.nama,
            tipe: k.tipe === 'pemasukan' ? 'debit' : 'credit',
          })));
        }
      } catch (err: any) {
        setError(err.message || 'Gagal mengambil data');
      } finally {
        setLoading(false);
      }
    };
    fetchKategori();
  }, []);

  const kategoriDebit = kategori.filter(k => k.tipe === 'debit');
  const kategoriCredit = kategori.filter(k => k.tipe === 'credit');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const apiTipe = formData.tipe === 'debit' ? 'pemasukan' : 'pengeluaran';
    
    try {
      if (editId) {
        await api.updateKategori({ id: editId, nama: formData.nama, tipe: apiTipe });
      } else {
        await api.addKategori({ nama: formData.nama, tipe: apiTipe });
      }
      const result = await api.getKategori();
      if (result.success && result.data) {
        setKategori(result.data.map((k: any) => ({
          id: k.id,
          nama: k.nama,
          tipe: k.tipe === 'pemasukan' ? 'debit' : 'credit',
        })));
      }
      setShowModal(false);
      setEditId(null);
      setFormData(resetForm());
    } catch (err: any) {
      alert('Gagal menyimpan kategori: ' + err.message);
    }
  };

  const handleEdit = (k: Kategori) => {
    setFormData({
      nama: k.nama,
      tipe: k.tipe,
    });
    setEditId(k.id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus kategori ini?')) return;
    try {
      await api.deleteKategori(id);
      const result = await api.getKategori();
      if (result.success && result.data) {
        setKategori(result.data.map((k: any) => ({
          id: k.id,
          nama: k.nama,
          tipe: k.tipe === 'pemasukan' ? 'debit' : 'credit',
        })));
      }
    } catch (err: any) {
      alert('Gagal menghapus kategori: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kategori</h1>
          <p className="text-slate-500 mt-1">Kelola kategori transaksi bisnis Anda</p>
        </div>
        <button onClick={() => { setFormData(resetForm()); setEditId(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Tambah Kategori
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-emerald-600" size={32} />
          </div>
        ) : error ? (
          <div className="col-span-2 text-center py-12 text-red-600">{error}</div>
        ) : (
          <>
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  <ArrowUpRight size={12} />
                </span>
                <h2 className="text-lg font-semibold text-slate-900">Pemasukan</h2>
              </div>
              <div className="space-y-2">
                {kategoriDebit.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">Tidak ada kategori</p>
                ) : (
                  kategoriDebit.map((k) => (
                    <div key={k.id} className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-700">{k.nama}</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleEdit(k)} className="p-1 text-slate-400 hover:text-emerald-600">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(k.id)} className="p-1 text-slate-400 hover:text-red-600">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                  <ArrowDownRight size={12} />
                </span>
                <h2 className="text-lg font-semibold text-slate-900">Pengeluaran</h2>
              </div>
              <div className="space-y-2">
                {kategoriCredit.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">Tidak ada kategori</p>
                ) : (
                  kategoriCredit.map((k) => (
                    <div key={k.id} className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-700">{k.nama}</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleEdit(k)} className="p-1 text-slate-400 hover:text-emerald-600">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(k.id)} className="p-1 text-slate-400 hover:text-red-600">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {editId ? 'Edit Kategori' : 'Tambah Kategori'}
              </h2>
              <button onClick={() => { setShowModal(false); setEditId(null); setFormData(resetForm()); }} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Tipe Kategori</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tipe"
                      value="debit"
                      checked={formData.tipe === 'debit'}
                      onChange={() => setFormData({...formData, tipe: 'debit'})}
                      className="text-emerald-600"
                    />
                    <span className="text-sm text-slate-700">Pemasukan</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tipe"
                      value="credit"
                      checked={formData.tipe === 'credit'}
                      onChange={() => setFormData({...formData, tipe: 'credit'})}
                      className="text-emerald-600"
                    />
                    <span className="text-sm text-slate-700">Pengeluaran</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="label">Nama Kategori</label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({...formData, nama: e.target.value})}
                  className="input"
                  placeholder="Contoh: Pendapatan Jasa"
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditId(null); setFormData(resetForm()); }}
                  className="btn-secondary flex-1"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editId ? 'Simpan' : 'Tambah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}