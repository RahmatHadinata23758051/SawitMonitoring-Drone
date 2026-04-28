import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Battery, Signal, Wifi, Navigation, Activity,
  Crosshair, Map as MapIcon, Power, Play, Square,
  Home, Settings, Camera, BarChart3, Trash2, Send, MapPin,
  CheckCircle2, AlertCircle, Save, TreeDeciduous, Lock, Unlock,
  MousePointerClick, TableProperties, Minus, Maximize2, Minimize2, X, Clock, Compass, GaugeCircle, Archive, Database, Edit, ChevronDown, Radio, Video, Bot, SendHorizontal, Loader2, ListTree, CheckSquare, Download, Plane, Cpu, MonitorPlay, Moon, Sun, Palette, FileText, ClipboardList, TrendingUp, PieChart, LayoutDashboard, AlertTriangle
} from 'lucide-react';

import { homeWP, BASE_LAT, BASE_LON, METER_TO_DEG } from './utils/gcsConstants';
import { generateTreeGrid, generateQLVPath, getQLVTargetTrees, generateTradPath, buildPathString } from './utils/pathGenerator';
import { exportBlokKebun, exportTelemetry, exportFlightReport, formatFlightTime } from './utils/missionFormatter';
import { useAppSettings } from './hooks/useAppSettings';
import { useSerialPort } from './hooks/useSerialPort';
import { useMissionManager } from './hooks/useMissionManager';
import { useFlightControl } from './hooks/useFlightControl';
import GCSHeader from './components/GCSHeader';
import GCSLeftPanel from './components/GCSLeftPanel';
import GCSCockpit from './components/GCSCockpit';
import GCSMapPanel from './components/GCSMapPanel';
import GCSRightPanel from './components/GCSRightPanel';
import GCSSettingsModal from './components/GCSSettingsModal';
import GCSReportsModal from './components/GCSReportsModal';
import GCSCameraPanel from './components/GCSCameraPanel';


