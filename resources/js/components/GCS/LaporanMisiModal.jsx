import React from 'react';
import { FileText, Download, X } from 'lucide-react';

const LaporanMisiModal = ({ isOpen, onClose, stats }) => {
    if (!isOpen) return null;

    const mockHistory = [
        { id: 1, time: '10:05:22', action: 'Scan Point A', lat: -0.5891, lng: 101.4581, status: 'MATANG' },
        { id: 2, time: '10:06:14', action: 'Scan Point B', lat: -0.5892, lng: 101.4583, status: 'MENTAH' },
        { id: 3, time: '10:07:05', action: 'Scan Point C', lat: -0.5894, lng: 101.4584, status: 'MATANG' },
    ];

    const handleExportCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,ID,Time,Action,Lat,Lng,Status\n";
        mockHistory.forEach(row => {
            csvContent += `${row.id},${row.time},${row.action},${row.lat},${row.lng},${row.status}\n`;
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "laporan_terbang_gcs_sawit.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[80vh]">
                
                {/* Header */}
                <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-white font-bold flex items-center gap-2"><FileText /> Laporan Misi Terbang</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X /></button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto space-y-6">
                    {/* Ringkasan */}
                    <div className="grid grid-cols-4 gap-4">
                        <div className="bg-slate-950 border border-slate-700 p-4 rounded-xl text-center">
                            <span className="text-xs text-slate-500 uppercase block mb-1">Total Target</span>
                            <span className="text-2xl font-bold text-white">{stats?.total || 100}</span>
                        </div>
                        <div className="bg-slate-950 border border-green-900/50 p-4 rounded-xl text-center">
                            <span className="text-xs text-green-600/70 uppercase block mb-1">Total Matang</span>
                            <span className="text-2xl font-bold text-green-500">{stats?.matang || 0}</span>
                        </div>
                        <div className="bg-slate-950 border border-yellow-900/50 p-4 rounded-xl text-center">
                            <span className="text-xs text-yellow-600/70 uppercase block mb-1">Total Mentah</span>
                            <span className="text-2xl font-bold text-yellow-500">{stats?.mentah || 0}</span>
                        </div>
                        <div className="bg-slate-950 border border-slate-700 p-4 rounded-xl flex items-center justify-center">
                             <button onClick={handleExportCSV} className="w-full h-full bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg flex flex-col items-center justify-center transition break-words">
                                 <Download size={20} className="mb-1 text-indigo-400" />
                                 <span className="text-xs">Export CSV</span>
                             </button>
                        </div>
                    </div>

                    {/* Tabel Log Misi */}
                    <div>
                        <h3 className="text-white font-semibold mb-3">Log Telemetri Koordinat AI</h3>
                        <div className="overflow-x-auto rounded-xl border border-slate-700">
                            <table className="w-full text-left text-sm text-slate-400 border-collapse">
                                <thead className="bg-slate-800 text-slate-300">
                                    <tr>
                                        <th className="p-3 border-b border-slate-700">#ID</th>
                                        <th className="p-3 border-b border-slate-700">Waktu</th>
                                        <th className="p-3 border-b border-slate-700">Tindakan</th>
                                        <th className="p-3 border-b border-slate-700">Latitude</th>
                                        <th className="p-3 border-b border-slate-700">Longitude</th>
                                        <th className="p-3 border-b border-slate-700">Deteksi AI</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-slate-900">
                                    {mockHistory.map((row) => (
                                        <tr key={row.id} className="hover:bg-slate-800/50 transition-colors">
                                            <td className="p-3 border-b border-slate-800">{row.id}</td>
                                            <td className="p-3 border-b border-slate-800 font-mono">{row.time}</td>
                                            <td className="p-3 border-b border-slate-800">{row.action}</td>
                                            <td className="p-3 border-b border-slate-800 font-mono text-xs">{row.lat}</td>
                                            <td className="p-3 border-b border-slate-800 font-mono text-xs">{row.lng}</td>
                                            <td className="p-3 border-b border-slate-800">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${row.status === 'MATANG' ? 'bg-green-900/40 text-green-400' : 'bg-yellow-900/40 text-yellow-400'}`}>
                                                    {row.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default LaporanMisiModal;
