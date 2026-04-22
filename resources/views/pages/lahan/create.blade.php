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
                                    <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">Area
                                        Kerja</p>
                                    <h3 class="text-xl font-semibold text-slate-800 mt-1">Peta Lahan</h3>
                                    <p class="text-sm text-slate-500 mt-1">Gambar polygon lahan pada peta. Sistem akan
                                        menyiapkan titik tengah dan luas area dari hasil gambar.</p>
                                </div>
                                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                                    <div class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-600">
                                        <span class="font-semibold text-slate-800 block">Langkah 1</span>
                                        Gambar area lahan
                                    </div>
                                    <div class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-600">
                                        <span class="font-semibold text-slate-800 block">Langkah 2</span>
                                        Sesuaikan warna polygon
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
                                    Polygon lahan aktif
                                </div>
                                <div class="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 border border-blue-100">
                                    <span class="w-3 h-3 rounded-full bg-[#2185c7]"></span>
                                    Referensi kebun eksisting
                                </div>
                                <div class="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 border border-amber-100 text-amber-700">
                                    Gunakan toolbar kiri atas untuk menggambar polygon
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
                                luas dan titik lokasi diisi otomatis dari polygon.</p>
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
        <!-- Leaflet core -->
        <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>

        <!-- Leaflet.draw (untuk menggambar polygon) -->
        <link rel="stylesheet" href="https://unpkg.com/leaflet-draw/dist/leaflet.draw.css" />
        <script src="https://unpkg.com/leaflet-draw/dist/leaflet.draw.js"></script>

        <!-- Geometry util (untuk hitung luas) -->
        <script src="https://unpkg.com/leaflet-geometryutil"></script>
        <script>
            var map = L.map('map'); // init map

            L.tileLayer('https://www.google.cn/maps/vt?lyrs=s,h&x={x}&y={y}&z={z}', {
                attribution: '&copy; Google Hybrid',
                maxZoom: 18,
            }).addTo(map);

            const lahanData = @json($lahan); // data lahan dari controller
            const group = L.featureGroup().addTo(map);

            lahanData.forEach(lahan => {
                // Lahan
                const lahanLayer = L.geoJSON(JSON.parse(lahan.polygon), {
                    style: {
                        color: lahan.warna ?? '#2F6B3C',
                        weight: 2,
                        dashArray: '6,6',
                        fillOpacity: 0.1
                    },
                    onEachFeature: function(feature, layer) {
                        layer.bindPopup(`
                            <strong>${lahan.nama}</strong><br>
                            Luas: ${lahan.luas} ha<br>
                            Total kebun: ${lahan.kebun.length}
                        `);
                    }
                });

                group.addLayer(lahanLayer); // render lahan ke group

                // Kebun
                lahan.kebun.forEach(kebun => {
                    const kebunLayer = L.geoJSON(JSON.parse(kebun.polygon), {
                        style: {
                            color: kebun.warna ?? '#2185c7',
                            weight: 2,
                            fillOpacity: 0.4
                        },
                        onEachFeature: function(feature, layer) {
                            layer.bindPopup(`
                                <strong>${kebun.nama}</strong><br>
                                Luas: ${kebun.luas} ha<br>
                                Pohon: ${kebun.jumlah_pohon}
                            `);
                        }
                    });

                    group.addLayer(kebunLayer); // render kebun ke group
                });
            });

            // Auto center map berdasarkan semua layer / polygon
            if (group.getLayers().length) {
                map.fitBounds(group.getBounds(), {
                    padding: [40, 40]
                });
            }

            // Layer untuk simpan polygon
            const drawnItems = new L.FeatureGroup();
            map.addLayer(drawnItems);

            // Control draw
            const drawControl = new L.Control.Draw({
                edit: {
                    featureGroup: drawnItems
                },
                draw: {
                    polygon: true,
                    polyline: false,
                    rectangle: false,
                    circle: false,
                    marker: false,
                    circlemarker: false
                }
            });
            map.addControl(drawControl);

            let currentPolygon = null;

            function getPolygonStyle() {
                const color = document.getElementById('warna').value;

                return {
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.4,
                    weight: 2
                };
            }

            // Event saat polygon digambar
            map.on(L.Draw.Event.CREATED, function(event) {
                const layer = event.layer;
                // apply style warna
                layer.setStyle(getPolygonStyle());

                drawnItems.clearLayers(); // hanya 1 polygon
                drawnItems.addLayer(layer);
                currentPolygon = layer;

                const latlngs = layer.getLatLngs()[0];
                const area = L.GeometryUtil.geodesicArea(latlngs); // m²
                const hektar = (area / 10000).toFixed(2); // ha

                // Isi input luas area
                document.getElementById('luas').value = hektar;

                // Ambil koordinat tengah-tengah polygon
                const center = layer.getBounds().getCenter();
                document.getElementById('koordinat').value = center.lat.toFixed(8) + ',' + center.lng.toFixed(8);

                // Simpan polygon dalam format GeoJSON ke input hidden
                const geojson = layer.toGeoJSON();
                document.getElementById('polygon').value = JSON.stringify(geojson);
            });

            document.getElementById('warna').addEventListener('input', function() {
                if (!currentPolygon) return;

                currentPolygon.setStyle({
                    color: this.value,
                    fillColor: this.value
                });
            });
        </script>
    @endpush
</x-app-layout>
