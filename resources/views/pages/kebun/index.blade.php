<x-app-layout>
    <x-slot name="header">
        <h2 class="leading-tight">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">Data Master</li>
                <li class="breadcrumb-item breadcrumb-active">Data Kebun</li>
            </ol>
        </h2>
    </x-slot>

    <div class="pt-6 pb-12">
        <div class="max-w-full mx-auto px-6 lg:px-10 flex flex-col gap-6">

            <div class="flex items-start justify-between gap-4">
                <div>
                    <h1 class="text-2xl font-black text-slate-800">Data Kebun</h1>
                    <p class="text-sm text-slate-500 mt-1">Kelola data kebun dan blok sawit</p>
                </div>
                <div class="flex items-center gap-3 shrink-0">
                    <div class="relative">
                        <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                        <input type="text" id="search-kebun" placeholder="Cari kebun..."
                            class="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary w-56 transition">
                    </div>
                    <a href="{{ route('kebun.create') }}"
                        class="inline-flex items-center gap-2 bg-primary text-white rounded-xl py-2 px-4 text-sm font-semibold hover:opacity-90 transition shadow-sm">
                        <i class="fa-solid fa-plus"></i> Tambah Kebun
                    </a>
                </div>
            </div>

            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div class="overflow-x-auto">
                    <table class="w-full text-sm" id="kebun-table">
                        <thead>
                            <tr class="border-b border-slate-200 bg-slate-50/80">
                                <th class="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">Kode Kebun</th>
                                <th class="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">Nama Kebun</th>
                                <th class="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">Lahan Induk</th>
                                <th class="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">Luas</th>
                                <th class="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">Jumlah Pohon</th>
                                <th class="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">Koordinat</th>
                                <th class="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            @forelse ($kebun as $item)
                                <tr class="hover:bg-slate-50/60 transition-colors">
                                    <td class="px-5 py-4">
                                        <span class="font-mono font-bold text-primary text-sm">KBN-{{ strtoupper(substr(md5($item->id), 0, 8)) }}</span>
                                    </td>
                                    <td class="px-5 py-4">
                                        <div class="font-semibold text-slate-800">{{ $item->nama }}</div>
                                    </td>
                                    <td class="px-5 py-4">
                                        <span class="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium border border-emerald-200">{{ $item->lahan->nama }}</span>
                                    </td>
                                    <td class="px-5 py-4 font-semibold text-slate-700">{{ $item->luas }}</td>
                                    <td class="px-5 py-4">
                                        <span class="font-bold text-slate-800">{{ $item->jumlah_pohon ?? 0 }}</span>
                                        <span class="text-xs text-slate-400 ml-1">pohon</span>
                                    </td>
                                    <td class="px-5 py-4">
                                        <span class="font-mono text-xs text-slate-500">{{ number_format((float)$item->latitude, 6) }}, {{ number_format((float)$item->longitude, 6) }}</span>
                                    </td>
                                    <td class="px-5 py-4">
                                        <div class="flex items-center justify-end gap-2">
                                            <a href="{{ route('kebun.edit', $item->id) }}"
                                                class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 text-white transition hover:bg-sky-600 shadow-sm">
                                                <i class="fa fa-pen text-xs"></i>
                                            </a>
                                            <form action="{{ route('kebun.destroy', $item->id) }}" method="POST" class="delete-form" data-nama="{{ $item->nama }}">
                                                @csrf @method('DELETE')
                                                <button type="submit" class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500 text-white transition hover:bg-rose-600 shadow-sm">
                                                    <i class="fa fa-trash text-xs"></i>
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            @empty
                                <tr><td colspan="7" class="px-5 py-16 text-center text-slate-400">
                                    <i class="fa-solid fa-tree text-4xl opacity-20 block mb-3"></i>Belum ada data kebun
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
                document.getElementById('search-kebun').addEventListener('input', function() {
                    const q = this.value.toLowerCase();
                    document.querySelectorAll('#kebun-table tbody tr').forEach(row => { row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none'; });
                });
                @if (session('success')) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: '{{ session('success') }}', showConfirmButton: false, timer: 2500, timerProgressBar: true }); @endif
                document.querySelectorAll('.delete-form').forEach(form => {
                    form.addEventListener('submit', function(e) { e.preventDefault(); Swal.fire({ title: 'Konfirmasi', text: `Hapus kebun "${this.dataset.nama}"?`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Ya, Hapus!', cancelButtonText: 'Batal' }).then(r => { if (r.isConfirmed) this.submit(); }); });
                });
            });
        </script>
    @endpush
</x-app-layout>
