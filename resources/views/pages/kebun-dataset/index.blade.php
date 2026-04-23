<x-app-layout>
    <x-slot name="header">
        <h2 class="leading-tight">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">Dataset</li>
                <li class="breadcrumb-item breadcrumb-active">Kebun</li>
            </ol>
        </h2>
    </x-slot>

    <div class="pt-4 pb-12">
        <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-10 flex flex-col gap-5">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <i class="fa-solid fa-tree text-primary"></i> Dataset Kebun
                    </h1>
                    <p class="text-sm text-slate-500 mt-0.5">Data parameter fisik kebun untuk navigasi drone</p>
                </div>
                <a href="{{ route('kebun-dataset.create') }}" class="bg-primary text-white rounded-xl py-2.5 px-5 flex items-center gap-2 text-sm font-semibold shadow hover:opacity-90 transition">
                    <i class="fa-solid fa-circle-plus"></i> Tambah Dataset
                </a>
            </div>

            <div class="bg-white overflow-hidden shadow-sm rounded-2xl border border-slate-100">
                <div class="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <i class="fa-solid fa-table text-primary text-sm"></i>
                    </div>
                    <h3 class="font-bold text-slate-800">Daftar Dataset Kebun</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full align-middle table mb-0 text-sm" id="kebun-dataset-table">
                        <thead>
                            <tr class="text-xs uppercase tracking-widest text-slate-500 bg-slate-50 border-b border-slate-200">
                                <th class="dt-center px-4 py-3 font-semibold">No</th>
                                <th class="dt-center px-4 py-3 font-semibold">Kebun</th>
                                <th class="dt-center px-4 py-3 font-semibold">Jumlah Pohon</th>
                                <th class="dt-center px-4 py-3 font-semibold">Tinggi Pohon (m)</th>
                                <th class="dt-center px-4 py-3 font-semibold">Jarak Sejalur (m)</th>
                                <th class="dt-center px-4 py-3 font-semibold">Jarak Menyamping (m)</th>
                                <th class="dt-center px-4 py-3 font-semibold">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100" id="kebun-tbody">
                            @foreach ($dataset as $item)
                                <tr class="hover:bg-slate-50/70 transition-colors">
                                    <td class="px-4 py-3 text-center text-slate-500 font-medium">{{ $loop->iteration }}</td>
                                    <td class="px-4 py-3 text-center">
                                        <span class="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg font-semibold">{{ $item->kebun->nama }}</span>
                                    </td>
                                    <td class="px-4 py-3 text-center font-bold text-slate-800">{{ $item->jumlah_pohon }}</td>
                                    <td class="px-4 py-3 text-center font-mono text-slate-700">{{ $item->tinggi_pohon }}</td>
                                    <td class="px-4 py-3 text-center font-mono text-slate-700">{{ $item->interval_pohon_sejalur }}</td>
                                    <td class="px-4 py-3 text-center font-mono text-slate-700">{{ $item->interval_pohon_menyamping }}</td>
                                    <td class="px-4 py-3">
                                        <div class="flex items-center justify-center gap-2">
                                            <a href="{{ route('kebun-dataset.edit', $item->id) }}" class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600 transition hover:bg-amber-200">
                                                <i class="fa fa-pen text-sm"></i>
                                            </a>
                                            <form action="{{ route('kebun-dataset.destroy', $item->id) }}" method="POST" class="delete-form" data-kebun="{{ $item->kebun->nama }}">
                                                @csrf @method('DELETE')
                                                <button type="submit" class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-600 transition hover:bg-rose-200">
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
                    $('#kebun-dataset-table').DataTable({ responsive: true, ordering: false, dom: '<"dt-toolbar flex justify-between items-center px-4 py-2 mb-2"Bf>rtp', buttons: [{ extend: 'excel', text: 'Export Excel', title: 'Dataset Kebun', className: 'bg-green-500 text-white px-3 py-1 rounded', filename: () => `dataset_kebun_${timestamp()}`, exportOptions: { columns: [0,1,2,3,4,5] } }], columnDefs: [{ className: "dt-center", targets: "_all" }], language: { emptyTable: "Tidak ada dataset", paginate: { previous: "<", next: ">" }, zeroRecords: "Data tidak ditemukan.", search: "" } });
                    $('input.dt-input').attr('placeholder', 'Cari dataset...');
                });
                @if (session('success')) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: '{{ session('success') }}', showConfirmButton: false, timer: 2500, timerProgressBar: true }); @endif
                document.querySelectorAll('.delete-form').forEach(form => {
                    form.addEventListener('submit', function(e) { e.preventDefault(); Swal.fire({ title: 'Konfirmasi', text: `Hapus dataset kebun "${this.dataset.kebun}"?`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Ya, Hapus!', cancelButtonText: 'Batal' }).then(r => { if (r.isConfirmed) this.submit(); }); });
                });
            });
        </script>
    @endpush
</x-app-layout>
