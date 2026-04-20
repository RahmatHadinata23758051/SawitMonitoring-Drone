import React from 'react';
import { Save, Map } from 'lucide-react';

const FormParameterBlok = ({ config, setConfig, onSave }) => {
    return (
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-md">
            <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                <Map size={16} /> Parameter Blok
            </h3>
            
            <div className="space-y-3">
                {/* Luas Lahan */}
                <div>
                    <label className="text-xs text-slate-500 mb-1 block">Luas Area (Hektar)</label>
                    <input 
                        type="number" 
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                        value={config.luasKebun || 2}
                        onChange={(e) => setConfig({ ...config, luasKebun: parseFloat(e.target.value) })}
                    />
                </div>
                
                {/* Total Pohon */}
                <div>
                    <label className="text-xs text-slate-500 mb-1 block">Total Pohon Sawit</label>
                    <input 
                        type="number" 
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                        value={config.totalPohon || 100}
                        onChange={(e) => setConfig({ ...config, totalPohon: parseInt(e.target.value) })}
                    />
                </div>

                <button 
                    onClick={onSave}
                    className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                >
                    <Save size={16} /> Simpan Config
                </button>
            </div>
        </div>
    );
};

export default FormParameterBlok;
