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
    const isAccHigh = parseFloat(log.accuracy) >= 95;
    const accTextColor = isAccHigh ? 'text-emerald-600' : 'text-amber-600';

    return createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/50 flex items-center justify-center">
                            <Plane size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg" style={{ fontFamily: "'Manrope', sans-serif" }}>Detail Log Penerbangan</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Ringkasan misi &amp; raw telemetry sensor IMU + GPS</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center">
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 overflow-y-auto flex-1">
                    {/* Ringkasan 4 kolom */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <div className="col-span-4 bg-slate-50 rounded-xl px-5 py-4 flex items-center justify-between border border-slate-200/60">
                            <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Kode Log</div>
                                <div className="font-mono font-bold text-slate-850 text-base">{log.log_code}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Tanggal Dicatat</div>
                                <div className="text-slate-700 font-bold">{log.date_formatted}</div>
                            </div>
                        </div>
                        <div className="col-span-2">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Nama Misi</div>
                            <div className="font-bold text-slate-850 text-base" style={{ fontFamily: "'Manrope', sans-serif" }}>{log.mission_name || 'Tanpa Nama'}</div>
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Algoritma</div>
                            <div className="font-bold text-slate-700">{algoLabel}</div>
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Mode Scan</div>
                            <div className="font-bold text-slate-700">{scanLabel}</div>
                        </div>
                    </div>

                    {/* Stats bar */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <div className="bg-white border border-slate-200/60 rounded-xl p-4 text-center shadow-sm">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Waktu Terbang</div>
                            <div className="font-extrabold text-slate-800 text-2xl" style={{ fontFamily: "'Manrope', sans-serif" }}>{fmtTime(log.flight_time_seconds)}</div>
                        </div>
                        <div className="bg-white border border-slate-200/60 rounded-xl p-4 text-center shadow-sm">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Total Sampel</div>
                            <div className="font-extrabold text-slate-800 text-2xl" style={{ fontFamily: "'Manrope', sans-serif" }}>{log.samples_count} <span className="text-xs font-bold text-slate-400">pohon</span></div>
                        </div>
                        <div className="bg-white border border-slate-200/60 rounded-xl p-4 text-center shadow-sm">
                            <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Matang</div>
                            <div className="font-extrabold text-amber-600 text-2xl" style={{ fontFamily: "'Manrope', sans-serif" }}>{log.matang} <span className="text-xs font-bold text-slate-400">pohon</span></div>
                        </div>
                        <div className="bg-white border border-slate-200/60 rounded-xl p-4 text-center shadow-sm">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Akurasi AI</div>
                            <div className={`font-extrabold text-2xl ${accTextColor}`} style={{ fontFamily: "'Manrope', sans-serif" }}>{parseFloat(log.accuracy).toFixed(1)}%</div>
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
                            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="overflow-x-auto overflow-y-auto max-h-60 custom-scrollbar">
                                    <table className="w-full text-left min-w-[900px]">
                                        <thead className="bg-slate-900 text-slate-100 text-[9px] uppercase font-bold sticky top-0 z-10 shadow-sm" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
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
                                            <tr className="bg-slate-800 text-[8px] text-slate-300 font-normal">
                                                <td colSpan="2"></td>
                                                <td className="px-4 py-1.5 text-right text-blue-400 bg-slate-800/50" colSpan="3">GPS Position</td>
                                                <td className="px-4 py-1.5 text-right text-indigo-400" colSpan="3">Accelerometer (m/s²)</td>
                                                <td className="px-4 py-1.5 text-right text-violet-400 bg-slate-800/50" colSpan="3">Gyroscope (°/s)</td>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-[11px] font-mono">
                                            {telemetry.map((d, i) => (
                                                <tr key={i} className={`hover:bg-slate-50/80 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                                                    <td className="px-4 py-2.5 text-slate-400 whitespace-nowrap">{d.timestamp || '-'}</td>
                                                    <td className="px-4 py-2.5 text-center">
                                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                                                            d.mode === 'AUTO' 
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                                                : d.mode === 'RTL' 
                                                                    ? 'bg-amber-50 text-amber-700 border-amber-200' 
                                                                    : d.mode === 'LANDING' 
                                                                        ? 'bg-rose-50 text-rose-700 border-rose-200' 
                                                                        : 'bg-slate-50 text-slate-600 border-slate-200'
                                                        }`}>
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
                    <button onClick={onClose} className="text-sm bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-6 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 font-bold shadow-sm">
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
                        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3" style={{ fontFamily: "'Manrope', sans-serif" }}>
                            <div className="bg-emerald-50 text-emerald-600 border border-emerald-100/50 p-2 rounded-xl">
                                <Plane size={24} />
                            </div>
                            Log Penerbangan
                        </h1>
                        <p className="text-sm text-slate-500 mt-2 font-medium">Riwayat misi dan hasil inspeksi drone yang tersimpan otomatis</p>
                    </div>
                    <div className="md:text-right bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Rentang Aktif</div>
                        <div className="text-sm font-bold text-emerald-700">{filterLabel}</div>
                    </div>
                </div>

                {/* STATS CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-4 bg-slate-100 text-slate-600">
                            <Paperclip size={16} />
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Total Penerbangan</p>
                        <p className="text-2xl font-extrabold text-slate-800 mt-1" style={{ fontFamily: "'Manrope', sans-serif" }}>{flightLogs.total}</p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-4 bg-sky-50 text-sky-600 border border-sky-100/50">
                            <Trees size={16} />
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Total Pohon Discan</p>
                        <p className="text-2xl font-extrabold text-slate-800 mt-1" style={{ fontFamily: "'Manrope', sans-serif" }}>{Number(totalSamples).toLocaleString('id-ID')}</p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-4 bg-amber-50 text-amber-600 border border-amber-100/50">
                            <Target size={16} />
                        </div>
                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Total Pohon Matang</p>
                        <p className="text-2xl font-extrabold text-slate-800 mt-1" style={{ fontFamily: "'Manrope', sans-serif" }}>{Number(totalMatang).toLocaleString('id-ID')}</p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-4 bg-blue-50 text-blue-600 border border-blue-100/50">
                            <Activity size={16} />
                        </div>
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Rata-rata Akurasi AI</p>
                        <p className="text-2xl font-extrabold text-slate-800 mt-1" style={{ fontFamily: "'Manrope', sans-serif" }}>{parseFloat(avgAccuracy).toFixed(1)}%</p>
                    </div>
                </div>

                {/* SCAN MODE BREAKDOWN */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 border border-sky-100/50 flex items-center justify-center shrink-0">
                            <Route size={18} />
                        </div>
                        <div>
                            <div className="font-bold text-slate-800 text-base" style={{ fontFamily: "'Manrope', sans-serif" }}>{countQlv} Penerbangan QLV</div>
                            <div className="text-xs text-slate-400 font-medium mt-0.5">Quick Look Vision — pemindaian cepat otomatis per koridor blok.</div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 border border-violet-100/50 flex items-center justify-center shrink-0">
                            <Shuffle size={18} />
                        </div>
                        <div>
                            <div className="font-bold text-slate-800 text-base" style={{ fontFamily: "'Manrope', sans-serif" }}>{countTrad} Penerbangan Tradisional</div>
                            <div className="text-xs text-slate-400 font-medium mt-0.5">Inspeksi manual waypoint zig-zag pohon per pohon.</div>
                        </div>
                    </div>
                </div>

                {/* FILTER & EXPORT */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
                        <form action="/laporan/log-penerbangan" method="GET" className="flex flex-wrap items-end gap-4">
                            <div>
                                <label htmlFor="tanggal_dari" className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Dari Tanggal</label>
                                <input 
                                    type="date" 
                                    id="tanggal_dari" 
                                    name="tanggal_dari" 
                                    value={dateFrom}
                                    onChange={e => setDateFrom(e.target.value)}
                                    className="rounded-xl border-slate-200 text-sm focus:border-emerald-500 focus:ring-emerald-500 h-10 px-4 font-semibold text-slate-700 shadow-sm transition-all duration-200" 
                                />
                            </div>
                            <div>
                                <label htmlFor="tanggal_sampai" className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Sampai Tanggal</label>
                                <input 
                                    type="date" 
                                    id="tanggal_sampai" 
                                    name="tanggal_sampai" 
                                    value={dateTo}
                                    onChange={e => setDateTo(e.target.value)}
                                    className="rounded-xl border-slate-200 text-sm focus:border-emerald-500 focus:ring-emerald-500 h-10 px-4 font-semibold text-slate-700 shadow-sm transition-all duration-200" 
                                />
                            </div>
                            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 h-10 text-sm font-bold text-white hover:bg-slate-800 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 shadow-sm shadow-slate-900/10">
                                <Filter size={16} /> Filter Data
                            </button>
                            {(dateFrom || dateTo) && (
                                <a href="/laporan/log-penerbangan" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 h-10 text-sm font-bold text-slate-600 hover:bg-slate-200 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0">
                                    <RotateCcw size={16} /> Reset
                                </a>
                            )}
                        </form>

                        <div className="flex flex-wrap gap-3">
                            <a href={`/laporan/log-penerbangan/export/pdf?tanggal_dari=${dateFrom}&tanggal_sampai=${dateTo}`} className="inline-flex items-center gap-2 rounded-xl bg-rose-50 px-4 h-10 text-xs font-bold text-rose-600 hover:bg-rose-100 hover:text-rose-700 border border-rose-200 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 shadow-sm">
                                <FileText size={16} /> PDF
                            </a>
                            <a href={`/laporan/log-penerbangan/export/csv?tanggal_dari=${dateFrom}&tanggal_sampai=${dateTo}`} className="inline-flex items-center gap-2 rounded-xl bg-sky-50 px-4 h-10 text-xs font-bold text-sky-600 hover:bg-sky-100 hover:text-sky-700 border border-sky-200 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 shadow-sm">
                                <FileText size={16} /> CSV
                            </a>
                            <a href={`/laporan/log-penerbangan/export/xlsx?tanggal_dari=${dateFrom}&tanggal_sampai=${dateTo}`} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 h-10 text-xs font-bold text-white hover:bg-emerald-700 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 shadow-sm shadow-emerald-600/10">
                                <FileSpreadsheet size={16} /> Export Excel
                            </a>
                        </div>
                    </div>
                </div>

                {/* TABEL UTAMA */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/30">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/50 flex items-center justify-center">
                                <Paperclip size={18} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-base" style={{ fontFamily: "'Manrope', sans-serif" }}>Log Penerbangan Drone</h3>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">Tabel riwayat sinkronisasi data dari GCS</p>
                            </div>
                        </div>
                        <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1.5 rounded-lg border border-emerald-100/50">
                            {flightLogs.total} Record Ditemukan
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50/80">
                                    <th className="text-center px-5 py-3 text-[10px] tracking-[.08em] uppercase font-bold text-slate-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Kode Log</th>
                                    <th className="text-center px-5 py-3 text-[10px] tracking-[.08em] uppercase font-bold text-slate-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Waktu</th>
                                    <th className="text-left px-5 py-3 text-[10px] tracking-[.08em] uppercase font-bold text-slate-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Misi &amp; Algoritma</th>
                                    <th className="text-center px-5 py-3 text-[10px] tracking-[.08em] uppercase font-bold text-slate-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Mode Scan</th>
                                    <th className="text-center px-5 py-3 text-[10px] tracking-[.08em] uppercase font-bold text-slate-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Durasi</th>
                                    <th className="text-center px-5 py-3 text-[10px] tracking-[.08em] uppercase font-bold text-slate-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Total Pohon</th>
                                    <th className="text-center px-5 py-3 text-[10px] tracking-[.08em] uppercase font-bold text-slate-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                        <div className="flex justify-center gap-4">
                                            <span className="text-amber-600">Matang</span>
                                            <span className="text-emerald-600">Mentah</span>
                                        </div>
                                    </th>
                                    <th className="text-center px-5 py-3 text-[10px] tracking-[.08em] uppercase font-bold text-slate-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Akurasi AI</th>
                                    <th className="text-center px-5 py-3 text-[10px] tracking-[.08em] uppercase font-bold text-slate-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Aksi</th>
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
                                        <tr key={log.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-5 py-4 text-center">
                                                <span className="inline-block bg-slate-900 text-slate-100 text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border border-slate-700 shadow-sm tracking-wide">
                                                    {log.log_code}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-center whitespace-nowrap">
                                                <div className="font-bold text-slate-700">{dateStr}</div>
                                                <div className="text-[11px] text-slate-400 font-medium mt-0.5">{timeStr}</div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="font-bold text-slate-800 text-sm mb-1.5" style={{ fontFamily: "'Manrope', sans-serif" }}>{log.mission_name || 'Tanpa Nama'}</div>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold border ${algoBadge}`}>
                                                    {algoName}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                {log.scan_mode === 'qlv' ? (
                                                    <span className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-lg font-bold bg-sky-50 text-sky-700 border border-sky-100 shadow-sm">
                                                        <Route size={12} /> QLV
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-lg font-bold bg-violet-50 text-violet-700 border border-violet-100 shadow-sm">
                                                        <Shuffle size={12} /> TRADISIONAL
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span className="font-mono text-slate-750 font-semibold text-xs bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                                                    {Math.floor(log.flight_time_seconds / 60)}m {log.flight_time_seconds % 60}s
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span className="font-extrabold text-slate-800 text-base" style={{ fontFamily: "'Manrope', sans-serif" }}>{log.samples_count}</span>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <div className="flex justify-center items-center gap-4">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-base font-extrabold text-amber-600" style={{ fontFamily: "'Manrope', sans-serif" }}>{log.matang}</span>
                                                    </div>
                                                    <div className="w-px h-5 bg-slate-200"></div>
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-base font-extrabold text-emerald-600" style={{ fontFamily: "'Manrope', sans-serif" }}>{log.belum_matang}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span className={`inline-flex items-center justify-center font-extrabold text-sm px-3 py-1 rounded-lg border ${parseFloat(log.accuracy) >= 95 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200'}`} style={{ fontFamily: "'Manrope', sans-serif" }}>
                                                    {parseFloat(log.accuracy).toFixed(1)}%
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <button 
                                                    onClick={() => handleViewDetail(log)}
                                                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800 shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                                                    title="Lihat Detail Telemetry">
                                                    <Eye size={16} />
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
                        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/30 flex flex-col md:flex-row items-center justify-between gap-4">
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
                                            className={`px-3 py-1.5 text-sm font-bold rounded-lg transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${link.active ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/10' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
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
