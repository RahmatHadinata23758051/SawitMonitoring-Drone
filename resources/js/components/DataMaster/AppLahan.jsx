import React, { useState, useEffect } from 'react';
import { Search, Plus, PenLine, Trash2, Map, MapPin, TreePine, Hash, Map as MapIcon, Layers } from 'lucide-react';
import ConfirmModal from '../UI/ConfirmModal';
import { generateIdAbbrev } from '../../utils/helpers';

const AppLahan = ({ lahan = [], routes = {}, csrfToken, flashSuccess }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmState, setConfirmState] = useState({ open: false, item: null, formEl: null });

    useEffect(() => {}, [flashSuccess]);

    const dataList = Array.isArray(lahan) ? lahan : (lahan?.data || []);
    const filtered = dataList.filter(item => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (item.nama || '').toLowerCase().includes(q) || String(item.luas || '').includes(q);
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
        <div className="pt-8 pb-16 w-full bg-slate-50 min-h-screen font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
                
                {/* Header & Actions */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Data Lahan</h1>
                        <p className="text-slate-500 text-sm mt-1">Pengelolaan poligon, luas, dan batas koordinat area perkebunan induk.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input type="text" placeholder="Cari nama atau luas lahan..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm bg-white" />
                        </div>
                        <a href={routes.create} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg py-2.5 px-5 text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
                            <Plus size={16} /> Tambah Lahan
                        </a>
                    </div>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Profil Lahan
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Penggunaan
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Geospasial
                                    </th>
                                    <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.length > 0 ? filtered.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 border border-slate-200">
                                                    <Map className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900">{item.nama}</div>
                                                    <div className="font-mono text-xs text-slate-500 mt-0.5">LHN-{generateIdAbbrev(item.id)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="text-sm text-slate-900 font-medium">
                                                    {item.luas} <span className="text-slate-500 font-normal">Ha</span>
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {item.kebun_count ?? 0} Sub-Kebun
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-mono text-xs text-slate-600 bg-slate-50 px-2 py-1.5 rounded border border-slate-100 inline-block">
                                                <div>{parseFloat(item.latitude).toFixed(6)}</div>
                                                <div>{parseFloat(item.longitude).toFixed(6)}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <a href={`${routes.editBase}/${item.id}/edit`} className="inline-flex p-2 items-center justify-center rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit">
                                                    <PenLine size={16} />
                                                </a>
                                                <form action={`${routes.destroyBase}/${item.id}`} method="POST" onSubmit={e => handleDelete(e, item)}>
                                                    <input type="hidden" name="_token" value={csrfToken} />
                                                    <input type="hidden" name="_method" value="DELETE" />
                                                    <button type="submit" className="inline-flex p-2 items-center justify-center rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Hapus">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                                    <MapIcon size={24} className="text-slate-300" />
                                                </div>
                                                <p className="text-base font-semibold text-slate-900">{searchTerm ? 'Pencarian Tidak Ditemukan' : 'Belum Ada Lahan Induk'}</p>
                                                <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                                                    {searchTerm ? `Kami tidak menemukan lahan dengan kata kunci "${searchTerm}". Silakan periksa kembali.` : 'Anda belum memetakan lahan induk (Estate). Lahan induk diperlukan sebelum Anda memetakan blok kebun.'}
                                                </p>
                                                {!searchTerm && (
                                                    <a href={routes.create} className="mt-6 inline-flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 rounded-lg py-2 px-4 text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
                                                        <Plus size={16} className="text-slate-400" /> Buat Lahan
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
            title="Hapus Lahan"
            message={confirmState.item ? `Apakah Anda yakin ingin menghapus lahan "${confirmState.item.nama}"? Semua kebun di dalamnya juga akan terpengaruh.` : ''}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
        />
        </>
    );
};

export default AppLahan;
