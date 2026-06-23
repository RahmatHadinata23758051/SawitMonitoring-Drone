import React, { useState } from 'react';
import { Clock, ListChecks, Search, FileSpreadsheet, CheckCircle2, RefreshCcw, Trash2, Info } from 'lucide-react';

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
  accentGreenMid: '#dcfce7'
};

const fontDisplay = "'Manrope', sans-serif";
const fontMono    = "'JetBrains Mono', monospace";
const fontBody    = "'Inter', sans-serif";

const AppLogAktivitas = ({ logs = [] }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = logs.filter(log => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (
            (log.causer_name || '').toLowerCase().includes(q) ||
            (log.event || '').toLowerCase().includes(q) ||
            (log.description || '').toLowerCase().includes(q)
        );
    });

    const eventStyle = (event) => {
        switch ((event || '').toLowerCase()) {
            case 'created': case 'create': return { cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: <CheckCircle2 size={11} /> };
            case 'updated': case 'update': return { cls: 'bg-amber-50 text-amber-700 border border-amber-200', icon: <RefreshCcw size={11} /> };
            case 'deleted': case 'delete': return { cls: 'bg-rose-50 text-rose-700 border border-rose-200', icon: <Trash2 size={11} /> };
            default: return { cls: 'bg-slate-50 text-slate-600 border border-slate-200', icon: <Info size={11} /> };
        }
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    const formatTime = (d) => new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const getInitial = (name) => (name || 'S').charAt(0).toUpperCase();

    const exportTimestamp = () => {
        const n = new Date();
        return `${n.getFullYear()}${String(n.getMonth()+1).padStart(2,'0')}${String(n.getDate()).padStart(2,'0')}_${String(n.getHours()).padStart(2,'0')}${String(n.getMinutes()).padStart(2,'0')}`;
    };

    const handleExportCsv = () => {
        const rows = [['No', 'Waktu', 'User', 'Aksi', 'Deskripsi'], ...filtered.map((l, i) => [i+1, `${formatDate(l.created_at)} ${formatTime(l.created_at)}`, l.causer_name || 'Sistem', l.event, l.description])];
        const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `log_aktivitas_${exportTimestamp()}.csv`; a.click();
        URL.revokeObjectURL(url);
    };

    return (
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
                            Log Aktivitas
                        </h1>
                        <p className="text-sm mt-0.5" style={{ color: tk.textSecondary }}>
                            Riwayat aktivitas pengguna dan pencatatan audit di dalam sistem.
                        </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
                        {/* Search Input */}
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                            <input 
                                type="text" 
                                placeholder="Cari log aktivitas..." 
                                value={searchTerm} 
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm bg-white"
                                style={{ color: tk.textPrimary }}
                            />
                        </div>
                        
                        {/* Export Button */}
                        <button 
                            onClick={handleExportCsv} 
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-5 text-sm font-bold text-white transition-all hover:opacity-90 shadow-sm"
                            style={{ background: tk.accentGreen }}
                        >
                            <FileSpreadsheet size={15} /> Export CSV
                        </button>
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
                                    <th className="px-5 py-3.5 font-bold text-xs uppercase tracking-wider w-14 text-center" style={{ fontFamily: fontMono, color: tk.textSecondary }}>No</th>
                                    <th className="px-5 py-3.5 font-bold text-xs uppercase tracking-wider" style={{ fontFamily: fontMono, color: tk.textSecondary }}>Waktu</th>
                                    <th className="px-5 py-3.5 font-bold text-xs uppercase tracking-wider" style={{ fontFamily: fontMono, color: tk.textSecondary }}>User</th>
                                    <th className="px-5 py-3.5 font-bold text-xs uppercase tracking-wider text-center" style={{ fontFamily: fontMono, color: tk.textSecondary }}>Aksi</th>
                                    <th className="px-5 py-3.5 font-bold text-xs uppercase tracking-wider" style={{ fontFamily: fontMono, color: tk.textSecondary }}>Deskripsi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: tk.borderLight }}>
                                {filtered.length > 0 ? filtered.map((log, idx) => {
                                    const ev = eventStyle(log.event);
                                    return (
                                        <tr key={log.id || idx} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-5 py-4 text-center font-mono text-xs" style={{ color: tk.textMuted }}>
                                                {idx + 1}
                                            </td>
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <div className="font-semibold text-sm text-slate-800">{formatDate(log.created_at)}</div>
                                                <div className="text-xs mt-0.5" style={{ fontFamily: fontMono, color: tk.textMuted }}>{formatTime(log.created_at)}</div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div 
                                                        className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border"
                                                        style={{ 
                                                            background: tk.accentBlueLight, 
                                                            color: tk.accentBlue, 
                                                            borderColor: tk.accentBlueMid 
                                                        }}
                                                    >
                                                        {getInitial(log.causer_name)}
                                                    </div>
                                                    <span className="font-bold text-sm text-slate-700">{log.causer_name || 'Sistem'}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${ev.cls}`} style={{ fontFamily: fontMono }}>
                                                    {ev.icon} {log.event ? log.event.toUpperCase() : '-'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-slate-600 font-medium text-sm leading-relaxed max-w-md">
                                                {log.description}
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="5" className="px-5 py-12 text-center">
                                            <div className="flex flex-col items-center max-w-md mx-auto">
                                                <div 
                                                    className="w-11 h-11 rounded-full flex items-center justify-center mb-3 border"
                                                    style={{ background: tk.accentBlueLight, borderColor: tk.accentBlueMid, color: tk.accentBlue }}
                                                >
                                                    <Clock size={18} />
                                                </div>
                                                <h3 className="text-sm font-bold" style={{ fontFamily: fontDisplay, color: tk.textPrimary }}>
                                                    {searchTerm ? 'Log Tidak Ditemukan' : 'Belum Ada Log Aktivitas'}
                                                </h3>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {searchTerm 
                                                        ? `Tidak dapat menemukan log dengan kata kunci "${searchTerm}".` 
                                                        : 'Aktivitas sistem akan otomatis tercatat dan muncul di sini.'
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
    );
};

export default AppLogAktivitas;
