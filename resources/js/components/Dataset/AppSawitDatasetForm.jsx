import React from 'react';
import { Database, Save, X, ArrowLeft } from 'lucide-react';

const AppSawitDatasetForm = ({ dataset = null, old = {}, errors = {}, routes = {}, csrfToken }) => {
    const isEdit = !!dataset;
    const actionUrl = isEdit ? routes.update : routes.store;

    return (
        <div className="pt-6 pb-12 w-full">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
                
                <div className="flex items-center gap-4">
                    <a href={routes.index} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-500 hover:text-orange-600 hover:bg-orange-50 transition-all shadow-sm">
                        <ArrowLeft size={20} />
                    </a>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                            <Database size={28} className="text-orange-500" />
                            {isEdit ? 'Ubah Dataset Sawit' : 'Tambah Dataset Sawit'}
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
                                    <label htmlFor="kode" className="text-sm font-bold text-slate-700">Kode</label>
                                    <input type="text" id="kode" name="kode" required autoFocus
                                        defaultValue={old.kode ?? (dataset?.kode || '')}
                                        className={`w-full bg-slate-50 border ${errors.kode ? 'border-rose-300 focus:ring-rose-500/30' : 'border-slate-200 focus:ring-orange-500/30'} rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 transition-all`} />
                                    {errors.kode && <p className="text-xs font-semibold text-rose-500 mt-1">{errors.kode[0]}</p>}
                                </div>
                                
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="nama" className="text-sm font-bold text-slate-700">Nama Class</label>
                                    <input type="text" id="nama" name="nama" required
                                        defaultValue={old.nama ?? (dataset?.nama || '')}
                                        className={`w-full bg-slate-50 border ${errors.nama ? 'border-rose-300 focus:ring-rose-500/30' : 'border-slate-200 focus:ring-orange-500/30'} rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 transition-all`} />
                                    {errors.nama && <p className="text-xs font-semibold text-rose-500 mt-1">{errors.nama[0]}</p>}
                                </div>

                                <div className="flex flex-col gap-2 md:col-span-2">
                                    <label htmlFor="warna" className="text-sm font-bold text-slate-700">Warna Buah</label>
                                    <input type="text" id="warna" name="warna" required
                                        defaultValue={old.warna ?? (dataset?.warna || '')}
                                        className={`w-full bg-slate-50 border ${errors.warna ? 'border-rose-300 focus:ring-rose-500/30' : 'border-slate-200 focus:ring-orange-500/30'} rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 transition-all`} />
                                    {errors.warna && <p className="text-xs font-semibold text-rose-500 mt-1">{errors.warna[0]}</p>}
                                </div>

                                <div className="flex items-center justify-end gap-3 md:col-span-2 pt-6 mt-2 border-t border-slate-100">
                                    <a href={routes.index} className="flex items-center gap-2 bg-slate-100 text-slate-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition">
                                        <X size={18} /> Batal
                                    </a>
                                    <button type="submit" className="flex items-center gap-2 bg-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition shadow-sm shadow-orange-500/30">
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

export default AppSawitDatasetForm;
