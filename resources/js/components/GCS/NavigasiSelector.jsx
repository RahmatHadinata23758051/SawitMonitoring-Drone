import React from 'react';
import { Navigation, Play, Square, Pause, Home } from 'lucide-react';

const NavigasiSelector = ({ 
    navMode, 
    setNavMode, 
    missionState, 
    onStart, 
    onPause, 
    onReset, 
    onRTH 
}) => {
    return (
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-md">
            <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                <Navigation size={16} /> Mode Navigasi
            </h3>

            {/* Mode Selection */}
            <div className="flex bg-slate-900 rounded-lg p-1 mb-4 border border-slate-700">
                <button
                    className={`flex-1 text-xs font-medium py-2 rounded-md transition-all ${
                        navMode === 'QLV' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                    onClick={() => setNavMode('QLV')}
                >
                    QLV (Otomatis)
                </button>
                <button
                    className={`flex-1 text-xs font-medium py-2 rounded-md transition-all ${
                        navMode === 'TRAD' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                    onClick={() => setNavMode('TRAD')}
                >
                    Tradisional
                </button>
            </div>

            {/* Mission Controls */}
            <div className="grid grid-cols-2 gap-2">
                {missionState === 'IDLE' || missionState === 'PAUSED' ? (
                    <button 
                        onClick={onStart}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                    >
                        <Play size={16} /> {missionState === 'PAUSED' ? 'Resume' : 'Start'}
                    </button>
                ) : (
                    <button 
                        onClick={onPause}
                        className="bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                    >
                        <Pause size={16} /> Pause
                    </button>
                )}

                <button 
                    onClick={onReset}
                    className="bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                >
                    <Square size={16} /> Reset
                </button>

                <button 
                    onClick={onRTH}
                    className="col-span-2 bg-rose-600 hover:bg-rose-700 text-white font-medium py-2 mt-1 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                >
                    <Home size={16} /> Return to Home (RTH)
                </button>
            </div>
        </div>
    );
};

export default NavigasiSelector;
