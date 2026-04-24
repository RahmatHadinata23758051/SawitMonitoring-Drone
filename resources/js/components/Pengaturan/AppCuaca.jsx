import React, { useState, useEffect } from 'react';
import { MapPin, Save, CloudSun, Wind, Droplets, CloudRain, RefreshCw, AlertCircle } from 'lucide-react';

const AppCuaca = ({ cuaca = null, provinces = [], cities = [], districts = [], villages = [], routes = {}, csrfToken, flashSuccess, flashError }) => {
    const [loadingCity, setLoadingCity] = useState(false);
    const [loadingDistrict, setLoadingDistrict] = useState(false);
    const [loadingVillage, setLoadingVillage] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const [provinceList, setProvinceList] = useState(provinces);
    const [cityList, setCityList] = useState(cities);
    const [districtList, setDistrictList] = useState(districts);
    const [villageList, setVillageList] = useState(villages);

    const [selProvince, setSelProvince] = useState(cuaca?.province_code || '');
    const [selCity, setSelCity] = useState(cuaca?.city_code || '');
    const [selDistrict, setSelDistrict] = useState(cuaca?.district_code || '');
    const [selVillage, setSelVillage] = useState(cuaca?.village_code || '');

    useEffect(() => {
        if (window.Swal) {
            if (flashSuccess) window.Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flashSuccess, showConfirmButton: false, timer: 3000, timerProgressBar: true });
            if (flashError) window.Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flashError, showConfirmButton: false, timer: 4000, timerProgressBar: true });
        }
    }, [flashSuccess, flashError]);

    const handleProvinceChange = async (e) => {
        const val = e.target.value;
        setSelProvince(val);
        setSelCity(''); setSelDistrict(''); setSelVillage('');
        setCityList([]); setDistrictList([]); setVillageList([]);
        if (!val) return;
        
        setLoadingCity(true);
        try {
            const formData = new FormData();
            formData.append('province_code', val);
            formData.append('_token', csrfToken);
            const res = await fetch('/cuaca/kota', { method: 'POST', body: formData });
            const data = await res.json();
            setCityList(data);
        } catch(e) { console.error(e); }
        setLoadingCity(false);
    };

    const handleCityChange = async (e) => {
        const val = e.target.value;
        setSelCity(val);
        setSelDistrict(''); setSelVillage('');
        setDistrictList([]); setVillageList([]);
        if (!val) return;
        
        setLoadingDistrict(true);
        try {
            const formData = new FormData();
            formData.append('city_code', val);
            formData.append('_token', csrfToken);
            const res = await fetch('/cuaca/kecamatan', { method: 'POST', body: formData });
            const data = await res.json();
            setDistrictList(data);
        } catch(e) { console.error(e); }
        setLoadingDistrict(false);
    };

    const handleDistrictChange = async (e) => {
        const val = e.target.value;
        setSelDistrict(val);
        setSelVillage('');
        setVillageList([]);
        if (!val) return;
        
        setLoadingVillage(true);
        try {
            const formData = new FormData();
            formData.append('district_code', val);
            formData.append('_token', csrfToken);
            const res = await fetch('/cuaca/desa', { method: 'POST', body: formData });
            const data = await res.json();
            setVillageList(data);
        } catch(e) { console.error(e); }
        setLoadingVillage(false);
    };

    const handleRefresh = (e) => {
        setRefreshing(true);
        // Let form submit normally
    };

    return (
        <div className="pt-2 pb-12 w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
                
                <form action={routes.store} method="post" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
                    <input type="hidden" name="_token" value={csrfToken} />
                    <h3 className="text-lg font-black text-slate-800 mb-1 flex items-center gap-2">
                        <div className="bg-primary/10 text-primary p-2 rounded-xl"><MapPin size={20} /></div>
                        Pilih Wilayah Sumber Data Cuaca
                    </h3>
                    <p className="text-sm font-medium text-slate-500 mb-6">Setelah menyimpan lokasi, data cuaca akan otomatis diambil dari OpenWeatherMap.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="province" className="text-sm font-bold text-slate-700">Provinsi</label>
                            <select id="province" name="province" required value={selProvince} onChange={handleProvinceChange}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all cursor-pointer">
                                <option value="">-- Pilih Provinsi --</option>
                                {provinceList.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="city" className="text-sm font-bold text-slate-700">Kabupaten/Kota</label>
                            <select id="city" name="city" required value={selCity} onChange={handleCityChange} disabled={loadingCity || !selProvince}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all cursor-pointer disabled:opacity-50">
                                <option value="">{loadingCity ? 'Memuat...' : '-- Pilih Kota/Kabupaten --'}</option>
                                {cityList.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="district" className="text-sm font-bold text-slate-700">Kecamatan</label>
                            <select id="district" name="district" required value={selDistrict} onChange={handleDistrictChange} disabled={loadingDistrict || !selCity}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all cursor-pointer disabled:opacity-50">
                                <option value="">{loadingDistrict ? 'Memuat...' : '-- Pilih Kecamatan --'}</option>
                                {districtList.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="village" className="text-sm font-bold text-slate-700">Desa</label>
                            <select id="village" name="village" required value={selVillage} onChange={e => setSelVillage(e.target.value)} disabled={loadingVillage || !selDistrict}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all cursor-pointer disabled:opacity-50">
                                <option value="">{loadingVillage ? 'Memuat...' : '-- Pilih Desa --'}</option>
                                {villageList.map(v => <option key={v.code} value={v.code}>{v.name}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2 mt-4 flex justify-end">
                            <button type="submit" className="bg-primary text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-primary/90 transition shadow-sm shadow-primary/30 flex items-center gap-2">
                                <Save size={18} /> Simpan & Perbarui Cuaca
                            </button>
                        </div>
                    </div>
                </form>

                {cuaca && cuaca.temperature ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                    <CloudSun className="text-orange-500" size={24} /> Data Cuaca Terkini
                                </h3>
                                <p className="text-sm font-bold text-slate-500 mt-1">
                                    {cuaca.kabupaten_kota || '-'}, {cuaca.provinsi || '-'}
                                </p>
                            </div>
                            <form action={routes.refresh} method="POST" onSubmit={handleRefresh}>
                                <input type="hidden" name="_token" value={csrfToken} />
                                <button type="submit" disabled={refreshing}
                                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-sky-50 border border-sky-200 text-sky-700 text-sm font-bold rounded-xl hover:bg-sky-100 transition shadow-sm disabled:opacity-50 w-full sm:w-auto">
                                    <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} /> 
                                    {refreshing ? 'Memperbarui...' : 'Refresh dari OWM'}
                                </button>
                            </form>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-gradient-to-b from-orange-50 to-orange-100/50 border border-orange-200/60 text-center shadow-sm">
                                {cuaca.image ? (
                                    <img src={cuaca.image} alt="Cuaca" className="w-16 h-16 drop-shadow-md" />
                                ) : (
                                    <CloudSun className="text-orange-400 mb-1" size={48} />
                                )}
                                <p className="text-4xl font-black text-slate-800 mt-1">
                                    {cuaca.temperature}<span className="text-xl text-slate-500">°C</span>
                                </p>
                                <p className="text-sm text-slate-600 font-bold capitalize">{cuaca.description || '-'}</p>
                            </div>

                            <div className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl bg-gradient-to-b from-sky-50 to-sky-100/50 border border-sky-200/60 text-center shadow-sm">
                                <div className="p-3 bg-sky-100 text-sky-500 rounded-full mb-1"><Wind size={28} /></div>
                                <p className="text-3xl font-black text-slate-800">
                                    {cuaca.wind_speed || '--'}<span className="text-sm text-slate-500 ml-1">km/h</span>
                                </p>
                                <p className="text-sm text-slate-600 font-bold">Kecepatan Angin</p>
                            </div>

                            <div className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl bg-gradient-to-b from-teal-50 to-teal-100/50 border border-teal-200/60 text-center shadow-sm">
                                <div className="p-3 bg-teal-100 text-teal-500 rounded-full mb-1"><Droplets size={28} /></div>
                                <p className="text-3xl font-black text-slate-800">
                                    {cuaca.humidity || '--'}<span className="text-sm text-slate-500 ml-1">%</span>
                                </p>
                                <p className="text-sm text-slate-600 font-bold">Kelembaban</p>
                            </div>

                            <div className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl bg-gradient-to-b from-indigo-50 to-indigo-100/50 border border-indigo-200/60 text-center shadow-sm">
                                <div className="p-3 bg-indigo-100 text-indigo-500 rounded-full mb-1"><CloudRain size={28} /></div>
                                <p className="text-3xl font-black text-slate-800">
                                    {cuaca.rainfall || '0'}<span className="text-sm text-slate-500 ml-1">mm</span>
                                </p>
                                <p className="text-sm text-slate-600 font-bold">Curah Hujan (1h)</p>
                            </div>
                        </div>

                        <div className="mt-6 text-right">
                            <p className="text-xs font-bold text-slate-400 bg-slate-50 inline-block px-3 py-1.5 rounded-lg border border-slate-100">
                                Terakhir diperbarui: {cuaca.updated_at ? new Date(cuaca.updated_at).toLocaleString('id-ID', {day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'}) + ' WIB' : '-'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 text-center flex flex-col items-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-sm">
                            <CloudSun size={40} className="text-slate-300" />
                        </div>
                        <h4 className="text-lg font-black text-slate-600 mb-1">Data Cuaca Belum Tersedia</h4>
                        <p className="text-sm text-slate-400 font-medium max-w-md">Silakan pilih lokasi dan simpan pengaturan terlebih dahulu untuk mengambil data dari OpenWeatherMap.</p>
                    </div>
                )}

            </div>
        </div>
    );
};

export default AppCuaca;
