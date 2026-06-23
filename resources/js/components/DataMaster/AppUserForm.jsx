import React, { useState } from 'react';
import { Users, Save, X, ArrowLeft, Eye, EyeOff, ShieldCheck, Mail, Phone, Lock } from 'lucide-react';

const AppUserForm = ({ user = null, old = {}, errors = {}, routes = {}, csrfToken }) => {
    const isEdit = !!user;
    const actionUrl = isEdit ? routes.update : routes.store;
    
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConf, setShowPasswordConf] = useState(false);

    return (
        <div className="pt-8 pb-16 w-full min-h-screen" style={{ background: '#f3f4f6' }}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                


                {/* Main Split Layout */}
                <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    
                    {/* Left Column: Context & Info */}
                    <div className="lg:col-span-4 flex flex-col gap-6 sticky top-8">
                        <div>
                            <div className="w-14 h-14 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-center text-indigo-600 mb-6 relative overflow-hidden">
                                <div className="absolute inset-0 bg-indigo-50/50" />
                                <Users size={26} className="relative z-10" strokeWidth={1.75} />
                            </div>
                            <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-3">
                                {isEdit ? 'Ubah Data User' : 'Tambah User Baru'}
                            </h1>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                {isEdit 
                                    ? 'Perbarui informasi akun pengguna. Kosongkan kolom kata sandi jika Anda tidak ingin mengubahnya.' 
                                    : 'Tambahkan pengguna baru ke dalam sistem dengan melengkapi informasi dasar dan kredensial akses.'}
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mt-4">
                            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <ShieldCheck size={16} className="text-emerald-500" /> Panduan Keamanan
                            </h3>
                            <ul className="space-y-3 text-sm text-slate-600">
                                <li className="flex gap-3">
                                    <Mail size={16} className="text-slate-400 shrink-0 mt-0.5" />
                                    <span>Gunakan alamat <strong>email yang valid</strong> karena akan digunakan untuk identifikasi login sistem.</span>
                                </li>
                                <li className="flex gap-3">
                                    <Lock size={16} className="text-slate-400 shrink-0 mt-0.5" />
                                    <span>Kata sandi minimal 8 karakter. Kombinasikan huruf dan angka untuk keamanan maksimal.</span>
                                </li>
                                <li className="flex gap-3">
                                    <Phone size={16} className="text-slate-400 shrink-0 mt-0.5" />
                                    <span>Nomor telepon akan digunakan untuk notifikasi darurat misi GCS.</span>
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

                                    {/* Section 1: Profil Dasar */}
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-800 mb-5 pb-2 border-b border-slate-100 flex items-center gap-2">
                                            Profil Dasar
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="flex flex-col gap-2">
                                                <label htmlFor="nama" className="text-sm font-bold text-slate-700">Nama Lengkap</label>
                                                <input type="text" id="nama" name="nama" required autoFocus
                                                    defaultValue={old.nama ?? (user?.nama || '')}
                                                    placeholder="Contoh: Budi Santoso"
                                                    className={`w-full bg-slate-50 border ${errors.nama ? 'border-rose-300 focus:ring-rose-500/30' : 'border-slate-200 focus:ring-indigo-500/30'} rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:bg-white transition-all`} />
                                                {errors.nama && <p className="text-xs font-semibold text-rose-500 mt-1">{errors.nama[0]}</p>}
                                            </div>
                                            
                                            <div className="flex flex-col gap-2">
                                                <label htmlFor="no_telepon" className="text-sm font-bold text-slate-700">Nomor Telepon</label>
                                                <input type="tel" id="no_telepon" name="no_telepon" required
                                                    defaultValue={old.no_telepon ?? (user?.no_telepon || '')}
                                                    placeholder="Contoh: 081234567890"
                                                    className={`w-full bg-slate-50 border ${errors.no_telepon ? 'border-rose-300 focus:ring-rose-500/30' : 'border-slate-200 focus:ring-indigo-500/30'} rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:bg-white transition-all`} />
                                                {errors.no_telepon && <p className="text-xs font-semibold text-rose-500 mt-1">{errors.no_telepon[0]}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 2: Kredensial Login */}
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-800 mb-5 pb-2 border-b border-slate-100 flex items-center gap-2">
                                            Kredensial Akses
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="flex flex-col gap-2 md:col-span-2">
                                                <label htmlFor="email" className="text-sm font-bold text-slate-700">Email Login</label>
                                                <input type="email" id="email" name="email" required
                                                    defaultValue={old.email ?? (user?.email || '')}
                                                    placeholder="budi@example.com"
                                                    className={`w-full bg-slate-50 border ${errors.email ? 'border-rose-300 focus:ring-rose-500/30' : 'border-slate-200 focus:ring-indigo-500/30'} rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:bg-white transition-all`} />
                                                {errors.email && <p className="text-xs font-semibold text-rose-500 mt-1">{errors.email[0]}</p>}
                                            </div>
                                            
                                            <div className="flex flex-col gap-2 relative">
                                                <label htmlFor="password" className="text-sm font-bold text-slate-700">{isEdit ? 'Password Baru (Opsional)' : 'Password'}</label>
                                                <div className="relative">
                                                    <input type={showPassword ? "text" : "password"} id="password" name="password" required={!isEdit}
                                                        placeholder={isEdit ? "Kosongkan jika tidak diubah" : "Minimal 8 karakter"}
                                                        className={`w-full bg-slate-50 border ${errors.password ? 'border-rose-300 focus:ring-rose-500/30' : 'border-slate-200 focus:ring-indigo-500/30'} rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:bg-white transition-all pr-12`} />
                                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors">
                                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                                {errors.password && <p className="text-xs font-semibold text-rose-500 mt-1">{errors.password[0]}</p>}
                                            </div>
                                            
                                            <div className="flex flex-col gap-2 relative">
                                                <label htmlFor="password_confirmation" className="text-sm font-bold text-slate-700">Konfirmasi Password</label>
                                                <div className="relative">
                                                    <input type={showPasswordConf ? "text" : "password"} id="password_confirmation" name="password_confirmation" required={!isEdit}
                                                        placeholder="Ulangi password di atas"
                                                        className={`w-full bg-slate-50 border ${errors.password_confirmation ? 'border-rose-300 focus:ring-rose-500/30' : 'border-slate-200 focus:ring-indigo-500/30'} rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:bg-white transition-all pr-12`} />
                                                    <button type="button" onClick={() => setShowPasswordConf(!showPasswordConf)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors">
                                                        {showPasswordConf ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-end gap-4 pt-6 mt-6 border-t border-slate-100">
                                        <a href={routes.index} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm">
                                            <X size={18} /> Batal
                                        </a>
                                        <button type="submit" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-sm shadow-indigo-600/10">
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

export default AppUserForm;
