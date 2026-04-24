import React, { useState } from 'react';
import { Clock, ListChecks, Search, FileSpreadsheet, CheckCircle2, RefreshCcw, Trash2, Info } from 'lucide-react';

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
            case 'created': case 'create': return { cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: <CheckCircle2 size={12} /> };
            case 'updated': case 'update': return { cls: 'bg-amber-50 text-amber-700 border border-amber-200', icon: <RefreshCcw size={12} /> };
            case 'deleted': case 'delete': return { cls: 'bg-rose-50 text-rose-700 border border-rose-200', icon: <Trash2 size={12} /> };
            default: return { cls: 'bg-slate-50 text-slate-600 border border-slate-200', icon: <Info size={12} /> };
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
        <div className="pt-4 pb-12 w-full">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-10 flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                            <div className="bg-blue-100 text-blue-600 p-2 rounded-xl"><Clock size={24} /></div>
                            Log Aktivitas
                        </h1>
                        <p className="text-sm text-slate-500 mt-2 font-medium">Riwayat aktivitas pengguna di dalam sistem</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="relative w-full sm:w-auto">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input type="text" placeholder="Cari log aktivitas..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-sm bg-white" />
                        </div>
                        <button onClick={handleExportCsv} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-500 text-white rounded-xl py-2.5 px-5 text-sm font-bold hover:bg-emerald-600 transition shadow-sm shadow-emerald-500/20">
                            <FileSpreadsheet size={18} /> Export CSV
                        </button>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-slate-100">
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                                <ListChecks size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">Riwayat Aktivitas</h3>
                                <p className="text-xs text-slate-400 mt-0.5 font-medium">Tercatat otomatis oleh sistem</p>
                            </div>
                        </div>
                        <span className="text-xs font-black bg-blue-50 text-blue-700 border border-blue-100 px-4 py-2 rounded-xl">{filtered.length} Record</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-[11px] uppercase tracking-widest text-slate-500 bg-slate-50 border-b border-slate-200">
                                    <th className="text-center px-5 py-4 font-bold w-14">No</th>
                                    <th className="text-center px-5 py-4 font-bold whitespace-nowrap">Waktu</th>
                                    <th className="text-center px-5 py-4 font-bold">User</th>
                                    <th className="text-center px-5 py-4 font-bold">Aksi</th>
                                    <th className="text-left px-5 py-4 font-bold">Deskripsi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.length > 0 ? filtered.map((log, idx) => {
                                    const ev = eventStyle(log.event);
                                    return (
                                        <tr key={log.id || idx} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-5 py-4 text-center text-slate-400 font-mono text-xs">{idx + 1}</td>
                                            <td className="px-5 py-4 text-center whitespace-nowrap">
                                                <div className="font-bold text-slate-700 text-xs">{formatDate(log.created_at)}</div>
                                                <div className="text-slate-400 text-xs font-medium mt-0.5">{formatTime(log.created_at)}</div>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm">
                                                        {getInitial(log.causer_name)}
                                                    </div>
                                                    <span className="font-bold text-slate-700 text-xs">{log.causer_name || 'Sistem'}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-xl ${ev.cls}`}>
                                                    {ev.icon} {log.event ? log.event.charAt(0).toUpperCase() + log.event.slice(1) : '-'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-slate-600 font-medium text-sm leading-relaxed">{log.description}</td>
                                        </tr>
                                    );
                                }) : (
                                    <tr><td colSpan="5" className="px-5 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 text-slate-400">
                                            <div className="w-20 h-20 rounded-full bg-slate-50 border-4 border-white shadow-sm flex items-center justify-center"><Clock size={32} className="text-slate-300" /></div>
                                            <div>
                                                <p className="text-lg font-black text-slate-500">{searchTerm ? 'Log tidak ditemukan' : 'Belum ada log aktivitas'}</p>
                                                <p className="text-sm text-slate-400 mt-1">{searchTerm ? `Pencarian "${searchTerm}" tidak ditemukan.` : 'Aktivitas pengguna akan dicatat di sini.'}</p>
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
    );
};

export default AppLogAktivitas;
