<x-app-layout>
    <x-slot name="header">
        <h2 class="leading-tight">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">
                    {{ __('Data Master') }}
                </li>
                <li class="breadcrumb-item">
                    <a href="{{ route('kebun.index') }}">Data Kebun</a>
                </li>
                <li class="breadcrumb-item breadcrumb-active">
                    {{ __('Ubah Data') }}
                </li>
            </ol>
        </h2>
    </x-slot>

    <div class="pt-2 pb-12">
        <div class="max-w-8xl mx-auto px-3 sm:px-6 lg:px-8 flex flex-col gap-4">
            <div class="flex justify-center items-center w-full">
                <div class="bg-white shadow-sm w-full md:w-5/6 h-auto px-6 py-4 rounded-lg">
                    <div class="mb-5">
                        <h3 class="text-lg font-semibold">Ubah Data Kebun</h3>
                        <p class="text-sm text-slate-500">Silakan isi semua informasi yang dibutuhkan</p>
                    </div>
                    <form action="{{ route('kebun.update', $kebun->id) }}" method="post">
                        @csrf
                        @method('PUT')
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Hidden input untuk simpan GeoJSON -->
                            <input type="hidden" name="polygon" id="polygon" value="{{ $kebun->polygon }}">
                            <div>
                                <x-input-label for="luas">{{ __('Luas Kebun') }}</x-input-label>
                                <x-text-input type="text" id="luas" name="luas"
                                    class="block mt-1 w-full rounded-xl bg-gray-100" value="{{ $kebun->luas }}"
                                    readonly />
                            </div>
                            <div>
                                <x-input-label for="nama">{{ __('Nama Kebun') }}</x-input-label>
                                <x-text-input id="nama" class="block mt-1 w-full rounded-xl bg-gray-100"
                                    type="text" name="nama" :value="old('nama', $kebun->nama)" required autofocus
                                    autocomplete="nama" />
                                <x-input-error :messages="$errors->get('nama')" class="mt-2" />
                            </div>
                            <div>
                                <x-input-label for="lahan">{{ __('Lokasi Lahan') }}</x-input-label>
                                <select name="lahan" id="lahan" class="block mt-1 w-full rounded-xl bg-gray-100">
                                    <option value="">--- Pilih Lahan ---</option>
                                    @foreach ($lahan as $item)
                                        <option value="{{ $item->id }}" @selected($kebun->lahan_id == $item->id)>
                                            {{ $item->nama }}</option>
                                    @endforeach
                                </select>
                                <x-input-error :messages="$errors->get('lahan')" class="mt-2" />
                            </div>
                            <div>
                                <x-input-label for="jumlah_pohon">{{ __('Jumlah Pohon') }}</x-input-label>
                                <x-text-input id="jumlah_pohon" class="block mt-1 w-full rounded-xl bg-gray-100"
                                    type="number" name="jumlah_pohon" :value="old('jumlah_pohon', $kebun->jumlah_pohon)" min="0" step="1"
                                    required autofocus autocomplete="jumlah_pohon" />
                                <x-input-error :messages="$errors->get('jumlah_pohon')" class="mt-2" />
                            </div>
                            <div>
                                <x-input-label
                                    for="jumlah_pohon_matang">{{ __('Jumlah Pohon Matang') }}</x-input-label>
                                <x-text-input id="jumlah_pohon_matang" class="block mt-1 w-full rounded-xl bg-gray-100"
                                    type="number" name="jumlah_pohon_matang" :value="old('jumlah_pohon_matang', $kebun->jumlah_pohon_matang)" min="0"
                                    step="1" required autofocus autocomplete="jumlah_pohon_matang" />
                                <x-input-error :messages="$errors->get('jumlah_pohon_matang')" class="mt-2" />
                            </div>
                            <div>
                                <x-input-label
                                    for="jumlah_pohon_belum_matang">{{ __('Jumlah Pohon Belum Matang') }}</x-input-label>
                                <x-text-input id="jumlah_pohon_belum_matang"
                                    class="block mt-1 w-full rounded-xl bg-gray-100" type="number"
                                    name="jumlah_pohon_belum_matang" :value="old('jumlah_pohon_belum_matang', $kebun->jumlah_pohon_belum_matang)" min="0" step="1"
                                    required readonly />
                                <x-input-error :messages="$errors->get('jumlah_pohon_belum_matang')" class="mt-2" />
                            </div>
                            <div>
                                <x-input-label for="koordinat">{{ __('Titik Lokasi') }}</x-input-label>
                                <x-text-input id="koordinat" class="block mt-1 w-full rounded-xl bg-gray-100"
                                    type="text" name="koordinat" :value="old(
                                        'koordinat',
                                        (float) $kebun->latitude . ',' . (float) $kebun->longitude,
                                    )" required readonly />
                                <x-input-error :messages="$errors->get('koordinat')" class="mt-2" />
                            </div>
                            <div>
                                <x-input-label for="warna">{{ __('Warna Polygon') }}</x-input-label>
                                <x-text-input id="warna" class="block mt-1 w-full rounded-xl bg-gray-100"
                                    type="color" name="warna" :value="old('warna', $kebun->warna)" required />
                                <x-input-error :messages="$errors->get('warna')" class="mt-2" />
                            </div>
                            <div class="col-span-2">
                                <!-- Map -->
                                <div id="map" class="w-full h-[70vh] rounded-lg"></div>
                            </div>
                            <div class="flex items-center justify-end gap-3 col-span-2">
                                <a href="{{ route('kebun.index') }}"
                                    class="bg-gray-200 text-slate-500 px-5 py-1.5 rounded-lg">Batal</a>
                                <button type="submit"
                                    class="bg-primary text-white px-5 py-1.5 rounded-lg">Simpan</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
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
            var map = L.map('map');

            // Menambahkan layer peta Google Maps Satelit
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

            // Event saat polygon digambar
            // --- Tampilkan polygon lama ---
            let currentPolygon = null;
            let existingPolygon = {!! $kebun->polygon !!};
            const existingColor = "{{ $kebun->warna }}";

            if (existingPolygon) {
                const coords = existingPolygon.geometry.coordinates[0].map(c => [c[1], c[0]]);

                const polygon = L.polygon(coords, {
                    color: existingColor,
                    fillColor: existingColor,
                    fillOpacity: 0.4,
                    weight: 2
                });

                drawnItems.addLayer(polygon);
                map.fitBounds(polygon.getBounds());

                // set sebagai polygon aktif (editable + bisa ganti warna)
                currentPolygon = polygon;

                // pastikan hidden input tetap ada
                document.getElementById('polygon').value =
                    JSON.stringify(existingPolygon);
            }

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

            // Event saat polygon diedit
            map.on(L.Draw.Event.EDITED, function(event) {
                event.layers.eachLayer(function(layer) {
                    const latlngs = layer.getLatLngs()[0];
                    const area = L.GeometryUtil.geodesicArea(latlngs);
                    const hektar = (area / 10000).toFixed(2);
                    document.getElementById('luas').value = hektar;

                    // Ambil koordinat tengah-tengah polygon
                    const center = layer.getBounds().getCenter();
                    document.getElementById('koordinat').value = center.lat.toFixed(8) + ',' + center.lng
                        .toFixed(8);

                    const geojson = layer.toGeoJSON();
                    document.getElementById('polygon').value = JSON.stringify(geojson);
                });
            });

            document.getElementById('warna').addEventListener('input', function() {
                if (!currentPolygon) return;

                currentPolygon.setStyle({
                    color: this.value,
                    fillColor: this.value
                });
            });

            $(document).ready(function() {
                // Perhitungan pohon belum matang (Jumlah pohon - pohon matang = pohon belum matang)
                $('#jumlah_pohon, #jumlah_pohon_matang').on('input', function() {
                    const jumlahPohon = parseInt($('#jumlah_pohon').val()) || 0;
                    const jumlahPohonMatang = parseInt($('#jumlah_pohon_matang').val()) || 0;

                    const jumlahPohonBelumMatang = jumlahPohon - jumlahPohonMatang;
                    $('#jumlah_pohon_belum_matang').val(jumlahPohonBelumMatang)
                });
            });
        </script>
    @endpush
</x-app-layout>
