import React, { useState, useEffect } from 'react';
import { Search, Plus, PenLine, Trash2, Sprout, Palette, Database } from 'lucide-react';
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
  amber:         '#d97706',  // amber-600
  amberLight:    '#fffbeb',
  amberMid:      '#fef3c7'
};

const fontDisplay = "'Manrope', sans-serif";
const fontMono    = "'JetBrains Mono', monospace";
const fontBody    = "'Inter', sans-serif";

const AppSawitDataset = ({ dataset = [], routes = {}, csrfToken, flashSuccess }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmState, setConfirmState] = useState({ open: false, item: null, formEl: null });

    useEffect(() => {}, [flashSuccess]);

    const filtered = dataset.filter(item => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (item.kode || '').toLowerCase().includes(q) || (item.nama_class || '').toLowerCase().includes(q) || (item.warna_buah || '').toLowerCase().includes(q);
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

    const maturityColor = (kelas) => {
        const lower = (kelas || '').toLowerCase();
        if (lower.includes('matang')) return 'bg-orange-50 text-orange-700 border-orange-200';
        if (lower.includes('mentah') || lower.includes('muda')) return 'bg-green-50 text-green-700 border-green-200';
        if (lower.includes('lewat')) return 'bg-rose-50 text-rose-700 border-rose-200';
        return 'bg-slate-50 text-slate-600 border-slate-200';
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
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 
                            className="text-2xl font-extrabold tracking-tight flex items-center gap-2"
                            style={{ fontFamily: fontDisplay, color: tk.textPrimary, letterSpacing: '-0.02em' }}
                        >
                            Dataset Sawit
                        </h1>
                        <p className="text-sm mt-0.5" style={{ color: tk.textSecondary }}>
                            Kelas klasifikasi kematangan buah sawit untuk model AI.
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
                                        Kode
                                    </th>
                                    <th 
                                        className="px-5 py-3.5 font-bold text-xs uppercase tracking-wider"
                                        style={{ fontFamily: fontMono, color: tk.textSecondary }}
                                    >
                                        Nama Kelas
                                    </th>
                                    <th 
                                        className="px-5 py-3.5 font-bold text-xs uppercase tracking-wider"
                                        style={{ fontFamily: fontMono, color: tk.textSecondary }}
                                    >
                                        Warna Buah
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
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                        
                                        {/* Kode */}
                                        <td className="px-5 py-4 align-middle">
                                            <span 
                                                className="font-mono font-bold px-2.5 py-1 rounded-lg border text-xs"
                                                style={{ 
                                                    background: tk.amberLight, 
                                                    color: tk.amber, 
                                                    borderColor: tk.amberMid 
                                                }}
                                            >
                                                {item.kode}
                                            </span>
                                        </td>

                                        {/* Nama Kelas */}
                                        <td className="px-5 py-4 align-middle">
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${maturityColor(item.nama_class)}`}>
                                                {item.nama_class}
                                            </span>
                                        </td>

                                        {/* Warna Buah */}
                                        <td className="px-5 py-4 align-middle text-sm text-slate-700 font-semibold">
                                            {item.warna_buah}
                                        </td>

                                        {/* Aksi */}
                                        <td className="px-5 py-4 align-middle text-right">
                                            <div className="inline-flex items-center justify-end gap-1.5">
                                                <a 
                                                    href={`${routes.editBase}/${item.id}/edit`} 
                                                    className="inline-flex p-1.5 items-center justify-center rounded-lg transition-all border"
                                                    style={{ background: tk.card, borderColor: tk.border, color: tk.textSecondary }}
                                                    onMouseEnter={e => { e.currentTarget.style.color = tk.accentBlue; e.currentTarget.style.background = tk.accentBlueLight; e.currentTarget.style.borderColor = tk.accentBlueMid; }}
                                                    onMouseLeave={e => { e.currentTarget.style.color = tk.textSecondary; e.currentTarget.style.background = tk.card; e.currentTarget.style.borderColor = tk.border; }}
                                                    title="Edit Dataset"
                                                >
                                                    <PenLine size={14} />
                                                </a>
                                                <form action={`${routes.destroyBase}/${item.id}`} method="POST" onSubmit={e => handleDelete(e, item)} className="inline">
                                                    <input type="hidden" name="_token" value={csrfToken} />
                                                    <input type="hidden" name="_method" value="DELETE" />
                                                    <button 
                                                        type="submit" 
                                                        className="inline-flex p-1.5 items-center justify-center rounded-lg transition-all border"
                                                        style={{ background: tk.card, borderColor: tk.border, color: tk.textSecondary }}
                                                        onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#fca5a5'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.color = tk.textSecondary; e.currentTarget.style.background = tk.card; e.currentTarget.style.borderColor = tk.border; }}
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
                                        <td colSpan="4" className="px-5 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                                                <div 
                                                    className="w-11 h-11 rounded-full flex items-center justify-center border"
                                                    style={{ background: tk.amberLight, borderColor: tk.amberMid, color: tk.amber }}
                                                >
                                                    <Sprout size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold" style={{ color: tk.textPrimary }}>Tidak ada hasil ditemukan</p>
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        {searchTerm ? `Pencarian "${searchTerm}" tidak membuahkan hasil.` : 'Belum ada dataset sawit.'}
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
            title="Hapus Dataset Sawit"
            message={confirmState.item ? `Apakah Anda yakin ingin menghapus dataset "${confirmState.item.kode}"?` : ''}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
        />
        </>
    );
};

export default AppSawitDataset;
