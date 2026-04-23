import React from 'react';
import { Battery, Clock, Play, Home, GaugeCircle, AlertTriangle } from 'lucide-react';

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

          {/* THROTTLE Row */}
          <div className="grid grid-cols-2 gap-1">
            <button
              id="btn-drone-throttle-up"
              onClick={() => handleDroneCommand('throttle_up')}
              disabled={isDisarmed}
              className={`${btnBase} bg-indigo-600 hover:bg-indigo-500 text-white`}
            >
              THROTTLE ▲
            </button>
            <button
              id="btn-drone-throttle-down"
              onClick={() => handleDroneCommand('throttle_down')}
              disabled={isDisarmed}
              className={`${btnBase} bg-indigo-800 hover:bg-indigo-700 text-white`}
            >
              THROTTLE ▼
            </button>
          </div>

          {/* PITCH Row */}
          <div className="grid grid-cols-2 gap-1">
            <button
              id="btn-drone-pitch-forward"
              onClick={() => handleDroneCommand('pitch_forward')}
              disabled={isDisarmed}
              className={`${btnBase} bg-teal-600 hover:bg-teal-500 text-white`}
            >
              PITCH ↑
            </button>
            <button
              id="btn-drone-pitch-backward"
              onClick={() => handleDroneCommand('pitch_backward')}
              disabled={isDisarmed}
              className={`${btnBase} bg-teal-800 hover:bg-teal-700 text-white`}
            >
              PITCH ↓
            </button>
          </div>

          {/* ROLL Row */}
          <div className="grid grid-cols-2 gap-1">
            <button
              id="btn-drone-roll-left"
              onClick={() => handleDroneCommand('roll_left')}
              disabled={isDisarmed}
              className={`${btnBase} bg-cyan-700 hover:bg-cyan-600 text-white`}
            >
              ROLL ←
            </button>
            <button
              id="btn-drone-roll-right"
              onClick={() => handleDroneCommand('roll_right')}
              disabled={isDisarmed}
              className={`${btnBase} bg-cyan-700 hover:bg-cyan-600 text-white`}
            >
              ROLL →
            </button>
          </div>

          {/* YAW Row */}
          <div className="grid grid-cols-2 gap-1">
            <button
              id="btn-drone-yaw-left"
              onClick={() => handleDroneCommand('yaw_left')}
              disabled={isDisarmed}
              className={`${btnBase} bg-orange-700 hover:bg-orange-600 text-white`}
            >
              YAW ←
            </button>
            <button
              id="btn-drone-yaw-right"
              onClick={() => handleDroneCommand('yaw_right')}
              disabled={isDisarmed}
              className={`${btnBase} bg-orange-700 hover:bg-orange-600 text-white`}
            >
              YAW →
            </button>
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
