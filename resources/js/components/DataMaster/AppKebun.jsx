import React, { useState, useEffect } from 'react';
import { Search, Plus, PenLine, Trash2, Leaf, MapPin, TreePine, LayoutGrid, Trees } from 'lucide-react';
import ConfirmModal from '../UI/ConfirmModal';
import { generateIdAbbrev } from '../../utils/helpers';

const AppKebun = ({ kebun = [], routes = {}, csrfToken, flashSuccess }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmState, setConfirmState] = useState({ open: false, item: null, formEl: null });

    useEffect(() => {}, [flashSuccess]);

    const dataList = Array.isArray(kebun) ? kebun : (kebun?.data || []);
    const filtered = dataList.filter(item => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (
            (item.nama || '').toLowerCase().includes(q) ||
            (item.lahan?.nama || '').toLowerCase().includes(q)
        );
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

    return (
        <>
        <div className="pt-8 pb-16 w-full bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
                
                {/* Header & Actions */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 mb-4">
                            <Leaf size={28} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Data Kebun</h1>
                        <p className="text-slate-500 text-sm mt-2 font-medium">Pemetaan topologi, populasi pohon, dan area blok sawit.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input type="text" placeholder="Cari nama kebun atau lahan..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm bg-white" />
                        </div>
                        <a href={routes.create} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl py-3 px-6 text-sm font-bold hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/30 hover:-translate-y-0.5 active:translate-y-0">
                            <Plus size={18} /> Pemetaan Baru
                        </a>
                    </div>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden relative">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 to-teal-600"></div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                    <th className="text-left px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">
                                        <div className="flex items-center gap-2"><LayoutGrid size={16} className="text-emerald-500" /> Identitas Kebun</div>
                                    </th>
                                    <th className="text-left px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">
                                        <div className="flex items-center gap-2"><TreePine size={16} className="text-emerald-500" /> Spesifikasi Area</div>
                                    </th>
                                    <th className="text-left px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">
                                        <div className="flex items-center gap-2"><MapPin size={16} className="text-emerald-500" /> Koordinat Geografis</div>
                                    </th>
                                    <th className="text-right px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.length > 0 ? filtered.map(item => (
                                    <tr key={item.id} className="group hover:bg-slate-50 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-lg shrink-0 shadow-sm border border-emerald-100 group-hover:bg-emerald-100 transition-colors">
                                                    <Leaf size={24} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800 text-base">{item.nama}</div>
                                                    <div className="font-mono text-xs text-emerald-600 font-bold mt-1 bg-emerald-50 px-2 py-0.5 rounded-md inline-block border border-emerald-100">KBN-{generateIdAbbrev(item.id)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2 text-sm text-slate-700">
                                                    <span className="font-bold">{item.luas}</span> Ha 
                                                    <span className="text-slate-300">|</span> 
                                                    <span className="font-bold">{item.jumlah_pohon ?? 0}</span> Pohon
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                    <LayoutGrid size={12} /> Induk: <span className="font-bold">{item.lahan?.nama || '-'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="font-mono text-xs text-slate-600 bg-slate-100/50 px-3 py-1.5 rounded-lg inline-block border border-slate-200/50">
                                                <div className="font-semibold">{parseFloat(item.latitude).toFixed(6)}</div>
                                                <div className="font-semibold">{parseFloat(item.longitude).toFixed(6)}</div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                                                <a href={`${routes.editBase}/${item.id}/edit`} className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-all group-hover:shadow-sm" title="Edit">
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
                                                    <Trees size={40} className="text-slate-300" />
                                                </div>
                                                <div>
                                                    <p className="text-xl font-black text-slate-700">{searchTerm ? 'Pencarian Tidak Ditemukan' : 'Belum Ada Pemetaan Kebun'}</p>
                                                    <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                                                        {searchTerm ? `Kami tidak dapat menemukan kebun dengan kata kunci "${searchTerm}". Silakan periksa kembali pencarian Anda.` : 'Anda belum menambahkan data topologi kebun. Lakukan pemetaan area kebun sekarang.'}
                                                    </p>
                                                </div>
                                                {!searchTerm && (
                                                    <a href={routes.create} className="mt-4 inline-flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 rounded-xl py-2.5 px-6 text-sm font-bold hover:bg-emerald-100 transition">
                                                        <Plus size={18} /> Buat Pemetaan Pertama
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
            title="Hapus Kebun"
            message={confirmState.item ? `Apakah Anda yakin ingin menghapus kebun "${confirmState.item.nama}"?` : ''}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
        />
        </>
    );
};

export default AppKebun;
