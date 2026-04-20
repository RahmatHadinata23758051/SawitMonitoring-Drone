import React from 'react';
import { Battery, Clock, Play, Home, GaugeCircle } from 'lucide-react';

/**
 * GCSCockpit — Panel Gauge Cockpit (kanan atas)
 * Props: telemetry, flightTime, cockpitWarning, formatTime,
 *        handleStartFlight, handleRTH, t()
 */
const GCSCockpit = ({
  telemetry,
  flightTime,
  cockpitWarning,
  formatTime,
  handleStartFlight,
  handleRTH,
  t,
}) => {
  return (
    <div className={`border rounded-lg overflow-hidden shadow-lg flex flex-col ${t('bg-slate-900 border-slate-700', 'bg-white border-slate-300')}`}>
      {/* Header */}
      <div className={`h-6 border-b px-2 flex items-center justify-between z-10 shrink-0 ${t('bg-slate-800 border-slate-700', 'bg-slate-100 border-slate-300')}`}>
        <span className="flex items-center gap-1">
          <GaugeCircle className={`w-3 h-3 ${t('text-emerald-500', 'text-emerald-600')}`} />
          <span className={`text-[10px] font-bold ${t('text-slate-300', 'text-slate-700')}`}>GAUGE COCKPIT</span>
          {cockpitWarning && <span className="text-[9px] text-rose-500 animate-pulse font-bold ml-2">({cockpitWarning})</span>}
        </span>
        <div className="flex gap-1">
          <button id="btn-mulai-terbang" onClick={handleStartFlight} className="bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-0.5 rounded text-[8px] font-bold flex items-center gap-1 transition"><Play className="w-2 h-2" /> MULAI</button>
          <button id="btn-rth" onClick={handleRTH} className="bg-amber-600 hover:bg-amber-500 text-white px-2 py-0.5 rounded text-[8px] font-bold flex items-center gap-1 transition"><Home className="w-2 h-2" /> RTH</button>
        </div>
      </div>

      {/* Gauge Grid */}
      <div className={`flex-1 p-2 grid grid-cols-2 gap-2 ${t('bg-slate-950', 'bg-slate-50')}`}>
        {/* Kecepatan */}
        <div className={`border rounded p-2 flex flex-col items-center justify-center ${t('bg-slate-900 border-slate-800', 'bg-white border-slate-200 shadow-sm')}`}>
          <span className={`text-[9px] font-mono ${t('text-slate-500', 'text-slate-500')}`}>KECEPATAN</span>
          <div className={`text-xl font-mono font-light ${t('text-sky-400', 'text-sky-600')}`}>
            {telemetry.speed.toFixed(1)} <span className="text-[10px] text-slate-500">m/s</span>
          </div>
        </div>
        {/* Ketinggian */}
        <div className={`border rounded p-2 flex flex-col items-center justify-center ${t('bg-slate-900 border-slate-800', 'bg-white border-slate-200 shadow-sm')}`}>
          <span className={`text-[9px] font-mono ${t('text-slate-500', 'text-slate-500')}`}>KETINGGIAN</span>
          <div className={`text-xl font-mono font-light ${t('text-emerald-400', 'text-emerald-600')}`}>
            {telemetry.alt.toFixed(1)} <span className="text-[10px] text-slate-500">m</span>
          </div>
        </div>
        {/* Attitude (P/R/Y) */}
        <div className={`col-span-2 border rounded p-2 grid grid-cols-3 divide-x text-center ${t('bg-slate-900 border-slate-800 divide-slate-800', 'bg-white border-slate-200 divide-slate-200 shadow-sm')}`}>
          <div><div className={`text-[8px] font-mono ${t('text-slate-500', 'text-slate-500')}`}>PITCH</div><div className={`text-sm font-mono ${t('text-white', 'text-slate-800')}`}>{telemetry.pitch > 0 ? '+' : ''}{telemetry.pitch.toFixed(1)}°</div></div>
          <div><div className={`text-[8px] font-mono ${t('text-slate-500', 'text-slate-500')}`}>ROLL</div><div className={`text-sm font-mono ${t('text-white', 'text-slate-800')}`}>{telemetry.roll > 0 ? '+' : ''}{telemetry.roll.toFixed(1)}°</div></div>
          <div><div className={`text-[8px] font-mono ${t('text-slate-500', 'text-slate-500')}`}>YAW</div><div className={`text-sm font-mono ${t('text-white', 'text-slate-800')}`}>{Math.floor(telemetry.yaw)}°</div></div>
        </div>
        {/* Baterai */}
        <div className={`border rounded p-1.5 flex items-center justify-between px-3 ${t('bg-slate-900 border-slate-800', 'bg-white border-slate-200 shadow-sm')}`}>
          <div className="flex items-center gap-1"><Battery className={`w-4 h-4 ${telemetry.bat > 30 ? 'text-emerald-500' : 'text-rose-500'}`} /><span className={`text-[9px] font-mono ${t('text-slate-500', 'text-slate-500')}`}>BATERAI</span></div>
          <span className={`text-sm font-mono ${t('text-white', 'text-slate-800')}`}>{Math.floor(telemetry.bat)}%</span>
        </div>
        {/* Waktu Terbang */}
        <div className={`border rounded p-1.5 flex items-center justify-between px-3 ${t('bg-slate-900 border-slate-800', 'bg-white border-slate-200 shadow-sm')}`}>
          <div className="flex items-center gap-1"><Clock className="w-4 h-4 text-amber-500" /><span className={`text-[9px] font-mono ${t('text-slate-500', 'text-slate-500')}`}>WAKTU</span></div>
          <span className={`text-sm font-mono ${t('text-amber-400', 'text-amber-600')}`}>{formatTime(flightTime)}</span>
        </div>
      </div>
    </div>
  );
};

export default GCSCockpit;
