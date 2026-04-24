import React, { useState, useEffect } from 'react';
import { Search, Plus, PenLine, Trash2, Leaf, MapPin, TreePine, LayoutGrid } from 'lucide-react';
import ConfirmModal from '../UI/ConfirmModal';

const md5Abbrev = (id) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    let n = id * 7654321 + 123456;
    for (let i = 0; i < 6; i++) { result += chars[n % chars.length]; n = Math.floor(n / chars.length) + id * 17; }
    return result;
};

const AppKebun = ({ kebun = [], routes = {}, csrfToken, flashSuccess }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmState, setConfirmState] = useState({ open: false, item: null, formEl: null });

    useEffect(() => {}, [flashSuccess]);

    const filtered = kebun.filter(item => {
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
        <div className="pt-6 pb-12 w-full">
            <div className="max-w-full mx-auto px-6 lg:px-10 flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                            <div className="bg-emerald-100 text-emerald-600 p-2 rounded-xl"><Leaf size={24} /></div>
                            Data Kebun
                        </h1>
                        <p className="text-sm text-slate-500 mt-2 font-medium">Kelola data kebun dan blok sawit</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                        <div className="relative w-full sm:w-auto">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input type="text" placeholder="Cari kebun..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-sm bg-white" />
                        </div>
                        <a href={routes.create} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-500 text-white rounded-xl py-2.5 px-5 text-sm font-bold hover:bg-emerald-600 transition shadow-sm shadow-emerald-500/20">
                            <Plus size={18} /> Tambah Kebun
                        </a>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50/80">
                                    <th className="text-left px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Kode Kebun</th>
                                    <th className="text-left px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Nama Kebun</th>
                                    <th className="text-left px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                        <div className="flex items-center gap-2"><LayoutGrid size={13} className="text-teal-500" /> Lahan Induk</div>
                                    </th>
                                    <th className="text-left px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Luas</th>
                                    <th className="text-left px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                        <div className="flex items-center gap-2"><TreePine size={13} className="text-emerald-500" /> Jumlah Pohon</div>
                                    </th>
                                    <th className="text-left px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                        <div className="flex items-center gap-2"><MapPin size={13} className="text-rose-400" /> Koordinat</div>
                                    </th>
                                    <th className="text-right px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.length > 0 ? filtered.map(item => (
                                    <tr key={item.id} className="hover:bg-emerald-50/30 transition-colors">
                                        <td className="px-5 py-4">
                                            <span className="font-mono font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg text-xs border border-emerald-100">KBN-{md5Abbrev(item.id)}</span>
                                        </td>
                                        <td className="px-5 py-4 font-bold text-slate-800">{item.nama}</td>
                                        <td className="px-5 py-4">
                                            <span className="text-xs bg-teal-50 text-teal-700 px-2.5 py-1 rounded-xl font-bold border border-teal-100">{item.lahan?.nama || '-'}</span>
                                        </td>
                                        <td className="px-5 py-4 font-bold text-slate-700">{item.luas} Ha</td>
                                        <td className="px-5 py-4">
                                            <span className="font-black text-slate-800 text-lg">{item.jumlah_pohon ?? 0}</span>
                                            <span className="text-slate-400 text-xs ml-1">pohon</span>
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
                                    <tr><td colSpan="7" className="px-5 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-20 h-20 rounded-full bg-slate-50 border-4 border-white shadow-sm flex items-center justify-center"><Leaf size={32} className="text-slate-300" /></div>
                                            <div>
                                                <p className="text-lg font-black text-slate-500">{searchTerm ? 'Kebun tidak ditemukan' : 'Belum ada data kebun'}</p>
                                                <p className="text-sm text-slate-400 mt-1">{searchTerm ? `Pencarian "${searchTerm}" tidak cocok.` : 'Tambahkan data kebun sawit.'}</p>
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
            title="Hapus Kebun"
            message={confirmState.item ? `Apakah Anda yakin ingin menghapus kebun "${confirmState.item.nama}"?` : ''}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
        />
        </>
    );
};

export default AppKebun;
