import React from 'react';
import {
  X, FileText, Trash2, Download, Activity,
  ClipboardList, TreeDeciduous, TrendingUp,
} from 'lucide-react';

/**
 * GCSReportsModal — Modal Laporan Kinerja Misi (Dashboard Analisis)
 * Props: isOpen, onClose, flightLogs, setFlightLogs, handleExportReports, t()
 */
const GCSReportsModal = ({ isOpen, onClose, flightLogs, setFlightLogs, handleExportReports, t }) => {
  if (!isOpen) return null;

  const totalSamples = flightLogs.reduce((a, b) => a + b.samples, 0);
  const totalTradTime = flightLogs.filter(l => l.scan === 'traditional').reduce((a, b) => a + b.flightTime, 0);
  const totalQlvTime = flightLogs.filter(l => l.scan === 'qlv').reduce((a, b) => a + b.flightTime, 0);
  const totalTradBat = flightLogs.filter(l => l.scan === 'traditional').reduce((a, b) => a + b.batteryUsed, 0);
  const totalQlvBat = flightLogs.filter(l => l.scan === 'qlv').reduce((a, b) => a + b.batteryUsed, 0);

  const summaryCards = [
    { label: 'TOTAL MISI', value: flightLogs.length, color: 'text-white', Icon: ClipboardList, iconColor: 'text-sky-500' },
    { label: 'POHON DISCAN', value: totalSamples, color: 'text-orange-400', Icon: TreeDeciduous, iconColor: 'text-orange-500' },
    { label: 'WAKTU TRAD (s)', value: totalTradTime.toFixed(0), color: 'text-sky-400', Icon: TrendingUp, iconColor: 'text-sky-500' },
    { label: 'WAKTU QLV (s)', value: totalQlvTime.toFixed(0), color: 'text-orange-400', Icon: TrendingUp, iconColor: 'text-orange-500' },
  ];

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`border rounded shadow-2xl w-[950px] max-w-[95%] h-[85vh] flex flex-col overflow-hidden ${t('bg-slate-900 border-slate-800', 'bg-white border-slate-300')}`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-4 py-3 border-b shrink-0 ${t('bg-slate-950 border-slate-800', 'bg-slate-50 border-slate-200')}`}>
          <div className={`flex items-center gap-2 ${t('text-orange-500', 'text-orange-600')}`}><FileText className="w-4 h-4" /><span className="font-bold uppercase text-xs tracking-widest">Dashboard Analisis Misi & Evaluasi Algoritma</span></div>
          <button onClick={onClose} className={t('text-slate-400 hover:text-rose-400', 'text-slate-500 hover:text-rose-600')}><X className="w-5 h-5" /></button>
        </div>

        {/* Body */}
        <div className={`flex-1 overflow-y-auto p-5 flex flex-col gap-5 ${t('bg-slate-900', 'bg-slate-50')}`}>

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-3 shrink-0">
            {summaryCards.map(({ label, value, color, Icon, iconColor }) => (
              <div key={label} className={`p-4 rounded border ${t('bg-slate-950 border-slate-800', 'bg-white border-slate-200 shadow-sm')}`}>
                <span className={`text-[9px] font-bold tracking-widest flex items-center gap-1.5 mb-1.5 ${t('text-slate-400', 'text-slate-500')}`}><Icon className={`w-3.5 h-3.5 ${iconColor}`} /> {label}</span>
                <span className={`text-3xl font-mono font-black ${color}`}>{value}</span>
              </div>
            ))}
          </div>

          {/* Analisis Komparatif */}
          {flightLogs.length > 0 && (
            <div className={`p-6 rounded-lg border ${t('bg-sky-950/20 border-sky-900/50', 'bg-sky-50 border-sky-200')}`}>
              <div className={`text-[12px] font-black tracking-widest mb-3 flex items-center gap-2 uppercase ${t('text-sky-400', 'text-sky-600')}`}><Activity className="w-5 h-5" /> Kesimpulan Analitik ({flightLogs.length} Trip)</div>
              <p className={`text-[13px] leading-relaxed mb-4 ${t('text-slate-300', 'text-slate-700')}`}>
                Secara kumulatif, <strong>Mode QLV</strong> menghemat waktu <strong className="text-orange-500 text-xl mx-1">{Math.max(0, totalTradTime - totalQlvTime).toFixed(0)} detik</strong> dan daya <strong className="text-orange-500 text-xl mx-1">{Math.max(0, totalTradBat - totalQlvBat).toFixed(2)}%</strong> vs Tradisional.
              </p>
              <div className={`text-xs font-bold p-4 rounded border ${t('bg-emerald-950/30 border-emerald-900/50 text-emerald-400', 'bg-emerald-50 border-emerald-200 text-emerald-700')}`}>
                REKOMENDASI: Gunakan "Hybrid" + "QLV" untuk efisiensi area luas, atau "Hybrid" + "Tradisional" untuk inspeksi kematangan detail.
              </div>
            </div>
          )}

          {/* Log Table */}
          <div className={`flex-1 border rounded-lg overflow-hidden flex flex-col min-h-[250px] ${t('bg-slate-950 border-slate-800', 'bg-white border-slate-200')}`}>
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-[10px]">
                <thead className={`sticky top-0 border-b ${t('bg-slate-900 text-slate-400 border-slate-700', 'bg-slate-100 text-slate-600 border-slate-300')}`}>
                  <tr><th className="p-3">WAKTU</th><th className="p-3">ID MISI</th><th className="p-3 text-center text-sky-400">ALGORITMA</th><th className="p-3 text-center text-orange-400">SCAN</th><th className="p-3 text-center">WAKTU(s)</th><th className="p-3 text-center">BATERAI(%)</th><th className="p-3 text-center text-emerald-400">AKURASI</th><th className="p-3 text-center">SAMPEL</th><th className="p-3 text-center text-orange-500">MATANG</th></tr>
                </thead>
                <tbody className={t('text-slate-300', 'text-slate-700')}>
                  {flightLogs.length === 0 ? (
                    <tr><td colSpan="9" className="text-center p-6 italic text-slate-500">Belum ada data penerbangan. Jalankan simulasi misi terlebih dahulu.</td></tr>
                  ) : flightLogs.map(log => (
                    <tr key={log.id} className={`border-b ${t('border-slate-800 hover:bg-slate-800/30', 'border-slate-100 hover:bg-slate-50')}`}>
                      <td className="p-3 text-slate-400">{log.date}</td>
                      <td className={`p-3 font-bold ${t('text-sky-300', 'text-sky-700')}`}>{log.name}</td>
                      <td className="p-3 text-center text-sky-400 font-bold">{log.nav === 'live_reckoning' ? 'Live' : log.nav === 'dead_reckoning' ? 'Dead Rec.' : 'Hybrid'}</td>
                      <td className="p-3 text-center"><span className="text-orange-500 bg-orange-950/30 px-2 py-0.5 rounded font-bold">{log.scan.toUpperCase()}</span></td>
                      <td className="p-3 text-center font-bold text-sky-500">{log.flightTime}s</td>
                      <td className={`p-3 text-center ${t('text-rose-400', 'text-rose-600')}`}>{log.batteryUsed}%</td>
                      <td className={`p-3 text-center font-bold ${log.accuracy > 94 ? t('text-emerald-400', 'text-emerald-600') : t('text-amber-400', 'text-amber-600')}`}>{log.accuracy}%</td>
                      <td className="p-3 text-center font-bold text-white">{log.samples}</td>
                      <td className="p-3 text-center font-bold text-orange-500">{log.matang} <span className="text-slate-500 text-[8px]">({log.belumMatang} Mentah)</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-3 flex justify-between items-center shrink-0 border-t ${t('bg-slate-950 border-slate-800', 'bg-slate-100 border-slate-300')}`}>
          <span className={`text-[9px] font-mono ${t('text-slate-500', 'text-slate-500')}`}>*Log diperbarui otomatis setiap drone selesai Landing.</span>
          <div className="flex gap-2">
            <button onClick={() => setFlightLogs([])} disabled={!flightLogs.length} className={`flex items-center gap-1.5 px-4 py-2 rounded text-[10px] font-bold disabled:opacity-50 border ${t('bg-slate-800 hover:bg-rose-600 text-rose-400 hover:text-white border-slate-700', 'bg-white hover:bg-rose-50 text-rose-600 border-slate-300')}`}><Trash2 className="w-3.5 h-3.5" /> CLEAR LOG</button>
            <button onClick={handleExportReports} disabled={!flightLogs.length} className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded text-[10px] font-bold disabled:opacity-50"><Download className="w-3.5 h-3.5" /> EKSPORT CSV</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GCSReportsModal;
