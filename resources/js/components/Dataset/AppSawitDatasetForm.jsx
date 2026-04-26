import React from 'react';
import { Database, Save, X, ArrowLeft, Palette, Tag, Scan } from 'lucide-react';

const AppSawitDatasetForm = ({ dataset = null, old = {}, errors = {}, routes = {}, csrfToken }) => {
    const isEdit = !!dataset;
    const actionUrl = isEdit ? routes.update : routes.store;

    return (
        <div className="pt-8 pb-16 w-full bg-slate-50 min-h-screen">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header Section */}
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <a href={routes.index} className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50 transition-all shadow-sm">
                            <ArrowLeft size={18} />
                        </a>
                        <nav className="hidden sm:flex" aria-label="Breadcrumb">
                            <ol className="flex items-center space-x-2 text-sm font-medium text-slate-500">
                                <li>Data Master</li>
                                <li><span className="mx-2 text-slate-300">/</span></li>
                                <li><a href={routes.index} className="hover:text-orange-600 transition-colors">Dataset Sawit</a></li>
                                <li><span className="mx-2 text-slate-300">/</span></li>
                                <li className="text-slate-800 font-bold">{isEdit ? 'Ubah Data' : 'Tambah Baru'}</li>
                            </ol>
                        </nav>
                    </div>
                </div>

                {/* Main Split Layout */}
                <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    
                    {/* Left Column: Context & Info */}
                    <div className="lg:col-span-4 flex flex-col gap-6 sticky top-8">
                        <div>
                            <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-amber-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20 mb-6">
                                <Database size={28} />
                            </div>
                            <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-3">
                                {isEdit ? 'Ubah Klasifikasi Sawit' : 'Input Kelas Sawit Baru'}
                            </h1>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                {isEdit 
                                    ? 'Perbarui parameter klasifikasi kematangan buah sawit yang digunakan oleh model AI.' 
                                    : 'Tambahkan parameter kelas baru untuk memperluas kemampuan AI dalam mendeteksi kematangan buah.'}
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mt-4">
                            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Scan size={16} className="text-orange-500" /> Deteksi Kematangan
                            </h3>
                            <ul className="space-y-3 text-sm text-slate-600">
                                <li className="flex gap-3">
                                    <Tag size={16} className="text-slate-400 shrink-0 mt-0.5" />
                                    <span><strong>Kode & Nama Kelas</strong> harus konsisten dengan parameter training pada model YOLO/TensorFlow.</span>
                                </li>
                                <li className="flex gap-3">
                                    <Palette size={16} className="text-slate-400 shrink-0 mt-0.5" />
                                    <span>Definisikan <strong>Warna Buah</strong> yang spesifik untuk membantu validasi visual pada sistem GCS.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Column: The Form */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                            
                            {/* Decorative top bar */}
                            <div className="h-2 w-full bg-gradient-to-r from-orange-400 to-amber-600"></div>
                            
                            <div className="p-8 sm:p-10">
                                <form action={actionUrl} method="POST" className="space-y-8">
                                    <input type="hidden" name="_token" value={csrfToken} />
                                    {isEdit && <input type="hidden" name="_method" value="PUT" />}

                                    {/* Section 1: Parameter Klasifikasi */}
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-800 mb-5 pb-2 border-b border-slate-100 flex items-center gap-2">
                                            Parameter Klasifikasi Model
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="flex flex-col gap-2">
                                                <label htmlFor="kode" className="text-sm font-bold text-slate-700">Kode Kelas / ID</label>
                                                <input type="text" id="kode" name="kode" required autoFocus
                                                    defaultValue={old.kode ?? (dataset?.kode || '')}
                                                    placeholder="Contoh: SWT-M1"
                                                    className={`w-full bg-slate-50 border ${errors.kode ? 'border-rose-300 focus:ring-rose-500/30' : 'border-slate-200 focus:ring-orange-500/30'} rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:bg-white transition-all uppercase`} />
                                                {errors.kode && <p className="text-xs font-semibold text-rose-500 mt-1">{errors.kode[0]}</p>}
                                            </div>
                                            
                                            <div className="flex flex-col gap-2">
                                                <label htmlFor="nama" className="text-sm font-bold text-slate-700">Nama Kelas (Label)</label>
                                                <input type="text" id="nama" name="nama" required
                                                    defaultValue={old.nama ?? (dataset?.nama || '')}
                                                    placeholder="Contoh: Mentah / Matang"
                                                    className={`w-full bg-slate-50 border ${errors.nama ? 'border-rose-300 focus:ring-rose-500/30' : 'border-slate-200 focus:ring-orange-500/30'} rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:bg-white transition-all`} />
                                                {errors.nama && <p className="text-xs font-semibold text-rose-500 mt-1">{errors.nama[0]}</p>}
                                            </div>

                                            <div className="flex flex-col gap-2 md:col-span-2">
                                                <label htmlFor="warna" className="text-sm font-bold text-slate-700">Indikator Warna Buah</label>
                                                <input type="text" id="warna" name="warna" required
                                                    defaultValue={old.warna ?? (dataset?.warna || '')}
                                                    placeholder="Contoh: Hijau Tua"
                                                    className={`w-full bg-slate-50 border ${errors.warna ? 'border-rose-300 focus:ring-rose-500/30' : 'border-slate-200 focus:ring-orange-500/30'} rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:bg-white transition-all`} />
                                                {errors.warna && <p className="text-xs font-semibold text-rose-500 mt-1">{errors.warna[0]}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-end gap-4 pt-6 mt-6 border-t border-slate-100">
                                        <a href={routes.index} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm">
                                            <X size={18} /> Batal
                                        </a>
                                        <button type="submit" className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white px-8 py-3 rounded-xl font-bold hover:from-orange-600 hover:to-amber-700 transition-all shadow-lg shadow-orange-500/30 hover:-translate-y-0.5 active:translate-y-0">
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

export default AppSawitDatasetForm;
