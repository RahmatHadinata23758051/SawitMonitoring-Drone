<x-app-layout>
    <x-slot name="header">
        <h2 class="leading-tight">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">
                    <a href="{{ route('panen.index') }}">Manajemen Panen</a>
                </li>
                <li class="breadcrumb-item breadcrumb-active">
                    {{ __('Tambah Data') }}
                </li>
            </ol>
        </h2>
    </x-slot>

    <div class="pt-2 pb-12">
        <div class="max-w-8xl mx-auto px-3 sm:px-6 lg:px-8 flex flex-col gap-4">
            <div class="flex justify-center items-center w-full">
                <div class="bg-white shadow-sm w-full md:w-5/6 lg:w-3/4 h-auto px-6 py-4 rounded-lg">
                    <div class="mb-5">
                        <h3 class="text-lg font-semibold">Tambah Data Panen</h3>
                        <p class="text-sm text-slate-500">Silakan isi semua informasi yang dibutuhkan</p>
                    </div>
                    <form action="{{ route('panen.store') }}" method="post">
                        @csrf
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <x-input-label for="tanggal_panen">{{ __('Tanggal Panen') }}</x-input-label>
                                <x-text-input id="tanggal_panen" class="block mt-1 w-full rounded-xl bg-gray-100"
                                    type="date" name="tanggal_panen" :value="old('tanggal_panen')" required autofocus
                                    autocomplete="tanggal_panen" />
                                <x-input-error :messages="$errors->get('tanggal_panen')" class="mt-2" />
                            </div>
                            <div>
                                <x-input-label for="kebun">{{ __('Lokasi Kebun') }}</x-input-label>
                                <select name="kebun" id="kebun" class="block mt-1 w-full rounded-xl bg-gray-100">
                                    <option value="">--- Pilih Kebun ---</option>
                                    @foreach ($kebun as $item)
                                        <option value="{{ $item->id }}">{{ $item->nama }}</option>
                                    @endforeach
                                </select>
                                <x-input-error :messages="$errors->get('kebun')" class="mt-2" />
                            </div>
                            <div>
                                <x-input-label for="target_panen">{{ __('Target Panen (kg)') }}</x-input-label>
                                <x-text-input id="target_panen" class="block mt-1 w-full rounded-xl bg-gray-100"
                                    type="number" name="target_panen" :value="old('target_panen')" min="0" step="0.01"
                                    required autofocus autocomplete="target_panen" placeholder="0.00" />
                                <x-input-error :messages="$errors->get('target_panen')" class="mt-2" />
                            </div>
                            <div>
                                <x-input-label for="hasil_panen">{{ __('Hasil Panen (kg)') }}</x-input-label>
                                <x-text-input id="hasil_panen" class="block mt-1 w-full rounded-xl bg-gray-100"
                                    type="number" name="hasil_panen" :value="old('hasil_panen')" min="0" step="0.01"
                                    required autofocus autocomplete="hasil_panen" placeholder="0.00" />
                                <x-input-error :messages="$errors->get('hasil_panen')" class="mt-2" />
                            </div>
                            <div class="flex items-center justify-end gap-3 col-span-2">
                                <a href="{{ route('panen.index') }}"
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
            var map = L.map('map', {
                center: [-1.0936651, 115.5621953], // Bandung
                zoom: 13,
            });

            // Menambahkan layer peta Google Maps Satelit
            L.tileLayer('https://www.google.cn/maps/vt?lyrs=s,h&x={x}&y={y}&z={z}', {
                attribution: '&copy; Google Hybrid',
                maxZoom: 18,
            }).addTo(map);

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
