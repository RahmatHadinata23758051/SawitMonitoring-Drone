import React, { useRef, useEffect } from 'react';
import { Camera, Eye, Zap } from 'lucide-react';

const DualVisionCamera = ({ missionState, stats, setStats }) => {
    // Simulasi Vision (AI Bounding Box logic) akan ditanam di sini
    // Pada Epic 5, video ref ini akan dicapture menggunakan canvas
    
    return (
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-md col-span-2">
            <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                <Camera size={16} /> Live Feed & AI Vision
            </h3>
            
            <div className="grid grid-cols-2 gap-4 h-64">
                {/* Kamera 1 (RGB / MJPEG) */}
                <div className="bg-slate-950 rounded-lg overflow-hidden relative border border-slate-700 flex flex-col">
                    <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-[10px] text-white flex gap-2 items-center z-10 backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        LIVE STREAM (RGB)
                    </div>
                    {missionState === 'FLYING' ? (
                        /* Placeholder for actual streaming feed */
                        <div className="flex-1 flex items-center justify-center relative bg-[url('https://images.unsplash.com/photo-1598516766453-30c883e3eeff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center">
                            <div className="absolute inset-0 bg-black/20"></div>
                            <div className="text-white/50 z-10 font-mono flex items-center gap-2">
                                <Zap size={16} /> TRANSMISI AKTIF
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-600 font-mono text-sm">
                            STANDBY MODE
                        </div>
                    )}
                </div>

                {/* Kamera 2 (Multispectral AI Overlay) */}
                <div className="bg-slate-950 rounded-lg overflow-hidden relative border border-slate-700">
                    <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-[10px] text-emerald-400 flex gap-2 items-center z-10 backdrop-blur-sm">
                        <Eye size={12} />
                        AI DETECTOR
                    </div>
                    
                    {missionState === 'FLYING' ? (
                         <div className="w-full h-full relative bg-[url('https://images.unsplash.com/photo-1598516766453-30c883e3eeff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center grayscale contrast-125">
                            <div className="absolute inset-0 bg-emerald-900/40 mix-blend-color"></div>
                            {/* Dummy AI Overlay Bounding Box */}
                            <div className="absolute top-1/4 left-1/4 w-20 h-24 border-2 border-green-500 rounded-sm bg-green-500/10 flex flex-col justify-end">
                                <span className="bg-green-500 text-white text-[9px] font-bold px-1 py-0.5 w-max">MATANG 98%</span>
                            </div>
                            <div className="absolute top-1/2 left-2/3 w-16 h-20 border-2 border-yellow-500 rounded-sm bg-yellow-500/10 flex flex-col justify-end">
                                <span className="bg-yellow-500 text-black text-[9px] font-bold px-1 py-0.5 w-max">MENTAH 85%</span>
                            </div>
                         </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600 font-mono text-sm">
                            NO INPUT
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DualVisionCamera;
