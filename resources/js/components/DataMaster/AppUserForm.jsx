import React, { useState } from 'react';
import { Users, Save, X, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const AppUserForm = ({ user = null, old = {}, errors = {}, routes = {}, csrfToken }) => {
    const isEdit = !!user;
    const actionUrl = isEdit ? routes.update : routes.store;
    
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConf, setShowPasswordConf] = useState(false);

    return (
        <div className="pt-6 pb-12 w-full">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
                
                <div className="flex items-center gap-4">
                    <a href={routes.index} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm">
                        <ArrowLeft size={20} />
                    </a>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                            <Users size={28} className="text-indigo-500" />
                            {isEdit ? 'Ubah Data User' : 'Tambah Data User'}
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
                                    <label htmlFor="nama" className="text-sm font-bold text-slate-700">Nama Lengkap</label>
                                    <input type="text" id="nama" name="nama" required autoFocus
                                        defaultValue={old.nama ?? (user?.nama || '')}
                                        className={`w-full bg-slate-50 border ${errors.nama ? 'border-rose-300 focus:ring-rose-500/30' : 'border-slate-200 focus:ring-indigo-500/30'} rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 transition-all`} />
                                    {errors.nama && <p className="text-xs font-semibold text-rose-500 mt-1">{errors.nama[0]}</p>}
                                </div>
                                
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="email" className="text-sm font-bold text-slate-700">Email</label>
                                    <input type="email" id="email" name="email" required
                                        defaultValue={old.email ?? (user?.email || '')}
                                        className={`w-full bg-slate-50 border ${errors.email ? 'border-rose-300 focus:ring-rose-500/30' : 'border-slate-200 focus:ring-indigo-500/30'} rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 transition-all`} />
                                    {errors.email && <p className="text-xs font-semibold text-rose-500 mt-1">{errors.email[0]}</p>}
                                </div>

                                <div className="flex flex-col gap-2 md:col-span-2">
                                    <label htmlFor="no_telepon" className="text-sm font-bold text-slate-700">Nomor Telepon</label>
                                    <input type="tel" id="no_telepon" name="no_telepon" required
                                        defaultValue={old.no_telepon ?? (user?.no_telepon || '')}
                                        className={`w-full bg-slate-50 border ${errors.no_telepon ? 'border-rose-300 focus:ring-rose-500/30' : 'border-slate-200 focus:ring-indigo-500/30'} rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 transition-all`} />
                                    {errors.no_telepon && <p className="text-xs font-semibold text-rose-500 mt-1">{errors.no_telepon[0]}</p>}
                                </div>
                                
                                <div className="flex flex-col gap-2 relative">
                                    <label htmlFor="password" className="text-sm font-bold text-slate-700">{isEdit ? 'Password Baru (Kosongkan jika tidak diubah)' : 'Password'}</label>
                                    <div className="relative">
                                        <input type={showPassword ? "text" : "password"} id="password" name="password" required={!isEdit}
                                            className={`w-full bg-slate-50 border ${errors.password ? 'border-rose-300 focus:ring-rose-500/30' : 'border-slate-200 focus:ring-indigo-500/30'} rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 transition-all pr-12`} />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-xs font-semibold text-rose-500 mt-1">{errors.password[0]}</p>}
                                </div>
                                
                                <div className="flex flex-col gap-2 relative">
                                    <label htmlFor="password_confirmation" className="text-sm font-bold text-slate-700">Konfirmasi Password</label>
                                    <div className="relative">
                                        <input type={showPasswordConf ? "text" : "password"} id="password_confirmation" name="password_confirmation" required={!isEdit}
                                            className={`w-full bg-slate-50 border ${errors.password_confirmation ? 'border-rose-300 focus:ring-rose-500/30' : 'border-slate-200 focus:ring-indigo-500/30'} rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 transition-all pr-12`} />
                                        <button type="button" onClick={() => setShowPasswordConf(!showPasswordConf)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                            {showPasswordConf ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-3 md:col-span-2 pt-6 mt-2 border-t border-slate-100">
                                    <a href={routes.index} className="flex items-center gap-2 bg-slate-100 text-slate-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition">
                                        <X size={18} /> Batal
                                    </a>
                                    <button type="submit" className="flex items-center gap-2 bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-600 transition shadow-sm shadow-indigo-500/30">
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

export default AppUserForm;
