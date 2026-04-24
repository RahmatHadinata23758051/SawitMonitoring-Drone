import React from 'react';
import { Cpu, Save, X, ArrowLeft } from 'lucide-react';

const AppPerangkatForm = ({ perangkat = null, old = {}, errors = {}, routes = {}, csrfToken }) => {
    const isEdit = !!perangkat;
    const actionUrl = isEdit ? routes.update : routes.store;

    return (
        <div className="pt-6 pb-12 w-full">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
                
                <div className="flex items-center gap-4">
                    <a href={routes.index} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-all shadow-sm">
                        <ArrowLeft size={20} />
                    </a>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                            <Cpu size={28} className="text-sky-500" />
                            {isEdit ? 'Ubah Data Perangkat' : 'Tambah Data Perangkat'}
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
                                    <label htmlFor="id_drone" className="text-sm font-bold text-slate-700">ID Drone</label>
                                    <input type="text" id="id_drone" name="id_drone" required autoFocus
                                        defaultValue={old.id_drone ?? (perangkat?.id_drone || '')}
                                        className={`w-full bg-slate-50 border ${errors.id_drone ? 'border-rose-300 focus:ring-rose-500/30' : 'border-slate-200 focus:ring-sky-500/30'} rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 transition-all`} />
                                    {errors.id_drone && <p className="text-xs font-semibold text-rose-500 mt-1">{errors.id_drone[0]}</p>}
                                </div>
                                
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="ip_drone" className="text-sm font-bold text-slate-700">IP Drone</label>
                                    <input type="text" id="ip_drone" name="ip_drone" required
                                        defaultValue={old.ip_drone ?? (perangkat?.ip_drone || '')}
                                        className={`w-full bg-slate-50 border ${errors.ip_drone ? 'border-rose-300 focus:ring-rose-500/30' : 'border-slate-200 focus:ring-sky-500/30'} rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 transition-all`} />
                                    {errors.ip_drone && <p className="text-xs font-semibold text-rose-500 mt-1">{errors.ip_drone[0]}</p>}
                                </div>
                                
                                <div className="flex flex-col gap-2 md:col-span-2">
                                    <label htmlFor="status" className="text-sm font-bold text-slate-700">Status Perangkat</label>
                                    <select id="status" name="status" required
                                        defaultValue={old.status ?? (perangkat?.status ?? '')}
                                        className={`w-full bg-slate-50 border ${errors.status ? 'border-rose-300 focus:ring-rose-500/30' : 'border-slate-200 focus:ring-sky-500/30'} rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 transition-all cursor-pointer`}>
                                        <option value="" disabled>--- Pilih status ---</option>
                                        <option value="1">Aktif</option>
                                        <option value="0">Tidak Aktif</option>
                                    </select>
                                    {errors.status && <p className="text-xs font-semibold text-rose-500 mt-1">{errors.status[0]}</p>}
                                </div>

                                <div className="flex items-center justify-end gap-3 md:col-span-2 pt-6 mt-2 border-t border-slate-100">
                                    <a href={routes.index} className="flex items-center gap-2 bg-slate-100 text-slate-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition">
                                        <X size={18} /> Batal
                                    </a>
                                    <button type="submit" className="flex items-center gap-2 bg-sky-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-sky-600 transition shadow-sm shadow-sky-500/30">
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

export default AppPerangkatForm;
