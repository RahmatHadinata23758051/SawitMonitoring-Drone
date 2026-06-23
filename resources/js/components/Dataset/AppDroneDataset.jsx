import React, { useState, useEffect } from 'react';
import { Search, Plus, PenLine, Trash2, MapPin, Activity, Compass, Plane } from 'lucide-react';
import ConfirmModal from '../UI/ConfirmModal';

// ---------------------------------------------------------------------------
// Design tokens — aligned with global theme
// ---------------------------------------------------------------------------
const tk = {
  pageBg:        '#f3f4f6',  // gray-100
  card:          '#ffffff',
  textPrimary:   '#0f172a',  // slate-900
  textSecondary: '#475569',  // slate-600
  textMuted:     '#94a3b8',  // slate-400
  border:        '#e2e8f0',  // slate-200
  borderLight:   '#f1f5f9',  // slate-100
  accentBlue:    '#2563eb',  // blue-600
  accentBlueLight: '#eff6ff', // blue-50
  accentBlueMid:  '#dbeafe',  // blue-100
  accentGreen:   '#15803d',  // green-700
  accentGreenLight: '#f0fdf4',
};

const fontDisplay = "'Manrope', sans-serif";
const fontMono    = "'JetBrains Mono', monospace";
const fontBody    = "'Inter', sans-serif";

