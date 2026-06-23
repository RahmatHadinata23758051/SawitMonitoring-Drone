import React from 'react';
import { Save, X, ArrowLeft, Target, Navigation, Zap, Compass, Activity, ShieldAlert, Plane } from 'lucide-react';

const SECTIONS = [
    {
        title: 'Informasi Utama',
        description: 'Kode, label, dan status obstacle untuk payload dataset.',
        icon: <ShieldAlert size={20} className="text-sky-500" />,
        grid: 'md:grid-cols-2 xl:grid-cols-3',
        fields: [
            { name: 'kode', label: 'Kode', placeholder: 'Contoh: DRN-001' },
            { name: 'label', label: 'Label', placeholder: 'Contoh: Hover Aman' },
            { name: 'obstacle_status', label: 'Obstacle Status', placeholder: 'Contoh: aman' },
        ],
    },
    {
        title: 'Posisi & Ketinggian',
        description: 'Koordinat dan ketinggian drone saat payload direkam.',
        icon: <Navigation size={20} className="text-sky-500" />,
        grid: 'md:grid-cols-3',
        fields: [
            { name: 'lat', label: 'Latitude (Lat)', numeric: true, placeholder: '-2.123456' },
            { name: 'lon', label: 'Longitude (Lon)', numeric: true, placeholder: '106.123456' },
            { name: 'alt', label: 'Altitude (Alt)', numeric: true, placeholder: '150.5' },
        ],
    },
    {
        title: 'Acceleration (Akselerasi)',
        description: 'Nilai akselerasi pada sumbu X, Y, dan Z.',
        icon: <Zap size={20} className="text-sky-500" />,
        grid: 'md:grid-cols-3',
        fields: [
            { name: 'ax', label: 'Sumbu X (AX)', numeric: true, placeholder: '0.11' },
            { name: 'ay', label: 'Sumbu Y (AY)', numeric: true, placeholder: '0.22' },
            { name: 'az', label: 'Sumbu Z (AZ)', numeric: true, placeholder: '0.33' },
        ],
    },
    {
        title: 'Gyroscope (Rotasi)',
        description: 'Nilai gyroscope pada sumbu X, Y, dan Z.',
        icon: <Compass size={20} className="text-sky-500" />,
        grid: 'md:grid-cols-3',
        fields: [
            { name: 'gx', label: 'Sumbu X (GX)', numeric: true, placeholder: '1.11' },
            { name: 'gy', label: 'Sumbu Y (GY)', numeric: true, placeholder: '1.22' },
            { name: 'gz', label: 'Sumbu Z (GZ)', numeric: true, placeholder: '1.33' },
        ],
    },
    {
        title: 'Velocity (Kecepatan)',
        description: 'Kecepatan drone pada masing-masing sumbu.',
        icon: <Activity size={20} className="text-sky-500" />,
        grid: 'md:grid-cols-3',
        fields: [
            { name: 'vx', label: 'Kecepatan X (VX)', numeric: true, placeholder: '2.11' },
            { name: 'vy', label: 'Kecepatan Y (VY)', numeric: true, placeholder: '2.22' },
            { name: 'vz', label: 'Kecepatan Z (VZ)', numeric: true, placeholder: '2.33' },
        ],
    },
    {
        title: 'Distance (Sensor Jarak)',
        description: 'Jarak obstacle dari empat arah sensor sonar/lidar.',
        icon: <Target size={20} className="text-sky-500" />,
        grid: 'md:grid-cols-2 xl:grid-cols-4',
        fields: [
            { name: 'dist_front', label: 'Depan (Front)', numeric: true, placeholder: '3.11' },
            { name: 'dist_left', label: 'Kiri (Left)', numeric: true, placeholder: '3.22' },
            { name: 'dist_right', label: 'Kanan (Right)', numeric: true, placeholder: '3.33' },
            { name: 'dist_back', label: 'Belakang (Back)', numeric: true, placeholder: '3.44' },
        ],
    },
];

