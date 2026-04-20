import React, { useMemo } from 'react';
import { Compass } from 'lucide-react';

const RadarMap2D = ({ config, missionState, dronePos }) => {
    // Generate SVG Grid 
    const trees = useMemo(() => {
        const rows = Math.ceil(Math.sqrt(config.totalPohon / 2));
        const cols = Math.ceil(config.totalPohon / rows);
        let items = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (items.length >= config.totalPohon) break;
                // Simple zigzag mathematical layout
                items.push({
                    id: `${r}-${c}`,
                    x: 50 + c * 40 + (r % 2 === 0 ? 0 : 20),
                    y: 50 + r * 35,
                    scanned: Math.random() > 0.8 // Random dummy state for scanned trees
                });
            }
        }
        return items;
    }, [config]);

    const homePoint = { x: 50, y: 50 };

    return (
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-md">
             <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                <Compass size={16} /> Radar GIS 2D Topografi
            </h3>
            
            <div className="w-full h-80 bg-slate-950 rounded-lg overflow-hidden border border-slate-700 relative">
                {/* SVG Canvas Map */}
                <svg width="100%" height="100%" viewBox="0 0 800 400" className="absolute inset-0">
                    {/* Background Grid Pattern */}
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />

                    {/* Nodes (Trees) */}
                    {trees.map((t) => (
                        <g key={t.id}>
                            <circle cx={t.x} cy={t.y} r={6} fill={t.scanned ? "#22c55e" : "#475569"} className="transition-colors duration-500" />
                        </g>
                    ))}
                    
                    {/* Drone Polygon */}
                    {missionState === 'FLYING' && (
                        <g style={{ transform: `translate(${dronePos?.x || homePoint.x}px, ${dronePos?.y || homePoint.y}px) rotate(${dronePos?.yaw || 0}deg)`, transition: 'transform 0.2s linear' }}>
                            {/* Drone Shadow */}
                            <polygon points="0,-12 10,10 -10,10" fill="rgba(0,0,0,0.5)" transform="translate(5, 5)" />
                            {/* Drone Body */}
                            <polygon points="0,-15 12,12 -12,12" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
                            <circle cx="0" cy="0" r="3" fill="#ef4444" className="animate-pulse" />
                        </g>
                    )}

                    {/* Home Indicator */}
                    <g transform={`translate(${homePoint.x}, ${homePoint.y})`}>
                        <circle cx="0" cy="0" r="10" fill="none" stroke="#ef4444" strokeWidth="2" className="animate-ping" />
                        <circle cx="0" cy="0" r="8" fill="#ef4444" />
                        <text x="-4" y="3" fill="white" fontSize="9" fontWeight="bold">H</text>
                    </g>
                </svg>

                {missionState !== 'FLYING' && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
                        <p className="text-slate-400 font-mono tracking-widest text-sm">SYSTEM DISARMED / OFFLINE</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RadarMap2D;
