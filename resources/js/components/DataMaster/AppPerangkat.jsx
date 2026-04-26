import React, { useState, useEffect } from 'react';
import { Search, Plus, PenLine, Trash2, Cpu, Activity, Clock, Plane } from 'lucide-react';
import ConfirmModal from '../UI/ConfirmModal';

const AppPerangkat = ({ perangkat = [], routes = {}, csrfToken, flashSuccess }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmState, setConfirmState] = useState({ open: false, item: null, formEl: null });

    useEffect(() => {}, [flashSuccess]);

    const dataList = Array.isArray(perangkat) ? perangkat : (perangkat?.data || []);
    const filtered = dataList.filter(item => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (item.id_drone || '').toLowerCase().includes(q) || (item.ip_drone || '').toLowerCase().includes(q);
    });

    const handleDelete = (e, item) => {
        e.preventDefault();
        setConfirmState({ open: true, item, formEl: e.target });
    };

    const handleConfirm = () => {
        confirmState.formEl?.submit();
        setConfirmState({ open: false, item: null, formEl: null });
    };

    const handleCancel = () => setConfirmState({ open: false, item: null, formEl: null });

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
        <>
        <div className="pt-8 pb-16 w-full bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
                
                {/* Header & Actions */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="w-14 h-14 bg-gradient-to-br from-sky-400 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-sky-500/20 mb-4">
                            <Cpu size={28} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Data Perangkat</h1>
                        <p className="text-slate-500 text-sm mt-2 font-medium">Manajemen armada drone yang terhubung untuk pemantauan udara.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input type="text" placeholder="Cari ID atau IP Drone..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-sm bg-white" />
                        </div>
                        <a href={routes.create} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-2xl py-3 px-6 text-sm font-bold hover:from-sky-600 hover:to-blue-700 transition-all shadow-lg shadow-sky-500/30 hover:-translate-y-0.5 active:translate-y-0">
                            <Plus size={18} /> Tambah Perangkat
                        </a>
                    </div>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden relative">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 to-blue-600"></div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                    <th className="text-left px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">
                                        <div className="flex items-center gap-2"><Plane size={16} className="text-sky-500" /> Identitas Drone</div>
                                    </th>
                                    <th className="text-left px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">
                                        <div className="flex items-center gap-2"><Activity size={16} className="text-sky-500" /> Status Koneksi</div>
                                    </th>
                                    <th className="text-left px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">
                                        <div className="flex items-center gap-2"><Clock size={16} className="text-sky-500" /> Registrasi</div>
                                    </th>
                                    <th className="text-right px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.length > 0 ? filtered.map(item => (
                                    <tr key={item.id} className="group hover:bg-slate-50 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600 font-black text-lg shrink-0 shadow-sm border border-sky-100 group-hover:bg-sky-100 transition-colors">
                                                    <Plane size={24} />
                                                </div>
                                                <div>
                                                    <div className="font-mono font-black text-slate-800 text-base">{item.id_drone}</div>
                                                    <div className="font-mono text-xs text-slate-400 font-bold mt-1 bg-slate-100 px-2 py-0.5 rounded-md inline-block">{item.ip_drone}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            {item.status ? (
                                                <div className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-200 text-emerald-700 bg-emerald-50">
                                                    <span className="relative flex h-2.5 w-2.5">
                                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                                    </span>
                                                    Standby & Aktif
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 text-slate-500 bg-slate-50">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Offline
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="font-bold text-slate-700 text-sm">{formatDate(item.created_at)}</div>
                                            <div className="text-slate-400 text-xs mt-1 font-semibold">{formatTime(item.created_at)} WIB</div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                                                <a href={`${routes.editBase}/${item.id}/edit`} className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-sky-50 hover:text-sky-600 transition-all group-hover:shadow-sm" title="Edit">
                                                    <PenLine size={18} />
                                                </a>
                                                <form action={`${routes.destroyBase}/${item.id}`} method="POST" onSubmit={e => handleDelete(e, item)}>
                                                    <input type="hidden" name="_token" value={csrfToken} />
                                                    <input type="hidden" name="_method" value="DELETE" />
                                                    <button type="submit" className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all group-hover:shadow-sm" title="Hapus">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-32 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-24 h-24 rounded-3xl bg-slate-50 border border-slate-100 shadow-inner flex items-center justify-center mb-2">
                                                    <Cpu size={40} className="text-slate-300" />
                                                </div>
                                                <div>
                                                    <p className="text-xl font-black text-slate-700">{searchTerm ? 'Pencarian Tidak Ditemukan' : 'Belum Ada Perangkat Drone'}</p>
                                                    <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                                                        {searchTerm ? `Kami tidak dapat menemukan drone dengan kata kunci "${searchTerm}". Silakan periksa kembali pencarian Anda.` : 'Anda belum mendaftarkan armada drone apapun ke dalam sistem GCS. Tambahkan perangkat sekarang.'}
                                                    </p>
                                                </div>
                                                {!searchTerm && (
                                                    <a href={routes.create} className="mt-4 inline-flex items-center justify-center gap-2 bg-sky-50 text-sky-600 rounded-xl py-2.5 px-6 text-sm font-bold hover:bg-sky-100 transition">
                                                        <Plus size={18} /> Tambah Drone Pertama
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        <ConfirmModal
            isOpen={confirmState.open}
            title="Hapus Perangkat"
            message={confirmState.item ? `Apakah Anda yakin ingin menghapus drone ID "${confirmState.item.id_drone}"?` : ''}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
        />
        </>
    );
};

export default AppPerangkat;
