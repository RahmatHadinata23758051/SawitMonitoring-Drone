<x-app-layout>
    <x-slot name="header">
        <h2 class="leading-tight">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">
                    {{ __('Data Master') }}
                </li>
                <li class="breadcrumb-item">
                    <a href="{{ route('lahan.index') }}">Data Lahan</a>
                </li>
                <li class="breadcrumb-item breadcrumb-active">
                    {{ __('Tambah Data') }}
                </li>
            </ol>
        </h2>
    </x-slot>

    <div class="pt-2 pb-12">
        <div class="max-w-[1500px] mx-auto px-3 sm:px-6 lg:px-8">
            <form action="{{ route('lahan.store') }}" method="post">
                @csrf
                <input type="hidden" name="polygon" id="polygon">

                <div class="grid grid-cols-1 xl:grid-cols-[minmax(0,1.65fr)_420px] gap-6 items-start">
                    <section class="bg-white shadow-sm rounded-2xl border border-slate-200 overflow-hidden">
                        <div class="px-6 py-5 border-b border-slate-200 bg-slate-50/80">
                            <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                    <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">Area Kerja</p>
                                    <h3 class="text-xl font-semibold text-slate-800 mt-1">Peta Lahan</h3>
                                    <p class="text-sm text-slate-500 mt-1">Gambar polygon lahan pada peta. Sistem akan
                                        menyiapkan titik tengah, luas area, dan alamat dari hasil gambar.</p>
                                </div>
                                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                                    <div class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-600">
                                        <span class="font-semibold text-slate-800 block">Langkah 1</span>
                                        Gambar area lahan
                                    </div>
                                    <div class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-600">
                                        <span class="font-semibold text-slate-800 block">Langkah 2</span>
                                        Tinjau data otomatis
                                    </div>
                                    <div class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-600">
                                        <span class="font-semibold text-slate-800 block">Langkah 3</span>
                                        Simpan data lahan
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="px-6 pt-5">
                            <div class="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                                <div class="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 border border-emerald-100">
                                    <span class="w-3 h-3 rounded-full bg-[#2F6B3C]"></span>
                                    Polygon lahan
                                </div>
                                <div class="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 border border-amber-100 text-amber-700">
                                    Basemap dapat diganti dari kontrol kiri atas
                                </div>
                            </div>
                        </div>

                        <div class="p-6">
                            <div id="map" class="w-full h-[72vh] min-h-[560px] rounded-2xl border border-slate-200 shadow-inner"></div>
                        </div>
                    </section>

                    <aside class="bg-white shadow-sm rounded-2xl border border-slate-200 overflow-hidden xl:sticky xl:top-6">
                        <div class="px-6 py-5 border-b border-slate-200">
                            <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">Form Lahan</p>
                            <h3 class="text-xl font-semibold text-slate-800 mt-1">Tambah Data Lahan</h3>
                            <p class="text-sm text-slate-500 mt-1">Silakan isi semua informasi yang dibutuhkan. Kolom
                                luas, titik lokasi, dan alamat diisi otomatis dari polygon.</p>
                        </div>

                        <div class="px-6 py-5 space-y-5">
                            <div>
                                <x-input-label for="nama">{{ __('Nama Lahan') }}</x-input-label>
                                <x-text-input id="nama" class="block mt-1 w-full rounded-xl bg-gray-100"
                                    type="text" name="nama" :value="old('nama')" required autofocus
                                    autocomplete="nama" />
                                <x-input-error :messages="$errors->get('nama')" class="mt-2" />
                            </div>

                            <div class="grid grid-cols-1 gap-5">
                                <div>
                                    <x-input-label for="luas">{{ __('Luas Lahan') }}</x-input-label>
                                    <x-text-input type="text" id="luas" name="luas"
                                        class="block mt-1 w-full rounded-xl bg-gray-100" readonly />
                                    <p class="mt-2 text-xs text-slate-500">Satuan hektar, dihitung dari polygon yang
                                        digambar.</p>
                                    <x-input-error :messages="$errors->get('luas')" class="mt-2" />
                                </div>

                                <div>
                                    <x-input-label for="koordinat">{{ __('Titik Lokasi') }}</x-input-label>
                                    <x-text-input id="koordinat" class="block mt-1 w-full rounded-xl bg-gray-100"
                                        type="text" name="koordinat" :value="old('koordinat')" required readonly />
                                    <p class="mt-2 text-xs text-slate-500">Diambil dari titik tengah polygon aktif.</p>
                                    <x-input-error :messages="$errors->get('koordinat')" class="mt-2" />
                                </div>

                                <div>
                                    <x-input-label for="alamat">{{ __('Alamat') }}</x-input-label>
                                    <textarea id="alamat" name="alamat" rows="4" readonly
                                        class="block mt-1 w-full rounded-xl bg-gray-100 border-gray-300 focus:border-primary focus:ring-primary text-sm">{{ old('alamat') }}</textarea>
                                    <p class="mt-2 text-xs text-slate-500">Diambil otomatis dari titik tengah polygon
                                        melalui reverse geocoding.</p>
                                    <x-input-error :messages="$errors->get('alamat')" class="mt-2" />
                                </div>

                                <div>
                                    <x-input-label for="warna">{{ __('Warna Polygon') }}</x-input-label>
                                    <div class="mt-1 flex items-center gap-3 rounded-xl bg-gray-100 px-3 py-2">
                                        <x-text-input id="warna" class="h-11 w-16 rounded-lg border-0 bg-transparent p-0"
                                            type="color" name="warna" :value="old('warna', '#2F6B3C')" required />
                                        <div class="text-sm text-slate-500">
                                            Gunakan warna pembeda untuk memudahkan identifikasi lahan pada peta.
                                        </div>
                                    </div>
                                    <x-input-error :messages="$errors->get('warna')" class="mt-2" />
                                </div>
                            </div>
                        </div>

                        <div class="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
                            <a href="{{ route('lahan.index') }}"
                                class="bg-gray-200 text-slate-500 px-5 py-2 rounded-xl">Batal</a>
                            <button type="submit"
                                class="bg-primary text-white px-5 py-2 rounded-xl">Simpan</button>
                        </div>
                    </aside>
                </div>
            </form>
        </div>
    </div>

    @push('scripts')
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <link rel="stylesheet" href="https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.css" />
        <script src="https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.js"></script>
        <script src="https://unpkg.com/leaflet-geometryutil@0.10.3/src/leaflet.geometryutil.js"></script>
        <script src="https://unpkg.com/@turf/turf@6.5.0/turf.min.js"></script>
        <script>
            // Ensure DOM is ready
            const mapContainer = document.getElementById('map');
            if (!mapContainer) {
                console.error('Map container not found');
            }

            // Wait for all libraries to load
            // Wait for libraries with timeout (matches React pattern)
            function waitForLibraries(callback, attempts = 0) {
                if (typeof L !== 'undefined' && typeof L.Draw !== 'undefined' && typeof L.GeometryUtil !== 'undefined') {
                    callback();
                } else if (attempts < 50) {
                    setTimeout(() => waitForLibraries(callback, attempts + 1), 50);
                } else {
                    console.error('❌ Libraries failed to load after timeout');
                }
            }

            // Helper function to calculate polygon info (matches React LeafletDrawMap)
            function calculatePolygonInfo(layer) {
                try {
                    const geojson = layer.toGeoJSON();
                    const bounds = layer.getBounds();
                    const center = bounds.getCenter();
                    const latlngs = layer.getLatLngs()[0];
                    
                    if (!Array.isArray(latlngs) || latlngs.length < 3) {
                        console.warn('⚠️ Polygon must have at least 3 points');
                        return null;
                    }
                    
                    const areaSquareMeters = L.GeometryUtil.geodesicArea(latlngs);
                    const areaHectares = areaSquareMeters / 10000;

                    return {
                        polygon: geojson.geometry,
                        latitude: parseFloat(center.lat.toFixed(7)),
                        longitude: parseFloat(center.lng.toFixed(7)),
                        area_hectare: parseFloat(areaHectares.toFixed(3))
                    };
                } catch (error) {
                    console.error('❌ Error calculating polygon info:', error);
                    return null;
                }
            }

            // Initialize map after libraries are ready
            waitForLibraries(() => {
                initializeMap();
            });

            function initializeMap() {
                try {
                    // Verify libraries are available
                    if (typeof L === 'undefined') throw new Error('Leaflet not loaded');
                    if (typeof L.Draw === 'undefined') throw new Error('Leaflet Draw not loaded');
                    if (typeof L.GeometryUtil === 'undefined') throw new Error('Leaflet GeometryUtil not loaded');

                    const alamatInput = document.getElementById('alamat');
                    const luasInput = document.getElementById('luas');
                    const koordinatInput = document.getElementById('koordinat');
                    const polygonInput = document.getElementById('polygon');
                    const warnaInput = document.getElementById('warna');

                    // Start from a clean national view when creating a new lahan.
                    const map = L.map('map');
                    map.setView([-2.5489, 118.0149], 5);

                    // Add tile layers
                    const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; OpenStreetMap contributors',
                        maxZoom: 19,
                    });
                    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                        attribution: 'Tiles &copy; Esri',
                        maxZoom: 19,
                    });

                    streetLayer.addTo(map);
                    L.control.layers({
                        'Peta Jalan': streetLayer,
                        'Citra Satelit': satelliteLayer
                    }, {}, {
                        position: 'topleft'
                    }).addTo(map);

                    // Add feature groups
                    const drawnItems = new L.FeatureGroup().addTo(map);

                    // Add draw control
                    const drawControl = new L.Control.Draw({
                        edit: {
                            featureGroup: drawnItems
                        },
                        draw: {
                            polygon: {
                                allowIntersection: true,
                                showArea: true,
                                shapeOptions: { color: warnaInput?.value || '#2F6B3C' }
                            },
                            polyline: false,
                            rectangle: false,
                            circle: false,
                            marker: false,
                            circlemarker: false
                        }
                    });
                    map.addControl(drawControl);

                    // Helper functions
                    async function updateAddress(lat, lng) {
                        try {
                            alamatInput.value = 'Memuat alamat...';
                            const response = await fetch(
                                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=id`,
                                { headers: { 'User-Agent': 'Mozilla/5.0' } }
                            );
                            const data = await response.json();
                            alamatInput.value = data.display_name || '';
                        } catch (error) {
                            console.warn('⚠️ Address lookup failed:', error);
                            alamatInput.value = '';
                        }
                    }

                    function syncPolygonFields(layer) {
                        const info = calculatePolygonInfo(layer);
                        if (!info) {
                            console.error('❌ Could not calculate polygon info');
                            return;
                        }

                        luasInput.value = info.area_hectare.toFixed(2);
                        koordinatInput.value = `${info.latitude.toFixed(8)},${info.longitude.toFixed(8)}`;
                        polygonInput.value = JSON.stringify(info.polygon);
                        updateAddress(info.latitude, info.longitude);
                    }

                    function clearPolygonFields() {
                        luasInput.value = '';
                        koordinatInput.value = '';
                        polygonInput.value = '';
                        alamatInput.value = '';
                    }

                    function getPolygonStyle() {
                        return {
                            color: warnaInput?.value || '#2F6B3C',
                            fillColor: warnaInput?.value || '#2F6B3C',
                            fillOpacity: 0.4,
                            weight: 2
                        };
                    }

                    // Legend
                    const legend = L.control({ position: 'bottomright' });
                    legend.onAdd = function() {
                        const div = L.DomUtil.create('div');
                        div.className = 'bg-white/95 backdrop-blur border border-slate-200 rounded-2xl shadow-lg px-4 py-3 text-xs text-slate-700';
                        div.innerHTML = `
                            <div class="font-semibold text-slate-800 mb-2">Legenda Peta</div>
                            <div class="flex items-center gap-2 mb-2">
                                <span style="width:12px;height:12px;border-radius:9999px;background:#2F6B3C;display:inline-block;"></span>
                                <span>Polygon lahan</span>
                            </div>
                            <div class="text-slate-500">Peta tambah lahan dimulai dari tampilan Indonesia tanpa overlay lahan lama.</div>
                        `;
                        return div;
                    };
                    legend.addTo(map);

                    // ══════════════════════════════════════════════════════
                    // Event Handlers (matches React LeafletDrawMap pattern)
                    // ══════════════════════════════════════════════════════

                    map.on(L.Draw.Event.CREATED, (event) => {
                        try {
                            const layer = event.layer;
                            const latlngs = layer.getLatLngs()[0];

                            // Validate minimum 3 points
                            if (!Array.isArray(latlngs) || latlngs.length < 3) {
                                alert('❌ Area harus mempunyai minimal 3 titik sudut!');
                                return;
                            }

                            drawnItems.clearLayers();
                            layer.setStyle(getPolygonStyle());
                            drawnItems.addLayer(layer);

                            syncPolygonFields(layer);
                            console.log('✅ Polygon created successfully');
                        } catch (error) {
                            console.error('❌ Error in CREATED handler:', error);
                        }
                    });

                    map.on(L.Draw.Event.EDITED, (event) => {
                        try {
                            if (event.layers && event.layers._layers) {
                                for (const layerId in event.layers._layers) {
                                    const layer = event.layers._layers[layerId];
                                    layer.setStyle(getPolygonStyle());
                                    syncPolygonFields(layer);
                                }
                            }
                            console.log('✅ Polygon edited successfully');
                        } catch (error) {
                            console.error('❌ Error in EDITED handler:', error);
                        }
                    });

                    map.on(L.Draw.Event.DELETED, (event) => {
                        try {
                            clearPolygonFields();
                            console.log('✅ Polygon deleted');
                        } catch (error) {
                            console.error('❌ Error in DELETED handler:', error);
                        }
                    });

                    // Color input listener
                    warnaInput?.addEventListener('input', function() {
                        drawnItems.eachLayer(layer => {
                            if (layer.setStyle) {
                                layer.setStyle({
                                    color: this.value,
                                    fillColor: this.value
                                });
                            }
                        });
                    });

                    // Initialize map display
                    setTimeout(() => map.invalidateSize(), 200);
                    window.addEventListener('resize', () => map.invalidateSize());

                    console.log('✅ Map initialized successfully');
                } catch (error) {
                    console.error('❌ Error initializing map:', error);
                    alert('Gagal menginisialisasi peta: ' + error.message);
                }
            }
        </script>
    @endpush
</x-app-layout>
