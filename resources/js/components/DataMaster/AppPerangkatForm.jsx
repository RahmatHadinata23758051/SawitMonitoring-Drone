import React from 'react';
import { Cpu, Save, X, ArrowLeft, Wifi, Server, Activity } from 'lucide-react';

const AppPerangkatForm = ({ perangkat = null, old = {}, errors = {}, routes = {}, csrfToken }) => {
    const isEdit = !!perangkat;
    const actionUrl = isEdit ? routes.update : routes.store;

    return (
        <div className="pt-8 pb-16 w-full min-h-screen" style={{ background: '#f3f4f6' }}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                


                {/* Main Split Layout */}
                <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    
                    {/* Left Column: Context & Info */}
                    <div className="lg:col-span-4 flex flex-col gap-6 sticky top-8">
                        <div>
                            <div className="w-14 h-14 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-center text-blue-600 mb-6 relative overflow-hidden">
                                <div className="absolute inset-0 bg-blue-50/50" />
                                <Cpu size={26} className="relative z-10" strokeWidth={1.75} />
                            </div>
                            <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-3">
                                {isEdit ? 'Ubah Data Perangkat' : 'Tambah Perangkat Baru'}
                            </h1>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                {isEdit 
                                    ? 'Perbarui konfigurasi jaringan dan status perangkat drone yang sudah terdaftar.' 
                                    : 'Tambahkan perangkat drone baru untuk memperluas jangkauan pemantauan kebun.'}
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mt-4">
                            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Activity size={16} className="text-sky-500" /> Informasi Teknis
                            </h3>
                            <ul className="space-y-3 text-sm text-slate-600">
                                <li className="flex gap-3">
                                    <Server size={16} className="text-slate-400 shrink-0 mt-0.5" />
                                    <span>Pastikan <strong>ID Drone</strong> unik dan sesuai dengan serial number fisik perangkat.</span>
                                </li>
                                <li className="flex gap-3">
                                    <Wifi size={16} className="text-slate-400 shrink-0 mt-0.5" />
                                    <span>Alamat <strong>IP Drone</strong> harus bersifat statis agar koneksi telemetri GCS stabil.</span>
                                </li>
                                <li className="flex gap-3">
                                    <Activity size={16} className="text-slate-400 shrink-0 mt-0.5" />
                                    <span>Status <strong>Aktif</strong> diperlukan agar drone dapat menerima misi penerbangan.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Column: The Form */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                            

                            
                            <div className="p-8 sm:p-10">
                                <form action={actionUrl} method="POST" className="space-y-8">
                                    <input type="hidden" name="_token" value={csrfToken} />
                                    {isEdit && <input type="hidden" name="_method" value="PUT" />}

                                    {/* Section 1: Identifikasi Drone */}
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-800 mb-5 pb-2 border-b border-slate-100 flex items-center gap-2">
                                            Identifikasi Perangkat
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="flex flex-col gap-2">
                                                <label htmlFor="id_drone" className="text-sm font-bold text-slate-700">ID Drone / Serial Number</label>
                                                <input type="text" id="id_drone" name="id_drone" required autoFocus
                                                    defaultValue={old.id_drone ?? (perangkat?.id_drone || '')}
                                                    placeholder="Contoh: MAVIC-001"
                                                    className={`w-full bg-slate-50 border ${errors.id_drone ? 'border-rose-300 focus:ring-rose-500/30' : 'border-slate-200 focus:ring-sky-500/30'} rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:bg-white transition-all uppercase`} />
                                                {errors.id_drone && <p className="text-xs font-semibold text-rose-500 mt-1">{errors.id_drone[0]}</p>}
                                            </div>
                                            
                                            <div className="flex flex-col gap-2">
                                                <label htmlFor="ip_drone" className="text-sm font-bold text-slate-700">Alamat IP Telemetri</label>
                                                <input type="text" id="ip_drone" name="ip_drone" required
                                                    defaultValue={old.ip_drone ?? (perangkat?.ip_drone || '')}
                                                    placeholder="Contoh: 192.168.1.100"
                                                    className={`w-full bg-slate-50 border ${errors.ip_drone ? 'border-rose-300 focus:ring-rose-500/30' : 'border-slate-200 focus:ring-sky-500/30'} rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:bg-white transition-all`} />
                                                {errors.ip_drone && <p className="text-xs font-semibold text-rose-500 mt-1">{errors.ip_drone[0]}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 2: Status */}
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-800 mb-5 pb-2 border-b border-slate-100 flex items-center gap-2">
                                            Operasional
                                        </h2>
                                        <div className="grid grid-cols-1 gap-6">
                                            <div className="flex flex-col gap-2">
                                                <label htmlFor="status" className="text-sm font-bold text-slate-700">Status Perangkat</label>
                                                <select id="status" name="status" required
                                                    defaultValue={old.status ?? (perangkat?.status ?? '')}
                                                    className={`w-full bg-slate-50 border ${errors.status ? 'border-rose-300 focus:ring-rose-500/30' : 'border-slate-200 focus:ring-sky-500/30'} rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:bg-white transition-all cursor-pointer appearance-none`}>
                                                    <option value="" disabled>--- Pilih Status Operasional ---</option>
                                                    <option value="1">🟢 Aktif & Siap Terbang</option>
                                                    <option value="0">🔴 Tidak Aktif / Maintenance</option>
                                                </select>
                                                {errors.status && <p className="text-xs font-semibold text-rose-500 mt-1">{errors.status[0]}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-end gap-4 pt-6 mt-6 border-t border-slate-100">
                                        <a href={routes.index} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm">
                                            <X size={18} /> Batal
                                        </a>
                                        <button type="submit" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-sm shadow-blue-600/10">
                                            <Save size={18} /> Simpan Data
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AppPerangkatForm;
