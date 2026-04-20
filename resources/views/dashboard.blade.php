<x-app-layout>
    <div class="relative w-full bg-white overflow-hidden text-slate-800">
        
        <!-- Hero Section -->
        <section class="relative min-h-[60vh] flex items-center justify-center">
            <!-- Background Image -->
            <div class="absolute inset-0 z-0">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCx5wuGXtnP9piFc99hTY8V_-NYijS_aFz6W5dxR1oc8DCInJN695GTSYWWSbM7cHZ4JVDeweooE12gu7bQ-A961oXddYQqZqLURIEKW9ChW2QMn4o-XCTLBdNt2ph_Vw4MDkYKiWger5ETVPN_Rtf3KslWkLNuqkIC9bAOyv0eRpddV37OOHNxqELrjdaMY_CL8rMd9kQXsB5Y9AxzCLpp8u5cfrxZq8QrlThnJx7QCc38VkTEIMQ8xU6mtskq_TE_l-CVhses5jI" alt="Hero Background" class="w-full h-full object-cover filter brightness-[0.85]">
            </div>
            <!-- Gradient Overlay -->
            <div class="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-transparent z-10"></div>
            
            <div class="relative z-20 max-w-7xl mx-auto px-6 lg:px-8 w-full">
                <div class="max-w-2xl">
                    <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold tracking-wider uppercase backdrop-blur-md border border-blue-500/30 mb-6">
                        <i class="fa-solid fa-satellite-dish"></i> IPB University
                    </span>
                    <h1 class="text-4xl md:text-5xl lg:text-7xl font-extrabold text-white leading-tight mb-6 tracking-tight">
                        Pusat Kendali <span class="text-blue-400">Digital</span>
                    </h1>
                    <p class="text-lg md:text-xl text-slate-300 font-light leading-relaxed mb-10 max-w-xl">
                        Sistem cerdas pemantauan perkebunan kelapa sawit terintegrasi. Dilengkapi dengan telemetri drone langsung dan analisis kematangan AI.
                    </p>
                    <div class="flex flex-wrap gap-4">
                        <a href="{{ route('gcs.index') }}" class="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5">
                            <i class="fa-solid fa-plane-up"></i> Buka GCS
                        </a>
                        <a href="{{ route('laporan.index') }}" class="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md text-sm font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5">
                            <i class="fa-solid fa-brain"></i> Laporan AI
                        </a>
                    </div>
                </div>
            </div>
        </section>

        <!-- Features Section -->
        <section class="py-20 bg-slate-50 relative">
            <div class="max-w-7xl mx-auto px-6 lg:px-8">
                
                <div class="text-center max-w-2xl mx-auto mb-16">
                    <h2 class="text-3xl font-extrabold text-slate-800 tracking-tight">Modul Pintar</h2>
                    <div class="w-16 h-1.5 bg-blue-500 mx-auto rounded-full mt-4 mb-4"></div>
                    <p class="text-slate-500 text-sm md:text-base leading-relaxed">
                        Manfaatkan arsitektur sistem cerdas untuk memetakan, menganalisis, dan memonitor kondisi kebun secara komprehensif.
                    </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <!-- Card 1 -->
                    <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-100 transition-all group">
                        <div class="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <i class="fa-solid fa-crosshairs"></i>
                        </div>
                        <h3 class="text-xl font-bold text-slate-800 mb-3">Ground Control Station</h3>
                        <p class="text-slate-500 text-sm leading-relaxed mb-6">
                            Kendali penuh operasi drone secara real-time. Pantau rute, telemetri, GPS, dan status perangkat langsung di atas peta interaktif.
                        </p>
                        <a href="{{ route('gcs.index') }}" class="text-blue-600 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                            Luncurkan Aplikasi <i class="fa-solid fa-arrow-right"></i>
                        </a>
                    </div>

                    <!-- Card 2 -->
                    <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-green-100 transition-all group">
                        <div class="w-14 h-14 bg-green-50 text-green-600 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 group-hover:bg-green-600 group-hover:text-white transition-all">
                            <i class="fa-solid fa-microchip"></i>
                        </div>
                        <h3 class="text-xl font-bold text-slate-800 mb-3">Analisis Kematangan AI</h3>
                        <p class="text-slate-500 text-sm leading-relaxed mb-6">
                            Laporan prediksi algoritma AI untuk membedakan TBS matang dan mentah berdasarkan pemindaian citra udara kecepatan tinggi.
                        </p>
                        <a href="{{ route('laporan.index') }}" class="text-green-600 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                            Lihat Prediksi <i class="fa-solid fa-arrow-right"></i>
                        </a>
                    </div>

                    <!-- Card 3 -->
                    <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-orange-100 transition-all group">
                        <div class="w-14 h-14 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 group-hover:bg-orange-600 group-hover:text-white transition-all">
                            <i class="fa-solid fa-map-location-dot"></i>
                        </div>
                        <h3 class="text-xl font-bold text-slate-800 mb-3">Manajemen Lahan</h3>
                        <p class="text-slate-500 text-sm leading-relaxed mb-6">
                            Kelola titik poligon perkebunan, hitung luas aktual, dan integrasikan dengan profil pohon sawit dari waktu ke waktu.
                        </p>
                        <a href="{{ route('lahan.index') }}" class="text-orange-600 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                            Atur Data Master <i class="fa-solid fa-arrow-right"></i>
                        </a>
                    </div>
                </div>

            </div>
        </section>

    </div>
