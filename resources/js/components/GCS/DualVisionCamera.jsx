import React from 'react';
import { Camera, Zap } from 'lucide-react';

const DualVisionCamera = ({ missionState }) => {
    return (
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-md col-span-2">
            <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                <Camera size={16} /> Live Feed (Kamera Sisi Kiri & Kanan)
            </h3>
            
            <div className="grid grid-cols-2 gap-4 h-64">
                {/* Kamera Kiri */}
                <div className="bg-slate-950 rounded-lg overflow-hidden relative border border-slate-700 flex flex-col">
                    <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-[10px] text-white flex gap-2 items-center z-10 backdrop-blur-sm shadow">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        CAM: KIRI (LEFT FPV)
                    </div>
                    {missionState === 'FLYING' ? (
                        <div className="flex-1 flex items-center justify-center relative bg-[url('https://images.unsplash.com/photo-1598516766453-30c883e3eeff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center">
                            <div className="absolute inset-0 bg-slate-900/40 mix-blend-multiply"></div>
                            <div className="text-white/60 z-10 font-mono text-xs flex items-center gap-2 bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                                <Zap size={14} className="text-yellow-400" /> TRANSMISI AKTIF
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-500 font-mono text-sm tracking-widest bg-slate-900">
                            OFFLINE
                        </div>
                    )}
                </div>

                {/* Kamera Kanan */}
                <div className="bg-slate-950 rounded-lg overflow-hidden relative border border-slate-700 flex flex-col">
                    <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-[10px] text-white flex gap-2 items-center z-10 backdrop-blur-sm shadow">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        CAM: KANAN (RIGHT FPV)
                    </div>
                    
                    {missionState === 'FLYING' ? (
                         <div className="flex-1 flex items-center justify-center relative bg-[url('https://images.unsplash.com/photo-1598516766453-30c883e3eeff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center" style={{ transform: 'scaleX(-1)' /* Flipping image to simulate opposite side */ }}>
                            <div className="absolute inset-0 bg-slate-900/40 mix-blend-multiply" style={{ transform: 'scaleX(-1)' }}></div>
                            <div className="text-white/60 z-10 font-mono text-xs flex items-center gap-2 bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm" style={{ transform: 'scaleX(-1)' }}>
                                <Zap size={14} className="text-yellow-400" /> TRANSMISI AKTIF
                            </div>
                         </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-500 font-mono text-sm tracking-widest bg-slate-900">
                            OFFLINE
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DualVisionCamera;
