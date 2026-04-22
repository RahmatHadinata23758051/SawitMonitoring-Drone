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
        <div class="max-w-[1500px] mx-auto px-3 sm:px-6 lg:px-8">
            <form action="{{ route('kebun.update', $kebun->id) }}" method="post">
                @csrf
                @method('PUT')
                <input type="hidden" name="polygon" id="polygon" value="{{ $kebun->polygon }}">

                <div class="grid grid-cols-1 xl:grid-cols-[minmax(0,1.65fr)_420px] gap-6 items-start">
                    <section class="bg-white shadow-sm rounded-2xl border border-slate-200 overflow-hidden">
                        <div class="px-6 py-5 border-b border-slate-200 bg-slate-50/80">
                            <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                    <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">Area Kerja</p>
                                    <h3 class="text-xl font-semibold text-slate-800 mt-1">Peta Kebun</h3>
                                    <p class="text-sm text-slate-500 mt-1">Perbarui polygon kebun langsung pada peta.
                                        Luas dan titik lokasi akan mengikuti perubahan area.</p>
                                </div>
                                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                                    <div class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-600">
                                        <span class="font-semibold text-slate-800 block">Langkah 1</span>
                                        Tinjau lahan
                                    </div>
                                    <div class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-600">
                                        <span class="font-semibold text-slate-800 block">Langkah 2</span>
                                        Edit area kebun
                                    </div>
                                    <div class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-600">
                                        <span class="font-semibold text-slate-800 block">Langkah 3</span>
                                        Simpan perubahan
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
                                <div class="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 border border-blue-100">
                                    <span class="w-3 h-3 rounded-full bg-[#2185c7]"></span>
                                    Polygon kebun
                                </div>
                                <div class="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 border border-amber-100 text-amber-700">
                                    Gunakan toolbar kiri atas untuk mengedit polygon
                                </div>
                            </div>
                        </div>

                        <div class="p-6">
                            <div id="map" class="w-full h-[72vh] min-h-[560px] rounded-2xl border border-slate-200 shadow-inner"></div>
                        </div>
                    </section>

                    <aside class="bg-white shadow-sm rounded-2xl border border-slate-200 overflow-hidden xl:sticky xl:top-6">
                        <div class="px-6 py-5 border-b border-slate-200">
                            <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">Form Kebun</p>
                            <h3 class="text-xl font-semibold text-slate-800 mt-1">Ubah Data Kebun</h3>
                            <p class="text-sm text-slate-500 mt-1">Sesuaikan detail kebun di panel kanan. Nilai luas dan
                                titik lokasi mengikuti polygon yang aktif.</p>
                        </div>

                        <div class="px-6 py-5 space-y-5">
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

                            <div class="grid grid-cols-1 gap-5">
                                <div>
                                    <x-input-label for="luas">{{ __('Luas Kebun') }}</x-input-label>
                                    <x-text-input type="text" id="luas" name="luas"
                                        class="block mt-1 w-full rounded-xl bg-gray-100" value="{{ $kebun->luas }}"
                                        readonly />
                                    <p class="mt-2 text-xs text-slate-500">Satuan hektar, dihitung ulang saat polygon
                                        diubah.</p>
                                    <x-input-error :messages="$errors->get('luas')" class="mt-2" />
                                </div>

                                <div>
                                    <x-input-label for="koordinat">{{ __('Titik Lokasi') }}</x-input-label>
                                    <x-text-input id="koordinat" class="block mt-1 w-full rounded-xl bg-gray-100"
                                        type="text" name="koordinat" :value="old(
                                            'koordinat',
                                            (float) $kebun->latitude . ',' . (float) $kebun->longitude,
                                        )" required readonly />
                                    <p class="mt-2 text-xs text-slate-500">Diambil dari titik tengah polygon aktif.</p>
                                    <x-input-error :messages="$errors->get('koordinat')" class="mt-2" />
                                </div>

                                <div>
                                    <x-input-label for="jumlah_pohon">{{ __('Jumlah Pohon') }}</x-input-label>
                                    <x-text-input id="jumlah_pohon" class="block mt-1 w-full rounded-xl bg-gray-100"
                                        type="number" name="jumlah_pohon" :value="old('jumlah_pohon', $kebun->jumlah_pohon)"
                                        min="0" step="1" required autofocus autocomplete="jumlah_pohon" />
                                    <x-input-error :messages="$errors->get('jumlah_pohon')" class="mt-2" />
                                </div>

                                <div>
                                    <x-input-label for="jumlah_pohon_matang">{{ __('Jumlah Pohon Matang') }}</x-input-label>
                                    <x-text-input id="jumlah_pohon_matang" class="block mt-1 w-full rounded-xl bg-gray-100"
                                        type="number" name="jumlah_pohon_matang"
                                        :value="old('jumlah_pohon_matang', $kebun->jumlah_pohon_matang)" min="0"
                                        step="1" required autofocus autocomplete="jumlah_pohon_matang" />
                                    <x-input-error :messages="$errors->get('jumlah_pohon_matang')" class="mt-2" />
                                </div>

                                <div>
                                    <x-input-label for="jumlah_pohon_belum_matang">{{ __('Jumlah Pohon Belum Matang') }}</x-input-label>
                                    <x-text-input id="jumlah_pohon_belum_matang"
                                        class="block mt-1 w-full rounded-xl bg-gray-100" type="number"
                                        name="jumlah_pohon_belum_matang"
                                        :value="old('jumlah_pohon_belum_matang', $kebun->jumlah_pohon_belum_matang)"
                                        min="0" step="1" required readonly />
                                    <x-input-error :messages="$errors->get('jumlah_pohon_belum_matang')" class="mt-2" />
                                </div>

                                <div>
                                    <x-input-label for="warna">{{ __('Warna Polygon') }}</x-input-label>
                                    <div class="mt-1 flex items-center gap-3 rounded-xl bg-gray-100 px-3 py-2">
                                        <x-text-input id="warna" class="h-11 w-16 rounded-lg border-0 bg-transparent p-0"
                                            type="color" name="warna" :value="old('warna', $kebun->warna)" required />
                                        <div class="text-sm text-slate-500">
                                            Ubah warna polygon bila perlu agar kebun mudah dikenali pada peta.
                                        </div>
                                    </div>
                                    <x-input-error :messages="$errors->get('warna')" class="mt-2" />
                                </div>
                            </div>
                        </div>

                        <div class="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
                            <a href="{{ route('kebun.index') }}"
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
        <script>
            const map = L.map('map', {
                zoomControl: true,
            });

            const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
                maxZoom: 19,
            });

            const satelliteLayer = L.tileLayer(
                'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                    attribution: 'Tiles &copy; Esri',
                    maxZoom: 19,
                }
            );

            streetLayer.addTo(map);

            L.control.layers({
                'Peta Jalan': streetLayer,
                'Citra Satelit': satelliteLayer,
            }, {}, {
                position: 'topleft'
            }).addTo(map);

            const lahanData = @json($lahan);
            const group = L.featureGroup().addTo(map);
            const drawnItems = new L.FeatureGroup();
            const defaultCenter = [-2.5489, 118.0149];

            lahanData.forEach(lahan => {
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

                group.addLayer(lahanLayer);

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

                    group.addLayer(kebunLayer);
                });
            });

            const legend = L.control({
                position: 'bottomright'
            });

            legend.onAdd = function() {
                const div = L.DomUtil.create('div');
                div.className =
                    'bg-white/95 backdrop-blur border border-slate-200 rounded-2xl shadow-lg px-4 py-3 text-xs text-slate-700';
                div.innerHTML = `
                    <div class="font-semibold text-slate-800 mb-2">Legenda Peta</div>
                    <div class="flex items-center gap-2 mb-2">
                        <span style="width:12px;height:12px;border-radius:9999px;background:#2F6B3C;display:inline-block;"></span>
                        <span>Polygon lahan</span>
                    </div>
                    <div class="flex items-center gap-2 mb-2">
                        <span style="width:12px;height:12px;border-radius:9999px;background:#2185c7;display:inline-block;"></span>
                        <span>Polygon kebun</span>
                    </div>
                    <div class="text-[11px] text-slate-500">Edit polygon kebun dengan toolbar peta.</div>
                `;
                return div;
            };

            legend.addTo(map);
            map.addLayer(drawnItems);

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
            const existingPolygon = {!! $kebun->polygon !!};
            const existingColor = "{{ $kebun->warna }}";

            function getPolygonStyle() {
                const color = document.getElementById('warna').value;

                return {
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.4,
                    weight: 2
                };
            }

            function syncPolygonFields(layer) {
                const latlngs = layer.getLatLngs()[0];
                const area = L.GeometryUtil.geodesicArea(latlngs);
                const hektar = (area / 10000).toFixed(2);
                const center = layer.getBounds().getCenter();
                const geojson = layer.toGeoJSON();

                document.getElementById('luas').value = hektar;
                document.getElementById('koordinat').value = `${center.lat.toFixed(8)},${center.lng.toFixed(8)}`;
                document.getElementById('polygon').value = JSON.stringify(geojson);
            }

            if (existingPolygon) {
                const coords = existingPolygon.geometry.coordinates[0].map(c => [c[1], c[0]]);

                currentPolygon = L.polygon(coords, {
                    color: existingColor,
                    fillColor: existingColor,
                    fillOpacity: 0.4,
                    weight: 2
                });

                drawnItems.addLayer(currentPolygon);
                map.fitBounds(currentPolygon.getBounds(), {
                    padding: [40, 40]
                });
                document.getElementById('polygon').value = JSON.stringify(existingPolygon);
            } else if (group.getLayers().length) {
                map.fitBounds(group.getBounds(), {
                    padding: [40, 40]
                });
            } else {
                map.setView(defaultCenter, 5);
            }

            map.on(L.Draw.Event.CREATED, function(event) {
                const layer = event.layer;
                layer.setStyle(getPolygonStyle());

                drawnItems.clearLayers();
                drawnItems.addLayer(layer);
                currentPolygon = layer;

                syncPolygonFields(layer);
            });

            map.on(L.Draw.Event.EDITED, function(event) {
                event.layers.eachLayer(function(layer) {
                    currentPolygon = layer;
                    syncPolygonFields(layer);
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
                $('#jumlah_pohon, #jumlah_pohon_matang').on('input', function() {
                    const jumlahPohon = parseInt($('#jumlah_pohon').val()) || 0;
                    const jumlahPohonMatang = parseInt($('#jumlah_pohon_matang').val()) || 0;
                    const jumlahPohonBelumMatang = jumlahPohon - jumlahPohonMatang;

                    $('#jumlah_pohon_belum_matang').val(jumlahPohonBelumMatang);
                });
            });

            setTimeout(() => map.invalidateSize(), 200);
            window.addEventListener('resize', () => map.invalidateSize());
        </script>
    @endpush
</x-app-layout>
