import React, { useState, useEffect } from 'react';
import { Search, Plus, PenLine, Trash2, Cpu, Activity, Clock } from 'lucide-react';

const AppPerangkat = ({ perangkat = [], routes = {}, csrfToken, flashSuccess }) => {
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (flashSuccess && window.Swal) {
            window.Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flashSuccess, showConfirmButton: false, timer: 2500, timerProgressBar: true });
        }
    }, [flashSuccess]);

    const filtered = perangkat.filter(item => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (item.id_drone || '').toLowerCase().includes(q) || (item.ip_drone || '').toLowerCase().includes(q);
    });

    const handleDelete = (e, item) => {
        e.preventDefault();
        const form = e.target;
        if (window.Swal) {
            window.Swal.fire({ title: 'Konfirmasi', text: `Hapus perangkat ID "${item.id_drone}"?`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Ya, Hapus!', cancelButtonText: 'Batal' })
                .then(r => { if (r.isConfirmed) form.submit(); });
        } else {
            if (window.confirm(`Hapus perangkat ID "${item.id_drone}"?`)) form.submit();
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return (
        <div className="pt-6 pb-12 w-full">
            <div className="max-w-full mx-auto px-6 lg:px-10 flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                            <div className="bg-sky-100 text-sky-600 p-2 rounded-xl"><Cpu size={24} /></div>
                            Data Perangkat (Drone)
                        </h1>
                        <p className="text-sm text-slate-500 mt-2 font-medium">Manajemen perangkat drone yang terdaftar di sistem</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                        <div className="relative w-full sm:w-auto">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input type="text" placeholder="Cari perangkat..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all shadow-sm bg-white" />
                        </div>
                        <a href={routes.create} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-sky-500 text-white rounded-xl py-2.5 px-5 text-sm font-bold hover:bg-sky-600 transition shadow-sm shadow-sky-500/20">
                            <Plus size={18} /> Tambah Perangkat
                        </a>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50/80">
                                    <th className="text-left px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                        <div className="flex items-center gap-2"><Cpu size={14} className="text-sky-500" /> ID Drone</div>
                                    </th>
                                    <th className="text-left px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">IP Address</th>
                                    <th className="text-left px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                        <div className="flex items-center gap-2"><Activity size={14} className="text-emerald-500" /> Status</div>
                                    </th>
                                    <th className="text-left px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                        <div className="flex items-center gap-2"><Clock size={14} className="text-amber-500" /> Terdaftar</div>
                                    </th>
                                    <th className="text-right px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.length > 0 ? filtered.map(item => (
                                    <tr key={item.id} className="hover:bg-sky-50/30 transition-colors">
                                        <td className="px-5 py-4">
                                            <span className="font-mono font-black text-sky-700 bg-sky-50 px-3 py-1 rounded-lg text-sm border border-sky-100">{item.id_drone}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="font-mono text-sm text-slate-600 font-bold">{item.ip_drone}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            {item.status ? (
                                                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 text-emerald-700 bg-emerald-50">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.8)]"></span> Aktif
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border border-slate-200 text-slate-500 bg-slate-50">
                                                    <span className="w-2 h-2 rounded-full bg-slate-400"></span> Tidak Aktif
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-slate-600">
                                            <div className="font-bold text-slate-700 text-xs">{formatDate(item.created_at)}</div>
                                            <div className="text-slate-400 text-xs mt-0.5 font-medium">{formatTime(item.created_at)}</div>
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
                                    <tr><td colSpan="5" className="px-5 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 text-slate-400">
                                            <div className="w-20 h-20 rounded-full bg-slate-50 border-4 border-white shadow-sm flex items-center justify-center"><Cpu size={32} className="text-slate-300" /></div>
                                            <div>
                                                <p className="text-lg font-black text-slate-500">{searchTerm ? 'Tidak ada hasil' : 'Belum ada perangkat terdaftar'}</p>
                                                <p className="text-sm text-slate-400 mt-1">{searchTerm ? `Pencarian "${searchTerm}" tidak ditemukan.` : 'Tambahkan drone baru untuk mulai monitoring.'}</p>
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

export default AppPerangkat;
