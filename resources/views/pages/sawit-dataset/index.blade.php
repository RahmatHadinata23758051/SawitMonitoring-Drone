<x-app-layout>
    <x-slot name="header">
        <h2 class="leading-tight">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">
                    {{ __('Dataset') }}
                </li>
                <li class="breadcrumb-item breadcrumb-active">{{ __('Sawit') }}</li>
            </ol>
        </h2>
    </x-slot>

    <div class="pt-2 pb-12">
        <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex flex-col gap-4">
            <a href="{{ route('sawit-dataset.create') }}"
                class="bg-primary text-white w-auto ms-auto rounded-lg py-2 px-3 flex justify-between items-center gap-2">
                <i class="fa-solid fa-circle-plus"></i>
                Tambah Dataset
            </a>
            <div class="bg-white overflow-hidden shadow-sm">
                <div class="overflow-x-scroll">
                    <table class="w-full align-middle border-slate-400 table mb-0 px-2" id="drone-dataset-table">
                        <thead>
                            <tr>
                                <th class="dt-center">No</th>
                                <th class="dt-center">Kode</th>
                                <th class="dt-center">Nama</th>
                                <th class="dt-center">Warna</th>
                                <th class="dt-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="table-border-bottom-0" id="kebun-tbody">
                            @foreach ($dataset as $item)
                                <tr>
                                    <td>{{ $loop->iteration }}</td>
                                    <td>{{ $item->kode }}</td>
                                    <td>{{ $item->nama_class }}</td>
                                    <td>{{ $item->warna_buah }}</td>
                                    <td class="h-full">
                                        <div class="flex items-center justify-center gap-2 h-full">
                                            <a href="{{ route('sawit-dataset.edit', $item->id) }}" class="h-100">
                                                <i class="fa fa-pen text-yellow-500"></i>
                                            </a>
                                            <form action="{{ route('sawit-dataset.destroy', $item->id) }}" method="POST"
                                                class="delete-form" data-kode="{{ $item->kode }}">
                                                @csrf
                                                @method('DELETE')
                                                <button type="submit">
                                                    <i class="fa fa-trash text-danger"></i>
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
                    table = $('#drone-dataset-table').DataTable({
                        responsive: true,
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
                                columns: [0, 1, 2, 3, 4]
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
