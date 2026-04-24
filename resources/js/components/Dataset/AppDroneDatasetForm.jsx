import React from 'react';
import { Database, Save, X, ArrowLeft } from 'lucide-react';

const SECTIONS = [
    {
        title: 'Informasi Utama',
        description: 'Kode, label, dan status obstacle untuk payload dataset.',
        grid: 'md:grid-cols-2 xl:grid-cols-3',
        fields: [
            { name: 'kode', label: 'Kode', placeholder: 'Contoh: DRN-001' },
            { name: 'label', label: 'Label', placeholder: 'Contoh: Hover Aman' },
            { name: 'obstacle_status', label: 'Obstacle Status', placeholder: 'Contoh: aman' },
        ],
    },
    {
        title: 'Posisi',
        description: 'Koordinat dan ketinggian drone saat payload direkam.',
        grid: 'md:grid-cols-3',
        fields: [
            { name: 'lat', label: 'Lat', numeric: true, placeholder: '-2.123456' },
            { name: 'lon', label: 'Lon', numeric: true, placeholder: '106.123456' },
            { name: 'alt', label: 'Alt', numeric: true, placeholder: '150.5' },
        ],
    },
    {
        title: 'Acceleration',
        description: 'Nilai akselerasi pada sumbu X, Y, dan Z.',
        grid: 'md:grid-cols-3',
        fields: [
            { name: 'ax', label: 'AX', numeric: true, placeholder: '0.11' },
            { name: 'ay', label: 'AY', numeric: true, placeholder: '0.22' },
            { name: 'az', label: 'AZ', numeric: true, placeholder: '0.33' },
        ],
    },
    {
        title: 'Gyro',
        description: 'Nilai gyroscope pada sumbu X, Y, dan Z.',
        grid: 'md:grid-cols-3',
        fields: [
            { name: 'gx', label: 'GX', numeric: true, placeholder: '1.11' },
            { name: 'gy', label: 'GY', numeric: true, placeholder: '1.22' },
            { name: 'gz', label: 'GZ', numeric: true, placeholder: '1.33' },
        ],
    },
    {
        title: 'Velocity',
        description: 'Kecepatan drone pada masing-masing sumbu.',
        grid: 'md:grid-cols-3',
        fields: [
            { name: 'vx', label: 'VX', numeric: true, placeholder: '2.11' },
            { name: 'vy', label: 'VY', numeric: true, placeholder: '2.22' },
            { name: 'vz', label: 'VZ', numeric: true, placeholder: '2.33' },
        ],
    },
    {
        title: 'Distance',
        description: 'Jarak obstacle dari empat arah sensor.',
        grid: 'md:grid-cols-2 xl:grid-cols-4',
        fields: [
            { name: 'dist_front', label: 'Distance Front', numeric: true, placeholder: '3.11' },
            { name: 'dist_left', label: 'Distance Left', numeric: true, placeholder: '3.22' },
            { name: 'dist_right', label: 'Distance Right', numeric: true, placeholder: '3.33' },
            { name: 'dist_back', label: 'Distance Back', numeric: true, placeholder: '3.44' },
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
        <div className="pt-6 pb-12 w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
                
                <div className="flex items-center gap-4">
                    <a href={routes.index} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-all shadow-sm">
                        <ArrowLeft size={20} />
                    </a>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                            <Database size={28} className="text-sky-500" />
                            {isEdit ? 'Ubah Dataset Drone' : 'Tambah Dataset Drone'}
                        </h1>
                        <p className="text-sm font-medium text-slate-500 mt-1">Silakan isi form di bawah ini dengan lengkap</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 sm:p-8">
                        <form action={actionUrl} method="POST">
                            <input type="hidden" name="_token" value={csrfToken} />
                            {isEdit && <input type="hidden" name="_method" value="PUT" />}

                            <div className="space-y-8">
                                {SECTIONS.map((section, idx) => (
                                    <section key={idx} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
                                        <div className="mb-5">
                                            <h4 className="text-sm font-black uppercase tracking-widest text-slate-600">
                                                {section.title}
                                            </h4>
                                            <p className="mt-1 text-sm text-slate-500 font-medium">{section.description}</p>
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
                                                            className={`w-full bg-white border ${errors[name] ? 'border-rose-300 focus:ring-rose-500/30' : 'border-slate-200 focus:ring-sky-500/30'} rounded-xl px-4 py-3 text-sm font-bold text-slate-800 shadow-sm focus:outline-none focus:ring-2 transition-all`} 
                                                        />
                                                        {errors[name] && <p className="text-xs font-semibold text-rose-500 mt-1">{errors[name][0]}</p>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </section>
                                ))}
                                
                                <div className="flex items-center justify-end gap-3 pt-6 mt-2 border-t border-slate-100">
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

export default AppDroneDatasetForm;
