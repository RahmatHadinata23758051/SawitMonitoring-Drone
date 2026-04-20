import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Battery, Signal, Wifi, Navigation, Activity,
  Crosshair, Map as MapIcon, Power, Play, Square,
  Home, Settings, Camera, BarChart3, Trash2, Send, MapPin,
  CheckCircle2, AlertCircle, Save, TreeDeciduous, Lock, Unlock,
  MousePointerClick, TableProperties, Minus, Maximize2, Minimize2, X, Clock, Compass, GaugeCircle, Archive, Database, Edit, ChevronDown, Radio, Video, Bot, SendHorizontal, Loader2, ListTree, CheckSquare, Download, Plane, Cpu, MonitorPlay, Moon, Sun, Palette, FileText, ClipboardList, TrendingUp, PieChart, LayoutDashboard
} from 'lucide-react';

const homeWP = { x: -20, y: 15, id: 'HOME', lat: -0.589200, lon: 101.458500 };
const BASE_LAT = -0.589234;
const BASE_LON = 101.458721;
const METER_TO_DEG = 0.000008983;

const AppGCS = () => {
  // --- APP SETTINGS (dari Laravel — Fase E Branding Sync) ---
  const [appSettings, setAppSettings] = useState({
    name: 'Drone CPS',
    image: null,
    version: '1.0.0',
    tab_name: 'GCS — Drone CPS',
    copyright: 'MakeSens',
    copyright_year: new Date().getFullYear(),
  });
  useEffect(() => {
    fetch('/api/pengaturan-aplikasi')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setAppSettings(prev => ({ ...prev, ...data }));
          // Sinkron judul tab browser
          if (data.tab_name) document.title = `GCS · ${data.tab_name}`;
          else if (data.name) document.title = `GCS · ${data.name}`;
        }
      })
      .catch(() => {});
  }, []);


  // --- STATE TEMA & FULLSCREEN ---
  const [theme, setTheme] = useState('dark');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const t = (darkClass, lightClass) => theme === 'dark' ? darkClass : lightClass;

  // --- POPUP NOTIFIKASI ERROR ---
  const [alertPopup, setAlertPopup] = useState(null);

  // --- STATE DRONE MANAGEMENT ---
  const [drones, setDrones] = useState([]);
  const [dronesLoading, setDronesLoading] = useState(true);

  // D1: Load drone dari Laravel /api/perangkat
  useEffect(() => {
    fetch('/api/perangkat')
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setDrones(data);
        else setDrones([
          { id: 'DRN-001', merk: 'DJI Matrice 300 RTK', status: 'Standby' },
          { id: 'DRN-002', merk: 'SawitV1 Custom Quad', status: 'Maintenance' }
        ]);
      })
      .catch(() => setDrones([
        { id: 'DRN-001', merk: 'DJI Matrice 300 RTK (Demo)', status: 'Standby' }
      ]))
      .finally(() => setDronesLoading(false));
  }, []);

  const [selectedUploadDrone, setSelectedUploadDrone] = useState('');
  const [droneForm, setDroneForm] = useState({ id: '', merk: '', status: 'Standby' });
  const [isEditingDrone, setIsEditingDrone] = useState(false);

  // --- STATE PENGATURAN (SETTINGS MODAL) & LAPORAN ---
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeSettingNode, setActiveSettingNode] = useState('mode');
  const [isReportsOpen, setIsReportsOpen] = useState(false);

  // System Mode Settings
  const [droneMode, setDroneMode] = useState('');
  const [webcamStream, setWebcamStream] = useState(null);
  const videoRef = useRef(null);

  // Telemetry Settings
  const [telemBaud, setTelemBaud] = useState('57600');
  const [isTelemConnected, setIsTelemConnected] = useState(false);
  const serialPortRef = useRef(null);
  const serialReaderRef = useRef(null);

  // Video Settings
  const [videoIp, setVideoIp] = useState('192.168.1.100');
  const [isVideoConnected, setIsVideoConnected] = useState(false);
  const [liveStreamUrl, setLiveStreamUrl] = useState('');

  // Emulator State
  const flightStatusRef = useRef('STANDBY');
  const activePathRef = useRef([]);
  const currentWpIndexRef = useRef(0);
  const autoSubStateRef = useRef('NAV');
  const scanTimerRef = useRef(0);
  const baseYawRef = useRef(0);
  const tickCountRef = useRef(0);

  const [flightStatusUI, setFlightStatusUI] = useState('STANDBY');
  const [cockpitWarning, setCockpitWarning] = useState('');

  const flightTimeRef = useRef(0);
  const currentFlightInfoRef = useRef(null);
  const [scannedTrees, setScannedTrees] = useState(0);
  const scannedTreesRef = useRef(0);
  const [flightTime, setFlightTime] = useState(0);

  // --- STATE AI VISION ---
  const [liveAiVision, setLiveAiVision] = useState({
    active: false, objectDetected: 'Menunggu Take-off...', isPalmFruit: false,
    condition: null, confidence: 0, boxPos: { top: 30, left: 40 }
  });

  const [flightLogs, setFlightLogs] = useState([
    { id: 'LOG-101', date: '10/04/2026 09:12:00', name: 'MISI-BlokA', nav: 'live_reckoning', scan: 'qlv', flightTime: 85, samples: 14, matang: 9, belumMatang: 5, batteryUsed: 0.85, accuracy: 92 },
    { id: 'LOG-102', date: '10/04/2026 10:30:00', name: 'MISI-BlokB', nav: 'dead_reckoning', scan: 'traditional', flightTime: 210, samples: 14, matang: 9, belumMatang: 5, batteryUsed: 2.10, accuracy: 98 },
    { id: 'LOG-103', date: '13/04/2026 00:53:18', name: 'WPTR', nav: 'hybrid', scan: 'traditional', flightTime: 96, samples: 25, matang: 16, belumMatang: 9, batteryUsed: 0.96, accuracy: 97 }
  ]);

  // Gemini AI Assistant
  const [aiInput, setAiInput] = useState('');
  const [aiHistory, setAiHistory] = useState([
    { role: 'ai', text: 'Sistem AI aktif. Apa yang ingin Anda ketahui tentang misi drone ini?' }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatEndRef = useRef(null);

  // --- STATE PARAMETER KEBUN ---
  const [config, setConfig] = useState({
    id: 'BLK-' + Date.now(), namaBlok: 'Blok A-01',
    luasKebun: 1.0, totalPohon: 140, jumlahSampel: 14, tinggiPohon: 8.5
  });
  const [managedBlocks, setManagedBlocks] = useState([]);

  // D3: Load blok kebun dari Laravel /api/kebun
  useEffect(() => {
    fetch('/api/kebun')
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setManagedBlocks(data);
        else setManagedBlocks([
          { id: 'BLK-1001', namaBlok: 'Blok A-01 (Demo)', luasKebun: 1.0, totalPohon: 140, tinggiPohon: 8.5, jumlahSampel: 14, status: 'Tersimpan' }
        ]);
      })
      .catch(() => setManagedBlocks([
        { id: 'BLK-1001', namaBlok: 'Blok A-01 (Demo)', luasKebun: 1.0, totalPohon: 140, tinggiPohon: 8.5, jumlahSampel: 14, status: 'Tersimpan' }
      ]));
  }, []);

  const [activeMapTab, setActiveMapTab] = useState('map');

  // --- STATE ALGORITMA & MODE SCAN ---
  const [navAlgorithm, setNavAlgorithm] = useState('');
  const [scanMode, setScanMode] = useState('');

  // --- STATE WAYPOINT & MISI ---
  const [waypoints, setWaypoints] = useState([]);
  const [warning, setWarning] = useState('');
  const [missionName, setMissionName] = useState('');
  const [savedMissions, setSavedMissions] = useState([]);

  // D2: Load rekap misi dari Laravel /missions
  useEffect(() => {
    fetch('/missions')
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map(m => ({
            id: `MSN-${m.id}`,
            name: m.mission_name,
            algorithm: m.nav_algorithm,
            scan: m.scan_mode,
            wpCount: m.scan_mode === 'qlv' ? '1 Koridor' : '2 Lajur',
            date: new Date(m.created_at).toLocaleString(),
            waypointsData: Array.isArray(m.waypoints) ? m.waypoints : [],
            configData: m.config_data || {},
            _dbId: m.id,
          }));
          setSavedMissions(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const [activeTab, setActiveTab] = useState('current');
  const [selectedMissionId, setSelectedMissionId] = useState(null);
  const [editingMissionId, setEditingMissionId] = useState(null);
  const [isMapActive, setIsMapActive] = useState(false);
  const [isMissionSaved, setIsMissionSaved] = useState(false);
  // Auto-save trigger saat drone landing
  const [autoSavePending, setAutoSavePending] = useState(null);

  // --- TELEMETRY ---
  const [telemetryHistory, setTelemetryHistory] = useState([]);
  const [telemetry, setTelemetry] = useState({
    x: homeWP.x, y: homeWP.y, alt: 0, speed: 0, pitch: 0, roll: 0, yaw: 145, bat: 84,
    lat: homeWP.lat, lon: homeWP.lon, mode: 'STANDBY', subState: 'NAV', timestamp: new Date().toLocaleTimeString()
  });

  const toggleFullScreen = () => setIsFullscreen(!isFullscreen);

  // --- WEB SERIAL API ---
  const handleConnectTelemetry = async () => {
    if (isTelemConnected) {
      try {
        if (serialReaderRef.current) await serialReaderRef.current.cancel();
        if (serialPortRef.current) await serialPortRef.current.close();
      } catch (e) { console.error(e); } finally {
        serialPortRef.current = null; serialReaderRef.current = null;
        setIsTelemConnected(false); setCockpitWarning('Telemetri Terputus');
        setTimeout(() => setCockpitWarning(''), 3000);
      }
    } else {
      if (droneMode === 'simulasi') {
        setIsTelemConnected(true); setCockpitWarning('Simulasi Telemetri Aktif!');
        setTimeout(() => setCockpitWarning(''), 3000);
      } else if (droneMode === 'real') {
        try {
          if (!('serial' in navigator)) {
            setAlertPopup({ title: 'Tidak Didukung', message: 'Browser ini tidak mendukung Web Serial API.' }); return;
          }
          const port = await navigator.serial.requestPort();
          await port.open({ baudRate: parseInt(telemBaud) });
          serialPortRef.current = port; setIsTelemConnected(true);
          setCockpitWarning('Hardware Serial Terhubung!'); setTimeout(() => setCockpitWarning(''), 3000);
        } catch (error) {
          let msg = error.message || 'Gagal mengakses perangkat serial.';
          if (error.name === 'SecurityError') { msg = 'Akses diblokir. Beralih ke mode simulasi.'; setIsTelemConnected(true); }
          else if (error.name === 'NotFoundError') msg = 'Tidak ada perangkat USB/Serial yang dipilih.';
          setAlertPopup({ title: 'Info Koneksi', message: msg });
        }
      } else {
        setCockpitWarning('Pilih Mode Sistem Dahulu!'); setTimeout(() => setCockpitWarning(''), 3000);
      }
    }
  };

  // --- VIDEO STREAM ---
  const handleConnectVideo = () => {
    if (isVideoConnected) {
      setIsVideoConnected(false); setLiveStreamUrl('');
      if (webcamStream) { webcamStream.getTracks().forEach(t => t.stop()); setWebcamStream(null); }
    } else {
      if (droneMode === 'simulasi') setIsVideoConnected(true);
      else if (droneMode === 'real') { setLiveStreamUrl(`http://${videoIp}:81/stream`); setIsVideoConnected(true); }
      else { setCockpitWarning('Pilih Mode Sistem Dahulu!'); setTimeout(() => setCockpitWarning(''), 3000); }
    }
  };

  // Webcam laptop sebagai dummy kamera simulasi
  useEffect(() => {
    if (droneMode === 'simulasi' && isVideoConnected) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(s => setWebcamStream(s))
        .catch(() => { setAlertPopup({ title: 'Webcam Tidak Terdeteksi', message: 'Gagal mengakses webcam. Pastikan tidak digunakan aplikasi lain.' }); setIsVideoConnected(false); });
    }
    if (!isVideoConnected && webcamStream) {
      webcamStream.getTracks().forEach(t => t.stop()); setWebcamStream(null);
    }
  }, [droneMode, isVideoConnected]);

  useEffect(() => { if (videoRef.current && webcamStream) videoRef.current.srcObject = webcamStream; }, [webcamStream, isSettingsOpen]);
  useEffect(() => { if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, [aiHistory]);

  // --- AUTO-SAVE MISI KE DB SAAT DRONE LANDING ---
  useEffect(() => {
    if (!autoSavePending) return;
    const payload = autoSavePending;
    const csrf = document.querySelector('meta[name="csrf-token"]')?.content || '';
    fetch('/missions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf },
      body: JSON.stringify(payload),
    })
    .then(res => {
      if (res.ok) {
        return res.json().then(result => {
          const dbId = result?.data?.id;
          const newId = dbId ? `MSN-${String(dbId).padStart(4,'0')}` : `MSN-${Date.now()}`;
          const newMission = {
            id: newId, _dbId: dbId,
            name: payload.mission_name,
            wpCount: payload.scan_mode === 'qlv' ? '1 Koridor' : '2 Lajur',
            algorithm: payload.nav_algorithm,
            scan: payload.scan_mode,
            date: new Date().toLocaleTimeString(),
            status: 'Completed',
          };
          setSavedMissions(prev => [newMission, ...prev]);
          setCockpitWarning(`✅ Misi "${payload.mission_name}" tercatat otomatis! ID: ${newId}`);
          setTimeout(() => setCockpitWarning(''), 4000);
          console.log('[GCS] Auto-save landing berhasil! DB ID:', dbId);
        });
      } else {
        console.error('[GCS] Auto-save gagal:', res.status);
        setCockpitWarning('⚠️ Misi selesai tapi gagal tersimpan ke server!');
        setTimeout(() => setCockpitWarning(''), 4000);
      }
    })
    .catch(e => {
      console.error('[GCS] Auto-save network error:', e);
      setCockpitWarning('⚠️ Tidak dapat terhubung ke server untuk simpan misi!');
      setTimeout(() => setCockpitWarning(''), 4000);
    })
    .finally(() => setAutoSavePending(null));
  }, [autoSavePending]);


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
  const { trees, max_x, max_y } = useMemo(() => {
    const areaM2 = config.luasKebun * 10000;
    const areaPerTree = areaM2 / config.totalPohon;
    const spacingX = Math.sqrt(areaPerTree * 1.1547);
    const spacingY = spacingX * Math.sin(Math.PI / 3);
    const ratio = spacingY / spacingX;
    const cols = Math.max(3, Math.ceil(Math.sqrt(config.totalPohon / ratio)));
    const rows = Math.ceil(config.totalPohon / cols);
    let count = 0; const generatedTrees = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (count >= config.totalPohon) break;
        const offsetX = (row % 2 !== 0) ? (spacingX / 2) : 0;
        const x = (col * spacingX) + offsetX; const y = row * spacingY;
        const lat = BASE_LAT - (y * METER_TO_DEG); const lon = BASE_LON + (x * METER_TO_DEG);
        const crownRadius = spacingX * 0.22;
        generatedTrees.push({ id: `L${row + 1}P${col + 1}`, x, y, lat, lon, row, col, height: config.tinggiPohon + (Math.random() * 2 - 1), crownRadius });
        count++;
      }
    }
    return { trees: generatedTrees, max_x: cols * spacingX + spacingX / 2, max_y: rows * spacingY };
  }, [config.luasKebun, config.totalPohon, config.tinggiPohon]);

  // --- AUTO PATH QLV ---
  const qlvPath = useMemo(() => {
    if (scanMode !== 'qlv' || waypoints.length === 0) return [];
    const startTree = waypoints[0];
    const targetPoints = Math.ceil(config.jumlahSampel / 2);
    const rowTrees = trees.filter(t => t.row === startTree.row).sort((a, b) => a.x - b.x);
    const startIndex = rowTrees.findIndex(t => t.id === startTree.id);
    if (startIndex === -1) return [];
    let selectedTrees = rowTrees.length - startIndex >= targetPoints
      ? rowTrees.slice(startIndex, startIndex + targetPoints)
      : rowTrees.slice(Math.max(0, startIndex - targetPoints + 1), startIndex + 1).reverse();
    const nextRowTrees = trees.filter(t => t.row === startTree.row + 1);
    let yCorridor = startTree.y;
    if (nextRowTrees.length > 0) yCorridor = (startTree.y + nextRowTrees[0].y) / 2;
    else { const prevRow = trees.filter(t => t.row === startTree.row - 1); yCorridor = prevRow.length > 0 ? startTree.y + (startTree.y - prevRow[0].y) / 2 : startTree.y + 5; }
    return selectedTrees.map((t, i) => ({ x: t.x, y: yCorridor, id: `QLV-${i}`, lat: BASE_LAT - (yCorridor * METER_TO_DEG), lon: BASE_LON + (t.x * METER_TO_DEG) }));
  }, [waypoints, scanMode, trees, config.jumlahSampel]);

  // --- TARGET POHON QLV ---
  const qlvTargetTrees = useMemo(() => {
    if (scanMode !== 'qlv' || waypoints.length === 0 || qlvPath.length === 0) return [];
    const startTree = waypoints[0]; const targetRow1 = startTree.row;
    const targetRow2 = trees.filter(t => t.row === targetRow1 + 1).length > 0 ? targetRow1 + 1 : targetRow1 - 1;
    const row2Trees = trees.filter(t => t.row === targetRow2);
    let candidates = [];
    qlvPath.forEach(wp => {
      const t1 = trees.find(t => t.row === targetRow1 && Math.abs(t.x - wp.x) < 0.1);
      let t2 = null; let minDist = Infinity;
      row2Trees.forEach(t => { const d = Math.abs(t.x - wp.x); if (d < minDist) { minDist = d; t2 = t; } });
      if (t1 && !candidates.some(c => c.id === t1.id)) candidates.push(t1);
      if (t2 && !candidates.some(c => c.id === t2.id)) candidates.push(t2);
    });
    return candidates.slice(0, config.jumlahSampel);
  }, [waypoints, qlvPath, scanMode, trees, config.jumlahSampel]);

  // --- AUTO PATH TRADISIONAL ---
  const tradPath = useMemo(() => {
    if (scanMode !== 'traditional' || waypoints.length !== 3) return [];
    const wp1 = waypoints[0]; const wp2 = waypoints[1]; const wp3 = waypoints[2];
    const minX = Math.min(wp1.x, wp2.x); const maxX = Math.max(wp1.x, wp2.x);
    let row1Trees = trees.filter(t => t.row === wp1.row && t.x >= minX - 1 && t.x <= maxX + 1);
    let row2Trees = trees.filter(t => t.row === wp3.row && t.x >= minX - 1 && t.x <= maxX + 1);
    if (wp1.x > wp2.x) { row1Trees.sort((a, b) => b.x - a.x); row2Trees.sort((a, b) => a.x - b.x); }
    else { row1Trees.sort((a, b) => a.x - b.x); row2Trees.sort((a, b) => b.x - a.x); }
    return [...row1Trees, ...row2Trees];
  }, [waypoints, scanMode, trees]);

  const targetAltitude = config.tinggiPohon + 15;
  const mapWidth = max_x + 85; const mapHeight = max_y + 60;
  const radarLeft = Math.max(5, Math.min(95, ((telemetry.x + 35) / mapWidth) * 100));
  const radarTop = Math.max(5, Math.min(95, ((telemetry.y + 20) / mapHeight) * 100));

  // --- PHYSICS ENGINE (200ms) ---
  useEffect(() => {
    const interval = setInterval(() => {
      tickCountRef.current += 1;
      if (!droneMode || (!isTelemConnected && !isVideoConnected)) return;
      const status = flightStatusRef.current; const subState = autoSubStateRef.current;

      // AI Vision Update
      if (status === 'AUTO') {
        if (subState === 'SCAN_TRAD') {
          const isMatang = Math.random() > 0.35; const conf = (Math.random() * 10 + 89).toFixed(1);
          setLiveAiVision({ active: true, objectDetected: 'Inspeksi 360°: Tandan Buah Segar', isPalmFruit: true, condition: isMatang ? 'Matang' : 'Mentah', confidence: conf, boxPos: { top: 25 + Math.random() * 15, left: 35 + Math.random() * 15 } });
        } else if (subState === 'SCAN_QLV_CAPTURE') {
          let objMsg = 'Quick Look Geometri...'; let isPalm = false; let cond = null; let conf = 0;
          if (scanTimerRef.current === 1) objMsg = 'Transmisi Gambar ke GCS...';
          else if (scanTimerRef.current >= 2) { objMsg = 'Validasi AI GCS: Tandan Sawit'; isPalm = true; cond = Math.random() > 0.35 ? 'Matang' : 'Mentah'; conf = (Math.random() * 10 + 89).toFixed(1); }
          setLiveAiVision({ active: true, objectDetected: objMsg, isPalmFruit: isPalm, condition: cond, confidence: conf, boxPos: { top: 25 + Math.random() * 15, left: 35 + Math.random() * 15 } });
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
                if (scanTimerRef.current === 12) { scannedTreesRef.current += 1; setScannedTrees(scannedTreesRef.current); currentWpIndexRef.current += 1; autoSubStateRef.current = 'NAV'; newYaw = baseYawRef.current; }
              }
              else if (curSub === 'SCAN_QLV_CAPTURE') {
                newSpeed = 0; newYaw = baseYawRef.current; scanTimerRef.current += 1;
                if (scanTimerRef.current > 4) {
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
              const finalMatang = Math.floor(finalCount * 0.65); const finalBelum = finalCount - finalMatang;
              const acc = fInfo.scan === 'qlv' ? Math.floor(Math.random() * 6) + 89 : Math.floor(Math.random() * 4) + 96;
              const newLog = { id: 'LOG-' + Date.now(), date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(), name: fInfo.name, nav: fInfo.nav, scan: fInfo.scan, samples: finalCount, matang: finalMatang, belumMatang: finalBelum, flightTime: flightTimeRef.current, batteryUsed: parseFloat((flightTimeRef.current * 0.01).toFixed(2)), accuracy: acc };
              setFlightLogs(prev => [newLog, ...prev]);
              // ✅ AUTO-SAVE KE DB saat drone mendarat
              setAutoSavePending({
                mission_name: fInfo.name,
                nav_algorithm: fInfo.nav,
                scan_mode: fInfo.scan,
                waypoints: fInfo.waypointSlim || [],
                path_data: fInfo.pathSlim || [],
                config_data: fInfo.configData || {},
                status: 'Completed',
                samples_count: finalCount,
                flight_time: flightTimeRef.current,
              });
              currentFlightInfoRef.current = null;
            }
          }
        }

        const newLat = BASE_LAT - (newY * METER_TO_DEG); const newLon = BASE_LON + (newX * METER_TO_DEG);
        const timestamp = new Date().toLocaleTimeString();
        const newTelem = { x: newX, y: newY, alt: newAlt, speed: newSpeed, pitch: newPitch, roll: newRoll, yaw: newYaw, bat: newBat, lat: newLat, lon: newLon, mode: curMode, subState: autoSubStateRef.current, timestamp };
        if (tickCountRef.current % 5 === 0) setTelemetryHistory(h => [newTelem, ...h].slice(0, 100));
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
    setScannedTrees(0); setFlightTime(0); autoSubStateRef.current = 'NAV';
    flightStatusRef.current = 'TAKEOFF'; setFlightStatusUI('TAKEOFF');
  };

  const handleRTH = () => {
    if (flightStatusRef.current === 'STANDBY') { setCockpitWarning('Drone belum terbang!'); setTimeout(() => setCockpitWarning(''), 3000); return; }
    flightStatusRef.current = 'RTL'; setFlightStatusUI('RTL');
  };

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  // --- CONFIG HANDLERS ---
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
          const newId = result?.data?.id ? `MSN-${String(result.data.id).padStart(4,'0')}` : `MSN-${Date.now()}`;
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
    if (m) { setConfig(m.configData); setWaypoints([...m.waypointsData]); setMissionName(m.name); setNavAlgorithm(m.algorithm); setScanMode(m.scan); setEditingMissionId(m.id); setIsMapActive(true); setIsMissionSaved(false); setActiveTab('current'); setActiveMapTab('map'); setWarning(''); }
  };

  const handleResetDraft = () => {
    setWaypoints([]); setIsMapActive(false); setIsMissionSaved(false); setMissionName(''); setNavAlgorithm(''); setScanMode(''); setEditingMissionId(null); setWarning(''); setActiveTab('current');
    flightStatusRef.current = 'STANDBY'; setFlightStatusUI('STANDBY'); flightTimeRef.current = 0; scannedTreesRef.current = 0; setScannedTrees(0); setFlightTime(0);
    setTelemetry(prev => ({ ...prev, x: homeWP.x, y: homeWP.y, lat: homeWP.lat, lon: homeWP.lon, alt: 0, pitch: 0, roll: 0, speed: 0, subState: 'NAV' }));
    setLiveAiVision({ active: false, objectDetected: 'Menunggu Take-off...', isPalmFruit: false, condition: null, confidence: 0, boxPos: { top: 30, left: 40 } });
  };

  const pathString = useMemo(() => {
    const src = scanMode === 'qlv' && waypoints.length > 0 ? qlvPath : scanMode === 'traditional' && waypoints.length === 3 ? tradPath : waypoints;
    return src.length > 0 ? `${homeWP.x},${homeWP.y} ${src.map(wp => `${wp.x},${wp.y}`).join(' ')}` : '';
  }, [waypoints, qlvPath, tradPath, isMissionSaved, flightStatusUI, scanMode]);

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

  // --- EXPORT ---
  const exportCSV = (filename, headers, rows) => {
    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.style.visibility = 'hidden'; document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    if (!managedBlocks.length) return;
    exportCSV('Manajemen_Blok_Sawit', ['ID Blok', 'Nama Blok', 'Luas (Ha)', 'Total Pohon', 'Tinggi (m)', 'Sampel', 'Status'],
      managedBlocks.map(b => `${b.id},"${b.namaBlok}",${b.luasKebun},${b.totalPohon},${b.tinggiPohon},${b.jumlahSampel},${b.status}`));
  };

  const handleExportTelemetry = () => {
    if (!telemetryHistory.length) return;
    exportCSV('Raw_Telemetry', ['Waktu', 'Latitude', 'Longitude', 'Alt(m)', 'Speed(m/s)', 'Pitch', 'Roll', 'Yaw', 'Mode', 'Battery(%)'],
      telemetryHistory.map(d => `"${d.timestamp}",${d.lat.toFixed(6)},${d.lon.toFixed(6)},${d.alt.toFixed(2)},${d.speed.toFixed(2)},${d.pitch.toFixed(2)},${d.roll.toFixed(2)},${d.yaw.toFixed(0)},"${d.mode}",${d.bat.toFixed(2)}`));
  };

  const handleExportReports = () => {
    if (!flightLogs.length) return;
    exportCSV('Laporan_Kinerja_Drone', ['ID Log', 'Tanggal', 'Nama Misi', 'Algoritma', 'Mode Scan', 'Waktu(s)', 'Baterai(%)', 'Sampel', 'Matang', 'Mentah', 'Akurasi(%)'],
      flightLogs.map(l => `${l.id},"${l.date}","${l.name}",${l.nav},${l.scan},${l.flightTime},${l.batteryUsed},${l.samples},${l.matang},${l.belumMatang},${l.accuracy}`));
  };

  // =========================================
  // RENDER
  // =========================================
  return (
    <div className={`font-sans flex flex-col selection:bg-emerald-500/30 transition-all ${isFullscreen ? 'fixed inset-0 z-[40] h-screen w-screen overflow-hidden' : 'min-h-screen w-full overflow-auto'} ${t('bg-slate-950 text-slate-200', 'bg-slate-50 text-slate-800')}`}>

      {/* ======== HEADER BAR ======== */}
      <header className={`h-12 border-b flex items-center justify-between px-3 shadow-md z-10 shrink-0 ${t('bg-slate-900 border-slate-800', 'bg-white border-slate-200')}`}>
        <div className="flex items-center gap-3">
          {/* Tombol kembali ke Dashboard Laravel */}
          <a href="/dashboard" className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded border transition ${t('border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-800', 'border-slate-300 text-slate-500 hover:text-slate-800 hover:bg-slate-100')}`} title="Kembali ke Dashboard">
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden sm:block">Dashboard</span>
          </a>

          {/* Logo Aplikasi (sync dengan Laravel) */}
          <div className={`h-7 w-px ${t('bg-slate-700', 'bg-slate-300')}`}></div>
          <div className="flex items-center gap-2">
            {/* Logo IPB dari DB */}
            {appSettings.image ? (
              <img
                src={`/${appSettings.image}`}
                alt={appSettings.name || 'Logo'}
                className="h-8 w-auto object-contain"
                onError={e => {
                  e.target.style.display = 'none';
                  e.target.nextSibling && (e.target.nextSibling.style.display = 'flex');
                }}
              />
            ) : null}
            {/* Fallback inisial */}
            <div
              style={{ display: appSettings.image ? 'none' : 'flex' }}
              className={`w-8 h-8 rounded flex items-center justify-center text-[10px] font-black leading-none shrink-0 ${t('bg-emerald-600 text-white', 'bg-emerald-500 text-white')}`}
            >
              {appSettings.name ? appSettings.name.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase() : 'GCS'}
            </div>
            <div className="flex flex-col">
              <span className={`font-bold text-sm leading-none ${t('text-emerald-400', 'text-emerald-600')}`}>
                {appSettings.name || 'Drone CPS'}
              </span>
              <span className={`text-[8px] font-mono leading-none mt-0.5 ${t('text-slate-400', 'text-slate-400')}`}>
                Ground Control Station · v{appSettings.version || '1.0.1'}
              </span>
            </div>
          </div>

          <div className={`h-7 w-px mx-1 ${t('bg-slate-700', 'bg-slate-300')}`}></div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${flightStatusUI === 'STANDBY' ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' : 'bg-sky-500/20 text-sky-500 border-sky-500/30 animate-pulse'}`}>
            SYS: {flightStatusUI === 'STANDBY' ? 'ARMED/STANDBY' : flightStatusUI}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className={`flex items-center gap-1 ${t('text-emerald-400', 'text-emerald-600')}`}><Signal className="w-3 h-3" /><span>LINK: 98%</span></div>
          <div className={`flex items-center gap-1 ${t('text-slate-300', 'text-slate-600')}`}><Navigation className="w-3 h-3" /><span>GPS: 3D FIX (14)</span></div>
          <div className={`flex items-center gap-2 ml-4 pl-4 border-l ${t('border-slate-700', 'border-slate-300')}`}>
            <button onClick={() => setIsReportsOpen(true)} className={`p-1 rounded transition ${t('text-sky-400 hover:bg-slate-800', 'text-sky-600 hover:bg-slate-100')}`} title="Laporan"><FileText className="w-3.5 h-3.5" /></button>
            <button onClick={() => setIsSettingsOpen(true)} className={`p-1 rounded transition ${t('text-slate-400 hover:bg-slate-800 hover:text-white', 'text-slate-500 hover:bg-slate-100')}`} title="Pengaturan"><Settings className="w-3.5 h-3.5" /></button>
            <div className={`h-3 w-px mx-1 ${t('bg-slate-700', 'bg-slate-300')}`}></div>
            <button onClick={toggleFullScreen} className={`p-1 rounded transition ${t('text-slate-400 hover:bg-slate-800 hover:text-white', 'text-slate-500 hover:bg-slate-100')}`} title={isFullscreen ? 'Keluar Fullscreen' : 'Fullscreen'}>
              {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </header>

      {/* ======== MAIN CONTENT ======== */}
      <main className="flex-1 p-3 flex flex-col gap-3 overflow-hidden">

        {/* TOP SECTION: 3 Panel Dashboard */}
        <div className="flex-[0.35] grid grid-cols-3 gap-3 min-h-[220px]">

          {/* Panel 1: DUAL FPV CAMERA */}
          <div className={`border rounded-lg overflow-hidden relative shadow-lg flex flex-col ${t('bg-slate-900 border-slate-700', 'bg-white border-slate-300')}`}>
            <div className="absolute top-0 w-full p-2 flex justify-between items-start z-20 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
              <div className="flex items-center gap-2 text-rose-500 font-mono text-[10px] font-bold">
                <div className={`w-2 h-2 rounded-full ${droneMode && isVideoConnected ? 'bg-rose-500 animate-pulse' : 'bg-slate-600'}`}></div>
                REC {droneMode === 'simulasi' ? '(WEBCAM)' : droneMode === 'real' ? '(REAL)' : '(STANDBY)'}
              </div>
            </div>
            <div className={`flex-1 flex border-b w-full h-full relative z-10 ${t('border-slate-700', 'border-slate-300')}`}>
              {/* CAM 1: RGB */}
              <div className={`flex-1 relative border-r flex items-center justify-center overflow-hidden ${t('border-slate-700 bg-black', 'border-slate-300 bg-slate-800')}`}>
                <div className="absolute top-1 left-1 bg-black/60 px-1 rounded text-[8px] text-white z-10 font-bold">CAM 1: RGB</div>
                {droneMode === 'simulasi' && isVideoConnected && webcamStream ? (
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-80" />
                ) : droneMode === 'real' && isVideoConnected ? (
                  <img src={liveStreamUrl} alt="Live FPV" className="w-full h-full object-cover opacity-80"
                    onError={() => { setIsVideoConnected(false); setAlertPopup({ title: 'Video Terputus', message: 'Gagal memuat stream. Pastikan IP benar.' }); }} />
                ) : (
                  <div className="text-slate-500 text-[10px] font-mono border border-slate-500 p-2 border-dashed rounded">NO SIGNAL</div>
                )}
              </div>
              {/* CAM 2: AI MULTISPECTRAL */}
              <div className={`flex-1 relative flex items-center justify-center overflow-hidden ${t('bg-[#0a101d]', 'bg-slate-900')}`}>
                <div className="absolute top-1 left-1 bg-black/60 px-1 rounded text-[8px] text-emerald-400 font-bold z-10">CAM 2: AI MULTISPECTRAL</div>
                {droneMode && isVideoConnected ? (
                  <>
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(16,185,129,0.3) 1px, transparent 0)', backgroundSize: '15px 15px' }}></div>
                    <Crosshair className={`absolute w-8 h-8 pointer-events-none transition-all duration-300 ${liveAiVision.isPalmFruit ? 'text-rose-500 scale-125 opacity-80' : 'text-emerald-500 opacity-50'}`}
                      style={{ top: `calc(${liveAiVision.boxPos.top}% - 16px)`, left: `calc(${liveAiVision.boxPos.left}% - 16px)` }} />
                    {liveAiVision.isPalmFruit && (
                      <div className={`absolute w-12 h-16 border-2 transition-all duration-500 flex items-start justify-center ${liveAiVision.condition === 'Matang' ? 'border-orange-500 bg-orange-500/20' : 'border-slate-400 bg-slate-400/20'}`}
                        style={{ top: `${liveAiVision.boxPos.top}%`, left: `${liveAiVision.boxPos.left}%` }}>
                        <div className="absolute -top-4 bg-black/80 text-white text-[7px] px-1 font-bold w-full text-center border-b border-inherit whitespace-nowrap">
                          {liveAiVision.condition} ({liveAiVision.confidence}%)
                        </div>
                      </div>
                    )}
                    {telemetry.subState === 'SCAN_QLV_CAPTURE' && <div className="absolute inset-0 bg-white/40 z-30 pointer-events-none"></div>}
                    {telemetry.subState === 'SCAN_TRAD' && <div className="absolute inset-0 bg-white/10 z-30 pointer-events-none animate-pulse"></div>}
                  </>
                ) : (
                  <div className="text-slate-500 text-[10px] font-mono border border-slate-500 p-2 border-dashed rounded">NO SIGNAL</div>
                )}
              </div>
            </div>
            <div className={`h-6 flex items-center justify-between px-2 text-[9px] font-mono shrink-0 ${t('bg-slate-950/80 text-slate-400', 'bg-slate-100 text-slate-600')}`}>
              <span>DUAL STREAM VIEW</span>
              <span>TARGET ALT: {targetAltitude.toFixed(1)}m</span>
            </div>
          </div>

          {/* Panel 2: RADAR POSISI DRONE */}
          <div className={`border rounded-lg overflow-hidden relative shadow-lg flex flex-col ${t('bg-slate-900 border-slate-700', 'bg-white border-slate-300')}`}>
            <div className={`h-6 border-b px-2 flex items-center justify-between z-10 shrink-0 ${t('bg-slate-800/90 border-slate-700', 'bg-slate-100/90 border-slate-300')}`}>
              <span className={`text-[10px] font-bold flex items-center gap-1 ${t('text-sky-400', 'text-sky-600')}`}><Compass className="w-3 h-3" /> PETA POSISI DRONE</span>
              <span className={`text-[9px] font-mono ${flightStatusUI !== 'STANDBY' ? 'text-emerald-400 animate-pulse' : t('text-slate-500', 'text-slate-400')}`}>LIVE TRACKING</span>
            </div>
            <div className={`w-full h-full relative overflow-hidden ${t('bg-[#0b1318]', 'bg-slate-200')}`}>
              <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `linear-gradient(${t('#0ea5e9', '#0284c7')} 1px, transparent 1px), linear-gradient(90deg, ${t('#0ea5e9', '#0284c7')} 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
              <div className="absolute w-40 h-40 border border-sky-500/30 rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute w-20 h-20 border border-sky-500/30 rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
              {flightStatusUI !== 'STANDBY' && (
                <div className="absolute w-full h-full animate-[spin_4s_linear_infinite] origin-center" style={{ background: 'conic-gradient(from 0deg, transparent 0deg, rgba(14,165,233,0.15) 60deg, transparent 60deg)' }}></div>
              )}
              <div className="absolute transition-all duration-200" style={{ left: `${radarLeft}%`, top: `${radarTop}%`, transform: `translate(-50%, -50%) rotate(${telemetry.yaw - 90}deg)` }}>
                <div className="absolute w-12 h-12 border border-sky-500/40 rounded-full -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"></div>
                <Navigation className={`w-6 h-6 fill-emerald-500/30 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)] ${t('text-emerald-400', 'text-emerald-600')}`} />
              </div>
            </div>
            <div className={`absolute bottom-0 w-full border-t flex justify-between px-2 py-1 text-[9px] font-mono ${t('bg-slate-950/90 border-slate-700 text-sky-200', 'bg-white/90 border-slate-300 text-sky-700')}`}>
              <span>LAT: {telemetry.lat.toFixed(6)}</span><span>LON: {telemetry.lon.toFixed(6)}</span>
            </div>
          </div>

          {/* Panel 3: GAUGE COCKPIT */}
          <div className={`border rounded-lg overflow-hidden shadow-lg flex flex-col ${t('bg-slate-900 border-slate-700', 'bg-white border-slate-300')}`}>
            <div className={`h-6 border-b px-2 flex items-center justify-between z-10 shrink-0 ${t('bg-slate-800 border-slate-700', 'bg-slate-100 border-slate-300')}`}>
              <span className="flex items-center gap-1">
                <GaugeCircle className={`w-3 h-3 ${t('text-emerald-500', 'text-emerald-600')}`} />
                <span className={`text-[10px] font-bold ${t('text-slate-300', 'text-slate-700')}`}>GAUGE COCKPIT</span>
                {cockpitWarning && <span className="text-[9px] text-rose-500 animate-pulse font-bold ml-2">({cockpitWarning})</span>}
              </span>
              <div className="flex gap-1">
                <button onClick={handleStartFlight} className="bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-0.5 rounded text-[8px] font-bold flex items-center gap-1 transition"><Play className="w-2 h-2" /> MULAI</button>
                <button onClick={handleRTH} className="bg-amber-600 hover:bg-amber-500 text-white px-2 py-0.5 rounded text-[8px] font-bold flex items-center gap-1 transition"><Home className="w-2 h-2" /> RTH</button>
              </div>
            </div>
            <div className={`flex-1 p-2 grid grid-cols-2 gap-2 ${t('bg-slate-950', 'bg-slate-50')}`}>
              <div className={`border rounded p-2 flex flex-col items-center justify-center ${t('bg-slate-900 border-slate-800', 'bg-white border-slate-200 shadow-sm')}`}>
                <span className={`text-[9px] font-mono ${t('text-slate-500', 'text-slate-500')}`}>KECEPATAN</span>
                <div className={`text-xl font-mono font-light ${t('text-sky-400', 'text-sky-600')}`}>{telemetry.speed.toFixed(1)} <span className="text-[10px] text-slate-500">m/s</span></div>
              </div>
              <div className={`border rounded p-2 flex flex-col items-center justify-center ${t('bg-slate-900 border-slate-800', 'bg-white border-slate-200 shadow-sm')}`}>
                <span className={`text-[9px] font-mono ${t('text-slate-500', 'text-slate-500')}`}>KETINGGIAN</span>
                <div className={`text-xl font-mono font-light ${t('text-emerald-400', 'text-emerald-600')}`}>{telemetry.alt.toFixed(1)} <span className="text-[10px] text-slate-500">m</span></div>
              </div>
              <div className={`col-span-2 border rounded p-2 grid grid-cols-3 divide-x text-center ${t('bg-slate-900 border-slate-800 divide-slate-800', 'bg-white border-slate-200 divide-slate-200 shadow-sm')}`}>
                <div><div className={`text-[8px] font-mono ${t('text-slate-500', 'text-slate-500')}`}>PITCH</div><div className={`text-sm font-mono ${t('text-white', 'text-slate-800')}`}>{telemetry.pitch > 0 ? '+' : ''}{telemetry.pitch.toFixed(1)}°</div></div>
                <div><div className={`text-[8px] font-mono ${t('text-slate-500', 'text-slate-500')}`}>ROLL</div><div className={`text-sm font-mono ${t('text-white', 'text-slate-800')}`}>{telemetry.roll > 0 ? '+' : ''}{telemetry.roll.toFixed(1)}°</div></div>
                <div><div className={`text-[8px] font-mono ${t('text-slate-500', 'text-slate-500')}`}>YAW</div><div className={`text-sm font-mono ${t('text-white', 'text-slate-800')}`}>{Math.floor(telemetry.yaw)}°</div></div>
              </div>
              <div className={`border rounded p-1.5 flex items-center justify-between px-3 ${t('bg-slate-900 border-slate-800', 'bg-white border-slate-200 shadow-sm')}`}>
                <div className="flex items-center gap-1"><Battery className={`w-4 h-4 ${telemetry.bat > 30 ? 'text-emerald-500' : 'text-rose-500'}`} /><span className={`text-[9px] font-mono ${t('text-slate-500', 'text-slate-500')}`}>BATERAI</span></div>
                <span className={`text-sm font-mono ${t('text-white', 'text-slate-800')}`}>{Math.floor(telemetry.bat)}%</span>
              </div>
              <div className={`border rounded p-1.5 flex items-center justify-between px-3 ${t('bg-slate-900 border-slate-800', 'bg-white border-slate-200 shadow-sm')}`}>
                <div className="flex items-center gap-1"><Clock className="w-4 h-4 text-amber-500" /><span className={`text-[9px] font-mono ${t('text-slate-500', 'text-slate-500')}`}>WAKTU</span></div>
                <span className={`text-sm font-mono ${t('text-amber-400', 'text-amber-600')}`}>{formatTime(flightTime)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: MISSION PLANNER */}
        <div className={`flex-[0.65] rounded-lg overflow-hidden shadow-lg flex min-h-[350px] border ${t('bg-slate-900 border-slate-700', 'bg-white border-slate-300')}`}>

          {/* AREA KIRI: MAP + TABEL */}
          <div className={`w-2/3 flex flex-col border-r h-full ${t('border-slate-700', 'border-slate-300')}`}>

            {/* TABS HEADER */}
            <div className={`h-9 border-b flex items-center shrink-0 ${t('bg-slate-800 border-slate-700', 'bg-slate-100 border-slate-300')}`}>
              <button onClick={() => setActiveMapTab('map')} className={`h-full px-4 flex items-center gap-2 text-[10px] font-bold transition ${activeMapTab === 'map' ? t('bg-[#131f18] text-emerald-400 border-t-2 border-emerald-500', 'bg-white text-emerald-600 border-t-2 border-emerald-500') : t('text-slate-400 hover:bg-slate-700', 'text-slate-500 hover:bg-slate-200')}`}>
                <MapIcon className="w-3.5 h-3.5" /> GAMBAR 2D KEBUN
              </button>
              <button onClick={() => setActiveMapTab('management')} className={`h-full px-4 flex items-center gap-2 text-[10px] font-bold transition ${activeMapTab === 'management' ? t('bg-[#131f18] text-sky-400 border-t-2 border-sky-500', 'bg-white text-sky-600 border-t-2 border-sky-500') : t('text-slate-400 hover:bg-slate-700', 'text-slate-500 hover:bg-slate-200')}`}>
                <TableProperties className="w-3.5 h-3.5" /> DATA MANAJEMEN BLOK
              </button>
              <div className={`ml-auto px-3 text-[9px] font-mono ${t('text-slate-400', 'text-slate-500')}`}>
                {activeMapTab === 'map' && warning && <span className="text-rose-500 font-bold animate-pulse">{warning}</span>}
                {activeMapTab === 'map' && editingMissionId && isMapActive && <span className={`${t('text-amber-400', 'text-amber-600')} font-bold`}><Edit className="w-3 h-3 inline mr-1" />MODE EDIT: {missionName}</span>}
              </div>
            </div>

            {/* KONTEN AREA: MAP ATAU MANAJEMEN */}
            <div className={`h-[60%] relative overflow-hidden flex flex-col border-b ${t('bg-[#131f18] border-slate-700', 'bg-slate-100 border-slate-300')}`}>
              {activeMapTab === 'map' ? (
                <div className={`w-full h-full relative ${!isMapActive && !isMissionSaved ? 'opacity-40 grayscale-[70%]' : ''} ${isMapActive ? 'cursor-crosshair' : 'cursor-not-allowed'}`}>
                  <svg className="w-full h-full p-2" viewBox={`-35 -20 ${max_x + 50} ${max_y + 40}`} preserveAspectRatio="xMidYMid meet">
                    <rect x="-40" y="-30" width="20" height={max_y + 60} fill={t("#27272a", "#cbd5e1")} />
                    <rect x="-5" y="-5" width={max_x + 10} height={max_y + 10} fill={t("#10b981", "#10b981")} fillOpacity="0.05" stroke={t("#facc15", "#d97706")} strokeWidth="0.5" strokeDasharray="3 3" />
                    <text x="0" y="-8" fill={t("#facc15", "#d97706")} fontSize="3" fontWeight="bold">{config.namaBlok} ({config.totalPohon} Pohon)</text>

                    {/* Koridor QLV */}
                    {scanMode === 'qlv' && qlvPath.map((wp, i) => (
                      <g key={wp.id}>
                        <circle cx={wp.x} cy={wp.y} r="0.8" fill={t("#f59e0b", "#d97706")} className={flightStatusUI !== 'STANDBY' ? 'animate-pulse' : ''} />
                        <text x={wp.x} y={wp.y - 1.5} fontSize="1.5" fill={t("#fcd34d", "#b45309")} textAnchor="middle">W{i + 1}</text>
                      </g>
                    ))}

                    {/* Rute */}
                    {pathString && <polyline points={pathString} fill="none" stroke={flightStatusUI !== 'STANDBY' ? t("#38bdf8", "#0284c7") : (isMissionSaved ? t("#10b981", "#059669") : t("#0ea5e9", "#0284c7"))} strokeWidth="1" strokeDasharray="3 2" className={flightStatusUI !== 'STANDBY' ? 'animate-pulse' : ''} />}

                    {/* Pohon */}
                    {trees.map(tree => {
                      let isSelected = false; let wpIndex = -1; let qlvIndex = -1;
                      if (scanMode === 'traditional' && tradPath.length > 0) { wpIndex = tradPath.findIndex(w => w.id === tree.id); isSelected = wpIndex !== -1; }
                      else if (scanMode === 'qlv' && qlvTargetTrees.length > 0) { qlvIndex = qlvTargetTrees.findIndex(t => t.id === tree.id); isSelected = qlvIndex !== -1; }
                      else { wpIndex = waypoints.findIndex(w => w.id === tree.id); isSelected = wpIndex !== -1; }

                      let isScanned = false;
                      const isFlying = flightStatusUI !== 'STANDBY' && flightStatusUI !== 'TAKEOFF';
                      const isDone = flightStatusUI === 'STANDBY' && scannedTrees > 0;
                      if (isFlying || isDone) {
                        if (scanMode === 'traditional' && tradPath.length > 0 && wpIndex !== -1) {
                          if (isDone || flightStatusUI === 'RTL' || flightStatusUI === 'LANDING' || wpIndex < currentWpIndexRef.current) isScanned = true;
                        } else if (scanMode === 'qlv' && isSelected) {
                          if (isDone || flightStatusUI === 'RTL' || flightStatusUI === 'LANDING') isScanned = true;
                          else if (qlvIndex !== -1 && qlvIndex < scannedTrees) isScanned = true;
                        }
                      }

                      let fillColor = isSelected ? (isMissionSaved ? t("#10b981", "#10b981") : t("#0ea5e9", "#0ea5e9")) : t("#166534", "#22c55e");
                      let strokeColor = isSelected ? (isMissionSaved ? t("#a7f3d0", "#059669") : t("#bae6fd", "#0284c7")) : t("#4ade80", "#15803d");
                      if (isScanned) { fillColor = "#eab308"; strokeColor = "#fef08a"; }

                      return (
                        <g key={tree.id} transform={`translate(${tree.x}, ${tree.y})`} onClick={() => toggleWaypoint(tree)} className={`group ${isMapActive ? 'cursor-pointer' : ''}`}>
                          {isMapActive && <circle r={tree.crownRadius * 1.5} fill="transparent" className="group-hover:fill-sky-500/20 transition-colors" />}
                          <circle r={isSelected && !isScanned ? tree.crownRadius + 0.8 : tree.crownRadius} fill={fillColor} stroke={strokeColor} strokeWidth="0.5" className={`transition-all duration-200 ${isMapActive ? 'group-hover:scale-110' : ''}`} />
                          <circle r="0.6" fill="rgba(255,255,255,0.4)" />
                          {isSelected && scanMode === 'traditional' && (
                            <g transform={`translate(${tree.crownRadius + 1}, -${tree.crownRadius + 1})`}>
                              <circle r="2" fill={isScanned ? "#ca8a04" : (isMissionSaved ? t("#059669", "#047857") : t("#0284c7", "#0369a1"))} />
                              <text x="0" y="0.7" fontSize="1.8" fill="white" textAnchor="middle" fontWeight="bold">{wpIndex + 1}</text>
                            </g>
                          )}
                          {isSelected && scanMode === 'qlv' && !isScanned && (
                            <circle cx={tree.crownRadius + 1} cy={-(tree.crownRadius + 1)} r="1" fill={isMissionSaved ? t("#059669", "#047857") : t("#0284c7", "#0369a1")} />
                          )}
                        </g>
                      );
                    })}

                    {/* HOME Point */}
                    <g transform={`translate(${homeWP.x}, ${homeWP.y})`}>
                      <rect x="-4" y="-3" width="8" height="6" fill="#f59e0b" stroke="#fef3c7" strokeWidth="0.5" rx="1" />
                      <circle cx="0" cy="0" r="1" fill="white" />
                      <text x="0" y="5" fontSize="2.5" fill={t("#fff", "#000")} textAnchor="middle" fontWeight="bold">START</text>
                    </g>

                    {/* Drone position */}
                    {flightStatusUI !== 'STANDBY' && (
                      <g transform={`translate(${telemetry.x}, ${telemetry.y}) rotate(${telemetry.yaw - 90})`}>
                        <polygon points="-2.5,-2.5 2.5,-2.5 0,4" fill={t("#38bdf8", "#0284c7")} stroke="#fff" strokeWidth="0.5" />
                        <circle cx="0" cy="0" r="1" fill="#facc15" />
                      </g>
                    )}
                  </svg>

                  {/* Overlay: Total Scan */}
                  <div className={`absolute bottom-2 left-2 flex items-center gap-2 px-3 py-1.5 rounded shadow-md text-[10px] font-black border ${t('bg-slate-900/90 border-slate-700 text-sky-400', 'bg-white/90 border-slate-300 text-sky-600')}`}>
                    <Activity className="w-3.5 h-3.5" />
                    <span>TOTAL SCAN: <span className="text-sm ml-1 text-white bg-slate-800 px-1 rounded">{scannedTrees}</span> / {baseTotalSample} POHON</span>
                  </div>

                  {/* Legenda */}
                  <div className={`absolute bottom-2 right-2 flex items-center gap-3 px-2 py-1.5 rounded shadow-md text-[9px] font-bold ${t('bg-slate-900/90 border border-slate-700 text-slate-300', 'bg-white/90 border border-slate-300 text-slate-700')}`}>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#166534] border border-[#4ade80]"></div>Belum Scan</div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-yellow-500 border border-yellow-200"></div>Sudah Terscan</div>
                  </div>
                </div>
              ) : (
                /* MANAJEMEN BLOK TABLE */
                <div className={`w-full h-full flex flex-col ${t('bg-slate-950/50', 'bg-slate-50')}`}>
                  <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-left text-[10px]">
                      <thead className={`sticky top-0 z-10 border-b ${t('bg-slate-900 text-slate-400 border-slate-700', 'bg-slate-200 text-slate-700 border-slate-300')}`}>
                        <tr><th className="p-2">Nama Blok</th><th className="p-2 text-center">Luas (Ha)</th><th className="p-2 text-center">Pohon</th><th className="p-2 text-center">Tinggi (m)</th><th className="p-2 text-center">Sampel</th><th className="p-2 text-center">Status</th><th className="p-2 text-center">Aksi</th></tr>
                      </thead>
                      <tbody className={t('text-slate-300', 'text-slate-700')}>
                        {managedBlocks.map(block => (
                          <tr key={block.id} className={`border-b ${t('border-slate-800 hover:bg-slate-800/60', 'border-slate-200 hover:bg-slate-100')}`}>
                            <td className={`p-2 font-bold ${t('text-sky-300', 'text-sky-700')}`}>{block.namaBlok}</td>
                            <td className="p-2 text-center">{block.luasKebun}</td>
                            <td className="p-2 text-center">{block.totalPohon}</td>
                            <td className={`p-2 text-center ${t('text-emerald-300', 'text-emerald-600')}`}>{block.tinggiPohon}</td>
                            <td className={`p-2 text-center font-bold ${t('text-amber-400', 'text-amber-600')}`}>{block.jumlahSampel}</td>
                            <td className="p-2 text-center"><CheckCircle2 className={`w-3 h-3 inline ${t('text-emerald-500', 'text-emerald-600')}`} /> {block.status}</td>
                            <td className="p-2 text-center">
                              <div className="flex justify-center gap-2">
                                <button onClick={() => loadBlock(block)} className={`p-1.5 rounded ${t('text-sky-400 bg-sky-900/30', 'text-sky-600 bg-sky-50')}`}><MapIcon className="w-3 h-3" /></button>
                                <button onClick={() => deleteBlock(block.id)} className={`p-1.5 rounded ${t('text-rose-400 bg-rose-900/30', 'text-rose-600 bg-rose-50')}`}><Trash2 className="w-3 h-3" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {managedBlocks.length === 0 && <tr><td colSpan="7" className="text-center p-4 text-slate-500 italic">Belum ada data.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                  <div className={`p-2 flex justify-end gap-2 border-t ${t('bg-slate-900 border-slate-700', 'bg-slate-100 border-slate-300')}`}>
                    <button onClick={() => setManagedBlocks([])} className={`flex items-center gap-1 px-3 py-1.5 rounded text-[9px] font-bold border ${t('bg-rose-900/50 text-rose-400 border-rose-700/50 hover:bg-rose-600 hover:text-white', 'bg-white text-rose-600 border-rose-200 hover:bg-rose-50')}`}><Trash2 className="w-3 h-3" /> CLEAR</button>
                    <button onClick={handleExportExcel} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[9px] font-bold"><Download className="w-3 h-3" /> EKSPORT CSV</button>
                  </div>
                </div>
              )}
            </div>

            {/* TABEL BAWAH: WP AKTIF & REKAP MISI */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className={`px-2 py-1.5 flex items-center justify-between shrink-0 border-b ${t('bg-slate-800/80 border-slate-700', 'bg-slate-100 border-slate-300')}`}>
                <div className="flex gap-2">
                  <button onClick={() => setActiveTab('current')} className={`text-[9px] font-bold px-3 py-1.5 rounded flex items-center gap-1 transition ${activeTab === 'current' ? 'bg-sky-600 text-white' : t('bg-slate-900 text-slate-400', 'bg-white text-slate-600 border border-slate-300')}`}><TableProperties className="w-3 h-3" /> WP AKTIF</button>
                  <button onClick={() => setActiveTab('history')} className={`text-[9px] font-bold px-3 py-1.5 rounded flex items-center gap-1 transition ${activeTab === 'history' ? 'bg-emerald-600 text-white' : t('bg-slate-900 text-slate-400', 'bg-white text-slate-600 border border-slate-300')}`}><Database className="w-3 h-3" /> REKAP MISI <span className={`px-1.5 py-0.5 rounded-full ml-1 ${t('bg-emerald-950 text-emerald-300', 'bg-emerald-100 text-emerald-700')}`}>{savedMissions.length}</span></button>
                </div>
              </div>
              <div className={`flex-1 overflow-hidden ${t('bg-slate-950', 'bg-slate-50')}`}>
                {activeTab === 'current' && (
                  <div className="h-full overflow-y-auto">
                    {waypoints.length === 0 && scanMode !== 'qlv' ? (
                      <div className="flex items-center justify-center h-full text-slate-500 text-[10px] italic">Klik pohon di Peta 2D untuk mengisi tabel.</div>
                    ) : scanMode === 'qlv' && waypoints.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-sky-500 text-[10px] italic font-bold">MODE QLV AKTIF — Auto Generate Path</div>
                    ) : (
                      <table className="w-full text-left text-[10px]">
                        <thead className={`sticky top-0 border-b ${t('bg-slate-950/80 text-slate-400 border-slate-800', 'bg-slate-200 text-slate-700 border-slate-300')}`}>
                          <tr><th className="p-1.5">No.WP</th><th className="p-1.5">ID Pohon</th><th className="p-1.5">X,Y (m)</th><th className={`p-1.5 ${t('text-emerald-300', 'text-emerald-700')}`}>Latitude</th><th className={`p-1.5 ${t('text-emerald-300', 'text-emerald-700')}`}>Longitude</th></tr>
                        </thead>
                        <tbody className={t('text-slate-300', 'text-slate-700')}>
                          {(scanMode === 'qlv' ? qlvPath : (scanMode === 'traditional' && tradPath.length > 0 ? tradPath : waypoints)).map((wp, i) => (
                            <tr key={wp.id + i} className={`border-b ${t('border-slate-800 hover:bg-slate-800/60', 'border-slate-200 hover:bg-slate-100')}`}>
                              <td className={`p-1.5 font-bold ${t('text-sky-400', 'text-sky-600')}`}>{i + 1}</td>
                              <td className="p-1.5 font-bold">{wp.id}</td>
                              <td className="p-1.5 font-mono">{wp.x.toFixed(1)}, {wp.y.toFixed(1)}</td>
                              <td className={`p-1.5 font-mono ${t('text-emerald-200', 'text-emerald-800')}`}>{wp.lat.toFixed(6)}</td>
                              <td className={`p-1.5 font-mono ${t('text-emerald-200', 'text-emerald-800')}`}>{wp.lon.toFixed(6)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
                {activeTab === 'history' && (
                  <div className="h-full overflow-y-auto">
                    {savedMissions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-500 text-[10px] italic"><Archive className="w-8 h-8 mb-2 opacity-30" />Belum ada rekap misi.</div>
                    ) : (
                      <table className="w-full text-left text-[10px]">
                        <thead className={`sticky top-0 border-b ${t('bg-slate-900 text-slate-400 border-slate-700', 'bg-slate-200 text-slate-700 border-slate-300')}`}>
                          <tr><th className="p-2 text-center">Pilih</th><th className="p-2">Nama Misi</th><th className="p-2 text-center">WP</th><th className="p-2">Algoritma & Scan</th><th className="p-2">Waktu</th><th className="p-2 text-center">Aksi</th></tr>
                        </thead>
                        <tbody className={t('text-slate-300', 'text-slate-700')}>
                          {savedMissions.map(mission => {
                            const isSel = selectedMissionId === mission.id;
                            return (
                              <tr key={mission.id} onClick={() => setSelectedMissionId(mission.id)} className={`border-b cursor-pointer ${isSel ? t('bg-sky-900/40 border-sky-500/50', 'bg-sky-50 border-sky-300') : t('hover:bg-slate-800/60 border-slate-800', 'hover:bg-slate-100 border-slate-200')}`}>
                                <td className="p-2 text-center"><div className={`w-3 h-3 rounded-full border mx-auto flex items-center justify-center ${isSel ? 'border-sky-400 bg-sky-500' : t('border-slate-500', 'border-slate-400')}`}>{isSel && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}</div></td>
                                <td className={`p-2 font-bold ${isSel ? t('text-sky-300', 'text-sky-700') : t('text-white', 'text-slate-900')}`}>{mission.name}</td>
                                <td className="p-2 text-center">{mission.wpCount}</td>
                                <td className={`p-2 text-[9px] ${t('text-slate-400', 'text-slate-600')}`}>{mission.algorithm === 'dead_reckoning' ? 'DR' : mission.algorithm === 'live_reckoning' ? 'Live' : 'Hybrid'} | {mission.scan === 'qlv' ? 'QLV' : 'Trad'}</td>
                                <td className={`p-2 text-[9px] ${t('text-slate-500', 'text-slate-500')}`}>{mission.date}</td>
                                <td className="p-2 text-center"><button onClick={(e) => loadMissionForEdit(mission.id, e)} className={`p-1.5 rounded ${t('text-amber-400 bg-amber-900/30', 'text-amber-600 bg-amber-50')}`}><Edit className="w-3 h-3" /></button></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AREA KANAN: WORKFLOW SIDEBAR */}
          <div className={`w-1/3 flex flex-col overflow-y-auto border-l ${t('bg-slate-800/50 border-slate-700', 'bg-slate-50 border-slate-300')}`}>

            {/* 1. PARAMETER BLOK */}
            <div className={`p-2.5 border-b flex flex-col gap-2 ${t('bg-slate-900/80 border-slate-700', 'bg-white border-slate-300')}`}>
              <h3 className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${t('text-emerald-400', 'text-emerald-600')}`}><TreeDeciduous className="w-3 h-3" /> Parameter Blok</h3>
              <div>
                <label className={`text-[8px] font-mono block mb-1 ${t('text-slate-500', 'text-slate-500')}`}>NAMA BLOK</label>
                <input type="text" value={config.namaBlok} onChange={(e) => handleConfigChange(e, 'namaBlok')} disabled={isMapActive || isMissionSaved} className={`w-full border rounded p-1 text-[10px] font-mono focus:outline-none disabled:opacity-50 ${t('bg-slate-950 border-slate-700 text-white focus:border-sky-500', 'bg-white border-slate-300 text-slate-900 focus:border-sky-500')}`} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className={`text-[8px] font-mono block mb-1 ${t('text-slate-500', 'text-slate-500')}`}>LUAS (Ha)</label><input type="number" step="0.1" min="0.1" value={config.luasKebun} onChange={(e) => handleConfigChange(e, 'luasKebun')} disabled={isMapActive || isMissionSaved} className={`w-full border rounded p-1 text-[10px] font-mono focus:outline-none disabled:opacity-50 ${t('bg-slate-950 border-slate-700 text-white', 'bg-white border-slate-300 text-slate-900')}`} /></div>
                <div><label className={`text-[8px] font-mono block mb-1 ${t('text-slate-500', 'text-slate-500')}`}>TOTAL POHON</label><input type="number" min="10" value={config.totalPohon} onChange={(e) => handleConfigChange(e, 'totalPohon')} disabled={isMapActive || isMissionSaved} className={`w-full border rounded p-1 text-[10px] font-mono focus:outline-none disabled:opacity-50 ${t('bg-slate-950 border-slate-700 text-white', 'bg-white border-slate-300 text-slate-900')}`} /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className={`text-[8px] font-mono block mb-1 ${t('text-slate-500', 'text-slate-500')}`}>SAMPEL (10%)</label><input type="number" value={config.jumlahSampel} readOnly disabled className={`w-full border rounded p-1 text-[10px] font-mono opacity-70 cursor-not-allowed ${t('bg-slate-950 border-slate-700 text-sky-400', 'bg-slate-100 border-slate-300 text-sky-600')}`} /></div>
                <div><label className={`text-[8px] font-mono block mb-1 ${t('text-slate-500', 'text-slate-500')}`}>TINGGI (m)</label><input type="number" step="0.5" min="2" value={config.tinggiPohon} onChange={(e) => handleConfigChange(e, 'tinggiPohon')} disabled={isMapActive || isMissionSaved} className={`w-full border rounded p-1 text-[10px] font-mono focus:outline-none disabled:opacity-50 ${t('bg-slate-950 border-slate-700 text-emerald-400', 'bg-white border-slate-300 text-emerald-600')}`} /></div>
              </div>
              <button onClick={handleSaveBlock} disabled={isMapActive || isMissionSaved} className={`w-full flex items-center justify-center gap-1 p-1.5 rounded text-[9px] font-bold transition disabled:opacity-50 border ${t('bg-slate-800 border-emerald-500/50 hover:bg-emerald-900/50 text-emerald-400', 'bg-white border-emerald-200 hover:bg-emerald-50 text-emerald-600')}`}><CheckSquare className="w-3 h-3" /> SIMPAN KE MANAJEMEN</button>
            </div>

            {/* 2. NAVIGASI & MODE SCAN */}
            <div className={`p-2.5 border-b flex flex-col gap-2 ${t('bg-slate-900 border-slate-700', 'bg-white border-slate-300')}`}>
              <h3 className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${t('text-emerald-400', 'text-emerald-600')}`}><Navigation className="w-3 h-3" /> Navigasi & Mode Scan</h3>
              <div>
                <label className={`text-[8px] font-mono block mb-1 ${t('text-slate-400', 'text-slate-500')}`}>ALGORITMA <span className="text-rose-500">*</span></label>
                <select value={navAlgorithm} onChange={(e) => setNavAlgorithm(e.target.value)} disabled={isMissionSaved} className={`w-full border rounded p-1 text-[10px] font-mono focus:outline-none disabled:opacity-50 ${t('bg-slate-950 border-slate-700 text-white', 'bg-white border-slate-300 text-slate-900')}`}>
                  <option value="">Pilih Algoritma...</option>
                  <option value="dead_reckoning">Dead Reckoning</option>
                  <option value="live_reckoning">Live Reckoning</option>
                  <option value="hybrid">Hybrid System</option>
                </select>
              </div>
              <div>
                <label className={`text-[8px] font-mono block mb-1 ${t('text-slate-400', 'text-slate-500')}`}>MODE SCAN <span className="text-rose-500">*</span></label>
                <select value={scanMode} onChange={(e) => setScanMode(e.target.value)} disabled={isMissionSaved} className={`w-full border rounded p-1 text-[10px] font-mono focus:outline-none disabled:opacity-50 ${t('bg-slate-950 border-slate-700 text-white', 'bg-white border-slate-300 text-slate-900')}`}>
                  <option value="">Pilih Mode Scan...</option>
                  <option value="traditional">Traditional Scan</option>
                  <option value="qlv">QLV (Koridor)</option>
                </select>
              </div>
            </div>

            {/* 3. IDENTITAS & KONTROL MISI */}
            <div className={`p-2.5 border-b flex flex-col gap-2 ${t('bg-slate-900 border-slate-700', 'bg-white border-slate-300')}`}>
              <label className={`text-[9px] font-bold uppercase tracking-wider ${t('text-sky-400', 'text-sky-600')}`}>Identitas Misi</label>
              <input type="text" placeholder="Nama Misi" value={missionName} onChange={(e) => setMissionName(e.target.value)} disabled={isMapActive || isMissionSaved} className={`w-full border rounded p-1.5 text-[10px] font-bold focus:outline-none disabled:opacity-50 ${t('bg-slate-950 border-slate-700 text-white focus:border-sky-500', 'bg-white border-slate-300 text-slate-900 focus:border-sky-500')}`} />
              {!isMapActive && !isMissionSaved && (
                <button onClick={handleStartWaypoint} className="w-full flex items-center justify-center gap-1 p-1.5 rounded text-[9px] font-bold bg-sky-600 hover:bg-sky-500 text-white transition shadow-md"><Unlock className="w-3 h-3" /> AKTIFKAN PETA / BUAT MISI</button>
              )}
              {isMapActive && (
                <div className={`border p-2 rounded flex flex-col gap-2 ${editingMissionId ? t('bg-amber-900/20 border-amber-500/50', 'bg-amber-50 border-amber-300') : t('bg-sky-900/30 border-sky-500/50', 'bg-sky-50 border-sky-300')}`}>
                  <span className={`text-[9px] font-bold flex items-center gap-1 ${editingMissionId ? t('text-amber-400', 'text-amber-600') : t('text-sky-300', 'text-sky-600')}`}>
                    {editingMissionId ? <Edit className="w-3 h-3" /> : <MousePointerClick className="w-3 h-3" />}
                    {getWaypointInstruction()}
                  </span>
                  <button onClick={handleSaveMission} disabled={scanMode === 'traditional' ? waypoints.length !== 3 : waypoints.length === 0} className={`w-full flex items-center justify-center gap-1 p-1.5 rounded text-[9px] font-bold text-white disabled:opacity-50 ${editingMissionId ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}>
                    <Save className="w-3 h-3" /> {editingMissionId ? 'UPDATE MISI' : 'SIMPAN KE REKAP'}
                  </button>
                </div>
              )}
            </div>

            {/* 4. LIVE AI VISION */}
            <div className={`p-2.5 border-b flex flex-col gap-2 ${t('bg-slate-950 border-slate-700', 'bg-slate-50 border-slate-300')}`}>
              <h3 className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${t('text-rose-400', 'text-rose-600')}`}><Camera className="w-3 h-3" /> Live AI Vision</h3>
              <div className={`p-2 rounded border ${t('bg-slate-900 border-slate-800', 'bg-white border-slate-200')}`}>
                {flightStatusUI === 'STANDBY' ? (
                  <div className="flex flex-col items-center py-2 opacity-50"><Camera className="w-6 h-6 mb-1 text-slate-500" /><span className="text-[9px] font-mono text-slate-500">Kamera Siaga...</span></div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center border-b border-slate-700/50 pb-1">
                      <span className={`text-[8px] font-mono ${t('text-slate-400', 'text-slate-500')}`}>STATUS OBJEK</span>
                      {liveAiVision.isPalmFruit ? <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded animate-pulse ${t('bg-emerald-500/20 text-emerald-400', 'bg-emerald-100 text-emerald-700')}`}>SAWIT TERDETEKSI</span> : <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${t('bg-slate-500/20 text-slate-400', 'bg-slate-200 text-slate-600')}`}>SCANNING...</span>}
                    </div>
                    <span className={`text-[12px] font-bold ${t('text-white', 'text-slate-800')}`}>{liveAiVision.objectDetected}</span>
                    {liveAiVision.isPalmFruit && (
                      <div className="flex justify-between items-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${liveAiVision.condition === 'Matang' ? 'bg-orange-500 text-white' : 'bg-slate-500 text-white'}`}>{liveAiVision.condition}</span>
                        <span className={`text-[9px] font-mono ${t('text-sky-400', 'text-sky-600')}`}>Conf: {liveAiVision.confidence}%</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 5. STATISTIK SAMPEL */}
            <div className={`p-2.5 border-b flex flex-col gap-2 ${t('bg-slate-950 border-slate-700', 'bg-slate-50 border-slate-300')}`}>
              <h3 className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${t('text-orange-400', 'text-orange-600')}`}><BarChart3 className="w-3 h-3" /> Statistik Sampel</h3>
              <div className={`p-2 rounded border ${t('bg-slate-900 border-slate-800', 'bg-white border-slate-200')}`}>
                <div className={`flex justify-between pb-1 mb-2 border-b ${t('border-slate-800', 'border-slate-200')}`}>
                  <span className={`text-[9px] ${t('text-slate-400', 'text-slate-500')}`}>Total Scan / Sampel:</span>
                  <span className={`text-lg font-mono font-bold ${t('text-white', 'text-slate-900')}`}>{scannedTrees} <span className="text-[10px] text-slate-500">/ {baseTotalSample}</span></span>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-[9px] mb-1"><span className={`font-bold ${t('text-orange-500', 'text-orange-600')}`}>● MATANG</span><span className={t('text-slate-300', 'text-slate-700')}>{matangCount} ({matangPercent}%)</span></div>
                  <div className={`w-full rounded-full h-1.5 ${t('bg-slate-800', 'bg-slate-200')}`}><div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${matangPercent}%` }}></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-[9px] mb-1"><span className={`font-bold ${t('text-slate-400', 'text-slate-600')}`}>● BELUM MATANG</span><span className={t('text-slate-300', 'text-slate-700')}>{belumMatangCount} ({belumMatangPercent}%)</span></div>
                  <div className={`w-full rounded-full h-1.5 ${t('bg-slate-800', 'bg-slate-200')}`}><div className="bg-slate-400 h-1.5 rounded-full" style={{ width: `${belumMatangPercent}%` }}></div></div>
                </div>
              </div>
            </div>

            {/* 6. UPLOAD KE DRONE */}
            <div className={`p-2 flex flex-col gap-2 mt-auto ${t('bg-slate-900', 'bg-slate-100')}`}>
              {isUploadReady ? (
                <div className={`flex flex-col gap-2 p-2 rounded border ${t('bg-sky-950/40 border-sky-900/50', 'bg-sky-50 border-sky-200')}`}>
                  <label className={`text-[9px] font-mono ${t('text-slate-400', 'text-slate-500')}`}>TARGET DRONE</label>
                  <select value={selectedUploadDrone} onChange={(e) => setSelectedUploadDrone(e.target.value)} className={`w-full border rounded p-1.5 text-[10px] font-mono focus:outline-none ${t('bg-slate-900 border-slate-700 text-white', 'bg-white border-slate-300 text-slate-900')}`}>
                    <option value="">-- Pilih Drone --</option>
                    {drones.map(d => <option key={d.id} value={d.id} disabled={d.status !== 'Standby'}>{d.id} - {d.merk} {d.status !== 'Standby' ? `(${d.status})` : ''}</option>)}
                  </select>
                  <button disabled={!selectedUploadDrone} onClick={() => { setWarning(`Misi berhasil diupload ke Drone ${selectedUploadDrone}`); setTimeout(() => setWarning(''), 4000); }} className={`w-full flex items-center justify-center gap-1 p-2 rounded text-[10px] font-bold transition ${selectedUploadDrone ? 'bg-sky-600 hover:bg-sky-500 text-white animate-pulse' : t('bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed', 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed')}`}>
                    <Send className="w-4 h-4" /> UPLOAD KE DRONE
                  </button>
                </div>
              ) : (
                <button disabled className={`w-full flex items-center justify-center gap-1 p-2.5 rounded text-[10px] font-bold cursor-not-allowed border ${t('bg-slate-800 text-slate-500 border-slate-700', 'bg-slate-200 text-slate-400 border-slate-300')}`}>
                  <Send className="w-4 h-4" /> PILIH MISI DARI REKAP
                </button>
              )}
              <button onClick={handleResetDraft} className={`w-full flex items-center justify-center gap-1 p-1.5 rounded text-[9px] font-bold transition border ${t('bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-400 border-slate-700', 'bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border-slate-300')}`}>
                <Trash2 className="w-3 h-3" /> BATALKAN / RESET DRAFT
              </button>
            </div>

          </div>
        </div>
      </main>

      {/* ======== MODAL SETTINGS ======== */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-lg shadow-2xl w-[800px] max-w-full h-[560px] flex flex-col overflow-hidden ${t('bg-slate-900 border-slate-700', 'bg-white border-slate-300')}`}>
            <div className={`flex items-center justify-between px-4 py-3 border-b ${t('bg-slate-950 border-slate-800', 'bg-slate-50 border-slate-200')}`}>
              <div className={`flex items-center gap-2 ${t('text-sky-400', 'text-sky-600')}`}><Settings className="w-5 h-5" /><span className="font-bold text-sm uppercase tracking-wide">PENGATURAN SISTEM GCS</span></div>
              <button onClick={() => setIsSettingsOpen(false)} className={t('text-slate-400 hover:text-rose-400', 'text-slate-500 hover:text-rose-600')}><X className="w-5 h-5" /></button>
            </div>
            <div className="flex flex-1 overflow-hidden">
              {/* Tree Nav */}
              <div className={`w-1/3 border-r p-4 flex flex-col gap-4 overflow-y-auto ${t('bg-slate-950/50 border-slate-800', 'bg-slate-50 border-slate-200')}`}>
                <div>
                  <div className={`flex items-center gap-2 text-[11px] font-bold mb-2 uppercase tracking-widest ${t('text-slate-400', 'text-slate-600')}`}><ChevronDown className="w-4 h-4" /> UMUM & KONEKSI</div>
                  <div className={`pl-5 flex flex-col gap-1 border-l ml-2 ${t('border-slate-800', 'border-slate-300')}`}>
                    {[['mode', Cpu, 'Sistem & Tampilan'], ['telemetry', Radio, 'Telemetri Data'], ['video', Video, 'Video Stream'], ['drones', Plane, 'Manajemen Drone'], ['raw_data', ListTree, 'Raw Data Sensor']].map(([key, Icon, label]) => (
                      <button key={key} onClick={() => setActiveSettingNode(key)} className={`text-left text-xs px-3 py-2 rounded transition ${activeSettingNode === key ? t('bg-sky-600/20 text-sky-400 border border-sky-600/50', 'bg-sky-50 text-sky-700 border border-sky-300') : t('text-slate-300 hover:bg-slate-800/50', 'text-slate-600 hover:bg-slate-200')}`}>
                        <div className="flex items-center gap-2"><Icon className="w-3.5 h-3.5" /> {label}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className={`flex items-center gap-2 text-[11px] font-bold mb-2 uppercase tracking-widest ${t('text-slate-400', 'text-slate-600')}`}><ChevronDown className="w-4 h-4" /> KECERDASAN BUATAN</div>
                  <div className={`pl-5 flex flex-col gap-1 border-l ml-2 ${t('border-slate-800', 'border-slate-300')}`}>
                    <button onClick={() => setActiveSettingNode('ai')} className={`text-left text-xs px-3 py-2 rounded transition ${activeSettingNode === 'ai' ? t('bg-orange-600/20 text-orange-400 border border-orange-600/50', 'bg-orange-50 text-orange-700 border border-orange-300') : t('text-slate-300 hover:bg-slate-800/50', 'text-slate-600 hover:bg-slate-200')}`}>
                      <div className="flex items-center gap-2"><Bot className="w-3.5 h-3.5" /> AI Assistant (Gemini)</div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className={`w-2/3 p-6 overflow-y-auto ${t('bg-slate-900 text-slate-200', 'bg-white text-slate-800')}`}>

                {activeSettingNode === 'mode' && (
                  <div className="flex flex-col gap-6">
                    <div><h2 className={`text-lg font-bold flex items-center gap-2 mb-1 ${t('text-white', 'text-slate-900')}`}><Cpu className="w-5 h-5 text-sky-500" /> Sistem & Tampilan</h2><p className={`text-xs ${t('text-slate-400', 'text-slate-500')}`}>Atur mode operasional drone dan tema antarmuka.</p></div>
                    <div className="grid grid-cols-2 gap-4">
                      {[['simulasi', MonitorPlay, 'Mode Simulasi', 'Webcam Laptop & Dummy GPS', 'sky'], ['real', Plane, 'Mode Real', 'Hardware Drone Langsung', 'orange']].map(([mode, Icon, title, desc, color]) => (
                        <div key={mode} onClick={() => setDroneMode(mode)} className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center gap-3 transition-all ${droneMode === mode ? `bg-${color}-500/10 border-${color}-500` : t('bg-slate-950 border-slate-700 opacity-60 hover:border-slate-500', 'bg-slate-50 border-slate-300 opacity-60 hover:border-slate-400')}`}>
                          <Icon className={`w-8 h-8 ${droneMode === mode ? `text-${color}-500` : 'text-slate-400'}`} />
                          <div className="text-center"><h3 className={`font-bold text-sm mb-1 ${t('text-white', 'text-slate-800')}`}>{title}</h3><p className={`text-[10px] ${t('text-slate-400', 'text-slate-500')}`}>{desc}</p></div>
                        </div>
                      ))}
                    </div>
                    <div className={`pt-6 border-t ${t('border-slate-800', 'border-slate-200')}`}>
                      <h2 className={`text-sm font-bold flex items-center gap-2 mb-4 ${t('text-white', 'text-slate-900')}`}><Palette className="w-4 h-4 text-purple-500" /> Tema Antarmuka</h2>
                      <div className="grid grid-cols-2 gap-4">
                        {[['dark', Moon, 'Dark Mode', 'text-purple-400'], ['light', Sun, 'Light Mode', 'text-purple-600']].map(([th, Icon, label, col]) => (
                          <div key={th} onClick={() => setTheme(th)} className={`cursor-pointer border rounded-lg p-3 flex flex-col items-center gap-2 transition-all ${theme === th ? 'bg-purple-500/10 border-purple-500' : t('bg-slate-950 border-slate-700 opacity-60', 'bg-slate-50 border-slate-300 opacity-60')}`}>
                            <Icon className={`w-6 h-6 ${theme === th ? col : 'text-slate-400'}`} />
                            <span className={`font-bold text-xs ${t('text-white', 'text-slate-800')}`}>{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeSettingNode === 'telemetry' && (
                  <div className="flex flex-col gap-6">
                    <div><h2 className={`text-lg font-bold flex items-center gap-2 mb-1 ${t('text-white', 'text-slate-900')}`}><Radio className="w-5 h-5 text-sky-500" /> Komunikasi Telemetri</h2><p className={`text-xs ${t('text-slate-400', 'text-slate-500')}`}>Web Serial API untuk koneksi modul radio telemetri (SiK, dll).</p></div>
                    <div><label className={`text-xs font-mono block mb-1 ${t('text-slate-400', 'text-slate-500')}`}>BAUD RATE</label>
                      <select value={telemBaud} onChange={(e) => setTelemBaud(e.target.value)} disabled={isTelemConnected} className={`w-full border rounded p-2 text-sm font-mono focus:outline-none disabled:opacity-50 ${t('bg-slate-950 border-slate-700 text-white', 'bg-white border-slate-300 text-slate-900')}`}>
                        {['9600', '57600', '115200', '921600'].map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    <div className={`pt-4 border-t ${t('border-slate-800', 'border-slate-200')}`}>
                      <div className={`flex justify-between items-center mb-3 p-3 border rounded ${t('bg-slate-950 border-slate-800', 'bg-slate-50 border-slate-200')}`}>
                        <span className={`text-xs ${t('text-slate-400', 'text-slate-500')}`}>Status:</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${isTelemConnected ? 'bg-sky-500/20 text-sky-400' : 'bg-rose-500/20 text-rose-500'}`}>{isTelemConnected ? 'CONNECTED' : 'DISCONNECTED'}</span>
                      </div>
                      <button onClick={handleConnectTelemetry} className={`w-full py-3 rounded text-sm font-bold flex items-center justify-center gap-2 text-white ${isTelemConnected ? 'bg-rose-600 hover:bg-rose-500' : 'bg-sky-600 hover:bg-sky-500'}`}>
                        <Power className="w-4 h-4" /> {isTelemConnected ? 'DISCONNECT' : (droneMode === 'simulasi' ? 'CONNECT SIMULATOR' : 'CONNECT VIA WEB SERIAL')}
                      </button>
                      {isTelemConnected && <p className="text-center text-xs text-sky-400 mt-2 animate-pulse font-mono">Menunggu packet heartbeat...</p>}
                    </div>
                  </div>
                )}

                {activeSettingNode === 'video' && (
                  <div className="flex flex-col gap-6">
                    <div><h2 className={`text-lg font-bold flex items-center gap-2 mb-1 ${t('text-white', 'text-slate-900')}`}><Video className="w-5 h-5 text-orange-500" /> Setting Video Stream</h2><p className={`text-xs ${t('text-slate-400', 'text-slate-500')}`}>Mode Simulasi: Webcam laptop Anda. Mode Real: MJPEG IP Camera dari drone.</p></div>
                    <div><label className={`text-xs font-mono block mb-1 ${t('text-slate-400', 'text-slate-500')}`}>IP DRONE (Mode Real)</label><input type="text" value={videoIp} onChange={(e) => setVideoIp(e.target.value)} disabled={isVideoConnected} className={`w-full border rounded p-2 text-sm font-mono focus:outline-none disabled:opacity-50 ${t('bg-slate-950 border-slate-700 text-white', 'bg-white border-slate-300 text-slate-900')}`} /></div>
                    <div className={`pt-4 border-t ${t('border-slate-800', 'border-slate-200')}`}>
                      <div className={`flex justify-between items-center mb-3 p-3 border rounded ${t('bg-slate-950 border-slate-800', 'bg-slate-50 border-slate-200')}`}>
                        <span className={`text-xs ${t('text-slate-400', 'text-slate-500')}`}>Status:</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${isVideoConnected ? 'bg-orange-500/20 text-orange-400' : 'bg-rose-500/20 text-rose-500'}`}>{isVideoConnected ? 'STREAMING' : 'DISCONNECTED'}</span>
                      </div>
                      <button onClick={handleConnectVideo} className={`w-full py-3 rounded text-sm font-bold flex items-center justify-center gap-2 text-white ${isVideoConnected ? 'bg-rose-600 hover:bg-rose-500' : 'bg-orange-600 hover:bg-orange-500'}`}>
                        <Power className="w-4 h-4" /> {isVideoConnected ? 'STOP STREAM' : (droneMode === 'simulasi' ? 'AKTIFKAN WEBCAM' : 'CONNECT MJPEG STREAM')}
                      </button>
                    </div>
                  </div>
                )}

                {activeSettingNode === 'drones' && (
                  <div className="flex flex-col h-full gap-4">
                    <div><h2 className={`text-lg font-bold flex items-center gap-2 mb-1 ${t('text-white', 'text-slate-900')}`}><Plane className="w-5 h-5 text-sky-500" /> Manajemen Drone</h2><p className={`text-xs ${t('text-slate-400', 'text-slate-500')}`}>Kelola daftar armada drone untuk target upload misi.</p></div>
                    <div className={`border rounded-lg p-3 ${t('bg-slate-950 border-slate-700', 'bg-slate-50 border-slate-200')}`}>
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div><label className={`text-[10px] block mb-1 ${t('text-slate-400', 'text-slate-500')}`}>ID DRONE</label><input type="text" value={droneForm.id} onChange={e => setDroneForm({ ...droneForm, id: e.target.value })} disabled={isEditingDrone} placeholder="DRN-001" className={`w-full border rounded p-1.5 text-xs disabled:opacity-50 focus:outline-none ${t('bg-slate-900 border-slate-700 text-white', 'bg-white border-slate-300 text-slate-900')}`} /></div>
                        <div><label className={`text-[10px] block mb-1 ${t('text-slate-400', 'text-slate-500')}`}>MERK</label><input type="text" value={droneForm.merk} onChange={e => setDroneForm({ ...droneForm, merk: e.target.value })} placeholder="DJI Matrice 300" className={`w-full border rounded p-1.5 text-xs focus:outline-none ${t('bg-slate-900 border-slate-700 text-white', 'bg-white border-slate-300 text-slate-900')}`} /></div>
                        <div><label className={`text-[10px] block mb-1 ${t('text-slate-400', 'text-slate-500')}`}>STATUS</label><select value={droneForm.status} onChange={e => setDroneForm({ ...droneForm, status: e.target.value })} className={`w-full border rounded p-1.5 text-xs focus:outline-none ${t('bg-slate-900 border-slate-700 text-white', 'bg-white border-slate-300 text-slate-900')}`}><option value="Standby">Standby</option><option value="Active">Active</option><option value="Maintenance">Maintenance</option></select></div>
                      </div>
                      <div className="flex justify-end gap-2">
                        {isEditingDrone && <button onClick={() => { setIsEditingDrone(false); setDroneForm({ id: '', merk: '', status: 'Standby' }); }} className={`px-3 py-1.5 rounded text-[10px] font-bold ${t('bg-slate-800 text-white', 'bg-slate-200 text-slate-700')}`}>BATAL</button>}
                        <button onClick={() => { if (!droneForm.id || !droneForm.merk) return; if (isEditingDrone) setDrones(p => p.map(d => d.id === droneForm.id ? droneForm : d)); else setDrones(p => [...p, droneForm]); setDroneForm({ id: '', merk: '', status: 'Standby' }); setIsEditingDrone(false); }} className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-[10px] font-bold flex items-center gap-1"><Save className="w-3 h-3" /> {isEditingDrone ? 'UPDATE' : 'TAMBAH'}</button>
                      </div>
                    </div>
                    <div className={`flex-1 border rounded-lg overflow-hidden ${t('bg-slate-950 border-slate-700', 'bg-white border-slate-200')}`}>
                      <table className="w-full text-[10px]">
                        <thead className={`border-b ${t('bg-slate-900 text-slate-400 border-slate-700', 'bg-slate-100 text-slate-600 border-slate-200')}`}><tr><th className="p-2 text-left">ID</th><th className="p-2 text-left">Merk</th><th className="p-2 text-center">Status</th><th className="p-2 text-center">Aksi</th></tr></thead>
                        <tbody className={t('text-slate-300', 'text-slate-700')}>
                          {drones.map(d => (
                            <tr key={d.id} className={`border-b ${t('border-slate-800 hover:bg-slate-800/30', 'border-slate-100 hover:bg-slate-50')}`}>
                              <td className={`p-2 font-bold ${t('text-sky-400', 'text-sky-600')}`}>{d.id}</td>
                              <td className="p-2">{d.merk}</td>
                              <td className="p-2 text-center"><span className={`px-2 py-0.5 rounded border text-[9px] font-bold ${d.status === 'Standby' ? t('bg-sky-900/20 text-sky-400 border-sky-500/30', 'bg-sky-50 text-sky-600 border-sky-200') : d.status === 'Active' ? t('bg-orange-900/20 text-orange-400 border-orange-500/30', 'bg-orange-50 text-orange-600 border-orange-200') : t('bg-slate-900/50 text-slate-400 border-slate-700', 'bg-slate-100 text-slate-500 border-slate-300')}`}>{d.status}</span></td>
                              <td className="p-2 text-center">
                                <div className="flex justify-center gap-1.5">
                                  <button onClick={() => { setDroneForm(d); setIsEditingDrone(true); }} className={`p-1.5 rounded ${t('text-orange-400 bg-slate-800', 'text-orange-600 bg-white border border-slate-300')}`}><Edit className="w-3 h-3" /></button>
                                  <button onClick={() => setDrones(p => p.filter(x => x.id !== d.id))} className={`p-1.5 rounded ${t('text-rose-400 bg-slate-800', 'text-rose-600 bg-white border border-slate-300')}`}><Trash2 className="w-3 h-3" /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {drones.length === 0 && <tr><td colSpan="4" className="text-center p-4 italic text-slate-500">Belum ada data drone.</td></tr>}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeSettingNode === 'raw_data' && (
                  <div className="flex flex-col h-full gap-4">
                    <div><h2 className={`text-lg font-bold flex items-center gap-2 mb-1 ${t('text-white', 'text-slate-900')}`}><ListTree className="w-5 h-5 text-sky-500" /> Raw Data Telemetry</h2><p className={`text-xs ${t('text-slate-400', 'text-slate-500')}`}>Log data mentah sensor drone secara live.</p></div>
                    <div className={`flex-1 border rounded overflow-hidden flex flex-col ${t('bg-slate-950 border-slate-800', 'bg-white border-slate-300')}`}>
                      <div className="overflow-y-auto flex-1">
                        <table className="w-full text-[10px]">
                          <thead className={`sticky top-0 border-b ${t('bg-slate-900 text-slate-400 border-slate-800', 'bg-slate-100 text-slate-600 border-slate-200')}`}><tr><th className="p-2">Waktu</th><th className="p-2">Lat, Lon</th><th className="p-2">Alt</th><th className="p-2">Spd</th><th className="p-2">P/R/Y</th><th className="p-2">Mode</th><th className="p-2">Bat%</th></tr></thead>
                          <tbody className={t('text-slate-300', 'text-slate-700')}>
                            {!droneMode ? <tr><td colSpan="7" className="text-center p-4 italic text-slate-500">Pilih Mode Sistem terlebih dahulu.</td></tr>
                              : telemetryHistory.length === 0 ? <tr><td colSpan="7" className="text-center p-4 italic text-slate-500">Menunggu data telemetri...</td></tr>
                                : telemetryHistory.map((d, i) => (
                                  <tr key={i} className={`border-b ${t('border-slate-800 hover:bg-slate-800/30', 'border-slate-100')}`}>
                                    <td className={`p-2 ${t('text-sky-400', 'text-sky-600')}`}>{d.timestamp}</td>
                                    <td className="p-2">{d.lat.toFixed(5)}, {d.lon.toFixed(5)}</td>
                                    <td className={`p-2 ${t('text-orange-400', 'text-orange-600')}`}>{d.alt.toFixed(1)}</td>
                                    <td className="p-2">{d.speed.toFixed(1)}</td>
                                    <td className="p-2 text-slate-400">{d.pitch.toFixed(1)}/{d.roll.toFixed(1)}/{d.yaw.toFixed(0)}</td>
                                    <td className={`p-2 font-bold ${t('text-slate-300', 'text-slate-800')}`}>{d.mode}</td>
                                    <td className={`p-2 ${t('text-sky-400', 'text-sky-600')}`}>{d.bat.toFixed(1)}</td>
                                  </tr>
                                ))}
                          </tbody>
                        </table>
                      </div>
                      <div className={`p-2 flex justify-end gap-2 border-t ${t('bg-slate-900 border-slate-800', 'bg-slate-50 border-slate-200')}`}>
                        <button onClick={() => setTelemetryHistory([])} disabled={!telemetryHistory.length} className={`flex items-center gap-1 px-3 py-1.5 rounded text-[9px] font-bold disabled:opacity-50 border ${t('bg-slate-800 text-rose-400 border-slate-700 hover:bg-rose-600 hover:text-white', 'bg-white text-rose-600 border-slate-300')}`}><Trash2 className="w-3 h-3" /> CLEAR</button>
                        <button onClick={handleExportTelemetry} disabled={!telemetryHistory.length} className="flex items-center gap-1 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-[9px] font-bold disabled:opacity-50"><Download className="w-3 h-3" /> EXPORT</button>
                      </div>
                    </div>
                  </div>
                )}

                {activeSettingNode === 'ai' && (
                  <div className="flex flex-col h-full gap-4">
                    <div><h2 className={`text-lg font-bold flex items-center gap-2 mb-1 ${t('text-white', 'text-slate-900')}`}><Bot className="w-5 h-5 text-orange-500" /> AI Assistant (Gemini)</h2><p className={`text-xs ${t('text-slate-400', 'text-slate-500')}`}>Tanyakan apapun tentang misi drone kepada AI.</p></div>
                    <div className={`flex-1 border rounded-lg p-3 overflow-y-auto flex flex-col gap-3 shadow-inner ${t('bg-slate-950 border-slate-700', 'bg-slate-50 border-slate-300')}`}>
                      {aiHistory.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] p-2.5 rounded-lg text-xs leading-relaxed ${msg.role === 'user' ? 'bg-orange-600 text-white rounded-br-none' : t('bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none', 'bg-white text-slate-800 border border-slate-200 rounded-bl-none')}`}>{msg.text}</div>
                        </div>
                      ))}
                      {isAiLoading && <div className="flex justify-start"><div className={`p-2.5 rounded-lg border flex items-center gap-2 text-xs ${t('bg-slate-800 text-slate-400 border-slate-700', 'bg-white text-slate-500 border-slate-200')}`}><Loader2 className="w-3 h-3 animate-spin" /> Menganalisis...</div></div>}
                      <div ref={chatEndRef} />
                    </div>
                    <div className="flex gap-2">
                      <input type="text" value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAskGemini()} placeholder="Ketik prompt analisis..." className={`flex-1 border rounded px-3 py-2 text-xs focus:outline-none ${t('bg-slate-950 border-slate-700 text-white focus:border-orange-500', 'bg-white border-slate-300 text-slate-900 focus:border-orange-500')}`} />
                      <button onClick={handleAskGemini} disabled={isAiLoading || !aiInput.trim()} className="bg-orange-600 hover:bg-orange-500 text-white px-4 rounded disabled:opacity-50 flex items-center justify-center"><SendHorizontal className="w-4 h-4" /></button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======== MODAL LAPORAN ======== */}
      {isReportsOpen && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded shadow-2xl w-[950px] max-w-[95%] h-[85vh] flex flex-col overflow-hidden ${t('bg-slate-900 border-slate-800', 'bg-white border-slate-300')}`}>
            <div className={`flex items-center justify-between px-4 py-3 border-b shrink-0 ${t('bg-slate-950 border-slate-800', 'bg-slate-50 border-slate-200')}`}>
              <div className={`flex items-center gap-2 ${t('text-orange-500', 'text-orange-600')}`}><FileText className="w-4 h-4" /><span className="font-bold uppercase text-xs tracking-widest">Dashboard Analisis Misi & Evaluasi Algoritma</span></div>
              <button onClick={() => setIsReportsOpen(false)} className={t('text-slate-400 hover:text-rose-400', 'text-slate-500 hover:text-rose-600')}><X className="w-5 h-5" /></button>
            </div>
            <div className={`flex-1 overflow-y-auto p-5 flex flex-col gap-5 ${t('bg-slate-900', 'bg-slate-50')}`}>
              {/* Summary Cards */}
              <div className="grid grid-cols-4 gap-3 shrink-0">
                {[
                  { label: 'TOTAL MISI', value: flightLogs.length, color: 'text-white', Icon: ClipboardList, iconColor: 'text-sky-500' },
                  { label: 'POHON DISCAN', value: flightLogs.reduce((a, b) => a + b.samples, 0), color: 'text-orange-400', Icon: TreeDeciduous, iconColor: 'text-orange-500' },
                  { label: 'WAKTU TRAD (s)', value: flightLogs.filter(l => l.scan === 'traditional').reduce((a, b) => a + b.flightTime, 0).toFixed(0), color: 'text-sky-400', Icon: TrendingUp, iconColor: 'text-sky-500' },
                  { label: 'WAKTU QLV (s)', value: flightLogs.filter(l => l.scan === 'qlv').reduce((a, b) => a + b.flightTime, 0).toFixed(0), color: 'text-orange-400', Icon: TrendingUp, iconColor: 'text-orange-500' },
                ].map(({ label, value, color, Icon, iconColor }) => (
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
                    Secara kumulatif, <strong>Mode QLV</strong> menghemat waktu <strong className="text-orange-500 text-xl mx-1">{Math.max(0, flightLogs.filter(l => l.scan === 'traditional').reduce((a, b) => a + b.flightTime, 0) - flightLogs.filter(l => l.scan === 'qlv').reduce((a, b) => a + b.flightTime, 0)).toFixed(0)} detik</strong> dan daya <strong className="text-orange-500 text-xl mx-1">{Math.max(0, flightLogs.filter(l => l.scan === 'traditional').reduce((a, b) => a + b.batteryUsed, 0) - flightLogs.filter(l => l.scan === 'qlv').reduce((a, b) => a + b.batteryUsed, 0)).toFixed(2)}%</strong> vs Tradisional.
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
                      {flightLogs.length === 0 ? <tr><td colSpan="9" className="text-center p-6 italic text-slate-500">Belum ada data penerbangan. Jalankan simulasi misi terlebih dahulu.</td></tr>
                        : flightLogs.map(log => (
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
            <div className={`p-3 flex justify-between items-center shrink-0 border-t ${t('bg-slate-950 border-slate-800', 'bg-slate-100 border-slate-300')}`}>
              <span className={`text-[9px] font-mono ${t('text-slate-500', 'text-slate-500')}`}>*Log diperbarui otomatis setiap drone selesai Landing.</span>
              <div className="flex gap-2">
                <button onClick={() => setFlightLogs([])} disabled={!flightLogs.length} className={`flex items-center gap-1.5 px-4 py-2 rounded text-[10px] font-bold disabled:opacity-50 border ${t('bg-slate-800 hover:bg-rose-600 text-rose-400 hover:text-white border-slate-700', 'bg-white hover:bg-rose-50 text-rose-600 border-slate-300')}`}><Trash2 className="w-3.5 h-3.5" /> CLEAR LOG</button>
                <button onClick={handleExportReports} disabled={!flightLogs.length} className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded text-[10px] font-bold disabled:opacity-50"><Download className="w-3.5 h-3.5" /> EKSPORT CSV</button>
              </div>
            </div>
          </div>
        </div>
      )}

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
