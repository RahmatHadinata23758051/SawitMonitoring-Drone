<x-app-layout>
    <x-slot name="header">
        <h2 class="leading-tight">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">Manajemen</li>
                <li class="breadcrumb-item breadcrumb-active">Data Panen</li>
            </ol>
        </h2>
    </x-slot>

    <div class="pt-4 pb-12">
        <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-10 flex flex-col gap-5">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <i class="fa-solid fa-basket-shopping text-primary"></i> Manajemen Panen
                    </h1>
                    <p class="text-sm text-slate-500 mt-0.5">Riwayat dan target panen perkebunan sawit</p>
                </div>
                <a href="{{ route('panen.create') }}" class="bg-primary text-white rounded-xl py-2.5 px-5 flex items-center gap-2 text-sm font-semibold shadow hover:opacity-90 transition">
                    <i class="fa-solid fa-circle-plus"></i> Tambah Panen
                </a>
            </div>

            <div class="bg-white overflow-hidden shadow-sm rounded-2xl border border-slate-100">
                <div class="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <i class="fa-solid fa-clipboard-list text-primary text-sm"></i>
                    </div>
                    <h3 class="font-bold text-slate-800">Daftar Panen</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full align-middle table mb-0 text-sm" id="panen-table">
                        <thead>
                            <tr class="text-xs uppercase tracking-widest text-slate-500 bg-slate-50 border-b border-slate-200">
                                <th class="dt-center px-4 py-3 font-semibold">No</th>
                                <th class="dt-center px-4 py-3 font-semibold">Tanggal Panen</th>
                                <th class="dt-center px-4 py-3 font-semibold">Kebun</th>
                                <th class="dt-center px-4 py-3 font-semibold">Target (kg)</th>
                                <th class="dt-center px-4 py-3 font-semibold">Hasil (kg)</th>
                                <th class="dt-center px-4 py-3 font-semibold">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100" id="panen-tbody">
                            @foreach ($panen as $item)
                                @php $pct = $item->target_panen > 0 ? round(($item->hasil_panen / $item->target_panen) * 100) : 0; @endphp
                                <tr class="hover:bg-slate-50/70 transition-colors">
                                    <td class="px-4 py-3 text-center text-slate-500 font-medium">{{ $loop->iteration }}</td>
                                    <td class="px-4 py-3 text-center whitespace-nowrap font-semibold text-slate-700">
                                        {{ Carbon\Carbon::parse($item->tanggal_panen)->translatedFormat('d F Y') }}
                                    </td>
                                    <td class="px-4 py-3 text-center">
                                        <span class="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg font-semibold">{{ $item->kebun->nama }}</span>
                                    </td>
                                    <td class="px-4 py-3 text-center font-mono font-bold text-slate-700">{{ number_format($item->target_panen) }}</td>
                                    <td class="px-4 py-3 text-center">
                                        <span class="font-mono font-bold {{ $pct >= 100 ? 'text-emerald-700' : ($pct >= 70 ? 'text-amber-700' : 'text-rose-700') }}">
                                            {{ number_format($item->hasil_panen) }}
                                        </span>
                                        <div class="text-[10px] {{ $pct >= 100 ? 'text-emerald-500' : ($pct >= 70 ? 'text-amber-500' : 'text-rose-500') }}">{{ $pct }}%</div>
                                    </td>
                                    <td class="px-4 py-3">
                                        <div class="flex items-center justify-center gap-2">
                                            <a href="{{ route('panen.edit', $item->id) }}" class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600 transition hover:bg-amber-200">
                                                <i class="fa fa-pen text-sm"></i>
                                            </a>
                                            <form action="{{ route('panen.destroy', $item->id) }}" method="POST" class="delete-form" data-tanggal="{{ $item->tanggal_panen }}">
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
                    $('#panen-table').DataTable({ responsive: true, ordering: false, dom: '<"dt-toolbar flex justify-between items-center px-4 py-2 mb-2"Bf>rtp', buttons: [{ extend: 'excel', text: 'Export Excel', title: 'Data Panen', className: 'bg-green-500 text-white px-3 py-1 rounded', filename: () => `data_panen_${timestamp()}`, exportOptions: { columns: [0,1,2,3,4] } }], columnDefs: [{ className: "dt-center", targets: "_all" }], language: { emptyTable: "Tidak ada data panen", paginate: { previous: "<", next: ">" }, zeroRecords: "Data tidak ditemukan.", search: "" } });
                    $('input.dt-input').attr('placeholder', 'Cari Panen...');
                });
                @if (session('success')) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: '{{ session('success') }}', showConfirmButton: false, timer: 2500, timerProgressBar: true }); @endif
                document.querySelectorAll('.delete-form').forEach(form => {
                    form.addEventListener('submit', function(e) { e.preventDefault(); Swal.fire({ title: 'Konfirmasi', text: `Hapus data panen ${this.dataset.tanggal}?`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Ya, Hapus!', cancelButtonText: 'Batal' }).then(r => { if (r.isConfirmed) this.submit(); }); });
                });
            });
        </script>
    @endpush
</x-app-layout>
