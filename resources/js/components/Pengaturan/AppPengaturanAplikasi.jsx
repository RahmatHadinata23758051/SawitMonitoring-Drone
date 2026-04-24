import React, { useState, useRef, useEffect } from 'react';
import { Laptop, Upload, Trash2, Save, Image as ImageIcon } from 'lucide-react';

const AppPengaturanAplikasi = ({ setting = {}, routes = {}, csrfToken, flashSuccess }) => {
    const [logoPreview, setLogoPreview] = useState(setting.logo_aplikasi ? `/storage/${setting.logo_aplikasi}` : null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (flashSuccess && window.Swal) {
            window.Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flashSuccess, showConfirmButton: false, timer: 2500, timerProgressBar: true });
        }
    }, [flashSuccess]);

    const handleLogoChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setLogoPreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const clearLogo = () => {
        if (fileInputRef.current) fileInputRef.current.value = '';
        setLogoPreview(null);
    };

    return (
        <div className="pt-2 pb-12 w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
                <form action={routes.store} method="post" encType="multipart/form-data">
                    <input type="hidden" name="_token" value={csrfToken} />
                    
                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Logo Section */}
                        <div className="bg-white shadow-sm rounded-2xl p-6 flex flex-col gap-4 border border-slate-200">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600"><Laptop size={18} /></div>
                                Logo Website
                            </h3>

                            <div className="border-2 border-dashed border-slate-200 rounded-2xl w-full aspect-square flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden group">
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo" className="object-contain w-full h-full p-4" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-slate-400 p-4 text-center">
                                        <ImageIcon size={40} className="text-slate-300 mb-2" />
                                        <p className="text-sm font-semibold text-slate-500">Belum ada logo</p>
                                        <p className="text-xs text-slate-400">Format JPG/PNG max 2MB</p>
                                    </div>
                                )}
                                
                                {/* Overlay hover actions */}
                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 bg-white rounded-full text-indigo-600 hover:scale-110 transition-transform shadow-lg" title="Upload Logo">
                                        <Upload size={18} />
                                    </button>
                                    {logoPreview && (
                                        <button type="button" onClick={clearLogo} className="p-2 bg-white rounded-full text-rose-500 hover:scale-110 transition-transform shadow-lg" title="Hapus Logo">
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <input type="file" ref={fileInputRef} name="logo_aplikasi" accept="image/*" className="hidden" onChange={handleLogoChange} />
                            {/* Input to notify backend that logo was cleared if needed (optional implementation depending on backend logic) */}
                            {!logoPreview && <input type="hidden" name="remove_logo" value="1" />}
                            
                            <div className="flex gap-2">
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-100 transition">
                                    <Upload size={16} /> Pilih Foto
                                </button>
                                {logoPreview && (
                                    <button type="button" onClick={clearLogo} className="flex items-center justify-center p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition" title="Hapus">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="bg-white shadow-sm rounded-2xl p-6 md:col-span-2 flex flex-col gap-6 border border-slate-200">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4">
                                <div className="bg-blue-100 p-2 rounded-xl text-blue-600"><Laptop size={18} /></div>
                                Informasi Website
                            </h3>
                            
                            <div className="grid sm:grid-cols-2 gap-5">
                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="nama" className="text-sm font-bold text-slate-600">Nama Website</label>
                                    <input type="text" id="nama" name="nama" defaultValue={setting.nama || ''} required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="nama_tab" className="text-sm font-bold text-slate-600">Nama Tab Browser</label>
                                    <input type="text" id="nama_tab" name="nama_tab" defaultValue={setting.nama_tab || ''} required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="versi" className="text-sm font-bold text-slate-600">Versi</label>
                                    <input type="text" id="versi" name="versi" defaultValue={setting.versi || ''} required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="copyright" className="text-sm font-bold text-slate-600">Copyright</label>
                                    <input type="text" id="copyright" name="copyright" defaultValue={setting.copyright || ''} required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="tahun_copyright" className="text-sm font-bold text-slate-600">Tahun Copyright</label>
                                    <input type="text" id="tahun_copyright" name="tahun_copyright" defaultValue={setting.tahun_copyright || ''} required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all" />
                                </div>
                                
                                <div className="sm:col-span-2 pt-4 flex justify-end">
                                    <button type="submit" className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-sm shadow-indigo-500/30 hover:bg-indigo-700 transition-all">
                                        <Save size={18} /> Simpan Pengaturan
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AppPengaturanAplikasi;
