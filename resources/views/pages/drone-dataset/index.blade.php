<x-app-layout>
    @php
        $primaryColumns = [
            ['key' => 'kode', 'label' => 'kode'],
            ['key' => 'label', 'label' => 'label'],
            ['key' => 'lat', 'label' => 'lat', 'numeric' => true],
            ['key' => 'lon', 'label' => 'lon', 'numeric' => true],
            ['key' => 'alt', 'label' => 'alt', 'numeric' => true],
        ];

        $groupedColumns = [
            [
                'title' => 'Acceleration',
                'header_class' => 'bg-sky-100 text-sky-700 border-sky-200',
                'columns' => [
                    ['key' => 'ax', 'label' => 'ax', 'numeric' => true],
                    ['key' => 'ay', 'label' => 'ay', 'numeric' => true],
                    ['key' => 'az', 'label' => 'az', 'numeric' => true],
                ],
            ],
            [
                'title' => 'Gyro',
                'header_class' => 'bg-emerald-100 text-emerald-700 border-emerald-200',
                'columns' => [
                    ['key' => 'gx', 'label' => 'gx', 'numeric' => true],
                    ['key' => 'gy', 'label' => 'gy', 'numeric' => true],
                    ['key' => 'gz', 'label' => 'gz', 'numeric' => true],
                ],
            ],
            [
                'title' => 'Velocity',
                'header_class' => 'bg-violet-100 text-violet-700 border-violet-200',
                'columns' => [
                    ['key' => 'vx', 'label' => 'vx', 'numeric' => true],
                    ['key' => 'vy', 'label' => 'vy', 'numeric' => true],
                    ['key' => 'vz', 'label' => 'vz', 'numeric' => true],
                ],
            ],
            [
                'title' => 'Distance',
                'header_class' => 'bg-amber-100 text-amber-700 border-amber-200',
                'columns' => [
                    ['key' => 'dist_front', 'label' => 'front', 'numeric' => true],
                    ['key' => 'dist_left', 'label' => 'left', 'numeric' => true],
                    ['key' => 'dist_right', 'label' => 'right', 'numeric' => true],
                    ['key' => 'dist_back', 'label' => 'back', 'numeric' => true],
                ],
            ],
        ];

        $tailColumns = [
            ['key' => 'obstacle_status', 'label' => 'obstacle_status'],
        ];

        $columns = $primaryColumns;
        foreach ($groupedColumns as $group) {
            $columns = array_merge($columns, $group['columns']);
        }
        $columns = array_merge($columns, $tailColumns);

        $formatNumber = static function ($value, int $precision = 6) {
            $formatted = number_format((float) $value, $precision, '.', '');
            return rtrim(rtrim($formatted, '0'), '.');
        };

        $statusBadgeClass = static function (?string $status) {
            $normalized = \Illuminate\Support\Str::lower(trim((string) $status));

            if (\Illuminate\Support\Str::contains($normalized, ['aman', 'clear', 'safe', 'no obstacle', 'bebas'])) {
                return 'bg-emerald-100 text-emerald-700 ring-emerald-200';
            }

            if (\Illuminate\Support\Str::contains($normalized, ['obstacle', 'bahaya', 'blocked', 'warning', 'near'])) {
                return 'bg-rose-100 text-rose-700 ring-rose-200';
            }

            return 'bg-amber-100 text-amber-700 ring-amber-200';
        };
    @endphp
    <x-slot name="header">
        <h2 class="leading-tight">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">
                    {{ __('Dataset') }}
                </li>
                <li class="breadcrumb-item breadcrumb-active">{{ __('Drone') }}</li>
            </ol>
        </h2>
    </x-slot>

    <div class="pt-2 pb-12">
        <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex flex-col gap-4">
            <a href="{{ route('drone-dataset.create') }}"
                class="bg-primary text-white w-auto ms-auto rounded-lg py-2 px-3 flex justify-between items-center gap-2">
                <i class="fa-solid fa-circle-plus"></i>
                Tambah Dataset
            </a>
            <div class="bg-white overflow-hidden shadow-sm rounded-2xl border border-slate-200">
                <div class="px-4 pt-4 pb-2 border-b border-slate-100">
                    <p class="text-sm text-slate-500">
                        Payload ditampilkan per grup sensor agar kolom lebih mudah dibaca saat data makin panjang.
                    </p>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full min-w-[1650px] align-middle table mb-0 text-sm whitespace-nowrap" id="drone-dataset-table">
                        <thead>
                            <tr class="text-[11px] uppercase tracking-[0.18em]">
                                <th rowspan="2" class="dt-center bg-slate-800 text-white border border-slate-700">No</th>
                                @foreach ($primaryColumns as $column)
                                    <th rowspan="2" class="dt-center bg-slate-800 text-white border border-slate-700">
                                        {{ $column['label'] }}
                                    </th>
                                @endforeach
                                @foreach ($groupedColumns as $group)
                                    <th colspan="{{ count($group['columns']) }}"
                                        class="dt-center border font-semibold {{ $group['header_class'] }}">
                                        {{ $group['title'] }}
                                    </th>
                                @endforeach
                                @foreach ($tailColumns as $column)
                                    <th rowspan="2" class="dt-center bg-slate-800 text-white border border-slate-700">
                                        {{ $column['label'] }}
                                    </th>
                                @endforeach
                                <th rowspan="2" class="dt-center bg-slate-800 text-white border border-slate-700">Aksi</th>
                            </tr>
                            <tr class="text-[11px] uppercase tracking-[0.18em]">
                                @foreach ($groupedColumns as $group)
                                    @foreach ($group['columns'] as $column)
                                        <th class="dt-center bg-slate-50 text-slate-600 border border-slate-200">
                                            {{ $column['label'] }}
                                        </th>
                                    @endforeach
                                @endforeach
                            </tr>
                        </thead>
                        <tbody class="table-border-bottom-0" id="kebun-tbody">
                            @foreach ($dataset as $item)
                                <tr class="even:bg-slate-50/70 hover:bg-sky-50/50 transition-colors">
                                    <td class="font-medium text-slate-500">{{ $loop->iteration }}</td>
                                    @foreach ($columns as $column)
                                        @php
                                            $value = $item->{$column['key']};
                                        @endphp
                                        <td class="border-b border-slate-100">
                                            @if ($column['key'] === 'kode')
                                                <span class="font-mono text-xs font-semibold text-slate-700">
                                                    {{ filled($value) ? $value : '-' }}
                                                </span>
                                            @elseif ($column['key'] === 'label')
                                                <span class="block min-w-[180px] max-w-[240px] whitespace-normal font-medium text-slate-700">
                                                    {{ filled($value) ? $value : '-' }}
                                                </span>
                                            @elseif ($column['key'] === 'obstacle_status')
                                                @if (filled($value))
                                                    <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset {{ $statusBadgeClass($value) }}">
                                                        {{ $value }}
                                                    </span>
                                                @else
                                                    <span class="text-slate-400">-</span>
                                                @endif
                                            @elseif ($column['numeric'] ?? false)
                                                <span class="font-mono text-xs text-slate-600">
                                                    {{ filled($value) ? $formatNumber($value, in_array($column['key'], ['lat', 'lon']) ? 6 : 4) : '-' }}
                                                </span>
                                            @else
                                                {{ filled($value) ? $value : '-' }}
                                            @endif
                                        </td>
                                    @endforeach
                                    <td class="h-full border-b border-slate-100">
                                        <div class="flex items-center justify-center gap-2 h-full">
                                            <a href="{{ route('drone-dataset.edit', $item->id) }}"
                                                class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600 transition hover:bg-amber-200">
                                                <i class="fa fa-pen text-sm"></i>
                                            </a>
                                            <form action="{{ route('drone-dataset.destroy', $item->id) }}" method="POST"
                                                class="delete-form" data-kode="{{ $item->kode }}">
                                                @csrf
                                                @method('DELETE')
                                                <button type="submit"
                                                    class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-600 transition hover:bg-rose-200">
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
                $(document).ready(function() {
                    const exportColumns = @json(range(1, count($columns)));

                    table = $('#drone-dataset-table').DataTable({
                        responsive: false,
                        scrollX: true,
                        autoWidth: false,
                        orderCellsTop: true,
                        ordering: false,
                        dom: '<"dt-toolbar flex justify-between items-center px-4 py-2 mb-2"Bf>rtp',
                        buttons: [{
                            extend: 'excel',
                            text: 'Export Excel',
                            title: 'Dataset Drone',
                            className: 'bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600',
                            filename: function() {
                                return `dataset_drone_${timestamp()}`;
                            },
                            exportOptions: {
                                columns: exportColumns
                            }
                        }],
                        columnDefs: [{
                            className: "dt-center",
                            targets: "_all"
                        }],
                        language: {
                            emptyTable: "Tidak ada dataset yang tersedia",
                            paginate: {
                                previous: "<",
                                next: ">"
                            },
                            zeroRecords: "Dataset tidak ditemukan.",
                            search: "" // kosongkan label "Search:"
                        }
                    });

                    $('input.dt-input').attr('placeholder', 'Cari dataset...');
                });

                // Alert berhasil
                @if (session('success'))
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: '{{ session('success') }}',
                        showConfirmButton: false,
                        timer: 2500,
                        timerProgressBar: true,
                        customClass: {
                            popup: 'toast-success'
                        }
                    });
                @endif

                // Alert confirm delete
                document.querySelectorAll('.delete-form').forEach(form => {
                    form.addEventListener('submit', function(event) {
                        event.preventDefault();

                        const kodeDataset = this.getAttribute('data-kode');
                        Swal.fire({
                            title: 'Konfirmasi',
                            text: `Apakah Anda yakin ingin menghapus dataset dengan kode ${kodeDataset}?`,
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonText: 'Ya, Hapus!',
                            cancelButtonText: 'Batal'
                        }).then((result) => {
                            if (result.isConfirmed) {
                                this.submit();
                            }
                        });
                    })
                });
            });
        </script>
    @endpush
</x-app-layout>
