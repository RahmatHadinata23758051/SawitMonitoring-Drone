import React, { useState } from 'react';
import {
  TreeDeciduous, Navigation, MousePointerClick, Save, Edit,
  Camera, BarChart3, Send, Trash2, Database, TableProperties,
  MapPin, CheckSquare, Map as MapIcon, Download, Archive,
  CheckCircle2, Activity, Layers, Cpu,
} from 'lucide-react';
import { homeWP } from '../utils/gcsConstants';

/**
 * GCSRightPanel — Immersive Map (kiri, full-height) + Sidebar 3 Tabs (kanan)
 * Tabs: MISI | DATA | AI & STATS
 */
const GCSRightPanel = ({
  // Config & Blok
  config, managedBlocks,
  handleConfigChange, handleSaveBlock, loadBlock, deleteBlock,
  isMapActive, isMissionSaved,

  // Algoritma & Scan
  navAlgorithm, setNavAlgorithm,
  scanMode, setScanMode,

  // Misi & Waypoints
  missionName, setMissionName,
  waypoints, setWaypoints,
  warning,
  editingMissionId,
  savedMissions, selectedMissionId, setSelectedMissionId,
  handleStartWaypoint, handleSaveMission, loadMissionForEdit, handleResetDraft,
  getWaypointInstruction, toggleWaypoint,

  // AI Vision & Stats
  liveAiVision, flightStatusUI, scannedTrees, baseTotalSample,
  matangCount, belumMatangCount, matangPercent, belumMatangPercent,
  setManagedBlocks,

  // SVG Map
  trees, qlvPath, qlvTargetTrees, tradPath, pathString,
  telemetry, config: cfg, max_x, max_y,
  currentWpIndexRef,
  activeMapTab, setActiveMapTab,
  activeTab, setActiveTab,
  handleExportExcel,

  // Upload
  drones, selectedUploadDrone, setSelectedUploadDrone, setWarning,
  isUploadReady,

  t,

  topMapPanel,
  topCockpitPanel,
}) => {
  const [sidebarTab, setSidebarTab] = useState('misi');

  return (
    <div className="flex-1 rounded-xl overflow-hidden shadow-lg flex border border-slate-200 bg-white">

      {/* ===== AREA KIRI: MAP FULL HEIGHT ===== */}
      <div className="flex-1 flex flex-col border-r border-slate-200 relative">

        {/* MAP TAB HEADER */}
        <div className="h-9 border-b border-slate-200 flex items-center shrink-0 bg-slate-50">
          <button
            onClick={() => setActiveMapTab('map')}
            className={`h-full px-4 flex items-center gap-2 text-[10px] font-bold transition ${activeMapTab === 'map' ? 'bg-white text-blue-600 border-t-2 border-blue-500' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <MapIcon className="w-3.5 h-3.5" /> GAMBAR 2D KEBUN
          </button>
          <button
            onClick={() => setActiveMapTab('management')}
            className={`h-full px-4 flex items-center gap-2 text-[10px] font-bold transition ${activeMapTab === 'management' ? 'bg-white text-blue-600 border-t-2 border-blue-500' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <TableProperties className="w-3.5 h-3.5" /> DATA MANAJEMEN BLOK
          </button>
          <div className="ml-auto px-3 text-[9px] font-mono text-slate-400">
            {activeMapTab === 'map' && warning && <span className="text-rose-500 font-bold animate-pulse">{warning}</span>}
            {activeMapTab === 'map' && editingMissionId && isMapActive && (
              <span className="text-amber-600 font-bold"><Edit className="w-3 h-3 inline mr-1" />MODE EDIT: {missionName}</span>
            )}
          </div>
        </div>

        {/* CAMERAS - INTEGRATED ABOVE MAP */}
        {activeMapTab === 'map' && topMapPanel && (
          <div className="w-full bg-slate-100 p-3 flex justify-center border-b border-slate-200 shrink-0">
            {topMapPanel}
          </div>
        )}

        {/* MAP CONTENT — FULL HEIGHT */}
        <div className="flex-1 relative overflow-hidden flex flex-col bg-slate-100">
          {activeMapTab === 'map' ? (
            <div className={`w-full h-full relative ${!isMapActive && !isMissionSaved ? 'opacity-40 grayscale-[70%]' : ''} ${isMapActive ? 'cursor-crosshair' : 'cursor-not-allowed'}`}>
              <svg className="w-full h-full p-2" viewBox={`-35 -20 ${max_x + 50} ${max_y + 40}`} preserveAspectRatio="xMidYMid meet">
                <rect x="-40" y="-30" width="20" height={max_y + 60} fill="#cbd5e1" />
                <rect x="-5" y="-5" width={max_x + 10} height={max_y + 10} fill="#10b981" fillOpacity="0.05" stroke="#d97706" strokeWidth="0.5" strokeDasharray="3 3" />
                <text x="0" y="-8" fill="#d97706" fontSize="3" fontWeight="bold">{config.namaBlok} ({config.totalPohon} Pohon)</text>

                {/* Koridor QLV */}
                {scanMode === 'qlv' && qlvPath.map((wp, i) => (
                  <g key={wp.id}>
                    <circle cx={wp.x} cy={wp.y} r="0.8" fill="#d97706" className={flightStatusUI !== 'STANDBY' ? 'animate-pulse' : ''} />
                    <text x={wp.x} y={wp.y - 1.5} fontSize="1.5" fill="#b45309" textAnchor="middle">W{i + 1}</text>
                  </g>
                ))}

                {/* Rute */}
                {pathString && (
                  <polyline
                    points={pathString}
                    fill="none"
                    stroke={flightStatusUI !== 'STANDBY' ? '#0284c7' : (isMissionSaved ? '#059669' : '#0284c7')}
                    strokeWidth="1"
                    strokeDasharray="3 2"
                    className={flightStatusUI !== 'STANDBY' ? 'animate-pulse' : ''}
                  />
                )}

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

                  let fillColor = isSelected ? (isMissionSaved ? '#10b981' : '#0ea5e9') : '#22c55e';
                  let strokeColor = isSelected ? (isMissionSaved ? '#059669' : '#0284c7') : '#15803d';
                  if (isScanned) { fillColor = '#eab308'; strokeColor = '#fef08a'; }

                  return (
                    <g key={tree.id} transform={`translate(${tree.x}, ${tree.y})`}
                      onClick={() => toggleWaypoint(tree)}
                      className={`group ${isMapActive ? 'cursor-pointer' : ''}`}
                    >
                      {isMapActive && <circle r={tree.crownRadius * 1.5} fill="transparent" className="group-hover:fill-sky-500/20 transition-colors" />}
                      <circle r={isSelected && !isScanned ? tree.crownRadius + 0.8 : tree.crownRadius} fill={fillColor} stroke={strokeColor} strokeWidth="0.5" className={`transition-all duration-200 ${isMapActive ? 'group-hover:scale-110' : ''}`} />
                      <circle r="0.6" fill="rgba(255,255,255,0.4)" />
                      {isSelected && scanMode === 'traditional' && (
                        <g transform={`translate(${tree.crownRadius + 1}, -${tree.crownRadius + 1})`}>
                          <circle r="2" fill={isScanned ? '#ca8a04' : (isMissionSaved ? '#047857' : '#0369a1')} />
                          <text x="0" y="0.7" fontSize="1.8" fill="white" textAnchor="middle" fontWeight="bold">{wpIndex + 1}</text>
                        </g>
                      )}
                      {isSelected && scanMode === 'qlv' && !isScanned && (
                        <circle cx={tree.crownRadius + 1} cy={-(tree.crownRadius + 1)} r="1" fill={isMissionSaved ? '#047857' : '#0369a1'} />
                      )}
                    </g>
                  );
                })}

                {/* HOME Point */}
                <g transform={`translate(${homeWP.x}, ${homeWP.y})`}>
                  <rect x="-4" y="-3" width="8" height="6" fill="#f59e0b" stroke="#fef3c7" strokeWidth="0.5" rx="1" />
                  <circle cx="0" cy="0" r="1" fill="white" />
                  <text x="0" y="5" fontSize="2.5" fill="#000" textAnchor="middle" fontWeight="bold">START</text>
                </g>

                {/* Drone position */}
                {flightStatusUI !== 'STANDBY' && (
                  <g transform={`translate(${telemetry.x}, ${telemetry.y}) rotate(${telemetry.yaw - 90})`}>
                    <polygon points="-2.5,-2.5 2.5,-2.5 0,4" fill="#0284c7" stroke="#fff" strokeWidth="0.5" />
                    <circle cx="0" cy="0" r="1" fill="#facc15" />
                  </g>
                )}
              </svg>

              {/* Overlay: Total Scan — center bottom */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 rounded-full shadow-lg text-[10px] font-black border backdrop-blur-md bg-white/85 border-slate-200 text-blue-700">
                <Activity className="w-3.5 h-3.5" />
                <span>TOTAL SCAN: <span className="text-sm ml-1 text-white bg-blue-600 px-1.5 rounded font-bold">{scannedTrees}</span> / {baseTotalSample} POHON</span>
              </div>

              {/* Legenda */}
              <div className="absolute bottom-3 right-3 flex items-center gap-3 px-3 py-1.5 rounded-lg shadow-md text-[9px] font-bold backdrop-blur-md bg-white/85 border border-slate-200 text-slate-700">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-emerald-700"></div>Belum Scan</div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-yellow-500 border border-yellow-300"></div>Sudah Terscan</div>
              </div>


              <div className="absolute bottom-14 left-3 z-20 w-[230px] pointer-events-auto shadow-2xl">
                {topCockpitPanel}
              </div>
            </div>
          ) : (
            /* MANAJEMEN BLOK TABLE */
            <div className="w-full h-full flex flex-col bg-white">
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left text-[10px]">
                  <thead className="sticky top-0 z-10 border-b bg-slate-100 text-slate-600 border-slate-200">
                    <tr>
                      <th className="p-2">Nama Blok</th>
                      <th className="p-2 text-center">Luas (Ha)</th>
                      <th className="p-2 text-center">Pohon</th>
                      <th className="p-2 text-center">Tinggi (m)</th>
                      <th className="p-2 text-center">Sampel</th>
                      <th className="p-2 text-center">Status</th>
                      <th className="p-2 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-700">
                    {managedBlocks.map(block => (
                      <tr key={block.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-2 font-bold text-blue-700">{block.namaBlok}</td>
                        <td className="p-2 text-center">{block.luasKebun}</td>
                        <td className="p-2 text-center">{block.totalPohon}</td>
                        <td className="p-2 text-center text-emerald-600">{block.tinggiPohon}</td>
                        <td className="p-2 text-center font-bold text-amber-600">{block.jumlahSampel}</td>
                        <td className="p-2 text-center"><CheckCircle2 className="w-3 h-3 inline text-emerald-500" /> {block.status}</td>
                        <td className="p-2 text-center">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => loadBlock(block)} className="p-1.5 rounded text-blue-600 bg-blue-50 hover:bg-blue-100 transition"><MapIcon className="w-3 h-3" /></button>
                            <button onClick={() => deleteBlock(block.id)} className="p-1.5 rounded text-rose-600 bg-rose-50 hover:bg-rose-100 transition"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {managedBlocks.length === 0 && (
                      <tr><td colSpan="7" className="text-center p-6 text-slate-400 italic text-[10px]">Belum ada data blok tersimpan.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="p-2 flex justify-end gap-2 border-t bg-slate-50 border-slate-200">
                <button onClick={() => setManagedBlocks([])} className="flex items-center gap-1 px-3 py-1.5 rounded text-[9px] font-bold border bg-white text-rose-600 border-rose-200 hover:bg-rose-50 transition"><Trash2 className="w-3 h-3" /> CLEAR</button>
                <button onClick={handleExportExcel} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[9px] font-bold transition shadow-sm"><Download className="w-3 h-3" /> EKSPORT CSV</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== AREA KANAN: SIDEBAR 3 TABS ===== */}
      <div className="w-[380px] shrink-0 flex flex-col border-l border-slate-200 bg-white">

        {/* TAB NAVIGATION */}
        <div className="h-10 border-b border-slate-200 bg-slate-50 flex shrink-0">
          <button
            onClick={() => setSidebarTab('misi')}
            className={`flex-1 flex items-center justify-center gap-1.5 text-[9px] font-extrabold tracking-wide transition ${sidebarTab === 'misi' ? 'bg-white text-blue-600 border-b-2 border-blue-500' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <MapPin className="w-3 h-3" /> MISI
          </button>
          <button
            onClick={() => setSidebarTab('data')}
            className={`flex-1 flex items-center justify-center gap-1.5 text-[9px] font-extrabold tracking-wide transition ${sidebarTab === 'data' ? 'bg-white text-blue-600 border-b-2 border-blue-500' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <Database className="w-3 h-3" /> DATA
            {savedMissions.length > 0 && (
              <span className="bg-blue-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">{savedMissions.length}</span>
            )}
          </button>
          <button
            onClick={() => setSidebarTab('ai')}
            className={`flex-1 flex items-center justify-center gap-1.5 text-[9px] font-extrabold tracking-wide transition ${sidebarTab === 'ai' ? 'bg-white text-blue-600 border-b-2 border-blue-500' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <Cpu className="w-3 h-3" /> AI & STATS
          </button>
        </div>

        {/* TAB CONTENT */}
        <div className="flex-1 overflow-y-auto">

          {/* ===== TAB 1: MISI ===== */}
          {sidebarTab === 'misi' && (
            <div className="flex flex-col">

              {/* 1. Parameter Blok */}
              <div className="p-3 border-b border-slate-100 flex flex-col gap-2.5">
                <h3 className="text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 text-emerald-700">
                  <TreeDeciduous className="w-3.5 h-3.5" /> Parameter Blok
                </h3>
                <div>
                  <label className="text-[8px] font-bold tracking-widest block mb-1 text-slate-400">NAMA BLOK</label>
                  <input
                    type="text"
                    value={config.namaBlok}
                    onChange={(e) => handleConfigChange(e, 'namaBlok')}
                    disabled={isMapActive || isMissionSaved}
                    className="w-full border border-slate-200 rounded-lg p-2 text-[10px] font-mono focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 disabled:opacity-50 disabled:bg-slate-50 text-slate-800 bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[8px] font-bold tracking-widest block mb-1 text-slate-400">LUAS (Ha)</label>
                    <input type="number" step="0.1" min="0.1" value={config.luasKebun} onChange={(e) => handleConfigChange(e, 'luasKebun')} disabled={isMapActive || isMissionSaved} className="w-full border border-slate-200 rounded-lg p-2 text-[10px] font-mono focus:outline-none focus:border-blue-400 disabled:opacity-50 disabled:bg-slate-50 text-slate-800 bg-white" />
                  </div>
                  <div>
                    <label className="text-[8px] font-bold tracking-widest block mb-1 text-slate-400">TOTAL POHON</label>
                    <input type="number" min="10" value={config.totalPohon} onChange={(e) => handleConfigChange(e, 'totalPohon')} disabled={isMapActive || isMissionSaved} className="w-full border border-slate-200 rounded-lg p-2 text-[10px] font-mono focus:outline-none focus:border-blue-400 disabled:opacity-50 disabled:bg-slate-50 text-slate-800 bg-white" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[8px] font-bold tracking-widest block mb-1 text-slate-400">SAMPEL (10%)</label>
                    <input type="number" value={config.jumlahSampel} readOnly disabled className="w-full border border-slate-200 rounded-lg p-2 text-[10px] font-mono opacity-70 cursor-not-allowed bg-slate-50 text-blue-600" />
                  </div>
                  <div>
                    <label className="text-[8px] font-bold tracking-widest block mb-1 text-slate-400">TINGGI (m)</label>
                    <input type="number" step="0.5" min="2" value={config.tinggiPohon} onChange={(e) => handleConfigChange(e, 'tinggiPohon')} disabled={isMapActive || isMissionSaved} className="w-full border border-slate-200 rounded-lg p-2 text-[10px] font-mono focus:outline-none focus:border-blue-400 disabled:opacity-50 disabled:bg-slate-50 text-emerald-700 bg-white" />
                  </div>
                </div>
                <button
                  onClick={handleSaveBlock}
                  disabled={isMapActive || isMissionSaved}
                  className="w-full flex items-center justify-center gap-1.5 p-2 rounded-lg text-[9px] font-bold transition disabled:opacity-50 border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                >
                  <CheckSquare className="w-3 h-3" /> SIMPAN KE MANAJEMEN
                </button>
              </div>

              {/* 2. Navigasi & Mode Scan */}
              <div className="p-3 border-b border-slate-100 flex flex-col gap-2.5">
                <h3 className="text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 text-blue-700">
                  <Navigation className="w-3.5 h-3.5" /> Navigasi & Mode Scan
                </h3>
                <div>
                  <label className="text-[8px] font-bold tracking-widest block mb-1 text-slate-400">ALGORITMA <span className="text-rose-500">*</span></label>
                  <select value={navAlgorithm} onChange={(e) => setNavAlgorithm(e.target.value)} disabled={isMissionSaved} className="w-full border border-slate-200 rounded-lg p-2 text-[10px] font-mono focus:outline-none focus:border-blue-400 disabled:opacity-50 text-slate-800 bg-white">
                    <option value="">Pilih Algoritma...</option>
                    <option value="dead_reckoning">Dead Reckoning</option>
                    <option value="live_reckoning">Live Reckoning</option>
                    <option value="hybrid">Hybrid System</option>
                  </select>
                </div>
                <div>
                  <label className="text-[8px] font-bold tracking-widest block mb-1 text-slate-400">MODE SCAN <span className="text-rose-500">*</span></label>
                  <select value={scanMode} onChange={(e) => setScanMode(e.target.value)} disabled={isMissionSaved} className="w-full border border-slate-200 rounded-lg p-2 text-[10px] font-mono focus:outline-none focus:border-blue-400 disabled:opacity-50 text-slate-800 bg-white">
                    <option value="">Pilih Mode Scan...</option>
                    <option value="traditional">Traditional Scan</option>
                    <option value="qlv">QLV (Koridor)</option>
                  </select>
                </div>
              </div>

              {/* 3. Identitas & Kontrol Misi */}
              <div className="p-3 border-b border-slate-100 flex flex-col gap-2.5">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-blue-700">Identitas Misi</label>
                <input
                  type="text"
                  placeholder="Nama Misi"
                  value={missionName}
                  onChange={(e) => setMissionName(e.target.value)}
                  disabled={isMapActive || isMissionSaved}
                  className="w-full border border-slate-200 rounded-lg p-2 text-[10px] font-bold focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 disabled:opacity-50 disabled:bg-slate-50 text-slate-800 bg-white"
                />
                {!isMapActive && !isMissionSaved && (
                  <button onClick={handleStartWaypoint} className="w-full flex items-center justify-center gap-1.5 p-2.5 rounded-lg text-[9px] font-bold bg-blue-600 hover:bg-blue-500 text-white transition shadow-md">
                    <MapPin className="w-3.5 h-3.5" /> AKTIFKAN PETA / BUAT MISI
                  </button>
                )}
                {isMapActive && (
                  <div className={`border p-2.5 rounded-lg flex flex-col gap-2 ${editingMissionId ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
                    <span className={`text-[9px] font-bold flex items-center gap-1 ${editingMissionId ? 'text-amber-700' : 'text-blue-700'}`}>
                      {editingMissionId ? <Edit className="w-3 h-3" /> : <MousePointerClick className="w-3 h-3" />}
                      {getWaypointInstruction()}
                    </span>
                    <button
                      onClick={handleSaveMission}
                      disabled={scanMode === 'traditional' ? waypoints.length !== 3 : waypoints.length === 0}
                      className={`w-full flex items-center justify-center gap-1.5 p-2 rounded-lg text-[9px] font-bold text-white disabled:opacity-50 transition ${editingMissionId ? 'bg-amber-500 hover:bg-amber-400' : 'bg-emerald-600 hover:bg-emerald-500'}`}
                    >
                      <Save className="w-3 h-3" /> {editingMissionId ? 'UPDATE MISI' : 'SIMPAN KE REKAP'}
                    </button>
                  </div>
                )}
              </div>

              {/* 4. Upload & Reset */}
              <div className="p-3 flex flex-col gap-2">
                {isUploadReady ? (
                  <div className="flex flex-col gap-2 p-2.5 rounded-xl border bg-blue-50 border-blue-200">
                    <label className="text-[9px] font-bold tracking-widest text-slate-500">TARGET DRONE</label>
                    <select value={selectedUploadDrone} onChange={(e) => setSelectedUploadDrone(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2 text-[10px] font-mono focus:outline-none text-slate-800 bg-white">
                      <option value="">-- Pilih Drone --</option>
                      {drones.map(d => (
                        <option key={d.id} value={d.id} disabled={d.status !== 'Standby'}>{d.id} - {d.merk} {d.status !== 'Standby' ? `(${d.status})` : ''}</option>
                      ))}
                    </select>
                    <button
                      disabled={!selectedUploadDrone}
                      onClick={() => { setWarning(`Misi berhasil diupload ke Drone ${selectedUploadDrone}`); setTimeout(() => setWarning(''), 4000); }}
                      className={`w-full flex items-center justify-center gap-1.5 p-2.5 rounded-lg text-[10px] font-bold transition ${selectedUploadDrone ? 'bg-blue-600 hover:bg-blue-500 text-white animate-pulse shadow-md' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                    >
                      <Send className="w-4 h-4" /> UPLOAD KE DRONE
                    </button>
                  </div>
                ) : (
                  <button disabled className="w-full flex items-center justify-center gap-1.5 p-2.5 rounded-lg text-[10px] font-bold cursor-not-allowed border bg-slate-50 text-slate-400 border-slate-200">
                    <Send className="w-4 h-4" /> PILIH MISI DARI REKAP
                  </button>
                )}
                <button
                  onClick={handleResetDraft}
                  className="w-full flex items-center justify-center gap-1.5 p-2 rounded-lg text-[9px] font-bold transition border bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 border-slate-200"
                >
                  <Trash2 className="w-3 h-3" /> BATALKAN / RESET DRAFT
                </button>
              </div>

            </div>
          )}

          {/* ===== TAB 2: DATA ===== */}
          {sidebarTab === 'data' && (
            <div className="flex flex-col">
              {/* Sub Tabs */}
              <div className="px-3 py-2 border-b border-slate-100 bg-slate-50 flex gap-2 shrink-0">
                <button
                  onClick={() => setActiveTab('current')}
                  className={`text-[9px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition ${activeTab === 'current' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                >
                  <TableProperties className="w-3 h-3" /> WP AKTIF
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`text-[9px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                >
                  <Database className="w-3 h-3" /> REKAP MISI
                  <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full ml-1 text-[8px]">{savedMissions.length}</span>
                </button>
              </div>

              {/* WP AKTIF */}
              {activeTab === 'current' && (
                <div>
                  {waypoints.length === 0 && scanMode !== 'qlv' ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-[10px] italic gap-2">
                      <MapPin className="w-8 h-8 opacity-30" />Klik pohon di Peta 2D untuk mengisi tabel.
                    </div>
                  ) : scanMode === 'qlv' && waypoints.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-blue-500 text-[10px] italic font-bold gap-2">
                      <Layers className="w-8 h-8 opacity-40" />MODE QLV AKTIF — Auto Generate Path
                    </div>
                  ) : (
                    <table className="w-full text-left text-[10px]">
                      <thead className="sticky top-0 border-b bg-slate-100 text-slate-600 border-slate-200">
                        <tr>
                          <th className="p-2">No.</th>
                          <th className="p-2">ID Pohon</th>
                          <th className="p-2">X,Y (m)</th>
                          <th className="p-2 text-emerald-700">Lat</th>
                          <th className="p-2 text-emerald-700">Lon</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-700">
                        {(scanMode === 'qlv' ? qlvPath : (scanMode === 'traditional' && tradPath.length > 0 ? tradPath : waypoints)).map((wp, i) => (
                          <tr key={wp.id + i} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="p-2 font-bold text-blue-600">{i + 1}</td>
                            <td className="p-2 font-bold">{wp.id}</td>
                            <td className="p-2 font-mono text-slate-500">{wp.x.toFixed(1)}, {wp.y.toFixed(1)}</td>
                            <td className="p-2 font-mono text-emerald-700">{wp.lat !== undefined && wp.lat !== null ? wp.lat.toFixed(6) : '-'}</td>
                            <td className="p-2 font-mono text-emerald-700">{wp.lon !== undefined && wp.lon !== null ? wp.lon.toFixed(6) : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* REKAP MISI */}
              {activeTab === 'history' && (
                <div>
                  {savedMissions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-[10px] italic gap-2">
                      <Archive className="w-8 h-8 opacity-30" />Belum ada rekap misi.
                    </div>
                  ) : (
                    <table className="w-full text-left text-[10px]">
                      <thead className="sticky top-0 border-b bg-slate-100 text-slate-600 border-slate-200">
                        <tr>
                          <th className="p-2 text-center">Pilih</th>
                          <th className="p-2">Nama Misi</th>
                          <th className="p-2 text-center">WP</th>
                          <th className="p-2">Algoritma</th>
                          <th className="p-2">Waktu</th>
                          <th className="p-2 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-700">
                        {savedMissions.map(mission => {
                          const isSel = selectedMissionId === mission.id;
                          return (
                            <tr key={mission.id} onClick={() => setSelectedMissionId(mission.id)} className={`border-b cursor-pointer ${isSel ? 'bg-blue-50 border-blue-200' : 'hover:bg-slate-50 border-slate-100'}`}>
                              <td className="p-2 text-center">
                                <div className={`w-3 h-3 rounded-full border mx-auto flex items-center justify-center ${isSel ? 'border-blue-400 bg-blue-500' : 'border-slate-300'}`}>
                                  {isSel && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                </div>
                              </td>
                              <td className={`p-2 font-bold ${isSel ? 'text-blue-700' : 'text-slate-800'}`}>{mission.name}</td>
                              <td className="p-2 text-center text-slate-500">{mission.wpCount}</td>
                              <td className="p-2 text-[9px] text-slate-500">{mission.algorithm === 'dead_reckoning' ? 'DR' : mission.algorithm === 'live_reckoning' ? 'Live' : 'Hybrid'} | {mission.scan === 'qlv' ? 'QLV' : 'Trad'}</td>
                              <td className="p-2 text-[9px] text-slate-400">{mission.date}</td>
                              <td className="p-2 text-center">
                                <button onClick={(e) => loadMissionForEdit(mission.id, e)} className="p-1.5 rounded text-amber-600 bg-amber-50 hover:bg-amber-100 transition">
                                  <Edit className="w-3 h-3" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ===== TAB 3: AI & STATS ===== */}
          {sidebarTab === 'ai' && (
            <div className="flex flex-col">

              {/* Live AI Vision — Dual Camera Feed */}
              <div className="p-3 border-b border-slate-100 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 text-rose-600">
                    <Camera className="w-3.5 h-3.5" /> Live AI Vision
                  </h3>
                  {liveAiVision.mode === 'dual' && flightStatusUI !== 'STANDBY' && (
                    <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 tracking-wider">QLV DUAL CAM</span>
                  )}
                </div>

                {flightStatusUI === 'STANDBY' ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-900 aspect-video flex flex-col items-center justify-center gap-2 opacity-60">
                    <Camera className="w-8 h-8 text-slate-500" />
                    <span className="text-[10px] text-slate-500 font-mono">CAMERA FEED OFFLINE</span>
                  </div>
                ) : liveAiVision.mode === 'dual' && liveAiVision.left && liveAiVision.right ? (
                  /* QLV: Split dual camera feed */
                  <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-1.5">
                      {/* LEFT CAM */}
                      <div className="relative rounded-lg overflow-hidden bg-slate-900 border border-slate-700" style={{ aspectRatio: '4/3' }}>
                        {liveAiVision.left.image_base64 ? (
                          <img src={liveAiVision.left.image_base64} alt="CAM KIRI" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Camera className="w-6 h-6 text-slate-600 animate-pulse" />
                          </div>
                        )}
                        {/* Overlay header */}
                        <div className="absolute top-0 left-0 right-0 px-1.5 py-1 bg-gradient-to-b from-black/70 to-transparent">
                          <span className="text-[8px] font-bold text-white font-mono tracking-widest">◀ CAM KIRI</span>
                        </div>
                        {/* Overlay result */}
                        <div className="absolute bottom-0 left-0 right-0 px-1.5 py-1 bg-gradient-to-t from-black/80 to-transparent">
                          <div className="flex items-center justify-between">
                            <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded ${liveAiVision.left.prediction === 'Matang' ? 'bg-orange-500 text-white' : 'bg-slate-500 text-white'}`}>
                              {liveAiVision.left.prediction}
                            </span>
                            <span className="text-[7px] font-mono text-cyan-300">{liveAiVision.left.confidence_pct}%</span>
                          </div>
                        </div>
                      </div>
                      {/* RIGHT CAM */}
                      <div className="relative rounded-lg overflow-hidden bg-slate-900 border border-slate-700" style={{ aspectRatio: '4/3' }}>
                        {liveAiVision.right.image_base64 ? (
                          <img src={liveAiVision.right.image_base64} alt="CAM KANAN" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Camera className="w-6 h-6 text-slate-600 animate-pulse" />
                          </div>
                        )}
                        {/* Overlay header */}
                        <div className="absolute top-0 left-0 right-0 px-1.5 py-1 bg-gradient-to-b from-black/70 to-transparent">
                          <span className="text-[8px] font-bold text-white font-mono tracking-widest">CAM KANAN ▶</span>
                        </div>
                        {/* Overlay result */}
                        <div className="absolute bottom-0 left-0 right-0 px-1.5 py-1 bg-gradient-to-t from-black/80 to-transparent">
                          <div className="flex items-center justify-between">
                            <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded ${liveAiVision.right.prediction === 'Matang' ? 'bg-orange-500 text-white' : 'bg-slate-500 text-white'}`}>
                              {liveAiVision.right.prediction}
                            </span>
                            <span className="text-[7px] font-mono text-cyan-300">{liveAiVision.right.confidence_pct}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Status bar */}
                    <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-slate-100 border border-slate-200">
                      <span className="text-[9px] font-bold text-slate-600 truncate">{liveAiVision.objectDetected}</span>
                      {liveAiVision.isPalmFruit && (
                        <span className="text-[8px] font-mono text-blue-600 shrink-0 ml-2">{liveAiVision.confidence}%</span>
                      )}
                    </div>
                  </div>
                ) : (
                  /* TRAD: Single camera feed */
                  <div className="flex flex-col gap-2">
                    <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-700" style={{ aspectRatio: '4/3' }}>
                      {liveAiVision.image_base64 ? (
                        <img src={liveAiVision.image_base64} alt="CAM UTAMA" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                          <Camera className={`w-8 h-8 ${liveAiVision.isPalmFruit ? 'text-orange-400' : 'text-slate-600'} ${!liveAiVision.isPalmFruit ? 'animate-pulse' : ''}`} />
                          <span className="text-[9px] font-mono text-slate-500">{liveAiVision.isPalmFruit ? 'ANALYZING...' : 'SCANNING...'}</span>
                        </div>
                      )}
                      {/* Overlay top */}
                      <div className="absolute top-0 left-0 right-0 px-2 py-1.5 bg-gradient-to-b from-black/70 to-transparent flex items-center justify-between">
                        <span className="text-[8px] font-bold text-white font-mono tracking-widest">📷 CAM UTAMA</span>
                        <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded-full ${liveAiVision.isPalmFruit ? 'bg-emerald-500 text-white animate-pulse' : 'bg-slate-600 text-slate-300'}`}>
                          {liveAiVision.isPalmFruit ? '● LIVE' : '● SCAN'}
                        </span>
                      </div>
                      {/* Overlay bottom result */}
                      {liveAiVision.isPalmFruit && (
                        <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between">
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${liveAiVision.condition === 'Matang' ? 'bg-orange-500 text-white' : 'bg-slate-500 text-white'}`}>
                            {liveAiVision.condition}
                          </span>
                          <span className="text-[8px] font-mono text-cyan-300 font-bold">
                            Conf: {liveAiVision.confidence}%
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Status text */}
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-slate-100 border border-slate-200">
                      <span className="text-[9px] font-bold text-slate-600 truncate">{liveAiVision.objectDetected}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Statistik Sampel */}
              <div className="p-3 border-b border-slate-100 flex flex-col gap-2.5">
                <h3 className="text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 text-orange-600">
                  <BarChart3 className="w-3.5 h-3.5" /> Statistik Sampel
                </h3>
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex justify-between pb-2 mb-3 border-b border-slate-200">
                    <span className="text-[9px] text-slate-500 font-medium">Total Scan / Sampel:</span>
                    <span className="text-xl font-mono font-extrabold text-slate-800">{scannedTrees} <span className="text-[11px] text-slate-400 font-normal">/ {baseTotalSample}</span></span>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-[9px] mb-1.5">
                      <span className="font-bold text-orange-600">● MATANG</span>
                      <span className="text-slate-600">{matangCount} ({matangPercent}%)</span>
                    </div>
                    <div className="w-full rounded-full h-2 bg-slate-200">
                      <div className="bg-orange-500 h-2 rounded-full transition-all duration-500" style={{ width: `${matangPercent}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[9px] mb-1.5">
                      <span className="font-bold text-slate-500">● BELUM MATANG</span>
                      <span className="text-slate-600">{belumMatangCount} ({belumMatangPercent}%)</span>
                    </div>
                    <div className="w-full rounded-full h-2 bg-slate-200">
                      <div className="bg-slate-400 h-2 rounded-full transition-all duration-500" style={{ width: `${belumMatangPercent}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload ke Drone */}
              <div className="p-3 flex flex-col gap-2">
                {isUploadReady ? (
                  <div className="flex flex-col gap-2 p-3 rounded-xl border bg-blue-50 border-blue-200">
                    <label className="text-[9px] font-bold tracking-widest text-slate-500">TARGET DRONE</label>
                    <select value={selectedUploadDrone} onChange={(e) => setSelectedUploadDrone(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2 text-[10px] font-mono focus:outline-none text-slate-800 bg-white">
                      <option value="">-- Pilih Drone --</option>
                      {drones.map(d => (
                        <option key={d.id} value={d.id} disabled={d.status !== 'Standby'}>{d.id} - {d.merk} {d.status !== 'Standby' ? `(${d.status})` : ''}</option>
                      ))}
                    </select>
                    <button
                      disabled={!selectedUploadDrone}
                      onClick={() => { setWarning(`Misi berhasil diupload ke Drone ${selectedUploadDrone}`); setTimeout(() => setWarning(''), 4000); }}
                      className={`w-full flex items-center justify-center gap-1.5 p-2.5 rounded-lg text-[10px] font-bold transition ${selectedUploadDrone ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md animate-pulse' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                    >
                      <Send className="w-4 h-4" /> UPLOAD KE DRONE
                    </button>
                  </div>
                ) : (
                  <button disabled className="w-full flex items-center justify-center gap-1.5 p-2.5 rounded-lg text-[10px] font-bold cursor-not-allowed border bg-slate-50 text-slate-400 border-slate-200">
                    <Send className="w-4 h-4" /> PILIH MISI DARI REKAP
                  </button>
                )}
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default GCSRightPanel;
