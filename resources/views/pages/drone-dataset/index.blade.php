<x-app-layout>
    <x-slot name="header">
        <h2 class="leading-tight">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">Dataset</li>
                <li class="breadcrumb-item breadcrumb-active">Drone</li>
            </ol>
        </h2>
    </x-slot>

    <div class="pt-6 pb-12">
        <div class="max-w-full mx-auto px-6 lg:px-10 flex flex-col gap-6">
            <div class="flex items-start justify-between gap-4">
                <div>
                    <h1 class="text-2xl font-black text-slate-800">Dataset Drone</h1>
                    <p class="text-sm text-slate-500 mt-1">Data sensor IMU (Accelerometer & Gyroscope) untuk navigasi</p>
                </div>
                <div class="flex items-center gap-3 shrink-0">
                    <div class="relative">
                        <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                        <input type="text" id="search-drone" placeholder="Cari dataset..."
                            class="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary w-56 transition">
                    </div>
                    <a href="{{ route('drone-dataset.create') }}"
                        class="inline-flex items-center gap-2 bg-primary text-white rounded-xl py-2 px-4 text-sm font-semibold hover:opacity-90 transition shadow-sm">
                        <i class="fa-solid fa-plus"></i> Tambah Dataset
                    </a>
                </div>
            </div>

            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div class="overflow-x-auto">
                    <table class="w-full text-sm" id="drone-dataset-table">
                        <thead>
                            <tr class="border-b border-slate-200 bg-slate-50/80">
                                <th class="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">Kode</th>
                                <th class="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">Label Aksi</th>
                                <th class="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">GPS (LAT, LON, ALT)</th>
                                <th class="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">ACCELEROMETER (X, Y, Z)</th>
                                <th class="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">GYROSCOPE (X, Y, Z)</th>
                                <th class="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            @forelse ($dataset as $item)
                                <tr class="hover:bg-slate-50/60 transition-colors">
                                    <td class="px-5 py-4">
                                        <span class="font-mono font-bold text-primary text-sm">{{ $item->kode }}</span>
                                    </td>
                                    <td class="px-5 py-4 font-semibold text-slate-800">{{ $item->label }}</td>
                                    <td class="px-5 py-4">
                                        <div class="font-mono text-xs text-slate-500 space-y-0.5">
                                            <div class="text-emerald-600 font-semibold">{{ number_format((float)$item->lat, 7) }}</div>
                                            <div class="text-emerald-600 font-semibold">{{ number_format((float)$item->lon, 7) }}</div>
                                            <div class="text-slate-400">{{ number_format((float)$item->alt, 1) }}m asl</div>
                                        </div>
                                    </td>
                                    <td class="px-5 py-4">
                                        <div class="flex items-center gap-4 font-mono text-sm">
                                            <div class="flex flex-col"><span class="text-[10px] text-slate-400 uppercase">ax</span><span class="font-bold {{ $item->ax < 0 ? 'text-rose-600' : 'text-slate-700' }}">{{ number_format((float)$item->ax, 2) }}</span></div>
                                            <div class="flex flex-col"><span class="text-[10px] text-slate-400 uppercase">ay</span><span class="font-bold {{ $item->ay < 0 ? 'text-rose-600' : 'text-slate-700' }}">{{ number_format((float)$item->ay, 2) }}</span></div>
                                            <div class="flex flex-col"><span class="text-[10px] text-slate-400 uppercase">az</span><span class="font-bold {{ $item->az < 0 ? 'text-rose-600' : 'text-slate-700' }}">{{ number_format((float)$item->az, 2) }}</span></div>
                                        </div>
                                    </td>
                                    <td class="px-5 py-4">
                                        <div class="flex items-center gap-4 font-mono text-sm">
                                            <div class="flex flex-col"><span class="text-[10px] text-slate-400 uppercase">gx</span><span class="font-bold text-sky-700">{{ number_format((float)$item->gx, 2) }}</span></div>
                                            <div class="flex flex-col"><span class="text-[10px] text-slate-400 uppercase">gy</span><span class="font-bold text-sky-700">{{ number_format((float)$item->gy, 2) }}</span></div>
                                            <div class="flex flex-col"><span class="text-[10px] text-slate-400 uppercase">gz</span><span class="font-bold text-sky-700">{{ number_format((float)$item->gz, 2) }}</span></div>
                                        </div>
                                    </td>
                                    <td class="px-5 py-4">
                                        <div class="flex items-center justify-end gap-2">
                                            <a href="{{ route('drone-dataset.edit', $item->id) }}" class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 text-white transition hover:bg-sky-600 shadow-sm">
                                                <i class="fa fa-pen text-xs"></i>
                                            </a>
                                            <form action="{{ route('drone-dataset.destroy', $item->id) }}" method="POST" class="delete-form" data-kode="{{ $item->kode }}">
                                                @csrf @method('DELETE')
                                                <button type="submit" class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500 text-white transition hover:bg-rose-600 shadow-sm">
                                                    <i class="fa fa-trash text-xs"></i>
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            @empty
                                <tr><td colspan="6" class="px-5 py-16 text-center text-slate-400">
                                    <i class="fa-solid fa-drone text-4xl opacity-20 block mb-3"></i>Belum ada dataset drone
                                </td></tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    @push('scripts')
        <script>
            window.addEventListener('load', function() {
                document.getElementById('search-drone').addEventListener('input', function() {
                    const q = this.value.toLowerCase();
                    document.querySelectorAll('#drone-dataset-table tbody tr').forEach(row => { row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none'; });
                });
                @if (session('success')) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: '{{ session('success') }}', showConfirmButton: false, timer: 2500, timerProgressBar: true }); @endif
                document.querySelectorAll('.delete-form').forEach(form => {
                    form.addEventListener('submit', function(e) { e.preventDefault(); Swal.fire({ title: 'Konfirmasi', text: `Hapus dataset drone "${this.dataset.kode}"?`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Ya, Hapus!', cancelButtonText: 'Batal' }).then(r => { if (r.isConfirmed) this.submit(); }); });
                });
            });
        </script>
    @endpush
</x-app-layout>
