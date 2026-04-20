<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-lg text-slate-800 leading-tight flex items-center gap-2">
            <span class="text-slate-400 font-normal">Laporan</span>
            <i class="fa-solid fa-chevron-right text-xs text-slate-300"></i>
            <span>Prediksi Kematangan AI</span>
        </h2>
    </x-slot>

    <div class="py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

            {{-- Info Alert jika data kosong --}}
            @if($laporan->isEmpty())
                <div class="bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-sm flex items-start gap-4">
                    <div class="bg-amber-100/50 text-amber-600 rounded-lg p-3 shrink-0">
                        <i class="fa-solid fa-server text-xl"></i>
                    </div>
                    <div>
                        <h3 class="text-amber-800 font-bold text-base mb-1">Server AI Belum Terhubung</h3>
                        <p class="text-amber-700/80 text-sm leading-relaxed mb-3">
                            Saat ini belum ada data prediksi kematangan yang masuk. Server AI berbasis FastAPI (port 8001) kemungkinan belum dijalankan atau drone belum mengirimkan payload foto terbaru ke sistem.
                        </p>
                        <a href="{{ route('gcs.index') }}" class="inline-flex items-center gap-2 text-xs font-semibold bg-white border border-amber-200 text-amber-700 px-3 py-1.5 rounded-lg shadow-sm hover:bg-amber-50 transition">
                            <i class="fa-solid fa-plane-up"></i>
                            Jalankan Misi Drone (GCS)
                        </a>
                    </div>
                </div>
            @endif

            <div class="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
                <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div class="flex items-center gap-2">
                        <i class="fa-solid fa-brain text-purple-500"></i>
                        <h3 class="font-bold text-slate-800">Riwayat Deteksi Buah</h3>
                    </div>
                    
                    @if($laporan->isNotEmpty())
                        <button class="bg-emerald-500 text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-emerald-600 transition flex items-center gap-2">
                            <i class="fa-solid fa-file-excel"></i> Export Rekap
                        </button>
                    @endif
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="bg-slate-50 text-slate-600 border-b border-slate-200">
                            <tr>
                                <th class="text-center px-4 py-3 font-semibold w-16">No</th>
                                <th class="text-center px-4 py-3 font-semibold">Timestamp</th>
                                <th class="text-center px-4 py-3 font-semibold">Sampel Ke</th>
                                <th class="text-center px-4 py-3 font-semibold">Status Kematangan</th>
                                <th class="text-left px-4 py-3 font-semibold">Analisa & Confidence</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            @forelse ($laporan as $item)
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
                                                'mentah' => ['color' => 'bg-slate-100 text-slate-600', 'icon' => 'fa-circle-xmark'],
                                                default  => ['color' => 'bg-sky-100 text-sky-700', 'icon' => 'fa-chart-simple']
                                            };
                                        @endphp
                                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold {{ $badgeInfo['color'] }}">
                                            <i class="fa-solid {{ $badgeInfo['icon'] }}"></i>
                                            {{ ucfirst($item->status) }}
                                        </span>
                                    </td>
                                    <td class="px-4 py-3 text-slate-600">
                                        {{ $item->analisa }}
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="5" class="px-4 py-20 text-center">
                                        <div class="flex flex-col items-center gap-3 text-slate-400">
                                            <i class="fa-solid fa-microscope text-5xl opacity-20"></i>
                                            <div class="text-sm font-medium">Belum Ada Hasil Prediksi</div>
                                            <div class="text-xs max-w-sm text-center">Hasil analisa dari model AI secara individual (per-pohon) akan muncul di sini.</div>
                                        </div>
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>

            {{-- Fallback: Tampilkan ringkasan misi / log penerbangan jika data AI kosong --}}
            @if($laporan->isEmpty() && clone $flightLogs !== null && $flightLogs->isNotEmpty())
                <div class="mt-8">
                    <div class="flex items-center justify-between mb-4">
                        <h4 class="text-sm font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                            <i class="fa-solid fa-clock-rotate-left"></i> Rekap 5 Penerbangan Terakhir
                        </h4>
                        <a href="{{ route('laporan.log-penerbangan') }}" class="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                            Lihat Semua Log &rarr;
                        </a>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        @foreach($flightLogs as $log)
                            <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition">
                                <div class="flex justify-between items-start mb-3">
                                    <div>
                                        <div class="text-xs text-slate-400 font-mono mb-0.5">{{ $log->log_code }}</div>
                                        <div class="font-bold text-slate-800">{{ $log->mission_name ?? 'Tanpa Nama' }}</div>
                                    </div>
                                    <div class="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                                        {{ $log->scan_mode === 'qlv' ? 'QLV' : 'TRAD' }}
                                    </div>
                                </div>
                                <div class="flex justify-between items-end border-t border-slate-100 pt-3 mt-2">
                                    <div>
                                        <div class="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Hasil (Matang)</div>
                                        <div class="font-bold text-orange-600 text-lg flex items-center gap-1.5">
                                            {{ $log->matang }} <span class="text-[10px] font-medium text-slate-400">/ {{ $log->belum_matang }} mentah</span>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <div class="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Akurasi</div>
                                        <div class="font-bold text-emerald-600">{{ number_format($log->accuracy, 1) }}%</div>
                                    </div>
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>
            @endif

        </div>
    </div>
</x-app-layout>
