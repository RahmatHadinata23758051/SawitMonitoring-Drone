import React, { useState, useEffect } from 'react';
import { Search, Plus, PenLine, Trash2, ShoppingBasket as Basket, Sprout, Target, TrendingUp, CalendarDays } from 'lucide-react';
import ConfirmModal from '../UI/ConfirmModal';

const AppPanen = ({ panen = [], routes = {}, csrfToken, flashSuccess }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmState, setConfirmState] = useState({ open: false, item: null, formEl: null });

    useEffect(() => {}, [flashSuccess]);

    const filtered = panen.filter(item => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (item.kebun?.nama || '').toLowerCase().includes(q) || 
               (item.tanggal_panen || '').toLowerCase().includes(q);
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

    const getPencapaianStyle = (pct) => {
        if (pct >= 100) return { text: 'text-emerald-600', bg: 'bg-emerald-500' };
        if (pct >= 70) return { text: 'text-amber-600', bg: 'bg-amber-500' };
        return { text: 'text-rose-600', bg: 'bg-rose-500' };
    };

    return (
        <>
        <div className="pt-6 pb-12 w-full">
            <div className="max-w-full mx-auto px-6 lg:px-10 flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                            <div className="bg-amber-100 text-amber-600 p-2 rounded-xl"><Basket size={24} /></div>
                            Manajemen Panen
                        </h1>
                        <p className="text-sm text-slate-500 mt-2 font-medium">Riwayat dan target panen perkebunan sawit</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                        <div className="relative w-full sm:w-auto">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input type="text" placeholder="Cari data panen..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all shadow-sm bg-white" />
                        </div>
                        <a href={routes.create} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-amber-500 text-white rounded-xl py-2.5 px-5 text-sm font-bold hover:bg-amber-600 transition shadow-sm shadow-amber-500/20">
                            <Plus size={18} /> Tambah Panen
                        </a>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50/80">
                                    <th className="text-left px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                        <div className="flex items-center gap-2"><CalendarDays size={14} className="text-indigo-500" /> Tanggal Panen</div>
                                    </th>
                                    <th className="text-left px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                        <div className="flex items-center gap-2"><Sprout size={14} className="text-emerald-500" /> Kebun</div>
                                    </th>
                                    <th className="text-left px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                        <div className="flex items-center gap-2"><Target size={14} className="text-slate-400" /> Target (kg)</div>
                                    </th>
                                    <th className="text-left px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                        <div className="flex items-center gap-2"><TrendingUp size={14} className="text-slate-400" /> Hasil (kg)</div>
                                    </th>
                                    <th className="text-left px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Pencapaian</th>
                                    <th className="text-right px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.length > 0 ? filtered.map(item => {
                                    const pct = item.target_panen > 0 ? Math.round((item.hasil_panen / item.target_panen) * 100) : 0;
                                    const styles = getPencapaianStyle(pct);
                                    return (
                                        <tr key={item.id} className="hover:bg-amber-50/30 transition-colors">
                                            <td className="px-5 py-4 font-bold text-slate-800">
                                                {formatDate(item.tanggal_panen)}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="text-xs font-bold border border-emerald-200 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">{item.kebun?.nama || '-'}</span>
                                            </td>
                                            <td className="px-5 py-4 font-mono font-bold text-slate-500">
                                                {Number(item.target_panen).toLocaleString('id-ID')} <span className="text-[10px] text-slate-400">kg</span>
                                            </td>
                                            <td className={`px-5 py-4 font-mono font-black text-lg ${styles.text}`}>
                                                {Number(item.hasil_panen).toLocaleString('id-ID')} <span className="text-xs">kg</span>
                                            </td>
                                            <td className="px-5 py-4 w-48">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 max-w-[120px] bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/50">
                                                        <div className={`h-full rounded-full ${styles.bg}`} style={{ width: `${Math.min(pct, 100)}%` }}></div>
                                                    </div>
                                                    <span className={`text-xs font-black ${styles.text}`}>{pct}%</span>
                                                </div>
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
                                    );
                                }) : (
                                    <tr><td colSpan="6" className="px-5 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 text-slate-400">
                                            <div className="w-20 h-20 rounded-full bg-slate-50 border-4 border-white shadow-sm flex items-center justify-center"><Basket size={32} className="text-slate-300" /></div>
                                            <div>
                                                <p className="text-lg font-black text-slate-500">{searchTerm ? 'Tidak ada hasil' : 'Belum ada data panen'}</p>
                                                <p className="text-sm text-slate-400 mt-1">{searchTerm ? `Pencarian "${searchTerm}" tidak ditemukan.` : 'Tambahkan data riwayat panen baru.'}</p>
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
        <ConfirmModal
            isOpen={confirmState.open}
            title="Hapus Data Panen"
            message={confirmState.item ? `Apakah Anda yakin ingin menghapus data panen tanggal ${confirmState.item.tanggal_panen}?` : ''}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
        />
        </>
    );
};

export default AppPanen;
