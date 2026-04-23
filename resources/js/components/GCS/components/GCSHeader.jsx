import React from 'react';
import { Signal, Navigation, FileText, Settings, Maximize2, Minimize2, LayoutDashboard } from 'lucide-react';

/**
 * GCSHeader — Header bar GCS
 * Props: appSettings, t(), flightStatusUI, isFullscreen, toggleFullScreen,
 *        setIsSettingsOpen, setIsReportsOpen
 */
const GCSHeader = ({
  appSettings, t,
  flightStatusUI,
  isFullscreen, toggleFullScreen,
  setIsSettingsOpen, setIsReportsOpen,
}) => {
  return (
    <header className={`h-12 border-b flex items-center justify-between px-3 shadow-md z-10 shrink-0 ${t('bg-slate-900 border-slate-800', 'bg-white border-slate-200')}`}>
      <div className="flex items-center gap-3">
        {/* Kembali ke Dashboard */}
        <a href="/dashboard" className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded border transition ${t('border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-800', 'border-slate-300 text-slate-500 hover:text-slate-800 hover:bg-slate-100')}`} title="Kembali ke Dashboard">
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span className="hidden sm:block">Dashboard</span>
        </a>

        {/* Logo Aplikasi */}
        <div className={`h-7 w-px ${t('bg-slate-700', 'bg-slate-300')}`}></div>
        <div className="flex items-center gap-2">
          {appSettings.image ? (
            <img
              src={`/${appSettings.image}`}
              alt={appSettings.name || 'Logo'}
              className="h-8 w-auto object-contain"
              onError={e => { e.target.style.display = 'none'; e.target.nextSibling && (e.target.nextSibling.style.display = 'flex'); }}
            />
          ) : null}
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

      {/* Right side: telemetry readouts + controls */}
      <div className="flex items-center gap-4 text-xs font-mono">

        {/* LINK — placeholder sampai data MAVLink RADIO_STATUS masuk */}
        <div
          className={`flex items-center gap-1 ${t('text-slate-500', 'text-slate-400')}`}
          title="Kualitas sinyal radio — menunggu data MAVLink RADIO_STATUS dari hardware"
        >
          <Signal className="w-3 h-3" />
          <span className="line-through opacity-50">LINK</span>
          <span className="text-amber-400 font-bold">: --</span>
        </div>

        {/* GPS — placeholder sampai data MAVLink GPS_RAW_INT masuk */}
        <div
          className={`flex items-center gap-1 ${t('text-slate-500', 'text-slate-400')}`}
          title="Status GPS — menunggu data MAVLink GPS_RAW_INT dari hardware"
        >
          <Navigation className="w-3 h-3" />
          <span className="line-through opacity-50">GPS</span>
          <span className="text-amber-400 font-bold">: --</span>
        </div>

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

  );
};

export default GCSHeader;
