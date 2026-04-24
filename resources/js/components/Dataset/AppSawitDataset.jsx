import React, { useState, useEffect } from 'react';
import { Search, Plus, PenLine, Trash2, Sprout, Palette, Database } from 'lucide-react';

const AppSawitDataset = ({ dataset = [], routes = {}, csrfToken, flashSuccess }) => {
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (flashSuccess && window.Swal) {
            window.Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flashSuccess, showConfirmButton: false, timer: 2500, timerProgressBar: true });
        }
    }, [flashSuccess]);

    const filtered = dataset.filter(item => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (item.kode || '').toLowerCase().includes(q) || (item.nama_class || '').toLowerCase().includes(q) || (item.warna_buah || '').toLowerCase().includes(q);
    });

    const handleDelete = (e, item) => {
        e.preventDefault();
        const form = e.target;
        if (window.Swal) {
            window.Swal.fire({ title: 'Konfirmasi', text: `Hapus dataset "${item.kode}"?`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Ya, Hapus!', cancelButtonText: 'Batal' })
                .then(r => { if (r.isConfirmed) form.submit(); });
        } else {
            if (window.confirm(`Hapus dataset "${item.kode}"?`)) form.submit();
        }
    };

    const maturityColor = (kelas) => {
        const lower = (kelas || '').toLowerCase();
        if (lower.includes('matang')) return 'bg-orange-100 text-orange-700 border-orange-200';
        if (lower.includes('mentah') || lower.includes('muda')) return 'bg-green-100 text-green-700 border-green-200';
        if (lower.includes('lewat')) return 'bg-rose-100 text-rose-700 border-rose-200';
        return 'bg-slate-100 text-slate-600 border-slate-200';
    };

    return (
        <div className="pt-6 pb-12 w-full">
            <div className="max-w-full mx-auto px-6 lg:px-10 flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                            <div className="bg-amber-100 text-amber-600 p-2 rounded-xl"><Sprout size={24} /></div>
                            Dataset Sawit
                        </h1>
                        <p className="text-sm text-slate-500 mt-2 font-medium">Kelas klasifikasi kematangan buah sawit untuk model AI</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                        <div className="relative w-full sm:w-auto">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input type="text" placeholder="Cari dataset..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all shadow-sm bg-white" />
                        </div>
                        <a href={routes.create} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-amber-500 text-white rounded-xl py-2.5 px-5 text-sm font-bold hover:bg-amber-600 transition shadow-sm shadow-amber-500/20">
                            <Plus size={18} /> Tambah Dataset
                        </a>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50/80">
                                    <th className="text-left px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Kode</th>
                                    <th className="text-left px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Nama Kelas</th>
                                    <th className="text-left px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                        <div className="flex items-center gap-2"><Palette size={14} className="text-amber-500" /> Warna Buah</div>
                                    </th>
                                    <th className="text-right px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.length > 0 ? filtered.map(item => (
                                    <tr key={item.id} className="hover:bg-amber-50/30 transition-colors">
                                        <td className="px-5 py-4">
                                            <span className="font-mono font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-lg text-sm border border-amber-100">{item.kode}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`text-xs font-bold px-3 py-1 rounded-xl border ${maturityColor(item.nama_class)}`}>{item.nama_class}</span>
                                        </td>
                                        <td className="px-5 py-4 text-slate-600 font-medium">{item.warna_buah}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <a href={`${routes.editBase}/${item.id}/edit`} className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-sky-500 hover:text-white transition-all shadow-sm" title="Edit">
                                                    <PenLine size={16} />
                                                </a>
                                                <form action={`${routes.destroyBase}/${item.id}`} method="POST" onSubmit={e => handleDelete(e, item)}>
                                                    <input type="hidden" name="_token" value={csrfToken} />
                                                    <input type="hidden" name="_method" value="DELETE" />
                                                    <button type="submit" className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm" title="Hapus">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="4" className="px-5 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 text-slate-400">
                                            <div className="w-20 h-20 rounded-full bg-slate-50 border-4 border-white shadow-sm flex items-center justify-center"><Database size={32} className="text-slate-300" /></div>
                                            <div>
                                                <p className="text-lg font-black text-slate-500">{searchTerm ? 'Tidak ada hasil' : 'Belum ada dataset sawit'}</p>
                                                <p className="text-sm text-slate-400 mt-1">{searchTerm ? `Pencarian "${searchTerm}" tidak ditemukan.` : 'Tambahkan kelas kematangan buah sawit.'}</p>
                                            </div>
                                        </div>
                                    </td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppSawitDataset;
