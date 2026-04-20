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
                        <div class="text-2xl font-bold text-slate-800">{{ $missions->total() }}</div>
                        <div class="text-xs text-slate-500">Total Misi</div>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow-sm p-4 flex items-center gap-3 border-l-4 border-sky-500">
                    <div class="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
                        <i class="fa-solid fa-route text-sky-600"></i>
                    </div>
                    <div>
                        <div class="text-2xl font-bold text-slate-800">{{ $missions->where('scan_mode', 'qlv')->count() }}</div>
                        <div class="text-xs text-slate-500">Mode QLV</div>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow-sm p-4 flex items-center gap-3 border-l-4 border-violet-500">
                    <div class="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                        <i class="fa-solid fa-shuffle text-violet-600"></i>
                    </div>
                    <div>
                        <div class="text-2xl font-bold text-slate-800">{{ $missions->where('scan_mode', 'traditional')->count() }}</div>
                        <div class="text-xs text-slate-500">Mode Tradisional</div>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow-sm p-4 flex items-center gap-3 border-l-4 border-amber-500">
                    <div class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <i class="fa-solid fa-check-double text-amber-600"></i>
                    </div>
                    <div>
                        <div class="text-2xl font-bold text-slate-800">{{ $missions->where('status', 'Completed')->count() }}</div>
                        <div class="text-xs text-slate-500">Selesai</div>
                    </div>
                </div>
            </div>

            {{-- Tabel Utama --}}
            <div class="bg-white overflow-hidden shadow-sm rounded-lg">
                <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i class="fa-solid fa-clipboard-list text-emerald-600"></i>
                        <h3 class="font-semibold text-slate-700">Log Penerbangan Drone</h3>
                    </div>
                    <a href="{{ route('gcs.index') }}"
                        class="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition">
                        <i class="fa-solid fa-gamepad"></i>
                        Buka GCS
                    </a>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm" id="log-penerbangan-table">
                        <thead class="bg-slate-50 text-slate-600 border-b border-slate-200">
                            <tr>
                                <th class="text-center px-4 py-3 font-semibold whitespace-nowrap">ID Misi</th>
                                <th class="text-left px-4 py-3 font-semibold">Nama Misi</th>
                                <th class="text-center px-4 py-3 font-semibold whitespace-nowrap">Algoritma</th>
                                <th class="text-center px-4 py-3 font-semibold whitespace-nowrap">Mode Scan</th>
                                <th class="text-center px-4 py-3 font-semibold whitespace-nowrap">Waypoints</th>
                                <th class="text-center px-4 py-3 font-semibold">Drone</th>
                                <th class="text-center px-4 py-3 font-semibold">Status</th>
                                <th class="text-center px-4 py-3 font-semibold whitespace-nowrap">Tanggal Tersimpan</th>
                                <th class="text-center px-4 py-3 font-semibold">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            @forelse ($missions as $mission)
                                <tr class="hover:bg-slate-50 transition">
                                    {{-- ID Misi --}}
                                    <td class="px-4 py-3 text-center">
                                        <span class="inline-block bg-slate-800 text-white text-xs font-mono px-2 py-0.5 rounded">
                                            #{{ str_pad($mission->id, 4, '0', STR_PAD_LEFT) }}
                                        </span>
                                    </td>

                                    {{-- Nama Misi --}}
                                    <td class="px-4 py-3">
                                        <div class="font-semibold text-slate-800">{{ $mission->mission_name }}</div>
                                        <div class="text-xs text-slate-400 font-mono">MSN-{{ $mission->id }}</div>
                                    </td>

                                    {{-- Algoritma --}}
                                    <td class="px-4 py-3 text-center">
                                        @php
                                            $algo = match($mission->nav_algorithm) {
                                                'dead_reckoning' => ['label' => 'Dead Reckoning', 'color' => 'bg-blue-100 text-blue-700'],
                                                'live_reckoning' => ['label' => 'Live Reckoning', 'color' => 'bg-purple-100 text-purple-700'],
                                                'hybrid'         => ['label' => 'Hybrid', 'color' => 'bg-indigo-100 text-indigo-700'],
                                                default          => ['label' => ucfirst($mission->nav_algorithm ?? '-'), 'color' => 'bg-slate-100 text-slate-600'],
                                            };
                                        @endphp
                                        <span class="text-xs px-2 py-0.5 rounded-full font-medium {{ $algo['color'] }}">
                                            {{ $algo['label'] }}
                                        </span>
                                    </td>

                                    {{-- Mode Scan --}}
                                    <td class="px-4 py-3 text-center">
                                        @if ($mission->scan_mode === 'qlv')
                                            <span class="text-xs px-2 py-0.5 rounded-full font-medium bg-sky-100 text-sky-700">
                                                <i class="fa-solid fa-route mr-1"></i> QLV
                                            </span>
                                        @else
                                            <span class="text-xs px-2 py-0.5 rounded-full font-medium bg-violet-100 text-violet-700">
                                                <i class="fa-solid fa-shuffle mr-1"></i> Tradisional
                                            </span>
                                        @endif
                                    </td>

                                    {{-- Waypoints --}}
                                    <td class="px-4 py-3 text-center">
                                        <span class="font-bold text-slate-700">
                                            {{ is_array($mission->waypoints) ? count($mission->waypoints) : 0 }}
                                        </span>
                                        <span class="text-xs text-slate-400">titik</span>
                                    </td>

                                    {{-- Drone --}}
                                    <td class="px-4 py-3 text-center">
                                        @if ($mission->perangkat)
                                            <span class="text-xs font-medium text-slate-700">
                                                <i class="fa-solid fa-helicopter text-emerald-500 mr-1"></i>
                                                {{ $mission->perangkat->id_drone ?? '-' }}
                                            </span>
                                        @else
                                            <span class="text-slate-400 text-xs italic">—</span>
                                        @endif
                                    </td>

                                    {{-- Status --}}
                                    <td class="px-4 py-3 text-center">
                                        @php
                                            $statusStyle = match($mission->status) {
                                                'Completed' => 'bg-emerald-100 text-emerald-700 border border-emerald-200',
                                                'Uploaded'  => 'bg-sky-100 text-sky-700 border border-sky-200',
                                                'Saved'     => 'bg-amber-100 text-amber-700 border border-amber-200',
                                                default     => 'bg-slate-100 text-slate-600 border border-slate-200',
                                            };
                                            $statusIcon = match($mission->status) {
                                                'Completed' => 'fa-check-circle',
                                                'Uploaded'  => 'fa-upload',
                                                'Saved'     => 'fa-floppy-disk',
                                                default     => 'fa-circle-half-stroke',
                                            };
                                        @endphp
                                        <span class="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold {{ $statusStyle }}">
                                            <i class="fa-solid {{ $statusIcon }}"></i>
                                            {{ $mission->status }}
                                        </span>
                                    </td>

                                    {{-- Tanggal --}}
                                    <td class="px-4 py-3 text-center text-slate-600 text-xs whitespace-nowrap">
                                        <div>{{ $mission->created_at->format('d M Y') }}</div>
                                        <div class="text-slate-400">{{ $mission->created_at->format('H:i:s') }}</div>
                                    </td>

                                    {{-- Aksi --}}
                                    <td class="px-4 py-3 text-center">
                                        <button type="button"
                                            onclick="showDetail({{ $mission->id }}, '{{ addslashes($mission->mission_name) }}', '{{ $mission->nav_algorithm }}', '{{ $mission->scan_mode }}', {{ is_array($mission->waypoints) ? count($mission->waypoints) : 0 }}, '{{ $mission->status }}', '{{ $mission->created_at->format('d M Y H:i:s') }}')"
                                            class="text-slate-500 hover:text-emerald-600 transition" title="Lihat Detail">
                                            <i class="fa-solid fa-eye"></i>
                                        </button>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="9" class="px-4 py-16 text-center">
                                        <div class="flex flex-col items-center gap-3 text-slate-400">
                                            <i class="fa-solid fa-inbox text-5xl opacity-30"></i>
                                            <div class="text-sm font-medium">Belum ada log penerbangan</div>
                                            <div class="text-xs">Selesaikan misi di GCS untuk mencatat log penerbangan</div>
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
                @if ($missions->hasPages())
                    <div class="px-5 py-4 border-t border-slate-100">
                        {{ $missions->links() }}
                    </div>
                @endif
            </div>
        </div>
    </div>

    {{-- Modal Detail --}}
    <div id="modal-detail" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center hidden">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div class="flex items-center gap-2">
                    <i class="fa-solid fa-info-circle text-emerald-600"></i>
                    <h3 class="font-bold text-slate-800">Detail Misi</h3>
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
            function showDetail(id, name, algo, scan, wpCount, status, date) {
                const algoLabel = {
                    dead_reckoning: 'Dead Reckoning',
                    live_reckoning: 'Live Reckoning',
                    hybrid: 'Hybrid'
                }[algo] || algo;

                const scanLabel = scan === 'qlv' ? 'QLV (Quick Look Vision)' : 'Traditional Scan';

                document.getElementById('modal-body').innerHTML = `
                    <div class="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <div class="text-xs text-slate-400 mb-0.5">ID Misi</div>
                            <div class="font-mono font-bold text-slate-800 bg-slate-100 rounded px-2 py-1">#${String(id).padStart(4,'0')} <span class="text-slate-500 font-normal">· MSN-${id}</span></div>
                        </div>
                        <div>
                            <div class="text-xs text-slate-400 mb-0.5">Status</div>
                            <div class="font-semibold text-emerald-700">${status}</div>
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
                            <div class="text-xs text-slate-400 mb-0.5">Total Waypoints</div>
                            <div class="font-bold text-2xl text-slate-800">${wpCount} <span class="text-sm font-normal text-slate-400">titik</span></div>
                        </div>
                        <div>
                            <div class="text-xs text-slate-400 mb-0.5">Tersimpan</div>
                            <div class="font-medium text-slate-700 text-xs">${date}</div>
                        </div>
                    </div>
                `;
                document.getElementById('modal-detail').classList.remove('hidden');
            }

            function closeModal() {
                document.getElementById('modal-detail').classList.add('hidden');
            }

            // Close on backdrop click
            document.getElementById('modal-detail').addEventListener('click', function(e) {
                if (e.target === this) closeModal();
            });
        </script>
    @endpush
</x-app-layout>
