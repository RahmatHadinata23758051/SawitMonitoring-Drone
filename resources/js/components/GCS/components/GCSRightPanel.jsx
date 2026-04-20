import React from 'react';
import {
  TreeDeciduous, Navigation, MousePointerClick, Save, Edit,
  Camera, BarChart3, Send, Trash2, Database, TableProperties,
  MapPin, CheckSquare, Map as MapIcon, Download, Archive,
  CheckCircle2, Activity,
} from 'lucide-react';
import { homeWP } from '../utils/gcsConstants';

/**
 * GCSRightPanel — Sidebar kanan (workflow: blok, navigasi, misi, AI vision, statistik, upload)
 * + Bottom left panel (SVG map, management table, WP aktif, Rekap Misi tabs)
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
}) => {
  return (
    <div className={`flex-[0.65] rounded-lg overflow-hidden shadow-lg flex min-h-[350px] border ${t('bg-slate-900 border-slate-700', 'bg-white border-slate-300')}`}>

      {/* ===== AREA KIRI: MAP + TABEL ===== */}
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

        {/* MAP / MANAGEMENT CONTENT */}
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
                    <g key={tree.id} transform={`translate(${tree.x}, ${tree.y})`}
                      onClick={() => toggleWaypoint(tree)}
                      className={`group ${isMapActive ? 'cursor-pointer' : ''}`}
                    >
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

      {/* ===== AREA KANAN: WORKFLOW SIDEBAR ===== */}
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
            <button onClick={handleStartWaypoint} className="w-full flex items-center justify-center gap-1 p-1.5 rounded text-[9px] font-bold bg-sky-600 hover:bg-sky-500 text-white transition shadow-md">
              <MapPin className="w-3 h-3" /> AKTIFKAN PETA / BUAT MISI
            </button>
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
            <button disabled className={`w-full flex items-center justify-center gap-1 p-2.5 rounded text-[10px] font-bold cursor-not-allowed border ${t('bg-slate-800 text-slate-500 border-slate-700', 'bg-slate-200 text-slate-400 border-slate-300')}`}><Send className="w-4 h-4" /> PILIH MISI DARI REKAP</button>
          )}
          <button onClick={handleResetDraft} className={`w-full flex items-center justify-center gap-1 p-1.5 rounded text-[9px] font-bold transition border ${t('bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-400 border-slate-700', 'bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border-slate-300')}`}><Trash2 className="w-3 h-3" /> BATALKAN / RESET DRAFT</button>
        </div>

      </div>
    </div>
  );
};

export default GCSRightPanel;
