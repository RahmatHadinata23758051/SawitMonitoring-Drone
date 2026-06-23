import React, { useState, useEffect } from 'react';
import { Search, Plus, PenLine, Trash2, Cpu, Activity, Clock, Plane } from 'lucide-react';
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
  accentGreenLight: '#f0fdf4', // green-50
  accentGreenMid: '#dcfce7'
};

const fontDisplay = "'Manrope', sans-serif";
const fontMono    = "'JetBrains Mono', monospace";
const fontBody    = "'Inter', sans-serif";

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
        <div 
            className="py-6 w-full min-h-screen"
            style={{ background: tk.pageBg, color: tk.textPrimary, fontFamily: fontBody }}
        >
            {/* Fonts Load check */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
            `}</style>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
                
                {/* Header & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 
                            className="text-2xl font-extrabold tracking-tight"
                            style={{ fontFamily: fontDisplay, color: tk.textPrimary, letterSpacing: '-0.02em' }}
                        >
                            Data Perangkat
                        </h1>
                        <p className="text-sm mt-0.5" style={{ color: tk.textSecondary }}>
                            Manajemen armada drone yang terhubung untuk pemantauan udara.
                        </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
                        {/* Search Input */}
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                            <input 
                                type="text" 
                                placeholder="Cari ID atau IP Drone..." 
                                value={searchTerm} 
                                onChange={e => setSearchTerm(e.target.value)}
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
                            <Plus size={15} /> Tambah Perangkat
                        </a>
                    </div>
                </div>

                {/* Table Card */}
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
                                        Identitas Drone
                                    </th>
                                    <th 
                                        className="px-5 py-3.5 font-bold text-xs uppercase tracking-wider"
                                        style={{ fontFamily: fontMono, color: tk.textSecondary }}
                                    >
                                        Status Koneksi
                                    </th>
                                    <th 
                                        className="px-5 py-3.5 font-bold text-xs uppercase tracking-wider"
                                        style={{ fontFamily: fontMono, color: tk.textSecondary }}
                                    >
                                        Registrasi
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
                                {filtered.length > 0 ? filtered.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                        
                                        {/* Identitas Drone */}
                                        <td className="px-5 py-4 align-middle">
                                            <div className="flex items-center gap-3">
                                                <div 
                                                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border"
                                                    style={{ background: tk.accentBlueLight, color: tk.accentBlue, borderColor: tk.accentBlueMid }}
                                                >
                                                    <Plane className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm" style={{ color: tk.textPrimary, fontFamily: fontMono }}>
                                                        {item.id_drone}
                                                    </div>
                                                    <div className="text-xs mt-0.5" style={{ fontFamily: fontMono, color: tk.textMuted }}>
                                                        IP: {item.ip_drone}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Status Koneksi */}
                                        <td className="px-5 py-4 align-middle">
                                            {item.status ? (
                                                <div 
                                                    className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border"
                                                    style={{ 
                                                        borderColor: tk.accentGreenMid, 
                                                        color: tk.accentGreen, 
                                                        background: tk.accentGreenLight 
                                                    }}
                                                >
                                                    <span className="relative flex h-1.5 w-1.5">
                                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#22c55e' }}></span>
                                                      <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: '#22c55e' }}></span>
                                                    </span>
                                                    Standby & Aktif
                                                </div>
                                            ) : (
                                                <div 
                                                    className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border text-slate-500 bg-slate-50"
                                                    style={{ borderColor: tk.border }}
                                                >
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Offline
                                                </div>
                                            )}
                                        </td>

                                        {/* Registrasi */}
                                        <td className="px-5 py-4 align-middle">
                                            <div className="text-sm font-bold" style={{ color: tk.textPrimary }}>
                                                {formatDate(item.created_at)}
                                            </div>
                                            <div className="text-xs mt-0.5" style={{ fontFamily: fontMono, color: tk.textMuted }}>
                                                {formatTime(item.created_at)} WIB
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
                                                    title="Edit Perangkat"
                                                >
                                                    <PenLine size={14} />
                                                </a>

                                                {/* Delete Button */}
                                                <form action={`${routes.destroyBase}/${item.id}`} method="POST" onSubmit={e => handleDelete(e, item)} className="inline">
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
                                                        title="Hapus Perangkat"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="px-5 py-12 text-center">
                                            <div className="flex flex-col items-center max-w-md mx-auto">
                                                <div 
                                                    className="w-11 h-11 rounded-full flex items-center justify-center mb-3 border"
                                                    style={{ background: tk.accentBlueLight, borderColor: tk.accentBlueMid, color: tk.accentBlue }}
                                                >
                                                    <Cpu size={18} />
                                                </div>
                                                <h3 className="text-sm font-bold" style={{ fontFamily: fontDisplay, color: tk.textPrimary }}>
                                                    {searchTerm ? 'Pencarian Tidak Ditemukan' : 'Belum Ada Perangkat Drone'}
                                                </h3>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {searchTerm 
                                                        ? `Tidak dapat menemukan drone dengan kata kunci "${searchTerm}".` 
                                                        : 'Anda belum mendaftarkan armada drone ke dalam sistem.'
                                                    }
                                                </p>
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
