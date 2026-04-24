import React, { useState, useRef, useEffect } from 'react';
import {
  Camera, GaugeCircle, Minimize2, Maximize2, ExternalLink,
  Battery, Clock, Play, Home, AlertTriangle, Navigation, Compass,
  Crosshair, MonitorPlay
} from 'lucide-react';
import Hls from 'hls.js';

/**
 * GCSLeftPanel — Sidebar kiri GCS
 * Camera Feed (dockable/popout) + Gauge Cockpit + Drone Controls
 */
const GCSLeftPanel = ({
  // Camera props
  droneMode, isVideoConnected, webcamStream, videoRef,
  liveStreamUrl, setIsVideoConnected, setAlertPopup,
  // PiP controls
  isPipVisible, setIsPipVisible,
  // Cockpit props
  telemetry, flightTime, cockpitWarning, formatTime,
  handleStartFlight, handleRTH, handleDroneCommand, droneFlightState,
  // Radar props
  liveAiVision, flightStatusUI, targetAltitude, radarLeft, radarTop,
  // Theme
  t,
}) => {
  const hlsVideoRef = useRef(null);
  const [hlsStatus, setHlsStatus] = useState('WAITING');

  // 5.3.2 — Persist panel state ke localStorage
  const [camMinimized,     setCamMinimized]     = useState(() => localStorage.getItem('gcs_cam_minimized')     === 'true');
  const [cockpitMinimized, setCockpitMinimized] = useState(() => localStorage.getItem('gcs_cockpit_minimized') === 'true');

  const toggleCam = () => setCamMinimized(v => {
    const next = !v; localStorage.setItem('gcs_cam_minimized', next); return next;
  });
  const toggleCockpit = () => setCockpitMinimized(v => {
    const next = !v; localStorage.setItem('gcs_cockpit_minimized', next); return next;
  });

  const isFlying = droneFlightState === 'FLYING';
  const isDisarmed = droneFlightState === 'DISARMED';
  const btn = 'text-[10px] font-bold rounded px-2 py-1.5 transition disabled:opacity-30 disabled:cursor-not-allowed';



  // Reusable panel header
  const PanelHeader = ({ icon: Icon, title, color, minimized, onToggle, onPopout, extraAction }) => (
    <div className="h-8 bg-slate-50 border-b border-slate-200 px-3 flex items-center justify-between shrink-0 select-none">
      <span className={`flex items-center gap-1.5 text-[11px] font-bold ${color ?? 'text-slate-600'}`}>
        <Icon className="w-3.5 h-3.5" />
        {title}
      </span>
      <div className="flex items-center gap-1">
        {extraAction}
        {onPopout && (
          <button onClick={onPopout} className="p-0.5 text-slate-400 hover:text-blue-600 transition" title="Popout">
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
        <button onClick={onToggle} className="p-0.5 text-slate-400 hover:text-blue-600 transition" title={minimized ? 'Expand' : 'Minimize'}>
          {minimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
        </button>
      </div>
    </div>
  );

  return (
    <aside className="w-80 shrink-0 flex flex-col gap-2 overflow-y-auto custom-scrollbar h-full pb-2">



      {/* ============ GAUGE / COCKPIT PANEL ============ */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm flex flex-col">
        <PanelHeader
          icon={GaugeCircle} title="GAUGE COCKPIT" color="text-emerald-700"
          minimized={cockpitMinimized} onToggle={toggleCockpit}
        />

        {/* Warning banner */}
        {cockpitWarning && (
          <div className="px-3 py-1.5 bg-amber-500/10 border-b border-amber-500/30 text-amber-400 text-[10px] font-bold animate-pulse shrink-0">
            {cockpitWarning}
          </div>
        )}

        {!cockpitMinimized && (
          <>
            {/* Quick flight buttons */}
            <div className="flex gap-2 px-3 py-2 bg-slate-50 border-b border-slate-200 shrink-0">
              <button id="btn-mulai-terbang" onClick={handleStartFlight}
                className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold py-2 rounded transition shadow-sm">
                <Play className="w-3 h-3" /> MULAI
              </button>
              <button id="btn-rth" onClick={handleRTH}
                className="flex-1 flex items-center justify-center gap-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold py-2 rounded transition">
                <Home className="w-3 h-3" /> RTH
              </button>
            </div>

            {/* Telemetry values grid */}
            <div className="grid grid-cols-2 gap-2 p-3 bg-white">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center">
                <div className="text-[9px] font-mono text-slate-500 mb-1">KECEPATAN</div>
                <div className="text-xl font-mono font-light text-blue-600">
                  {telemetry.speed?.toFixed(1) ?? '0.0'}<span className="text-[10px] text-slate-400 ml-0.5">m/s</span>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center">
                <div className="text-[9px] font-mono text-slate-500 mb-1">KETINGGIAN</div>
                <div className="text-xl font-mono font-light text-emerald-600">
                  {telemetry.alt?.toFixed(1) ?? '0.0'}<span className="text-[10px] text-slate-400 ml-0.5">m</span>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 flex items-center gap-2 px-3">
                <Battery className={`w-4 h-4 shrink-0 ${(telemetry.bat ?? 100) > 30 ? 'text-emerald-500' : 'text-rose-500'}`} />
                <div>
                  <div className="text-[8px] font-mono text-slate-400">BATERAI</div>
                  <div className="text-sm font-mono text-slate-800 font-bold">{Math.floor(telemetry.bat ?? 0)}%</div>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 flex items-center gap-2 px-3">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <div>
                  <div className="text-[8px] font-mono text-slate-400">WAKTU</div>
                  <div className="text-sm font-mono text-amber-600 font-bold">{formatTime ? formatTime(flightTime) : '0m 0s'}</div>
                </div>
              </div>
            </div>

            {/* Attitude P/R/Y */}
            <div className="mx-3 mb-3 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-3 divide-x divide-slate-200 text-center py-2">
              {[
                { lbl: 'PITCH', val: `${(telemetry.pitch ?? 0) > 0 ? '+' : ''}${(telemetry.pitch ?? 0).toFixed(1)}°` },
                { lbl: 'ROLL',  val: `${(telemetry.roll ?? 0) > 0 ? '+' : ''}${(telemetry.roll ?? 0).toFixed(1)}°` },
                { lbl: 'YAW',   val: `${Math.floor(telemetry.yaw ?? 0)}°` },
              ].map(({ lbl, val }) => (
                <div key={lbl}>
                  <div className="text-[8px] font-mono text-slate-500">{lbl}</div>
                  <div className="text-sm font-mono text-slate-800 font-bold">{val}</div>
                </div>
              ))}
            </div>

            {/* Radar mini (Dihapus agar tidak numpuk, radar utama sudah ada di Peta) */}

            {/* Drone Control */}
            {handleDroneCommand && (
              <div className="px-3 pb-3 flex flex-col gap-1.5">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[9px] font-bold font-mono text-slate-400">DRONE CONTROL</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${isFlying ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border-rose-500/40'}`}>
                    {droneFlightState}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <button id="btn-drone-arm"      onClick={() => handleDroneCommand('arm')}      disabled={isFlying}   className={`${btn} bg-emerald-700 hover:bg-emerald-600 text-white`}>⚡ ARM</button>
                  <button id="btn-drone-takeoff"  onClick={() => handleDroneCommand('takeoff')}  disabled={isDisarmed} className={`${btn} bg-sky-700 hover:bg-sky-600 text-white`}>🚀 TAKEOFF</button>
                  <button id="btn-drone-land"     onClick={() => handleDroneCommand('land')}     disabled={isDisarmed} className={`${btn} bg-amber-700 hover:bg-amber-600 text-white`}>🛬 LAND</button>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <button id="btn-drone-throttle-up"   onClick={() => handleDroneCommand('throttle_up')}   disabled={isDisarmed} className={`${btn} bg-indigo-700 hover:bg-indigo-600 text-white`}>THROTTLE ▲</button>
                  <button id="btn-drone-throttle-down" onClick={() => handleDroneCommand('throttle_down')} disabled={isDisarmed} className={`${btn} bg-indigo-900 hover:bg-indigo-800 text-white`}>THROTTLE ▼</button>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  <button id="btn-drone-pitch-forward"  onClick={() => handleDroneCommand('pitch_forward')}  disabled={isDisarmed} className={`${btn} bg-teal-700 hover:bg-teal-600 text-white`}>P↑</button>
                  <button id="btn-drone-pitch-backward" onClick={() => handleDroneCommand('pitch_backward')} disabled={isDisarmed} className={`${btn} bg-teal-900 hover:bg-teal-800 text-white`}>P↓</button>
                  <button id="btn-drone-roll-left"      onClick={() => handleDroneCommand('roll_left')}      disabled={isDisarmed} className={`${btn} bg-cyan-700 hover:bg-cyan-600 text-white`}>R←</button>
                  <button id="btn-drone-roll-right"     onClick={() => handleDroneCommand('roll_right')}     disabled={isDisarmed} className={`${btn} bg-cyan-700 hover:bg-cyan-600 text-white`}>R→</button>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <button id="btn-drone-yaw-left"  onClick={() => handleDroneCommand('yaw_left')}       disabled={isDisarmed} className={`${btn} bg-orange-700 hover:bg-orange-600 text-white`}>YAW←</button>
                  <button id="btn-drone-yaw-right" onClick={() => handleDroneCommand('yaw_right')}      disabled={isDisarmed} className={`${btn} bg-orange-700 hover:bg-orange-600 text-white`}>YAW→</button>
                  <button id="btn-drone-reset"     onClick={() => handleDroneCommand('reset_attitude')} disabled={isDisarmed} className={`${btn} bg-slate-600 hover:bg-slate-500 text-white`}>↺ RST</button>
                </div>
                <button id="btn-drone-emergency" onClick={() => handleDroneCommand('emergency')} disabled={isDisarmed}
                  className={`${btn} w-full bg-rose-700 hover:bg-rose-600 text-white flex items-center justify-center gap-1.5`}>
                  <AlertTriangle className="w-3 h-3" /> EMERGENCY STOP
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
};

export default GCSLeftPanel;
