import React, { useState, useEffect } from 'react';
import { Search, Plus, PenLine, Trash2, ShoppingBasket as Basket, Sprout, Target, TrendingUp, CalendarDays, Factory } from 'lucide-react';
import ConfirmModal from '../UI/ConfirmModal';

const AppPanen = ({ panen = [], routes = {}, csrfToken, flashSuccess }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmState, setConfirmState] = useState({ open: false, item: null, formEl: null });

    useEffect(() => {}, [flashSuccess]);

    const dataList = Array.isArray(panen) ? panen : (panen?.data || []);
    const filtered = dataList.filter(item => {
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
        if (pct >= 100) return { text: 'text-emerald-600', bg: 'bg-emerald-500', pill: 'border-emerald-200 bg-emerald-50' };
        if (pct >= 70) return { text: 'text-amber-600', bg: 'bg-amber-500', pill: 'border-amber-200 bg-amber-50' };
        return { text: 'text-rose-600', bg: 'bg-rose-500', pill: 'border-rose-200 bg-rose-50' };
    };

    return (
        <>
        <div className="pt-8 pb-16 w-full bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
                
                {/* Header & Actions */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20 mb-4">
                            <Basket size={28} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Manajemen Panen</h1>
                        <p className="text-slate-500 text-sm mt-2 font-medium">Rekapitulasi riwayat, target produksi, dan realisasi hasil panen kebun.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input type="text" placeholder="Cari tanggal atau kebun..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm bg-white" />
                        </div>
                        <a href={routes.create} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl py-3 px-6 text-sm font-bold hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg shadow-amber-500/30 hover:-translate-y-0.5 active:translate-y-0">
                            <Plus size={18} /> Catat Panen Baru
                        </a>
                    </div>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden relative">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 to-orange-600"></div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                    <th className="text-left px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">
                                        <div className="flex items-center gap-2"><CalendarDays size={16} className="text-amber-500" /> Waktu Pelaksanaan</div>
                                    </th>
                                    <th className="text-left px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">
                                        <div className="flex items-center gap-2"><Sprout size={16} className="text-amber-500" /> Area Kebun</div>
                                    </th>
                                    <th className="text-left px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">
                                        <div className="flex items-center gap-2"><TrendingUp size={16} className="text-amber-500" /> Evaluasi Produksi (Kg)</div>
                                    </th>
                                    <th className="text-right px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.length > 0 ? filtered.map(item => {
                                    const pct = item.target_panen > 0 ? Math.round((item.hasil_panen / item.target_panen) * 100) : 0;
                                    const styles = getPencapaianStyle(pct);
                                    return (
                                        <tr key={item.id} className="group hover:bg-slate-50 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="font-bold text-slate-800 text-base">
                                                    {formatDate(item.tanggal_panen)}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 font-black text-lg shrink-0 shadow-sm border border-amber-100 group-hover:bg-amber-100 transition-colors">
                                                        <Sprout size={20} />
                                                    </div>
                                                    <span className="font-bold text-slate-700">{item.kebun?.nama || <span className="italic text-slate-400">Tanpa Area</span>}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col gap-2 w-64">
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-xs font-bold text-slate-500 flex items-center gap-1"><Target size={14} className="text-slate-400"/> Tgt: {Number(item.target_panen).toLocaleString('id-ID')}</div>
                                                        <div className={`text-base font-black font-mono ${styles.text}`}>Act: {Number(item.hasil_panen).toLocaleString('id-ID')}</div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/50 shadow-inner">
                                                            <div className={`h-full rounded-full ${styles.bg}`} style={{ width: `${Math.min(pct, 100)}%` }}></div>
                                                        </div>
                                                        <span className={`text-xs font-black border px-2 py-0.5 rounded-md ${styles.pill} ${styles.text}`}>{pct}%</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                                                    <a href={`${routes.editBase}/${item.id}/edit`} className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-amber-50 hover:text-amber-600 transition-all group-hover:shadow-sm" title="Edit">
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
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-32 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-24 h-24 rounded-3xl bg-slate-50 border border-slate-100 shadow-inner flex items-center justify-center mb-2">
                                                    <Factory size={40} className="text-slate-300" />
                                                </div>
                                                <div>
                                                    <p className="text-xl font-black text-slate-700">{searchTerm ? 'Pencarian Tidak Ditemukan' : 'Belum Ada Laporan Panen'}</p>
                                                    <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                                                        {searchTerm ? `Kami tidak dapat menemukan data panen dengan kata kunci "${searchTerm}".` : 'Saat ini belum ada data hasil panen yang masuk ke dalam sistem. Silakan catat produksi baru.'}
                                                    </p>
                                                </div>
                                                {!searchTerm && (
                                                    <a href={routes.create} className="mt-4 inline-flex items-center justify-center gap-2 bg-amber-50 text-amber-600 rounded-xl py-2.5 px-6 text-sm font-bold hover:bg-amber-100 transition">
                                                        <Plus size={18} /> Catat Hasil Panen
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
            title="Hapus Data Panen"
            message={confirmState.item ? `Apakah Anda yakin ingin menghapus data panen tanggal ${confirmState.item.tanggal_panen}?` : ''}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
        />
        </>
    );
};

export default AppPanen;
