import React from 'react';
import { Save, X, ArrowLeft, Ruler, Trees, Map } from 'lucide-react';

const AppKebunDatasetForm = ({ dataset = null, kebuns = [], old = {}, errors = {}, routes = {}, csrfToken }) => {
    const isEdit = !!dataset;
    const actionUrl = isEdit ? routes.update : routes.store;

    return (
        <div className="pt-8 pb-16 w-full min-h-screen" style={{ background: '#f3f4f6' }}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                


                {/* Main Split Layout */}
                <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    
                    {/* Left Column: Context & Info */}
                    <div className="lg:col-span-4 flex flex-col gap-6 sticky top-8">
                        <div>
                            <div className="w-14 h-14 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-center text-emerald-600 mb-6 relative overflow-hidden">
                                <div className="absolute inset-0 bg-emerald-50/50" />
                                <Trees size={26} className="relative z-10" strokeWidth={1.75} />
                            </div>
                            <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-3">
                                {isEdit ? 'Ubah Dataset Kebun' : 'Input Dataset Kebun'}
                            </h1>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                {isEdit 
                                    ? 'Perbarui metadata jarak tanam dan topologi kebun sawit yang terdaftar.' 
                                    : 'Tambahkan data spasial dan topologi untuk referensi AI dalam mengenali struktur kebun.'}
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mt-4">
                            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Map size={16} className="text-emerald-500" /> Informasi Pemetaan
                            </h3>
                            <ul className="space-y-3 text-sm text-slate-600">
                                <li className="flex gap-3">
                                    <Trees size={16} className="text-slate-400 shrink-0 mt-0.5" />
                                    <span>Tentukan <strong>Jumlah & Tinggi Pohon</strong> untuk estimasi biomassa dan penghitungan yield AI.</span>
                                </li>
                                <li className="flex gap-3">
                                    <Ruler size={16} className="text-slate-400 shrink-0 mt-0.5" />
                                    <span>Interval <strong>Sejalur</strong> dan <strong>Menyamping</strong> digunakan untuk auto-pilot drone dalam menavigasi lorong kebun.</span>
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

                                    {/* Section 1: Relasi Data */}
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-800 mb-5 pb-2 border-b border-slate-100 flex items-center gap-2">
                                            Pemilihan Lahan/Kebun
                                        </h2>
                                        <div className="grid grid-cols-1 gap-6">
                                            <div className="flex flex-col gap-2">
                                                <label htmlFor="kebun" className="text-sm font-bold text-slate-700">Area Kebun Terdaftar</label>
                                                <select id="kebun" name="kebun" required
                                                    defaultValue={old.kebun ?? (dataset?.kebun_id ?? '')}
                                                    className={`w-full bg-slate-50 border ${errors.kebun ? 'border-rose-300 focus:ring-rose-500/30' : 'border-slate-200 focus:ring-emerald-500/30'} rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:bg-white transition-all cursor-pointer appearance-none`}>
                                                    <option value="" disabled>--- Pilih Area Kebun ---</option>
                                                    {kebuns.map(k => (
                                                        <option key={k.id} value={k.id}>{k.nama}</option>
                                                    ))}
                                                </select>
                                                {errors.kebun && <p className="text-xs font-semibold text-rose-500 mt-1">{errors.kebun[0]}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 2: Karakteristik Pohon */}
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-800 mb-5 pb-2 border-b border-slate-100 flex items-center gap-2">
                                            Karakteristik & Topologi
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="flex flex-col gap-2">
                                                <label htmlFor="jumlah_pohon" className="text-sm font-bold text-slate-700">Estimasi Jumlah Pohon</label>
                                                <input type="number" id="jumlah_pohon" name="jumlah_pohon" required min="0" step="1"
                                                    defaultValue={old.jumlah_pohon ?? (dataset?.jumlah_pohon || '')}
                                                    placeholder="Contoh: 1500"
                                                    className={`w-full bg-slate-50 border ${errors.jumlah_pohon ? 'border-rose-300 focus:ring-rose-500/30' : 'border-slate-200 focus:ring-emerald-500/30'} rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:bg-white transition-all`} />
                                                {errors.jumlah_pohon && <p className="text-xs font-semibold text-rose-500 mt-1">{errors.jumlah_pohon[0]}</p>}
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label htmlFor="tinggi_pohon" className="text-sm font-bold text-slate-700">Rata-rata Tinggi Pohon (m)</label>
                                                <input type="number" id="tinggi_pohon" name="tinggi_pohon" required min="0" step="0.1"
                                                    defaultValue={old.tinggi_pohon ?? (dataset?.tinggi_pohon || '')}
                                                    placeholder="Contoh: 5.5"
                                                    className={`w-full bg-slate-50 border ${errors.tinggi_pohon ? 'border-rose-300 focus:ring-rose-500/30' : 'border-slate-200 focus:ring-emerald-500/30'} rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:bg-white transition-all`} />
                                                {errors.tinggi_pohon && <p className="text-xs font-semibold text-rose-500 mt-1">{errors.tinggi_pohon[0]}</p>}
                                            </div>
                                            
                                            <div className="flex flex-col gap-2">
                                                <label htmlFor="interval_sejalur" className="text-sm font-bold text-slate-700">Interval Sejalur (m)</label>
                                                <input type="number" id="interval_sejalur" name="interval_sejalur" required min="0" step="0.1"
                                                    defaultValue={old.interval_sejalur ?? (dataset?.interval_sejalur || '')}
                                                    placeholder="Jarak antar pohon (vertikal)"
                                                    className={`w-full bg-slate-50 border ${errors.interval_sejalur ? 'border-rose-300 focus:ring-rose-500/30' : 'border-slate-200 focus:ring-emerald-500/30'} rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:bg-white transition-all`} />
                                                {errors.interval_sejalur && <p className="text-xs font-semibold text-rose-500 mt-1">{errors.interval_sejalur[0]}</p>}
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label htmlFor="interval_menyamping" className="text-sm font-bold text-slate-700">Interval Menyamping (m)</label>
                                                <input type="number" id="interval_menyamping" name="interval_menyamping" required min="0" step="0.1"
                                                    defaultValue={old.interval_menyamping ?? (dataset?.interval_menyamping || '')}
                                                    placeholder="Lebar lorong (horizontal)"
                                                    className={`w-full bg-slate-50 border ${errors.interval_menyamping ? 'border-rose-300 focus:ring-rose-500/30' : 'border-slate-200 focus:ring-emerald-500/30'} rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:bg-white transition-all`} />
                                                {errors.interval_menyamping && <p className="text-xs font-semibold text-rose-500 mt-1">{errors.interval_menyamping[0]}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-end gap-4 pt-6 mt-6 border-t border-slate-100">
                                        <a href={routes.index} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm">
                                            <X size={18} /> Batal
                                        </a>
                                        <button type="submit" className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-sm shadow-emerald-600/10">
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

export default AppKebunDatasetForm;
