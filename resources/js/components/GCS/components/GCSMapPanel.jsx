import React, { useEffect, useRef } from 'react';
import { Crosshair, Navigation, Compass, Activity } from 'lucide-react';
import { homeWP } from '../utils/gcsConstants';
import Hls from 'hls.js';

/**
 * GCSMapPanel — Panel Kamera FPV + Radar Posisi Drone (2 panel kiri atas)
 * Props: droneMode, isVideoConnected, webcamStream, videoRef, liveStreamUrl,
 *        setIsVideoConnected, setAlertPopup,
 *        telemetry, flightStatusUI,
 *        targetAltitude, radarLeft, radarTop,
 *        liveAiVision,
 *        t()
 */
const GCSMapPanel = ({
  droneMode,
  isVideoConnected,
  webcamStream,
  videoRef,
  liveStreamUrl,
  setIsVideoConnected,
  setAlertPopup,
  telemetry,
  flightStatusUI,
  targetAltitude,
  radarLeft,
  radarTop,
  liveAiVision,
  t,
}) => {
  const hlsVideoRef = useRef(null);
  const [hlsStatus, setHlsStatus] = React.useState('WAITING');

  useEffect(() => {
    let hls;
    if (droneMode === 'real' && isVideoConnected && liveStreamUrl && liveStreamUrl.endsWith('.m3u8')) {
      if (Hls.isSupported() && hlsVideoRef.current) {
        setHlsStatus('INITIALIZING HLS...');
        hls = new Hls({
          lowLatencyMode: true,
          manifestLoadingMaxRetry: 999,
          manifestLoadingRetryDelay: 2000,
        });
        hls.loadSource(liveStreamUrl);
        hls.attachMedia(hlsVideoRef.current);
        
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
          setHlsStatus('MANIFEST LOADED, PLAYING...');
          hlsVideoRef.current.play().catch(e => setHlsStatus('PLAY BLOCKED (AUTOPLAY)'));
        });

        hls.on(Hls.Events.ERROR, function(event, data) {
          if (data.fatal) {
            setHlsStatus('FATAL ERROR: ' + data.type);
            console.log("HLS Stream error, retrying...");
            setTimeout(() => {
              if (hls) {
                hls.destroy();
                hls = new Hls({
                  lowLatencyMode: true,
                  manifestLoadingMaxRetry: 999,
                  manifestLoadingRetryDelay: 2000,
                });
                hls.loadSource(liveStreamUrl);
                hls.attachMedia(hlsVideoRef.current);
              }
            }, 2000);
          } else {
            setHlsStatus('WARN: ' + data.details);
          }
        });
      } else if (hlsVideoRef.current && hlsVideoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        setHlsStatus('USING NATIVE HLS...');
        hlsVideoRef.current.src = liveStreamUrl;
      }
    }
    return () => {
      if (hls) hls.destroy();
    };
  }, [droneMode, isVideoConnected, liveStreamUrl]);

  return (
    <>
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
              <video ref={videoRef} autoPlay playsInline muted controls crossOrigin="anonymous" className="w-full h-full object-cover opacity-80" />
            ) : droneMode === 'real' && isVideoConnected ? (
              liveStreamUrl.endsWith('.m3u8') ? (
                <video ref={hlsVideoRef} autoPlay playsInline muted controls crossOrigin="anonymous" className="w-full h-full object-cover opacity-80" onError={() => { setIsVideoConnected(false); setAlertPopup({ title: 'Video Terputus', message: 'Gagal memuat HLS stream.' }); }} />
              ) : (
                <img src={liveStreamUrl} alt="Live FPV" className="w-full h-full object-cover opacity-80" onError={() => { setIsVideoConnected(false); setAlertPopup({ title: 'Video Terputus', message: 'Gagal memuat stream. Pastikan IP benar.' }); }} />
              )
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
                <Crosshair
                  className={`absolute w-8 h-8 pointer-events-none transition-all duration-300 ${liveAiVision.isPalmFruit ? 'text-rose-500 scale-125 opacity-80' : 'text-emerald-500 opacity-50'}`}
                  style={{ top: `calc(${liveAiVision.boxPos.top}% - 16px)`, left: `calc(${liveAiVision.boxPos.left}% - 16px)` }}
                />
                {liveAiVision.isPalmFruit && (
                  <div
                    className={`absolute w-12 h-16 border-2 transition-all duration-500 flex items-start justify-center ${liveAiVision.condition === 'Matang' ? 'border-orange-500 bg-orange-500/20' : 'border-slate-400 bg-slate-400/20'}`}
                    style={{ top: `${liveAiVision.boxPos.top}%`, left: `${liveAiVision.boxPos.left}%` }}
                  >
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
    </>
  );
};

export default GCSMapPanel;
