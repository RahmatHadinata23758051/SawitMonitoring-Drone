<x-app-layout>
    <x-slot name="header">
        <h2 class="leading-tight">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">{{ __('Data Master') }}</li>
                <li class="breadcrumb-item"><a href="{{ route('kebun.index') }}">Data Kebun</a></li>
                <li class="breadcrumb-item breadcrumb-active">{{ __('Tambah Data') }}</li>
            </ol>
        </h2>
    </x-slot>

    <div class="pt-2 pb-12">
        <div class="max-w-[1500px] mx-auto px-3 sm:px-6 lg:px-8">
            <form action="{{ route('kebun.store') }}" method="post">
                @csrf
                <input type="hidden" name="polygon" id="polygon">

                <div class="grid grid-cols-1 xl:grid-cols-[minmax(0,1.65fr)_420px] gap-6 items-start">
                    <section class="bg-white shadow-sm rounded-2xl border border-slate-200 overflow-hidden">
                        <div class="px-6 py-5 border-b border-slate-200 bg-slate-50/80">
                            <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                    <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">Area Kerja</p>
                                    <h3 class="text-xl font-semibold text-slate-800 mt-1">Peta Kebun</h3>
                                    <p class="text-sm text-slate-500 mt-1">Pilih lahan terlebih dahulu. Area lahan aktif akan tampil di peta, lalu polygon kebun hanya valid jika berada di dalam boundary lahan itu.</p>
                                </div>
                                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                                    <div class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-600">
                                        <span class="font-semibold text-slate-800 block">Langkah 1</span>
                                        Pilih lahan
                                    </div>
                                    <div class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-600">
                                        <span class="font-semibold text-slate-800 block">Langkah 2</span>
                                        Gambar area kebun
                                    </div>
                                    <div class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-600">
                                        <span class="font-semibold text-slate-800 block">Langkah 3</span>
                                        Simpan data kebun
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
                                    Pilih lahan untuk mulai menggambar
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
                            <h3 class="text-xl font-semibold text-slate-800 mt-1">Tambah Data Kebun</h3>
                            <p class="text-sm text-slate-500 mt-1">Isi detail kebun di panel kanan. Nilai luas dan titik lokasi diisi otomatis dari polygon.</p>
                        </div>

                        <div class="px-6 py-5 space-y-5">
                            <div>
                                <x-input-label for="nama">{{ __('Nama Kebun') }}</x-input-label>
                                <x-text-input id="nama" class="block mt-1 w-full rounded-xl bg-gray-100"
                                    type="text" name="nama" :value="old('nama')" required autofocus autocomplete="nama" />
                                <x-input-error :messages="$errors->get('nama')" class="mt-2" />
                            </div>

                            <div>
                                <x-input-label for="lahan">{{ __('Lokasi Lahan') }}</x-input-label>
                                <select name="lahan" id="lahan" class="block mt-1 w-full rounded-xl bg-gray-100" required>
                                    <option value="">--- Pilih Lahan ---</option>
                                    @foreach ($lahan as $item)
                                        <option value="{{ $item->id }}" @selected(old('lahan') == $item->id)>{{ $item->nama }}</option>
                                    @endforeach
                                </select>
                                <x-input-error :messages="$errors->get('lahan')" class="mt-2" />
                            </div>

                            <div class="grid grid-cols-1 gap-5">
                                <div>
                                    <x-input-label for="luas">{{ __('Luas Kebun') }}</x-input-label>
                                    <x-text-input type="text" id="luas" name="luas" class="block mt-1 w-full rounded-xl bg-gray-100" readonly />
                                    <p class="mt-2 text-xs text-slate-500">Satuan hektar, dihitung dari polygon yang digambar.</p>
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
                                    <p class="mt-2 text-xs text-slate-500">Diambil otomatis dari titik tengah polygon melalui reverse geocoding.</p>
                                    <x-input-error :messages="$errors->get('alamat')" class="mt-2" />
                                </div>

                                <div>
                                    <x-input-label for="jumlah_pohon">{{ __('Jumlah Pohon') }}</x-input-label>
                                    <x-text-input id="jumlah_pohon" class="block mt-1 w-full rounded-xl bg-gray-100"
                                        type="number" name="jumlah_pohon" :value="old('jumlah_pohon', 0)" min="0" step="1"
                                        required autofocus autocomplete="jumlah_pohon" />
                                    <x-input-error :messages="$errors->get('jumlah_pohon')" class="mt-2" />
                                </div>

                                <div>
                                    <x-input-label for="jumlah_pohon_matang">{{ __('Jumlah Pohon Matang') }}</x-input-label>
                                    <x-text-input id="jumlah_pohon_matang" class="block mt-1 w-full rounded-xl bg-gray-100"
                                        type="number" name="jumlah_pohon_matang" :value="old('jumlah_pohon_matang', 0)"
                                        min="0" step="1" required autofocus autocomplete="jumlah_pohon_matang" />
                                    <x-input-error :messages="$errors->get('jumlah_pohon_matang')" class="mt-2" />
                                </div>

                                <div>
                                    <x-input-label for="jumlah_pohon_belum_matang">{{ __('Jumlah Pohon Belum Matang') }}</x-input-label>
                                    <x-text-input id="jumlah_pohon_belum_matang" class="block mt-1 w-full rounded-xl bg-gray-100" type="number"
                                        name="jumlah_pohon_belum_matang" :value="old('jumlah_pohon_belum_matang', 0)"
                                        min="0" step="1" required readonly />
                                    <x-input-error :messages="$errors->get('jumlah_pohon_belum_matang')" class="mt-2" />
                                </div>

                                <div>
                                    <x-input-label for="warna">{{ __('Warna Polygon') }}</x-input-label>
                                    <div class="mt-1 flex items-center gap-3 rounded-xl bg-gray-100 px-3 py-2">
                                        <x-text-input id="warna" class="h-11 w-16 rounded-lg border-0 bg-transparent p-0"
                                            type="color" name="warna" :value="old('warna', '#2185c7')" required />
                                        <div class="text-sm text-slate-500">
                                            Gunakan warna pembeda untuk memudahkan identifikasi kebun pada peta.
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
        @include('pages.partials.map-form-assets')
        <script>
            const helpers = window.MapFormHelpers;
            const lahanData = @json($lahan);
            const selectedLahanId = @json(old('lahan'));
            const mapStatusBadge = document.getElementById('map-status-badge');
            const polygonInput = document.getElementById('polygon');
            const luasInput = document.getElementById('luas');
            const koordinatInput = document.getElementById('koordinat');
            const alamatInput = document.getElementById('alamat');
            const lahanSelect = document.getElementById('lahan');
            const warnaInput = document.getElementById('warna');
            const jumlahPohonInput = document.getElementById('jumlah_pohon');
            const jumlahPohonMatangInput = document.getElementById('jumlah_pohon_matang');
            const jumlahPohonBelumMatangInput = document.getElementById('jumlah_pohon_belum_matang');
            const {
                map,
                defaultCenter,
                defaultZoom
            } = helpers.createStandardMap();
            const updateMapStatus = helpers.createStatusBadgeUpdater(mapStatusBadge);
            const updateAddress = helpers.createAddressUpdater(alamatInput);

            const lahanById = Object.fromEntries(lahanData.map(item => [String(item.id), item]));
            const baseGroup = L.featureGroup().addTo(map);
            const activeLahanGroup = L.featureGroup().addTo(map);
            const drawnItems = new L.FeatureGroup().addTo(map);

            const drawControl = new L.Control.Draw({
                edit: { featureGroup: drawnItems },
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
            let activeLahan = null;
            let activeLahanGeoJson = null;

            function setDrawEnabled(enabled) {
                helpers.setDrawEnabled(drawControl, enabled);
            }

            function clearKebunPolygon() {
                drawnItems.clearLayers();
                currentPolygon = null;
                helpers.clearPolygonFields({
                    luasInput,
                    koordinatInput,
                    polygonInput,
                    alamatInput,
                });
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

            function renderActiveLahan(lahanId) {
                activeLahanGroup.clearLayers();
                activeLahanGeoJson = null;
                activeLahan = lahanById[String(lahanId)] ?? null;
                clearKebunPolygon();

                if (!activeLahan) {
                    renderBaseReference();
                    setDrawEnabled(false);
                    updateMapStatus('Pilih lahan untuk mulai menggambar', 'warning');
                    if (baseGroup.getLayers().length) {
                        map.fitBounds(baseGroup.getBounds(), { padding: [40, 40] });
                    } else {
                        map.setView(defaultCenter, defaultZoom);
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
                map.fitBounds(activeLahanGroup.getBounds(), { padding: [40, 40] });
            }

            lahanSelect.addEventListener('change', () => renderActiveLahan(lahanSelect.value));

            map.on(L.Draw.Event.DRAWSTART, function(event) {
                if (event.layerType !== 'polygon' || activeLahanGeoJson) {
                    return;
                }

                updateMapStatus('Pilih lahan sebelum menggambar polygon kebun.', 'danger');
                Swal.fire({
                    icon: 'warning',
                    title: 'Pilih lahan dahulu',
                    text: 'Pilih lahan terlebih dahulu sebelum menggambar polygon kebun.',
                });

                setTimeout(() => {
                    const polygonHandler = drawControl?._toolbars?.draw?._modes?.polygon?.handler;
                    if (polygonHandler?.enabled && polygonHandler.enabled()) {
                        polygonHandler.disable();
                    }
                }, 0);
            });

            map.on(L.Draw.Event.CREATED, async function(event) {
                if (!activeLahanGeoJson) {
                    updateMapStatus('Pilih lahan sebelum menggambar polygon kebun.', 'danger');
                    return;
                }

                const layer = event.layer;
                layer.setStyle(helpers.getPolygonStyle(warnaInput.value));

                if (!polygonWithinActiveLahan(layer)) {
                    updateMapStatus('Polygon kebun berada di luar boundary lahan aktif.', 'danger');
                    Swal.fire({
                        icon: 'error',
                        title: 'Polygon tidak valid',
                        text: 'Polygon kebun harus berada di dalam area lahan yang dipilih.',
                    });
                    return;
                }

                drawnItems.clearLayers();
                drawnItems.addLayer(layer);
                currentPolygon = layer;
                await helpers.syncPolygonFields({
                    layer,
                    luasInput,
                    koordinatInput,
                    polygonInput,
                    updateAddress,
                });
                updateMapStatus('Polygon kebun valid dan berada di dalam boundary lahan.', 'success');
            });

            map.on(L.Draw.Event.EDITED, async function(event) {
                for (const layerId in event.layers._layers) {
                    const layer = event.layers._layers[layerId];
                    if (!polygonWithinActiveLahan(layer)) {
                        drawnItems.clearLayers();
                        currentPolygon = null;
                        updateMapStatus('Perubahan dibatalkan karena polygon keluar dari boundary lahan.', 'danger');
                        Swal.fire({
                            icon: 'error',
                            title: 'Polygon tidak valid',
                            text: 'Polygon kebun harus tetap berada di dalam area lahan yang dipilih.',
                        });
                        helpers.clearPolygonFields({
                            luasInput,
                            koordinatInput,
                            polygonInput,
                            alamatInput,
                        });
                        return;
                    }

                    currentPolygon = layer;
                    await helpers.syncPolygonFields({
                        layer,
                        luasInput,
                        koordinatInput,
                        polygonInput,
                        updateAddress,
                    });
                    updateMapStatus('Polygon kebun valid dan berada di dalam boundary lahan.', 'success');
                }
            });

            helpers.bindColorInput(warnaInput, () => currentPolygon);
            helpers.attachTreeCountSync(jumlahPohonInput, jumlahPohonMatangInput, jumlahPohonBelumMatangInput);

            helpers.addLegend(map, {
                items: [{
                        color: '#2F6B3C',
                        label: 'Boundary lahan aktif'
                    },
                    {
                        color: '#2185c7',
                        label: 'Polygon kebun'
                    }
                ],
                note: 'Polygon kebun di luar batas lahan akan ditolak.'
            });

            renderBaseReference();
            renderActiveLahan(selectedLahanId ?? lahanSelect.value);
            helpers.invalidateMapOnResize(map);
        </script>
    @endpush
</x-app-layout>
