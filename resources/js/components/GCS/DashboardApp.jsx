import React, { useState } from 'react';
import FormParameterBlok from './FormParameterBlok';
import NavigasiSelector from './NavigasiSelector';
import StatistikFaktual from './StatistikFaktual';

const DashboardApp = () => {
    // Shared State for Sidebar
    const [config, setConfig] = useState({ luasKebun: 2, totalPohon: 100 });
    const [navMode, setNavMode] = useState('QLV');
    const [missionState, setMissionState] = useState('IDLE'); // IDLE, FLYING, PAUSED
    const [stats, setStats] = useState({ total: 100, matang: 0, mentah: 0 });

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
    };
    const handleRTH = () => setMissionState('IDLE');

    return (
        <div className="min-h-[85vh] bg-slate-900 border border-slate-700 rounded-xl overflow-hidden flex font-sans">
            
            {/* LEFT SIDEBAR (Epic 2) */}
            <div className="w-80 bg-slate-800/50 border-r border-slate-700 p-4 space-y-4 overflow-y-auto">
                <FormParameterBlok 
                    config={config} 
                    setConfig={setConfig} 
                    onSave={handleSaveConfig} 
                />
                
                <NavigasiSelector 
                    navMode={navMode} 
                    setNavMode={setNavMode} 
                    missionState={missionState}
                    onStart={handleStart}
                    onPause={handlePause}
                    onReset={handleReset}
                    onRTH={handleRTH}
                />

                <StatistikFaktual stats={stats} />
            </div>

            {/* MAIN CONTENT AREA (Placeholder for Epic 3) */}
            <div className="flex-1 flex flex-col p-4 bg-slate-950">
                <div className="flex-1 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center">
                    <p className="text-slate-500 font-medium">Area Visual Kamera & Radar Peta 2D (Epic 3)</p>
                </div>
            </div>

        </div>
    );
};

export default DashboardApp;
