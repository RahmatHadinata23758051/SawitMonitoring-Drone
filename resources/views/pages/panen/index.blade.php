<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-lg text-gray-800 leading-tight">
            {{ __('Manajemen Panen') }}
        </h2>
    </x-slot>

    <div class="pt-2 pb-12">
        <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex flex-col gap-4">
            <a href="{{ route('panen.create') }}"
                class="bg-primary text-white w-auto ms-auto rounded-lg py-2 px-3 flex justify-between items-center gap-2">
                <i class="fa-solid fa-circle-plus"></i>
                Tambah Panen
            </a>
            <div class="bg-white overflow-hidden shadow-sm">
                <div class="overflow-x-scroll">
                    <table class="w-full align-middle border-slate-400 table mb-0 px-2" id="panen-table">
                        <thead>
                            <tr>
                                <th class="dt-center">No</th>
                                <th class="dt-center">Tanggal Panen</th>
                                <th class="dt-center">Kebun</th>
                                <th class="dt-center">Target Panen (kg)</th>
                                <th class="dt-center">Hasil Panen (kg)</th>
                                <th class="dt-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="table-border-bottom-0" id="panen-tbody">
                            @foreach ($panen as $item)
                                <tr>
                                    <td>{{ $loop->iteration }}</td>
                                    <td>{{ Carbon\Carbon::parse($item->tanggal_panen)->translatedFormat('d F Y') }}</td>
                                    <td>{{ $item->kebun->nama }}</td>
                                    <td>{{ $item->target_panen }}</td>
                                    <td>{{ $item->hasil_panen }}</td>
                                    <td class="h-full">
                                        <div class="flex items-center justify-center gap-2 h-full">
                                            <a href="{{ route('panen.edit', $item->id) }}" class="h-100">
                                                <i class="fa fa-pen text-yellow-500"></i>
                                            </a>
                                            <form action="{{ route('panen.destroy', $item->id) }}" method="POST"
                                                class="delete-form" data-tanggal="{{ $item->tanggal_panen }}">
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
                    table = $('#panen-table').DataTable({
                        responsive: true,
                        ordering: false,
                        dom: '<"dt-toolbar flex justify-between items-center px-4 py-2 mb-2"Bf>rtp',
                        buttons: [{
                            extend: 'excel',
                            text: 'Export Excel',
                            title: 'Data Panen',
                            className: 'bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600',
                            filename: function() {
                                return `data_panen_${timestamp()}`;
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
                            emptyTable: "Tidak ada data panen yang tersedia",
                            paginate: {
                                previous: "<",
                                next: ">"
                            },
                            zeroRecords: "Data panen tidak ditemukan.",
                            search: "" // kosongkan label "Search:"
                        }
                    });

                    $('input.dt-input').attr('placeholder', 'Cari Panen...');
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

                        const tanggalPanen = this.getAttribute('data-tanggal');
                        Swal.fire({
                            title: 'Konfirmasi',
                            text: `Apakah Anda yakin ingin menghapus data panen di tanggal ${tanggalPanen}?`,
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
