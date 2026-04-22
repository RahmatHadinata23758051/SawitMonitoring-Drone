<x-app-layout>
    <x-slot name="header">
        <h2 class="leading-tight">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">{{ __('Data Master') }}</li>
                <li class="breadcrumb-item"><a href="{{ route('kebun.index') }}">Data Kebun</a></li>
                <li class="breadcrumb-item breadcrumb-active">{{ __('Ubah Data') }}</li>
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
                                    <p class="text-sm text-slate-500 mt-1">Pilih lahan, tinjau boundary aktif, lalu pastikan polygon kebun tetap berada di dalam area lahan tersebut.</p>
                                </div>
                                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                                    <div class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-600">
                                        <span class="font-semibold text-slate-800 block">Langkah 1</span>
                                        Pilih atau tinjau lahan
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
                                    Boundary lahan aktif
                                </div>
                                <div class="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 border border-blue-100">
                                    <span class="w-3 h-3 rounded-full bg-[#2185c7]"></span>
                                    Polygon kebun
                                </div>
                                <div id="map-status-badge" class="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 border border-amber-100 text-amber-700">
                                    Tinjau lahan aktif sebelum mengubah polygon
                                </div>
                            </div>
                            @error('polygon')
                                <p class="mt-3 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>

                        <div class="p-6">
                            <div id="map" class="w-full h-[72vh] min-h-[560px] rounded-2xl border border-slate-200 shadow-inner"></div>
                        </div>
                    </section>

                    <aside class="bg-white shadow-sm rounded-2xl border border-slate-200 overflow-hidden xl:sticky xl:top-6">
                        <div class="px-6 py-5 border-b border-slate-200">
                            <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">Form Kebun</p>
                            <h3 class="text-xl font-semibold text-slate-800 mt-1">Ubah Data Kebun</h3>
                            <p class="text-sm text-slate-500 mt-1">Sesuaikan detail kebun di panel kanan. Nilai luas dan titik lokasi mengikuti polygon yang aktif.</p>
                        </div>

                        <div class="px-6 py-5 space-y-5">
                            <div>
                                <x-input-label for="nama">{{ __('Nama Kebun') }}</x-input-label>
                                <x-text-input id="nama" class="block mt-1 w-full rounded-xl bg-gray-100"
                                    type="text" name="nama" :value="old('nama', $kebun->nama)" required autofocus autocomplete="nama" />
                                <x-input-error :messages="$errors->get('nama')" class="mt-2" />
                            </div>

                            <div>
                                <x-input-label for="lahan">{{ __('Lokasi Lahan') }}</x-input-label>
                                <select name="lahan" id="lahan" class="block mt-1 w-full rounded-xl bg-gray-100" required>
                                    <option value="">--- Pilih Lahan ---</option>
                                    @foreach ($lahan as $item)
                                        <option value="{{ $item->id }}" @selected(old('lahan', $kebun->lahan_id) == $item->id)>{{ $item->nama }}</option>
                                    @endforeach
                                </select>
                                <x-input-error :messages="$errors->get('lahan')" class="mt-2" />
                            </div>

                            <div class="grid grid-cols-1 gap-5">
                                <div>
                                    <x-input-label for="luas">{{ __('Luas Kebun') }}</x-input-label>
                                    <x-text-input type="text" id="luas" name="luas" class="block mt-1 w-full rounded-xl bg-gray-100"
                                        value="{{ $kebun->luas }}" readonly />
                                    <p class="mt-2 text-xs text-slate-500">Satuan hektar, dihitung ulang saat polygon diubah.</p>
                                    <x-input-error :messages="$errors->get('luas')" class="mt-2" />
                                </div>

                                <div>
                                    <x-input-label for="koordinat">{{ __('Titik Lokasi') }}</x-input-label>
                                    <x-text-input id="koordinat" class="block mt-1 w-full rounded-xl bg-gray-100"
                                        type="text" name="koordinat" :value="old('koordinat', (float) $kebun->latitude . ',' . (float) $kebun->longitude)"
                                        required readonly />
                                    <p class="mt-2 text-xs text-slate-500">Diambil dari titik tengah polygon aktif.</p>
                                    <x-input-error :messages="$errors->get('koordinat')" class="mt-2" />
                                </div>

                                <div>
                                    <x-input-label for="alamat">{{ __('Alamat') }}</x-input-label>
                                    <textarea id="alamat" name="alamat" rows="4" readonly
                                        class="block mt-1 w-full rounded-xl bg-gray-100 border-gray-300 focus:border-primary focus:ring-primary text-sm">{{ old('alamat', $kebun->alamat) }}</textarea>
                                    <p class="mt-2 text-xs text-slate-500">Diperbarui otomatis dari titik tengah polygon saat area digambar atau diedit.</p>
                                    <x-input-error :messages="$errors->get('alamat')" class="mt-2" />
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
                                        :value="old('jumlah_pohon_matang', $kebun->jumlah_pohon_matang)" min="0" step="1"
                                        required autofocus autocomplete="jumlah_pohon_matang" />
                                    <x-input-error :messages="$errors->get('jumlah_pohon_matang')" class="mt-2" />
                                </div>

                                <div>
                                    <x-input-label for="jumlah_pohon_belum_matang">{{ __('Jumlah Pohon Belum Matang') }}</x-input-label>
                                    <x-text-input id="jumlah_pohon_belum_matang" class="block mt-1 w-full rounded-xl bg-gray-100" type="number"
                                        name="jumlah_pohon_belum_matang"
                                        :value="old('jumlah_pohon_belum_matang', $kebun->jumlah_pohon_belum_matang)" min="0"
                                        step="1" required readonly />
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
                            <a href="{{ route('kebun.index') }}" class="bg-gray-200 text-slate-500 px-5 py-2 rounded-xl">Batal</a>
                            <button type="submit" class="bg-primary text-white px-5 py-2 rounded-xl">Simpan</button>
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
            const lahanData = @json($lahan);
            const selectedLahanId = @json(old('lahan', $kebun->lahan_id));
            const existingKebunGeoJson = {!! $kebun->polygon !!};
            const existingKebunColor = @json($kebun->warna);
            const mapStatusBadge = document.getElementById('map-status-badge');
            const polygonInput = document.getElementById('polygon');
            const luasInput = document.getElementById('luas');
            const koordinatInput = document.getElementById('koordinat');
            const alamatInput = document.getElementById('alamat');
            const lahanSelect = document.getElementById('lahan');
            const warnaInput = document.getElementById('warna');
            const defaultCenter = [-2.5489, 118.0149];

            const lahanById = Object.fromEntries(lahanData.map(item => [String(item.id), item]));
            const map = L.map('map', { zoomControl: true });
            const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
                maxZoom: 19,
            });
            const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri',
                maxZoom: 19,
            });

            streetLayer.addTo(map);
            L.control.layers({ 'Peta Jalan': streetLayer, 'Citra Satelit': satelliteLayer }, {}, { position: 'topleft' }).addTo(map);

            const baseGroup = L.featureGroup().addTo(map);
            const activeLahanGroup = L.featureGroup().addTo(map);
            const drawnItems = new L.FeatureGroup().addTo(map);

            const drawControl = new L.Control.Draw({
                edit: { featureGroup: drawnItems },
                draw: {
                    polygon: false,
                    polyline: false,
                    rectangle: false,
                    circle: false,
                    marker: false,
                    circlemarker: false
                }
            });
            map.addControl(drawControl);

            let currentPolygon = null;
            let activeLahan = null;
            let activeLahanGeoJson = null;
            let addressRequestId = 0;

            function updateMapStatus(message, tone = 'warning') {
                const tones = {
                    warning: 'bg-amber-50 border-amber-100 text-amber-700',
                    success: 'bg-emerald-50 border-emerald-100 text-emerald-700',
                    info: 'bg-blue-50 border-blue-100 text-blue-700',
                    danger: 'bg-red-50 border-red-100 text-red-700',
                };

                mapStatusBadge.className = `inline-flex items-center gap-2 rounded-full px-3 py-1.5 border ${tones[tone]}`;
                mapStatusBadge.textContent = message;
            }

            function getPolygonStyle() {
                const color = warnaInput.value;
                return { color, fillColor: color, fillOpacity: 0.4, weight: 2 };
            }

            function setDrawEnabled(enabled) {
                if (enabled) {
                    drawControl.setDrawingOptions({ draw: { polygon: true } });
                } else {
                    drawControl.setDrawingOptions({ draw: { polygon: false } });
                }
            }

            function clearCurrentPolygonFields() {
                if (!currentPolygon) {
                    polygonInput.value = '';
                    luasInput.value = '';
                    koordinatInput.value = '';
                    alamatInput.value = '';
                    return;
                }

                const geojson = currentPolygon.toGeoJSON();
                polygonInput.value = JSON.stringify(geojson);

                const latlngs = currentPolygon.getLatLngs()[0];
                const area = L.GeometryUtil.geodesicArea(latlngs);
                const center = currentPolygon.getBounds().getCenter();
                luasInput.value = (area / 10000).toFixed(2);
                koordinatInput.value = `${center.lat.toFixed(8)},${center.lng.toFixed(8)}`;
            }

            async function updateAddress(lat, lng) {
                const requestId = ++addressRequestId;
                alamatInput.value = 'Memuat alamat...';

                try {
                    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=id`;
                    const response = await fetch(url, {
                        headers: { 'Accept': 'application/json' }
                    });

                    if (!response.ok) {
                        throw new Error('Reverse geocoding gagal');
                    }

                    const data = await response.json();
                    if (requestId !== addressRequestId) return;
                    alamatInput.value = data.display_name || '';
                } catch (error) {
                    if (requestId !== addressRequestId) return;
                    alamatInput.value = '';
                }
            }

            async function syncPolygonFields(layer) {
                const latlngs = layer.getLatLngs()[0];
                const area = L.GeometryUtil.geodesicArea(latlngs);
                const hektar = (area / 10000).toFixed(2);
                const center = layer.getBounds().getCenter();

                luasInput.value = hektar;
                koordinatInput.value = `${center.lat.toFixed(8)},${center.lng.toFixed(8)}`;
                polygonInput.value = JSON.stringify(layer.toGeoJSON());
                await updateAddress(center.lat, center.lng);
            }

            function polygonWithinActiveLahan(layer) {
                if (!activeLahanGeoJson) return false;

                const geojson = layer.toGeoJSON();
                const points = geojson.geometry.coordinates[0] || [];

                return points.every(point => turf.booleanPointInPolygon(turf.point(point), activeLahanGeoJson, {
                    ignoreBoundary: false
                }));
            }

            function renderBaseReference() {
                baseGroup.clearLayers();
                lahanData.forEach(lahan => {
                    if (activeLahan && String(lahan.id) === String(activeLahan.id)) return;

                    L.geoJSON(JSON.parse(lahan.polygon), {
                        style: {
                            color: lahan.warna ?? '#94a3b8',
                            weight: 1.5,
                            dashArray: '4,6',
                            fillOpacity: 0.04
                        }
                    }).addTo(baseGroup);
                });
            }

            function restoreExistingPolygonIfNeeded() {
                drawnItems.clearLayers();
                currentPolygon = null;

                if (!activeLahan || String(activeLahan.id) !== String(selectedLahanId) || !existingKebunGeoJson) {
                    clearCurrentPolygonFields();
                    return;
                }

                const coords = existingKebunGeoJson.geometry.coordinates[0].map(c => [c[1], c[0]]);
                currentPolygon = L.polygon(coords, {
                    color: existingKebunColor,
                    fillColor: existingKebunColor,
                    fillOpacity: 0.4,
                    weight: 2
                });
                drawnItems.addLayer(currentPolygon);
                clearCurrentPolygonFields();
                if (!alamatInput.value) {
                    const center = currentPolygon.getBounds().getCenter();
                    updateAddress(center.lat, center.lng);
                }
            }

            function renderActiveLahan(lahanId) {
                activeLahanGroup.clearLayers();
                activeLahanGeoJson = null;
                activeLahan = lahanById[String(lahanId)] ?? null;

                if (!activeLahan) {
                    setDrawEnabled(false);
                    clearCurrentPolygonFields();
                    renderBaseReference();
                    updateMapStatus('Pilih lahan untuk mulai menggambar atau mengedit polygon.', 'warning');
                    if (baseGroup.getLayers().length) {
                        map.fitBounds(baseGroup.getBounds(), { padding: [40, 40] });
                    } else {
                        map.setView(defaultCenter, 5);
                    }
                    return;
                }

                activeLahanGeoJson = JSON.parse(activeLahan.polygon);
                L.geoJSON(activeLahanGeoJson, {
                    style: {
                        color: activeLahan.warna ?? '#2F6B3C',
                        weight: 3,
                        fillOpacity: 0.08
                    }
                }).addTo(activeLahanGroup);

                activeLahan.kebun.forEach(kebun => {
                    if (String(kebun.id) === @json((string) $kebun->id)) return;
                    L.geoJSON(JSON.parse(kebun.polygon), {
                        style: {
                            color: kebun.warna ?? '#2185c7',
                            weight: 2,
                            fillOpacity: 0.28
                        }
                    }).addTo(activeLahanGroup);
                });

                renderBaseReference();
                setDrawEnabled(true);
                updateMapStatus(`Lahan aktif: ${activeLahan.nama}. Polygon kebun harus tetap di dalam boundary lahan ini.`, 'success');
                restoreExistingPolygonIfNeeded();

                const focusGroup = L.featureGroup();
                activeLahanGroup.eachLayer(layer => focusGroup.addLayer(layer));
                drawnItems.eachLayer(layer => focusGroup.addLayer(layer));

                if (focusGroup.getLayers().length) {
                    map.fitBounds(focusGroup.getBounds(), { padding: [40, 40] });
                }
            }

            const legend = L.control({ position: 'bottomright' });
            legend.onAdd = function() {
                const div = L.DomUtil.create('div');
                div.className = 'bg-white/95 backdrop-blur border border-slate-200 rounded-2xl shadow-lg px-4 py-3 text-xs text-slate-700';
                div.innerHTML = `
                    <div class="font-semibold text-slate-800 mb-2">Legenda Peta</div>
                    <div class="flex items-center gap-2 mb-2">
                        <span style="width:12px;height:12px;border-radius:9999px;background:#2F6B3C;display:inline-block;"></span>
                        <span>Boundary lahan aktif</span>
                    </div>
                    <div class="flex items-center gap-2 mb-2">
                        <span style="width:12px;height:12px;border-radius:9999px;background:#2185c7;display:inline-block;"></span>
                        <span>Polygon kebun</span>
                    </div>
                    <div class="text-[11px] text-slate-500">Polygon kebun di luar batas lahan akan ditolak.</div>
                `;
                return div;
            };
            legend.addTo(map);

            lahanSelect.addEventListener('change', () => {
                renderActiveLahan(lahanSelect.value);
            });

            map.on(L.Draw.Event.CREATED, async function(event) {
                if (!activeLahanGeoJson) {
                    updateMapStatus('Pilih lahan sebelum menggambar polygon kebun.', 'danger');
                    return;
                }

                const layer = event.layer;
                layer.setStyle(getPolygonStyle());

                if (!polygonWithinActiveLahan(layer)) {
                    updateMapStatus('Polygon kebun berada di luar boundary lahan aktif.', 'danger');
                    Swal.fire({
                        icon: 'error',
                        title: 'Polygon tidak valid',
                        text: 'Polygon kebun harus berada di dalam area lahan yang dipilih.',
                    });
                    restoreExistingPolygonIfNeeded();
                    return;
                }

                drawnItems.clearLayers();
                drawnItems.addLayer(layer);
                currentPolygon = layer;
                await syncPolygonFields(layer);
                updateMapStatus('Polygon kebun valid dan berada di dalam boundary lahan.', 'success');
            });

            map.on(L.Draw.Event.EDITED, async function(event) {
                for (const layerId in event.layers._layers) {
                    const layer = event.layers._layers[layerId];
                    if (!polygonWithinActiveLahan(layer)) {
                        restoreExistingPolygonIfNeeded();
                        updateMapStatus('Perubahan dibatalkan karena polygon keluar dari boundary lahan.', 'danger');
                        Swal.fire({
                            icon: 'error',
                            title: 'Polygon tidak valid',
                            text: 'Polygon kebun harus tetap berada di dalam area lahan yang dipilih.',
                        });
                        return;
                    }

                    currentPolygon = layer;
                    await syncPolygonFields(layer);
                    updateMapStatus('Polygon kebun valid dan berada di dalam boundary lahan.', 'success');
                }
            });

            warnaInput.addEventListener('input', function() {
                if (!currentPolygon) return;
                currentPolygon.setStyle({ color: this.value, fillColor: this.value });
            });

            $(document).ready(function() {
                $('#jumlah_pohon, #jumlah_pohon_matang').on('input', function() {
                    const jumlahPohon = parseInt($('#jumlah_pohon').val()) || 0;
                    const jumlahPohonMatang = parseInt($('#jumlah_pohon_matang').val()) || 0;
                    $('#jumlah_pohon_belum_matang').val(jumlahPohon - jumlahPohonMatang);
                });
            });

            renderBaseReference();
            renderActiveLahan(selectedLahanId ?? lahanSelect.value);
            setTimeout(() => map.invalidateSize(), 200);
            window.addEventListener('resize', () => map.invalidateSize());
        </script>
    @endpush
</x-app-layout>
