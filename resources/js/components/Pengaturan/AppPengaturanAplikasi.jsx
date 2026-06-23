import React, { useState, useRef, useEffect } from 'react';
import { Settings, Upload, Trash2, Save, Image as ImageIcon, Laptop, ShieldCheck, Tag, Info } from 'lucide-react';

const AppPengaturanAplikasi = ({ setting = {}, routes = {}, csrfToken, flashSuccess }) => {
    const [logoPreview, setLogoPreview] = useState(setting.logo_aplikasi ? `/storage/${setting.logo_aplikasi}` : null);
    const [isDragging, setIsDragging] = useState(false);
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

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            if (fileInputRef.current) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                fileInputRef.current.files = dataTransfer.files;
            }
            const reader = new FileReader();
            reader.onload = (e) => setLogoPreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="pt-8 pb-16 w-full bg-slate-50 min-h-screen">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header Section */}
                <div className="mb-8 flex flex-col gap-2">
                    <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3 tracking-tight" style={{ fontFamily: "'Manrope', sans-serif" }}>
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100/50 flex items-center justify-center relative overflow-hidden">
                            <Settings size={20} strokeWidth={1.75} />
                        </div>
                        Pengaturan Aplikasi
                    </h1>
                    <p className="text-slate-500 text-sm font-medium pl-13">Konfigurasi informasi sistem dan visual *brand* dashboard.</p>
                </div>

                <form action={routes.store} method="post" encType="multipart/form-data">
                    <input type="hidden" name="_token" value={csrfToken} />
                    
                    <div className="grid lg:grid-cols-12 gap-8 items-start">
                        
                        {/* Left Column: Visual Branding (Logo) */}
                        <div className="lg:col-span-4 flex flex-col gap-6">
                            <div className="bg-white shadow-sm rounded-2xl p-8 border border-slate-200 flex flex-col relative overflow-hidden">
                                
                                <h3 className="font-bold text-base text-slate-800 flex items-center gap-2 mb-6" style={{ fontFamily: "'Manrope', sans-serif" }}>
                                    <ImageIcon size={18} className="text-slate-400" /> Identitas Visual
                                </h3>

                                <div 
                                    className={`border-2 border-dashed rounded-2xl w-full aspect-square flex flex-col items-center justify-center relative overflow-hidden group transition-all duration-300
                                        ${isDragging ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'}
                                    `}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => !logoPreview && fileInputRef.current?.click()}
                                    style={{ cursor: logoPreview ? 'default' : 'pointer' }}
                                >
                                    {logoPreview ? (
                                        <div className="w-full h-full p-6 bg-white flex items-center justify-center relative group">
                                            <img src={logoPreview} alt="Logo Preview" className="object-contain w-full h-full transform transition-transform duration-500 group-hover:scale-105" />
                                            {/* Hover Actions */}
                                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 backdrop-blur-sm">
                                                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 bg-white/10 hover:bg-white text-white hover:text-blue-600 rounded-xl transition-all hover:scale-110 shadow-lg border border-white/20" title="Ganti Logo">
                                                    <Upload size={20} />
                                                </button>
                                                <button type="button" onClick={clearLogo} className="p-3 bg-white/10 hover:bg-rose-500 text-white rounded-xl transition-all hover:scale-110 shadow-lg border border-white/20" title="Hapus Logo">
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-3 text-slate-400 p-6 text-center pointer-events-none">
                                            <div className={`p-3 rounded-xl transition-colors duration-300 ${isDragging ? 'bg-blue-100 text-blue-500' : 'bg-white shadow-sm border border-slate-200'}`}>
                                                <Upload size={32} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-600">Klik atau Drag & Drop</p>
                                                <p className="text-xs text-slate-400 mt-1">Format PNG, JPG (Maks. 2MB)</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <input type="file" ref={fileInputRef} name="logo_aplikasi" accept="image/*" className="hidden" onChange={handleLogoChange} />
                                {!logoPreview && <input type="hidden" name="remove_logo" value="1" />}

                                {/* Info Box */}
                                <div className="mt-6 bg-slate-50 rounded-xl p-4 flex gap-3 border border-slate-200/60 text-slate-600">
                                    <Info size={18} className="shrink-0 mt-0.5 text-slate-400" />
                                    <p className="text-xs leading-relaxed font-medium">Logo akan ditampilkan di halaman login dan pojok kiri atas *sidebar* aplikasi.</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Text Information */}
                        <div className="lg:col-span-8 flex flex-col gap-6">
                            <div className="bg-white shadow-sm rounded-2xl p-8 border border-slate-200 relative overflow-hidden">

                                <h3 className="font-bold text-base text-slate-850 flex items-center gap-2 mb-8 pb-4 border-b border-slate-100" style={{ fontFamily: "'Manrope', sans-serif" }}>
                                    <Laptop size={18} className="text-slate-400" /> Detail Sistem
                                </h3>
                                
                                <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="nama" className="text-xs font-bold text-slate-500 flex items-center gap-2">
                                            <Tag size={14} className="text-slate-400" /> Nama Website
                                        </label>
                                        <input type="text" id="nama" name="nama" defaultValue={setting.nama || ''} required
                                            placeholder="Contoh: Drone GCS IPB"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all duration-200" />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="nama_tab" className="text-xs font-bold text-slate-500 flex items-center gap-2">
                                            <Laptop size={14} className="text-slate-400" /> Nama Tab Browser
                                        </label>
                                        <input type="text" id="nama_tab" name="nama_tab" defaultValue={setting.nama_tab || ''} required
                                            placeholder="Contoh: Dashboard - GCS"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all duration-200" />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="versi" className="text-xs font-bold text-slate-500 flex items-center gap-2">
                                            <ShieldCheck size={14} className="text-slate-400" /> Versi Sistem
                                        </label>
                                        <input type="text" id="versi" name="versi" defaultValue={setting.versi || ''} required
                                            placeholder="Contoh: v2.1.0"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all duration-200" />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="tahun_copyright" className="text-xs font-bold text-slate-500 flex items-center gap-2">
                                            <Tag size={14} className="text-slate-400" /> Tahun Hak Cipta
                                        </label>
                                        <input type="text" id="tahun_copyright" name="tahun_copyright" defaultValue={setting.tahun_copyright || ''} required
                                            placeholder="Contoh: 2024"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all duration-200" />
                                    </div>

                                    <div className="flex flex-col gap-2 md:col-span-2">
                                        <label htmlFor="copyright" className="text-xs font-bold text-slate-500 flex items-center gap-2">
                                            <Info size={14} className="text-slate-400" /> Teks Hak Cipta (Copyright Footer)
                                        </label>
                                        <input type="text" id="copyright" name="copyright" defaultValue={setting.copyright || ''} required
                                            placeholder="Contoh: IPB University. Hak cipta dilindungi undang-undang."
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:bg-white transition-all duration-200" />
                                    </div>
                                </div>
                                
                                <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end">
                                    <button type="submit" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 shadow-sm shadow-blue-600/10">
                                        <Save size={18} /> Simpan Konfigurasi
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