</x-app-layout>

{{-- =========================================================================

    OLD DASHBOARD CODE (HIDDEN/COMMENTED OUT AS PER REQUEST)

========================================================================= --}}
{{-- 
<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-lg text-gray-800 leading-tight">
            {{ __('Dashboard') }}
        </h2>
    </x-slot>

    <div class="pt-2 pb-12">
        <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex flex-col gap-4">
            <!-- Summary Data -->
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                <div class="bg-white px-4 py-3 rounded-lg shadow-sm flex items-center gap-5">
                    <i class="fa-solid fa-draw-polygon text-primary text-2xl"></i>
                    <div>
                        <p class="text-sm font-medium">Jumlah Lahan</p>
                        <span class="text-2xl font-bold">{{ $countLahan }}</span>
                    </div>
                </div>
                <div class="bg-white px-4 py-3 rounded-lg shadow-sm flex items-center gap-5">
                    <i class="fa-solid fa-table-cells text-primary text-2xl"></i>
                    <div>
                        <p class="text-sm font-medium">Jumlah Kebun</p>
                        <span class="text-2xl font-bold">{{ $countKebun }}</span>
                    </div>
                </div>
                <div class="bg-white px-4 py-3 rounded-lg shadow-sm flex items-center gap-5">
                    <i class="fa-solid fa-helicopter text-primary text-2xl"></i>
                    <div>
                        <p class="text-sm font-medium">Jumlah Perangkat</p>
                        <span class="text-2xl font-bold">{{ $countPerangkat }}</span>
                    </div>
                </div>
                <div class="bg-white px-4 py-3 rounded-lg shadow-sm flex items-center gap-5">
                    <i class="fa-solid fa-users text-primary text-2xl"></i>
                    <div>
                        <p class="text-sm font-medium">Jumlah User</p>
                        <span class="text-2xl font-bold">{{ $countUser }}</span>
                    </div>
                </div>
                <div class="bg-white px-4 py-3 rounded-lg shadow-sm">
                    <div class="flex items-center gap-5">
                        <i class="fa-solid fa-tree text-primary text-2xl"></i>
                        <div>
                            <p class="text-sm font-medium">Jumlah Pohon</p>
                            <span class="text-2xl font-bold">{{ $countPohon }}</span>
                        </div>
                    </div>
                    <div class="flex flex-col mt-3">
                        <span class="text-sm italic text-slate-700">*Matang: {{ $countPohonMatang }}</span>
                        <span class="text-sm italic text-slate-700">*Belum matang: {{ $countPohonBelumMatang }}</span>
                    </div>
                </div>
            </div>

            <!-- Map, Widget Cuaca, Legenda -->
            <div class="bg-white p-3 rounded-lg shadow-sm">
                <!-- Map & Widget Cuaca -->
                <div class="relative w-full h-[70vh]">
                    <!-- Map -->
                    <div id="map" class="w-full h-full z-0"></div>

                    <!-- Widget Cuaca -->
                    <div class="absolute top-4 right-4 z-10">
                        <div class="bg-white shadow-md rounded-xl p-4 w-60">
                            <h3 class="text-base font-semibold text-gray-700">Cuaca Terkini</h3>
                            <h3 class="text-xs text-gray-700 mb-2"><i
                                    class="fa-solid fa-location-dot text-primary me-1"></i>{{ ($cuaca->desa ?? '-') . ', ' . ($cuaca->kabupaten_kota ?? '-') . ', ' . ($cuaca->provinsi ?? '-') }}
                            </h3>
                            <h4 class="text-xs text-gray-700 mb-3">Terakhir diupdate:
                                <br>{{ $cuaca?->updated_at ? $cuaca?->updated_at->translatedFormat('d M Y H:i:s') : $cuaca?->created_at->translatedFormat('d M Y H:i:s') }}</h4>

                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-3xl font-bold text-gray-800">
                                        {{ $cuaca->temperature ?? '--' }}°C
                                    </p>
                                    <p class="text-xs text-gray-500">Suhu</p>
                                </div>
                                <div>
                                    @if (!empty($cuaca->image))
                                        <img src="{{ $cuaca->image }}" alt="Cuaca" class="w-12 h-12">
                                    @else
                                        <i class="fas fa-question-circle text-gray-400 text-4xl"></i>
                                    @endif
                                </div>
                            </div>

                            <div class="grid grid-cols-3 gap-2 mt-4 text-xs text-gray-600">
                                <div class="flex flex-col items-center justify-center gap-1">
                                    <i class="fas fa-wind text-gray-500"></i>
                                    <span>{{ $cuaca->wind_speed ?? '--' }} km/h</span>
                                </div>
                                <div class="flex flex-col items-center justify-center gap-1">
                                    <i class="fas fa-tint text-blue-500"></i>
                                    <span>{{ $cuaca->humidity ?? '--' }} %</span>
                                </div>
                                <div class="flex flex-col items-center justify-center gap-1">
                                    <i class="fas fa-cloud-rain text-blue-400"></i>
                                    <span>{{ $cuaca->rainfall ?? '--' }} mm</span>
                                </div>
                            </div>

                            <p class="text-xs text-center text-gray-500 mt-2">
                                {{ $cuaca->description ?? '' }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Legenda -->
                <div class="mt-4 border-t pt-3">
                    <div>
                        <p class="text-lg font-medium mb-3">Legenda</p>
                    </div>
                    <div class="flex items-center gap-6 text-sm">
                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-draw-polygon text-lg text-red-500"></i>
                            <span>Lahan</span>
                        </div>

                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-seedling text-lg text-yellow-500"></i>
                            <span>Kebun</span>
                        </div>

                    </div>
                </div>
            </div>

            <!-- Grafik Panen -->
            <div class="bg-white p-4 rounded-lg shadow-sm">
                <div class="mb-3">
                    <p class="text-2xl font-semibold">Grafik Capaian Panen</p>
                </div>
                <div id="chartPanen"></div>
            </div>

            <!-- Grafik Pohon -->
            <div class="bg-white p-4 rounded-lg shadow-sm">
                <div class="mb-3">
                    <p class="text-2xl font-semibold">Grafik Kematangan Pohon</p>
                </div>
                <div id="chartPohon"></div>
            </div>
        </div>
    </div>
    @push('scripts')
        <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
        <script>
            var map = L.map('map'); // init map

            L.tileLayer('https://www.google.cn/maps/vt?lyrs=s,h&x={x}&y={y}&z={z}', {
                attribution: '&copy; Google Hybrid',
                maxZoom: 18,
            }).addTo(map);

            // Custom marker lahan
            const lahanIcon = L.divIcon({
                className: '',
                html: `
                    <div class="text-red-500 text-xl drop-shadow-md">
                        <i class="fa-solid fa-draw-polygon"></i>
                    </div>
                `,
                iconSize: [24, 24],
                iconAnchor: [12, 24]
            });

            // Custom marker kebun
            const kebunIcon = L.divIcon({
                className: '',
                html: `
                    <div class="text-yellow-500 text-lg drop-shadow-md">
                        <i class="fa-solid fa-seedling"></i>
                    </div>
                `,
                iconSize: [20, 20],
                iconAnchor: [10, 20]
            });

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

                // marker lahan
                if (lahan.latitude && lahan.longitude) {
                    L.marker([lahan.latitude, lahan.longitude], {
                            icon: lahanIcon
                        })
                        .bindPopup(`<strong>${lahan.nama}</strong>`)
                        .addTo(map);
                }

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

                    // marker kebun
                    if (kebun.latitude && kebun.longitude) {
                        L.marker([kebun.latitude, kebun.longitude], {
                                icon: kebunIcon
                            })
                            .bindPopup(`<strong>${kebun.nama}</strong>`)
                            .addTo(map);
                    }
                });
            });

            // Auto center map berdasarkan semua layer / polygon
            if (group.getLayers().length) {
                map.fitBounds(group.getBounds(), {
                    padding: [40, 40]
                });
            }

            // Data kebun dari controller
            const kebunData = @json($kebun);

            // Mapping data untuk chart
            const label = kebunData.map(k => k.nama);
            const target = kebunData.map(k => Number(k.target ?? 0));
            const hasil = kebunData.map(k => Number(k.hasil ?? 0));
            const matang = kebunData.map(k => k.jumlah_pohon_matang);
            const belumMatang = kebunData.map(k => k.jumlah_pohon_belum_matang);

            // Chart Panen
            new ApexCharts(document.querySelector("#chartPanen"), {
                chart: {
                    type: 'bar',
                    height: 350,
                },
                series: [{
                        name: 'Target Panen',
                        data: target
                    },
                    {
                        name: 'Hasil Panen',
                        data: hasil
                    }
                ],
                plotOptions: {
                    bar: {
                        horizontal: false,
                        columnWidth: '45%',
                        borderRadius: 6 // biar rounded
                    }
                },
                colors: ['#94a3b8', '#2F6B3C'], // abu target, hijau hasil 
                dataLabels: {
                    enabled: false
                },
                stroke: {
                    show: true,
                    width: 2,
                    colors: ['transparent']
                },
                xaxis: {
                    categories: label,
                    labels: {
                        rotate: -30,
                    }
                },
                yaxis: {
                    title: {
                        text: 'Berat Panen (kg)'
                    }
                },
                tooltip: {
                    y: {
                        formatter: (val) => val.toLocaleString() + ' kg'
                    }
                },
                grid: {
                    borderColor: '#e5e7eb'
                }
            }).render();

            // Chart Pohon
            new ApexCharts(document.querySelector("#chartPohon"), {
                chart: {
                    type: 'bar',
                    height: 350,
                    stacked: true
                },
                series: [{
                    name: 'Matang',
                    data: matang,
                }, {
                    name: 'Belum Matang',
                    data: belumMatang
                }],
                xaxis: {
                    categories: label
                },
                yaxis: {
                    title: {
                        text: 'Jumlah Pohon',
                    }
                },
                colors: ['#16a34a', '#f59e0b'],
                tooltip: {
                    y: {
                        formatter: val => val.toLocaleString() + ' pohon',
                    }
                }
            }).render();
        </script>
    @endpush
</x-app-layout>
--}}
