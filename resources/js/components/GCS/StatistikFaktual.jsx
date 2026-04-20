import React from 'react';
import { BarChart3 } from 'lucide-react';

const StatistikFaktual = ({ stats }) => {
    // Prevent division by zero
    const total = stats.total || 1;
    const pctMatang = ((stats.matang / total) * 100).toFixed(1);
    const pctMentah = ((stats.mentah / total) * 100).toFixed(1);
    const pctUnscanned = (((total - stats.matang - stats.mentah) / total) * 100).toFixed(1);

    return (
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-md">
            <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 size={16} /> Statistik Real-time
            </h3>

            <div className="space-y-4">
                {/* Progress Bar Container */}
                <div className="w-full h-4 bg-slate-700 rounded-full overflow-hidden flex">
                    <div style={{ width: `${pctMatang}%` }} className="bg-green-500 transition-all duration-300"></div>
                    <div style={{ width: `${pctMentah}%` }} className="bg-yellow-500 transition-all duration-300"></div>
                    <div style={{ width: `${pctUnscanned}%` }} className="bg-slate-600 transition-all duration-300"></div>
                </div>

                {/* Status Legend */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-900 border border-slate-700 p-2 rounded-lg text-center">
                        <span className="block text-xs text-slate-500 uppercase">Matang</span>
                        <span className="text-xl font-bold text-green-500 block">{stats.matang}</span>
                    </div>
                    <div className="bg-slate-900 border border-slate-700 p-2 rounded-lg text-center">
                        <span className="block text-xs text-slate-500 uppercase">Mentah</span>
                        <span className="text-xl font-bold text-yellow-500 block">{stats.mentah}</span>
                    </div>
                    <div className="col-span-2 bg-slate-900 border border-slate-700 p-2 rounded-lg flex justify-between items-center px-4">
                        <span className="text-xs text-slate-500 uppercase">Total Target Pohon</span>
                        <span className="text-lg font-bold text-slate-300">{stats.total}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatistikFaktual;
