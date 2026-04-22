<x-app-layout>
    <div class="relative w-full bg-white overflow-hidden text-slate-800">

        <!-- Hero Section -->
        <section class="relative min-h-[55vh] flex items-center justify-center">
            <div class="absolute inset-0 z-0">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCx5wuGXtnP9piFc99hTY8V_-NYijS_aFz6W5dxR1oc8DCInJN695GTSYWWSbM7cHZ4JVDeweooE12gu7bQ-A961oXddYQqZqLURIEKW9ChW2QMn4o-XCTLBdNt2ph_Vw4MDkYKiWger5ETVPN_Rtf3KslWkLNuqkIC9bAOyv0eRpddV37OOHNxqELrjdaMY_CL8rMd9kQXsB5Y9AxzCLpp8u5cfrxZq8QrlThnJx7QCc38VkTEIMQ8xU6mtskq_TE_l-CVhses5jI" alt="Hero Background" class="w-full h-full object-cover filter brightness-[0.85]">
            </div>
            <div class="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-transparent z-10"></div>
            <div class="relative z-20 max-w-7xl mx-auto px-6 lg:px-8 w-full">
                <div class="max-w-2xl">
                    <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold tracking-wider uppercase backdrop-blur-md border border-blue-500/30 mb-6">
                        <i class="fa-solid fa-satellite-dish"></i> IPB University
                    </span>
                    <h1 class="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5 tracking-tight">
                        Pusat Kendali <span class="text-blue-400">Digital</span>
                    </h1>
                    <p class="text-lg text-slate-300 font-light leading-relaxed mb-8 max-w-xl">
                        Sistem cerdas pemantauan perkebunan kelapa sawit terintegrasi. Dilengkapi dengan telemetri drone langsung dan analisis kematangan AI.
                    </p>
                    <div class="flex flex-wrap gap-4">
                        <a href="{{ route('gcs.index') }}" class="px-7 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 hover:-translate-y-0.5 transform">
                            <i class="fa-solid fa-plane-up"></i> Buka GCS
                        </a>
                        <a href="{{ route('laporan.log-penerbangan') }}" class="px-7 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md text-sm font-bold rounded-xl transition-all flex items-center gap-2 hover:-translate-y-0.5 transform">
                            <i class="fa-solid fa-scroll"></i> Log Penerbangan
                        </a>
                    </div>
                </div>
            </div>
        </section>

        <!-- ===== STATS OVERVIEW SECTION ===== -->
        <section class="bg-white border-b border-slate-100 py-10">
            <div class="max-w-7xl mx-auto px-6 lg:px-8">
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">

                    {{-- Lahan --}}
                    <a href="{{ route('lahan.index') }}" class="group bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-2xl p-5 flex flex-col items-center text-center transition-all hover:shadow-md">
                        <div class="w-11 h-11 bg-blue-100 group-hover:bg-blue-600 text-blue-600 group-hover:text-white rounded-xl flex items-center justify-center text-lg transition-all mb-3">
                            <i class="fa-solid fa-draw-polygon"></i>
                        </div>
                        <p class="text-2xl font-black text-slate-800">{{ $countLahan }}</p>
                        <p class="text-xs text-slate-500 font-medium mt-0.5">Lahan</p>
                    </a>

                    {{-- Kebun --}}
                    <a href="{{ route('kebun.index') }}" class="group bg-slate-50 hover:bg-green-50 border border-slate-200 hover:border-green-300 rounded-2xl p-5 flex flex-col items-center text-center transition-all hover:shadow-md">
                        <div class="w-11 h-11 bg-green-100 group-hover:bg-green-600 text-green-600 group-hover:text-white rounded-xl flex items-center justify-center text-lg transition-all mb-3">
                            <i class="fa-solid fa-table-cells"></i>
                        </div>
                        <p class="text-2xl font-black text-slate-800">{{ $countKebun }}</p>
                        <p class="text-xs text-slate-500 font-medium mt-0.5">Kebun</p>
                    </a>

                    {{-- Perangkat --}}
                    <a href="{{ route('perangkat.index') }}" class="group bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 flex flex-col items-center text-center transition-all hover:shadow-md">
                        <div class="w-11 h-11 bg-indigo-100 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white rounded-xl flex items-center justify-center text-lg transition-all mb-3">
                            <i class="fa-solid fa-helicopter"></i>
                        </div>
                        <p class="text-2xl font-black text-slate-800">{{ $countPerangkat }}</p>
                        <p class="text-xs text-slate-500 font-medium mt-0.5">Drone</p>
                    </a>

                    {{-- Total Misi --}}
                    <a href="{{ route('gcs.index') }}" class="group bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-300 rounded-2xl p-5 flex flex-col items-center text-center transition-all hover:shadow-md">
                        <div class="w-11 h-11 bg-cyan-100 group-hover:bg-cyan-600 text-cyan-600 group-hover:text-white rounded-xl flex items-center justify-center text-lg transition-all mb-3">
                            <i class="fa-solid fa-crosshairs"></i>
                        </div>
                        <p class="text-2xl font-black text-slate-800">{{ $countMissions }}</p>
                        <p class="text-xs text-slate-500 font-medium mt-0.5">Misi GCS</p>
                    </a>

                    {{-- Flight Logs --}}
                    <a href="{{ route('laporan.log-penerbangan') }}" class="group bg-slate-50 hover:bg-violet-50 border border-slate-200 hover:border-violet-300 rounded-2xl p-5 flex flex-col items-center text-center transition-all hover:shadow-md">
                        <div class="w-11 h-11 bg-violet-100 group-hover:bg-violet-600 text-violet-600 group-hover:text-white rounded-xl flex items-center justify-center text-lg transition-all mb-3">
                            <i class="fa-solid fa-plane-departure"></i>
                        </div>
                        <p class="text-2xl font-black text-slate-800">{{ $countFlightLogs }}</p>
                        <p class="text-xs text-slate-500 font-medium mt-0.5">Penerbangan</p>
                    </a>

                    {{-- Akurasi AI --}}
                    <div class="group bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col items-center text-center">
                        <div class="w-11 h-11 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center text-lg mb-3">
                            <i class="fa-solid fa-brain"></i>
                        </div>
                        <p class="text-2xl font-black text-slate-800">
                            {{ $avgAccuracy > 0 ? number_format($avgAccuracy, 1) . '%' : '--' }}
                        </p>
                        <p class="text-xs text-slate-500 font-medium mt-0.5">Avg. Akurasi AI</p>
                    </div>

                </div>
            </div>
        </section>

        <!-- ===== MAIN DASHBOARD CONTENT ===== -->
        <section class="py-12 bg-slate-50">
            <div class="max-w-7xl mx-auto px-6 lg:px-8">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {{-- ===== KOLOM KIRI: Statistik Penerbangan + Terbaru ===== --}}
                    <div class="lg:col-span-2 flex flex-col gap-6">

                        {{-- Flight Scan Summary --}}
                        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                            @php
                                $latestFlightUpdate = $recentFlights->first()?->created_at?->timezone('Asia/Jakarta');
                            @endphp
                            <div class="flex items-center justify-between mb-5">
                                <div>
                                    <h2 class="text-lg font-bold text-slate-800">Ringkasan Pemindaian</h2>
                                    <p class="text-xs text-slate-400 mt-0.5">Akumulasi hasil scan dari semua penerbangan</p>
                                    <div class="mt-2">
                                        @if($latestFlightUpdate)
                                            <span class="inline-flex items-center gap-2 rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-[11px] font-medium text-slate-600">
                                                <i class="fa-solid fa-clock-rotate-left text-blue-500"></i>
                                                Update terakhir: {{ $latestFlightUpdate->translatedFormat('d M Y, H:i') }} WIB
                                            </span>
                                        @else
                                            <span class="inline-flex items-center gap-2 rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-[11px] font-medium text-slate-500">
                                                <i class="fa-solid fa-clock text-slate-400"></i>
                                                Belum ada update scan
                                            </span>
                                        @endif
                                    </div>
                                </div>
                                <a href="{{ route('laporan.log-penerbangan') }}" class="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1">
                                    Lihat semua <i class="fa-solid fa-arrow-right text-[10px]"></i>
                                </a>
                            </div>
                            <div class="grid grid-cols-3 gap-4">
                                <div class="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                                    <p class="text-3xl font-black text-slate-800">{{ number_format($totalSampel) }}</p>
                                    <p class="text-xs text-slate-500 font-medium mt-1">Total Sampel</p>
                                </div>
                                <div class="bg-green-50 rounded-xl p-4 text-center border border-green-100">
                                    <p class="text-3xl font-black text-green-700">{{ number_format($totalMatang) }}</p>
                                    <p class="text-xs text-green-600 font-medium mt-1">Matang</p>
                                </div>
                                <div class="bg-amber-50 rounded-xl p-4 text-center border border-amber-100">
                                    <p class="text-3xl font-black text-amber-700">{{ number_format($totalBelum) }}</p>
                                    <p class="text-xs text-amber-600 font-medium mt-1">Belum Matang</p>
                                </div>
                            </div>

                            {{-- Matang Progress Bar --}}
                            @if($totalSampel > 0)
                            <div class="mt-5">
                                @php
                                    $matangPct = round(($totalMatang / $totalSampel) * 100, 1);
                                    $belumPct  = round(100 - $matangPct, 1);
                                @endphp
                                <div class="flex justify-between text-xs text-slate-500 mb-1.5">
                                    <span>Tingkat Kematangan</span>
                                    <span class="font-semibold text-green-600">{{ $matangPct }}% Matang</span>
                                </div>
                                <div class="h-3 bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
                                    <div class="h-full bg-green-500 rounded-full transition-all" style="width:{{ $matangPct }}%"></div>
                                    <div class="h-full bg-amber-400 rounded-full transition-all" style="width:{{ $belumPct }}%"></div>
                                </div>
                                <div class="flex gap-4 mt-2">
                                    <span class="flex items-center gap-1 text-xs text-slate-500"><span class="w-2.5 h-2.5 bg-green-500 rounded-full inline-block"></span>Matang {{ $matangPct }}%</span>
                                    <span class="flex items-center gap-1 text-xs text-slate-500"><span class="w-2.5 h-2.5 bg-amber-400 rounded-full inline-block"></span>Belum {{ $belumPct }}%</span>
                                </div>
                            </div>
                            @else
                            <div class="mt-5 flex flex-col items-center justify-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <i class="fa-solid fa-plane-circle-xmark text-slate-300 text-3xl mb-2"></i>
                                <p class="text-sm text-slate-400">Belum ada data penerbangan.</p>
                                <a href="{{ route('gcs.index') }}" class="mt-2 text-xs text-blue-600 font-semibold hover:underline">Mulai misi dari GCS →</a>
                            </div>
                            @endif
                        </div>

                        {{-- Recent Flights --}}
                        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                            <div class="flex items-center justify-between mb-5">
                                <div>
                                    <h2 class="text-lg font-bold text-slate-800">Penerbangan Terbaru</h2>
                                    <p class="text-xs text-slate-400 mt-0.5">5 log terakhir dari database</p>
                                </div>
                                <a href="{{ route('laporan.log-penerbangan') }}" class="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1">
                                    Lihat semua <i class="fa-solid fa-arrow-right text-[10px]"></i>
                                </a>
                            </div>
                            @if($recentFlights->isEmpty())
                            <div class="flex flex-col items-center justify-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <i class="fa-solid fa-inbox text-slate-300 text-3xl mb-2"></i>
                                <p class="text-sm text-slate-400">Belum ada log penerbangan tersimpan.</p>
                                <a href="{{ route('gcs.index') }}" class="mt-2 text-xs text-blue-600 font-semibold hover:underline">Jalankan misi pertama →</a>
                            </div>
                            @else
                            <div class="overflow-x-auto">
                                <table class="w-full text-sm">
                                    <thead>
                                        <tr class="border-b border-slate-100">
                                            <th class="text-left text-xs text-slate-400 font-semibold pb-3 pr-4">Nama Misi</th>
                                            <th class="text-left text-xs text-slate-400 font-semibold pb-3 pr-4">Mode</th>
                                            <th class="text-right text-xs text-slate-400 font-semibold pb-3 pr-4">Sampel</th>
                                            <th class="text-right text-xs text-slate-400 font-semibold pb-3">Akurasi</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-slate-50">
                                        @foreach($recentFlights as $fl)
                                        <tr class="hover:bg-slate-50 transition-colors">
                                            <td class="py-2.5 pr-4">
                                                <p class="font-semibold text-slate-700 truncate max-w-[140px]">{{ $fl->mission_name }}</p>
                                                <p class="text-[10px] text-slate-400">{{ $fl->created_at->format('d M Y, H:i') }}</p>
                                            </td>
                                            <td class="py-2.5 pr-4">
                                                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold
                                                    {{ $fl->scan_mode === 'qlv' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600' }}">
                                                    {{ strtoupper($fl->scan_mode ?? '-') }}
                                                </span>
                                            </td>
                                            <td class="py-2.5 pr-4 text-right font-bold text-slate-700">{{ $fl->samples_count }}</td>
                                            <td class="py-2.5 text-right">
                                                <span class="font-bold {{ $fl->accuracy >= 90 ? 'text-green-600' : 'text-amber-600' }}">
                                                    {{ number_format($fl->accuracy, 1) }}%
                                                </span>
                                            </td>
                                        </tr>
                                        @endforeach
                                    </tbody>
                                </table>
                            </div>
                            @endif
                        </div>
                    </div>

                    {{-- ===== KOLOM KANAN: Cuaca + Data Master ===== --}}
                    <div class="flex flex-col gap-6">

                        {{-- Widget Cuaca --}}
                        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                            <h2 class="text-lg font-bold text-slate-800 mb-4">Cuaca Terkini</h2>
                            @if($cuaca)
                            <div class="flex items-center justify-between mb-4">
                                <div>
                                    <p class="text-4xl font-black text-slate-800">{{ $cuaca->temperature ?? '--' }}<span class="text-xl font-normal">°C</span></p>
                                    <p class="text-xs text-slate-500 mt-1 flex items-center gap-1"><i class="fa-solid fa-location-dot text-blue-500"></i>
                                        {{ ($cuaca->desa ?? '') . ', ' . ($cuaca->kabupaten_kota ?? '-') }}
                                    </p>
                                    <p class="text-xs text-slate-400 mt-0.5">{{ $cuaca->description ?? '' }}</p>
                                </div>
                                <div>
                                    @if(!empty($cuaca->image))
                                        <img src="{{ $cuaca->image }}" alt="Cuaca" class="w-14 h-14 object-contain">
                                    @else
                                        <i class="fas fa-cloud text-slate-300 text-4xl"></i>
                                    @endif
                                </div>
                            </div>
                            <div class="grid grid-cols-3 gap-3 text-center border-t border-slate-100 pt-4">
                                <div>
                                    <i class="fa-solid fa-wind text-slate-400 text-sm"></i>
                                    <p class="text-sm font-bold text-slate-700 mt-1">{{ $cuaca->wind_speed ?? '--' }}</p>
                                    <p class="text-[10px] text-slate-400">km/h</p>
                                </div>
                                <div>
                                    <i class="fa-solid fa-droplet text-blue-400 text-sm"></i>
                                    <p class="text-sm font-bold text-slate-700 mt-1">{{ $cuaca->humidity ?? '--' }}</p>
                                    <p class="text-[10px] text-slate-400">Kelembaban %</p>
                                </div>
                                <div>
                                    <i class="fa-solid fa-cloud-rain text-blue-300 text-sm"></i>
                                    <p class="text-sm font-bold text-slate-700 mt-1">{{ $cuaca->rainfall ?? '--' }}</p>
                                    <p class="text-[10px] text-slate-400">mm</p>
                                </div>
                            </div>
                            @else
                            <div class="flex flex-col items-center justify-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <i class="fa-solid fa-cloud-question text-slate-300 text-3xl mb-2"></i>
                                <p class="text-sm text-slate-400 text-center">Data cuaca belum disetup.</p>
                                <a href="{{ route('cuaca.index') }}" class="mt-2 text-xs text-blue-600 font-semibold hover:underline">Setup Cuaca →</a>
                            </div>
                            @endif
                        </div>

                        {{-- Data Master Summary --}}
                        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                            <h2 class="text-lg font-bold text-slate-800 mb-1">Inventaris & Rekap Scan</h2>
                            <p class="text-xs text-slate-400 mb-4">Inventaris pohon master dan hasil scan AI menggunakan sumber data terpisah yang sudah diselaraskan.</p>
                            <div class="space-y-3">
                                <div class="flex items-center justify-between py-2 border-b border-slate-50">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 text-xs">
                                            <i class="fa-solid fa-tree"></i>
                                        </div>
                                        <p class="text-sm text-slate-600">Total Pohon Master</p>
                                    </div>
                                    <p class="font-bold text-slate-800">{{ number_format($countPohon) }}</p>
                                </div>
                                <div class="flex items-center justify-between py-2 border-b border-slate-50">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600 text-xs">
                                            <i class="fa-solid fa-check"></i>
                                        </div>
                                        <p class="text-sm text-slate-600">Hasil Scan Matang</p>
                                    </div>
                                    <p class="font-bold text-green-600">{{ number_format($countPohonMatang) }}</p>
                                </div>
                                <div class="flex items-center justify-between py-2 border-b border-slate-50">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 text-xs">
                                            <i class="fa-solid fa-clock"></i>
                                        </div>
                                        <p class="text-sm text-slate-600">Hasil Scan Belum Matang</p>
                                    </div>
                                    <p class="font-bold text-amber-600">{{ number_format($countPohonBelumMatang) }}</p>
                                </div>
                                <div class="flex items-center justify-between py-2">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-xs">
                                            <i class="fa-solid fa-users"></i>
                                        </div>
                                        <p class="text-sm text-slate-600">Total User</p>
                                    </div>
                                    <p class="font-bold text-slate-800">{{ $countUser }}</p>
                                </div>
                            </div>
                        </div>

                        {{-- Quick Actions --}}
                        <div class="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-600/20">
                            <h2 class="text-base font-bold mb-1">Aksi Cepat</h2>
                            <p class="text-blue-200 text-xs mb-5">Navigasi langsung ke fitur utama</p>
                            <div class="grid grid-cols-2 gap-3">
                                <a href="{{ route('gcs.index') }}" class="bg-white/10 hover:bg-white/20 rounded-xl p-3 text-center transition-all">
                                    <i class="fa-solid fa-plane-up text-lg mb-1 block"></i>
                                    <p class="text-xs font-semibold">Buka GCS</p>
                                </a>
                                <a href="{{ route('laporan.log-penerbangan') }}" class="bg-white/10 hover:bg-white/20 rounded-xl p-3 text-center transition-all">
                                    <i class="fa-solid fa-scroll text-lg mb-1 block"></i>
                                    <p class="text-xs font-semibold">Log Terbang</p>
                                </a>
                                <a href="{{ route('kebun.index') }}" class="bg-white/10 hover:bg-white/20 rounded-xl p-3 text-center transition-all">
                                    <i class="fa-solid fa-seedling text-lg mb-1 block"></i>
                                    <p class="text-xs font-semibold">Data Kebun</p>
                                </a>
                                <a href="{{ route('laporan.index') }}" class="bg-white/10 hover:bg-white/20 rounded-xl p-3 text-center transition-all">
                                    <i class="fa-solid fa-brain text-lg mb-1 block"></i>
                                    <p class="text-xs font-semibold">Laporan AI</p>
                                </a>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>

        <!-- ===== MODUL PINTAR SECTION ===== -->
        <section class="py-16 bg-white border-t border-slate-100">
            <div class="max-w-7xl mx-auto px-6 lg:px-8">
                <div class="text-center max-w-2xl mx-auto mb-12">
                    <h2 class="text-3xl font-extrabold text-slate-800 tracking-tight">Modul Pintar</h2>
                    <div class="w-16 h-1.5 bg-blue-500 mx-auto rounded-full mt-4 mb-4"></div>
                    <p class="text-slate-500 text-sm md:text-base leading-relaxed">
                        Manfaatkan arsitektur sistem cerdas untuk memetakan, menganalisis, dan memonitor kondisi kebun secara komprehensif.
                    </p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div class="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-xl hover:border-blue-100 transition-all group">
                        <div class="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <i class="fa-solid fa-crosshairs"></i>
                        </div>
                        <h3 class="text-xl font-bold text-slate-800 mb-3">Ground Control Station</h3>
                        <p class="text-slate-500 text-sm leading-relaxed mb-6">Kendali penuh operasi drone secara real-time. Pantau rute, telemetri, GPS, dan status perangkat langsung dari GCS.</p>
                        <a href="{{ route('gcs.index') }}" class="text-blue-600 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                            Luncurkan Aplikasi <i class="fa-solid fa-arrow-right"></i>
                        </a>
                    </div>
                    <div class="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-xl hover:border-green-100 transition-all group">
                        <div class="w-14 h-14 bg-green-50 text-green-600 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 group-hover:bg-green-600 group-hover:text-white transition-all">
                            <i class="fa-solid fa-microchip"></i>
                        </div>
                        <h3 class="text-xl font-bold text-slate-800 mb-3">Analisis Kematangan AI</h3>
                        <p class="text-slate-500 text-sm leading-relaxed mb-6">Laporan prediksi algoritma AI untuk membedakan TBS matang dan mentah berdasarkan pemindaian citra udara kecepatan tinggi.</p>
                        <a href="{{ route('laporan.index') }}" class="text-green-600 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                            Lihat Prediksi <i class="fa-solid fa-arrow-right"></i>
                        </a>
                    </div>
                    <div class="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-xl hover:border-orange-100 transition-all group">
                        <div class="w-14 h-14 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 group-hover:bg-orange-600 group-hover:text-white transition-all">
                            <i class="fa-solid fa-map-location-dot"></i>
                        </div>
                        <h3 class="text-xl font-bold text-slate-800 mb-3">Manajemen Lahan</h3>
                        <p class="text-slate-500 text-sm leading-relaxed mb-6">Kelola titik poligon perkebunan, hitung luas aktual, dan integrasikan dengan profil pohon sawit dari waktu ke waktu.</p>
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
