<x-app-layout>
    <x-slot name="header">
        <h2 class="leading-tight">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">Laporan</li>
                <li class="breadcrumb-item breadcrumb-active">Log Aktivitas</li>
            </ol>
        </h2>
    </x-slot>

    <div class="pt-4 pb-12">
        <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-10 flex flex-col gap-5">
            <div>
                <h1 class="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <i class="fa-solid fa-clock-rotate-left text-primary"></i> Log Aktivitas
                </h1>
                <p class="text-sm text-slate-500 mt-0.5">Riwayat aktivitas pengguna di dalam sistem</p>
            </div>

            <div class="bg-white overflow-hidden shadow-sm rounded-2xl border border-slate-100">
                <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <i class="fa-solid fa-list-check text-primary text-sm"></i>
                        </div>
                        <h3 class="font-bold text-slate-800">Riwayat Aktivitas</h3>
                    </div>
                    <span class="text-xs bg-slate-100 text-slate-600 font-semibold px-3 py-1.5 rounded-full">{{ count($logs) }} Record</span>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full align-middle table mb-0 text-sm" id="activity-log-table">
                        <thead>
                            <tr class="text-xs uppercase tracking-widest text-slate-500 bg-slate-50 border-b border-slate-200">
                                <th class="dt-center px-4 py-3 font-semibold">No</th>
                                <th class="dt-center px-4 py-3 font-semibold">Waktu</th>
                                <th class="dt-center px-4 py-3 font-semibold">User</th>
                                <th class="dt-center px-4 py-3 font-semibold">Aksi</th>
                                <th class="text-left px-4 py-3 font-semibold">Deskripsi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            @foreach ($logs as $log)
                                <tr class="hover:bg-slate-50/70 transition-colors">
                                    <td class="px-4 py-3 text-center text-slate-500 font-medium">{{ $loop->iteration }}</td>
                                    <td class="px-4 py-3 text-center whitespace-nowrap">
                                        <div class="font-semibold text-slate-700 text-xs">{{ $log->created_at->format('d M Y') }}</div>
                                        <div class="text-slate-400 text-xs">{{ $log->created_at->format('H:i:s') }}</div>
                                    </td>
                                    <td class="px-4 py-3 text-center">
                                        <div class="flex items-center justify-center gap-2">
                                            <div class="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                                                {{ strtoupper(substr($log->causer ? $log->causer->name : 'S', 0, 1)) }}
                                            </div>
                                            <span class="font-semibold text-slate-700 text-xs">{{ $log->causer ? $log->causer->name : 'Sistem' }}</span>
                                        </div>
                                    </td>
                                    <td class="px-4 py-3 text-center">
                                        @php
                                            $eventColor = match($log->event) {
                                                'created' => 'bg-emerald-100 text-emerald-700 ring-emerald-200',
                                                'updated' => 'bg-amber-100 text-amber-700 ring-amber-200',
                                                'deleted' => 'bg-rose-100 text-rose-700 ring-rose-200',
                                                default => 'bg-slate-100 text-slate-600 ring-slate-200',
                                            };
                                        @endphp
                                        <span class="text-xs font-semibold px-2.5 py-1 rounded-full ring-1 {{ $eventColor }}">
                                            {{ ucfirst($log->event) }}
                                        </span>
                                    </td>
                                    <td class="px-4 py-3 text-slate-600 text-sm">{{ $log->description }}</td>
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
                    $('#activity-log-table').DataTable({ responsive: true, ordering: false, dom: '<"dt-toolbar flex justify-between items-center px-4 py-2 mb-2"Bf>rtp', buttons: [{ extend: 'excel', text: 'Export Excel', title: 'Log Aktivitas', className: 'bg-green-500 text-white px-3 py-1 rounded', filename: () => `log_aktivitas_${timestamp()}`, exportOptions: { columns: [0,1,2,3,4] } }], columnDefs: [{ className: "dt-center", targets: "_all" }], language: { emptyTable: "Tidak ada log aktivitas", paginate: { previous: "<", next: ">" }, zeroRecords: "Log tidak ditemukan.", search: "" } });
                    $('input.dt-input').attr('placeholder', 'Cari Log Aktivitas...');
                });
            });
        </script>
    @endpush
</x-app-layout>