const AppDroneDataset = ({ dataset = [], routes = {}, csrfToken, flashSuccess }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmState, setConfirmState] = useState({ open: false, item: null, formEl: null });

    useEffect(() => {}, [flashSuccess]);

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
        <div 
            className="py-6 w-full min-h-screen"
            style={{ background: tk.pageBg, color: tk.textPrimary, fontFamily: fontBody }}
        >
            {/* Fonts Load check */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
            `}</style>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 
                            className="text-2xl font-extrabold tracking-tight flex items-center gap-2"
                            style={{ fontFamily: fontDisplay, color: tk.textPrimary, letterSpacing: '-0.02em' }}
                        >
                            Dataset Drone
                        </h1>
                        <p className="text-sm mt-0.5" style={{ color: tk.textSecondary }}>
                            Data sensor IMU (Accelerometer &amp; Gyroscope) untuk navigasi autonomus.
                        </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
                        {/* Search Input */}
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                            <input 
                                type="text" 
                                placeholder="Cari dataset..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm bg-white"
                                style={{ color: tk.textPrimary }}
                            />
                        </div>
                        
                        {/* Add Button */}
                        <a 
                            href={routes.create}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-5 text-sm font-bold text-white transition-all hover:opacity-90 shadow-sm"
                            style={{ background: tk.accentBlue }}
                        >
                            <Plus size={15} /> Tambah Dataset
                        </a>
                    </div>
                </div>

                {/* Table Section */}
                <div 
                    className="rounded-xl shadow-sm border overflow-hidden bg-white"
                    style={{ borderColor: tk.border }}
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="border-b" style={{ borderColor: tk.border, background: '#f8fafc' }}>
                                    <th 
                                        className="px-5 py-3.5 font-bold text-xs uppercase tracking-wider"
                                        style={{ fontFamily: fontMono, color: tk.textSecondary }}
                                    >
                                        Kode &amp; Label
                                    </th>
                                    <th 
                                        className="px-5 py-3.5 font-bold text-xs uppercase tracking-wider"
                                        style={{ fontFamily: fontMono, color: tk.textSecondary }}
                                    >
                                        GPS Coordinates
                                    </th>
                                    <th 
                                        className="px-5 py-3.5 font-bold text-xs uppercase tracking-wider"
                                        style={{ fontFamily: fontMono, color: tk.textSecondary }}
                                    >
                                        Accelerometer (X, Y, Z)
                                    </th>
                                    <th 
                                        className="px-5 py-3.5 font-bold text-xs uppercase tracking-wider"
                                        style={{ fontFamily: fontMono, color: tk.textSecondary }}
                                    >
                                        Gyroscope (X, Y, Z)
                                    </th>
                                    <th 
                                        className="px-5 py-3.5 font-bold text-xs uppercase tracking-wider text-right"
                                        style={{ fontFamily: fontMono, color: tk.textSecondary }}
                                    >
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: tk.borderLight }}>
                                {filteredDataset.length > 0 ? filteredDataset.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                        
                                        {/* Kode & Label */}
                                        <td className="px-5 py-4 align-middle">
                                            <div className="flex items-center gap-2.5">
                                                <div 
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                                                    style={{ background: tk.accentBlueLight, color: tk.accentBlue, borderColor: tk.accentBlueMid }}
                                                >
                                                    <Plane className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm font-mono" style={{ color: tk.accentBlue }}>
                                                        {item.kode}
                                                    </div>
                                                    <div className="text-xs" style={{ color: tk.textSecondary }}>
                                                        {item.label}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* GPS Coordinates */}
                                        <td className="px-5 py-4 align-middle">
                                            <div className="font-mono text-xs inline-flex flex-col gap-1">
                                                <div className="flex gap-2">
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase">LAT</span>
                                                        <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md font-semibold border border-emerald-100">{parseFloat(item.lat).toFixed(6)}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase">LON</span>
                                                        <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md font-semibold border border-emerald-100">{parseFloat(item.lon).toFixed(6)}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col w-max">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase">ALTITUDE</span>
                                                    <span className="text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded-md font-semibold border border-slate-100">{parseFloat(item.alt).toFixed(1)}m asl</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Accelerometer */}
                                        <td className="px-5 py-4 align-middle">
                                            <div 
                                                className="inline-flex items-center gap-3 font-mono text-xs bg-slate-50 border px-2.5 py-1.5 rounded-lg"
                                                style={{ borderColor: tk.borderLight }}
                                            >
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase">ax</span>
                                                    <span className={`font-bold ${item.ax < 0 ? 'text-rose-600' : 'text-slate-700'}`}>{parseFloat(item.ax).toFixed(2)}</span>
                                                </div>
                                                <div className="w-px h-5 bg-slate-200"></div>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase">ay</span>
                                                    <span className={`font-bold ${item.ay < 0 ? 'text-rose-600' : 'text-slate-700'}`}>{parseFloat(item.ay).toFixed(2)}</span>
                                                </div>
                                                <div className="w-px h-5 bg-slate-200"></div>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase">az</span>
                                                    <span className={`font-bold ${item.az < 0 ? 'text-rose-600' : 'text-slate-700'}`}>{parseFloat(item.az).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Gyroscope */}
                                        <td className="px-5 py-4 align-middle">
                                            <div 
                                                className="inline-flex items-center gap-3 font-mono text-xs bg-sky-50/50 border px-2.5 py-1.5 rounded-lg"
                                                style={{ borderColor: tk.accentBlueMid }}
                                            >
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase">gx</span>
                                                    <span className="font-bold text-sky-700">{parseFloat(item.gx).toFixed(2)}</span>
                                                </div>
                                                <div className="w-px h-5 bg-sky-200"></div>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase">gy</span>
                                                    <span className="font-bold text-sky-700">{parseFloat(item.gy).toFixed(2)}</span>
                                                </div>
                                                <div className="w-px h-5 bg-sky-200"></div>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase">gz</span>
                                                    <span className="font-bold text-sky-700">{parseFloat(item.gz).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Aksi */}
                                        <td className="px-5 py-4 align-middle text-right">
                                            <div className="inline-flex items-center justify-end gap-1.5">
                                                {/* Edit Button */}
                                                <a 
                                                    href={`${routes.editBase}/${item.id}/edit`} 
                                                    className="inline-flex p-1.5 items-center justify-center rounded-lg transition-all border"
                                                    style={{ 
                                                        background: tk.card, 
                                                        borderColor: tk.border,
                                                        color: tk.textSecondary
                                                    }}
                                                    onMouseEnter={e => {
                                                        e.currentTarget.style.color = tk.accentBlue;
                                                        e.currentTarget.style.background = tk.accentBlueLight;
                                                        e.currentTarget.style.borderColor = tk.accentBlueMid;
                                                    }}
                                                    onMouseLeave={e => {
                                                        e.currentTarget.style.color = tk.textSecondary;
                                                        e.currentTarget.style.background = tk.card;
                                                        e.currentTarget.style.borderColor = tk.border;
                                                    }}
                                                    title="Edit Dataset"
                                                >
                                                    <PenLine size={14} />
                                                </a>

                                                {/* Delete Button */}
                                                <form action={`${routes.destroyBase}/${item.id}`} method="POST" onSubmit={(e) => handleDelete(e, item)} className="inline">
                                                    <input type="hidden" name="_token" value={csrfToken} />
                                                    <input type="hidden" name="_method" value="DELETE" />
                                                    <button 
                                                        type="submit" 
                                                        className="inline-flex p-1.5 items-center justify-center rounded-lg transition-all border"
                                                        style={{ 
                                                            background: tk.card, 
                                                            borderColor: tk.border,
                                                            color: tk.textSecondary
                                                        }}
                                                        onMouseEnter={e => {
                                                            e.currentTarget.style.color = '#ef4444';
                                                            e.currentTarget.style.background = '#fef2f2';
                                                            e.currentTarget.style.borderColor = '#fca5a5';
                                                        }}
                                                        onMouseLeave={e => {
                                                            e.currentTarget.style.color = tk.textSecondary;
                                                            e.currentTarget.style.background = tk.card;
                                                            e.currentTarget.style.borderColor = tk.border;
                                                        }}
                                                        title="Hapus Dataset"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="px-5 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                                                <div 
                                                    className="w-11 h-11 rounded-full flex items-center justify-center border"
                                                    style={{ background: tk.accentBlueLight, borderColor: tk.accentBlueMid, color: tk.accentBlue }}
                                                >
                                                    <MapPin size={18} />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold" style={{ color: tk.textPrimary }}>Tidak ada data ditemukan</h3>
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        {searchTerm ? `Pencarian "${searchTerm}" tidak ditemukan.` : "Belum ada dataset drone."}
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
