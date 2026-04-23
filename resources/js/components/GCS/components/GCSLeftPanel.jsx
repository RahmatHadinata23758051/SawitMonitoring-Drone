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

  // HLS streaming logic (moved from GCSMapPanel)
  useEffect(() => {
    let hls;
    if (droneMode === 'real' && isVideoConnected && liveStreamUrl?.endsWith('.m3u8')) {
      if (Hls.isSupported() && hlsVideoRef.current) {
        setHlsStatus('INIT');
        hls = new Hls({ lowLatencyMode: true, manifestLoadingMaxRetry: 999, manifestLoadingRetryDelay: 2000 });
        hls.loadSource(liveStreamUrl);
        hls.attachMedia(hlsVideoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          hlsVideoRef.current?.play().catch(() => setHlsStatus('BLOCKED'));
          setHlsStatus('PLAYING');
        });
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            setHlsStatus('ERR: ' + data.type);
            setTimeout(() => {
              if (hls) {
                hls.destroy();
                hls = new Hls({ lowLatencyMode: true, manifestLoadingMaxRetry: 999, manifestLoadingRetryDelay: 2000 });
                hls.loadSource(liveStreamUrl);
                hls.attachMedia(hlsVideoRef.current);
              }
            }, 2000);
          }
        });
      } else if (hlsVideoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
        hlsVideoRef.current.src = liveStreamUrl;
        setHlsStatus('NATIVE HLS');
      }
    }
    return () => { if (hls) hls.destroy(); };
  }, [droneMode, isVideoConnected, liveStreamUrl]);

  // Reusable panel header
  const PanelHeader = ({ icon: Icon, title, color, minimized, onToggle, onPopout, extraAction }) => (
    <div className="h-8 bg-slate-800 border-b border-slate-700 px-3 flex items-center justify-between shrink-0 select-none">
      <span className={`flex items-center gap-1.5 text-[11px] font-bold ${color ?? 'text-slate-300'}`}>
        <Icon className="w-3.5 h-3.5" />
        {title}
      </span>
      <div className="flex items-center gap-1">
        {extraAction}
        {onPopout && (
          <button onClick={onPopout} className="p-0.5 text-slate-500 hover:text-slate-200 transition" title="Popout">
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
        <button onClick={onToggle} className="p-0.5 text-slate-500 hover:text-slate-200 transition" title={minimized ? 'Expand' : 'Minimize'}>
          {minimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
        </button>
      </div>
    </div>
  );

  return (
    <aside className="w-80 shrink-0 flex flex-col gap-2 overflow-y-auto custom-scrollbar h-full pb-2">

      {/* ============ CAMERA FEED PANEL ============ */}
      <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-lg flex flex-col shrink-0">
        <PanelHeader
          icon={Camera} title="LIVE CAMERA" color="text-rose-300"
          minimized={camMinimized} onToggle={toggleCam}
          extraAction={
            setIsPipVisible ? (
              <button
                onClick={() => setIsPipVisible(v => !v)}
                title="Toggle PiP (Picture-in-Picture)"
                className={`p-0.5 transition ${isPipVisible ? 'text-sky-400' : 'text-slate-500 hover:text-slate-200'}`}
              >
                <MonitorPlay className="w-3 h-3" />
              </button>
            ) : null
          }
        />

        {!camMinimized && (
          <>
            {/* REC indicator */}
            <div className="px-3 py-1 bg-slate-950 flex items-center gap-2 text-[9px] font-mono shrink-0">
              <div className={`w-2 h-2 rounded-full shrink-0 ${droneMode && isVideoConnected ? 'bg-rose-500 animate-pulse' : 'bg-slate-600'}`} />
              <span className="text-rose-400 font-bold">
                REC {droneMode === 'simulasi' ? '(WEBCAM)' : droneMode === 'real' ? '(REAL)' : '(STANDBY)'}
              </span>
              {hlsStatus !== 'WAITING' && hlsStatus !== 'PLAYING' && (
                <span className="text-amber-400 ml-auto text-[8px]">{hlsStatus}</span>
              )}
            </div>

            {/* CAM 1: RGB */}
            <div className="relative bg-black w-full" style={{ aspectRatio: '16/9' }}>
              <div className="absolute top-1 left-1 bg-black/70 px-1.5 py-0.5 rounded text-[8px] text-white z-10 font-bold">CAM 1: RGB</div>
              {droneMode === 'simulasi' && isVideoConnected && webcamStream ? (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              ) : droneMode === 'real' && isVideoConnected ? (
                liveStreamUrl?.endsWith('.m3u8') ? (
                  <video ref={hlsVideoRef} autoPlay playsInline muted className="w-full h-full object-cover"
                    onError={() => { setIsVideoConnected(false); setAlertPopup({ title: 'Video Terputus', message: 'Gagal memuat HLS stream.' }); }} />
                ) : (
                  <img src={liveStreamUrl} alt="Live FPV" className="w-full h-full object-cover"
                    onError={() => { setIsVideoConnected(false); setAlertPopup({ title: 'Video Terputus', message: 'Gagal memuat stream.' }); }} />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-slate-500 text-[10px] font-mono border border-slate-600 border-dashed px-3 py-1.5 rounded">NO SIGNAL</span>
                </div>
              )}
            </div>

            {/* CAM 2: AI Multispectral */}
            <div className="relative bg-[#0a101d] w-full" style={{ aspectRatio: '16/9' }}>
              <div className="absolute top-1 left-1 bg-black/70 px-1.5 py-0.5 rounded text-[8px] text-emerald-400 z-10 font-bold">CAM 2: AI MULTISPECTRAL</div>
              {droneMode && isVideoConnected ? (
                <>
                  <div className="absolute inset-0 opacity-20"
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(16,185,129,0.3) 1px, transparent 0)', backgroundSize: '15px 15px' }} />
                  <Crosshair
                    className={`absolute w-7 h-7 pointer-events-none transition-all duration-300 ${liveAiVision?.isPalmFruit ? 'text-rose-500 scale-125 opacity-80' : 'text-emerald-500 opacity-50'}`}
                    style={{ top: `calc(${liveAiVision?.boxPos?.top ?? 30}% - 14px)`, left: `calc(${liveAiVision?.boxPos?.left ?? 40}% - 14px)` }}
                  />
                  {liveAiVision?.isPalmFruit && (
                    <div className={`absolute w-10 h-14 border-2 ${liveAiVision.condition === 'Matang' ? 'border-orange-500 bg-orange-500/20' : 'border-slate-400 bg-slate-400/20'}`}
                      style={{ top: `${liveAiVision.boxPos.top}%`, left: `${liveAiVision.boxPos.left}%` }}>
                      <div className="absolute -top-3.5 bg-black/80 text-white text-[7px] px-1 font-bold w-full text-center border-b border-inherit whitespace-nowrap">
                        {liveAiVision.condition} ({liveAiVision.confidence}%)
                      </div>
                    </div>
                  )}
                  {telemetry.subState === 'SCAN_QLV_CAPTURE' && <div className="absolute inset-0 bg-white/40 z-30 pointer-events-none" />}
                  {telemetry.subState === 'SCAN_TRAD' && <div className="absolute inset-0 bg-white/10 z-30 pointer-events-none animate-pulse" />}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-slate-500 text-[10px] font-mono border border-slate-600 border-dashed px-3 py-1.5 rounded">NO SIGNAL</span>
                </div>
              )}
            </div>

            <div className="h-5 bg-slate-950/90 flex items-center justify-between px-3 text-[9px] font-mono text-slate-500 shrink-0">
              <span>DUAL STREAM</span>
              <span>TARGET ALT: {targetAltitude?.toFixed(1) ?? '--'}m</span>
            </div>
          </>
        )}
      </div>

      {/* ============ GAUGE / COCKPIT PANEL ============ */}
      <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-lg flex flex-col">
        <PanelHeader
          icon={GaugeCircle} title="GAUGE COCKPIT" color="text-emerald-400"
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
            <div className="flex gap-2 px-3 py-2 bg-slate-800/60 border-b border-slate-700 shrink-0">
              <button id="btn-mulai-terbang" onClick={handleStartFlight}
                className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold py-2 rounded transition">
                <Play className="w-3 h-3" /> MULAI
              </button>
              <button id="btn-rth" onClick={handleRTH}
                className="flex-1 flex items-center justify-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold py-2 rounded transition">
                <Home className="w-3 h-3" /> RTH
              </button>
            </div>

            {/* Telemetry values grid */}
            <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950">
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-center">
                <div className="text-[9px] font-mono text-slate-500 mb-1">KECEPATAN</div>
                <div className="text-xl font-mono font-light text-sky-400">
                  {telemetry.speed?.toFixed(1) ?? '0.0'}<span className="text-[10px] text-slate-500 ml-0.5">m/s</span>
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-center">
                <div className="text-[9px] font-mono text-slate-500 mb-1">KETINGGIAN</div>
                <div className="text-xl font-mono font-light text-emerald-400">
                  {telemetry.alt?.toFixed(1) ?? '0.0'}<span className="text-[10px] text-slate-500 ml-0.5">m</span>
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 flex items-center gap-2 px-3">
                <Battery className={`w-4 h-4 shrink-0 ${(telemetry.bat ?? 100) > 30 ? 'text-emerald-500' : 'text-rose-500'}`} />
                <div>
                  <div className="text-[8px] font-mono text-slate-500">BATERAI</div>
                  <div className="text-sm font-mono text-white">{Math.floor(telemetry.bat ?? 0)}%</div>
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 flex items-center gap-2 px-3">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <div>
                  <div className="text-[8px] font-mono text-slate-500">WAKTU</div>
                  <div className="text-sm font-mono text-amber-400">{formatTime ? formatTime(flightTime) : '0m 0s'}</div>
                </div>
              </div>
            </div>

            {/* Attitude P/R/Y */}
            <div className="mx-3 mb-3 bg-slate-900 border border-slate-800 rounded-lg grid grid-cols-3 divide-x divide-slate-800 text-center py-2.5">
              {[
                { lbl: 'PITCH', val: `${(telemetry.pitch ?? 0) > 0 ? '+' : ''}${(telemetry.pitch ?? 0).toFixed(1)}°` },
                { lbl: 'ROLL',  val: `${(telemetry.roll ?? 0) > 0 ? '+' : ''}${(telemetry.roll ?? 0).toFixed(1)}°` },
                { lbl: 'YAW',   val: `${Math.floor(telemetry.yaw ?? 0)}°` },
              ].map(({ lbl, val }) => (
                <div key={lbl}>
                  <div className="text-[8px] font-mono text-slate-500">{lbl}</div>
                  <div className="text-sm font-mono text-white">{val}</div>
                </div>
              ))}
            </div>

            {/* Radar mini */}
            <div className="mx-3 mb-3 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden" style={{ height: '120px' }}>
              <div className="h-6 bg-slate-800 border-b border-slate-700 px-2 flex items-center justify-between">
                <span className="text-[10px] font-bold text-sky-400 flex items-center gap-1"><Compass className="w-3 h-3" /> POSISI DRONE</span>
                <span className={`text-[9px] font-mono ${flightStatusUI !== 'STANDBY' ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`}>LIVE</span>
              </div>
              <div className="relative w-full bg-[#0b1318]" style={{ height: '94px' }}>
                <div className="absolute inset-0 opacity-25"
                  style={{ backgroundImage: 'linear-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(90deg, #0ea5e9 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
                <div className="absolute w-28 h-28 border border-sky-500/20 rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute w-14 h-14 border border-sky-500/20 rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                {flightStatusUI !== 'STANDBY' && (
                  <div className="absolute w-full h-full animate-[spin_4s_linear_infinite] origin-center"
                    style={{ background: 'conic-gradient(from 0deg, transparent 0deg, rgba(14,165,233,0.12) 60deg, transparent 60deg)' }} />
                )}
                <div className="absolute transition-all duration-200"
                  style={{ left: `${radarLeft ?? 50}%`, top: `${radarTop ?? 50}%`, transform: `translate(-50%, -50%) rotate(${(telemetry.yaw ?? 0) - 90}deg)` }}>
                  <Navigation className="w-5 h-5 fill-emerald-500/30 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                </div>
                <div className="absolute bottom-0 w-full flex justify-between px-2 py-0.5 text-[8px] font-mono text-sky-300 bg-slate-950/80">
                  <span>LAT: {(telemetry.lat ?? 0).toFixed(6)}</span>
                  <span>LON: {(telemetry.lon ?? 0).toFixed(6)}</span>
                </div>
              </div>
            </div>

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
