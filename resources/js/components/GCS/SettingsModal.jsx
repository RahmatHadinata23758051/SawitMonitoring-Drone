import React, { useState } from 'react';
import { Settings, Radio, Video, Bot, X, Usb, Cpu } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('telemetry');
    const [geminiPrompt, setGeminiPrompt] = useState('');
    const [chatHistory, setChatHistory] = useState([{ role: 'system', text: 'AI GCS Assistant Ready.' }]);

    if (!isOpen) return null;

    // Web Serial API Logic (Epic 4)
    const handleConnectTelemetry = async () => {
        try {
            if ('serial' in navigator) {
                const port = await navigator.serial.requestPort();
                await port.open({ baudRate: 57600 });
                alert("Berhasil terhubung ke Telemetri Radio Hardware!");
            } else {
                alert("Browser ini tidak mendukung Web Serial API. Gunakan Chrome/Edge.");
            }
        } catch (error) {
            console.error(error);
            alert("Gagal menghubungkan atau batal dipilih.");
        }
    };

    // AI Gemini Mock Logic (Epic 4)
    const handleAskGemini = async () => {
        if (!geminiPrompt.trim()) return;
        setChatHistory([...chatHistory, { role: 'user', text: geminiPrompt }]);
        const currentPrompt = geminiPrompt;
        setGeminiPrompt('');
        
        // Mock API Fetch Delay
        setTimeout(() => {
            setChatHistory(prev => [...prev, { 
                role: 'system', 
                text: `[Dummy Gemini Response] Menjawab: ${currentPrompt}. Simulasi ini butuh Token API asli di Backend.` 
            }]);
        }, 1000);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[80vh]">
                
                {/* Header */}
                <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-white font-bold flex items-center gap-2"><Settings /> Pengaturan Sistem GCS</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X /></button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar Tabs */}
                    <div className="w-1/3 bg-slate-800/50 border-r border-slate-700 p-2 space-y-1">
                        <button onClick={() => setActiveTab('telemetry')} className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg text-sm text-left transition-colors ${activeTab === 'telemetry' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
                            <Radio size={16} /> Mode & Telemetri
                        </button>
                        <button onClick={() => setActiveTab('video')} className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg text-sm text-left transition-colors ${activeTab === 'video' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
                            <Video size={16} /> Video Stream Input
                        </button>
                        <button onClick={() => setActiveTab('drone')} className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg text-sm text-left transition-colors ${activeTab === 'drone' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
                            <Cpu size={16} /> Manajemen Drone
                        </button>
                        <button onClick={() => setActiveTab('ai')} className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg text-sm text-left transition-colors ${activeTab === 'ai' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
                            <Bot size={16} /> Asisten AI (Gemini)
                        </button>
                    </div>

                    {/* Content Panel */}
                    <div className="w-2/3 p-6 overflow-y-auto">
                        
                        {/* Tab Telemetry */}
                        {activeTab === 'telemetry' && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Pilih Mode Operasional</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 text-white bg-slate-800 px-4 py-2 rounded-lg border border-indigo-500 cursor-pointer">
                                            <input type="radio" name="mode" value="sim" defaultChecked className="accent-indigo-500" /> Mode Simulasi (Dummy)
                                        </label>
                                        <label className="flex items-center gap-2 text-white bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 cursor-pointer">
                                            <input type="radio" name="mode" value="real" className="accent-indigo-500" /> Mode Real (Hardware)
                                        </label>
                                    </div>
                                </div>
                                <hr className="border-slate-700" />
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Koneksi Radio Telemetry (Web Serial API)</label>
                                    <button onClick={handleConnectTelemetry} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition">
                                        <Usb size={16} /> Sambungkan Radio (57600 baud)
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Tab Video */}
                        {activeTab === 'video' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">IP Camera URL / MJPEG Stream</label>
                                    <input type="text" placeholder="http://192.168.1.100:81/stream" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Video Decoder</label>
                                    <select className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none">
                                        <option>HLS.js (Low Latency)</option>
                                        <option>Native MJPEG</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Tab Drone */}
                        {activeTab === 'drone' && (
                            <div className="space-y-4">
                                <h3 className="text-white font-semibold">Daftar Aktif Armada Drone</h3>
                                <table className="w-full text-left text-sm text-slate-400 border-collapse">
                                    <thead className="bg-slate-800">
                                        <tr><th className="p-2 border border-slate-700">ID</th><th className="p-2 border border-slate-700">Model</th><th className="p-2 border border-slate-700">Status</th></tr>
                                    </thead>
                                    <tbody>
                                        <tr><td className="p-2 border border-slate-700">DRN-01</td><td className="p-2 border border-slate-700">Quad 500mm</td><td className="p-2 border border-slate-700 text-green-400">Siap Terbang</td></tr>
                                        <tr><td className="p-2 border border-slate-700">DRN-02</td><td className="p-2 border border-slate-700">Hex 600mm</td><td className="p-2 border border-slate-700 text-yellow-400">Maintenance</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Tab AI */}
                        {activeTab === 'ai' && (
                            <div className="flex flex-col h-[50vh]">
                                <div className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-4 overflow-y-auto space-y-4 mb-4">
                                    {chatHistory.map((chat, idx) => (
                                        <div key={idx} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] rounded-xl p-3 text-sm ${chat.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-800 text-emerald-400 rounded-bl-none border border-slate-700'}`}>
                                                {chat.text}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={geminiPrompt} 
                                        onChange={(e) => setGeminiPrompt(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAskGemini()}
                                        placeholder="Tanya asisten GCS..." 
                                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500" 
                                    />
                                    <button onClick={handleAskGemini} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition">
                                        Kirim
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
