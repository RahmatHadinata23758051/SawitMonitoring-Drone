<x-app-layout>
    <x-slot name="header">
        <h2 class="leading-tight">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">Laporan</li>
                <li class="breadcrumb-item breadcrumb-active">Log Penerbangan</li>
            </ol>
        </h2>
    </x-slot>

    <div class="pt-2 pb-12">
        <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex flex-col gap-4">

            {{-- Stats Cards --}}
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div class="bg-white rounded-lg shadow-sm p-4 flex items-center gap-3 border-l-4 border-emerald-500">
                    <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <i class="fa-solid fa-paper-plane text-emerald-600"></i>
                    </div>
                    <div>
                        <div class="text-2xl font-bold text-slate-800">{{ $flightLogs->total() }}</div>
                        <div class="text-xs text-slate-500">Total Penerbangan</div>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow-sm p-4 flex items-center gap-3 border-l-4 border-sky-500">
                    <div class="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
                        <i class="fa-solid fa-tree text-sky-600"></i>
                    </div>
                    <div>
                        <div class="text-2xl font-bold text-slate-800">{{ number_format($totalSamples) }}</div>
                        <div class="text-xs text-slate-500">Total Pohon Discan</div>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow-sm p-4 flex items-center gap-3 border-l-4 border-orange-500">
                    <div class="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <i class="fa-solid fa-seedling text-orange-600"></i>
                    </div>
                    <div>
                        <div class="text-2xl font-bold text-slate-800">{{ number_format($totalMatang) }}</div>
                        <div class="text-xs text-slate-500">Total Matang</div>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow-sm p-4 flex items-center gap-3 border-l-4 border-amber-500">
                    <div class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <i class="fa-solid fa-bullseye text-amber-600"></i>
                    </div>
                    <div>
                        <div class="text-2xl font-bold text-slate-800">{{ number_format($avgAccuracy ?? 0, 1) }}%</div>
                        <div class="text-xs text-slate-500">Rata-rata Akurasi</div>
                    </div>
                </div>
            </div>

            {{-- Scan mode breakdown --}}
            <div class="grid grid-cols-2 gap-3">
                <div class="bg-white rounded-lg shadow-sm p-3 flex items-center gap-3 border border-slate-200">
                    <i class="fa-solid fa-route text-sky-500 text-lg"></i>
                    <div>
                        <div class="font-bold text-slate-800">{{ $countQlv }} Penerbangan QLV</div>
                        <div class="text-xs text-slate-500">Quick Look Vision (otomatis koridor)</div>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow-sm p-3 flex items-center gap-3 border border-slate-200">
                    <i class="fa-solid fa-shuffle text-violet-500 text-lg"></i>
                    <div>
                        <div class="font-bold text-slate-800">{{ $countTrad }} Penerbangan Tradisional</div>
                        <div class="text-xs text-slate-500">Manual waypoint per pohon</div>
                    </div>
                </div>
            </div>

            {{-- Tabel Utama --}}
            <div class="bg-white overflow-hidden shadow-sm rounded-lg">
                <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="fa-solid fa-clipboard-list text-emerald-600"></i>
                        <h3 class="font-semibold text-slate-700">Log Penerbangan Drone</h3>
                        <span class="text-xs text-slate-400 ml-2">· Sumber: <code class="bg-slate-100 px-1 rounded">flight_logs</code></span>
                    </div>
                    <a href="{{ route('gcs.index') }}"
                        class="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition">
                        <i class="fa-solid fa-gamepad"></i>
                        Buka GCS
                    </a>
                </div>                <div class="overflow-x-auto">
                    <table class="w-full text-sm" id="log-penerbangan-table">
                        <thead class="bg-slate-50 text-slate-600 border-b border-slate-200">
                            <tr>
                                <th class="text-center px-3 py-3 font-semibold whitespace-nowrap">Kode Log</th>
                                <th class="text-center px-3 py-3 font-semibold whitespace-nowrap">Tanggal</th>
                                <th class="text-left px-3 py-3 font-semibold">Nama Misi</th>
                                <th class="text-center px-3 py-3 font-semibold whitespace-nowrap">Algoritma</th>
                                <th class="text-center px-3 py-3 font-semibold whitespace-nowrap">Mode Scan</th>
                                <th class="text-center px-3 py-3 font-semibold whitespace-nowrap">Waktu Terbang</th>
                                <th class="text-center px-3 py-3 font-semibold">Sampel</th>
                                <th class="text-center px-3 py-3 font-semibold" colspan="2">
                                    Hasil Result
                                    <div class="flex justify-center gap-4 text-[10px] font-normal text-slate-400 mt-0.5">
                                        <span>🟠 Matang</span><span>⚫ Mentah</span>
                                    </div>
                                </th>
                                <th class="text-center px-3 py-3 font-semibold text-emerald-600">Akurasi</th>
                                <th class="text-center px-3 py-3 font-semibold">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            @forelse ($flightLogs as $log)
                                <tr class="hover:bg-slate-50 transition">

                                    {{-- Kode Log --}}
                                    <td class="px-3 py-3 text-center">
                                        <span class="inline-block bg-slate-800 text-white text-xs font-mono px-2 py-0.5 rounded">
                                            {{ $log->log_code }}
                                        </span>
                                    </td>

                                    {{-- Tanggal --}}
                                    <td class="px-3 py-3 text-center text-slate-600 text-xs whitespace-nowrap">
                                        <div class="font-semibold">{{ $log->created_at->format('d M Y') }}</div>
                                        <div class="text-slate-400">{{ $log->created_at->format('H:i:s') }}</div>
                                    </td>

                                    {{-- Nama Misi --}}
                                    <td class="px-3 py-3">
                                        <div class="font-semibold text-slate-800">{{ $log->mission_name }}</div>
                                        @if ($log->mission)
                                            <div class="text-xs text-slate-400 font-mono">MSN-{{ $log->mission_id }}</div>
                                        @else
                                            <div class="text-xs text-slate-400 italic">—</div>
                                        @endif
                                    </td>

                                    {{-- Algoritma --}}
                                    <td class="px-3 py-3 text-center">
                                        @php
                                            $algo = match($log->nav_algorithm) {
                                                'dead_reckoning' => ['label' => 'Dead Rec.', 'color' => 'bg-blue-100 text-blue-700'],
                                                'live_reckoning' => ['label' => 'Live Rec.', 'color' => 'bg-purple-100 text-purple-700'],
                                                'hybrid'         => ['label' => 'Hybrid', 'color' => 'bg-indigo-100 text-indigo-700'],
                                                default          => ['label' => ucfirst($log->nav_algorithm ?? '-'), 'color' => 'bg-slate-100 text-slate-600'],
                                            };
                                        @endphp
                                        <span class="text-xs px-2 py-0.5 rounded-full font-medium {{ $algo['color'] }}">
                                            {{ $algo['label'] }}
                                        </span>
                                    </td>

                                    {{-- Mode Scan --}}
                                    <td class="px-3 py-3 text-center">
                                        @if ($log->scan_mode === 'qlv')
                                            <span class="text-xs px-2 py-0.5 rounded-full font-medium bg-sky-100 text-sky-700">
                                                <i class="fa-solid fa-route mr-1"></i> QLV
                                            </span>
                                        @else
                                            <span class="text-xs px-2 py-0.5 rounded-full font-medium bg-violet-100 text-violet-700">
                                                <i class="fa-solid fa-shuffle mr-1"></i> Tradisional
                                            </span>
                                        @endif
                                    </td>

                                    {{-- Waktu Terbang --}}
                                    <td class="px-3 py-3 text-center font-mono text-sky-700 font-semibold">
                                        {{ $log->flight_time_label }}
                                    </td>

                                    {{-- Sampel --}}
                                    <td class="px-3 py-3 text-center">
                                        <span class="font-bold text-slate-700">{{ $log->samples_count }}</span>
                                        <span class="text-xs text-slate-400"> pohon</span>
                                    </td>

                                    {{-- Hasil Result: Matang (side by side) --}}
                                    <td class="px-2 py-3 text-center border-r border-slate-100">
                                        <div class="flex flex-col items-center">
                                            <span class="text-lg font-black text-orange-600">{{ $log->matang }}</span>
                                            <span class="text-[10px] font-semibold text-orange-400 uppercase tracking-wide">Matang</span>
                                        </div>
                                    </td>
                                    <td class="px-2 py-3 text-center">
                                        <div class="flex flex-col items-center">
                                            <span class="text-lg font-black text-slate-500">{{ $log->belum_matang }}</span>
                                            <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Mentah</span>
                                        </div>
                                    </td>

                                    {{-- Akurasi --}}
                                    <td class="px-3 py-3 text-center">
                                        <span class="font-bold text-sm {{ $log->accuracy >= 95 ? 'text-emerald-600' : 'text-amber-600' }}">
                                            {{ number_format($log->accuracy, 1) }}%
                                        </span>
                                    </td>

                                    {{-- Aksi --}}
                                    <td class="px-3 py-3 text-center">
                                        <button type="button"
                                            onclick="showDetail(
                                                '{{ $log->log_code }}',
                                                '{{ addslashes($log->mission_name) }}',
                                                '{{ $log->nav_algorithm }}',
                                                '{{ $log->scan_mode }}',
                                                {{ $log->samples_count }},
                                                {{ $log->matang }},
                                                {{ $log->belum_matang }},
                                                {{ $log->flight_time_seconds }},
                                                {{ $log->accuracy }},
                                                '{{ $log->created_at->format('d M Y H:i:s') }}'
                                            )"
                                            class="text-slate-500 hover:text-emerald-600 transition" title="Lihat Detail">
                                            <i class="fa-solid fa-eye"></i>
                                        </button>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="10" class="px-4 py-16 text-center">
                                        <div class="flex flex-col items-center gap-3 text-slate-400">
                                            <i class="fa-solid fa-inbox text-5xl opacity-30"></i>
                                            <div class="text-sm font-medium">Belum ada log penerbangan</div>
                                            <div class="text-xs">Selesaikan misi di GCS untuk mencatat log penerbangan secara otomatis</div>
                                            <a href="{{ route('gcs.index') }}" class="mt-2 text-xs bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition">
                                                <i class="fa-solid fa-gamepad mr-1"></i> Buka GCS
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>

                {{-- Pagination --}}
                @if ($flightLogs->hasPages())
                    <div class="px-5 py-4 border-t border-slate-100">
                        {{ $flightLogs->links() }}
                    </div>
                @endif
            </div>
        </div>
    </div>

    {{-- Modal Detail --}}
    <div id="modal-detail" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center hidden">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
            <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div class="flex items-center gap-2">
                    <i class="fa-solid fa-info-circle text-emerald-600"></i>
                    <h3 class="font-bold text-slate-800">Detail Log Penerbangan</h3>
                </div>
                <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600 transition">
                    <i class="fa-solid fa-times text-lg"></i>
                </button>
            </div>
            <div class="px-6 py-5 space-y-3" id="modal-body">
                {{-- filled by JS --}}
            </div>
            <div class="px-6 py-4 border-t border-slate-100 flex justify-end">
                <button onclick="closeModal()" class="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg transition">Tutup</button>
            </div>
        </div>
    </div>

    @push('scripts')
        <script>
            function fmtTime(s) {
                return Math.floor(s / 60) + 'm ' + (s % 60) + 's';
            }

            function showDetail(logCode, name, algo, scan, samples, matang, belum, flightSec, acc, date) {
                const algoLabel = {
                    dead_reckoning: 'Dead Reckoning',
                    live_reckoning: 'Live Reckoning',
                    hybrid: 'Hybrid'
                }[algo] || algo;
                const scanLabel = scan === 'qlv' ? 'QLV (Quick Look Vision)' : 'Traditional Scan';
                const accColor = acc >= 95 ? 'text-emerald-700' : 'text-amber-700';

                document.getElementById('modal-body').innerHTML = `
                    <div class="grid grid-cols-2 gap-3 text-sm">
                        <div class="col-span-2">
                            <div class="text-xs text-slate-400 mb-0.5">Kode Log</div>
                            <div class="font-mono font-bold text-slate-800 bg-slate-100 rounded px-2 py-1">${logCode}</div>
                        </div>
                        <div class="col-span-2">
                            <div class="text-xs text-slate-400 mb-0.5">Nama Misi</div>
                            <div class="font-bold text-slate-800">${name}</div>
                        </div>
                        <div>
                            <div class="text-xs text-slate-400 mb-0.5">Algoritma</div>
                            <div class="font-medium text-slate-700">${algoLabel}</div>
                        </div>
                        <div>
                            <div class="text-xs text-slate-400 mb-0.5">Mode Scan</div>
                            <div class="font-medium text-slate-700">${scanLabel}</div>
                        </div>
                        <div>
                            <div class="text-xs text-slate-400 mb-0.5">Waktu Terbang</div>
                            <div class="font-bold text-sky-700">${fmtTime(flightSec)}</div>
                        </div>
                        <div>
                            <div class="text-xs text-slate-400 mb-0.5">Total Sampel</div>
                            <div class="font-bold text-2xl text-slate-800">${samples} <span class="text-sm font-normal text-slate-400">pohon</span></div>
                        </div>
                        <div>
                            <div class="text-xs text-slate-400 mb-0.5">🟠 Matang</div>
                            <div class="font-bold text-xl text-orange-600">${matang} <span class="text-sm font-normal text-slate-400">pohon</span></div>
                        </div>
                        <div>
                            <div class="text-xs text-slate-400 mb-0.5">⚫ Mentah</div>
                            <div class="font-bold text-xl text-slate-600">${belum} <span class="text-sm font-normal text-slate-400">pohon</span></div>
                        </div>
                        <div class="col-span-2">
                            <div class="text-xs text-slate-400 mb-0.5">Akurasi AI</div>
                            <div class="font-bold text-2xl ${accColor}">${parseFloat(acc).toFixed(1)}%</div>
                        </div>
                        <div class="col-span-2">
                            <div class="text-xs text-slate-400 mb-0.5">Tanggal Dicatat</div>
                            <div class="font-medium text-slate-700 text-xs">${date}</div>
                        </div>
                    </div>
                `;
                document.getElementById('modal-detail').classList.remove('hidden');
            }

            function closeModal() {
                document.getElementById('modal-detail').classList.add('hidden');
            }

            document.getElementById('modal-detail').addEventListener('click', function(e) {
                if (e.target === this) closeModal();
            });
        </script>
    @endpush
</x-app-layout>
