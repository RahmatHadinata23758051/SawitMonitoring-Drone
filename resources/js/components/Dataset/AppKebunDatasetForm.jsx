import React from 'react';
import { Database, Save, X, ArrowLeft } from 'lucide-react';

const AppKebunDatasetForm = ({ dataset = null, kebuns = [], old = {}, errors = {}, routes = {}, csrfToken }) => {
    const isEdit = !!dataset;
    const actionUrl = isEdit ? routes.update : routes.store;

    return (
        <div className="pt-6 pb-12 w-full">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
                
                <div className="flex items-center gap-4">
                    <a href={routes.index} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm">
                        <ArrowLeft size={20} />
                    </a>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                            <Database size={28} className="text-emerald-500" />
                            {isEdit ? 'Ubah Dataset Kebun' : 'Tambah Dataset Kebun'}
                        </h1>
                        <p className="text-sm font-medium text-slate-500 mt-1">Silakan isi form di bawah ini dengan lengkap</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 sm:p-8">
                        <form action={actionUrl} method="POST">
                            <input type="hidden" name="_token" value={csrfToken} />
                            {isEdit && <input type="hidden" name="_method" value="PUT" />}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="kebun" className="text-sm font-bold text-slate-700">Pilih Kebun</label>
                                    <select id="kebun" name="kebun" required
                                        defaultValue={old.kebun ?? (dataset?.kebun_id ?? '')}
                                        className={`w-full bg-slate-50 border ${errors.kebun ? 'border-rose-300 focus:ring-rose-500/30' : 'border-slate-200 focus:ring-emerald-500/30'} rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 transition-all cursor-pointer`}>
                                        <option value="" disabled>--- Pilih Kebun ---</option>
                                        {kebuns.map(k => (
                                            <option key={k.id} value={k.id}>{k.nama}</option>
                                        ))}
                                    </select>
                                    {errors.kebun && <p className="text-xs font-semibold text-rose-500 mt-1">{errors.kebun[0]}</p>}
                                </div>
                                
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="jumlah_pohon" className="text-sm font-bold text-slate-700">Jumlah Pohon</label>
                                    <input type="number" id="jumlah_pohon" name="jumlah_pohon" required min="0" step="1"
                                        defaultValue={old.jumlah_pohon ?? (dataset?.jumlah_pohon || '')}
                                        className={`w-full bg-slate-50 border ${errors.jumlah_pohon ? 'border-rose-300 focus:ring-rose-500/30' : 'border-slate-200 focus:ring-emerald-500/30'} rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 transition-all`} />
                                    {errors.jumlah_pohon && <p className="text-xs font-semibold text-rose-500 mt-1">{errors.jumlah_pohon[0]}</p>}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="tinggi_pohon" className="text-sm font-bold text-slate-700">Tinggi Pohon (m)</label>
                                    <input type="number" id="tinggi_pohon" name="tinggi_pohon" required min="0" step="0.1"
                                        defaultValue={old.tinggi_pohon ?? (dataset?.tinggi_pohon || '')}
                                        className={`w-full bg-slate-50 border ${errors.tinggi_pohon ? 'border-rose-300 focus:ring-rose-500/30' : 'border-slate-200 focus:ring-emerald-500/30'} rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 transition-all`} />
                                    {errors.tinggi_pohon && <p className="text-xs font-semibold text-rose-500 mt-1">{errors.tinggi_pohon[0]}</p>}
                                </div>
                                
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="interval_sejalur" className="text-sm font-bold text-slate-700">Interval Pohon Sejalur (m)</label>
                                    <input type="number" id="interval_sejalur" name="interval_sejalur" required min="0" step="0.1"
                                        defaultValue={old.interval_sejalur ?? (dataset?.interval_sejalur || '')}
                                        className={`w-full bg-slate-50 border ${errors.interval_sejalur ? 'border-rose-300 focus:ring-rose-500/30' : 'border-slate-200 focus:ring-emerald-500/30'} rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 transition-all`} />
                                    {errors.interval_sejalur && <p className="text-xs font-semibold text-rose-500 mt-1">{errors.interval_sejalur[0]}</p>}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="interval_menyamping" className="text-sm font-bold text-slate-700">Interval Pohon Menyamping (m)</label>
                                    <input type="number" id="interval_menyamping" name="interval_menyamping" required min="0" step="0.1"
                                        defaultValue={old.interval_menyamping ?? (dataset?.interval_menyamping || '')}
                                        className={`w-full bg-slate-50 border ${errors.interval_menyamping ? 'border-rose-300 focus:ring-rose-500/30' : 'border-slate-200 focus:ring-emerald-500/30'} rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 transition-all`} />
                                    {errors.interval_menyamping && <p className="text-xs font-semibold text-rose-500 mt-1">{errors.interval_menyamping[0]}</p>}
                                </div>

                                <div className="flex items-center justify-end gap-3 md:col-span-2 pt-6 mt-2 border-t border-slate-100">
                                    <a href={routes.index} className="flex items-center gap-2 bg-slate-100 text-slate-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition">
                                        <X size={18} /> Batal
                                    </a>
                                    <button type="submit" className="flex items-center gap-2 bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-600 transition shadow-sm shadow-emerald-500/30">
                                        <Save size={18} /> Simpan
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AppKebunDatasetForm;