const AppDroneDatasetForm = ({ dataset = null, old = {}, errors = {}, routes = {}, csrfToken }) => {
    const isEdit = !!dataset;
    const actionUrl = isEdit ? routes.update : routes.store;

    const validateDecimal = (e) => {
        let val = e.target.value;
        val = val.replace(/[^0-9.,-]/g, '');
        val = val.replace(/(?!^)-/g, '');
        e.target.value = val;
    };

    return (
        <div className="pt-8 pb-16 w-full min-h-screen" style={{ background: '#f3f4f6' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                


                {/* Main Split Layout */}
                <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    
                    {/* Left Column: Context & Info */}
                    <div className="lg:col-span-4 flex flex-col gap-6 sticky top-8">
                        <div>
                            <div className="w-14 h-14 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-center text-blue-600 mb-6 relative overflow-hidden">
                                <div className="absolute inset-0 bg-blue-50/50" />
                                <Plane size={26} className="relative z-10" strokeWidth={1.75} />
                            </div>
                            <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-3">
                                {isEdit ? 'Ubah Dataset Drone' : 'Input Dataset Baru'}
                            </h1>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                {isEdit 
                                    ? 'Perbarui nilai telemetri dan label obstacle pada payload dataset yang sudah ada.' 
                                    : 'Tambahkan sampel dataset telemetri baru secara manual untuk keperluan training AI atau referensi QC.'}
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mt-4">
                            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Activity size={16} className="text-sky-500" /> Panduan Input
                            </h3>
                            <ul className="space-y-3 text-sm text-slate-600">
                                <li className="flex gap-3">
                                    <ShieldAlert size={16} className="text-slate-400 shrink-0 mt-0.5" />
                                    <span>Kolom <strong>Obstacle Status</strong> dapat disesuaikan dengan threshold keselamatan penerbangan.</span>
                                </li>
                                <li className="flex gap-3">
                                    <Target size={16} className="text-slate-400 shrink-0 mt-0.5" />
                                    <span>Gunakan format angka desimal dengan titik (misal: <code>2.5</code>) untuk semua input numerik.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Column: The Form */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                            

                            
                            <div className="p-6 sm:p-8 md:p-10">
                                <form action={actionUrl} method="POST" className="space-y-8">
                                    <input type="hidden" name="_token" value={csrfToken} />
                                    {isEdit && <input type="hidden" name="_method" value="PUT" />}

                                    <div className="space-y-10">
                                        {SECTIONS.map((section, idx) => (
                                            <section key={idx}>
                                                <div className="mb-5 pb-3 border-b border-slate-100 flex items-center gap-3">
                                                    <div className="p-2 bg-sky-50 rounded-xl">
                                                        {section.icon}
                                                    </div>
                                                    <div>
                                                        <h2 className="text-lg font-bold text-slate-800">{section.title}</h2>
                                                        <p className="mt-0.5 text-xs text-slate-500 font-medium">{section.description}</p>
                                                    </div>
                                                </div>
                                                <div className={`grid grid-cols-1 ${section.grid} gap-6`}>
                                                    {section.fields.map((field) => {
                                                        const name = field.name;
                                                        const isNumeric = field.numeric || false;
                                                        const defaultValue = old[name] ?? (dataset?.[name] || '');
                                                        return (
                                                            <div key={name} className="flex flex-col gap-2">
                                                                <label htmlFor={name} className="text-sm font-bold text-slate-700">{field.label}</label>
                                                                <input 
                                                                    id={name} 
                                                                    name={name} 
                                                                    type="text"
                                                                    required
                                                                    placeholder={field.placeholder}
                                                                    defaultValue={defaultValue}
                                                                    autoFocus={idx === 0 && section.fields[0].name === name}
                                                                    inputMode={isNumeric ? 'decimal' : 'text'}
                                                                    onInput={isNumeric ? validateDecimal : undefined}
                                                                    className={`w-full bg-slate-50 border ${errors[name] ? 'border-rose-300 focus:ring-rose-500/30' : 'border-slate-200 focus:ring-sky-500/30'} rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:bg-white transition-all`} 
                                                                />
                                                                {errors[name] && <p className="text-xs font-semibold text-rose-500 mt-1">{errors[name][0]}</p>}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </section>
                                        ))}
                                    </div>
                                    
                                    <div className="flex items-center justify-end gap-4 pt-6 mt-8 border-t border-slate-100">
                                        <a href={routes.index} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm">
                                            <X size={18} /> Batal
                                        </a>
                                        <button type="submit" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-sm shadow-blue-600/10">
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

export default AppDroneDatasetForm;
