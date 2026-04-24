import React, { useState, useEffect } from 'react';
import { 
    Search, 
    Plus, 
    PenLine, 
    Trash2, 
    Database, 
    Plane,
    MapPin,
    Activity,
    Compass
} from 'lucide-react';
import ConfirmModal from '../UI/ConfirmModal';

const AppDroneDataset = ({ dataset = [], routes = {}, csrfToken, flashSuccess }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmState, setConfirmState] = useState({ open: false, item: null, formEl: null });

    useEffect(() => {}, [flashSuccess]);

    // Filter dataset based on search term
    const filteredDataset = dataset.filter(item => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            (item.kode && item.kode.toLowerCase().includes(searchLower)) ||
            (item.label && item.label.toLowerCase().includes(searchLower))
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
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                            <div className="bg-sky-100 text-sky-600 p-2 rounded-xl">
                                <Plane size={24} />
                            </div>
                            Dataset Drone
                        </h1>
                        <p className="text-sm text-slate-500 mt-2 font-medium">Data sensor IMU (Accelerometer & Gyroscope) untuk navigasi autonomus</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                        <div className="relative w-full sm:w-auto">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                                type="text" 
                                placeholder="Cari dataset..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all shadow-sm bg-white"
                            />
                        </div>
                        <a 
                            href={routes.create}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-sky-500 text-white rounded-xl py-2.5 px-5 text-sm font-bold hover:bg-sky-600 transition-colors shadow-sm shadow-sky-500/20"
                        >
                            <Plus size={18} /> Tambah Dataset
                        </a>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50/80">
                                    <th className="text-left px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Kode & Label</th>
                                    <th className="text-left px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                                        <div className="flex items-center gap-2"><MapPin size={14} className="text-emerald-500" /> GPS (LAT, LON, ALT)</div>
                                    </th>
                                    <th className="text-left px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                                        <div className="flex items-center gap-2"><Activity size={14} className="text-rose-500" /> ACCELEROMETER (X, Y, Z)</div>
                                    </th>
                                    <th className="text-left px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                                        <div className="flex items-center gap-2"><Compass size={14} className="text-sky-500" /> GYROSCOPE (X, Y, Z)</div>
                                    </th>
                                    <th className="text-right px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredDataset.length > 0 ? filteredDataset.map((item) => (
                                    <tr key={item.id} className="hover:bg-sky-50/40 transition-colors group">
                                        <td className="px-5 py-4">
                                            <div className="font-mono font-black text-sky-600 text-sm mb-1">{item.kode}</div>
                                            <div className="font-bold text-slate-700 text-xs">{item.label}</div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="font-mono text-xs font-semibold flex flex-col gap-1.5 w-max">
                                                <div className="flex gap-2">
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">LAT</span>
                                                        <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{parseFloat(item.lat).toFixed(7)}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">LON</span>
                                                        <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{parseFloat(item.lon).toFixed(7)}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">ALT</span>
                                                    <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{parseFloat(item.alt).toFixed(1)}m asl</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-4 font-mono text-sm bg-slate-50 border border-slate-100 p-2 rounded-xl inline-flex shadow-inner">
                                                <div className="flex flex-col items-center px-2">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">ax</span>
                                                    <span className={`font-bold ${item.ax < 0 ? 'text-rose-600' : 'text-slate-700'}`}>{parseFloat(item.ax).toFixed(2)}</span>
                                                </div>
                                                <div className="w-px h-6 bg-slate-200"></div>
                                                <div className="flex flex-col items-center px-2">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">ay</span>
                                                    <span className={`font-bold ${item.ay < 0 ? 'text-rose-600' : 'text-slate-700'}`}>{parseFloat(item.ay).toFixed(2)}</span>
                                                </div>
                                                <div className="w-px h-6 bg-slate-200"></div>
                                                <div className="flex flex-col items-center px-2">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">az</span>
                                                    <span className={`font-bold ${item.az < 0 ? 'text-rose-600' : 'text-slate-700'}`}>{parseFloat(item.az).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-4 font-mono text-sm bg-sky-50/50 border border-sky-100 p-2 rounded-xl inline-flex shadow-inner">
                                                <div className="flex flex-col items-center px-2">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">gx</span>
                                                    <span className="font-bold text-sky-700">{parseFloat(item.gx).toFixed(2)}</span>
                                                </div>
                                                <div className="w-px h-6 bg-sky-200"></div>
                                                <div className="flex flex-col items-center px-2">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">gy</span>
                                                    <span className="font-bold text-sky-700">{parseFloat(item.gy).toFixed(2)}</span>
                                                </div>
                                                <div className="w-px h-6 bg-sky-200"></div>
                                                <div className="flex flex-col items-center px-2">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">gz</span>
                                                    <span className="font-bold text-sky-700">{parseFloat(item.gz).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <a 
                                                    href={`${routes.editBase}/${item.id}/edit`} 
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-sky-500 hover:text-white transition-all shadow-sm"
                                                    title="Edit Dataset"
                                                >
                                                    <PenLine size={16} />
                                                </a>
                                                <form 
                                                    action={`${routes.destroyBase}/${item.id}`} 
                                                    method="POST" 
                                                    onSubmit={(e) => handleDelete(e, item)}
                                                >
                                                    <input type="hidden" name="_token" value={csrfToken} />
                                                    <input type="hidden" name="_method" value="DELETE" />
                                                    <button 
                                                        type="submit" 
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                                        title="Hapus Dataset"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="px-5 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center gap-4 text-slate-400">
                                                <div className="w-20 h-20 rounded-full bg-slate-50 border-4 border-white shadow-sm flex items-center justify-center">
                                                    <Database size={32} className="text-slate-300" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-black text-slate-500">Tidak ada data ditemukan</h3>
                                                    <p className="text-sm font-medium text-slate-400 mt-1">
                                                        {searchTerm ? `Pencarian "${searchTerm}" tidak membuahkan hasil.` : "Belum ada dataset drone yang terdaftar."}
                                                    </p>
                                                </div>
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
            title="Hapus Dataset Drone"
            message={confirmState.item ? `Apakah Anda yakin ingin menghapus dataset "${confirmState.item.kode} - ${confirmState.item.label}"?` : ''}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
        />
        </>
    );
};

export default AppDroneDataset;
