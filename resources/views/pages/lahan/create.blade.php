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
                                <div class="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 border border-blue-100">
                                    <span class="w-3 h-3 rounded-full bg-[#2185c7]"></span>
                                    Polygon kebun
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
        @include('pages.partials.map-form-assets')
        <script>
            const helpers = window.MapFormHelpers;
            const lahanData = @json($lahan);
            const alamatInput = document.getElementById('alamat');
            const luasInput = document.getElementById('luas');
            const koordinatInput = document.getElementById('koordinat');
            const polygonInput = document.getElementById('polygon');
            const warnaInput = document.getElementById('warna');
            const {
                map,
                defaultCenter,
                defaultZoom
            } = helpers.createStandardMap();
            const referenceGroup = L.featureGroup().addTo(map);
            const drawnItems = new L.FeatureGroup().addTo(map);
            const updateAddress = helpers.createAddressUpdater(alamatInput);

            lahanData.forEach(lahan => {
                const lahanLayer = L.geoJSON(JSON.parse(lahan.polygon), {
                    interactive: false,
                    bubblingMouseEvents: false,
                    style: {
                        color: lahan.warna ?? '#2F6B3C',
                        weight: 2,
                        dashArray: '6,6',
                        fillOpacity: 0.1
                    }
                });

                referenceGroup.addLayer(lahanLayer);

                lahan.kebun.forEach(kebun => {
                    const kebunLayer = L.geoJSON(JSON.parse(kebun.polygon), {
                        interactive: false,
                        bubblingMouseEvents: false,
                        style: {
                            color: kebun.warna ?? '#2185c7',
                            weight: 2,
                            fillOpacity: 0.4
                        }
                    });

                    referenceGroup.addLayer(kebunLayer);
                });
            });

            helpers.fitMapToLayers(map, [referenceGroup], defaultCenter, defaultZoom);
            helpers.addLegend(map, {
                items: [{
                        color: '#2F6B3C',
                        label: 'Polygon lahan'
                    },
                    {
                        color: '#2185c7',
                        label: 'Polygon kebun'
                    }
                ],
                note: 'Gunakan draw polygon untuk menentukan area lahan.'
            });

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

            map.on(L.Draw.Event.CREATED, async function(event) {
                const layer = event.layer;
                layer.setStyle(helpers.getPolygonStyle(warnaInput.value));

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
            });

            map.on(L.Draw.Event.EDITED, async function(event) {
                for (const layerId in event.layers._layers) {
                    currentPolygon = event.layers._layers[layerId];
                    await helpers.syncPolygonFields({
                        layer: currentPolygon,
                        luasInput,
                        koordinatInput,
                        polygonInput,
                        updateAddress,
                    });
                }
            });

            map.on(L.Draw.Event.DELETED, function() {
                currentPolygon = null;
                helpers.clearPolygonFields({
                    luasInput,
                    koordinatInput,
                    polygonInput,
                    alamatInput,
                });
            });

            helpers.bindColorInput(warnaInput, () => currentPolygon);
            helpers.invalidateMapOnResize(map);
        </script>
    @endpush
</x-app-layout>
