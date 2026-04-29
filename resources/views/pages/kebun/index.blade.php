<x-app-layout>
    <x-slot name="header">
        <h2 class="leading-tight">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">Data Master</li>
                <li class="breadcrumb-item breadcrumb-active">Data Kebun</li>
            </ol>
        </h2>
    </x-slot>

    <div class="pt-8 pb-16 w-full bg-slate-50 min-h-screen">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">

            {{-- Header & Actions --}}
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Data Kebun</h1>
                    <p class="text-slate-500 text-sm mt-1">Kelola blok perkebunan, inventaris pohon, dan pemetaan area operasional.</p>
                </div>
                <div class="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                    <div class="relative w-full sm:w-72">
                        <i class="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                        <input type="text" id="search-kebun" placeholder="Cari nama atau luas kebun..."
                            class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm bg-white">
                    </div>
                    <a href="{{ route('kebun.create') }}"
                        class="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg py-2.5 px-5 text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
                        <i class="fa-solid fa-plus"></i> Tambah Kebun
                    </a>
                </div>
            </div>

            {{-- Table Card --}}
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-sm" id="kebun-table">
                        <thead>
                            <tr class="border-b border-slate-200 bg-slate-50">
                                <th class="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Profil Kebun
                                </th>
                                <th class="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Lahan Induk
                                </th>
                                <th class="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Statistik
                                </th>
                                <th class="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Geospasial
                                </th>
                                <th class="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            @forelse ($kebun as $item)
                                <tr class="hover:bg-slate-50/50 transition-colors">
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-3">
                                            <div class="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 border border-slate-200">
                                                <i class="fa-solid fa-layer-group text-sm"></i>
                                            </div>
                                            <div>
                                                <div class="font-semibold text-slate-900">{{ $item->nama }}</div>
                                                <div class="font-mono text-xs text-slate-500 mt-0.5">KBN-{{ strtoupper(substr(md5($item->id), 0, 6)) }}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4">
                                        <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                            {{ $item->lahan->nama ?? '-' }}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="flex flex-col gap-1">
                                            <div class="text-sm text-slate-900 font-medium">
                                                {{ $item->luas }} <span class="text-slate-500 font-normal">Ha</span>
                                            </div>
                                            <div class="text-xs text-slate-500">
                                                {{ $item->jumlah_pohon ?? 0 }} Pohon
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="font-mono text-xs text-slate-600 bg-slate-50 px-2 py-1.5 rounded border border-slate-100 inline-block">
                                            <div>{{ number_format((float)$item->latitude, 6) }}</div>
                                            <div>{{ number_format((float)$item->longitude, 6) }}</div>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="flex items-center justify-end gap-2">
                                            <a href="{{ route('kebun.edit', $item->id) }}"
                                                class="inline-flex p-2 items-center justify-center rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit">
                                                <i class="fa-solid fa-pen text-sm"></i>
                                            </a>
                                            <form action="{{ route('kebun.destroy', $item->id) }}" method="POST" class="delete-form" data-nama="{{ $item->nama }}">
                                                @csrf @method('DELETE')
                                                <button type="submit" class="inline-flex p-2 items-center justify-center rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Hapus">
                                                    <i class="fa-solid fa-trash text-sm"></i>
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="5" class="px-6 py-20 text-center">
                                        <div class="flex flex-col items-center">
                                            <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                                <i class="fa-solid fa-inbox text-slate-300 text-2xl"></i>
                                            </div>
                                            <p class="text-base font-semibold text-slate-900">Belum Ada Data Kebun</p>
                                            <p class="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                                                Anda belum memetakan blok kebun apapun. Buat profil kebun untuk mulai memonitor lahan.
                                            </p>
                                            <a href="{{ route('kebun.create') }}" class="mt-6 inline-flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 rounded-lg py-2 px-4 text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
                                                <i class="fa-solid fa-plus text-slate-400"></i> Buat Kebun
                                            </a>
                                        </div>
                                    </td>
                                </tr>
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
                const searchInput = document.getElementById('search-kebun');
                if(searchInput) {
                    searchInput.addEventListener('input', function() {
                        const q = this.value.toLowerCase();
                        document.querySelectorAll('#kebun-table tbody tr').forEach(row => { 
                            row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none'; 
                        });
                    });
                }
                
                @if (session('success')) 
                    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: '{{ session('success') }}', showConfirmButton: false, timer: 2500, timerProgressBar: true }); 
                @endif
                
                document.querySelectorAll('.delete-form').forEach(form => {
                    form.addEventListener('submit', function(e) { 
                        e.preventDefault(); 
                        Swal.fire({ 
                            title: 'Hapus Kebun?', 
                            text: `Anda yakin ingin menghapus data "${this.dataset.nama}"?`, 
                            icon: 'warning', 
                            showCancelButton: true, 
                            confirmButtonColor: '#ef4444',
                            cancelButtonColor: '#cbd5e1',
                            confirmButtonText: 'Ya, Hapus', 
                            cancelButtonText: 'Batal',
                            customClass: {
                                confirmButton: 'rounded-lg px-4 py-2 font-semibold',
                                cancelButton: 'rounded-lg px-4 py-2 font-semibold text-slate-700'
                            }
                        }).then(r => { if (r.isConfirmed) this.submit(); }); 
                    });
                });
            });
        </script>
    @endpush
</x-app-layout>
