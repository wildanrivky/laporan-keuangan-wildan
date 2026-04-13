'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, Wallet, Building, PiggyBank, Plus, Edit2, Trash2, X } from 'lucide-react';
import { formatRupiah } from '@/lib/api';

type Rekening = {
  id: string;
  nama: string;
  nomor: string;
  saldo: number;
  jenis: string;
};

const STORAGE_KEY = 'rekening_data';

export default function CekRekeningPage() {
  const [rekening, setRekening] = useState<Rekening[]>([]);
  const [saldoKas, setSaldoKas] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nama: '',
    nomor: '',
    saldo: '',
    jenis: 'Bank',
  });

  const resetForm = () => ({
    nama: '',
    nomor: '',
    saldo: '',
    jenis: 'Bank',
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setRekening(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rekening));
  }, [rekening]);

  const totalSaldoRekening = rekening.reduce((acc, r) => acc + r.saldo, 0);
  const selisih = saldoKas - totalSaldoRekening;
  const isMatch = selisih === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newRekening: Rekening = {
        id: editId || Date.now().toString(),
        nama: formData.nama,
        nomor: formData.nomor,
        saldo: parseInt(formData.saldo),
        jenis: formData.jenis,
      };
      
      if (editId) {
        setRekening(rekening.map(r => r.id === editId ? newRekening : r));
      } else {
        setRekening([...rekening, newRekening]);
      }
      setShowModal(false);
      setEditId(null);
      setFormData(resetForm());
    } catch (err: any) {
      alert('Gagal menyimpan: ' + err.message);
    }
  };

  const handleEdit = (r: Rekening) => {
    setFormData({
      nama: r.nama,
      nomor: r.nomor || '',
      saldo: r.saldo.toString(),
      jenis: r.jenis,
    });
    setEditId(r.id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus rekening ini?')) return;
    try {
      setRekening(rekening.filter(r => r.id !== id));
    } catch (err: any) {
      alert('Gagal menghapus: ' + err.message);
    }
  };

  const getIcon = (jenis: string) => {
    if (jenis === 'Bank') return <Building size={20} />;
    if (jenis === 'Kas') return <Wallet size={20} />;
    return <PiggyBank size={20} />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cek Rekening</h1>
          <p className="text-slate-500 mt-1">Cek kesesuaian saldo aktual dengan laporan</p>
        </div>
        <button onClick={() => { setFormData(resetForm()); setEditId(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Tambah Rekening
        </button>
      </div>

      <div className={`card ${isMatch ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">Saldo di Laporan Keuangan</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{formatRupiah(saldoKas)}</p>
          </div>
          <div className="text-center">
            {isMatch ? (
              <CheckCircle className="text-emerald-600 mx-auto" size={48} />
            ) : (
              <AlertTriangle className="text-red-600 mx-auto" size={48} />
            )}
            <p className={`text-lg font-semibold mt-2 ${isMatch ? 'text-emerald-700' : 'text-red-700'}`}>
              {isMatch ? 'SESUAI' : 'TIDAK SESUAI'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-600">Total Saldo Rekening</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{formatRupiah(totalSaldoRekening)}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">Selisih</p>
            <p className={`text-xl font-bold ${selisih === 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {selisih === 0 ? 'Rp 0' : formatRupiah(selisih)}
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">Daftar Rekening</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                  <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left text-sm font-medium text-slate-500 py-3">Tipe</th>
                    <th className="text-left text-sm font-medium text-slate-500 py-3">Nama Rekening</th>
                    <th className="text-left text-sm font-medium text-slate-500 py-3">Nomor Rekening</th>
                    <th className="text-right text-sm font-medium text-slate-500 py-3">Saldo</th>
                    <th className="text-right text-sm font-medium text-slate-500 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {rekening.map((r) => (
                    <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                            {getIcon(r.jenis)}
                          </div>
                          <span className="text-sm text-slate-600 capitalize">{r.jenis}</span>
                        </div>
                      </td>
                      <td className="py-4 text-sm text-slate-900 font-medium">{r.nama}</td>
                      <td className="py-4 text-sm text-slate-600 font-mono">{r.nomor || '-'}</td>
                      <td className="py-4 text-sm text-slate-900 text-right font-medium">
                        {formatRupiah(r.saldo)}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEdit(r)} className="p-2 text-slate-400 hover:text-emerald-600">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(r.id)} className="p-2 text-slate-400 hover:text-red-600">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {editId ? 'Edit Rekening' : 'Tambah Rekening'}
              </h2>
              <button onClick={() => { setShowModal(false); setEditId(null); setFormData(resetForm()); }} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Tipe Rekening</label>
                <select
                  value={formData.jenis}
                  onChange={(e) => setFormData({...formData, jenis: e.target.value})}
                  className="input"
                  required
                >
                  <option value="Bank">Bank</option>
                  <option value="Kas">Kas</option>
                </select>
              </div>
              <div>
                <label className="label">Nama Rekening</label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({...formData, nama: e.target.value})}
                  className="input"
                  placeholder="Contoh: Bank BCA"
                  required
                />
              </div>
              <div>
                <label className="label">Nomor Rekening</label>
                <input
                  type="text"
                  value={formData.nomor}
                  onChange={(e) => setFormData({...formData, nomor: e.target.value})}
                  className="input"
                  placeholder="Contoh: 1234567890"
                />
              </div>
              <div>
                <label className="label">Saldo (IDR)</label>
                <input
                  type="number"
                  value={formData.saldo}
                  onChange={(e) => setFormData({...formData, saldo: e.target.value})}
                  className="input"
                  placeholder="Masukkan nominal saldo"
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