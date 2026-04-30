import React from 'react';
import { Battery, Clock, Play, Home, GaugeCircle, AlertTriangle, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, RotateCcw, RotateCw } from 'lucide-react';

/**
 * GCSCockpit — Panel Gauge Cockpit + Drone Control (kanan atas)
 * Props: telemetry, flightTime, cockpitWarning, formatTime,
 *        handleStartFlight, handleRTH,
 *        handleDroneCommand, droneFlightState,
 *        t()
 */
const GCSCockpit = ({
  telemetry,
  flightTime,
  cockpitWarning,
  formatTime,
  handleStartFlight,
  handleRTH,
  handleDroneCommand,
  droneFlightState,
  t,
}) => {
  const isFlying = droneFlightState === 'FLYING';
  const isDisarmed = droneFlightState === 'DISARMED';

  const btnBase = 'text-[9px] font-bold rounded px-1.5 py-1 transition disabled:opacity-30 disabled:cursor-not-allowed';

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
      <div className={`p-2 grid grid-cols-2 gap-2 ${t('bg-slate-950', 'bg-slate-50')}`}>
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

      {/* ======== DRONE CONTROL PANEL ======== */}
      {handleDroneCommand && (
        <div className={`border-t p-2 flex flex-col gap-1.5 ${t('bg-slate-900 border-slate-700', 'bg-slate-50 border-slate-200')}`}>
          {/* Status Bar */}
          <div className="flex items-center justify-between mb-0.5">
            <span className={`text-[9px] font-bold font-mono ${t('text-slate-400', 'text-slate-500')}`}>DRONE CONTROL</span>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${isFlying ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'}`}>
              {droneFlightState}
            </span>
          </div>

          {/* ARM + TAKEOFF + LAND Row */}
          <div className="grid grid-cols-3 gap-1">
            <button
              id="btn-drone-arm"
              onClick={() => handleDroneCommand('arm')}
              disabled={isFlying}
              className={`${btnBase} bg-emerald-600 hover:bg-emerald-500 text-white`}
            >
              ⚡ ARM
            </button>
            <button
              id="btn-drone-takeoff"
              onClick={() => handleDroneCommand('takeoff')}
              disabled={isDisarmed}
              className={`${btnBase} bg-sky-600 hover:bg-sky-500 text-white`}
            >
              🚀 TAKEOFF
            </button>
            <button
              id="btn-drone-land"
              onClick={() => handleDroneCommand('land')}
              disabled={isDisarmed}
              className={`${btnBase} bg-amber-600 hover:bg-amber-500 text-white`}
            >
              🛬 LAND
            </button>
          </div>

          {/* DUAL D-PAD CONTROLLER (MODE 2 LAYOUT) */}
          <div className="flex justify-around items-center py-2">
            
            {/* Left Stick (Throttle / Yaw) */}
            <div className="flex flex-col items-center">
              <span className={`text-[8px] font-bold mb-1 tracking-wider ${t('text-slate-500', 'text-slate-400')}`}>THROTTLE / YAW</span>
              <div className={`relative w-24 h-24 rounded-full border-2 flex items-center justify-center shadow-inner ${t('border-slate-700 bg-slate-800/50', 'border-slate-200 bg-slate-100/50')}`}>
                <button onClick={() => handleDroneCommand('throttle_up')} disabled={isDisarmed} className={`absolute top-0.5 p-1 rounded-full transition ${t('hover:bg-indigo-600 text-slate-300', 'hover:bg-indigo-100 text-slate-600')} disabled:opacity-30`}><ChevronUp size={18}/></button>
                <button onClick={() => handleDroneCommand('throttle_down')} disabled={isDisarmed} className={`absolute bottom-0.5 p-1 rounded-full transition ${t('hover:bg-indigo-600 text-slate-300', 'hover:bg-indigo-100 text-slate-600')} disabled:opacity-30`}><ChevronDown size={18}/></button>
                <button onClick={() => handleDroneCommand('yaw_left')} disabled={isDisarmed} className={`absolute left-0.5 p-1 rounded-full transition ${t('hover:bg-orange-600 text-slate-300', 'hover:bg-orange-100 text-slate-600')} disabled:opacity-30`}><RotateCcw size={14}/></button>
                <button onClick={() => handleDroneCommand('yaw_right')} disabled={isDisarmed} className={`absolute right-0.5 p-1 rounded-full transition ${t('hover:bg-orange-600 text-slate-300', 'hover:bg-orange-100 text-slate-600')} disabled:opacity-30`}><RotateCw size={14}/></button>
                {/* Center Knob */}
                <div className={`w-7 h-7 rounded-full shadow-md border ${t('bg-slate-700 border-slate-600', 'bg-slate-200 border-slate-300')}`}></div>
              </div>
            </div>

            {/* Right Stick (Pitch / Roll) */}
            <div className="flex flex-col items-center">
              <span className={`text-[8px] font-bold mb-1 tracking-wider ${t('text-slate-500', 'text-slate-400')}`}>PITCH / ROLL</span>
              <div className={`relative w-24 h-24 rounded-full border-2 flex items-center justify-center shadow-inner ${t('border-slate-700 bg-slate-800/50', 'border-slate-200 bg-slate-100/50')}`}>
                <button onClick={() => handleDroneCommand('pitch_forward')} disabled={isDisarmed} className={`absolute top-0.5 p-1 rounded-full transition ${t('hover:bg-teal-600 text-slate-300', 'hover:bg-teal-100 text-slate-600')} disabled:opacity-30`}><ChevronUp size={18}/></button>
                <button onClick={() => handleDroneCommand('pitch_backward')} disabled={isDisarmed} className={`absolute bottom-0.5 p-1 rounded-full transition ${t('hover:bg-teal-600 text-slate-300', 'hover:bg-teal-100 text-slate-600')} disabled:opacity-30`}><ChevronDown size={18}/></button>
                <button onClick={() => handleDroneCommand('roll_left')} disabled={isDisarmed} className={`absolute left-0.5 p-1 rounded-full transition ${t('hover:bg-cyan-600 text-slate-300', 'hover:bg-cyan-100 text-slate-600')} disabled:opacity-30`}><ChevronLeft size={18}/></button>
                <button onClick={() => handleDroneCommand('roll_right')} disabled={isDisarmed} className={`absolute right-0.5 p-1 rounded-full transition ${t('hover:bg-cyan-600 text-slate-300', 'hover:bg-cyan-100 text-slate-600')} disabled:opacity-30`}><ChevronRight size={18}/></button>
                {/* Center Knob */}
                <div className={`w-7 h-7 rounded-full shadow-md border ${t('bg-slate-700 border-slate-600', 'bg-slate-200 border-slate-300')}`}></div>
              </div>
            </div>

          </div>

          {/* RESET + EMERGENCY Row */}
          <div className="grid grid-cols-2 gap-1">
            <button
              id="btn-drone-reset"
              onClick={() => handleDroneCommand('reset_attitude')}
              disabled={isDisarmed}
              className={`${btnBase} bg-slate-600 hover:bg-slate-500 text-white`}
            >
              ↺ RESET
            </button>
            <button
              id="btn-drone-emergency"
              onClick={() => handleDroneCommand('emergency')}
              disabled={isDisarmed}
              className={`${btnBase} bg-rose-700 hover:bg-rose-600 text-white flex items-center justify-center gap-1`}
            >
              <AlertTriangle className="w-2.5 h-2.5" /> STOP!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GCSCockpit;
