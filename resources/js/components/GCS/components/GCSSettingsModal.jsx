import React from 'react';
import {
  X, Settings, Cpu, Radio, Video, Plane, ListTree, Bot,
  ChevronDown, Power, MonitorPlay, Moon, Sun, Palette,
  Save, Edit, Trash2, Loader2, SendHorizontal, Download,
} from 'lucide-react';

/**
 * GCSSettingsModal — Modal Pengaturan Sistem GCS (5 tab TreeView)
 * Props: isOpen, onClose,
 *        activeSettingNode, setActiveSettingNode,
 *        droneMode, setDroneMode,
 *        theme, setTheme,
 *        telemBaud, setTelemBaud, isTelemConnected, handleConnectTelemetry,
 *        videoIp, setVideoIp, isVideoConnected, handleConnectVideo,
 *        drones, setDrones, droneForm, setDroneForm, isEditingDrone, setIsEditingDrone,
 *        telemetryHistory, setTelemetryHistory, handleExportTelemetry,
 *        aiInput, setAiInput, aiHistory, isAiLoading, handleAskGemini, chatEndRef,
 *        t()
 */
const GCSSettingsModal = ({
  isOpen, onClose,
  activeSettingNode, setActiveSettingNode,
  droneMode, setDroneMode,
  theme, setTheme,
  telemBaud, setTelemBaud, isTelemConnected, handleConnectTelemetry,
  videoIp, setVideoIp, isVideoConnected, handleConnectVideo,
  drones, setDrones, droneForm, setDroneForm, isEditingDrone, setIsEditingDrone,
  telemetryHistory, setTelemetryHistory, handleExportTelemetry,
  aiInput, setAiInput, aiHistory, isAiLoading, handleAskGemini, chatEndRef,
  t,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`border rounded-lg shadow-2xl w-[800px] max-w-full h-[560px] flex flex-col overflow-hidden ${t('bg-slate-900 border-slate-700', 'bg-white border-slate-300')}`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-4 py-3 border-b ${t('bg-slate-950 border-slate-800', 'bg-slate-50 border-slate-200')}`}>
          <div className={`flex items-center gap-2 ${t('text-sky-400', 'text-sky-600')}`}><Settings className="w-5 h-5" /><span className="font-bold text-sm uppercase tracking-wide">PENGATURAN SISTEM GCS</span></div>
          <button onClick={onClose} className={t('text-slate-400 hover:text-rose-400', 'text-slate-500 hover:text-rose-600')}><X className="w-5 h-5" /></button>
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

            {/* Sistem & Tampilan */}
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

            {/* Telemetri */}
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

            {/* Video */}
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

            {/* Drone Management */}
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

            {/* Raw Data */}
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

            {/* AI Assistant */}
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
  );
};

export default GCSSettingsModal;
