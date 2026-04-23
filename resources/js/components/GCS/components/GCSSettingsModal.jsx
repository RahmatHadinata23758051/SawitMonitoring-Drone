import React from 'react';
import {
  X, Settings, Cpu, Radio, Video, Plane, ListTree, Bot,
  ChevronDown, Power, MonitorPlay, Palette, Sun,
  Save, Edit, Trash2, Loader2, SendHorizontal, Download,
} from 'lucide-react';

/**
 * GCSSettingsModal — Modal Pengaturan Sistem GCS (5 tab TreeView) — Light Mode
 */
const GCSSettingsModal = ({
  isOpen, onClose,
  activeSettingNode, setActiveSettingNode,
  droneMode, setDroneMode,
  theme, setTheme,
  telemBaud, setTelemBaud, isTelemConnected, handleConnectTelemetry,
  videoIp, setVideoIp, videoProtocol, setVideoProtocol, hlsUrl, setHlsUrl, isVideoConnected, handleConnectVideo,
  drones, setDrones, droneForm, setDroneForm, isEditingDrone, setIsEditingDrone,
  telemetryHistory, setTelemetryHistory, handleExportTelemetry,
  aiInput, setAiInput, aiHistory, isAiLoading, handleAskGemini, chatEndRef,
  t,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="border border-slate-200 rounded-xl shadow-2xl w-[820px] max-w-full h-[580px] flex flex-col overflow-hidden bg-white">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2 text-blue-700">
            <Settings className="w-4 h-4" />
            <span className="font-extrabold text-sm uppercase tracking-widest">Pengaturan Sistem GCS</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition rounded-lg p-1 hover:bg-rose-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Tree Nav */}
          <div className="w-[200px] shrink-0 border-r border-slate-200 p-4 flex flex-col gap-5 overflow-y-auto bg-slate-50">
            <div>
              <div className="flex items-center gap-1.5 text-[9px] font-extrabold mb-2 uppercase tracking-widest text-slate-400">
                <ChevronDown className="w-3.5 h-3.5" /> UMUM & KONEKSI
              </div>
              <div className="pl-4 flex flex-col gap-0.5 border-l border-slate-200 ml-2">
                {[
                  ['mode', Cpu, 'Sistem & Tampilan'],
                  ['telemetry', Radio, 'Telemetri Data'],
                  ['video', Video, 'Video Stream'],
                  ['drones', Plane, 'Manajemen Drone'],
                  ['raw_data', ListTree, 'Raw Data Sensor'],
                ].map(([key, Icon, label]) => (
                  <button
                    key={key}
                    onClick={() => setActiveSettingNode(key)}
                    className={`text-left text-[10px] px-3 py-2 rounded-lg transition ${
                      activeSettingNode === key
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold'
                        : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2"><Icon className="w-3.5 h-3.5 shrink-0" /> {label}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[9px] font-extrabold mb-2 uppercase tracking-widest text-slate-400">
                <ChevronDown className="w-3.5 h-3.5" /> KECERDASAN BUATAN
              </div>
              <div className="pl-4 flex flex-col gap-0.5 border-l border-slate-200 ml-2">
                <button
                  onClick={() => setActiveSettingNode('ai')}
                  className={`text-left text-[10px] px-3 py-2 rounded-lg transition ${
                    activeSettingNode === 'ai'
                      ? 'bg-orange-50 text-orange-700 border border-orange-200 font-bold'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2"><Bot className="w-3.5 h-3.5" /> AI Assistant</div>
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto bg-white text-slate-800">

            {/* Sistem & Tampilan */}
            {activeSettingNode === 'mode' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-base font-extrabold flex items-center gap-2 mb-1 text-slate-900"><Cpu className="w-4 h-4 text-blue-500" /> Sistem & Tampilan</h2>
                  <p className="text-xs text-slate-500">Atur mode operasional drone dan tema antarmuka.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    ['simulasi', MonitorPlay, 'Mode Simulasi', 'Webcam Laptop & Dummy GPS', 'blue'],
                    ['real', Plane, 'Mode Real', 'Hardware Drone Langsung', 'orange'],
                  ].map(([mode, Icon, title, desc, color]) => (
                    <div
                      key={mode}
                      onClick={() => setDroneMode(mode)}
                      className={`cursor-pointer border rounded-xl p-5 flex flex-col items-center gap-3 transition-all shadow-sm ${
                        droneMode === mode
                          ? `bg-${color}-50 border-${color}-400 ring-2 ring-${color}-200`
                          : 'bg-slate-50 border-slate-200 opacity-60 hover:opacity-90 hover:border-slate-300'
                      }`}
                    >
                      <Icon className={`w-8 h-8 ${droneMode === mode ? `text-${color}-600` : 'text-slate-400'}`} />
                      <div className="text-center">
                        <h3 className="font-extrabold text-sm mb-1 text-slate-800">{title}</h3>
                        <p className="text-[10px] text-slate-500">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-5 border-t border-slate-100">
                  <h2 className="text-sm font-extrabold flex items-center gap-2 mb-3 text-slate-900"><Palette className="w-4 h-4 text-purple-500" /> Tema Antarmuka</h2>
                  <div className="flex gap-3">
                    <div className="cursor-pointer border rounded-xl p-3 flex items-center gap-2 bg-blue-50 border-blue-300 ring-2 ring-blue-100">
                      <Sun className="w-5 h-5 text-blue-600" />
                      <span className="font-bold text-xs text-blue-700">Light Mode (Aktif)</span>
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-2">Tema UI saat ini terkunci ke Light Mode untuk tampilan profesional.</p>
                </div>
              </div>
            )}

            {/* Telemetri */}
            {activeSettingNode === 'telemetry' && (
              <div className="flex flex-col gap-5">
                <div>
                  <h2 className="text-base font-extrabold flex items-center gap-2 mb-1 text-slate-900"><Radio className="w-4 h-4 text-blue-500" /> Komunikasi Telemetri</h2>
                  <p className="text-xs text-slate-500">Web Serial API untuk koneksi modul radio telemetri (SiK, dll).</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold block mb-1 text-slate-500 tracking-widest">BAUD RATE</label>
                  <select
                    value={telemBaud}
                    onChange={(e) => setTelemBaud(e.target.value)}
                    disabled={isTelemConnected}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm font-mono focus:outline-none focus:border-blue-400 disabled:opacity-50 bg-white text-slate-900"
                  >
                    {['9600', '57600', '115200', '921600'].map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-3 p-3 border border-slate-200 rounded-lg bg-slate-50">
                    <span className="text-xs text-slate-500">Status:</span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${isTelemConnected ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-600'}`}>
                      {isTelemConnected ? 'CONNECTED' : 'DISCONNECTED'}
                    </span>
                  </div>
                  <button
                    onClick={handleConnectTelemetry}
                    className={`w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 text-white transition ${isTelemConnected ? 'bg-rose-500 hover:bg-rose-400' : 'bg-blue-600 hover:bg-blue-500'}`}
                  >
                    <Power className="w-4 h-4" />
                    {isTelemConnected ? 'DISCONNECT' : (droneMode === 'simulasi' ? 'CONNECT SIMULATOR' : 'CONNECT VIA WEB SERIAL')}
                  </button>
                  {isTelemConnected && <p className="text-center text-xs text-blue-500 mt-2 animate-pulse font-mono">Menunggu packet heartbeat...</p>}
                </div>
              </div>
            )}

            {/* Video */}
            {activeSettingNode === 'video' && (
              <div className="flex flex-col gap-5">
                <div>
                  <h2 className="text-base font-extrabold flex items-center gap-2 mb-1 text-slate-900"><Video className="w-4 h-4 text-orange-500" /> Setting Video Stream</h2>
                  <p className="text-xs text-slate-500">Mode Simulasi: Webcam laptop. Mode Real: MJPEG IP Camera dari drone.</p>
                </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-[10px] font-bold block mb-1 text-slate-500 tracking-widest">PROTOKOL VIDEO</label>
                      <select
                        value={videoProtocol}
                        onChange={(e) => setVideoProtocol(e.target.value)}
                        disabled={isVideoConnected}
                        className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-400 disabled:opacity-50 bg-white text-slate-900"
                      >
                        <option value="dummy">Dummy (Webcam Laptop)</option>
                        <option value="mjpeg">HTTP MJPEG (ESP32-CAM)</option>
                        <option value="hls">HLS Proxy (.m3u8)</option>
                      </select>
                    </div>
                    <div>
                      {videoProtocol === 'mjpeg' ? (
                        <>
                          <label className="text-[10px] font-bold block mb-1 text-slate-500 tracking-widest">IP DRONE (Mode Real)</label>
                          <input type="text" value={videoIp} onChange={(e) => setVideoIp(e.target.value)} disabled={isVideoConnected} className="w-full border border-slate-200 rounded-lg p-2 text-sm font-mono focus:outline-none focus:border-blue-400 disabled:opacity-50 bg-white text-slate-900" />
                        </>
                      ) : videoProtocol === 'hls' ? (
                        <>
                          <label className="text-[10px] font-bold block mb-1 text-slate-500 tracking-widest">URL HLS (.m3u8)</label>
                          <input type="text" value={hlsUrl} onChange={(e) => setHlsUrl(e.target.value)} disabled={isVideoConnected} className="w-full border border-slate-200 rounded-lg p-2 text-sm font-mono focus:outline-none focus:border-blue-400 disabled:opacity-50 bg-white text-slate-900" />
                        </>
                      ) : (
                        <div className="flex items-center h-full pt-4">
                          <span className="text-xs text-slate-400 italic">Menggunakan kamera bawaan perangkat.</span>
                        </div>
                      )}
                    </div>
                  </div>
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-3 p-3 border border-slate-200 rounded-lg bg-slate-50">
                    <span className="text-xs text-slate-500">Status:</span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${isVideoConnected ? 'bg-orange-100 text-orange-700' : 'bg-rose-100 text-rose-600'}`}>
                      {isVideoConnected ? 'STREAMING' : 'DISCONNECTED'}
                    </span>
                  </div>
                  <button
                    onClick={handleConnectVideo}
                    className={`w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 text-white transition ${isVideoConnected ? 'bg-rose-500 hover:bg-rose-400' : 'bg-orange-500 hover:bg-orange-400'}`}
                  >
                    <Power className="w-4 h-4" />
                    {isVideoConnected ? 'STOP STREAM' : (droneMode === 'simulasi' || videoProtocol === 'dummy' ? 'AKTIFKAN WEBCAM' : (videoProtocol === 'hls' ? 'CONNECT HLS STREAM' : 'CONNECT MJPEG STREAM'))}
                  </button>
                </div>
              </div>
            )}

            {/* Drone Management */}
            {activeSettingNode === 'drones' && (
              <div className="flex flex-col h-full gap-4">
                <div>
                  <h2 className="text-base font-extrabold flex items-center gap-2 mb-1 text-slate-900"><Plane className="w-4 h-4 text-blue-500" /> Manajemen Drone</h2>
                  <p className="text-xs text-slate-500">Kelola daftar armada drone untuk target upload misi.</p>
                </div>
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className="text-[9px] font-bold block mb-1 text-slate-400 tracking-widest">ID DRONE</label>
                      <input type="text" value={droneForm.id} onChange={e => setDroneForm({ ...droneForm, id: e.target.value })} disabled={isEditingDrone} placeholder="DRN-001" className="w-full border border-slate-200 rounded-lg p-2 text-xs disabled:opacity-50 focus:outline-none bg-white text-slate-900" />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold block mb-1 text-slate-400 tracking-widest">MERK</label>
                      <input type="text" value={droneForm.merk} onChange={e => setDroneForm({ ...droneForm, merk: e.target.value })} placeholder="DJI Matrice 300" className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:outline-none bg-white text-slate-900" />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold block mb-1 text-slate-400 tracking-widest">STATUS</label>
                      <select value={droneForm.status} onChange={e => setDroneForm({ ...droneForm, status: e.target.value })} className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:outline-none bg-white text-slate-900">
                        <option value="Standby">Standby</option>
                        <option value="Active">Active</option>
                        <option value="Maintenance">Maintenance</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    {isEditingDrone && (
                      <button onClick={() => { setIsEditingDrone(false); setDroneForm({ id: '', merk: '', status: 'Standby' }); }} className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-slate-200 text-slate-700 hover:bg-slate-300 transition">BATAL</button>
                    )}
                    <button
                      onClick={() => {
                        if (!droneForm.id || !droneForm.merk) return;
                        if (isEditingDrone) setDrones(p => p.map(d => d.id === droneForm.id ? droneForm : d));
                        else setDrones(p => [...p, droneForm]);
                        setDroneForm({ id: '', merk: '', status: 'Standby' });
                        setIsEditingDrone(false);
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                    >
                      <Save className="w-3 h-3" /> {isEditingDrone ? 'UPDATE' : 'TAMBAH'}
                    </button>
                  </div>
                </div>
                <div className="flex-1 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <table className="w-full text-[10px]">
                    <thead className="border-b bg-slate-100 text-slate-600 border-slate-200">
                      <tr><th className="p-2 text-left">ID</th><th className="p-2 text-left">Merk</th><th className="p-2 text-center">Status</th><th className="p-2 text-center">Aksi</th></tr>
                    </thead>
                    <tbody className="text-slate-700">
                      {drones.map(d => (
                        <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-2 font-bold text-blue-600">{d.id}</td>
                          <td className="p-2">{d.merk}</td>
                          <td className="p-2 text-center">
                            <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold ${d.status === 'Standby' ? 'bg-blue-50 text-blue-600 border-blue-200' : d.status === 'Active' ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-slate-100 text-slate-500 border-slate-300'}`}>
                              {d.status}
                            </span>
                          </td>
                          <td className="p-2 text-center">
                            <div className="flex justify-center gap-1.5">
                              <button onClick={() => { setDroneForm(d); setIsEditingDrone(true); }} className="p-1.5 rounded text-orange-600 bg-orange-50 border border-orange-200 hover:bg-orange-100 transition"><Edit className="w-3 h-3" /></button>
                              <button onClick={() => setDrones(p => p.filter(x => x.id !== d.id))} className="p-1.5 rounded text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition"><Trash2 className="w-3 h-3" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {drones.length === 0 && <tr><td colSpan="4" className="text-center p-4 italic text-slate-400">Belum ada data drone.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Raw Data */}
            {activeSettingNode === 'raw_data' && (
              <div className="flex flex-col h-full gap-4">
                <div>
                  <h2 className="text-base font-extrabold flex items-center gap-2 mb-1 text-slate-900"><ListTree className="w-4 h-4 text-blue-500" /> Raw Data Telemetry</h2>
                  <p className="text-xs text-slate-500">Log data mentah sensor drone secara live.</p>
                </div>
                <div className="flex-1 border border-slate-200 rounded-xl overflow-hidden flex flex-col bg-white">
                  <div className="overflow-y-auto flex-1">
                    <table className="w-full text-[10px]">
                      <thead className="sticky top-0 border-b bg-slate-100 text-slate-600 border-slate-200">
                        <tr><th className="p-2 text-left">Waktu</th><th className="p-2 text-left">Mode</th><th className="p-2 text-left">GPS (Lat, Lon, Alt)</th><th className="p-2 text-left">Accel (ax, ay, az)</th><th className="p-2 text-left">Gyro (gx, gy, gz)</th></tr>
                      </thead>
                      <tbody className="text-slate-700">
                        {!droneMode
                          ? <tr><td colSpan="5" className="text-center p-4 italic text-slate-400">Pilih Mode Sistem terlebih dahulu.</td></tr>
                          : telemetryHistory.length === 0
                            ? <tr><td colSpan="5" className="text-center p-4 italic text-slate-400">Menunggu data telemetri...</td></tr>
                            : telemetryHistory.map((d, i) => (
                              <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="p-2 text-blue-600">{d.timestamp}</td>
                                <td className="p-2 font-bold text-slate-800">{d.mode}</td>
                                <td className="p-2">{d.lat?.toFixed(5) || 0}, {d.lon?.toFixed(5) || 0}, {d.alt?.toFixed(1) || 0}m</td>
                                <td className="p-2 font-mono text-[9px] text-slate-500">{d.ax?.toFixed(2) || 0} / {d.ay?.toFixed(2) || 0} / {d.az?.toFixed(2) || 0}</td>
                                <td className="p-2 font-mono text-[9px] text-orange-600">{d.gx?.toFixed(2) || 0} / {d.gy?.toFixed(2) || 0} / {d.gz?.toFixed(2) || 0}</td>
                              </tr>
                            ))
                        }
                      </tbody>
                    </table>
                  </div>
                  <div className="p-2 flex justify-end gap-2 border-t border-slate-200 bg-slate-50">
                    <button onClick={() => setTelemetryHistory([])} disabled={!telemetryHistory.length} className="flex items-center gap-1 px-3 py-1.5 rounded text-[9px] font-bold border bg-white text-rose-600 border-rose-200 hover:bg-rose-50 disabled:opacity-50 transition"><Trash2 className="w-3 h-3" /> CLEAR</button>
                    <button onClick={handleExportTelemetry} disabled={!telemetryHistory.length} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[9px] font-bold disabled:opacity-50 transition"><Download className="w-3 h-3" /> EXPORT</button>
                  </div>
                </div>
              </div>
            )}

            {/* AI Assistant */}
            {activeSettingNode === 'ai' && (
              <div className="flex flex-col h-full gap-4">
                <div>
                  <h2 className="text-base font-extrabold flex items-center gap-2 mb-1 text-slate-900"><Bot className="w-4 h-4 text-orange-500" /> AI Assistant (Gemini)</h2>
                  <p className="text-xs text-slate-500">Tanyakan apapun tentang misi drone kepada AI.</p>
                </div>
                <div className="flex-1 border border-slate-200 rounded-xl p-3 overflow-y-auto flex flex-col gap-3 bg-slate-50 shadow-inner">
                  {aiHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-2.5 rounded-xl text-xs leading-relaxed ${msg.role === 'user' ? 'bg-orange-500 text-white rounded-br-none' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isAiLoading && (
                    <div className="flex justify-start">
                      <div className="p-2.5 rounded-xl border bg-white text-slate-500 border-slate-200 flex items-center gap-2 text-xs shadow-sm">
                        <Loader2 className="w-3 h-3 animate-spin" /> Menganalisis...
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiInput}
                    onChange={e => setAiInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAskGemini()}
                    placeholder="Ketik prompt analisis..."
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-orange-400 bg-white text-slate-900"
                  />
                  <button onClick={handleAskGemini} disabled={isAiLoading || !aiInput.trim()} className="bg-orange-500 hover:bg-orange-400 text-white px-4 rounded-lg disabled:opacity-50 flex items-center justify-center transition">
                    <SendHorizontal className="w-4 h-4" />
                  </button>
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
