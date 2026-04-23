<x-app-layout>
    <x-slot name="header">
        <h2 class="leading-tight">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">Data Master</li>
                <li class="breadcrumb-item breadcrumb-active">Data Perangkat (Drone)</li>
            </ol>
        </h2>
    </x-slot>

    <div class="pt-4 pb-12">
        <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-10 flex flex-col gap-5">

            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <i class="fa-solid fa-drone text-primary"></i> Data Perangkat (Drone)
                    </h1>
                    <p class="text-sm text-slate-500 mt-0.5">Manajemen perangkat drone yang terdaftar di sistem</p>
                </div>
                <a href="{{ route('perangkat.create') }}"
                    class="bg-primary text-white rounded-xl py-2.5 px-5 flex items-center gap-2 text-sm font-semibold shadow hover:opacity-90 transition">
                    <i class="fa-solid fa-circle-plus"></i> Tambah Perangkat
                </a>
            </div>

            <div class="bg-white overflow-hidden shadow-sm rounded-2xl border border-slate-100">
                <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <i class="fa-solid fa-microchip text-primary text-sm"></i>
                        </div>
                        <h3 class="font-bold text-slate-800">Daftar Perangkat</h3>
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full align-middle table mb-0 text-sm" id="perangkat-table">
                        <thead>
                            <tr class="text-xs uppercase tracking-widest text-slate-500 bg-slate-50 border-b border-slate-200">
                                <th class="dt-center px-4 py-3 font-semibold">No</th>
                                <th class="dt-center px-4 py-3 font-semibold">Timestamp</th>
                                <th class="dt-center px-4 py-3 font-semibold">ID Drone</th>
                                <th class="dt-center px-4 py-3 font-semibold">IP Drone</th>
                                <th class="dt-center px-4 py-3 font-semibold">Status</th>
                                <th class="dt-center px-4 py-3 font-semibold">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100" id="perangkat-tbody">
                            @foreach ($perangkat as $item)
                                <tr class="hover:bg-slate-50/70 transition-colors">
                                    <td class="px-4 py-3 text-center text-slate-500 font-medium">{{ $loop->iteration }}</td>
                                    <td class="px-4 py-3 text-center text-slate-600 text-xs whitespace-nowrap">
                                        <div class="font-semibold text-slate-700">{{ $item->created_at->translatedFormat('d F Y') }}</div>
                                        <div class="text-slate-400">{{ $item->created_at->format('H:i:s') }}</div>
                                    </td>
                                    <td class="px-4 py-3 text-center">
                                        <span class="font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg text-xs">{{ $item->id_drone }}</span>
                                    </td>
                                    <td class="px-4 py-3 text-center">
                                        <span class="font-mono text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg text-xs">{{ $item->ip_drone }}</span>
                                    </td>
                                    <td class="px-4 py-3 text-center">
                                        @if ($item->status)
                                            <span class="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
                                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Aktif
                                            </span>
                                        @else
                                            <span class="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 ring-1 ring-slate-200">
                                                <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Tidak Aktif
                                            </span>
                                        @endif
                                    </td>
                                    <td class="px-4 py-3">
                                        <div class="flex items-center justify-center gap-2">
                                            <a href="{{ route('perangkat.edit', $item->id) }}"
                                                class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600 transition hover:bg-amber-200">
                                                <i class="fa fa-pen text-sm"></i>
                                            </a>
                                            <form action="{{ route('perangkat.destroy', $item->id) }}" method="POST"
                                                class="delete-form" data-id="{{ $item->id_drone }}">
                                                @csrf
                                                @method('DELETE')
                                                <button type="submit"
                                                    class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-600 transition hover:bg-rose-200">
                                                    <i class="fa fa-trash text-sm"></i>
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    @push('scripts')
        <script>
            const timestamp = () => { const n = new Date(); return `${n.getFullYear()}${String(n.getMonth()+1).padStart(2,'0')}${String(n.getDate()).padStart(2,'0')}_${String(n.getHours()).padStart(2,'0')}${String(n.getMinutes()).padStart(2,'0')}${String(n.getSeconds()).padStart(2,'0')}`; }
            window.addEventListener('load', function() {
                $(document).ready(function() {
                    $('#perangkat-table').DataTable({ responsive: true, ordering: false, dom: '<"dt-toolbar flex justify-between items-center px-4 py-2 mb-2"Bf>rtp', buttons: [{ extend: 'excel', text: 'Export Excel', title: 'Data Perangkat (Drone)', className: 'bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600', filename: () => `data_perangkat_drone_${timestamp()}`, exportOptions: { columns: [0,1,2,3,4] } }], columnDefs: [{ className: "dt-center", targets: "_all" }], language: { emptyTable: "Tidak ada data perangkat", paginate: { previous: "<", next: ">" }, zeroRecords: "Data tidak ditemukan.", search: "" } });
                    $('input.dt-input').attr('placeholder', 'Cari Perangkat...');
                });
                @if (session('success'))
                    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: '{{ session('success') }}', showConfirmButton: false, timer: 2500, timerProgressBar: true });
                @endif
                document.querySelectorAll('.delete-form').forEach(form => {
                    form.addEventListener('submit', function(e) {
                        e.preventDefault();
                        Swal.fire({ title: 'Konfirmasi', text: `Hapus perangkat ID ${this.dataset.id}?`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Ya, Hapus!', cancelButtonText: 'Batal' }).then(r => { if (r.isConfirmed) this.submit(); });
                    });
                });
            });
        </script>
    @endpush
</x-app-layout>
