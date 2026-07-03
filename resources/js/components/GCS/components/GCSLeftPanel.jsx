import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  GaugeCircle, Minimize2, Maximize2, Battery, Clock,
  AlertTriangle, ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  RotateCcw, RotateCw, Shield, Play, Home, Square, Navigation
} from 'lucide-react';

/**
 * GCSLeftPanel — disesuaikan dengan drone-server/index.js lama
 * - Tidak ada status polling (/control/status tidak tersedia)
 * - D-Pad: hold = kirim ulang command setiap 400ms, server auto-reset via nudgeJoystick(600ms)
 * - Command yang didukung: arm, takeoff, land, emergency, disarm, reset_attitude,
 *   throttle_up/down, roll_left/right, pitch_forward/backward, yaw_left/right, joystick
 */
const GCSLeftPanel = ({
  droneMode,
  telemetry, flightTime, cockpitWarning, formatTime,
  handleStartFlight, handleRTH, handleDroneCommand, droneFlightState,
  t,
  // Dead Reckoning
  drRunning, drCurrentStep, drSequence, handleStopDeadReckoning,
  // Drones
  drones, selectedUploadDrone, setSelectedUploadDrone, setDroneMode,
  // Unused props (kept for interface compat)
  isVideoConnected, webcamStream, videoRef, liveStreamUrl,
  setIsVideoConnected, setAlertPopup, isPipVisible, setIsPipVisible,
  liveAiVision, flightStatusUI, targetAltitude, radarLeft, radarTop,
}) => {
  const [cockpitMinimized, setCockpitMinimized] = useState(
    () => localStorage.getItem('gcs_cockpit_min') === 'true'
  );
  const [uiAlert, setUiAlert] = useState('');
  const holdRef = useRef({ timer: null, command: null, active: false });

  const showAlert = (msg) => { setUiAlert(msg); setTimeout(() => setUiAlert(''), 4000); };

  // ── Derived state dari droneFlightState (AppGCS yang manage) ──
  const isFlying   = droneFlightState === 'FLYING';
  const isDisarmed = droneFlightState === 'DISARMED' || !droneFlightState;

  // ── sendCmd: langsung lewat handleDroneCommand (AppGCS routing) ──
  // AppGCS mengelola: droneFlightState, fetch ke /drone/control, dan error handling
  const sendCmd = useCallback((cmd) => {
    if (handleDroneCommand) handleDroneCommand(cmd);
  }, [handleDroneCommand]);

  // ── sendMovement: direct fetch untuk hold commands ──
  // Bypass AppGCS karena tidak butuh state change (tidak ubah droneFlightState)
  const sendMovement = useCallback(async (cmd) => {
    if (droneMode !== 'real') return; // simulasi tidak perlu kirim
    try {
      const csrf = document.querySelector('meta[name="csrf-token"]')?.content || '';
      const r = await fetch('/drone/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf },
        body: JSON.stringify({ command: cmd }),
      });
      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        if (data?.status === 'unknown_command') {
          console.warn('[GCS] Unknown command:', cmd);
        }
      }
    } catch (e) {
      console.error('[GCS] sendMovement error:', e);
    }
  }, [droneMode]);

  // ── Press-and-hold helpers ──
  // Server pakai nudgeJoystick(600ms auto-reset), jadi kirim ulang tiap 400ms
  // agar drone terus gerak selama tombol ditekan
  const stopHold = useCallback(() => {
    if (holdRef.current.timer) { clearInterval(holdRef.current.timer); }
    holdRef.current.timer = null;
    holdRef.current.command = null;
    holdRef.current.active = false;
    // Server auto-reset ke neutral setelah 600ms tanpa command — tidak perlu stop_motion
  }, []);

  const startHold = useCallback((cmd) => {
    stopHold();
    holdRef.current.active = true;
    holdRef.current.command = cmd;
    sendMovement(cmd);
    holdRef.current.timer = setInterval(() => {
      if (holdRef.current.active) sendMovement(holdRef.current.command);
    }, 400);
  }, [sendMovement, stopHold]);

  // Stop hold saat window blur / tab hide
  useEffect(() => {
    const onBlur = () => stopHold();
    const onVis  = () => { if (document.hidden) stopHold(); };
    window.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      stopHold();
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [stopHold]);

  // ── Hold button props ──
  const hp = (cmd) => ({
    disabled: !isFlying,
    style: { touchAction: 'none' },
    onPointerDown:   (e) => { e.preventDefault(); if (isFlying) startHold(cmd); },
    onPointerUp:     (e) => { e.preventDefault(); stopHold(); },
    onPointerLeave:  (e) => { e.preventDefault(); stopHold(); },
    onPointerCancel: (e) => { e.preventDefault(); stopHold(); },
  });

  const btn = 'text-[10px] font-bold rounded-lg px-2 py-2 transition disabled:opacity-30 disabled:cursor-not-allowed select-none';

  const PH = ({ icon: Icon, title, color, minimized, onToggle }) => (
    <div className="h-8 bg-slate-50 border-b border-slate-200 px-3 flex items-center justify-between shrink-0 select-none">
      <span className={`flex items-center gap-1.5 text-[11px] font-bold ${color ?? 'text-slate-600'}`}>
        <Icon className="w-3.5 h-3.5" />{title}
      </span>
      <button onClick={onToggle} className="p-0.5 text-slate-400 hover:text-blue-600 transition">
        {minimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
      </button>
    </div>
  );

  return (
    <aside className="w-80 shrink-0 flex flex-col gap-2 overflow-y-auto h-full pb-2">

      {/* ── UI Alert ── */}
      {uiAlert && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg px-3 py-2 text-[10px] font-semibold text-amber-800">
          {uiAlert}
        </div>
      )}

      {/* ── Dead Reckoning Mission Status ── */}
      {drRunning && drSequence && drSequence.length > 0 && (
        <div className="bg-blue-600 text-white rounded-lg overflow-hidden shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-blue-700">
            <span className="text-[10px] font-bold flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 animate-pulse" />
              DEAD RECKONING AKTIF
            </span>
            <span className="text-[9px] font-mono bg-blue-800 px-2 py-0.5 rounded-full">
              {(drCurrentStep ?? 0) + 1} / {drSequence.length}
            </span>
          </div>

          {/* Content */}
          <div className="px-3 py-2 flex flex-col gap-2">
            {/* Step name */}
            {drCurrentStep >= 0 && drSequence[drCurrentStep] && (
              <div className="text-[11px] font-semibold">
                ▶ {drSequence[drCurrentStep].aksi}
                <span className="text-blue-200 text-[9px] ml-1.5">
                  ({drSequence[drCurrentStep].durasi} {drSequence[drCurrentStep].satuan_waktu})
                </span>
              </div>
            )}

            {/* Progress bar */}
            <div className="w-full bg-blue-800 rounded-full h-1.5">
              <div
                className="bg-white h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${(((drCurrentStep ?? 0) + 1) / drSequence.length) * 100}%` }}
              />
            </div>

            {/* Stop button */}
            <button
              onClick={handleStopDeadReckoning}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[9px] font-bold bg-rose-600 hover:bg-rose-500 transition"
            >
              <Square className="w-3 h-3" /> Hentikan Misi Darurat
            </button>
          </div>
        </div>
      )}

      {/* ── DRONE CONTROL PANEL ── */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm flex flex-col">
        <PH
          icon={GaugeCircle} title="DRONE CONTROL" color="text-emerald-700"
          minimized={cockpitMinimized}
          onToggle={() => setCockpitMinimized(v => { const n = !v; localStorage.setItem('gcs_cockpit_min', n); return n; })}
        />

        {cockpitWarning && (
          <div className="px-3 py-1.5 bg-amber-500/10 border-b border-amber-500/30 text-amber-700 text-[10px] font-bold animate-pulse shrink-0">
            {cockpitWarning}
          </div>
        )}

        {!cockpitMinimized && (
          <div className="p-3 flex flex-col gap-2">

            {/* Active Drone Selector */}
            <div className="flex flex-col gap-1 border-b pb-2 mb-1">
              <label className="text-[9px] font-bold tracking-widest text-slate-400">PILIH ARMADA DRONE</label>
              <select 
                value={selectedUploadDrone} 
                onChange={(e) => setSelectedUploadDrone(e.target.value)} 
                className="w-full border border-slate-200 rounded-lg p-2 text-[10px] font-mono focus:outline-none text-slate-800 bg-slate-50"
              >
                <option value="">-- Pilih Drone --</option>
                {drones && drones.map(d => (
                  <option key={d.id} value={d.id} disabled={d.status !== 'Standby'}>
                    {d.id} - {d.merk} {d.status !== 'Standby' ? `(${d.status})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Operational Mode Selector */}
            <div className="flex flex-col gap-1 border-b pb-2 mb-1.5">
              <label className="text-[9px] font-bold tracking-widest text-slate-400">MODE OPERASIONAL</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setDroneMode('simulasi')}
                  className={`text-[9px] font-bold py-1.5 px-2 rounded-lg border transition ${
                    droneMode === 'simulasi'
                      ? 'bg-blue-100 border-blue-300 text-blue-700 font-extrabold'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  🖥️ SIMULASI
                </button>
                <button
                  onClick={() => setDroneMode('real')}
                  className={`text-[9px] font-bold py-1.5 px-2 rounded-lg border transition ${
                    droneMode === 'real'
                      ? 'bg-orange-100 border-orange-300 text-orange-700 font-extrabold'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  🛸 DRONE REAL
                </button>
              </div>
            </div>

            {/* Flight State Badge */}
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold font-mono text-slate-400">FLIGHT STATE</span>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                isFlying
                  ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/40'
                  : 'bg-rose-500/10 text-rose-500 border-rose-400/30'
              }`}>
                {droneFlightState ?? 'DISARMED'}
              </span>
            </div>

            {/* Telemetry */}
            <div className="grid grid-cols-2 gap-1.5">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-center">
                <div className="text-[8px] font-mono text-slate-400 mb-0.5">KECEPATAN</div>
                <div className="text-lg font-mono font-light text-blue-600">
                  {telemetry?.speed?.toFixed(1) ?? '0.0'}<span className="text-[9px] text-slate-400 ml-0.5">m/s</span>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-center">
                <div className="text-[8px] font-mono text-slate-400 mb-0.5">KETINGGIAN</div>
                <div className="text-lg font-mono font-light text-emerald-600">
                  {telemetry?.alt?.toFixed(1) ?? '0.0'}<span className="text-[9px] text-slate-400 ml-0.5">m</span>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 flex items-center gap-2 px-3">
                <Battery className={`w-4 h-4 shrink-0 ${(telemetry?.bat ?? 100) > 30 ? 'text-emerald-500' : 'text-rose-500'}`} />
                <div>
                  <div className="text-[8px] font-mono text-slate-400">BATERAI</div>
                  <div className="text-sm font-mono text-slate-800 font-bold">{Math.floor(telemetry?.bat ?? 0)}%</div>
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

            {/* Attitude */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-3 divide-x divide-slate-200 text-center py-2">
              {[
                { lbl: 'PITCH', val: `${(telemetry?.pitch ?? 0) > 0 ? '+' : ''}${(telemetry?.pitch ?? 0).toFixed(1)}°` },
                { lbl: 'ROLL',  val: `${(telemetry?.roll ?? 0) > 0 ? '+' : ''}${(telemetry?.roll ?? 0).toFixed(1)}°` },
                { lbl: 'YAW',   val: `${Math.floor(telemetry?.yaw ?? 0)}°` },
              ].map(({ lbl, val }) => (
                <div key={lbl}>
                  <div className="text-[8px] font-mono text-slate-500">{lbl}</div>
                  <div className="text-sm font-mono text-slate-800 font-bold">{val}</div>
                </div>
              ))}
            </div>

            {/* Prosedur */}
            <div className="text-[8px] font-bold text-slate-400 tracking-widest mt-1">PROSEDUR AWAL</div>
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 text-[8px] text-slate-500 leading-relaxed">
              1. Drone ON di permukaan datar · 2. Connect Wi-Fi drone · 3. Tekan ARM · 4. Takeoff
            </div>

            {/* ARM */}
            <button
              id="btn-arm"
              onClick={() => sendCmd('arm')}
              className={`${btn} w-full flex items-center justify-center gap-1.5 ${
                isFlying
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              {isFlying ? '✓ Armed / Flying' : 'ARM Drone'}
            </button>
            <p className="text-[8px] text-slate-400 text-center -mt-1">
              Mengirim sinyal unlock motor ke drone.
            </p>

            {/* Takeoff / Land / Emergency */}
            <div className="grid grid-cols-3 gap-1.5">
              <button
                id="btn-takeoff"
                onClick={() => sendCmd('takeoff')}
                className={`${btn} bg-sky-600 hover:bg-sky-500 text-white flex items-center justify-center gap-1`}
              >
                <Play className="w-3 h-3" /> Takeoff
              </button>
              <button
                id="btn-land"
                onClick={() => sendCmd('land')}
                className={`${btn} bg-amber-600 hover:bg-amber-500 text-white flex items-center justify-center gap-1`}
              >
                <Home className="w-3 h-3" /> Land
              </button>
              <button
                id="btn-emergency"
                onClick={() => { stopHold(); sendCmd('emergency'); }}
                className={`${btn} bg-rose-700 hover:bg-rose-600 text-white flex items-center justify-center gap-1`}
              >
                <AlertTriangle className="w-3 h-3" /> STOP
              </button>
            </div>

            {/* D-Pad */}
            <div className="text-[8px] font-bold text-slate-400 tracking-widest">MANUAL CONTROL</div>
            {!isFlying && (
              <div className="text-[8px] text-rose-500 text-center">
                🔒 ARM terlebih dahulu sebelum menggerakkan drone
              </div>
            )}

            <div className="flex justify-around items-center py-3 bg-slate-50 rounded-lg border border-slate-100">
              {/* Left stick: Throttle / Yaw */}
              <div className="flex flex-col items-center">
                <span className="text-[8px] font-bold mb-1.5 text-slate-400">THROTTLE/YAW</span>
                <div className="relative w-24 h-24 rounded-full border-2 flex items-center justify-center shadow-inner border-slate-200 bg-white">
                  <button id="btn-throttle-up"   {...hp('throttle_up')}   className="absolute top-0.5 p-1 rounded-full transition hover:bg-indigo-100 text-slate-600 disabled:opacity-30"><ChevronUp size={18}/></button>
                  <button id="btn-throttle-down" {...hp('throttle_down')} className="absolute bottom-0.5 p-1 rounded-full transition hover:bg-indigo-100 text-slate-600 disabled:opacity-30"><ChevronDown size={18}/></button>
                  <button id="btn-yaw-left"      {...hp('yaw_left')}      className="absolute left-0.5 p-1 rounded-full transition hover:bg-orange-100 text-slate-600 disabled:opacity-30"><RotateCcw size={14}/></button>
                  <button id="btn-yaw-right"     {...hp('yaw_right')}     className="absolute right-0.5 p-1 rounded-full transition hover:bg-orange-100 text-slate-600 disabled:opacity-30"><RotateCw size={14}/></button>
                  <div className="w-8 h-8 rounded-full shadow-md border bg-slate-100 border-slate-300" />
                </div>
              </div>

              {/* Right stick: Pitch / Roll */}
              <div className="flex flex-col items-center">
                <span className="text-[8px] font-bold mb-1.5 text-slate-400">PITCH/ROLL</span>
                <div className="relative w-24 h-24 rounded-full border-2 flex items-center justify-center shadow-inner border-slate-200 bg-white">
                  <button id="btn-pitch-fwd"  {...hp('pitch_forward')}  className="absolute top-0.5 p-1 rounded-full transition hover:bg-teal-100 text-slate-600 disabled:opacity-30"><ChevronUp size={18}/></button>
                  <button id="btn-pitch-back" {...hp('pitch_backward')} className="absolute bottom-0.5 p-1 rounded-full transition hover:bg-teal-100 text-slate-600 disabled:opacity-30"><ChevronDown size={18}/></button>
                  <button id="btn-roll-left"  {...hp('roll_left')}      className="absolute left-0.5 p-1 rounded-full transition hover:bg-cyan-100 text-slate-600 disabled:opacity-30"><ChevronLeft size={18}/></button>
                  <button id="btn-roll-right" {...hp('roll_right')}     className="absolute right-0.5 p-1 rounded-full transition hover:bg-cyan-100 text-slate-600 disabled:opacity-30"><ChevronRight size={18}/></button>
                  <div className="w-8 h-8 rounded-full shadow-md border bg-slate-100 border-slate-300" />
                </div>
              </div>
            </div>

            <button
              id="btn-reset-attitude"
              onClick={() => sendCmd('reset_attitude')}
              disabled={!isFlying}
              className={`${btn} w-full bg-slate-200 hover:bg-slate-300 text-slate-700`}
            >
              ↺ Reset Attitude
            </button>

            {/* Warnings */}
            <div className="text-[8px] text-slate-400 leading-relaxed border-t border-slate-100 pt-2">
              ⚠ D16 menggunakan Wi-Fi 2.4GHz — sensitif terhadap interferensi.<br />
              ⚠ Gunakan area luas/minim angin untuk testing awal.<br />
              ⚠ Emergency Stop selalu bisa ditekan kapanpun.
            </div>

          </div>
        )}
      </div>
    </aside>
  );
};

export default GCSLeftPanel;
