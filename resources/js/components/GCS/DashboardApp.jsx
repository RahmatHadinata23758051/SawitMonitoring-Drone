import React, { useState, useEffect } from 'react';
import { Settings, FileText } from 'lucide-react';
import FormParameterBlok from './FormParameterBlok';
import NavigasiSelector from './NavigasiSelector';
import StatistikFaktual from './StatistikFaktual';
import DualVisionCamera from './DualVisionCamera';
import RadarMap2D from './RadarMap2D';
import GaugeCockpit from './GaugeCockpit';
import SettingsModal from './SettingsModal';
import LaporanMisiModal from './LaporanMisiModal';

const DashboardApp = () => {
    // Shared State for Sidebar
    const [config, setConfig] = useState({ luasKebun: 2, totalPohon: 100 });
    const [navMode, setNavMode] = useState('QLV');
    const [missionState, setMissionState] = useState('IDLE'); // IDLE, FLYING, PAUSED
    const [stats, setStats] = useState({ total: 100, matang: 0, mentah: 0 });

    // Modals State
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isLaporanOpen, setIsLaporanOpen] = useState(false);

    // Telemetry & Drone Physics Mock State
    const [telemetry, setTelemetry] = useState({
        speed: 0.0, altitude: 0.0, pitch: 0.0, roll: 0.0, yaw: 0.0, battery: 100
    });
    const [dronePos, setDronePos] = useState({ x: 50, y: 50, yaw: 0 });

    // Dummy Handlers
    const handleSaveConfig = () => {
        setStats({ ...stats, total: config.totalPohon });
        alert(`Config Tersimpan: ${config.luasKebun} Ha, ${config.totalPohon} Pohon`);
    };

    const handleStart = () => setMissionState('FLYING');
    const handlePause = () => setMissionState('PAUSED');
    const handleReset = () => {
        setMissionState('IDLE');
        setStats({ total: config.totalPohon, matang: 0, mentah: 0 });
        setDronePos({ x: 50, y: 50, yaw: 0 });
        setTelemetry({ speed: 0, altitude: 0, pitch: 0, roll: 0, yaw: 0, battery: 100 });
    };
    const handleRTH = () => setMissionState('IDLE');

    // Physics Simulation Loop (Epic 3)
    useEffect(() => {
        let loop;
        if (missionState === 'FLYING') {
            loop = setInterval(() => {
                setTelemetry(prev => ({
                    ...prev,
                    speed: Math.min(prev.speed + 0.1, 8.5),
                    altitude: Math.min(prev.altitude + 0.5, 30.0),
                    pitch: (Math.random() * 4) - 2,
                    roll: (Math.random() * 6) - 3,
                    yaw: prev.yaw + 1,
                    battery: Math.max(prev.battery - 0.02, 0)
                }));
                setDronePos(prev => ({
                    x: prev.x + 1,
                    y: prev.y + (Math.sin(prev.x / 10) * 2),
                    yaw: prev.yaw + 2
                }));
            }, 200);
        } else if (missionState === 'IDLE') {
            setTelemetry(prev => ({ ...prev, speed: 0, altitude: 0, pitch: 0, roll: 0 }));
        }
        return () => clearInterval(loop);
    }, [missionState]);

    return (
        <div className="min-h-[85vh] bg-slate-900 border border-slate-700 rounded-xl overflow-hidden flex flex-col font-sans relative">
            
            {/* TOP Navbar Actions */}
            <div className="absolute top-4 right-4 flex gap-2 z-40">
                <button onClick={() => setIsLaporanOpen(true)} className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-600 flex items-center gap-2 text-sm shadow-lg transition">
                    <FileText size={16} /> Data Penerbangan
                </button>
                <button onClick={() => setIsSettingsOpen(true)} className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-600 flex items-center gap-2 text-sm shadow-lg transition">
                    <Settings size={16} /> Pengaturan Sistem
                </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* LEFT SIDEBAR (Epic 2) */}
                <div className="w-80 bg-slate-800/50 border-r border-slate-700 p-4 space-y-4 overflow-y-auto pt-16">
                    <FormParameterBlok config={config} setConfig={setConfig} onSave={handleSaveConfig} />
                    <NavigasiSelector navMode={navMode} setNavMode={setNavMode} missionState={missionState} onStart={handleStart} onPause={handlePause} onReset={handleReset} onRTH={handleRTH} />
                    <StatistikFaktual stats={stats} />
                </div>

                {/* MAIN CONTENT AREA (Epic 3) */}
                <div className="flex-1 p-4 bg-slate-950 grid grid-cols-3 gap-4 auto-rows-max overflow-y-auto pt-16">
                    <DualVisionCamera missionState={missionState} stats={stats} setStats={setStats} />
                    <RadarMap2D config={config} missionState={missionState} dronePos={dronePos} />
                    <GaugeCockpit telemetry={telemetry} />
                </div>
            </div>

            {/* Modals (Epic 4) */}
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
            <LaporanMisiModal isOpen={isLaporanOpen} onClose={() => setIsLaporanOpen(false)} stats={stats} />

        </div>
    );
};

export default DashboardApp;
