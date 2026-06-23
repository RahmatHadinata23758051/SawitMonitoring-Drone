import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Save, CloudSun, Wind, Droplets, CloudRain, RefreshCw, AlertCircle, Loader2, Info, Layers } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const cleanName = (str) => {
    if (!str) return '';
    return str.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // remove punctuation
        .replace(/\b(daerah khusus ibukota|daerah istimewa|dki|diy|provinsi|prov|kabupaten|kab|kota|kecamatan|kec|desa|kelurahan|kel)\b/g, '')
        .replace(/\s+/g, ' ')
        .trim();
};

const isMatch = (nameA, nameB) => {
    const cA = cleanName(nameA);
    const cB = cleanName(nameB);
    if (!cA || !cB) return false;
    return cA === cB;
};

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

    const [clickedLat, setClickedLat] = useState(cuaca?.latitude || '');
    const [clickedLon, setClickedLon] = useState(cuaca?.longitude || '');

    const [geoAddress, setGeoAddress] = useState('');
    const [geocoding, setGeocoding] = useState(false);
    const [mapMode, setMapMode] = useState('osm'); // 'osm' or 'satellite'

    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markerInstance = useRef(null);
    const tileLayerRef = useRef(null);

    useEffect(() => {
        if (window.Swal) {
            if (flashSuccess) window.Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flashSuccess, showConfirmButton: false, timer: 3000, timerProgressBar: true });
            if (flashError) window.Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flashError, showConfirmButton: false, timer: 4000, timerProgressBar: true });
        }
    }, [flashSuccess, flashError]);

    useEffect(() => {
        const initMap = async () => {
            if (!mapRef.current || mapInstance.current) return;

            // Default coordinates (Bogor/IPB)
            let defaultLat = -6.5982;
            let defaultLon = 106.7972;

            // Try to resolve current saved coordinate to center the map
            if (cuaca?.latitude && cuaca?.longitude) {
                defaultLat = parseFloat(cuaca.latitude);
                defaultLon = parseFloat(cuaca.longitude);
            } else if (cuaca?.kabupaten_kota) {
                try {
                    const queryCity = cuaca.kabupaten_kota.replace(/^(KABUPATEN|KOTA|KAB\.?)\s+/i, '').trim();
                    const queryLocation = cuaca.desa 
                        ? `${cuaca.desa}, ${queryCity}, Indonesia`
                        : `${queryCity}, Indonesia`;
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(queryLocation)}&format=json&limit=1`);
                    let data = await res.json();
                    
                    if (!data || data.length === 0) {
                        const resCityOnly = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(queryCity + ', Indonesia')}&format=json&limit=1`);
                        data = await resCityOnly.json();
                    }

                    if (data && data.length > 0) {
                        defaultLat = parseFloat(data[0].lat);
                        defaultLon = parseFloat(data[0].lon);
                    }
                } catch (e) {
                    console.error("Error geocoding current weather city coordinates:", e);
                }
            }

            // Create emerald custom icon to match project brand visual
            const customMarkerIcon = L.divIcon({
                html: `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 text-white shadow-lg border-2 border-white animate-bounce">
                         <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                       </div>`,
                className: 'custom-leaflet-marker',
                iconSize: [32, 32],
                iconAnchor: [16, 32]
            });

            // Initialize leaflet map
            const map = L.map(mapRef.current, { zoomControl: true }).setView([defaultLat, defaultLon], 10);
            
            // Set initial OSM tile layer
            const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            tileLayerRef.current = osmLayer;

            const marker = L.marker([defaultLat, defaultLon], { icon: customMarkerIcon }).addTo(map);

            mapInstance.current = map;
            markerInstance.current = marker;

            // Handle Map Clicks
            map.on('click', async (e) => {
                const { lat, lng } = e.latlng;
                marker.setLatLng([lat, lng]);
                map.panTo([lat, lng]);

                setClickedLat(lat);
                setClickedLon(lng);

                setGeocoding(true);
                setGeoAddress('');

                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
                        headers: {
                            'Accept-Language': 'id'
                        }
                    });
                    const resData = await res.json();
                    if (resData && resData.address) {
                        const addr = resData.address;
                        const formattedAddress = resData.display_name || '';
                        setGeoAddress(formattedAddress);

                        // Match region on backend in single request
                        const resMatch = await fetch(routes.matchRegion, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': csrfToken
                            },
                            body: JSON.stringify({ address: addr })
                        });
                        const matchData = await resMatch.json();
                        
                        if (matchData) {
                            if (matchData.cities) setCityList(matchData.cities);
                            if (matchData.districts) setDistrictList(matchData.districts);
                            if (matchData.villages) setVillageList(matchData.villages);

                            if (matchData.province_code) setSelProvince(matchData.province_code);
                            if (matchData.city_code) setSelCity(matchData.city_code);
                            if (matchData.district_code) setSelDistrict(matchData.district_code);
                            if (matchData.village_code) setSelVillage(matchData.village_code);
                        }
                    }
                } catch (err) {
                    console.error("Geocoding failed:", err);
                } finally {
                    setGeocoding(false);
                }
            });
        };

        initMap();

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, [provinces]);

    const toggleMapMode = () => {
        if (!mapInstance.current) return;
        
        // Remove current layer
        if (tileLayerRef.current) {
            mapInstance.current.removeLayer(tileLayerRef.current);
        }
        
        const newMode = mapMode === 'osm' ? 'satellite' : 'osm';
        setMapMode(newMode);
        
        // Create new layer
        let newLayer;
        if (newMode === 'satellite') {
            newLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            });
        } else {
            newLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            });
        }
        
        newLayer.addTo(mapInstance.current);
        tileLayerRef.current = newLayer;
    };

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
                    <input type="hidden" name="latitude" value={clickedLat} />
                    <input type="hidden" name="longitude" value={clickedLon} />
                    <h3 className="text-lg font-black text-slate-800 mb-1 flex items-center gap-2" style={{ fontFamily: "'Manrope', sans-serif" }}>
                        <div className="bg-blue-50 text-blue-600 border border-blue-100/50 p-2 rounded-xl"><MapPin size={20} /></div>
                        Pilih Wilayah Sumber Data Cuaca
                    </h3>
                    <p className="text-sm font-medium text-slate-500 mb-6 pl-12">Setelah menyimpan lokasi, data cuaca akan otomatis diambil dari OpenWeatherMap.</p>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Map Picker */}
                        <div className="lg:col-span-6 flex flex-col gap-3">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Pilih dari Peta (Klik untuk Pin Lokasi)</label>
                            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm h-[320px] relative z-10">
                                <div ref={mapRef} className="w-full h-full" />
                                <button
                                    type="button"
                                    onClick={toggleMapMode}
                                    className="absolute top-3 right-3 z-[400] bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    <Layers size={14} className="text-slate-500" />
                                    {mapMode === 'satellite' ? 'Peta Standar' : 'Satelit'}
                                </button>
                            </div>
                            {geocoding && (
                                <div className="text-xs text-slate-500 font-semibold flex items-center gap-2 mt-1">
                                    <Loader2 className="animate-spin text-blue-500" size={14} />
                                    Menganalisis wilayah koordinat...
                                </div>
                            )}
                            {geoAddress && (
                                <div className="text-xs text-slate-600 font-semibold bg-slate-50 border border-slate-200/60 p-3 rounded-xl flex items-start gap-2 mt-1">
                                    <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
                                    <span>Alamat terdeteksi: <strong className="text-slate-800 font-bold">{geoAddress}</strong></span>
                                </div>
                            )}
                        </div>

                        {/* Select Options */}
                        <div className="lg:col-span-6 flex flex-col justify-between gap-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="province" className="text-xs font-bold text-slate-500 uppercase tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Provinsi</label>
                                    <select id="province" name="province" required value={selProvince} onChange={handleProvinceChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:bg-white focus:border-blue-500 transition-all cursor-pointer">
                                        <option value="">-- Pilih Provinsi --</option>
                                        {provinceList.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                                    </select>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="city" className="text-xs font-bold text-slate-500 uppercase tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Kabupaten/Kota</label>
                                    <select id="city" name="city" required value={selCity} onChange={handleCityChange} disabled={loadingCity || !selProvince}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:bg-white focus:border-blue-500 transition-all cursor-pointer disabled:opacity-50">
                                        <option value="">{loadingCity ? 'Memuat...' : '-- Pilih Kota/Kabupaten --'}</option>
                                        {cityList.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                                    </select>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="district" className="text-xs font-bold text-slate-500 uppercase tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Kecamatan</label>
                                    <select id="district" name="district" required value={selDistrict} onChange={handleDistrictChange} disabled={loadingDistrict || !selCity}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:bg-white focus:border-blue-500 transition-all cursor-pointer disabled:opacity-50">
                                        <option value="">{loadingDistrict ? 'Memuat...' : '-- Pilih Kecamatan --'}</option>
                                        {districtList.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                                    </select>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="village" className="text-xs font-bold text-slate-500 uppercase tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Desa</label>
                                    <select id="village" name="village" required value={selVillage} onChange={e => setSelVillage(e.target.value)} disabled={loadingVillage || !selDistrict}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:bg-white focus:border-blue-500 transition-all cursor-pointer disabled:opacity-50">
                                        <option value="">{loadingVillage ? 'Memuat...' : '-- Pilih Desa --'}</option>
                                        {villageList.map(v => <option key={v.code} value={v.code}>{v.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl text-sm font-bold shadow-sm shadow-blue-600/10 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2">
                                    <Save size={18} /> Simpan &amp; Perbarui Cuaca
                                </button>
                            </div>
                        </div>
                    </div>
                </form>

                {cuaca && cuaca.temperature ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2" style={{ fontFamily: "'Manrope', sans-serif" }}>
                                    <CloudSun className="text-amber-500" size={22} /> Data Cuaca Terkini
                                </h3>
                                <p className="text-sm font-bold text-slate-500 mt-1">
                                    {cuaca.kabupaten_kota || '-'}, {cuaca.provinsi || '-'}
                                </p>
                            </div>
                            <form action={routes.refresh} method="POST" onSubmit={handleRefresh}>
                                <input type="hidden" name="_token" value={csrfToken} />
                                <button type="submit" disabled={refreshing}
                                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-50 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-100 hover:text-slate-800 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 shadow-sm disabled:opacity-50 w-full sm:w-auto">
                                    <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} /> 
                                    {refreshing ? 'Memperbarui...' : 'Refresh dari OWM'}
                                </button>
                            </form>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {/* Card Suhu */}
                            <div className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm transition-all hover:shadow-md text-center">
                                <div className="w-12 h-12 flex items-center justify-center mb-1 bg-amber-50 text-amber-500 border border-amber-100/50 rounded-xl">
                                    {cuaca.image ? (
                                        <img src={cuaca.image} alt="Cuaca" className="w-10 h-10 drop-shadow-sm" />
                                    ) : (
                                        <CloudSun size={24} />
                                    )}
                                </div>
                                <p className="text-3xl font-extrabold text-slate-850 mt-1" style={{ fontFamily: "'Manrope', sans-serif" }}>
                                    {cuaca.temperature}<span className="text-lg text-slate-400">°C</span>
                                </p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{cuaca.description || '-'}</p>
                            </div>

                            {/* Card Angin */}
                            <div className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm transition-all hover:shadow-md text-center">
                                <div className="w-12 h-12 flex items-center justify-center mb-1 bg-sky-50 text-sky-500 border border-sky-100/50 rounded-xl">
                                    <Wind size={24} />
                                </div>
                                <p className="text-3xl font-extrabold text-slate-850 mt-1" style={{ fontFamily: "'Manrope', sans-serif" }}>
                                    {cuaca.wind_speed || '--'}<span className="text-xs text-slate-400 ml-0.5">km/h</span>
                                </p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Kecepatan Angin</p>
                            </div>

                            {/* Card Kelembaban */}
                            <div className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm transition-all hover:shadow-md text-center">
                                <div className="w-12 h-12 flex items-center justify-center mb-1 bg-teal-50 text-teal-500 border border-teal-100/50 rounded-xl">
                                    <Droplets size={24} />
                                </div>
                                <p className="text-3xl font-extrabold text-slate-850 mt-1" style={{ fontFamily: "'Manrope', sans-serif" }}>
                                    {cuaca.humidity || '--'}<span className="text-xs text-slate-400 ml-0.5">%</span>
                                </p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Kelembaban</p>
                            </div>

                            {/* Card Curah Hujan */}
                            <div className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm transition-all hover:shadow-md text-center">
                                <div className="w-12 h-12 flex items-center justify-center mb-1 bg-blue-50 text-blue-500 border border-blue-100/50 rounded-xl">
                                    <CloudRain size={24} />
                                </div>
                                <p className="text-3xl font-extrabold text-slate-850 mt-1" style={{ fontFamily: "'Manrope', sans-serif" }}>
                                    {cuaca.rainfall || '0'}<span className="text-xs text-slate-400 ml-0.5">mm</span>
                                </p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Curah Hujan (1h)</p>
                            </div>
                        </div>

                        <div className="mt-6 text-right">
                            <p className="text-xs font-bold text-slate-400 bg-slate-50 inline-block px-3 py-1.5 rounded-lg border border-slate-100" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
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
