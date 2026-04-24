import React, { useState, useEffect } from 'react';
import { Search, Plus, PenLine, Trash2, Map, MapPin, TreePine, Hash } from 'lucide-react';

const md5Abbrev = (id) => {
    // Simple deterministic code from ID
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    let n = id * 1234567 + 987654;
    for (let i = 0; i < 6; i++) { result += chars[n % chars.length]; n = Math.floor(n / chars.length) + id * 31; }
    return result;
};

const AppLahan = ({ lahan = [], routes = {}, csrfToken, flashSuccess }) => {
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (flashSuccess && window.Swal) {
            window.Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flashSuccess, showConfirmButton: false, timer: 2500, timerProgressBar: true });
        }
    }, [flashSuccess]);

    const filtered = lahan.filter(item => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (item.nama || '').toLowerCase().includes(q) || String(item.luas || '').includes(q);
    });

    const handleDelete = (e, item) => {
        e.preventDefault();
        const form = e.target;
        if (window.Swal) {
            window.Swal.fire({ title: 'Konfirmasi', text: `Hapus lahan "${item.nama}"?`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Ya, Hapus!', cancelButtonText: 'Batal' })
                .then(r => { if (r.isConfirmed) form.submit(); });
        } else {
            if (window.confirm(`Hapus lahan "${item.nama}"?`)) form.submit();
        }
    };

    return (
        <div className="pt-6 pb-12 w-full">
            <div className="max-w-full mx-auto px-6 lg:px-10 flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                            <div className="bg-teal-100 text-teal-600 p-2 rounded-xl"><Map size={24} /></div>
                            Data Lahan
                        </h1>
                        <p className="text-sm text-slate-500 mt-2 font-medium">Kelola data lahan perkebunan sawit dan batas wilayahnya</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                        <div className="relative w-full sm:w-auto">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input type="text" placeholder="Cari lahan..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all shadow-sm bg-white" />
                        </div>
                        <a href={routes.create} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-teal-500 text-white rounded-xl py-2.5 px-5 text-sm font-bold hover:bg-teal-600 transition shadow-sm shadow-teal-500/20">
                            <Plus size={18} /> Tambah Lahan
                        </a>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50/80">
                                    <th className="text-left px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                        <div className="flex items-center gap-2"><Hash size={13} className="text-slate-400" /> Kode Lahan</div>
                                    </th>
                                    <th className="text-left px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Nama Lahan</th>
                                    <th className="text-left px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Luas (Ha)</th>
                                    <th className="text-left px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                        <div className="flex items-center gap-2"><TreePine size={13} className="text-emerald-500" /> Jumlah Kebun</div>
                                    </th>
                                    <th className="text-left px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                        <div className="flex items-center gap-2"><MapPin size={13} className="text-rose-500" /> Koordinat</div>
                                    </th>
                                    <th className="text-right px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.length > 0 ? filtered.map(item => (
                                    <tr key={item.id} className="hover:bg-teal-50/30 transition-colors">
                                        <td className="px-5 py-4">
                                            <span className="font-mono font-black text-teal-700 bg-teal-50 px-3 py-1 rounded-lg text-xs border border-teal-100">LHN-{md5Abbrev(item.id)}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="font-bold text-slate-800">{item.nama}</div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="font-black text-slate-800">{item.luas}</span>
                                            <span className="text-slate-400 text-xs ml-1">Ha</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="font-black text-slate-800 text-lg">{item.kebun_count ?? 0}</span>
                                            <span className="text-slate-400 text-xs ml-1">kebun</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="font-mono text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                                                {parseFloat(item.latitude).toFixed(6)}, {parseFloat(item.longitude).toFixed(6)}
                                            </span>
                                        </td>
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
                                    <tr><td colSpan="6" className="px-5 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-20 h-20 rounded-full bg-slate-50 border-4 border-white shadow-sm flex items-center justify-center"><Map size={32} className="text-slate-300" /></div>
                                            <div>
                                                <p className="text-lg font-black text-slate-500">{searchTerm ? 'Lahan tidak ditemukan' : 'Belum ada data lahan'}</p>
                                                <p className="text-sm text-slate-400 mt-1">{searchTerm ? `Pencarian "${searchTerm}" tidak cocok.` : 'Tambahkan data lahan perkebunan.'}</p>
                                            </div>
                                            {!searchTerm && (
                                                <a href={routes.create} className="text-sm bg-teal-500 text-white px-5 py-2.5 rounded-xl hover:bg-teal-600 transition font-bold shadow-sm flex items-center gap-2">
                                                    <Plus size={16} /> Tambah Lahan
                                                </a>
                                            )}
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

export default AppLahan;
