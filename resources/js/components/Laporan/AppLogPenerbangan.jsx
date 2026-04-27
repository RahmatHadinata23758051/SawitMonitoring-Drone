import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
    Paperclip, 
    Trees, 
    Target, 
    Activity, 
    Route, 
    Shuffle, 
    Filter, 
    RotateCcw,
    FileText,
    FileSpreadsheet,
    Eye,
    Plane,
    X,
    Inbox,
    Gamepad2,
    Info,
    AlertTriangle,
    PackageOpen,
    Loader2
} from 'lucide-react';

const ModalDetail = ({ isOpen, onClose, log, telemetry, loading, error }) => {
    if (!isOpen || !log) return null;

    const fmtTime = (s) => Math.floor(s / 60) + 'm ' + (s % 60) + 's';
    
    const algoLabel = {
        dead_reckoning: 'Dead Reckoning',
        live_reckoning: 'Live Reckoning',
        hybrid: 'Hybrid'
    }[log.nav_algorithm] || log.nav_algorithm;

    const scanLabel = log.scan_mode === 'qlv' ? 'QLV (Quick Look Vision)' : 'Traditional Scan';
    const accColor = parseFloat(log.accuracy) >= 95 ? 'text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200' : 'text-amber-700 bg-amber-50 ring-1 ring-amber-200';

    return createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <Plane size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">Detail Log Penerbangan</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Ringkasan misi & raw telemetry sensor IMU + GPS</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition flex items-center justify-center">
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 overflow-y-auto flex-1">
                    {/* Ringkasan 4 kolom */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <div className="col-span-4 bg-slate-50 rounded-xl px-5 py-4 flex items-center justify-between border border-slate-100">
                            <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Kode Log</div>
                                <div className="font-mono font-black text-slate-800 text-base">{log.log_code}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tanggal Dicatat</div>
                                <div className="text-slate-700 font-bold">{log.date_formatted}</div>
                            </div>
                        </div>
                        <div className="col-span-2">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nama Misi</div>
                            <div className="font-bold text-slate-800 text-base">{log.mission_name || 'Tanpa Nama'}</div>
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Algoritma</div>
                            <div className="font-bold text-slate-700">{algoLabel}</div>
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Mode Scan</div>
                            <div className="font-bold text-slate-700">{scanLabel}</div>
                        </div>
                    </div>

                    {/* Stats bar */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <div className="bg-sky-50/50 rounded-xl p-4 text-center border border-sky-100">
                            <div className="text-[10px] font-bold text-sky-500 uppercase tracking-wider mb-1.5">Waktu Terbang</div>
                            <div className="font-black text-sky-700 text-2xl">{fmtTime(log.flight_time_seconds)}</div>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Total Sampel</div>
                            <div className="font-black text-slate-800 text-2xl">{log.samples_count} <span className="text-xs font-bold text-slate-400">pohon</span></div>
                        </div>
                        <div className="bg-orange-50/50 rounded-xl p-4 text-center border border-orange-100">
                            <div className="text-[10px] font-bold text-orange-500 uppercase tracking-wider mb-1.5">🟠 Matang</div>
                            <div className="font-black text-orange-600 text-2xl">{log.matang} <span className="text-xs font-bold text-orange-400">pohon</span></div>
                        </div>
                        <div className={`rounded-xl p-4 text-center border ${accColor}`}>
                            <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5">Akurasi AI</div>
                            <div className="font-black text-2xl">{parseFloat(log.accuracy).toFixed(1)}%</div>
                        </div>
                    </div>

                    {/* Telemetry table */}
                    <div className="border-t border-slate-100 pt-5">
                        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Activity size={16} className="text-emerald-500" />
                            Raw Telemetry — IMU &amp; GPS
                            <span className="ml-auto text-[10px] font-normal text-slate-400 normal-case tracking-normal">ax/ay/az = Accelerometer (m/s²) &nbsp;|&nbsp; gx/gy/gz = Gyroscope (deg/s)</span>
                        </div>
                        
                        {loading ? (
                            <div className="bg-slate-50 rounded-xl p-8 text-center flex flex-col items-center justify-center">
                                <Loader2 className="animate-spin text-emerald-500 mb-3" size={32} />
                                <p className="text-sm text-slate-500 font-medium">Memuat data sensor penerbangan...</p>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center gap-2 py-8 bg-red-50 rounded-xl border border-red-100 text-red-500">
                                <AlertTriangle size={32} />
                                <p className="text-sm font-bold mt-2">Gagal memuat data telemetri</p>
                                <p className="text-xs text-red-400">Silakan coba tutup dan buka kembali modal ini.</p>
                            </div>
                        ) : telemetry && telemetry.length > 0 ? (
                            <div className="border border-slate-200 rounded-xl overflow-hidden">
                                <div className="overflow-x-auto overflow-y-auto max-h-60 custom-scrollbar">
                                    <table className="w-full text-left min-w-[900px]">
                                        <thead className="bg-slate-800 text-white text-[10px] uppercase font-bold sticky top-0 z-10 shadow-sm">
                                            <tr>
                                                <th className="px-4 py-3 whitespace-nowrap">Waktu</th>
                                                <th className="px-4 py-3 text-center">State / Mode</th>
                                                <th className="px-4 py-3 text-right text-blue-300">Lat</th>
                                                <th className="px-4 py-3 text-right text-blue-300">Lon</th>
                                                <th className="px-4 py-3 text-right text-sky-300">Alt</th>
                                                <th className="px-4 py-3 text-right text-indigo-300">ax</th>
                                                <th className="px-4 py-3 text-right text-indigo-300">ay</th>
                                                <th className="px-4 py-3 text-right text-indigo-300">az</th>
                                                <th className="px-4 py-3 text-right text-violet-300">gx</th>
                                                <th className="px-4 py-3 text-right text-violet-300">gy</th>
                                                <th className="px-4 py-3 text-right text-violet-300">gz</th>
                                            </tr>
                                            <tr className="bg-slate-700/90 text-[9px] text-slate-300 font-normal">
                                                <td colSpan="2"></td>
                                                <td className="px-4 py-1.5 text-right text-blue-400 bg-slate-700" colSpan="3">GPS Position</td>
                                                <td className="px-4 py-1.5 text-right text-indigo-400" colSpan="3">Accelerometer (m/s²)</td>
                                                <td className="px-4 py-1.5 text-right text-violet-400 bg-slate-700" colSpan="3">Gyroscope (°/s)</td>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-[11px] font-mono">
                                            {telemetry.map((d, i) => (
                                                <tr key={i} className={`hover:bg-emerald-50/50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                                    <td className="px-4 py-2.5 text-slate-400 whitespace-nowrap">{d.timestamp || '-'}</td>
                                                    <td className="px-4 py-2.5 text-center">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${d.mode === 'AUTO' ? 'bg-emerald-100 text-emerald-700' : d.mode === 'RTL' ? 'bg-amber-100 text-amber-700' : d.mode === 'LANDING' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                                                            {d.mode || '-'}
                                                        </span>
                                                        <div className="text-[9px] text-slate-400 mt-1 font-sans">{d.sub_state || '-'}</div>
                                                    </td>
                                                    <td className="px-4 py-2.5 text-blue-700 text-right whitespace-nowrap bg-blue-50/30">{d.lat ? parseFloat(d.lat).toFixed(6) : '-'}</td>
                                                    <td className="px-4 py-2.5 text-blue-700 text-right whitespace-nowrap bg-blue-50/30">{d.lon ? parseFloat(d.lon).toFixed(6) : '-'}</td>
                                                    <td className="px-4 py-2.5 text-sky-700 font-bold text-right bg-blue-50/30">{d.alt ? parseFloat(d.alt).toFixed(1) + 'm' : '-'}</td>
                                                    <td className="px-4 py-2.5 text-indigo-600 text-right">{d.ax ? parseFloat(d.ax).toFixed(3) : '-'}</td>
                                                    <td className="px-4 py-2.5 text-indigo-600 text-right">{d.ay ? parseFloat(d.ay).toFixed(3) : '-'}</td>
                                                    <td className="px-4 py-2.5 text-indigo-600 text-right">{d.az ? parseFloat(d.az).toFixed(3) : '-'}</td>
                                                    <td className="px-4 py-2.5 text-violet-600 text-right bg-violet-50/30">{d.gx ? parseFloat(d.gx).toFixed(3) : '-'}</td>
                                                    <td className="px-4 py-2.5 text-violet-600 text-right bg-violet-50/30">{d.gy ? parseFloat(d.gy).toFixed(3) : '-'}</td>
                                                    <td className="px-4 py-2.5 text-violet-600 text-right bg-violet-50/30">{d.gz ? parseFloat(d.gz).toFixed(3) : '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between font-sans">
                                    <span className="flex items-center gap-2"><Info size={14} className="text-slate-400"/> {telemetry.length} data point tercatat selama penerbangan ini</span>
                                    <span className="text-slate-400">Scroll horizontal untuk lihat semua kolom &rarr;</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3 py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <PackageOpen size={40} className="text-slate-300" />
                                <div className="text-center">
                                    <p className="text-sm font-bold text-slate-600">Tidak ada data raw telemetri</p>
                                    <p className="text-xs text-slate-400 mt-1">Log penerbangan ini dibuat sebelum fitur perekaman telemetri diaktifkan.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 flex justify-end shrink-0 bg-slate-50/50 rounded-b-2xl">
                    <button onClick={onClose} className="text-sm bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-6 py-2.5 rounded-xl transition-all font-bold shadow-sm">
                        Tutup
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

const AppLogPenerbangan = ({ flightLogs, totalSamples, totalMatang, totalBelum, avgAccuracy, countQlv, countTrad, filterLabel }) => {
    
    const [selectedLog, setSelectedLog] = useState(null);
    const [telemetryData, setTelemetryData] = useState([]);
    const [isTelemetryLoading, setIsTelemetryLoading] = useState(false);
    const [telemetryError, setTelemetryError] = useState(false);

    // Filter Form Data (We use regular form submission to rely on Laravel's controller logic)
    // URLSearchParams to prefill the inputs
    const params = new URLSearchParams(window.location.search);
    const [dateFrom, setDateFrom] = useState(params.get('tanggal_dari') || '');
    const [dateTo, setDateTo] = useState(params.get('tanggal_sampai') || '');

    const handleViewDetail = async (log) => {
        // Format dates correctly for the modal
        const d = new Date(log.created_at);
        const logData = {
            ...log,
            date_formatted: `${d.toLocaleDateString('id-ID', {day: '2-digit', month:'short', year:'numeric'})} ${d.toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit', second:'2-digit'})}`
        };
        setSelectedLog(logData);
        setIsTelemetryLoading(true);
        setTelemetryError(false);
        setTelemetryData([]);

        try {
            const response = await fetch('/api/flight-logs/' + log.log_code + '/details');
            const result = await response.json();
            if (result.status) {
                setTelemetryData(result.data);
            } else {
                setTelemetryError(true);
            }
        } catch (error) {
            console.error(error);
            setTelemetryError(true);
        } finally {
            setIsTelemetryLoading(false);
        }
    };

    return (
        <div className="pt-4 pb-12 w-full">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-10 flex flex-col gap-6">
                
                {/* PAGE HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                            <div className="bg-emerald-100 text-emerald-600 p-2 rounded-xl">
                                <Plane size={24} />
                            </div>
                            Log Penerbangan
                        </h1>
                        <p className="text-sm text-slate-500 mt-2 font-medium">Riwayat misi dan hasil inspeksi drone yang tersimpan otomatis</p>
                    </div>
                    <div className="md:text-right bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Rentang Aktif</div>
                        <div className="text-sm font-black text-emerald-700">{filterLabel}</div>
                    </div>
                </div>

                {/* STATS CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-5 border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0 text-emerald-600">
                            <Paperclip size={24} />
                        </div>
                        <div>
                            <div className="text-4xl font-black text-slate-800 tracking-tight">{flightLogs.total}</div>
                            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1.5">Total Penerbangan</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-5 border-l-4 border-l-sky-500 hover:shadow-md transition-shadow">
                        <div className="w-14 h-14 rounded-2xl bg-sky-50 flex items-center justify-center shrink-0 text-sky-600">
                            <Trees size={24} />
                        </div>
                        <div>
                            <div className="text-4xl font-black text-slate-800 tracking-tight">{Number(totalSamples).toLocaleString('id-ID')}</div>
                            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1.5">Total Pohon Discan</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-5 border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
                        <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0 text-orange-600">
                            <Target size={24} />
                        </div>
                        <div>
                            <div className="text-4xl font-black text-slate-800 tracking-tight">{Number(totalMatang).toLocaleString('id-ID')}</div>
                            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1.5">Total Pohon Matang</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-5 border-l-4 border-l-amber-500 hover:shadow-md transition-shadow">
                        <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0 text-amber-600">
                            <Activity size={24} />
                        </div>
                        <div>
                            <div className="text-4xl font-black text-slate-800 tracking-tight">{parseFloat(avgAccuracy).toFixed(1)}%</div>
                            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1.5">Rata-rata Akurasi AI</div>
                        </div>
                    </div>
                </div>

                {/* SCAN MODE BREAKDOWN */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="bg-gradient-to-r from-sky-50 to-white rounded-2xl shadow-sm border border-sky-100 p-5 flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center shrink-0 text-sky-600">
                            <Route size={20} />
                        </div>
                        <div>
                            <div className="font-black text-slate-800 text-lg">{countQlv} Penerbangan QLV</div>
                            <div className="text-xs font-semibold text-slate-500 mt-1">Quick Look Vision — pemindaian cepat otomatis per koridor blok.</div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-violet-50 to-white rounded-2xl shadow-sm border border-violet-100 p-5 flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center shrink-0 text-violet-600">
                            <Shuffle size={20} />
                        </div>
                        <div>
                            <div className="font-black text-slate-800 text-lg">{countTrad} Penerbangan Tradisional</div>
                            <div className="text-xs font-semibold text-slate-500 mt-1">Inspeksi manual waypoint zig-zag pohon per pohon.</div>
                        </div>
                    </div>
                </div>

                {/* FILTER & EXPORT */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
                        <form action="/laporan/log-penerbangan" method="GET" className="flex flex-wrap items-end gap-4">
                            <div>
                                <label htmlFor="tanggal_dari" className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Dari Tanggal</label>
                                <input 
                                    type="date" 
                                    id="tanggal_dari" 
                                    name="tanggal_dari" 
                                    value={dateFrom}
                                    onChange={e => setDateFrom(e.target.value)}
                                    className="rounded-xl border-slate-200 text-sm focus:border-emerald-500 focus:ring-emerald-500 h-11 px-4 font-semibold text-slate-700 shadow-sm" 
                                />
                            </div>
                            <div>
                                <label htmlFor="tanggal_sampai" className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Sampai Tanggal</label>
                                <input 
                                    type="date" 
                                    id="tanggal_sampai" 
                                    name="tanggal_sampai" 
                                    value={dateTo}
                                    onChange={e => setDateTo(e.target.value)}
                                    className="rounded-xl border-slate-200 text-sm focus:border-emerald-500 focus:ring-emerald-500 h-11 px-4 font-semibold text-slate-700 shadow-sm" 
                                />
                            </div>
                            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-6 h-11 text-sm font-bold text-white hover:bg-slate-700 transition shadow-md hover:shadow-lg">
                                <Filter size={16} /> Filter Data
                            </button>
                            {(dateFrom || dateTo) && (
                                <a href="/laporan/log-penerbangan" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-5 h-11 text-sm font-bold text-slate-600 hover:bg-slate-200 transition">
                                    <RotateCcw size={16} /> Reset
                                </a>
                            )}
                        </form>

                        <div className="flex flex-wrap gap-3">
                            <a href={`/laporan/log-penerbangan/export/pdf?tanggal_dari=${dateFrom}&tanggal_sampai=${dateTo}`} className="inline-flex items-center gap-2 rounded-xl bg-rose-50 px-4 h-11 text-sm font-bold text-rose-600 hover:bg-rose-100 border border-rose-200 transition shadow-sm">
                                <FileText size={18} /> PDF
                            </a>
                            <a href={`/laporan/log-penerbangan/export/csv?tanggal_dari=${dateFrom}&tanggal_sampai=${dateTo}`} className="inline-flex items-center gap-2 rounded-xl bg-sky-50 px-4 h-11 text-sm font-bold text-sky-600 hover:bg-sky-100 border border-sky-200 transition shadow-sm">
                                <FileText size={18} /> CSV
                            </a>
                            <a href={`/laporan/log-penerbangan/export/xlsx?tanggal_dari=${dateFrom}&tanggal_sampai=${dateTo}`} className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 h-11 text-sm font-bold text-white hover:bg-emerald-600 transition shadow-md shadow-emerald-500/20">
                                <FileSpreadsheet size={18} /> Export Excel
                            </a>
                        </div>
                    </div>
                </div>

                {/* TABEL UTAMA */}
                <div className="bg-white shadow-sm rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
                                <Paperclip size={18} />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-800 text-base">Log Penerbangan Drone</h3>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">Tabel riwayat sinkronisasi data dari GCS</p>
                            </div>
                        </div>
                        <span className="text-xs bg-emerald-50 text-emerald-700 font-black px-4 py-2 rounded-xl border border-emerald-100">
                            {flightLogs.total} Record Ditemukan
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200">
                                    <th className="text-center px-5 py-4 whitespace-nowrap">Kode Log</th>
                                    <th className="text-center px-5 py-4 whitespace-nowrap">Waktu</th>
                                    <th className="text-left px-5 py-4">Misi &amp; Algoritma</th>
                                    <th className="text-center px-5 py-4 whitespace-nowrap">Mode Scan</th>
                                    <th className="text-center px-5 py-4 whitespace-nowrap">Durasi</th>
                                    <th className="text-center px-5 py-4">Total Pohon</th>
                                    <th className="text-center px-5 py-4">
                                        <div className="flex justify-center gap-4">
                                            <span className="text-orange-600">Matang</span>
                                            <span className="text-slate-500">Mentah</span>
                                        </div>
                                    </th>
                                    <th className="text-center px-5 py-4 text-emerald-600">Akurasi AI</th>
                                    <th className="text-center px-5 py-4">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {flightLogs.data.length > 0 ? flightLogs.data.map((log) => {
                                    
                                    const d = new Date(log.created_at);
                                    const dateStr = d.toLocaleDateString('id-ID', {day:'2-digit', month:'short', year:'numeric'});
                                    const timeStr = d.toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'});

                                    const algoBadge = {
                                        dead_reckoning: 'bg-blue-50 text-blue-700 border-blue-200',
                                        live_reckoning: 'bg-purple-50 text-purple-700 border-purple-200',
                                        hybrid: 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                    }[log.nav_algorithm] || 'bg-slate-50 text-slate-600 border-slate-200';
                                    const algoName = {
                                        dead_reckoning: 'Dead Reckoning',
                                        live_reckoning: 'Live Reckoning',
                                        hybrid: 'Hybrid'
                                    }[log.nav_algorithm] || log.nav_algorithm;

                                    return (
                                        <tr key={log.id} className="hover:bg-emerald-50/40 transition-colors group">
                                            <td className="px-5 py-4 text-center">
                                                <span className="inline-block bg-slate-800 text-white text-[11px] font-mono font-bold px-3 py-1.5 rounded-xl shadow-sm tracking-wide">
                                                    {log.log_code}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-center whitespace-nowrap">
                                                <div className="font-bold text-slate-700">{dateStr}</div>
                                                <div className="text-[11px] text-slate-400 font-medium mt-0.5">{timeStr}</div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="font-bold text-slate-800 text-sm mb-1.5">{log.mission_name || 'Tanpa Nama'}</div>
                                                <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold border ${algoBadge}`}>
                                                    {algoName}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                {log.scan_mode === 'qlv' ? (
                                                    <span className="inline-flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-xl font-bold bg-sky-50 text-sky-700 border border-sky-100 shadow-sm">
                                                        <Route size={12} /> QLV
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-xl font-bold bg-violet-50 text-violet-700 border border-violet-100 shadow-sm">
                                                        <Shuffle size={12} /> TRADISIONAL
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span className="font-mono text-slate-700 font-bold text-sm bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
                                                    {Math.floor(log.flight_time_seconds / 60)}m {log.flight_time_seconds % 60}s
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span className="font-black text-slate-800 text-lg">{log.samples_count}</span>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <div className="flex justify-center items-center gap-5">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-xl font-black text-orange-600">{log.matang}</span>
                                                    </div>
                                                    <div className="w-px h-8 bg-slate-200"></div>
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-xl font-black text-slate-400">{log.belum_matang}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span className={`inline-flex items-center justify-center font-black text-base px-4 py-1.5 rounded-xl shadow-sm border ${parseFloat(log.accuracy) >= 95 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200'}`}>
                                                    {parseFloat(log.accuracy).toFixed(1)}%
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <button 
                                                    onClick={() => handleViewDetail(log)}
                                                    className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-slate-500 hover:bg-emerald-500 hover:text-white transition-all shadow-sm hover:shadow-md"
                                                    title="Lihat Detail Telemetry">
                                                    <Eye size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="9" className="px-5 py-24 text-center">
                                            <div className="flex flex-col items-center gap-4 text-slate-400">
                                                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center border-4 border-white shadow-sm">
                                                    <Inbox size={32} className="text-slate-300" />
                                                </div>
                                                <div>
                                                    <div className="text-lg font-black text-slate-500">Belum ada log penerbangan</div>
                                                    <div className="text-sm text-slate-400 mt-1 font-medium">Selesaikan misi di GCS untuk mencatat log secara otomatis</div>
                                                </div>
                                                <a href="/gcs" className="mt-2 text-sm bg-emerald-500 text-white px-6 py-3 rounded-xl hover:bg-emerald-600 transition font-bold shadow-md shadow-emerald-500/20 flex items-center gap-2">
                                                    <Gamepad2 size={18} /> Buka Ground Control Station
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {flightLogs.links && flightLogs.links.length > 3 && (
                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="text-xs font-bold text-slate-500">
                                Menampilkan {flightLogs.from || 0} - {flightLogs.to || 0} dari {flightLogs.total} log
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5">
                                {flightLogs.links.map((link, idx) => {
                                    if (!link.url && !link.active) {
                                        return (
                                            <span key={idx} className="px-3 py-1.5 text-sm font-semibold text-slate-400 bg-transparent rounded-lg cursor-not-allowed">
                                                <span dangerouslySetInnerHTML={{ __html: link.label }}></span>
                                            </span>
                                        );
                                    }
                                    return (
                                        <a 
                                            key={idx}
                                            href={link.url || '#'}
                                            className={`px-3 py-1.5 text-sm font-bold rounded-lg transition-colors ${link.active ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        >
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

            </div>

            <ModalDetail 
                isOpen={!!selectedLog} 
                onClose={() => setSelectedLog(null)} 
                log={selectedLog} 
                telemetry={telemetryData}
                loading={isTelemetryLoading}
                error={telemetryError}
            />
        </div>
    );
};

export default AppLogPenerbangan;
