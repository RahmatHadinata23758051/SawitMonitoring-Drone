import React from 'react';
import {
  X, FileText, Trash2, Download, Activity,
  ClipboardList, TreeDeciduous, TrendingUp,
} from 'lucide-react';

/**
 * GCSReportsModal — Modal Laporan Kinerja Misi — Light Mode
 */
const GCSReportsModal = ({ isOpen, onClose, flightLogs, setFlightLogs, handleExportReports, t }) => {
  if (!isOpen) return null;

  const totalSamples = flightLogs.reduce((a, b) => a + b.samples, 0);
  const totalTradTime = flightLogs.filter(l => l.scan === 'traditional').reduce((a, b) => a + b.flightTime, 0);
  const totalQlvTime  = flightLogs.filter(l => l.scan === 'qlv').reduce((a, b) => a + b.flightTime, 0);
  const totalTradBat  = flightLogs.filter(l => l.scan === 'traditional').reduce((a, b) => a + b.batteryUsed, 0);
  const totalQlvBat   = flightLogs.filter(l => l.scan === 'qlv').reduce((a, b) => a + b.batteryUsed, 0);

  const summaryCards = [
    { label: 'TOTAL MISI',     value: flightLogs.length,      color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200',   Icon: ClipboardList, iconColor: 'text-blue-500' },
    { label: 'POHON DISCAN',   value: totalSamples,           color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', Icon: TreeDeciduous, iconColor: 'text-orange-500' },
    { label: 'WAKTU TRAD (s)', value: totalTradTime.toFixed(0), color: 'text-slate-800', bg: 'bg-slate-50 border-slate-200',   Icon: TrendingUp,   iconColor: 'text-blue-400' },
    { label: 'WAKTU QLV (s)',  value: totalQlvTime.toFixed(0),  color: 'text-slate-800', bg: 'bg-slate-50 border-slate-200',   Icon: TrendingUp,   iconColor: 'text-orange-400' },
  ];

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="border border-slate-200 rounded-2xl shadow-2xl w-[980px] max-w-[95%] h-[88vh] flex flex-col overflow-hidden bg-white">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2 text-orange-600">
            <FileText className="w-4 h-4" />
            <span className="font-extrabold uppercase text-xs tracking-widest">Dashboard Analisis Misi & Evaluasi Algoritma</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition rounded-lg p-1 hover:bg-rose-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5 bg-slate-50">

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-3 shrink-0">
            {summaryCards.map(({ label, value, color, bg, Icon, iconColor }) => (
              <div key={label} className={`p-4 rounded-xl border shadow-sm ${bg} bg-white`}>
                <span className={`text-[9px] font-extrabold tracking-widest flex items-center gap-1.5 mb-2 text-slate-400`}>
                  <Icon className={`w-3.5 h-3.5 ${iconColor}`} /> {label}
                </span>
                <span className={`text-3xl font-mono font-black ${color}`}>{value}</span>
              </div>
            ))}
          </div>

          {/* Analisis Komparatif */}
          {flightLogs.length > 0 && (
            <div className="p-5 rounded-xl border bg-blue-50 border-blue-200 shadow-sm">
              <div className="text-[11px] font-extrabold tracking-widest mb-3 flex items-center gap-2 uppercase text-blue-700">
                <Activity className="w-4 h-4" /> Kesimpulan Analitik ({flightLogs.length} Trip)
              </div>
              <p className="text-[13px] leading-relaxed mb-4 text-slate-700">
                Secara kumulatif, <strong>Mode QLV</strong> menghemat waktu{' '}
                <strong className="text-orange-600 text-xl mx-1">{Math.max(0, totalTradTime - totalQlvTime).toFixed(0)} detik</strong>
                dan daya{' '}
                <strong className="text-orange-600 text-xl mx-1">{Math.max(0, totalTradBat - totalQlvBat).toFixed(2)}%</strong>
                vs Tradisional.
              </p>
              <div className="text-xs font-bold p-4 rounded-lg border bg-emerald-50 border-emerald-200 text-emerald-700">
                REKOMENDASI: Gunakan "Hybrid" + "QLV" untuk efisiensi area luas, atau "Hybrid" + "Tradisional" untuk inspeksi kematangan detail.
              </div>
            </div>
          )}

          {/* Log Table */}
          <div className="flex-1 border border-slate-200 rounded-xl overflow-hidden flex flex-col min-h-[250px] bg-white shadow-sm">
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-[10px]">
                <thead className="sticky top-0 border-b bg-slate-100 text-slate-600 border-slate-200">
                  <tr>
                    <th className="p-3 text-left">WAKTU</th>
                    <th className="p-3 text-left">ID MISI</th>
                    <th className="p-3 text-center text-blue-600">ALGORITMA</th>
                    <th className="p-3 text-center text-orange-600">SCAN</th>
                    <th className="p-3 text-center">WAKTU(s)</th>
                    <th className="p-3 text-center">BATERAI(%)</th>
                    <th className="p-3 text-center text-emerald-600">AKURASI</th>
                    <th className="p-3 text-center">SAMPEL</th>
                    <th className="p-3 text-center text-orange-500">MATANG</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700">
                  {flightLogs.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center p-8 italic text-slate-400">
                        Belum ada data penerbangan. Jalankan simulasi misi terlebih dahulu.
                      </td>
                    </tr>
                  ) : flightLogs.map(log => (
                    <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3 text-slate-400 font-mono text-[9px]">{log.date}</td>
                      <td className="p-3 font-bold text-blue-700">{log.name}</td>
                      <td className="p-3 text-center text-blue-600 font-bold">{log.nav === 'live_reckoning' ? 'Live' : log.nav === 'dead_reckoning' ? 'Dead Rec.' : 'Hybrid'}</td>
                      <td className="p-3 text-center"><span className="text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full font-bold">{log.scan.toUpperCase()}</span></td>
                      <td className="p-3 text-center font-bold text-blue-600">{log.flightTime}s</td>
                      <td className="p-3 text-center text-rose-600">{log.batteryUsed}%</td>
                      <td className={`p-3 text-center font-bold ${log.accuracy > 94 ? 'text-emerald-600' : 'text-amber-600'}`}>{log.accuracy}%</td>
                      <td className="p-3 text-center font-bold text-slate-800">{log.samples}</td>
                      <td className="p-3 text-center font-bold text-orange-600">{log.matang} <span className="text-slate-400 text-[8px]">({log.belumMatang} Mentah)</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 flex justify-between items-center shrink-0 border-t border-slate-200 bg-white">
          <span className="text-[9px] font-mono text-slate-400">*Log diperbarui otomatis setiap drone selesai Landing.</span>
          <div className="flex gap-2">
            <button
              onClick={() => setFlightLogs([])}
              disabled={!flightLogs.length}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-bold disabled:opacity-50 border bg-white hover:bg-rose-50 text-rose-600 border-rose-200 transition"
            >
              <Trash2 className="w-3.5 h-3.5" /> CLEAR LOG
            </button>
            <button
              onClick={handleExportReports}
              disabled={!flightLogs.length}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold disabled:opacity-50 transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> EKSPORT CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GCSReportsModal;
