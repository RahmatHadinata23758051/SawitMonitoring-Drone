import React from 'react';
import { Activity, Gauge, Plane, BatteryMedium } from 'lucide-react';

const GaugeCockpit = ({ telemetry }) => {
    // Default mock data if telemetry is undefined
    const data = telemetry || {
        speed: 0.0,
        altitude: 0.0,
        pitch: 0.0,
        roll: 0.0,
        yaw: 0.0,
        battery: 100
    };

    return (
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-md col-span-3">
             <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                <Activity size={16} /> Instrumen Penerbangan
            </h3>

            <div className="grid grid-cols-6 gap-3">
                {/* Speed */}
                <div className="bg-slate-950 border border-slate-700 p-3 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                    <Gauge size={24} className="text-blue-500 mb-1 opacity-50" />
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider relative z-10">Kecepatan</span>
                    <span className="text-2xl font-black text-white relative z-10">{data.speed.toFixed(1)} <span className="text-sm text-slate-400">m/s</span></span>
                    
                    {/* Fake Progress */}
                    <div className="absolute bottom-0 left-0 h-1 bg-blue-600 transition-all duration-300" style={{ width: `${Math.min(data.speed * 10, 100)}%` }}></div>
                </div>

                {/* Altitude */}
                <div className="bg-slate-950 border border-slate-700 p-3 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                    <Plane size={24} className="text-indigo-400 mb-1 opacity-50 -rotate-45" />
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider relative z-10">Ketinggian</span>
                    <span className="text-2xl font-black text-white relative z-10">{data.altitude.toFixed(1)} <span className="text-sm text-slate-400">m</span></span>
                    
                    {/* Fake Progress */}
                    <div className="absolute bottom-0 left-0 h-1 bg-indigo-500 transition-all duration-300" style={{ width: `${Math.min(data.altitude * 2, 100)}%` }}></div>
                </div>

                {/* Pitch, Roll, Yaw */}
                <div className="col-span-3 bg-slate-950 border border-slate-700 p-3 rounded-lg grid grid-cols-3 gap-2 divide-x divide-slate-800 relative overflow-hidden">
                    {/* Gyro Icon bg */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-[0.03]">
                        <Compass size={120} />
                    </div>

                    <div className="flex flex-col items-center justify-center relative z-10">
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Pitch</span>
                        <span className="text-xl font-bold text-sky-400">{data.pitch.toFixed(1)}&deg;</span>
                    </div>
                    <div className="flex flex-col items-center justify-center relative z-10">
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Roll</span>
                        <span className="text-xl font-bold text-teal-400">{data.roll.toFixed(1)}&deg;</span>
                    </div>
                    <div className="flex flex-col items-center justify-center relative z-10">
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Yaw</span>
                        <span className="text-xl font-bold text-fuchsia-400">{data.yaw.toFixed(1)}&deg;</span>
                    </div>
                </div>

                {/* Battery */}
                <div className="bg-slate-950 border border-slate-700 p-3 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                    <BatteryMedium size={24} className={`${data.battery < 20 ? 'text-red-500 animate-pulse' : 'text-green-500'} mb-1 opacity-80`} />
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider relative z-10">Baterai</span>
                    <span className={`text-2xl font-black relative z-10 ${data.battery < 20 ? 'text-red-500' : 'text-white'}`}>{data.battery.toFixed(0)} <span className="text-sm opacity-50">%</span></span>
                    
                    <div className={`absolute bottom-0 left-0 h-1 transition-all duration-300 ${data.battery < 20 ? 'bg-red-600' : 'bg-green-600'}`} style={{ width: `${data.battery}%` }}></div>
                </div>
            </div>
        </div>
    );
};

// Workaround for missing Compass icon in this specific block scope (imported from 'lucide-react' directly here)
import { Compass } from 'lucide-react';

export default GaugeCockpit;
