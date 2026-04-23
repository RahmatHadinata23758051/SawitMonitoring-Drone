<x-app-layout>
    <x-slot name="header">
        <h2 class="leading-tight">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">Laporan</li>
                <li class="breadcrumb-item breadcrumb-active">Log Penerbangan</li>
            </ol>
        </h2>
    </x-slot>

    <div class="pt-4 pb-12">
        <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-10 flex flex-col gap-6">

            {{-- ===== PAGE HEADER ===== --}}
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <i class="fa-solid fa-paper-plane text-emerald-500"></i>
                        Log Penerbangan
                    </h1>
                    <p class="text-sm text-slate-500 mt-1">Riwayat misi dan hasil inspeksi drone secara otomatis</p>
                </div>
                <div class="text-right">
                    <div class="text-xs text-slate-400 uppercase tracking-widest">Rentang Aktif</div>
                    <div class="text-sm font-bold text-slate-700 mt-0.5">{{ $filterLabel }}</div>
                </div>
            </div>

            {{-- ===== STATS CARDS ===== --}}
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center gap-4 border-l-4 border-l-emerald-500">
                    <div class="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                        <i class="fa-solid fa-paper-plane text-emerald-600 text-lg"></i>
                    </div>
                    <div>
                        <div class="text-3xl font-black text-slate-800">{{ $flightLogs->total() }}</div>
                        <div class="text-xs text-slate-500 font-medium mt-0.5">Total Penerbangan</div>
                    </div>
                </div>
                <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center gap-4 border-l-4 border-l-sky-500">
                    <div class="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
                        <i class="fa-solid fa-tree text-sky-600 text-lg"></i>
                    </div>
                    <div>
                        <div class="text-3xl font-black text-slate-800">{{ number_format($totalSamples) }}</div>
                        <div class="text-xs text-slate-500 font-medium mt-0.5">Total Pohon Discan</div>
                    </div>
                </div>
                <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center gap-4 border-l-4 border-l-orange-500">
                    <div class="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                        <i class="fa-solid fa-seedling text-orange-600 text-lg"></i>
                    </div>
                    <div>
                        <div class="text-3xl font-black text-slate-800">{{ number_format($totalMatang) }}</div>
                        <div class="text-xs text-slate-500 font-medium mt-0.5">Total Matang</div>
                    </div>
                </div>
                <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center gap-4 border-l-4 border-l-amber-500">
                    <div class="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                        <i class="fa-solid fa-bullseye text-amber-600 text-lg"></i>
                    </div>
                    <div>
                        <div class="text-3xl font-black text-slate-800">{{ number_format($avgAccuracy ?? 0, 1) }}%</div>
                        <div class="text-xs text-slate-500 font-medium mt-0.5">Rata-rata Akurasi</div>
                    </div>
                </div>
            </div>

            {{-- ===== SCAN MODE BREAKDOWN ===== --}}
            <div class="grid grid-cols-2 gap-4">
                <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-4">
                    <div class="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
                        <i class="fa-solid fa-route text-sky-500 text-base"></i>
                    </div>
                    <div>
                        <div class="font-bold text-slate-800 text-base">{{ $countQlv }} Penerbangan QLV</div>
                        <div class="text-xs text-slate-400 mt-0.5">Quick Look Vision — otomatis per koridor</div>
                    </div>
                </div>
                <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-4">
                    <div class="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                        <i class="fa-solid fa-shuffle text-violet-500 text-base"></i>
                    </div>
                    <div>
                        <div class="font-bold text-slate-800 text-base">{{ $countTrad }} Penerbangan Tradisional</div>
                        <div class="text-xs text-slate-400 mt-0.5">Manual waypoint per pohon</div>
                    </div>
                </div>
            </div>

            {{-- ===== FILTER & EXPORT ===== --}}
            <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    {{-- Filter Form --}}
                    <form action="{{ route('laporan.log-penerbangan') }}" method="GET"
                        class="flex flex-wrap items-end gap-3">
                        <div>
                            <label for="tanggal_dari" class="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Dari</label>
                            <input type="date" id="tanggal_dari" name="tanggal_dari"
                                value="{{ request('tanggal_dari') }}"
                                class="rounded-xl border-slate-200 text-sm focus:border-emerald-500 focus:ring-emerald-500 h-10 px-3">
                        </div>
                        <div>
                            <label for="tanggal_sampai" class="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Sampai</label>
                            <input type="date" id="tanggal_sampai" name="tanggal_sampai"
                                value="{{ request('tanggal_sampai') }}"
                                class="rounded-xl border-slate-200 text-sm focus:border-emerald-500 focus:ring-emerald-500 h-10 px-3">
                        </div>
                        <button type="submit"
                            class="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 h-10 text-sm font-semibold text-white hover:bg-emerald-600 transition shadow-sm">
                            <i class="fa-solid fa-filter"></i> Filter
                        </button>
                        <a href="{{ route('laporan.log-penerbangan') }}"
                            class="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-5 h-10 text-sm font-semibold text-slate-600 hover:bg-slate-200 transition">
                            <i class="fa-solid fa-rotate-left"></i> Reset
                        </a>
                    </form>

                    {{-- Export Buttons --}}
                    @php $exportQuery = request()->only(['tanggal_dari', 'tanggal_sampai']); @endphp
                    <div class="flex flex-wrap gap-2">
                        <a href="{{ route('laporan.log-penerbangan.export', array_merge(['format' => 'pdf'], $exportQuery)) }}"
                            class="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-4 h-10 text-sm font-semibold text-white hover:bg-rose-600 transition shadow-sm">
                            <i class="fa-solid fa-file-pdf"></i> PDF
                        </a>
                        <a href="{{ route('laporan.log-penerbangan.export', array_merge(['format' => 'csv'], $exportQuery)) }}"
                            class="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 h-10 text-sm font-semibold text-white hover:bg-sky-600 transition shadow-sm">
                            <i class="fa-solid fa-file-csv"></i> CSV
                        </a>
                        <a href="{{ route('laporan.log-penerbangan.export', array_merge(['format' => 'xlsx'], $exportQuery)) }}"
                            class="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 h-10 text-sm font-semibold text-white hover:bg-emerald-700 transition shadow-sm">
                            <i class="fa-solid fa-file-excel"></i> XLSX
                        </a>
                    </div>
                </div>

                @if ($errors->any())
                    <div class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {{ $errors->first() }}
                    </div>
                @endif
            </div>

            {{-- ===== TABEL UTAMA ===== --}}
            <div class="bg-white overflow-hidden shadow-sm rounded-2xl border border-slate-100">

                {{-- Table Header --}}
                <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                            <i class="fa-solid fa-clipboard-list text-emerald-600 text-sm"></i>
                        </div>
                        <div>
                            <h3 class="font-bold text-slate-800">Log Penerbangan Drone</h3>
                            <p class="text-xs text-slate-400">Sumber: <code class="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">flight_logs</code></p>
                        </div>
                    </div>
                    <span class="text-xs bg-emerald-50 text-emerald-700 font-semibold px-3 py-1.5 rounded-full border border-emerald-100">
                        {{ $flightLogs->total() }} Record
                    </span>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-sm" id="log-penerbangan-table">
                        <thead>
                            <tr class="text-xs uppercase tracking-widest text-slate-500 bg-slate-50 border-b border-slate-200">
                                <th class="text-center px-4 py-3 font-semibold whitespace-nowrap">Kode Log</th>
                                <th class="text-center px-4 py-3 font-semibold whitespace-nowrap">Tanggal</th>
                                <th class="text-left px-4 py-3 font-semibold">Nama Misi</th>
                                <th class="text-center px-4 py-3 font-semibold whitespace-nowrap">Algoritma</th>
                                <th class="text-center px-4 py-3 font-semibold whitespace-nowrap">Mode Scan</th>
                                <th class="text-center px-4 py-3 font-semibold whitespace-nowrap">Waktu Terbang</th>
                                <th class="text-center px-4 py-3 font-semibold">Sampel</th>
                                <th class="text-center px-4 py-3 font-semibold" colspan="2">
                                    Hasil Inspeksi
                                    <div class="flex justify-center gap-3 text-[10px] font-normal text-slate-400 mt-0.5 normal-case tracking-normal">
                                        <span>🟠 Matang</span><span>⚫ Mentah</span>
                                    </div>
                                </th>
                                <th class="text-center px-4 py-3 font-semibold text-emerald-600">Akurasi</th>
                                <th class="text-center px-4 py-3 font-semibold">Detail</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            @forelse ($flightLogs as $log)
                                <tr class="hover:bg-emerald-50/40 transition-colors group">

                                    {{-- Kode Log --}}
                                    <td class="px-4 py-4 text-center">
                                        <span class="inline-block bg-slate-800 text-white text-xs font-mono px-2.5 py-1 rounded-lg tracking-wide">
                                            {{ $log->log_code }}
                                        </span>
                                    </td>

                                    {{-- Tanggal --}}
                                    <td class="px-4 py-4 text-center whitespace-nowrap">
                                        <div class="font-semibold text-slate-700 text-sm">{{ $log->created_at->format('d M Y') }}</div>
                                        <div class="text-xs text-slate-400 mt-0.5">{{ $log->created_at->format('H:i:s') }}</div>
                                    </td>

                                    {{-- Nama Misi --}}
                                    <td class="px-4 py-4">
                                        <div class="font-semibold text-slate-800">{{ $log->mission_name }}</div>
                                        @if ($log->mission)
                                            <div class="text-xs text-slate-400 font-mono mt-0.5">MSN-{{ $log->mission_id }}</div>
                                        @else
                                            <div class="text-xs text-slate-300 italic mt-0.5">—</div>
                                        @endif
                                    </td>

                                    {{-- Algoritma --}}
                                    <td class="px-4 py-4 text-center">
                                        @php
                                            $algo = match($log->nav_algorithm) {
                                                'dead_reckoning' => ['label' => 'Dead Rec.', 'color' => 'bg-blue-100 text-blue-700 ring-1 ring-blue-200'],
                                                'live_reckoning' => ['label' => 'Live Rec.', 'color' => 'bg-purple-100 text-purple-700 ring-1 ring-purple-200'],
                                                'hybrid'         => ['label' => 'Hybrid', 'color' => 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200'],
                                                default          => ['label' => ucfirst($log->nav_algorithm ?? '-'), 'color' => 'bg-slate-100 text-slate-600'],
                                            };
                                        @endphp
                                        <span class="text-xs px-2.5 py-1 rounded-full font-semibold {{ $algo['color'] }}">
                                            {{ $algo['label'] }}
                                        </span>
                                    </td>

                                    {{-- Mode Scan --}}
                                    <td class="px-4 py-4 text-center">
                                        @if ($log->scan_mode === 'qlv')
                                            <span class="text-xs px-2.5 py-1 rounded-full font-semibold bg-sky-100 text-sky-700 ring-1 ring-sky-200">
                                                <i class="fa-solid fa-route mr-1"></i>QLV
                                            </span>
                                        @else
                                            <span class="text-xs px-2.5 py-1 rounded-full font-semibold bg-violet-100 text-violet-700 ring-1 ring-violet-200">
                                                <i class="fa-solid fa-shuffle mr-1"></i>Tradisional
                                            </span>
                                        @endif
                                    </td>

                                    {{-- Waktu Terbang --}}
                                    <td class="px-4 py-4 text-center">
                                        <span class="font-mono text-sky-700 font-bold text-sm bg-sky-50 px-2.5 py-1 rounded-lg">
                                            {{ $log->flight_time_label }}
                                        </span>
                                    </td>

                                    {{-- Sampel --}}
                                    <td class="px-4 py-4 text-center">
                                        <span class="font-black text-slate-800 text-base">{{ $log->samples_count }}</span>
                                        <span class="text-xs text-slate-400 ml-0.5">pohon</span>
                                    </td>

                                    {{-- Matang --}}
                                    <td class="px-3 py-4 text-center border-r border-slate-100">
                                        <div class="flex flex-col items-center gap-0.5">
                                            <span class="text-xl font-black text-orange-600">{{ $log->matang }}</span>
                                            <span class="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Matang</span>
                                        </div>
                                    </td>
                                    {{-- Mentah --}}
                                    <td class="px-3 py-4 text-center">
                                        <div class="flex flex-col items-center gap-0.5">
                                            <span class="text-xl font-black text-slate-500">{{ $log->belum_matang }}</span>
                                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mentah</span>
                                        </div>
                                    </td>

                                    {{-- Akurasi --}}
                                    <td class="px-4 py-4 text-center">
                                        @php $acc = $log->accuracy; @endphp
                                        <span class="inline-flex items-center justify-center font-black text-base px-3 py-1 rounded-xl
                                            {{ $acc >= 95 ? 'text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200' : 'text-amber-700 bg-amber-50 ring-1 ring-amber-200' }}">
                                            {{ number_format($acc, 1) }}%
                                        </span>
                                    </td>

                                    {{-- Aksi --}}
                                    <td class="px-4 py-4 text-center">
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
                                            class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-emerald-100 hover:text-emerald-600 transition group-hover:bg-emerald-100 group-hover:text-emerald-600"
                                            title="Lihat Detail">
                                            <i class="fa-solid fa-eye text-sm"></i>
                                        </button>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="11" class="px-4 py-20 text-center">
                                        <div class="flex flex-col items-center gap-4 text-slate-400">
                                            <div class="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                                                <i class="fa-solid fa-inbox text-3xl text-slate-300"></i>
                                            </div>
                                            <div>
                                                <div class="text-base font-semibold text-slate-500">Belum ada log penerbangan</div>
                                                <div class="text-sm text-slate-400 mt-1">Selesaikan misi di GCS untuk mencatat log secara otomatis</div>
                                            </div>
                                            <a href="{{ route('gcs.index') }}"
                                                class="mt-1 text-sm bg-emerald-500 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-600 transition font-semibold shadow-sm">
                                                <i class="fa-solid fa-gamepad mr-2"></i>Buka GCS
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
                    <div class="px-6 py-4 border-t border-slate-100">
                        {{ $flightLogs->links() }}
                    </div>
                @endif
            </div>

        </div>
    </div>

    {{-- ===== MODAL DETAIL ===== --}}
    <div id="modal-detail" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center hidden p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
            {{-- Modal Header --}}
            <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <i class="fa-solid fa-plane text-emerald-600"></i>
                    </div>
                    <div>
                        <h3 class="font-bold text-slate-800 text-base">Detail Log Penerbangan</h3>
                        <p class="text-xs text-slate-400 mt-0.5">Ringkasan misi & raw telemetry sensor IMU + GPS</p>
                    </div>
                </div>
                <button onclick="closeModal()"
                    class="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition flex items-center justify-center">
                    <i class="fa-solid fa-times"></i>
                </button>
            </div>
            {{-- Modal Body --}}
            <div class="px-6 py-5 overflow-y-auto flex-1" id="modal-body">
                {{-- filled by JS --}}
            </div>
            {{-- Modal Footer --}}
            <div class="px-6 py-4 border-t border-slate-100 flex justify-end shrink-0">
                <button onclick="closeModal()"
                    class="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl transition font-semibold">
                    Tutup
                </button>
            </div>
        </div>
    </div>

    @push('scripts')
        <script>
            function fmtTime(s) {
                return Math.floor(s / 60) + 'm ' + (s % 60) + 's';
            }
            function fmt(val, dec = 3) {
                return val !== null && val !== undefined ? parseFloat(val).toFixed(dec) : '-';
            }

            async function showDetail(logCode, name, algo, scan, samples, matang, belum, flightSec, acc, date) {
                const algoLabel = {
                    dead_reckoning: 'Dead Reckoning',
                    live_reckoning: 'Live Reckoning',
                    hybrid: 'Hybrid'
                }[algo] || algo;
                const scanLabel = scan === 'qlv' ? 'QLV (Quick Look Vision)' : 'Traditional Scan';
                const accColor = acc >= 95 ? 'text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200' : 'text-amber-700 bg-amber-50 ring-1 ring-amber-200';

                document.getElementById('modal-body').innerHTML = `
                    {{-- Ringkasan 4 kolom --}}
                    <div class="grid grid-cols-4 gap-3 mb-5">
                        <div class="col-span-4 bg-slate-50 rounded-xl px-4 py-3 flex items-center justify-between">
                            <div>
                                <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Kode Log</div>
                                <div class="font-mono font-bold text-slate-800 text-sm">${logCode}</div>
                            </div>
                            <div class="text-right">
                                <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Tanggal Dicatat</div>
                                <div class="text-slate-700 font-medium text-sm">${date}</div>
                            </div>
                        </div>
                        <div class="col-span-2">
                            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nama Misi</div>
                            <div class="font-bold text-slate-800">${name}</div>
                        </div>
                        <div>
                            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Algoritma</div>
                            <div class="font-semibold text-slate-700 text-sm">${algoLabel}</div>
                        </div>
                        <div>
                            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mode Scan</div>
                            <div class="font-semibold text-slate-700 text-sm">${scanLabel}</div>
                        </div>
                    </div>

                    {{-- Stats bar --}}
                    <div class="grid grid-cols-4 gap-3 mb-5">
                        <div class="bg-sky-50 rounded-xl p-3 text-center border border-sky-100">
                            <div class="text-[10px] font-bold text-sky-500 uppercase tracking-wider mb-1">Waktu Terbang</div>
                            <div class="font-black text-sky-700 text-xl">${fmtTime(flightSec)}</div>
                        </div>
                        <div class="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Sampel</div>
                            <div class="font-black text-slate-800 text-xl">${samples} <span class="text-xs font-normal text-slate-400">pohon</span></div>
                        </div>
                        <div class="bg-orange-50 rounded-xl p-3 text-center border border-orange-100">
                            <div class="text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-1">🟠 Matang</div>
                            <div class="font-black text-orange-600 text-xl">${matang} <span class="text-xs font-normal text-orange-300">pohon</span></div>
                        </div>
                        <div class="rounded-xl p-3 text-center border ${accColor}">
                            <div class="text-[10px] font-bold uppercase tracking-wider mb-1">Akurasi AI</div>
                            <div class="font-black text-2xl">${parseFloat(acc).toFixed(1)}%</div>
                        </div>
                    </div>

                    {{-- Telemetry table --}}
                    <div class="border-t border-slate-100 pt-4">
                        <div class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <i class="fa-solid fa-satellite-dish text-emerald-500"></i>
                            Raw Telemetry — IMU &amp; GPS
                            <span class="ml-auto text-[10px] font-normal text-slate-400 normal-case tracking-normal">ax/ay/az = Accelerometer (m/s²) &nbsp;|&nbsp; gx/gy/gz = Gyroscope (deg/s)</span>
                        </div>
                        <div id="telemetry-container" class="bg-slate-50 rounded-xl p-6 text-center">
                            <i class="fa-solid fa-spinner fa-spin text-slate-400 text-2xl mb-2"></i>
                            <p class="text-xs text-slate-500 mt-2">Memuat data sensor penerbangan...</p>
                        </div>
                    </div>
                `;
                document.getElementById('modal-detail').classList.remove('hidden');

                // Load detail telemetri via AJAX
                try {
                    const response = await fetch('/api/flight-logs/' + logCode + '/details');
                    const json = await response.json();

                    if (json.status && json.data.length > 0) {
                        let rows = json.data.map((d, i) => {
                            const lat = fmt(d.lat, 6);
                            const lon = fmt(d.lon, 6);
                            const alt = d.alt ? fmt(d.alt, 1) + 'm' : '-';
                            const ax  = fmt(d.ax);
                            const ay  = fmt(d.ay);
                            const az  = fmt(d.az);
                            const gx  = fmt(d.gx);
                            const gy  = fmt(d.gy);
                            const gz  = fmt(d.gz);
                            const rowBg = i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60';
                            return `
                                <tr class="${rowBg} hover:bg-emerald-50/40 transition">
                                    <td class="px-3 py-2 text-[11px] font-mono text-slate-400 whitespace-nowrap">${d.timestamp || '-'}</td>
                                    <td class="px-3 py-2 text-center">
                                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${d.mode === 'AUTO' ? 'bg-emerald-100 text-emerald-700' : d.mode === 'RTL' ? 'bg-amber-100 text-amber-700' : d.mode === 'LANDING' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}">${d.mode || '-'}</span>
                                        <div class="text-[9px] text-slate-400 mt-0.5">${d.sub_state || '-'}</div>
                                    </td>
                                    <td class="px-3 py-2 text-[11px] font-mono text-blue-700 text-right whitespace-nowrap">${lat}</td>
                                    <td class="px-3 py-2 text-[11px] font-mono text-blue-700 text-right whitespace-nowrap">${lon}</td>
                                    <td class="px-3 py-2 text-[11px] font-mono text-sky-700 font-bold text-right">${alt}</td>
                                    <td class="px-3 py-2 text-[11px] font-mono text-indigo-600 text-right">${ax}</td>
                                    <td class="px-3 py-2 text-[11px] font-mono text-indigo-600 text-right">${ay}</td>
                                    <td class="px-3 py-2 text-[11px] font-mono text-indigo-600 text-right">${az}</td>
                                    <td class="px-3 py-2 text-[11px] font-mono text-violet-600 text-right">${gx}</td>
                                    <td class="px-3 py-2 text-[11px] font-mono text-violet-600 text-right">${gy}</td>
                                    <td class="px-3 py-2 text-[11px] font-mono text-violet-600 text-right">${gz}</td>
                                </tr>
                            `;
                        }).join('');

                        document.getElementById('telemetry-container').outerHTML = `
                            <div class="border border-slate-200 rounded-xl overflow-hidden">
                                <div class="overflow-x-auto overflow-y-auto max-h-56">
                                    <table class="w-full text-left min-w-[860px]">
                                        <thead class="bg-slate-800 text-white text-[10px] uppercase font-bold sticky top-0 z-10">
                                            <tr>
                                                <th class="px-3 py-2.5 whitespace-nowrap">Waktu</th>
                                                <th class="px-3 py-2.5 text-center">State / Mode</th>
                                                <th class="px-3 py-2.5 text-right text-blue-300">Lat</th>
                                                <th class="px-3 py-2.5 text-right text-blue-300">Lon</th>
                                                <th class="px-3 py-2.5 text-right text-sky-300">Alt</th>
                                                <th class="px-3 py-2.5 text-right text-indigo-300">ax</th>
                                                <th class="px-3 py-2.5 text-right text-indigo-300">ay</th>
                                                <th class="px-3 py-2.5 text-right text-indigo-300">az</th>
                                                <th class="px-3 py-2.5 text-right text-violet-300">gx</th>
                                                <th class="px-3 py-2.5 text-right text-violet-300">gy</th>
                                                <th class="px-3 py-2.5 text-right text-violet-300">gz</th>
                                            </tr>
                                            <tr class="bg-slate-700 text-[9px] text-slate-400 font-normal">
                                                <td colspan="2"></td>
                                                <td class="px-3 py-1 text-right text-blue-400" colspan="3">GPS Position</td>
                                                <td class="px-3 py-1 text-right text-indigo-400" colspan="3">Accelerometer (m/s²)</td>
                                                <td class="px-3 py-1 text-right text-violet-400" colspan="3">Gyroscope (°/s)</td>
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y divide-slate-100">
                                            ${rows}
                                        </tbody>
                                    </table>
                                </div>
                                <div class="bg-slate-50 px-4 py-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                                    <span><i class="fa-solid fa-circle-info mr-1"></i>${json.data.length} data point tercatat selama penerbangan ini</span>
                                    <span class="text-slate-300">Scroll horizontal untuk lihat semua kolom →</span>
                                </div>
                            </div>
                        `;
                    } else {
                        document.getElementById('telemetry-container').innerHTML = `
                            <div class="flex flex-col items-center gap-2 py-6">
                                <i class="fa-solid fa-box-open text-slate-300 text-3xl"></i>
                                <p class="text-sm font-semibold text-slate-500 mt-1">Tidak ada data raw telemetri</p>
                                <p class="text-xs text-slate-400">Log penerbangan ini dibuat sebelum fitur telemetri diaktifkan.</p>
                            </div>
                        `;
                    }
                } catch (error) {
                    console.error('Error fetching telemetry details:', error);
                    document.getElementById('telemetry-container').innerHTML = `
                        <div class="flex flex-col items-center gap-2 py-6 text-red-500">
                            <i class="fa-solid fa-triangle-exclamation text-3xl"></i>
                            <p class="text-sm font-semibold mt-1">Gagal memuat data telemetri</p>
                            <p class="text-xs text-red-400">Coba tutup dan buka kembali detail ini.</p>
                        </div>
                    `;
                }
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
