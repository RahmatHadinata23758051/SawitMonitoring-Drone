<x-app-layout>
    @php
        $sections = [
            [
                'title' => 'Informasi Utama',
                'description' => 'Kode, label, dan status obstacle untuk payload dataset.',
                'grid' => 'md:grid-cols-2 xl:grid-cols-3',
                'fields' => [
                    ['name' => 'kode', 'label' => 'Kode', 'placeholder' => 'Contoh: DRN-001'],
                    ['name' => 'label', 'label' => 'Label', 'placeholder' => 'Contoh: Hover Aman'],
                    ['name' => 'obstacle_status', 'label' => 'Obstacle Status', 'placeholder' => 'Contoh: aman'],
                ],
            ],
            [
                'title' => 'Posisi',
                'description' => 'Koordinat dan ketinggian drone saat payload direkam.',
                'grid' => 'md:grid-cols-3',
                'fields' => [
                    ['name' => 'lat', 'label' => 'Lat', 'numeric' => true, 'placeholder' => '-2.123456'],
                    ['name' => 'lon', 'label' => 'Lon', 'numeric' => true, 'placeholder' => '106.123456'],
                    ['name' => 'alt', 'label' => 'Alt', 'numeric' => true, 'placeholder' => '150.5'],
                ],
            ],
            [
                'title' => 'Acceleration',
                'description' => 'Nilai akselerasi pada sumbu X, Y, dan Z.',
                'grid' => 'md:grid-cols-3',
                'fields' => [
                    ['name' => 'ax', 'label' => 'AX', 'numeric' => true, 'placeholder' => '0.11'],
                    ['name' => 'ay', 'label' => 'AY', 'numeric' => true, 'placeholder' => '0.22'],
                    ['name' => 'az', 'label' => 'AZ', 'numeric' => true, 'placeholder' => '0.33'],
                ],
            ],
            [
                'title' => 'Gyro',
                'description' => 'Nilai gyroscope pada sumbu X, Y, dan Z.',
                'grid' => 'md:grid-cols-3',
                'fields' => [
                    ['name' => 'gx', 'label' => 'GX', 'numeric' => true, 'placeholder' => '1.11'],
                    ['name' => 'gy', 'label' => 'GY', 'numeric' => true, 'placeholder' => '1.22'],
                    ['name' => 'gz', 'label' => 'GZ', 'numeric' => true, 'placeholder' => '1.33'],
                ],
            ],
            [
                'title' => 'Velocity',
                'description' => 'Kecepatan drone pada masing-masing sumbu.',
                'grid' => 'md:grid-cols-3',
                'fields' => [
                    ['name' => 'vx', 'label' => 'VX', 'numeric' => true, 'placeholder' => '2.11'],
                    ['name' => 'vy', 'label' => 'VY', 'numeric' => true, 'placeholder' => '2.22'],
                    ['name' => 'vz', 'label' => 'VZ', 'numeric' => true, 'placeholder' => '2.33'],
                ],
            ],
            [
                'title' => 'Distance',
                'description' => 'Jarak obstacle dari empat arah sensor.',
                'grid' => 'md:grid-cols-2 xl:grid-cols-4',
                'fields' => [
                    ['name' => 'dist_front', 'label' => 'Distance Front', 'numeric' => true, 'placeholder' => '3.11'],
                    ['name' => 'dist_left', 'label' => 'Distance Left', 'numeric' => true, 'placeholder' => '3.22'],
                    ['name' => 'dist_right', 'label' => 'Distance Right', 'numeric' => true, 'placeholder' => '3.33'],
                    ['name' => 'dist_back', 'label' => 'Distance Back', 'numeric' => true, 'placeholder' => '3.44'],
                ],
            ],
        ];
    @endphp
    <x-slot name="header">
        <h2 class="leading-tight">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">
                    {{ __('Dataset') }}
                </li>
                <li class="breadcrumb-item">
                    <a href="{{ route('drone-dataset.index') }}">Drone</a>
                </li>
                <li class="breadcrumb-item breadcrumb-active">
                    {{ __('Tambah Dataset') }}
                </li>
            </ol>
        </h2>
    </x-slot>

    <div class="pt-2 pb-12">
        <div class="max-w-8xl mx-auto px-3 sm:px-6 lg:px-8 flex flex-col gap-4">
            <div class="flex justify-center items-center w-full">
                <div class="bg-white shadow-sm w-full md:w-11/12 xl:w-5/6 h-auto px-6 py-5 rounded-2xl border border-slate-200">
                    <div class="mb-5">
                        <h3 class="text-lg font-semibold">Tambah Dataset Drone</h3>
                        <p class="text-sm text-slate-500">Silakan isi semua informasi yang dibutuhkan</p>
                    </div>
                    <form action="{{ route('drone-dataset.store') }}" method="post">
                        @csrf
                        <div class="space-y-6">
                            @foreach ($sections as $section)
                                <section class="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                                    <div class="mb-4">
                                        <h4 class="text-sm font-semibold uppercase tracking-[0.18em] text-slate-600">
                                            {{ $section['title'] }}
                                        </h4>
                                        <p class="mt-1 text-sm text-slate-500">{{ $section['description'] }}</p>
                                    </div>
                                    <div class="grid grid-cols-1 {{ $section['grid'] }} gap-5">
                                        @foreach ($section['fields'] as $field)
                                            @php
                                                $name = $field['name'];
                                                $isNumeric = $field['numeric'] ?? false;
                                            @endphp
                                            <div>
                                                <x-input-label for="{{ $name }}">{{ __($field['label']) }}</x-input-label>
                                                <input id="{{ $name }}" name="{{ $name }}" type="text"
                                                    value="{{ old($name) }}"
                                                    class="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm transition focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
                                                    placeholder="{{ $field['placeholder'] ?? '' }}"
                                                    autocomplete="{{ $name }}" required
                                                    @if ($loop->parent->first && $loop->first) autofocus @endif
                                                    @if ($isNumeric) inputmode="decimal" oninput="validateDecimal(this)" @endif>
                                                <x-input-error :messages="$errors->get($name)" class="mt-2" />
                                            </div>
                                        @endforeach
                                    </div>
                                </section>
                            @endforeach
                            <div class="flex items-center justify-end gap-3 pt-2">
                                <a href="{{ route('drone-dataset.index') }}"
                                    class="rounded-xl bg-gray-200 px-5 py-2 text-slate-500 transition hover:bg-gray-300">Batal</a>
                                <button type="submit"
                                    class="rounded-xl bg-primary px-5 py-2 text-white transition hover:brightness-95">Simpan</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
    @push('scripts')
        <script>
            function validateDecimal(input) {
                // Hanya izinkan angka, titik, koma, dan minus di awal
                input.value = input.value.replace(/[^0-9.,-]/g, '');

                // Pastikan minus hanya di awal
                input.value = input.value.replace(/(?!^)-/g, '');
            }
        </script>
    @endpush
</x-app-layout>
