import React from 'react';
import { 
    ServerOff, 
    PlaneTakeoff, 
    ScrollText, 
    Brain, 
    FileDown, 
    CheckCircle2, 
    XCircle, 
    BarChart3,
    History,
    Route,
    FileText
} from 'lucide-react';

const AppLaporanAI = ({ laporan = [], flightLogs = [], flightLogSummary = {} }) => {
    
    // Format tanggal
    const formatDate = (dateString) => {
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    const formatTime = (dateString) => {
        const options = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
        return new Date(dateString).toLocaleTimeString('id-ID', options);
    };

    // Calculate Summary Stats
    const totalSampel = parseInt(flightLogSummary?.total_sampel || 0);
    const totalMatang = parseInt(flightLogSummary?.total_matang || 0);
    const totalBelum = parseInt(flightLogSummary?.total_belum || 0);
    const avgAcc = parseFloat(flightLogSummary?.avg_accuracy || 0).toFixed(1);
    
    const matangPct = totalSampel > 0 ? ((totalMatang / totalSampel) * 100).toFixed(1) : 0;
    const belumPct = (100 - matangPct).toFixed(1);

    return (
        <div className="pt-4 pb-12 w-full">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-10 flex flex-col gap-6">
                
                {laporan.length === 0 ? (
                    <>
                        {/* STATUS BANNER */}
                        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 shadow-sm flex items-start gap-4">
                            <div className="bg-amber-100 text-amber-600 rounded-xl p-3 shrink-0 mt-1">
                                <ServerOff size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-amber-800 font-bold text-lg mb-1">Server AI Belum Terhubung</h3>
                                <p className="text-amber-700/80 text-sm leading-relaxed mb-4">
                                    Belum ada data prediksi per-pohon. FastAPI AI Server (port 8001) kemungkinan belum berjalan.
                                    Di bawah ditampilkan ringkasan hasil scan dari Log Penerbangan sebagai <strong>data sementara</strong>.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <a href="/gcs" className="inline-flex items-center gap-2 text-xs font-bold bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl shadow-sm hover:bg-slate-50 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0">
                                        <PlaneTakeoff size={16} /> Jalankan Misi Drone (GCS)
                                    </a>
                                    <a href="/laporan/log-penerbangan" className="inline-flex items-center gap-2 text-xs font-bold bg-amber-600 text-white px-4 py-2 rounded-xl shadow-sm hover:bg-amber-700 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0">
                                        <ScrollText size={16} /> Lihat Log Penerbangan
                                    </a>
                                </div>
                            </div>
                        </div>

                        {flightLogs.length > 0 ? (
                            <>
                                {/* STATS CARDS */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md">
                                        <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-4 bg-slate-100 text-slate-600">
                                            <FileText size={16} />
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Total Sampel Pohon</p>
                                        <p className="text-2xl font-extrabold text-slate-800 mt-1" style={{ fontFamily: "'Manrope', sans-serif" }}>{totalSampel.toLocaleString('id-ID')}</p>
                                    </div>
                                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md">
                                        <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-4 bg-amber-50 text-amber-600 border border-amber-100/50">
                                            <CheckCircle2 size={16} />
                                        </div>
                                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Terdeteksi Ripe (Matang)</p>
                                        <p className="text-2xl font-extrabold text-slate-800 mt-1" style={{ fontFamily: "'Manrope', sans-serif" }}>{totalMatang.toLocaleString('id-ID')}</p>
                                    </div>
                                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md">
                                        <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-4 bg-emerald-50 text-emerald-600 border border-emerald-100/50">
                                            <XCircle size={16} />
                                        </div>
                                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Unripe (Belum Matang)</p>
                                        <p className="text-2xl font-extrabold text-slate-800 mt-1" style={{ fontFamily: "'Manrope', sans-serif" }}>{totalBelum.toLocaleString('id-ID')}</p>
                                    </div>
                                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md">
                                        <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-4 bg-blue-50 text-blue-600 border border-blue-100/50">
                                            <Brain size={16} />
                                        </div>
                                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Rata-rata Akurasi AI</p>
                                        <p className="text-2xl font-extrabold text-slate-800 mt-1" style={{ fontFamily: "'Manrope', sans-serif" }}>{avgAcc}%</p>
                                    </div>
                                </div>

                                {/* PROGRESS BAR */}
                                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                                    <div className="flex justify-between items-end mb-3">
                                        <div>
                                            <h4 className="font-bold text-slate-700">Distribusi Kematangan</h4>
                                            <p className="text-[11px] text-slate-400 mt-0.5">Akumulasi dari seluruh sesi penerbangan</p>
                                        </div>
                                        <span className="font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-lg text-sm">{matangPct}% Ripe (Matang)</span>
                                    </div>
                                    <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                                        <div className="h-full bg-amber-500 rounded-l-full transition-all duration-1000 ease-out" style={{ width: `${matangPct}%` }}></div>
                                        <div className="h-full bg-emerald-500 rounded-r-full transition-all duration-1000 ease-out" style={{ width: `${belumPct}%` }}></div>
                                    </div>
                                    <div className="flex gap-6 mt-4">
                                        <span className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                                            <span className="w-3.5 h-3.5 bg-amber-500 rounded-full inline-block shadow-sm"></span>
                                            Matang: {totalMatang} ({matangPct}%)
                                        </span>
                                        <span className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                                            <span className="w-3.5 h-3.5 bg-emerald-500 rounded-full inline-block shadow-sm"></span>
                                            Belum Matang: {totalBelum} ({belumPct}%)
                                        </span>
                                    </div>
                                </div>

                                {/* FLIGHT LOGS CARDS */}
                                <div>
                                    <div className="flex items-center justify-between mb-5">
                                        <h4 className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                            <History size={16} className="text-blue-500" /> Rekap Log Penerbangan Terbaru
                                        </h4>
                                        <a href="/laporan/log-penerbangan" className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-all duration-200">
                                            Lihat Semua Log &rarr;
                                        </a>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                        {flightLogs.map((log, idx) => (
                                            <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <div className="inline-block bg-slate-800 text-white px-2 py-0.5 rounded text-[10px] font-mono mb-2">{log.log_code}</div>
                                                        <div className="font-bold text-slate-800 text-base leading-tight mb-1">{log.mission_name || 'Tanpa Nama'}</div>
                                                        <div className="text-xs text-slate-400 font-medium">{formatDate(log.created_at)}, {formatTime(log.created_at)}</div>
                                                    </div>
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold ${log.scan_mode === 'qlv' ? 'bg-sky-100 text-sky-700 border border-sky-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                                                        {String(log.scan_mode || '-').toUpperCase()}
                                                    </span>
                                                </div>
                                                
                                                <div className="grid grid-cols-3 gap-3 border-t border-slate-100 pt-4 text-center">
                                                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-2">
                                                        <p className="text-lg font-black text-slate-800 font-mono">{log.samples_count}</p>
                                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Sampel</p>
                                                    </div>
                                                    <div className="bg-amber-50 border border-amber-100/50 rounded-xl p-2">
                                                        <p className="text-lg font-black text-amber-700 font-mono">{log.matang}</p>
                                                        <p className="text-[9px] text-amber-600 font-bold uppercase tracking-wider mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Matang</p>
                                                    </div>
                                                    <div className="bg-blue-50 border border-blue-100/50 rounded-xl p-2">
                                                        <p className="text-lg font-black text-blue-700 font-mono">{parseFloat(log.accuracy || 0).toFixed(1)}%</p>
                                                        <p className="text-[9px] text-blue-600 font-bold uppercase tracking-wider mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Akurasi</p>
                                                    </div>
                                                </div>
                                                
                                                {log.nav_algorithm && (
                                                    <div className="mt-4 pt-3 border-t border-slate-50 flex items-center gap-2">
                                                        <Route size={14} className="text-slate-400" />
                                                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{String(log.nav_algorithm).replace('_', ' ')}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                <ScrollText size={48} className="text-slate-300 mb-4" />
                                <p className="text-slate-600 font-bold text-lg mb-2">Belum ada data penerbangan</p>
                                <p className="text-sm text-slate-400 text-center max-w-md mb-6">Jalankan misi dari GCS dan biarkan drone mendarat — log akan tersimpan otomatis ke database.</p>
                                <a href="/gcs" className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-500 transition-colors shadow-md shadow-blue-600/20 flex items-center gap-2">
                                    <PlaneTakeoff size={18} /> Buka Ground Control Station
                                </a>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                        {/* ===== AI DATA SUDAH ADA — tabel laporan_prediksis ===== */}
                        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="bg-purple-100 text-purple-600 p-2 rounded-xl">
                                    <Brain size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-base">Riwayat Deteksi Buah</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">{laporan.length} entri tercatat</p>
                                </div>
                            </div>
                            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-sm shadow-emerald-600/10 flex items-center gap-2">
                                <FileDown size={16} /> Export Rekap
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50/80">
                                        <th className="text-center px-5 py-3 text-[10px] tracking-[.08em] uppercase font-bold text-slate-400 w-16" style={{ fontFamily: "'JetBrains Mono', monospace" }}>No</th>
                                        <th className="text-center px-5 py-3 text-[10px] tracking-[.08em] uppercase font-bold text-slate-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Waktu Scan</th>
                                        <th className="text-center px-5 py-3 text-[10px] tracking-[.08em] uppercase font-bold text-slate-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Pohon Target</th>
                                        <th className="text-center px-5 py-3 text-[10px] tracking-[.08em] uppercase font-bold text-slate-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Status Kematangan</th>
                                        <th className="text-left px-5 py-3 text-[10px] tracking-[.08em] uppercase font-bold text-slate-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Analisa AI &amp; Confidence</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {laporan.map((item, index) => {
                                        const isMatang = String(item.status).toLowerCase() === 'matang';
                                        const isMentah = String(item.status).toLowerCase() === 'mentah';
                                        
                                        return (
                                            <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="px-5 py-4 text-center text-slate-400 font-mono text-xs">{index + 1}</td>
                                                <td className="px-5 py-4 text-center">
                                                    <div className="font-bold text-slate-700 text-[13px]">{formatDate(item.created_at)}</div>
                                                    <div className="text-[11px] text-slate-400 font-medium mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{formatTime(item.created_at)}</div>
                                                </td>
                                                <td className="px-5 py-4 text-center">
                                                    <span className="font-bold text-slate-700 bg-slate-50 border border-slate-200/60 px-3 py-1 rounded-lg text-xs font-mono">Pohon #{item.sampel_ke}</span>
                                                </td>
                                                <td className="px-5 py-4 text-center">
                                                    {isMatang && (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                            <CheckCircle2 size={14} /> {String(item.status).toUpperCase()}
                                                        </span>
                                                    )}
                                                    {isMentah && (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            <XCircle size={14} /> {String(item.status).toUpperCase()}
                                                        </span>
                                                    )}
                                                    {!isMatang && !isMentah && (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                                            <BarChart3 size={14} /> {String(item.status).toUpperCase()}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 text-slate-600 font-medium leading-relaxed text-[13px]">{item.analisa}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default AppLaporanAI;
