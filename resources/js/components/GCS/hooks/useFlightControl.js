/**
 * useFlightControl.js
 * Hook untuk mengelola simulasi dan kontrol penerbangan drone:
 * - Physics engine (interval 200ms) — simulasi gerak drone
 * - AI Vision updates saat scanning (via FastAPI /simulate)
 * - Telemetry state (posisi, altitude, speed, battery, dll)
 * - Flight controls: handleStartFlight, handleRTH
 * - Flight logs (history tiap penerbangan)
 *
 * ⚠️ PENTING: Banyak useRef di sini yang diakses dari dalam setTelemetry callback.
 *    Ref-ref ini sengaja tidak dipisah ke mod lain karena closure interval mem-capture
 *    nilai awal dari React state.
 *
 * ✅ AI Integration: Setiap scan event memanggil FastAPI /simulate (TRAD) atau
 *    /simulate/dual (QLV). Fallback ke random jika server tidak tersedia.
 */

import { useState, useRef, useEffect } from 'react';
import { homeWP, BASE_LAT, BASE_LON, METER_TO_DEG } from '../utils/gcsConstants';

const AI_SERVER_URL = 'http://127.0.0.1:8001';

export function useFlightControl({
  droneMode,
  isTelemConnected,
  isVideoConnected,
  scanMode,
  navAlgorithm,
  waypoints,
  qlvPath,
  tradPath,
  config,
  missionName,
  setAutoSavePending,
  setCockpitWarning,
}) {
  // --- FLIGHT STATUS REFS (diakses dalam interval) ---
  const flightStatusRef = useRef('STANDBY');
  const activePathRef = useRef([]);
  const currentWpIndexRef = useRef(0);
  const autoSubStateRef = useRef('NAV');
  const scanTimerRef = useRef(0);
  const baseYawRef = useRef(0);
  const tickCountRef = useRef(0);
  const flightTimeRef = useRef(0);
  const currentFlightInfoRef = useRef(null);
  const scannedTreesRef = useRef(0);

  // ✅ AI Result Accumulators (untuk statistik akhir misi)
  const matangCountRef = useRef(0);       // jumlah pohon terdeteksi Matang
  const accuracyAccumRef = useRef(0);     // akumulasi confidence * 100
  const aiCallCountRef = useRef(0);       // jumlah scan yang berhasil diprediksi AI
  const pendingScanEventRef = useRef(null); // 'trad' | 'qlv' | null — trigger async fetch

  // ✅ Manual control input (simulasi mode) — diisi oleh handleDroneCommand di AppGCS
  const manualInputRef = useRef(null); // 'throttle_up' | 'pitch_forward' | 'roll_left' | dll

  // --- FLIGHT STATUS UI STATE ---
  const [flightStatusUI, setFlightStatusUI] = useState('STANDBY');
  const [cockpitWarning, setCockpitWarningLocal] = useState('');
  const [scannedTrees, setScannedTrees] = useState(0);
  const [flightTime, setFlightTime] = useState(0);

  // --- TELEMETRY ---
  const [telemetry, setTelemetry] = useState({
    x: homeWP.x, y: homeWP.y, alt: 0, speed: 0, pitch: 0, roll: 0, yaw: 145, bat: 84,
    lat: homeWP.lat, lon: homeWP.lon, mode: 'STANDBY', subState: 'NAV',
    timestamp: new Date().toLocaleTimeString(),
  });
  const [telemetryHistory, setTelemetryHistory] = useState([]);

  // --- AI VISION ---
  const [liveAiVision, setLiveAiVision] = useState({
    active: false, objectDetected: 'Menunggu Take-off...', isPalmFruit: false,
    condition: null, confidence: 0, boxPos: { top: 30, left: 40 },
  });

  // --- FLIGHT LOGS (local — akan di-persist ke DB via BL-09) ---
  const [flightLogs, setFlightLogs] = useState([
    { id: 'LOG-101', date: '10/04/2026 09:12:00', name: 'MISI-BlokA', nav: 'live_reckoning', scan: 'qlv', flightTime: 85, samples: 14, matang: 9, belumMatang: 5, batteryUsed: 0.85, accuracy: 92 },
    { id: 'LOG-102', date: '10/04/2026 10:30:00', name: 'MISI-BlokB', nav: 'dead_reckoning', scan: 'traditional', flightTime: 210, samples: 14, matang: 9, belumMatang: 5, batteryUsed: 2.10, accuracy: 98 },
    { id: 'LOG-103', date: '13/04/2026 00:53:18', name: 'WPTR', nav: 'hybrid', scan: 'traditional', flightTime: 96, samples: 25, matang: 16, belumMatang: 9, batteryUsed: 0.96, accuracy: 97 },
  ]);

  const targetAltitude = config.tinggiPohon + 15;

  // Internal helper warning
  const warnTemp = (msg, ms = 3000) => {
    setCockpitWarning(msg);
    setTimeout(() => setCockpitWarning(''), ms);
  };

  // ============================================================
  // ✅ AI SCAN HELPER — Panggil FastAPI dan update state
  // ============================================================

  /**
   * Ambil hasil AI dari FastAPI untuk TRAD mode (1 kamera).
   * Fire-and-forget — tidak blocking physics engine.
   */
  const fireAiScanTrad = () => {
    fetch(`${AI_SERVER_URL}/simulate`)
      .then(r => r.ok ? r.json() : Promise.reject('Server error'))
      .then(data => {
        const isMtg = data.prediction === 'Matang';
        if (isMtg) matangCountRef.current += 1;
        accuracyAccumRef.current += parseFloat(data.confidence) * 100;
        aiCallCountRef.current += 1;

        // Update live AI vision panel dengan hasil nyata
        setLiveAiVision({
          active: true,
          objectDetected: `Inspeksi 360°: ${data.prediction}`,
          isPalmFruit: true,
          condition: data.prediction,
          confidence: (parseFloat(data.confidence) * 100).toFixed(1),
          boxPos: { top: 25 + Math.random() * 15, left: 35 + Math.random() * 15 },
          filename: data.filename || null,
        });
      })
      .catch(() => {
        // 🔄 Fallback ke random jika FastAPI tidak running
        const isMtg = Math.random() > 0.35;
        if (isMtg) matangCountRef.current += 1;
        const fakeConf = (Math.random() * 10 + 89).toFixed(1);
        accuracyAccumRef.current += parseFloat(fakeConf);
        aiCallCountRef.current += 1;

        setLiveAiVision({
          active: true,
          objectDetected: `Inspeksi 360°: ${isMtg ? 'Matang' : 'Mentah'} (Offline)`,
          isPalmFruit: true,
          condition: isMtg ? 'Matang' : 'Mentah',
          confidence: fakeConf,
          boxPos: { top: 25 + Math.random() * 15, left: 35 + Math.random() * 15 },
        });
      });
  };

  /**
   * Ambil hasil AI dari FastAPI untuk QLV mode (2 kamera: kiri & kanan).
   * Fire-and-forget — tidak blocking physics engine.
   */
  const fireAiScanQlv = () => {
    fetch(`${AI_SERVER_URL}/simulate/dual`)
      .then(r => r.ok ? r.json() : Promise.reject('Server error'))
      .then(data => {
        const leftMtg  = data.left?.prediction  === 'Matang';
        const rightMtg = data.right?.prediction === 'Matang';
        if (leftMtg)  matangCountRef.current += 1;
        if (rightMtg) matangCountRef.current += 1;

        const leftConf  = parseFloat(data.left?.confidence  || 0) * 100;
        const rightConf = parseFloat(data.right?.confidence || 0) * 100;
        accuracyAccumRef.current += (leftConf + rightConf) / 2;
        aiCallCountRef.current += 1;

        // Tampilkan hasil kamera kiri (dominan) di panel
        const dominant = leftConf >= rightConf ? data.left : data.right;
        setLiveAiVision({
          active: true,
          objectDetected: `QLV L:${data.left?.prediction} | R:${data.right?.prediction}`,
          isPalmFruit: true,
          condition: dominant.prediction,
          confidence: (Math.max(leftConf, rightConf)).toFixed(1),
          boxPos: { top: 25 + Math.random() * 15, left: 35 + Math.random() * 15 },
        });
      })
      .catch(() => {
        // 🔄 Fallback ke random
        const l = Math.random() > 0.35;
        const r = Math.random() > 0.35;
        if (l) matangCountRef.current += 1;
        if (r) matangCountRef.current += 1;
        const fakeConf = (Math.random() * 10 + 89).toFixed(1);
        accuracyAccumRef.current += parseFloat(fakeConf);
        aiCallCountRef.current += 1;

        setLiveAiVision({
          active: true,
          objectDetected: `QLV L:${l ? 'Matang' : 'Mentah'} | R:${r ? 'Matang' : 'Mentah'} (Offline)`,
          isPalmFruit: true,
          condition: l ? 'Matang' : 'Mentah',
          confidence: fakeConf,
          boxPos: { top: 25 + Math.random() * 15, left: 35 + Math.random() * 15 },
        });
      });
  };

  // --- PHYSICS ENGINE (200ms interval) ---
  useEffect(() => {
    const interval = setInterval(() => {
      tickCountRef.current += 1;
      // Simulasi: physics jalan tanpa perlu koneksi hardware
      // Real: butuh setidaknya 1 koneksi aktif
      const isSimulasi = droneMode === 'simulasi';
      if (!droneMode || (!isSimulasi && !isTelemConnected && !isVideoConnected)) return;
      const status = flightStatusRef.current;
      const subState = autoSubStateRef.current;

      // ✅ Proses pending scan event SEBELUM setTelemetry (async, non-blocking)
      if (pendingScanEventRef.current) {
        const evt = pendingScanEventRef.current;
        pendingScanEventRef.current = null;
        if (evt === 'trad') fireAiScanTrad();
        else if (evt === 'qlv') fireAiScanQlv();
      }

      // AI Vision Update (saat tidak ada hasil real, tampilkan loading state)
      if (status === 'AUTO') {
        if (subState === 'SCAN_TRAD') {
          if (scanTimerRef.current <= 3) {
            setLiveAiVision({ active: true, objectDetected: 'Rotasi & Inspeksi 360°...', isPalmFruit: false, condition: null, confidence: 0, boxPos: { top: 30, left: 40 } });
          }
          // Hasil nyata akan di-set dari callback fireAiScanTrad() saat selesai
        } else if (subState === 'SCAN_QLV_CAPTURE') {
          if (scanTimerRef.current === 1) {
            setLiveAiVision({ active: true, objectDetected: 'Transmisi Gambar ke AI...', isPalmFruit: false, condition: null, confidence: 0, boxPos: { top: 30, left: 40 } });
          }
          // Hasil nyata akan di-set dari callback fireAiScanQlv() saat selesai
        } else {
          setLiveAiVision({ active: true, objectDetected: Math.random() > 0.8 ? 'Pelepah / Area Daun' : 'Menyusuri Koridor...', isPalmFruit: false, condition: null, confidence: 0, boxPos: { top: 30, left: 40 } });
        }
      } else if (status !== 'STANDBY') {
        setLiveAiVision({ active: true, objectDetected: status === 'TAKEOFF' ? 'Sistem Vision Siap...' : 'Manuver RTH...', isPalmFruit: false, condition: null, confidence: 0, boxPos: { top: 30, left: 40 } });
      } else {
        setLiveAiVision({ active: false, objectDetected: 'Menunggu Take-off...', isPalmFruit: false, condition: null, confidence: 0, boxPos: { top: 30, left: 40 } });
      }

      setTelemetry(prev => {
        let { x: newX, y: newY, alt: newAlt, speed: newSpeed, yaw: newYaw, bat: newBat } = prev;
        let newPitch = 0; let newRoll = 0;
        let curMode = flightStatusRef.current; let curSub = autoSubStateRef.current;
        newBat = prev.bat > 20 && curMode !== 'STANDBY' ? prev.bat - 0.002 : prev.bat;
        const spd = 2.0;

        if (curMode === 'STANDBY') { newAlt = Math.max(0, prev.alt - 0.5); newSpeed = 0; }
        else if (curMode === 'TAKEOFF') {
          newAlt = prev.alt + 1.5; newSpeed = 0;
          if (newAlt >= targetAltitude) { flightStatusRef.current = 'AUTO'; curMode = 'AUTO'; setFlightStatusUI('AUTO'); }
        }
        // ✅ TAKEOFF_MANUAL: naik ke 5m lalu masuk hover MANUAL
        else if (curMode === 'TAKEOFF_MANUAL') {
          const hoverAlt = 5.0;
          newAlt = Math.min(hoverAlt, prev.alt + 0.8);
          newSpeed = 0;
          if (newAlt >= hoverAlt) {
            flightStatusRef.current = 'MANUAL';
            curMode = 'MANUAL';
            setFlightStatusUI('MANUAL');
          }
        }
        // ✅ MANUAL: gerak sesuai input user dari manualInputRef
        else if (curMode === 'MANUAL') {
          const cmd = manualInputRef.current;
          const step = 3.0;   // meter/tick
          const turn = 12;    // derajat/tick
          manualInputRef.current = null; // consume
          if (cmd === 'throttle_up')        { newAlt = Math.min(prev.alt + 1.5, 80); }
          else if (cmd === 'throttle_down') { newAlt = Math.max(0, prev.alt - 1.5); }
          else if (cmd === 'pitch_forward') {
            const rad = (prev.yaw - 90) * Math.PI / 180;
            newX += step * Math.cos(rad); newY += step * Math.sin(rad);
            newPitch = 14; newSpeed = step * 5;
          }
          else if (cmd === 'pitch_backward') {
            const rad = (prev.yaw - 90) * Math.PI / 180;
            newX -= step * Math.cos(rad); newY -= step * Math.sin(rad);
            newPitch = -14; newSpeed = step * 5;
          }
          else if (cmd === 'roll_left') {
            const rad = (prev.yaw - 180) * Math.PI / 180;
            newX += step * Math.cos(rad); newY += step * Math.sin(rad);
            newRoll = -14; newSpeed = step * 5;
          }
          else if (cmd === 'roll_right') {
            const rad = prev.yaw * Math.PI / 180;
            newX += step * Math.cos(rad); newY += step * Math.sin(rad);
            newRoll = 14; newSpeed = step * 5;
          }
          else if (cmd === 'yaw_left')  { newYaw = (prev.yaw - turn + 360) % 360; }
          else if (cmd === 'yaw_right') { newYaw = (prev.yaw + turn) % 360; }
          else if (cmd === 'reset_attitude') { newPitch = 0; newRoll = 0; newSpeed = 0; }
          else { // hover: decelerate perlahan
            newSpeed = Math.max(0, prev.speed * 0.6);
            newPitch = prev.pitch * 0.5;
            newRoll  = prev.roll  * 0.5;
          }
        }
        else if (curMode === 'AUTO') {
          if (activePathRef.current.length > 0) {
            const targetWp = activePathRef.current[currentWpIndexRef.current];
            if (!targetWp) { flightStatusRef.current = 'RTL'; curMode = 'RTL'; setFlightStatusUI('RTL'); }
            else {
              if (curSub === 'NAV') {
                const dx = targetWp.x - newX; const dy = targetWp.y - newY; const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < spd) {
                  newX = targetWp.x; newY = targetWp.y; newSpeed = 0; baseYawRef.current = newYaw;
                  if (scanMode === 'qlv') { autoSubStateRef.current = 'SCAN_QLV_CAPTURE'; scanTimerRef.current = 0; }
                  else { autoSubStateRef.current = 'SCAN_TRAD'; scanTimerRef.current = 0; }
                } else {
                  let driftX = 0; let driftY = 0;
                  if (navAlgorithm === 'dead_reckoning') { driftX = Math.sin(tickCountRef.current * 0.5) * 0.5; driftY = Math.cos(tickCountRef.current * 0.3) * 0.5; }
                  newX += (dx / dist) * spd + driftX; newY += (dy / dist) * spd + driftY;
                  newSpeed = spd * (scanMode === 'qlv' ? 6.5 : 5); newYaw = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
                  newPitch = scanMode === 'qlv' ? 5.0 : (Math.random() * 4 - 2); newRoll = scanMode === 'qlv' ? 0 : (Math.random() * 4 - 2);
                }
                newAlt = targetAltitude + (scanMode === 'qlv' ? 0 : Math.sin(tickCountRef.current * 0.1) * 0.5);
              }
              else if (curSub === 'SCAN_TRAD') {
                newSpeed = 0; newYaw = (prev.yaw + 30) % 360; scanTimerRef.current += 1;
                if (scanTimerRef.current === 12) {
                  // ✅ Trigger async AI call untuk TRAD scan
                  pendingScanEventRef.current = 'trad';
                  scannedTreesRef.current += 1; setScannedTrees(scannedTreesRef.current);
                  currentWpIndexRef.current += 1; autoSubStateRef.current = 'NAV'; newYaw = baseYawRef.current;
                }
              }
              else if (curSub === 'SCAN_QLV_CAPTURE') {
                newSpeed = 0; newYaw = baseYawRef.current; scanTimerRef.current += 1;
                if (scanTimerRef.current > 4) {
                  // ✅ Trigger async AI call untuk QLV scan (2 pohon)
                  pendingScanEventRef.current = 'qlv';
                  const remaining = config.jumlahSampel - scannedTreesRef.current;
                  const toAdd = Math.min(2, Math.max(0, remaining));
                  scannedTreesRef.current += toAdd; setScannedTrees(scannedTreesRef.current);
                  currentWpIndexRef.current += 1; autoSubStateRef.current = 'NAV';
                }
              }
            }
          } else { flightStatusRef.current = 'RTL'; curMode = 'RTL'; setFlightStatusUI('RTL'); }
        }
        else if (curMode === 'RTL') {
          const dx = homeWP.x - newX; const dy = homeWP.y - newY; const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < spd * 2.5) { newX = homeWP.x; newY = homeWP.y; flightStatusRef.current = 'LANDING'; setFlightStatusUI('LANDING'); }
          else { newX += (dx / dist) * spd * 2.5; newY += (dy / dist) * spd * 2.5; newSpeed = spd * 12; newPitch = 8.0; newYaw = Math.atan2(dy, dx) * (180 / Math.PI) + 90; }
          newAlt = targetAltitude;
        }
        else if (curMode === 'LANDING') {
          newAlt = Math.max(0, newAlt - 1.0); newSpeed = 0;
          if (newAlt <= 0 && prev.alt > 0) {
            flightStatusRef.current = 'STANDBY'; setFlightStatusUI('STANDBY'); currentWpIndexRef.current = 0;
            const finalCount = scannedTreesRef.current;
            if (currentFlightInfoRef.current) {
              const fInfo = currentFlightInfoRef.current;

              // ✅ Gunakan hasil AI nyata, fallback ke estimasi jika AI tidak dipanggil
              const finalMatang = aiCallCountRef.current > 0
                ? matangCountRef.current
                : Math.floor(finalCount * 0.65);
              const finalBelum = finalCount - finalMatang;

              // ✅ Akurasi rata-rata dari seluruh scan AI session ini
              const acc = aiCallCountRef.current > 0
                ? Math.round(accuracyAccumRef.current / aiCallCountRef.current)
                : (fInfo.scan === 'qlv' ? Math.floor(Math.random() * 6) + 89 : Math.floor(Math.random() * 4) + 96);

              const newLog = {
                id: 'LOG-' + Date.now(),
                date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
                name: fInfo.name, nav: fInfo.nav, scan: fInfo.scan,
                samples: finalCount, matang: finalMatang, belumMatang: finalBelum,
                flightTime: flightTimeRef.current,
                batteryUsed: parseFloat((flightTimeRef.current * 0.01).toFixed(2)),
                accuracy: acc,
              };
              setFlightLogs(prev => [newLog, ...prev]);

              // ✅ Auto-save ke DB via useMissionManager
              setAutoSavePending({
                mission_name: fInfo.name,
                nav_algorithm: fInfo.nav,
                scan_mode: fInfo.scan,
                waypoints: fInfo.waypointSlim || [],
                path_data: fInfo.pathSlim || [],
                config_data: fInfo.configData || {},
                status: 'Completed',
                samples_count: finalCount,
                matang_count: finalMatang,
                accuracy: acc,
                flight_time: flightTimeRef.current,
              });
              currentFlightInfoRef.current = null;
            }
          }
        }

        const newLat = BASE_LAT - (newY * METER_TO_DEG);
        const newLon = BASE_LON + (newX * METER_TO_DEG);
        const timestamp = new Date().toLocaleTimeString();
        const newTelem = { x: newX, y: newY, alt: newAlt, speed: newSpeed, pitch: newPitch, roll: newRoll, yaw: newYaw, bat: newBat, lat: newLat, lon: newLon, mode: curMode, subState: autoSubStateRef.current, timestamp };
        if (tickCountRef.current % 5 === 0) setTelemetryHistory(h => [newTelem, ...h].slice(0, 100));
        return newTelem;
      });

      if (tickCountRef.current % 5 === 0 && flightStatusRef.current !== 'STANDBY') {
        flightTimeRef.current += 1;
        setFlightTime(flightTimeRef.current);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [droneMode, isTelemConnected, isVideoConnected, targetAltitude, waypoints, qlvPath, tradPath, scanMode, navAlgorithm, config.jumlahSampel]);

  // --- FLIGHT CONTROLS ---
  const handleStartFlight = () => {
    if (!droneMode) { setCockpitWarning('Pilih Mode Sistem!'); setTimeout(() => setCockpitWarning(''), 3000); return; }
    if (!navAlgorithm || !scanMode) { setCockpitWarning('Algoritma Scan Kosong!'); setTimeout(() => setCockpitWarning(''), 3000); return; }
    if (scanMode === 'traditional' && waypoints.length !== 3) { setCockpitWarning('Pilih 3 Pohon (Awal L1, Akhir L1, Lajur 2)!'); setTimeout(() => setCockpitWarning(''), 3000); return; }
    if (scanMode === 'qlv' && waypoints.length === 0) { setCockpitWarning('Pilih 1 Pohon Awal untuk QLV!'); setTimeout(() => setCockpitWarning(''), 3000); return; }
    const path = scanMode === 'qlv' ? qlvPath : scanMode === 'traditional' ? tradPath : waypoints;
    activePathRef.current = path;
    currentFlightInfoRef.current = {
      name: missionName || 'Misi Tanpa Nama',
      nav: navAlgorithm,
      scan: scanMode,
      waypointSlim: waypoints.map(wp => ({ id: wp.id, row: wp.row, x: wp.x, y: wp.y })),
      pathSlim: path.map(p => ({ x: p.x, y: p.y })),
      configData: { namaBlok: config.namaBlok, luasKebun: config.luasKebun, totalPohon: config.totalPohon },
    };

    // ✅ Reset semua akkumulator AI sebelum misi baru
    currentWpIndexRef.current = 0; flightTimeRef.current = 0; scannedTreesRef.current = 0;
    matangCountRef.current = 0; accuracyAccumRef.current = 0; aiCallCountRef.current = 0;
    pendingScanEventRef.current = null;

    setScannedTrees(0); setFlightTime(0); autoSubStateRef.current = 'NAV';
    flightStatusRef.current = 'TAKEOFF'; setFlightStatusUI('TAKEOFF');
  };

  const handleRTH = () => {
    if (flightStatusRef.current === 'STANDBY') { setCockpitWarning('Drone belum terbang!'); setTimeout(() => setCockpitWarning(''), 3000); return; }
    flightStatusRef.current = 'RTL'; setFlightStatusUI('RTL');
  };

  // Reset state penerbangan ke posisi home
  const resetFlightState = (setTelemetryOverride) => {
    flightStatusRef.current = 'STANDBY'; setFlightStatusUI('STANDBY');
    flightTimeRef.current = 0; scannedTreesRef.current = 0;
    matangCountRef.current = 0; accuracyAccumRef.current = 0; aiCallCountRef.current = 0;
    setScannedTrees(0); setFlightTime(0);
    setLiveAiVision({ active: false, objectDetected: 'Menunggu Take-off...', isPalmFruit: false, condition: null, confidence: 0, boxPos: { top: 30, left: 40 } });
    setTelemetry(prev => ({ ...prev, x: homeWP.x, y: homeWP.y, lat: homeWP.lat, lon: homeWP.lon, alt: 0, pitch: 0, roll: 0, speed: 0, subState: 'NAV' }));
  };

  return {
    // Refs
    flightStatusRef,
    manualInputRef,     // ✅ digunakan oleh handleDroneCommand di AppGCS
    // UI States
    flightStatusUI, setFlightStatusUI,
    cockpitWarning, setCockpitWarning,
    scannedTrees, setScannedTrees,
    flightTime, setFlightTime,
    // Telemetry
    telemetry, setTelemetry,
    telemetryHistory,
    // AI Vision
    liveAiVision, setLiveAiVision,
    // Flight Logs
    flightLogs, setFlightLogs,
    // Controls
    handleStartFlight,
    handleRTH,
    resetFlightState,
    // Computed
    targetAltitude,
  };
}
