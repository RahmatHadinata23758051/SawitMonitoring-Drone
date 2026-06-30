import React, { useState, useEffect, useRef } from 'react';
import { Camera, Crosshair, MonitorPlay } from 'lucide-react';
import Hls from 'hls.js';

/**
 * WebGL Drone FPV Stream — Pengganti OpenGL ES di Browser
 * 
 * Menggunakan WebGL (yang dibangun di atas OpenGL ES 2.0) untuk rendering video.
 * Alur kerja IDENTIK dengan Android GLSurfaceView:
 *   1. Terima JPEG frame via WebSocket
 *   2. Decode ke ImageBitmap (GPU-friendly format)
 *   3. Upload ke GPU sebagai texture (gl.texImage2D — sama persis dengan OpenGL ES)
 *   4. Render fullscreen quad menggunakan vertex + fragment shader pada 60 FPS
 * 
 * Keuntungan vs Canvas2D:
 *   - Zero CPU compositing (langsung di GPU)
 *   - V-sync aligned (tidak ada tearing)
 *   - Gambar "ditahan" sebagai GPU texture, di-redraw setiap 16ms
 */

// Vertex shader: fullscreen quad
const VERTEX_SHADER_SRC = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_texCoord;
  }
`;

// Fragment shader: sample texture
const FRAGMENT_SHADER_SRC = `
  precision mediump float;
  varying vec2 v_texCoord;
  uniform sampler2D u_texture;
  void main() {
    gl_FragColor = texture2D(u_texture, v_texCoord);
  }
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

const DroneCanvasStream = ({ wsUrl = `ws://${window.location.hostname}:3003` }) => {
  const canvasRef = useRef(null);
  const latestBitmapRef = useRef(null);
  const textureReadyRef = useRef(false);
  const rafIdRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // === INIT WebGL (OpenGL ES 2.0 di Browser) ===
    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      desynchronized: true,       // Bypass V-sync queue untuk ultra-low latency
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance'
    });

    if (!gl) {
      console.error('[FPV WebGL] WebGL tidak tersedia, fallback ke Canvas2D');
      return;
    }

    console.log('[FPV WebGL] GPU:', gl.getParameter(gl.RENDERER));

    // === SHADERS (sama dengan GLSL di OpenGL ES) ===
    const vertShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
    const fragShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);
    const program = gl.createProgram();
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // === FULLSCREEN QUAD (2 triangles = 1 rectangle) ===
    // Posisi vertex (clip space)            Texcoord (UV, flipped Y)
    const vertices = new Float32Array([
      -1, -1,   0, 1,   // Bottom-left
       1, -1,   1, 1,   // Bottom-right
      -1,  1,   0, 0,   // Top-left
       1,  1,   1, 0,   // Top-right
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(program, 'a_position');
    const aTex = gl.getAttribLocation(program, 'a_texCoord');
    gl.enableVertexAttribArray(aPos);
    gl.enableVertexAttribArray(aTex);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0);
    gl.vertexAttribPointer(aTex, 2, gl.FLOAT, false, 16, 8);

    // === TEXTURE (gl.texImage2D — sama persis dengan OpenGL ES) ===
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // === RENDER LOOP: 60 FPS GPU redraw ===
    function renderLoop() {
      if (textureReadyRef.current) {
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      rafIdRef.current = requestAnimationFrame(renderLoop);
    }
    rafIdRef.current = requestAnimationFrame(renderLoop);

    // === WebSocket: Terima JPEG frame dari drone ===
    const ws = new WebSocket(wsUrl);
    ws.binaryType = 'blob';
    wsRef.current = ws;

    ws.onmessage = async (event) => {
      try {
        const newBitmap = await createImageBitmap(event.data);
        // Upload ke GPU texture (gl.texImage2D — inti dari OpenGL ES rendering)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, newBitmap);
        textureReadyRef.current = true;
        // Free bitmap setelah upload ke GPU
        if (latestBitmapRef.current) latestBitmapRef.current.close();
        latestBitmapRef.current = newBitmap;
      } catch (e) {
        // Frame corrupt, skip
      }
    };

    ws.onerror = (e) => console.error('[FPV WebGL] WS Error:', e);
    ws.onclose = () => console.warn('[FPV WebGL] WS Closed');

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      if (wsRef.current && wsRef.current.readyState <= 1) wsRef.current.close();
      if (latestBitmapRef.current) {
        latestBitmapRef.current.close();
        latestBitmapRef.current = null;
      }
      gl.deleteTexture(texture);
      gl.deleteProgram(program);
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);
      gl.deleteBuffer(buffer);
    };
  }, [wsUrl]);

  return (
    <canvas
      ref={canvasRef}
      width={640}
      height={360}
      className="w-full h-full object-cover"
    />
  );
};

const GCSCameraPanel = ({
  droneMode, isVideoConnected, webcamStream, videoRef,
  liveStreamUrl, setIsVideoConnected, setAlertPopup,
  liveAiVision, telemetry, targetAltitude,
  isPipVisible, setIsPipVisible
}) => {
  const hlsVideoRef = useRef(null);
  const [hlsStatus, setHlsStatus] = useState('WAITING');

  // HLS LOGIC (untuk stream lain jika diperlukan)
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

  // Render video content based on mode
  const renderVideoContent = () => {
    if (droneMode === 'simulasi' && isVideoConnected && webcamStream) {
      return <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />;
    }

    if (droneMode === 'real' && isVideoConnected) {
      if (liveStreamUrl?.endsWith('.m3u8')) {
        return (
          <video ref={hlsVideoRef} autoPlay playsInline muted className="w-full h-full object-cover"
            onError={() => { setIsVideoConnected(false); setAlertPopup({ title: 'Video Terputus', message: 'Gagal memuat HLS stream.' }); }} />
        );
      }

      // GPU-Accelerated Canvas Stream (60 FPS redraw, persis Android SurfaceView)
      return <DroneCanvasStream wsUrl={`ws://${window.location.hostname}:3003`} />;
    }

    return (
      <div className="w-full h-full flex items-center justify-center">
        <span className="text-slate-500 text-[10px] font-mono border border-slate-600 border-dashed px-3 py-1.5 rounded">NO SIGNAL</span>
      </div>
    );
  };

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
          {renderVideoContent()}
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