const AppGCS = () => {
  // ============================================
  // ORCHESTRATION STATE (tidak masuk ke hook)
  // ============================================

  // Tema & Fullscreen
  const [theme, setTheme] = useState('light');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const t = (darkClass, lightClass) => lightClass; // always light mode
  const toggleFullScreen = () => setIsFullscreen(!isFullscreen);

  // PiP Camera floating state
  const [isPipVisible, setIsPipVisible] = useState(false);
  const [pipPos, setPipPos] = useState({ x: 16, y: 16 });
  const pipDragRef = useRef(null);
  const pipRef = useRef(null);
  const handlePipMouseDown = useCallback((e) => {
    e.preventDefault();
    const startX = e.clientX - pipPos.x;
    const startY = e.clientY - pipPos.y;
    const onMove = (me) => setPipPos({ x: me.clientX - startX, y: me.clientY - startY });
    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [pipPos]);

  // Popup notifikasi error
  const [alertPopup, setAlertPopup] = useState(null);

  // Mode drone (simulasi / real) — default ke simulasi agar langsung bisa dipakai
  const [droneMode, setDroneMode] = useState('simulasi');

  // Settings Modal & Laporan
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeSettingNode, setActiveSettingNode] = useState('mode');
  const [isReportsOpen, setIsReportsOpen] = useState(false);

  // Drone Management (D1: load dari API)
  const [drones, setDrones] = useState([]);
  const [dronesLoading, setDronesLoading] = useState(true);
  const [selectedUploadDrone, setSelectedUploadDrone] = useState('');
  const [droneForm, setDroneForm] = useState({ id: '', merk: '', status: 'Standby' });
  const [isEditingDrone, setIsEditingDrone] = useState(false);

  useEffect(() => {
    fetch('/api/perangkat')
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setDrones(data);
        else setDrones([
          { id: 'DRN-001', merk: 'DJI Matrice 300 RTK', status: 'Standby' },
          { id: 'DRN-002', merk: 'SawitV1 Custom Quad', status: 'Maintenance' },
        ]);
      })
      .catch(() => setDrones([{ id: 'DRN-001', merk: 'DJI Matrice 300 RTK (Demo)', status: 'Standby' }]))
      .finally(() => setDronesLoading(false));
  }, []);

  // Parameter Kebun
  const [config, setConfig] = useState({
    id: 'BLK-' + Date.now(), namaBlok: 'Blok A-01',
    luasKebun: 1.0, totalPohon: 140, jumlahSampel: 14, tinggiPohon: 8.5,
  });
  const [managedBlocks, setManagedBlocks] = useState([]);

  useEffect(() => {
    fetch('/api/kebun')
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setManagedBlocks(data);
        else setManagedBlocks([{ id: 'BLK-1001', namaBlok: 'Blok A-01 (Demo)', luasKebun: 1.0, totalPohon: 140, tinggiPohon: 8.5, jumlahSampel: 14, status: 'Tersimpan' }]);
      })
      .catch(() => setManagedBlocks([{ id: 'BLK-1001', namaBlok: 'Blok A-01 (Demo)', luasKebun: 1.0, totalPohon: 140, tinggiPohon: 8.5, jumlahSampel: 14, status: 'Tersimpan' }]));
  }, []);

  // Tabs & Map
  const [activeTab, setActiveTab] = useState('current');
  const [activeMapTab, setActiveMapTab] = useState('map');
  const [isMapActive, setIsMapActive] = useState(false);
  const [isMissionSaved, setIsMissionSaved] = useState(false);

  // Algoritma & Mode Scan
  const [navAlgorithm, setNavAlgorithm] = useState('');
  const [scanMode, setScanMode] = useState('');

  // Waypoints & Mission
  const [waypoints, setWaypoints] = useState([]);
  const [warning, setWarning] = useState('');
  const [missionName, setMissionName] = useState('');

  // Gemini AI Assistant
  const [aiInput, setAiInput] = useState('');
  const [aiHistory, setAiHistory] = useState([
    { role: 'ai', text: 'Sistem AI aktif. Apa yang ingin Anda ketahui tentang misi drone ini?' }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatEndRef = useRef(null);

  // ============================================
  // CUSTOM HOOKS â€” BL-08b (wired here, full integration di BL-08d)
  // ============================================

  // App Settings (branding + tab title sync) â€” AKTIF
  const { appSettings } = useAppSettings();

  // useSerialPort, useFlightControl, useMissionManager
  // âš ï¸ Akan disambungkan penuh di BL-08c + BL-08d saat component extraction.
  // Saat ini semua state & handler masih inline di bawah (agar tidak ada circular dep).

  // ============================================
  // INLINE STATE (masih inline sampai BL-08d)
  // ============================================

  // Telemetry / Video / Serial
  const [webcamStream, setWebcamStream] = useState(null);
  const videoRef = useRef(null);
  const [telemBaud, setTelemBaud] = useState('57600');
  const [isTelemConnected, setIsTelemConnected] = useState(false);
  const serialPortRef = useRef(null);
  const serialReaderRef = useRef(null);
  const [videoIp, setVideoIp] = useState('192.168.1.100');
  const [videoProtocol, setVideoProtocol] = useState('mjpeg');
  const [hlsUrl, setHlsUrl] = useState('/streams/drone.m3u8');
  const [isVideoConnected, setIsVideoConnected] = useState(false);
  const [liveStreamUrl, setLiveStreamUrl] = useState('');

  // Flight Status Refs
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

  // ✅ AI Result Accumulators
  const matangCountRef = useRef(0);
  const accuracyAccumRef = useRef(0);
  const aiCallCountRef = useRef(0);
  const pendingScanEventRef = useRef(null); // 'trad' | 'qlv' | null

  // ✅ Manual drone control input (simulasi mode)
  const manualInputRef = useRef(null); // throttle_up | pitch_forward | roll_left | yaw_left | etc.

  // Flight UI State
  const [flightStatusUI, setFlightStatusUI] = useState('STANDBY');
  const [cockpitWarning, setCockpitWarning] = useState('');
  const [scannedTrees, setScannedTrees] = useState(0);
  const [flightTime, setFlightTime] = useState(0);

  // AI Vision
  const [liveAiVision, setLiveAiVision] = useState({
    active: false, objectDetected: 'Menunggu Take-off...', isPalmFruit: false,
    condition: null, confidence: 0, boxPos: { top: 30, left: 40 },
    mode: 'single', image_base64: null, left: null, right: null,
  });

  // Flight Logs — BL-09: load dari DB, kosong di awal
  const [flightLogs, setFlightLogs] = useState([]);

  // BL-09: Load flight logs dari DB saat mount
  useEffect(() => {
    fetch('/api/flight-logs')
      .then(r => r.ok ? r.json() : [])
      .then(data => { if (Array.isArray(data) && data.length > 0) setFlightLogs(data); })
      .catch(() => { });
  }, []);

  // Telemetry
  const [telemetryHistory, setTelemetryHistory] = useState([]);
  const telemetryHistoryRef = useRef([]);
  const [telemetry, setTelemetry] = useState({
    x: homeWP.x, y: homeWP.y, alt: 0, speed: 0, pitch: 0, roll: 0, yaw: 145, bat: 84,
    lat: homeWP.lat, lon: homeWP.lon, mode: 'STANDBY', subState: 'NAV', timestamp: new Date().toLocaleTimeString(),
  });

  // Mission State
  const [savedMissions, setSavedMissions] = useState([]);
  const [selectedMissionId, setSelectedMissionId] = useState(null);
  const [editingMissionId, setEditingMissionId] = useState(null);
  const [autoSavePending, setAutoSavePending] = useState(null);

  // D2: Load rekap misi dari Laravel /missions
  useEffect(() => {
    fetch('/missions')
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map(m => {
            const fallbackConfig = { namaBlok: 'Blok A-01', luasKebun: 1.0, totalPohon: 140, tinggiPohon: 8.5, jumlahSampel: 14 };
            const mConfig = m.config_data && Object.keys(m.config_data).length > 0 ? m.config_data : fallbackConfig;
            return {
              id: `MSN-${m.id}`, name: m.mission_name, algorithm: m.nav_algorithm, scan: m.scan_mode,
              wpCount: m.scan_mode === 'qlv' ? '1 Koridor' : '2 Lajur',
              date: new Date(m.created_at).toLocaleString(),
              waypointsData: Array.isArray(m.waypoints) ? m.waypoints : [],
              configData: mConfig, _dbId: m.id,
            };
          });
          setSavedMissions(mapped);
        }
      })
      .catch(() => { });
  }, []);

  // useEffects: webcam, chat scroll, auto-save, serial, video handlers
  useEffect(() => { if (videoRef.current && webcamStream) videoRef.current.srcObject = webcamStream; }, [webcamStream, isSettingsOpen]);
  useEffect(() => { if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, [aiHistory]);
  useEffect(() => {
    if (isVideoConnected && (droneMode === 'simulasi' || videoProtocol === 'dummy')) {
      // getUserMedia hanya bisa berjalan di HTTPS atau localhost
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
        const isHttps = window.location.protocol === 'https:';
        if (!isLocalhost && !isHttps) {
          setAlertPopup({
            title: 'Akses Kamera Diblokir Browser',
            message: `Fitur webcam memerlukan koneksi HTTPS atau localhost. Saat ini Anda mengakses via: ${window.location.origin}. Gunakan http://localhost:8000 atau aktifkan HTTPS.`,
          });
        } else {
          setAlertPopup({ title: 'Webcam Tidak Didukung', message: 'Browser ini tidak mendukung akses kamera (getUserMedia).' });
        }
        setIsVideoConnected(false);
        return;
      }
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(s => setWebcamStream(s))
        .catch((err) => {
          let msg = 'Gagal mengakses kamera laptop.';
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            msg = 'Izin kamera ditolak. Klik ikon kunci/kamera di address bar browser, lalu izinkan akses kamera.';
          } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            msg = 'Tidak ada kamera yang terdeteksi di perangkat ini.';
          } else if (err.name === 'NotReadableError') {
            msg = 'Kamera sedang digunakan oleh aplikasi lain.';
          }
          setAlertPopup({ title: 'Webcam Gagal Aktif', message: msg });
          setIsVideoConnected(false);
        });
    }
    if (!isVideoConnected && webcamStream) { webcamStream.getTracks().forEach(t => t.stop()); setWebcamStream(null); }
  }, [droneMode, isVideoConnected, videoProtocol]);

  useEffect(() => {
    if (!autoSavePending) return;
    const payload = autoSavePending;
    const csrf = document.querySelector('meta[name="csrf-token"]')?.content || '';
    fetch('/missions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf }, body: JSON.stringify(payload) })
      .then(res => {
        if (res.ok) return res.json().then(result => {
          const dbId = result?.data?.id;
          const newId = dbId ? `MSN-${String(dbId).padStart(4, '0')}` : `MSN-${Date.now()}`;
          setSavedMissions(prev => [{ id: newId, _dbId: dbId, name: payload.mission_name, wpCount: payload.scan_mode === 'qlv' ? '1 Koridor' : '2 Lajur', algorithm: payload.nav_algorithm, scan: payload.scan_mode, date: new Date().toLocaleTimeString(), status: 'Completed' }, ...prev]);
          setCockpitWarning(`âœ… Misi "${payload.mission_name}" tercatat otomatis! ID: ${newId}`);
          setTimeout(() => setCockpitWarning(''), 4000);
        });
        else { setCockpitWarning('âš ï¸ Gagal tersimpan ke server!'); setTimeout(() => setCockpitWarning(''), 4000); }
      })
      .catch(() => { setCockpitWarning('âš ï¸ Tidak dapat terhubung ke server!'); setTimeout(() => setCockpitWarning(''), 4000); })
      .finally(() => setAutoSavePending(null));
  }, [autoSavePending]);

  const handleConnectTelemetry = async () => {
    if (isTelemConnected) {
      try { if (serialReaderRef.current) await serialReaderRef.current.cancel(); if (serialPortRef.current) await serialPortRef.current.close(); }
      catch (e) { console.error(e); } finally { serialPortRef.current = null; serialReaderRef.current = null; setIsTelemConnected(false); setCockpitWarning('Telemetri Terputus'); setTimeout(() => setCockpitWarning(''), 3000); }
    } else {
      if (droneMode === 'simulasi') { setIsTelemConnected(true); setCockpitWarning('Simulasi Telemetri Aktif!'); setTimeout(() => setCockpitWarning(''), 3000); }
      else if (droneMode === 'real') {
        try {
          if (!('serial' in navigator)) { setAlertPopup({ title: 'Tidak Didukung', message: 'Browser ini tidak mendukung Web Serial API.' }); return; }
          const port = await navigator.serial.requestPort(); await port.open({ baudRate: parseInt(telemBaud) });
          serialPortRef.current = port; setIsTelemConnected(true); setCockpitWarning('Hardware Serial Terhubung!'); setTimeout(() => setCockpitWarning(''), 3000);
        } catch (error) {
          let msg = error.message || 'Gagal mengakses perangkat serial.';
          if (error.name === 'SecurityError') { msg = 'Akses diblokir. Beralih ke mode simulasi.'; setIsTelemConnected(true); }
          else if (error.name === 'NotFoundError') msg = 'Tidak ada perangkat USB/Serial yang dipilih.';
          setAlertPopup({ title: 'Info Koneksi', message: msg });
        }
      } else { setCockpitWarning('Pilih Mode Sistem Dahulu!'); setTimeout(() => setCockpitWarning(''), 3000); }
    }
  };
  const handleConnectVideo = () => {
    if (isVideoConnected) {
      setIsVideoConnected(false);
      setLiveStreamUrl('');
      if (webcamStream) { webcamStream.getTracks().forEach(t => t.stop()); setWebcamStream(null); }
    } else {
      // Dummy mode: aktifkan webcam laptop tanpa perlu droneMode
      if (videoProtocol === 'dummy') {
        setIsVideoConnected(true);
        setCockpitWarning('Webcam Laptop (Dummy) Aktif!');
        setTimeout(() => setCockpitWarning(''), 3000);
        return;
      }
      if (droneMode === 'simulasi') {
        setIsVideoConnected(true);
      } else if (droneMode === 'real') {
        if (videoProtocol === 'mjpeg') {
          setLiveStreamUrl(`http://${videoIp}:81/stream`);
        } else {
          setLiveStreamUrl(hlsUrl);
        }
        setIsVideoConnected(true);
      } else {
        setCockpitWarning('Pilih Mode Sistem Dahulu!');
        setTimeout(() => setCockpitWarning(''), 3000);
      }
    }
  };
  const [droneFlightState, setDroneFlightState] = useState('DISARMED'); // DISARMED | FLYING

  const handleDroneCommand = async (command) => {
    // ============================================================
    // SIMULASI MODE (atau belum pilih mode): handle lokal
    // ============================================================
    const effectiveMode = droneMode || 'simulasi'; // fallback ke simulasi
    if (effectiveMode === 'simulasi') {
      if (command === 'arm') {
        if (droneFlightState === 'DISARMED') {
          setDroneFlightState('FLYING');
          // Jika drone belum terbang, arm → mode MANUAL (hover manual)
          if (flightStatusRef.current === 'STANDBY') {
            flightStatusRef.current = 'MANUAL';
            setFlightStatusUI('MANUAL');
            flightTimeRef.current = 0;
            setFlightTime(0);
            setCockpitWarning('⚡ ARM → Manual Control Aktif!');
            setTimeout(() => setCockpitWarning(''), 2500);
          }
        }
        return;
      }
      if (command === 'takeoff') {
        if (flightStatusRef.current === 'MANUAL' || flightStatusRef.current === 'STANDBY') {
          flightStatusRef.current = 'TAKEOFF_MANUAL';
          setFlightStatusUI('TAKEOFF');
          setCockpitWarning('🚀 Takeoff...');
          setTimeout(() => setCockpitWarning(''), 2000);
        }
        return;
      }
      if (command === 'land') {
        if (flightStatusRef.current !== 'STANDBY') {
          flightStatusRef.current = 'LANDING';
          setFlightStatusUI('LANDING');
          setCockpitWarning('🛬 Landing...');
          setTimeout(() => setCockpitWarning(''), 2000);
        }
        return;
      }
      if (command === 'disarm' || command === 'emergency') {
        flightStatusRef.current = 'STANDBY';
        setFlightStatusUI('STANDBY');
        setDroneFlightState('DISARMED');
        manualInputRef.current = null;
        setCockpitWarning(command === 'emergency' ? '🚨 EMERGENCY STOP!' : 'DISARMED');
        setTimeout(() => setCockpitWarning(''), 2500);
        return;
      }
      // Manual movement commands — hanya aktif saat MANUAL/TAKEOFF_MANUAL
      const manualModes = ['MANUAL', 'TAKEOFF_MANUAL'];
      if (manualModes.includes(flightStatusRef.current)) {
        manualInputRef.current = command;
      } else {
        setCockpitWarning('ARM drone dulu untuk manual control!');
        setTimeout(() => setCockpitWarning(''), 2000);
      }
      return;
    }

    // ============================================================
    // REAL MODE: kirim ke hardware via /drone/control API
    // ============================================================
    if (droneMode !== 'real') {
      setCockpitWarning('Pilih Mode Sistem Dahulu!');
      setTimeout(() => setCockpitWarning(''), 3000);
      return;
    }
    try {
      const csrfMeta = document.querySelector('meta[name="csrf-token"]');
      const csrf = csrfMeta ? csrfMeta.getAttribute('content') : '';
      const res = await fetch('/drone/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf },
        body: JSON.stringify({ command }),
      });
      const data = await res.json();
      // Drone server offline → status: 'offline'
      if (data?.status === 'offline') {
        setCockpitWarning('⚠️ Drone server offline! Perintah tidak terkirim.');
        setTimeout(() => setCockpitWarning(''), 4000);
        return;
      }
      if (data?.status === 'error') {
        setCockpitWarning('⚠️ ' + (data.message ?? 'Drone error'));
        setTimeout(() => setCockpitWarning(''), 4000);
        return;
      }
      // Success
      if (command === 'arm') setDroneFlightState('FLYING');

      if (['land', 'disarm', 'emergency'].includes(command)) setDroneFlightState('DISARMED');
    } catch (err) {
      setCockpitWarning('Gagal kirim perintah ke drone!');
      setTimeout(() => setCockpitWarning(''), 3000);
      console.error('Drone control error:', err);
    }
  };
  const formatTime = formatFlightTime;

  // --- GEMINI AI ASSISTANT ---
  const handleAskGemini = async () => {
    if (!aiInput.trim()) return;
    const userText = aiInput; setAiInput('');
    setAiHistory(prev => [...prev, { role: 'user', text: userText }]); setIsAiLoading(true);
    const apiKey = "";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const payload = { contents: [{ parts: [{ text: `Kamu asisten AI teknis GCS Drone Perkebunan Sawit. Jawab ringkas dan profesional dalam bahasa Indonesia. Pertanyaan: ${userText}` }] }] };
    let retries = 0; const delays = [1000, 2000, 4000, 8000, 16000]; let success = false;
    while (retries <= 4 && !success) {
      try {
        const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Maaf, tidak dapat merespons saat ini.';
        setAiHistory(prev => [...prev, { role: 'ai', text }]); success = true;
      } catch (e) {
        if (retries < 4) { await new Promise(r => setTimeout(r, delays[retries])); retries++; }
        else { setAiHistory(prev => [...prev, { role: 'ai', text: 'Gagal terhubung ke server AI.' }]); break; }
      }
    }
    setIsAiLoading(false);
  };

  // --- KALKULASI GRID POHON HEKSAGONAL ---
  const { trees, max_x, max_y } = useMemo(() => generateTreeGrid(config),
    [config.luasKebun, config.totalPohon, config.tinggiPohon]);

  // --- AUTO PATH QLV ---
  const qlvPath = useMemo(() =>
    scanMode === 'qlv' ? generateQLVPath({ waypoints, trees, jumlahSampel: config.jumlahSampel }) : [],
    [waypoints, scanMode, trees, config.jumlahSampel]);

  // --- TARGET POHON QLV ---
  const qlvTargetTrees = useMemo(() =>
    scanMode === 'qlv' ? getQLVTargetTrees({ waypoints, qlvPath, trees, jumlahSampel: config.jumlahSampel }) : [],
    [waypoints, qlvPath, scanMode, trees, config.jumlahSampel]);

  // --- AUTO PATH TRADISIONAL ---
  const tradPath = useMemo(() =>
    scanMode === 'traditional' ? generateTradPath({ waypoints, trees }) : [],
    [waypoints, scanMode, trees]);

  const targetAltitude = config.tinggiPohon + 15;
  const mapWidth = max_x + 85; const mapHeight = max_y + 60;
  const radarLeft = Math.max(5, Math.min(95, ((telemetry.x + 35) / mapWidth) * 100));
  const radarTop = Math.max(5, Math.min(95, ((telemetry.y + 20) / mapHeight) * 100));

  // ✅ AI SERVER URL
  const AI_SERVER_URL = 'http://127.0.0.1:8001';

  // ✅ AI Scan helper — TRAD mode (1 kamera)
  const fireAiScanTrad = () => {
    fetch(`${AI_SERVER_URL}/simulate`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        if (data.prediction === 'Matang') matangCountRef.current += 1;
        accuracyAccumRef.current += parseFloat(data.confidence) * 100;
        aiCallCountRef.current += 1;
        setLiveAiVision({
          active: true, objectDetected: `Inspeksi 360°: ${data.prediction}`,
          isPalmFruit: true, condition: data.prediction,
          confidence: (parseFloat(data.confidence) * 100).toFixed(1),
          boxPos: { top: 25 + Math.random() * 15, left: 35 + Math.random() * 15 },
          mode: 'single', image_base64: data.image_base64 || null, left: null, right: null,
        });
      })
      .catch(() => {
        const isMtg = Math.random() > 0.35;
        if (isMtg) matangCountRef.current += 1;
        const fakeConf = (Math.random() * 10 + 89).toFixed(1);
        accuracyAccumRef.current += parseFloat(fakeConf);
        aiCallCountRef.current += 1;
        setLiveAiVision({
          active: true, objectDetected: `Inspeksi 360°: ${isMtg ? 'Matang' : 'Mentah'} (Offline)`,
          isPalmFruit: true, condition: isMtg ? 'Matang' : 'Mentah',
          confidence: fakeConf,
          boxPos: { top: 25 + Math.random() * 15, left: 35 + Math.random() * 15 },
          mode: 'single', image_base64: null, left: null, right: null,
        });
      });
  };

  // ✅ AI Scan helper — QLV mode (2 kamera: kiri & kanan)
  const fireAiScanQlv = () => {
    fetch(`${AI_SERVER_URL}/simulate/dual`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        if (data.left?.prediction === 'Matang') matangCountRef.current += 1;
        if (data.right?.prediction === 'Matang') matangCountRef.current += 1;
        const leftConf = parseFloat(data.left?.confidence || 0) * 100;
        const rightConf = parseFloat(data.right?.confidence || 0) * 100;
        accuracyAccumRef.current += (leftConf + rightConf) / 2;
        aiCallCountRef.current += 1;
        setLiveAiVision({
          active: true, objectDetected: `QLV: L=${data.left?.prediction} | R=${data.right?.prediction}`,
          isPalmFruit: true, condition: leftConf >= rightConf ? data.left?.prediction : data.right?.prediction,
          confidence: Math.max(leftConf, rightConf).toFixed(1),
          boxPos: { top: 25 + Math.random() * 15, left: 35 + Math.random() * 15 },
          mode: 'dual', image_base64: null,
          left: { prediction: data.left?.prediction, confidence_pct: leftConf.toFixed(1), image_base64: data.left?.image_base64 || null },
          right: { prediction: data.right?.prediction, confidence_pct: rightConf.toFixed(1), image_base64: data.right?.image_base64 || null },
        });
      })
      .catch(() => {
        const l = Math.random() > 0.35; const r = Math.random() > 0.35;
        if (l) matangCountRef.current += 1;
        if (r) matangCountRef.current += 1;
        const fakeConf = (Math.random() * 10 + 89).toFixed(1);
        accuracyAccumRef.current += parseFloat(fakeConf);
        aiCallCountRef.current += 1;
        setLiveAiVision({
          active: true, objectDetected: `QLV: L=${l ? 'Matang' : 'Mentah'} | R=${r ? 'Matang' : 'Mentah'} (Offline)`,
          isPalmFruit: true, condition: l ? 'Matang' : 'Mentah',
          confidence: fakeConf,
          boxPos: { top: 25 + Math.random() * 15, left: 35 + Math.random() * 15 },
          mode: 'dual', image_base64: null,
          left: { prediction: l ? 'Matang' : 'Mentah', confidence_pct: fakeConf, image_base64: null },
          right: { prediction: r ? 'Matang' : 'Mentah', confidence_pct: fakeConf, image_base64: null },
        });
      });
  };

  // --- PHYSICS ENGINE (200ms) ---
  useEffect(() => {
    const interval = setInterval(() => {
      tickCountRef.current += 1;
      // Simulasi: physics berjalan tanpa perlu koneksi hardware
      // Real: butuh setidaknya satu koneksi aktif
      const isSimulasi = droneMode === 'simulasi';
      if (!droneMode || (!isSimulasi && !isTelemConnected && !isVideoConnected)) return;
      const status = flightStatusRef.current; const subState = autoSubStateRef.current;

      // ✅ Process pending AI scan event (fire-and-forget)
      if (pendingScanEventRef.current) {
        const evt = pendingScanEventRef.current;
        pendingScanEventRef.current = null;
        if (evt === 'trad') fireAiScanTrad();
        else if (evt === 'qlv') fireAiScanQlv();
      }

      // AI Vision loading states (hasil nyata dari fireAiScan callbacks)
      if (status === 'AUTO') {
        if (subState === 'SCAN_TRAD') {
          if (scanTimerRef.current <= 1) {
            // Tick pertama: tunjukkan loading tapi TETAP preservasi gambar pohon sebelumnya
            setLiveAiVision(prev => ({ ...prev, active: true, objectDetected: 'Rotasi & Inspeksi 360°...', isPalmFruit: prev.isPalmFruit, condition: prev.condition, confidence: prev.confidence }));
          }
          // Tick 2+: AI callback akan set gambar baru, tidak perlu set apapun di sini
        } else if (subState === 'SCAN_QLV_CAPTURE') {
          if (scanTimerRef.current === 1) {
            setLiveAiVision(prev => ({ ...prev, active: true, objectDetected: 'Drone berhenti — Transmisi ke AI Server...' }));
          }
        } else {
          // NAV state: PRESERVASI gambar terakhir, hanya update status teks
          setLiveAiVision(prev => ({
            ...prev,
            active: true,
            objectDetected: Math.random() > 0.8 ? 'Pelepah / Area Daun' : 'Menyusuri Koridor...'
          }));
        }
      } else if (status === 'MANUAL' || status === 'TAKEOFF_MANUAL') {
        setLiveAiVision(prev => ({ ...prev, active: true, objectDetected: status === 'TAKEOFF_MANUAL' ? '🚀 Takeoff Manual...' : '🕹️ Mode Manual — Kontrol Aktif' }));
      } else if (status !== 'STANDBY') {
        setLiveAiVision(prev => ({ ...prev, active: true, objectDetected: status === 'TAKEOFF' ? 'Sistem Vision Siap...' : 'Manuver RTH...' }));
      } else {
        setLiveAiVision({ active: false, objectDetected: 'Menunggu Take-off...', isPalmFruit: false, condition: null, confidence: 0, boxPos: { top: 30, left: 40 }, mode: 'single', image_base64: null, left: null, right: null });
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
        // ✅ TAKEOFF_MANUAL: naik ke ketinggian 5m lalu masuk MANUAL hover
        else if (curMode === 'TAKEOFF_MANUAL') {
          const manualHoverAlt = 5.0;
          newAlt = Math.min(manualHoverAlt, prev.alt + 0.8);
          newSpeed = 0;
          if (newAlt >= manualHoverAlt) {
            flightStatusRef.current = 'MANUAL';
            curMode = 'MANUAL';
            setFlightStatusUI('MANUAL');
          }
        }
        // ✅ MANUAL: user-controlled movement via manualInputRef
        else if (curMode === 'MANUAL') {
          const cmd = manualInputRef.current;
          const step = 3.0; // meter per tick
          const turnStep = 12; // derajat per tick
          manualInputRef.current = null; // consume command
          if (cmd === 'throttle_up') { newAlt = Math.min(prev.alt + 1.5, 80); newPitch = 0; newRoll = 0; newSpeed = 0; }
          else if (cmd === 'throttle_down') { newAlt = Math.max(0, prev.alt - 1.5); newPitch = 0; newRoll = 0; newSpeed = 0; }
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
          else if (cmd === 'yaw_left') { newYaw = (prev.yaw - turnStep + 360) % 360; newSpeed = 0; }
          else if (cmd === 'yaw_right') { newYaw = (prev.yaw + turnStep) % 360; newSpeed = 0; }
          else if (cmd === 'reset_attitude') { newPitch = 0; newRoll = 0; newSpeed = 0; }
          else { // hover: decelerate
            newSpeed = Math.max(0, prev.speed * 0.6);
            newPitch = prev.pitch * 0.5;
            newRoll = prev.roll * 0.5;
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
                if (scanTimerRef.current === 1) {
                  pendingScanEventRef.current = 'trad'; // ✅ fire AI immediately saat drone tiba
                }
                if (scanTimerRef.current >= 12) {
                  scannedTreesRef.current += 1; setScannedTrees(scannedTreesRef.current); currentWpIndexRef.current += 1; autoSubStateRef.current = 'NAV'; newYaw = baseYawRef.current;
                }
              }
              else if (curSub === 'SCAN_QLV_CAPTURE') {
                newSpeed = 0; newYaw = baseYawRef.current; scanTimerRef.current += 1;
                if (scanTimerRef.current === 1) {
                  pendingScanEventRef.current = 'qlv'; // ✅ fire AI saat drone berhenti di lorong
                }
                if (scanTimerRef.current >= 15) { // 15 ticks × 200ms = 3 detik jeda (realistis)
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
              // ✅ Gunakan hasil AI nyata, fallback ke estimasi jika offline
              const finalMatang = aiCallCountRef.current > 0
                ? matangCountRef.current
                : Math.floor(finalCount * 0.65);
              const finalBelum = finalCount - finalMatang;
              const acc = aiCallCountRef.current > 0
                ? Math.round(accuracyAccumRef.current / aiCallCountRef.current)
                : (fInfo.scan === 'qlv' ? Math.floor(Math.random() * 6) + 89 : Math.floor(Math.random() * 4) + 96);
              const flightSecs = flightTimeRef.current;
              const battUsed = parseFloat((flightSecs * 0.01).toFixed(2));

              // 1. Update UI state langsung (optimistic)
              const tempLog = {
                id: 'LOG-' + Date.now(),
                date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
                name: fInfo.name, nav: fInfo.nav, scan: fInfo.scan,
                samples: finalCount, matang: finalMatang, belumMatang: finalBelum,
                flightTime: flightSecs, batteryUsed: battUsed, accuracy: acc,
              };
              setFlightLogs(prev => [tempLog, ...prev]);
              setCockpitWarning('✅ Mendarat! Menyimpan log ke database...');

              // 2. BL-09: POST ke /api/flight-logs (BUKAN /missions)
              const csrf = document.querySelector('meta[name="csrf-token"]')?.content || '';
              fetch('/api/flight-logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf },
                body: JSON.stringify({
                  mission_name: fInfo.name,
                  mission_id: fInfo.dbMissionId || null,
                  nav_algorithm: fInfo.nav,
                  scan_mode: fInfo.scan,
                  flight_time_seconds: flightSecs,
                  battery_used: battUsed,
                  samples_count: finalCount,
                  matang: finalMatang,
                  belum_matang: finalBelum,
                  accuracy: acc,
                  config_data: fInfo.configData || {},
                  telemetry_data: telemetryHistoryRef.current,
                }),
              })
                .then(res => res.ok ? res.json() : Promise.reject(res.status))
                .then(result => {
                  // Update ID log dari DB (ganti ID sementara)
                  setFlightLogs(prev => prev.map(l =>
                    l.id === tempLog.id ? { ...l, id: result?.data?.id ?? tempLog.id } : l
                  ));
                  setCockpitWarning(`✅ Log "${fInfo.name}" tersimpan ke DB!`);
                  setTimeout(() => setCockpitWarning(''), 4000);
                })
                .catch(() => {
                  setCockpitWarning('⚠️ Log disimpan lokal, gagal ke server!');
                  setTimeout(() => setCockpitWarning(''), 4000);
                });

              // 3. Tetap auto-save misi ke /missions jika belum tersimpan
              if (!fInfo.dbMissionId) {
                setAutoSavePending({
                  mission_name: fInfo.name,
                  nav_algorithm: fInfo.nav,
                  scan_mode: fInfo.scan,
                  waypoints: fInfo.waypointSlim || [],
                  path_data: fInfo.pathSlim || [],
                  config_data: fInfo.configData || {},
                  status: 'Completed',
                  samples_count: finalCount,
                  flight_time: flightSecs,
                });
              }
              currentFlightInfoRef.current = null;
            }
          }
        }

        const newLat = BASE_LAT - (newY * METER_TO_DEG); const newLon = BASE_LON + (newX * METER_TO_DEG);
        const timestamp = new Date().toLocaleTimeString();

        // Pseudo IMU Generation untuk keperluan visual log (sebelum data asli masuk dari HW)
        const ax = newPitch * 1.5;
        const ay = newRoll * 1.5;
        const az = 9.81 + ((newAlt - prev.alt) * 5);
        const gx = (newPitch - prev.pitch) * 2;
        const gy = (newRoll - prev.roll) * 2;
        const gz = (newYaw - prev.yaw) * 2;

        const newTelem = {
          x: newX, y: newY, alt: newAlt, speed: newSpeed, pitch: newPitch, roll: newRoll, yaw: newYaw, bat: newBat, lat: newLat, lon: newLon, mode: curMode, subState: autoSubStateRef.current, timestamp,
          ax, ay, az, gx, gy, gz
        };

        // TASK 4.2: Temporary Logger - Hanya catat jika ada perpindahan >1 meter atau ganti mode
        setTelemetryHistory(h => {
          if (flightStatusRef.current === 'STANDBY') return h; // Jangan rekam terus menerus saat standby
          if (h.length === 0) {
            telemetryHistoryRef.current = [newTelem];
            return telemetryHistoryRef.current;
          }
          const last = h[0];
          const distMoved = Math.sqrt(Math.pow(newX - last.x, 2) + Math.pow(newY - last.y, 2));
          if (curMode !== last.mode || distMoved > 1.0) {
            telemetryHistoryRef.current = [newTelem, ...h].slice(0, 300); // Batasi max 300 record per penerbangan
            return telemetryHistoryRef.current;
          }
          return h;
        });

        return newTelem;
      });

      if (tickCountRef.current % 5 === 0 && flightStatusRef.current !== 'STANDBY') { flightTimeRef.current += 1; setFlightTime(flightTimeRef.current); }
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
    // Simpan data misi untuk auto-save saat landing
    currentFlightInfoRef.current = {
      name: missionName || 'Misi Tanpa Nama',
      nav: navAlgorithm,
      scan: scanMode,
      waypointSlim: waypoints.map(wp => ({ id: wp.id, row: wp.row, x: wp.x, y: wp.y })),
      pathSlim: path.map(p => ({ x: p.x, y: p.y })),
      configData: { namaBlok: config.namaBlok, luasKebun: config.luasKebun, totalPohon: config.totalPohon },
    };
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


  const handleConfigChange = (e, field) => {
    if (isMapActive || isMissionSaved) return;
    let val = e.target.value;
    if (field !== 'namaBlok') { val = parseFloat(val); if (isNaN(val) || val <= 0) val = 1; }
    setConfig(prev => { const n = { ...prev, [field]: val }; if (field === 'totalPohon') n.jumlahSampel = Math.ceil(val * 0.10); return n; });
    setWaypoints([]);
  };

  const handleSaveBlock = () => {
    if (!config.namaBlok.trim()) { setWarning('Isi Nama Blok terlebih dahulu!'); setTimeout(() => setWarning(''), 3000); return; }
    setManagedBlocks(prev => { const idx = prev.findIndex(b => b.id === config.id); if (idx !== -1) { const u = [...prev]; u[idx] = { ...config, status: 'Tersimpan' }; return u; } return [...prev, { ...config, status: 'Tersimpan' }]; });
    setWarning('Data Blok berhasil disimpan!'); setTimeout(() => setWarning(''), 3000);
  };

  const loadBlock = (block) => { setConfig(block); setMissionName(`MISI-${block.namaBlok.replace(/\s+/g, '')}`); setWaypoints([]); setIsMapActive(false); setIsMissionSaved(false); setActiveMapTab('map'); setWarning(''); };
  const deleteBlock = (id) => setManagedBlocks(prev => prev.filter(b => b.id !== id));

  const handleStartWaypoint = () => {
    if (!missionName.trim()) { setWarning('Harap isi Nama Misi terlebih dahulu!'); setTimeout(() => setWarning(''), 3000); return; }
    setIsMapActive(true); setActiveTab('current'); setActiveMapTab('map');
  };

  const toggleWaypoint = (tree) => {
    if (!isMapActive || isMissionSaved) return;
    setWarning('');
    if (scanMode === 'qlv') { setWaypoints([tree]); return; }
    const existsIndex = waypoints.findIndex(wp => wp.id === tree.id);
    if (existsIndex !== -1) { setWaypoints(waypoints.filter(wp => wp.id !== tree.id)); return; }
    if (scanMode === 'traditional') {
      if (waypoints.length === 2 && tree.row === waypoints[0].row) { setWarning('Pilih pohon di LAJUR LAIN!'); setTimeout(() => setWarning(''), 3000); return; }
      if (waypoints.length < 3) setWaypoints([...waypoints, tree]);
      else { setWarning('Mode Tradisional hanya perlu 3 klik!'); setTimeout(() => setWarning(''), 3000); }
    } else { setWarning('Pilih Mode Scan terlebih dahulu!'); setTimeout(() => setWarning(''), 3000); }
  };

  const handleSaveMission = async () => {
    if (scanMode === 'traditional' && waypoints.length !== 3) { setWarning('Pilih tepat 3 pohon!'); setTimeout(() => setWarning(''), 3000); return; }
    if (scanMode === 'qlv' && waypoints.length === 0) { setWarning('Pilih 1 Pohon Awal!'); setTimeout(() => setWarning(''), 3000); return; }
    if (!navAlgorithm || !scanMode) return;

    const pathData = scanMode === 'qlv' ? qlvPath : tradPath;
    // Kirim hanya data minimal (bukan full tree object agar payload tidak terlalu besar)
    const waypointSlim = waypoints.map(wp => ({ id: wp.id, row: wp.row, x: wp.x, y: wp.y }));
    const pathSlim = pathData ? pathData.map(p => ({ x: p.x, y: p.y })) : [];
    const missionPayload = {
      mission_name: missionName,
      nav_algorithm: navAlgorithm,
      scan_mode: scanMode,
      waypoints: waypointSlim,
      path_data: pathSlim,
      config_data: { namaBlok: config.namaBlok, luasKebun: config.luasKebun, totalPohon: config.totalPohon },
    };

    const localData = {
      name: missionName,
      wpCount: scanMode === 'qlv' ? '1 Koridor' : '2 Lajur',
      algorithm: navAlgorithm,
      scan: scanMode,
      date: new Date().toLocaleTimeString(),
      waypointsData: [...waypoints],
      configData: { ...config }
    };

    if (editingMissionId) {
      setSavedMissions(prev => prev.map(m => m.id === editingMissionId ? { ...m, ...localData } : m));
      setSelectedMissionId(editingMissionId);
    } else {
      // POST ke Laravel backend
      try {
        const csrf = document.querySelector('meta[name="csrf-token"]')?.content || '';
        const res = await fetch('/missions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf },
          body: JSON.stringify(missionPayload),
        });
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          console.error('[GCS] Gagal simpan misi ke DB:', res.status, errBody);
          // Fallback lokal
          const nm = { id: `MSN-${Date.now()}`, ...localData };
          setSavedMissions(prev => [nm, ...prev]);
          setSelectedMissionId(nm.id);
        } else {
          const result = await res.json();
          const newId = result?.data?.id ? `MSN-${String(result.data.id).padStart(4, '0')}` : `MSN-${Date.now()}`;
          const nm = { id: newId, _dbId: result?.data?.id, ...localData };
          setSavedMissions(prev => [nm, ...prev]);
          setSelectedMissionId(nm.id);
        }
      } catch (e) {
        console.error('[GCS] Network error saat simpan misi:', e);
        // Fallback: simpan lokal saja jika backend tidak tersedia
        const nm = { id: `MSN-${Date.now()}`, ...localData };
        setSavedMissions(prev => [nm, ...prev]);
        setSelectedMissionId(nm.id);
      }
    }
    setIsMissionSaved(true); setIsMapActive(false); setEditingMissionId(null); setActiveTab('history');
  };

  const loadMissionForEdit = (missionId, e) => {
    e.stopPropagation();
    const m = savedMissions.find(m => m.id === missionId);
    if (m) { 
      setConfig(m.configData); 
      
      // Enrich waypoints dengan data pohon lengkap (termasuk Lat/Lon) dari kalkulasi grid
      const { trees: fullTrees } = generateTreeGrid(m.configData);
      const enrichedWaypoints = m.waypointsData.map(wp => {
        const match = fullTrees.find(t => t.id === wp.id);
        return match ? match : wp;
      });
      
      setWaypoints(enrichedWaypoints); 
      setMissionName(m.name); 
      setNavAlgorithm(m.algorithm); 
      setScanMode(m.scan); 
      setEditingMissionId(m.id); 
      setIsMapActive(true); 
      setIsMissionSaved(false); 
      setActiveTab('current'); 
      setActiveMapTab('map'); 
      setWarning(''); 
    }
  };

  const handleResetDraft = () => {
    setWaypoints([]); setIsMapActive(false); setIsMissionSaved(false); setMissionName(''); setNavAlgorithm(''); setScanMode(''); setEditingMissionId(null); setWarning(''); setActiveTab('current');
    flightStatusRef.current = 'STANDBY'; setFlightStatusUI('STANDBY'); flightTimeRef.current = 0; scannedTreesRef.current = 0; setScannedTrees(0); setFlightTime(0);
    setTelemetry(prev => ({ ...prev, x: homeWP.x, y: homeWP.y, lat: homeWP.lat, lon: homeWP.lon, alt: 0, pitch: 0, roll: 0, speed: 0, subState: 'NAV' }));
    setLiveAiVision({ active: false, objectDetected: 'Menunggu Take-off...', isPalmFruit: false, condition: null, confidence: 0, boxPos: { top: 30, left: 40 } });
  };



  // --- STATISTIK ---
  const baseTotalSample = scanMode === 'qlv' ? config.jumlahSampel : (scanMode === 'traditional' && tradPath.length > 0 ? tradPath.length : config.jumlahSampel);
  const matangCount = Math.floor(scannedTrees * 0.65);
  const belumMatangCount = scannedTrees - matangCount;
  const matangPercent = scannedTrees > 0 ? ((matangCount / scannedTrees) * 100).toFixed(0) : 0;
  const belumMatangPercent = scannedTrees > 0 ? ((belumMatangCount / scannedTrees) * 100).toFixed(0) : 0;
  const isUploadReady = selectedMissionId !== null && savedMissions.some(m => m.id === selectedMissionId);

  const getWaypointInstruction = () => {
    if (scanMode === 'qlv') return waypoints.length === 0 ? 'QLV: KLIK 1 POHON AWAL' : 'QLV: JALUR SIAP, KLIK SIMPAN';
    if (scanMode === 'traditional') {
      if (waypoints.length === 0) return 'TRAD: KLIK AWAL LAJUR 1';
      if (waypoints.length === 1) return 'TRAD: KLIK AKHIR LAJUR 1';
      if (waypoints.length === 2) return 'TRAD: KLIK 1 POHON DI LAJUR 2';
      return 'TRAD: RUTE SIAP, KLIK SIMPAN';
    }
    return 'PILIH MODE SCAN TERLEBIH DAHULU';
  };

  // --- EXPORT (delegasi ke utils/missionFormatter) ---
  const handleExportExcel = () => exportBlokKebun(managedBlocks);
  const handleExportTelemetry = () => exportTelemetry(telemetryHistory);
  const handleExportReports = () => exportFlightReport(flightLogs);

  // --- PATH STRING FOR SVG ---
  const pathString = useMemo(() =>
    buildPathString({ scanMode, waypoints, qlvPath, tradPath }, homeWP.x, homeWP.y),
    [waypoints, qlvPath, tradPath, isMissionSaved, flightStatusUI, scanMode]);


  // =========================================
  // RENDER â€” BL-08d: menggunakan komponen modular
  // =========================================
  return (
    <div className={`font-sans flex flex-col selection:bg-emerald-500/30 transition-all ${isFullscreen ? 'fixed inset-0 z-[40] h-screen w-screen overflow-hidden' : 'min-h-screen w-full overflow-auto'} ${t('bg-slate-950 text-slate-200', 'bg-slate-50 text-slate-800')}`}>

      {/* ======== HEADER ======== */}
      <GCSHeader
        appSettings={appSettings}
        t={t}
        flightStatusUI={flightStatusUI}
        isFullscreen={isFullscreen}
        toggleFullScreen={toggleFullScreen}
        setIsSettingsOpen={setIsSettingsOpen}
        setIsReportsOpen={setIsReportsOpen}
        telemetry={telemetry}
        flightTime={flightTime}
        formatTime={formatTime}
        scannedTrees={scannedTrees}
        baseTotalSample={baseTotalSample}
        cockpitWarning={cockpitWarning}
      />

      {/* ======== MAIN CONTENT — 3-COLUMN LAYOUT ======== */}
      <main className="flex-1 flex overflow-hidden p-2 gap-2 bg-slate-100 relative">

        {/* PiP FLOATING CAMERA WINDOW (5.2.5) */}
        {isPipVisible && isVideoConnected && (
          <div
            ref={pipRef}
            className="absolute z-30 rounded-xl overflow-hidden shadow-2xl border border-slate-600 bg-black"
            style={{ left: pipPos.x, top: pipPos.y, width: '240px' }}
          >
            <div
              onMouseDown={handlePipMouseDown}
              className="h-7 bg-slate-800 flex items-center justify-between px-2 cursor-grab active:cursor-grabbing select-none"
            >
              <span className="text-[9px] font-bold text-slate-300 flex items-center gap-1.5">
                <Camera className="w-3 h-3 text-rose-400" /> PiP — LIVE CAM
              </span>
              <button onClick={() => setIsPipVisible(false)} className="text-slate-500 hover:text-white transition">
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
              <div className="absolute top-1 left-1 bg-black/70 px-1 rounded text-[7px] text-rose-400 font-bold z-10 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> REC
              </div>
              {droneMode === 'simulasi' && webcamStream ? (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-90" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-slate-500 text-[9px] font-mono">NO SIGNAL</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* LEFT SIDEBAR */}
        <GCSLeftPanel
          droneMode={droneMode}
          telemetry={telemetry}
          flightTime={flightTime}
          cockpitWarning={cockpitWarning}
          formatTime={formatTime}
          handleStartFlight={handleStartFlight}
          handleRTH={handleRTH}
          handleDroneCommand={handleDroneCommand}
          droneFlightState={droneFlightState}
          flightStatusUI={flightStatusUI}
          t={t}
        />

        {/* CENTER + RIGHT — existing panel */}
        <GCSRightPanel
          config={config}
          managedBlocks={managedBlocks}
          handleConfigChange={handleConfigChange}
          handleSaveBlock={handleSaveBlock}
          loadBlock={loadBlock}
          deleteBlock={deleteBlock}
          isMapActive={isMapActive}
          isMissionSaved={isMissionSaved}

          navAlgorithm={navAlgorithm}
          setNavAlgorithm={setNavAlgorithm}
          scanMode={scanMode}
          setScanMode={setScanMode}

          missionName={missionName}
          setMissionName={setMissionName}
          waypoints={waypoints}
          setWaypoints={setWaypoints}
          warning={warning}
          editingMissionId={editingMissionId}
          savedMissions={savedMissions}
          selectedMissionId={selectedMissionId}
          setSelectedMissionId={setSelectedMissionId}
          handleStartWaypoint={handleStartWaypoint}
          handleSaveMission={handleSaveMission}
          loadMissionForEdit={loadMissionForEdit}
          handleResetDraft={handleResetDraft}
          getWaypointInstruction={getWaypointInstruction}
          toggleWaypoint={toggleWaypoint}

          liveAiVision={liveAiVision}
          flightStatusUI={flightStatusUI}
          scannedTrees={scannedTrees}
          baseTotalSample={baseTotalSample}
          matangCount={matangCount}
          belumMatangCount={belumMatangCount}
          matangPercent={matangPercent}
          belumMatangPercent={belumMatangPercent}
          setManagedBlocks={setManagedBlocks}

          trees={trees}
          qlvPath={qlvPath}
          qlvTargetTrees={qlvTargetTrees}
          tradPath={tradPath}
          pathString={pathString}
          telemetry={telemetry}
          max_x={max_x}
          max_y={max_y}
          currentWpIndexRef={currentWpIndexRef}

          activeMapTab={activeMapTab}
          setActiveMapTab={setActiveMapTab}
          activeTab={activeTab}
          setActiveTab={setActiveTab}

          drones={drones}
          selectedUploadDrone={selectedUploadDrone}
          setSelectedUploadDrone={setSelectedUploadDrone}
          setWarning={setWarning}
          isUploadReady={isUploadReady}

          handleExportExcel={handleExportExcel}

          t={t}

          topMapPanel={
            <GCSCameraPanel
              droneMode={droneMode}
              isVideoConnected={isVideoConnected}
              webcamStream={webcamStream}
              videoRef={videoRef}
              liveStreamUrl={liveStreamUrl}
              setIsVideoConnected={setIsVideoConnected}
              setAlertPopup={setAlertPopup}
              liveAiVision={liveAiVision}
              telemetry={telemetry}
              targetAltitude={targetAltitude}
              isPipVisible={isPipVisible}
              setIsPipVisible={setIsPipVisible}
            />
          }
          topCockpitPanel={null}
        />
      </main>



      {/* ======== MODAL SETTINGS ======== */}
      <GCSSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        activeSettingNode={activeSettingNode}
        setActiveSettingNode={setActiveSettingNode}
        droneMode={droneMode}
        setDroneMode={setDroneMode}
        theme={theme}
        setTheme={setTheme}
        telemBaud={telemBaud}
        setTelemBaud={setTelemBaud}
        isTelemConnected={isTelemConnected}
        handleConnectTelemetry={handleConnectTelemetry}
        videoIp={videoIp}
        setVideoIp={setVideoIp}
        videoProtocol={videoProtocol}
        setVideoProtocol={setVideoProtocol}
        hlsUrl={hlsUrl}
        setHlsUrl={setHlsUrl}
        isVideoConnected={isVideoConnected}
        handleConnectVideo={handleConnectVideo}
        drones={drones}
        setDrones={setDrones}
        droneForm={droneForm}
        setDroneForm={setDroneForm}
        isEditingDrone={isEditingDrone}
        setIsEditingDrone={setIsEditingDrone}
        telemetryHistory={telemetryHistory}
        setTelemetryHistory={setTelemetryHistory}
        handleExportTelemetry={handleExportTelemetry}
        aiInput={aiInput}
        setAiInput={setAiInput}
        aiHistory={aiHistory}
        isAiLoading={isAiLoading}
        handleAskGemini={handleAskGemini}
        chatEndRef={chatEndRef}
        t={t}
      />

      {/* ======== MODAL LAPORAN ======== */}
      <GCSReportsModal
        isOpen={isReportsOpen}
        onClose={() => setIsReportsOpen(false)}
        flightLogs={flightLogs}
        setFlightLogs={setFlightLogs}
        handleExportReports={handleExportReports}
        t={t}
      />

      {/* ======== ALERT POPUP ======== */}
      {alertPopup && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-[400px] max-w-full flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-rose-500/10 text-rose-500"><AlertCircle className="w-5 h-5" /><span className="font-bold text-xs">{String(alertPopup?.title || 'Error')}</span></div>
            <div className="p-5 text-slate-300 text-sm leading-relaxed">{String(alertPopup?.message || '')}</div>
            <div className="p-3 border-t border-slate-800 flex justify-end bg-slate-950"><button onClick={() => setAlertPopup(null)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-bold">TUTUP</button></div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar{width:6px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:#475569;border-radius:10px}` }} />
    </div>
  );
};

export default AppGCS;
