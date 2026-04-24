import React from 'react';
import { ShoppingBasket as Basket, Save, X, ArrowLeft } from 'lucide-react';

const AppPanenForm = ({ panen = null, kebun = [], old = {}, errors = {}, routes = {}, csrfToken }) => {
    const isEdit = !!panen;
    const actionUrl = isEdit ? routes.update : routes.store;

    return (
        <div className="pt-6 pb-12 w-full">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
                
                <div className="flex items-center gap-4">
                    <a href={routes.index} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-all shadow-sm">
                        <ArrowLeft size={20} />
                    </a>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                            <Basket size={28} className="text-amber-500" />
                            {isEdit ? 'Ubah Data Panen' : 'Tambah Data Panen'}
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
                                    <label htmlFor="tanggal_panen" className="text-sm font-bold text-slate-700">Tanggal Panen</label>
                                    <input type="date" id="tanggal_panen" name="tanggal_panen" required autoFocus
                                        defaultValue={old.tanggal_panen ?? (panen?.tanggal_panen || '')}
                                        className={`w-full bg-slate-50 border ${errors.tanggal_panen ? 'border-rose-300 focus:ring-rose-500/30' : 'border-slate-200 focus:ring-amber-500/30'} rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 transition-all`} />
                                    {errors.tanggal_panen && <p className="text-xs font-semibold text-rose-500 mt-1">{errors.tanggal_panen[0]}</p>}
                                </div>
                                
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="kebun" className="text-sm font-bold text-slate-700">Lokasi Kebun</label>
                                    <select id="kebun" name="kebun" required
                                        defaultValue={old.kebun ?? (panen?.kebun_id ?? '')}
                                        className={`w-full bg-slate-50 border ${errors.kebun ? 'border-rose-300 focus:ring-rose-500/30' : 'border-slate-200 focus:ring-amber-500/30'} rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 transition-all cursor-pointer`}>
                                        <option value="" disabled>--- Pilih Kebun ---</option>
                                        {kebun.map(k => (
                                            <option key={k.id} value={k.id}>{k.nama}</option>
                                        ))}
                                    </select>
                                    {errors.kebun && <p className="text-xs font-semibold text-rose-500 mt-1">{errors.kebun[0]}</p>}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="target_panen" className="text-sm font-bold text-slate-700">Target Panen (kg)</label>
                                    <input type="number" id="target_panen" name="target_panen" required min="0" step="0.01" placeholder="0.00"
                                        defaultValue={old.target_panen ?? (panen?.target_panen || '')}
                                        className={`w-full bg-slate-50 border ${errors.target_panen ? 'border-rose-300 focus:ring-rose-500/30' : 'border-slate-200 focus:ring-amber-500/30'} rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 transition-all`} />
                                    {errors.target_panen && <p className="text-xs font-semibold text-rose-500 mt-1">{errors.target_panen[0]}</p>}
                                </div>
                                
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="hasil_panen" className="text-sm font-bold text-slate-700">Hasil Panen (kg)</label>
                                    <input type="number" id="hasil_panen" name="hasil_panen" required min="0" step="0.01" placeholder="0.00"
                                        defaultValue={old.hasil_panen ?? (panen?.hasil_panen || '')}
                                        className={`w-full bg-slate-50 border ${errors.hasil_panen ? 'border-rose-300 focus:ring-rose-500/30' : 'border-slate-200 focus:ring-amber-500/30'} rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 transition-all`} />
                                    {errors.hasil_panen && <p className="text-xs font-semibold text-rose-500 mt-1">{errors.hasil_panen[0]}</p>}
                                </div>

                                <div className="flex items-center justify-end gap-3 md:col-span-2 pt-6 mt-2 border-t border-slate-100">
                                    <a href={routes.index} className="flex items-center gap-2 bg-slate-100 text-slate-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition">
                                        <X size={18} /> Batal
                                    </a>
                                    <button type="submit" className="flex items-center gap-2 bg-amber-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-amber-600 transition shadow-sm shadow-amber-500/30">
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

export default AppPanenForm;
