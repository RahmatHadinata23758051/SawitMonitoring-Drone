import React, { useState, useEffect } from 'react';
import { Camera, Crosshair, MonitorPlay } from 'lucide-react';
import Hls from 'hls.js';

const GCSCameraPanel = ({
  droneMode, isVideoConnected, webcamStream, videoRef,
  liveStreamUrl, setIsVideoConnected, setAlertPopup,
  liveAiVision, telemetry, targetAltitude,
  isPipVisible, setIsPipVisible
}) => {
  const hlsVideoRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const wsRef = React.useRef(null);
  const [hlsStatus, setHlsStatus] = useState('WAITING');

  // WEBSOCKET FPV LOGIC
  useEffect(() => {
    // Hanya aktif jika mode real, video connected, dan bukan HLS stream
    if (droneMode === 'real' && isVideoConnected && !liveStreamUrl?.endsWith('.m3u8')) {
      const ws = new WebSocket('ws://127.0.0.1:3003');
      wsRef.current = ws;
      
      ws.binaryType = 'blob';

      ws.onopen = () => {
        console.log('[FPV] WebSocket Terhubung');
      };

      ws.onmessage = async (event) => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        
        try {
          // Native zero-buffer drawing (setara C++ GPU render)
          const bitmap = await createImageBitmap(event.data);
          ctx.drawImage(bitmap, 0, 0, canvasRef.current.width, canvasRef.current.height);
          bitmap.close(); // Cegah memory leak
        } catch (e) {
          console.error('[FPV] Render Error:', e);
        }
      };

      ws.onerror = () => {
        console.error('[FPV] WebSocket Error');
        setIsVideoConnected(false);
        setAlertPopup({ title: 'Video Terputus', message: 'Koneksi FPV WebSocket gagal.' });
      };

      return () => {
        if (ws.readyState === 1 || ws.readyState === 0) ws.close();
      };
    }
  }, [droneMode, isVideoConnected, liveStreamUrl, setIsVideoConnected, setAlertPopup]);

  // HLS LOGIC
  useEffect(() => {
    let hls;
    if (droneMode === 'real' && isVideoConnected && liveStreamUrl?.endsWith('.m3u8')) {
      if (Hls.isSupported() && hlsVideoRef.current) {
        setHlsStatus('INIT');
        hls = new Hls({ lowLatencyMode: true, manifestLoadingMaxRetry: 999, manifestLoadingRetryDelay: 2000 });
        hls.loadSource(liveStreamUrl);
        hls.attachMedia(hlsVideoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          hlsVideoRef.current?.play().catch(() => setHlsStatus('BLOCKED'));
          setHlsStatus('PLAYING');
        });
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            setHlsStatus('ERR: ' + data.type);
            setTimeout(() => {
              if (hls) {
                hls.destroy();
                hls = new Hls({ lowLatencyMode: true, manifestLoadingMaxRetry: 999, manifestLoadingRetryDelay: 2000 });
                hls.loadSource(liveStreamUrl);
                hls.attachMedia(hlsVideoRef.current);
              }
            }, 2000);
          }
        });
      } else if (hlsVideoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
        hlsVideoRef.current.src = liveStreamUrl;
        setHlsStatus('NATIVE HLS');
      }
    }
    return () => { if (hls) hls.destroy(); };
  }, [droneMode, isVideoConnected, liveStreamUrl]);

  return (
    <div className="flex items-start justify-center gap-4 w-full pointer-events-auto">
      {/* CAM 1: RGB */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-md flex flex-col w-[320px]">
        <div className="h-7 bg-slate-50 border-b border-slate-200 px-2 flex items-center justify-between shrink-0 select-none">
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600">
            <Camera className="w-3 h-3 text-rose-600" /> CAM 1: RGB
          </span>
          <div className="flex items-center gap-2 text-[9px] font-mono">
            <div className={`w-1.5 h-1.5 rounded-full ${droneMode && isVideoConnected ? 'bg-rose-500 animate-pulse' : 'bg-slate-300'}`} />
            <span className="text-rose-500 font-bold">
              REC {droneMode === 'simulasi' ? '(WEBC)' : droneMode === 'real' ? '(REAL)' : '(STBY)'}
            </span>
          </div>
        </div>
        <div className="relative bg-black w-full" style={{ aspectRatio: '16/9' }}>
          {droneMode === 'simulasi' && isVideoConnected && webcamStream ? (
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          ) : droneMode === 'real' && isVideoConnected ? (
            liveStreamUrl?.endsWith('.m3u8') ? (
              <video ref={hlsVideoRef} autoPlay playsInline muted className="w-full h-full object-cover"
                onError={() => { setIsVideoConnected(false); setAlertPopup({ title: 'Video Terputus', message: 'Gagal memuat HLS stream.' }); }} />
            ) : (
              <canvas ref={canvasRef} width={640} height={360} className="w-full h-full object-cover" />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-slate-500 text-[10px] font-mono border border-slate-600 border-dashed px-3 py-1.5 rounded">NO SIGNAL</span>
            </div>
          )}
        </div>
      </div>

      {/* CAM 2: AI Multispectral */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-md flex flex-col w-[320px]">
        <div className="h-7 bg-slate-50 border-b border-slate-200 px-2 flex items-center justify-between shrink-0 select-none">
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600">
            <Camera className="w-3 h-3 text-emerald-600" /> CAM 2: AI MULTISPECTRAL
          </span>
          <span className="text-blue-600 font-bold text-[9px] font-mono">TARGET ALT: {targetAltitude?.toFixed(1) ?? '--'}m</span>
        </div>
        <div className="relative bg-[#0a101d] w-full" style={{ aspectRatio: '16/9' }}>
          {droneMode && isVideoConnected ? (
            <>
              <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(16,185,129,0.3) 1px, transparent 0)', backgroundSize: '15px 15px' }} />
              <Crosshair
                className={`absolute w-7 h-7 pointer-events-none transition-all duration-300 ${liveAiVision?.isPalmFruit ? 'text-rose-500 scale-125 opacity-80' : 'text-emerald-500 opacity-50'}`}
                style={{ top: `calc(${liveAiVision?.boxPos?.top ?? 30}% - 14px)`, left: `calc(${liveAiVision?.boxPos?.left ?? 40}% - 14px)` }}
              />
              {liveAiVision?.isPalmFruit && (
                <div className={`absolute w-10 h-14 border-2 ${liveAiVision.condition === 'Matang' ? 'border-orange-500 bg-orange-500/20' : 'border-slate-400 bg-slate-400/20'}`}
                  style={{ top: `${liveAiVision.boxPos.top}%`, left: `${liveAiVision.boxPos.left}%` }}>
                  <div className="absolute -top-3.5 bg-black/80 text-white text-[7px] px-1 font-bold w-full text-center border-b border-inherit whitespace-nowrap">
                    {liveAiVision.condition} ({liveAiVision.confidence}%)
                  </div>
                </div>
              )}
              {telemetry.subState === 'SCAN_QLV_CAPTURE' && <div className="absolute inset-0 bg-white/40 z-30 pointer-events-none" />}
              {telemetry.subState === 'SCAN_TRAD' && <div className="absolute inset-0 bg-white/10 z-30 pointer-events-none animate-pulse" />}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-slate-500 text-[10px] font-mono border border-slate-600 border-dashed px-3 py-1.5 rounded">NO SIGNAL</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GCSCameraPanel;
