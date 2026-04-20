/**
 * useMissionManager.js
 * Hook untuk mengelola CRUD misi GCS:
 * - Load rekap misi dari DB (/missions)
 * - Simpan misi baru (handleSaveMission → POST /missions)
 * - Load misi untuk edit (loadMissionForEdit)
 * - Auto-save misi ke DB saat drone landing (autoSavePending useEffect)
 * - Reset draft misi (handleResetDraft)
 */

import { useState, useEffect } from 'react';

export function useMissionManager({
  config, waypoints, setWaypoints,
  navAlgorithm, scanMode,
  qlvPath, tradPath,
  missionName, setMissionName,
  setConfig, setNavAlgorithm, setScanMode,
  setIsMapActive, setIsMissionSaved,
  setActiveTab, setActiveMapTab,
  setWarning,
  setCockpitWarning,
  setSavedMissionsExternal, // optional callback jika AppGCS butuh savedMissions
}) {
  const [savedMissions, setSavedMissions] = useState([]);
  const [selectedMissionId, setSelectedMissionId] = useState(null);
  const [editingMissionId, setEditingMissionId] = useState(null);
  // Trigger auto-save saat drone landing
  const [autoSavePending, setAutoSavePending] = useState(null);

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

  // AUTO-SAVE ke DB ketika autoSavePending di-set (dipanggil dari useFlightControl landing)
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
          const newId = dbId ? `MSN-${String(dbId).padStart(4, '0')}` : `MSN-${Date.now()}`;
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

  // Simpan misi secara manual (klik "SIMPAN KE REKAP")
  const handleSaveMission = async () => {
    if (scanMode === 'traditional' && waypoints.length !== 3) {
      setWarning('Pilih tepat 3 pohon!'); setTimeout(() => setWarning(''), 3000); return;
    }
    if (scanMode === 'qlv' && waypoints.length === 0) {
      setWarning('Pilih 1 Pohon Awal!'); setTimeout(() => setWarning(''), 3000); return;
    }
    if (!navAlgorithm || !scanMode) return;

    const pathData = scanMode === 'qlv' ? qlvPath : tradPath;
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
      configData: { ...config },
    };

    if (editingMissionId) {
      setSavedMissions(prev => prev.map(m => m.id === editingMissionId ? { ...m, ...localData } : m));
      setSelectedMissionId(editingMissionId);
    } else {
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
        const nm = { id: `MSN-${Date.now()}`, ...localData };
        setSavedMissions(prev => [nm, ...prev]);
        setSelectedMissionId(nm.id);
      }
    }
    setIsMissionSaved(true);
    setIsMapActive(false);
    setEditingMissionId(null);
    setActiveTab('history');
  };

  // Load misi ke form edit
  const loadMissionForEdit = (missionId, e) => {
    e?.stopPropagation();
    const m = savedMissions.find(m => m.id === missionId);
    if (m) {
      setConfig(m.configData);
      setWaypoints([...m.waypointsData]);
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

  return {
    savedMissions, setSavedMissions,
    selectedMissionId, setSelectedMissionId,
    editingMissionId, setEditingMissionId,
    autoSavePending, setAutoSavePending,
    handleSaveMission,
    loadMissionForEdit,
  };
}
