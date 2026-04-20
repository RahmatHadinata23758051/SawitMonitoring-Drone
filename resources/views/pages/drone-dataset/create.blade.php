<x-app-layout>
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
                <div class="bg-white shadow-sm w-full md:w-5/6 lg:w-3/4 h-auto px-6 py-4 rounded-lg">
                    <div class="mb-5">
                        <h3 class="text-lg font-semibold">Tambah Dataset Drone</h3>
                        <p class="text-sm text-slate-500">Silakan isi semua informasi yang dibutuhkan</p>
                    </div>
                    <form action="{{ route('drone-dataset.store') }}" method="post">
                        @csrf
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <x-input-label for="kode_kondisi">{{ __('Kode') }}</x-input-label>
                                <x-text-input id="kode_kondisi" class="block mt-1 w-full rounded-xl bg-gray-100"
                                    type="text" name="kode_kondisi" :value="old('kode_kondisi')" required autofocus
                                    autocomplete="kode_kondisi" />
                                <x-input-error :messages="$errors->get('kode_kondisi')" class="mt-2" />
                            </div>
                            <div>
                                <x-input-label for="nama_kondisi">{{ __('Nama Kondisi') }}</x-input-label>
                                <x-text-input id="nama_kondisi" class="block mt-1 w-full rounded-xl bg-gray-100"
                                    type="text" name="nama_kondisi" :value="old('nama_kondisi')" required autofocus
                                    autocomplete="nama_kondisi" />
                                <x-input-error :messages="$errors->get('nama_kondisi')" class="mt-2" />
                            </div>
                            <div>
                                <x-input-label for="accel_x">{{ __('Accelerometer X') }}</x-input-label>
                                <x-text-input id="accel_x" class="block mt-1 w-full rounded-xl bg-gray-100"
                                    type="text" name="accel_x" :value="old('accel_x')" required autofocus
                                    autocomplete="accel_x" inputmode="decimal" oninput="validateDecimal(this)" />
                                <x-input-error :messages="$errors->get('accel_x')" class="mt-2" />
                            </div>
                            <div>
                                <x-input-label for="accel_y">{{ __('Accelerometer Y') }}</x-input-label>
                                <x-text-input id="accel_y" class="block mt-1 w-full rounded-xl bg-gray-100"
                                    type="text" name="accel_y" :value="old('accel_y')" required autofocus
                                    autocomplete="accel_y" inputmode="decimal" oninput="validateDecimal(this)" />
                                <x-input-error :messages="$errors->get('accel_y')" class="mt-2" />
                            </div>
                            <div>
                                <x-input-label for="accel_z">{{ __('Accelerometer Z') }}</x-input-label>
                                <x-text-input id="accel_z" class="block mt-1 w-full rounded-xl bg-gray-100"
                                    type="text" name="accel_z" :value="old('accel_z')" required autofocus
                                    autocomplete="accel_z" inputmode="decimal" oninput="validateDecimal(this)" />
                                <x-input-error :messages="$errors->get('accel_z')" class="mt-2" />
                            </div>
                            <div>
                                <x-input-label for="gyro_x">{{ __('Gyroscope X') }}</x-input-label>
                                <x-text-input id="gyro_x" class="block mt-1 w-full rounded-xl bg-gray-100"
                                    type="text" name="gyro_x" :value="old('gyro_x')" required autofocus
                                    autocomplete="gyro_x" inputmode="decimal" oninput="validateDecimal(this)" />
                                <x-input-error :messages="$errors->get('gyro_x')" class="mt-2" />
                            </div>
                            <div>
                                <x-input-label for="gyro_y">{{ __('Gyroscope Y') }}</x-input-label>
                                <x-text-input id="gyro_y" class="block mt-1 w-full rounded-xl bg-gray-100"
                                    type="text" name="gyro_y" :value="old('gyro_y')" required autofocus
                                    autocomplete="gyro_y" inputmode="decimal" oninput="validateDecimal(this)" />
                                <x-input-error :messages="$errors->get('gyro_y')" class="mt-2" />
                            </div>
                            <div>
                                <x-input-label for="gyro_z">{{ __('Gyroscope Z') }}</x-input-label>
                                <x-text-input id="gyro_z" class="block mt-1 w-full rounded-xl bg-gray-100"
                                    type="text" name="gyro_z" :value="old('gyro_z')" required autofocus
                                    autocomplete="gyro_z" inputmode="decimal" oninput="validateDecimal(this)" />
                                <x-input-error :messages="$errors->get('gyro_z')" class="mt-2" />
                            </div>
                            <div class="flex items-center justify-end gap-3 md:col-span-2">
                                <a href="{{ route('drone-dataset.index') }}"
                                    class="bg-gray-200 text-slate-500 px-5 py-1.5 rounded-lg">Batal</a>
                                <button type="submit"
                                    class="bg-primary text-white px-5 py-1.5 rounded-lg">Simpan</button>
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
