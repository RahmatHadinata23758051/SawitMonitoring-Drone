<x-app-layout>
    <x-slot name="header">
        <h2 class="leading-tight">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">
                    {{ __('Data Master') }}
                </li>
                <li class="breadcrumb-item">
                    <a href="{{ route('perangkat.index') }}">Data Perangkat (Drone)</a>
                </li>
                <li class="breadcrumb-item breadcrumb-active">
                    {{ __('Tambah Data') }}
                </li>
            </ol>
        </h2>
    </x-slot>

    <div class="pt-2 pb-12">
        <div class="max-w-8xl mx-auto px-3 sm:px-6 lg:px-8 flex flex-col gap-4">
            <div class="flex justify-center items-center w-full">
                <div class="bg-white shadow-sm w-full md:w-5/6 lg:w-3/4 h-auto px-6 py-4 rounded-lg">
                    <div class="mb-5">
                        <h3 class="text-lg font-semibold">Tambah Data Perangkat (Drone)</h3>
                        <p class="text-sm text-slate-500">Silakan isi semua informasi yang dibutuhkan</p>
                    </div>
                    <form action="{{ route('perangkat.store') }}" method="post">
                        @csrf
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <x-input-label for="id_drone">{{ __('ID Drone') }}</x-input-label>
                                <x-text-input id="id_drone" class="block mt-1 w-full rounded-xl bg-gray-100"
                                    type="text" name="id_drone" :value="old('id_drone')" required autofocus
                                    autocomplete="id_drone" />
                                <x-input-error :messages="$errors->get('id_drone')" class="mt-2" />
                            </div>
                            <div>
                                <x-input-label for="ip_drone">{{ __('IP Drone') }}</x-input-label>
                                <x-text-input id="ip_drone" class="block mt-1 w-full rounded-xl bg-gray-100"
                                    type="text" name="ip_drone" :value="old('ip_drone')" required autofocus
                                    autocomplete="ip_drone" />
                                <x-input-error :messages="$errors->get('ip_drone')" class="mt-2" />
                            </div>
                            <div>
                                <x-input-label for="status">{{ __('Status Perangkat') }}</x-input-label>
                                <select name="status" id="status" class="block mt-1 w-full rounded-xl bg-gray-100">
                                    <option value="">--- Pilih status ---</option>
                                    <option value="1">Aktif</option>
                                    <option value="0">Tidak Aktif</option>
                                </select>
                                <x-input-error :messages="$errors->get('status')" class="mt-2" />
                            </div>
                            <div class="flex items-center justify-end gap-3 col-span-2">
                                <a href="{{ route('perangkat.index') }}"
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
</x-app-layout>
