<x-app-layout>
    <x-slot name="header">
        <h2 class="leading-tight">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">Laporan</li>
                <li class="breadcrumb-item breadcrumb-active">Prediksi Kematangan AI</li>
            </ol>
        </h2>
    </x-slot>

    <div class="pt-4 pb-12">
        <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-10 flex flex-col gap-6">

            @if($laporan->isEmpty())
                {{-- ===== STATUS BANNER ===== --}}
                <div class="bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-sm flex items-start gap-4">
                    <div class="bg-amber-100/50 text-amber-600 rounded-lg p-3 shrink-0">
                        <i class="fa-solid fa-server text-xl"></i>
                    </div>
                    <div class="flex-1">
                        <h3 class="text-amber-800 font-bold text-base mb-1">Server AI Belum Terhubung</h3>
                        <p class="text-amber-700/80 text-sm leading-relaxed mb-3">
                            Belum ada data prediksi per-pohon. FastAPI AI Server (port 8001) kemungkinan belum berjalan.
                            Di bawah ditampilkan ringkasan hasil scan dari Log Penerbangan sebagai <strong>data sementara</strong>.
                        </p>
                        <div class="flex flex-wrap gap-3">
                            <a href="{{ route('gcs.index') }}" class="inline-flex items-center gap-2 text-xs font-semibold bg-white border border-amber-200 text-amber-700 px-3 py-1.5 rounded-lg shadow-sm hover:bg-amber-50 transition">
                                <i class="fa-solid fa-plane-up"></i> Jalankan Misi Drone (GCS)
                            </a>
                            <a href="{{ route('laporan.log-penerbangan') }}" class="inline-flex items-center gap-2 text-xs font-semibold bg-white border border-amber-200 text-amber-700 px-3 py-1.5 rounded-lg shadow-sm hover:bg-amber-50 transition">
                                <i class="fa-solid fa-scroll"></i> Lihat Log Penerbangan
                            </a>
                        </div>
                    </div>
                </div>

                @if($flightLogs->isNotEmpty())
                    @php
                        $totalSampel = (int) ($flightLogSummary->total_sampel ?? 0);
                        $totalMatang = (int) ($flightLogSummary->total_matang ?? 0);
                        $totalBelum  = (int) ($flightLogSummary->total_belum ?? 0);
                        $avgAcc      = (float) ($flightLogSummary->avg_accuracy ?? 0);
                        $matangPct   = $totalSampel > 0 ? round(($totalMatang / $totalSampel) * 100, 1) : 0;
                        $belumPct    = round(100 - $matangPct, 1);
                    @endphp

                    {{-- ===== STATS CARDS ===== --}}
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="bg-white border border-slate-100 rounded-xl p-5 shadow-sm text-center">
                            <p class="text-3xl font-black text-slate-800">{{ number_format($totalSampel) }}</p>
                            <p class="text-xs text-slate-500 font-medium mt-1">Total Sampel Pohon</p>
                        </div>
                        <div class="bg-green-50 border border-green-100 rounded-xl p-5 shadow-sm text-center">
                            <p class="text-3xl font-black text-green-700">{{ number_format($totalMatang) }}</p>
                            <p class="text-xs text-green-600 font-medium mt-1">Terdeteksi Matang</p>
                        </div>
                        <div class="bg-amber-50 border border-amber-100 rounded-xl p-5 shadow-sm text-center">
                            <p class="text-3xl font-black text-amber-700">{{ number_format($totalBelum) }}</p>
                            <p class="text-xs text-amber-600 font-medium mt-1">Belum Matang</p>
                        </div>
                        <div class="bg-emerald-50 border border-emerald-100 rounded-xl p-5 shadow-sm text-center">
                            <p class="text-3xl font-black text-emerald-700">{{ number_format($avgAcc, 1) }}%</p>
                            <p class="text-xs text-emerald-600 font-medium mt-1">Rata-rata Akurasi AI</p>
                        </div>
                    </div>

                    {{-- ===== PROGRESS BAR ===== --}}
                    <div class="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
                        <div class="flex justify-between text-xs text-slate-500 mb-2">
                            <span class="font-semibold">Distribusi Kematangan (Akumulasi Semua Penerbangan)</span>
                            <span class="font-bold text-green-600">{{ $matangPct }}% Matang</span>
                        </div>
                        <div class="h-3 bg-slate-100 rounded-full overflow-hidden flex">
                            <div class="h-full bg-green-500 rounded-l-full transition-all" style="width:{{ $matangPct }}%"></div>
                            <div class="h-full bg-amber-400 rounded-r-full transition-all" style="width:{{ $belumPct }}%"></div>
                        </div>
                        <div class="flex gap-5 mt-2">
                            <span class="flex items-center gap-1.5 text-xs text-slate-500">
                                <span class="w-2.5 h-2.5 bg-green-500 rounded-full inline-block"></span>
                                Matang: {{ $totalMatang }} ({{ $matangPct }}%)
                            </span>
                            <span class="flex items-center gap-1.5 text-xs text-slate-500">
                                <span class="w-2.5 h-2.5 bg-amber-400 rounded-full inline-block"></span>
                                Belum Matang: {{ $totalBelum }} ({{ $belumPct }}%)
                            </span>
                        </div>
                    </div>

                    {{-- ===== FLIGHT LOGS CARDS ===== --}}
                    <div>
                        <div class="flex items-center justify-between mb-4">
                            <h4 class="text-sm font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                                <i class="fa-solid fa-clock-rotate-left"></i> Rekap Log Penerbangan Terbaru
                            </h4>
                            <a href="{{ route('laporan.log-penerbangan') }}" class="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1">
                                Lihat Semua Log <i class="fa-solid fa-arrow-right text-[10px]"></i>
                            </a>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            @foreach($flightLogs as $log)
                                <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition">
                                    <div class="flex justify-between items-start mb-3">
                                        <div>
                                            <div class="text-[10px] text-slate-400 font-mono mb-0.5">{{ $log->log_code }}</div>
                                            <div class="font-bold text-slate-800 leading-tight">{{ $log->mission_name ?? 'Tanpa Nama' }}</div>
                                            <div class="text-[10px] text-slate-400 mt-0.5">{{ $log->created_at->format('d M Y, H:i') }}</div>
                                        </div>
                                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold
                                            {{ $log->scan_mode === 'qlv' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600' }}">
                                            {{ strtoupper($log->scan_mode ?? '-') }}
                                        </span>
                                    </div>
                                    <div class="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center">
                                        <div>
                                            <p class="text-lg font-black text-slate-800">{{ $log->samples_count }}</p>
                                            <p class="text-[9px] text-slate-400 uppercase tracking-wider">Sampel</p>
                                        </div>
                                        <div>
                                            <p class="text-lg font-black text-green-600">{{ $log->matang }}</p>
                                            <p class="text-[9px] text-green-500 uppercase tracking-wider">Matang</p>
                                        </div>
                                        <div>
                                            <p class="text-lg font-black text-emerald-600">{{ number_format($log->accuracy, 1) }}%</p>
                                            <p class="text-[9px] text-emerald-500 uppercase tracking-wider">Akurasi</p>
                                        </div>
                                    </div>
                                    @if($log->nav_algorithm)
                                    <div class="mt-2 pt-2 border-t border-slate-50 flex items-center gap-1.5">
                                        <i class="fa-solid fa-route text-slate-300 text-xs"></i>
                                        <span class="text-[10px] text-slate-400">{{ ucwords(str_replace('_', ' ', $log->nav_algorithm)) }}</span>
                                    </div>
                                    @endif
                                </div>
                            @endforeach
                        </div>
                    </div>

                @else
                    {{-- Tidak ada flightLogs sama sekali --}}
                    <div class="flex flex-col items-center justify-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <i class="fa-solid fa-inbox text-slate-300 text-5xl mb-3"></i>
                        <p class="text-slate-500 font-semibold mb-1">Belum ada data penerbangan</p>
                        <p class="text-xs text-slate-400 text-center max-w-sm">Jalankan misi dari GCS dan biarkan drone mendarat — log akan tersimpan otomatis ke database.</p>
                        <a href="{{ route('gcs.index') }}" class="mt-4 px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-500 transition flex items-center gap-2">
                            <i class="fa-solid fa-plane-up"></i> Buka GCS
                        </a>
                    </div>
                @endif

            @else
                {{-- ===== AI DATA SUDAH ADA — tabel laporan_prediksis ===== --}}
                <div class="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
                    <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-brain text-purple-500"></i>
                            <h3 class="font-bold text-slate-800">Riwayat Deteksi Buah</h3>
                            <span class="text-xs text-slate-400 font-normal">({{ $laporan->count() }} entri)</span>
                        </div>
                        <button class="bg-emerald-500 text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-emerald-600 transition flex items-center gap-2">
                            <i class="fa-solid fa-file-excel"></i> Export Rekap
                        </button>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead class="bg-slate-50 text-slate-600 border-b border-slate-200">
                                <tr>
                                    <th class="text-center px-4 py-3 font-semibold w-16">No</th>
                                    <th class="text-center px-4 py-3 font-semibold">Timestamp</th>
                                    <th class="text-center px-4 py-3 font-semibold">Sampel Ke</th>
                                    <th class="text-center px-4 py-3 font-semibold">Status Kematangan</th>
                                    <th class="text-left px-4 py-3 font-semibold">Analisa &amp; Confidence</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                @foreach ($laporan as $item)
                                    <tr class="hover:bg-slate-50 transition">
                                        <td class="px-4 py-3 text-center text-slate-500 font-mono">{{ $loop->iteration }}</td>
                                        <td class="px-4 py-3 text-center text-slate-600">
                                            <div class="font-semibold">{{ $item->created_at->format('d M Y') }}</div>
                                            <div class="text-xs text-slate-400">{{ $item->created_at->format('H:i:s') }}</div>
                                        </td>
                                        <td class="px-4 py-3 text-center font-bold text-slate-700">Pohon #{{ $item->sampel_ke }}</td>
                                        <td class="px-4 py-3 text-center">
                                            @php
                                                $badgeInfo = match(strtolower($item->status)) {
                                                    'matang' => ['color' => 'bg-orange-100 text-orange-700', 'icon' => 'fa-circle-check'],
                                                    'mentah' => ['color' => 'bg-slate-100 text-slate-600',   'icon' => 'fa-circle-xmark'],
                                                    default  => ['color' => 'bg-sky-100 text-sky-700',        'icon' => 'fa-chart-simple'],
                                                };
                                            @endphp
                                            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold {{ $badgeInfo['color'] }}">
                                                <i class="fa-solid {{ $badgeInfo['icon'] }}"></i>
                                                {{ ucfirst($item->status) }}
                                            </span>
                                        </td>
                                        <td class="px-4 py-3 text-slate-600">{{ $item->analisa }}</td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>
            @endif

        </div>
    </div>
</x-app-layout>
