<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-lg text-gray-800 leading-tight">
            {{ __('Laporan') }}
        </h2>
    </x-slot>

    <div class="pt-2 pb-12">
        <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex flex-col gap-4">
            <div class="bg-white overflow-hidden shadow-sm">
                <div class="overflow-x-scroll">
                    <table class="w-full align-middle border-slate-400 table mb-0 mt-3" id="laporan-table">
                        <thead>
                            <tr>
                                <th class="dt-center">No</th>
                                <th class="dt-center">Timestamp</th>
                                <th class="dt-center">Sampel Ke</th>
                                <th class="dt-center">Status Kematangan</th>
                                <th class="dt-center">Analisa</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach ($laporan as $item)
                                <tr>
                                    <td>{{ $loop->iteration }}</td>
                                    <td>{{ $item->created_at->format('d M Y H:i:s') }}</td>
                                    <td>{{ $item->sampel_ke }}</td>
                                    <td>{{ $item->status }}</td>
                                    <td>{{ $item->analisa }}</td>
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
            // Get current timestamp for filename
            const timestamp = () => {
                const now = new Date();
                const date = now.getDate().toString().padStart(2, '0');
                const month = (now.getMonth() + 1).toString().padStart(2, '0');
                const year = now.getFullYear();
                const hours = now.getHours().toString().padStart(2, '0');
                const minutes = now.getMinutes().toString().padStart(2, '0');
                const seconds = now.getSeconds().toString().padStart(2, '0');

                return `${year}${month}${date}_${hours}${minutes}${seconds}`;
            }

            window.addEventListener('load', function() {
                // DataTable (using jQuery)
                let table;
                table = $('#laporan-table').DataTable({
                    responsive: true,
                    ordering: false,
                    dom: '<"dt-toolbar flex justify-between items-center px-4 py-4"Bf>rtp',
                    buttons: [{
                        extend: 'excel',
                        text: 'Export Excel',
                        title: 'Laporan',
                        className: 'bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600',
                        filename: function() {
                            return `laporan_${timestamp()}`;
                        },
                        exportOptions: {
                            columns: [0, 1, 2, 3, 4]
                        }
                    }],
                    columnDefs: [{
                        className: "dt-center",
                        targets: "_all"
                    }],
                    language: {
                        emptyTable: "Tidak ada laporan yang tersedia",
                        paginate: {
                            previous: "<",
                            next: ">"
                        },
                        zeroRecords: "Laporan tidak ditemukan.",
                        search: "" // kosongkan label "Search:"
                    }
                });

                $('input.dt-input').attr('placeholder', 'Cari Laporan...');
            });
        </script>
    @endpush
</x-app-layout>
