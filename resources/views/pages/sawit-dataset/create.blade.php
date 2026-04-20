<x-app-layout>
    <x-slot name="header">
        <h2 class="leading-tight">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">
                    {{ __('Dataset') }}
                </li>
                <li class="breadcrumb-item">
                    <a href="{{ route('sawit-dataset.index') }}">Sawit</a>
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
                        <h3 class="text-lg font-semibold">Tambah Dataset Sawit</h3>
                        <p class="text-sm text-slate-500">Silakan isi semua informasi yang dibutuhkan</p>
                    </div>
                    <form action="{{ route('sawit-dataset.store') }}" method="post">
                        @csrf
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <x-input-label for="kode">{{ __('Kode') }}</x-input-label>
                                <x-text-input id="kode" class="block mt-1 w-full rounded-xl bg-gray-100"
                                    type="text" name="kode" :value="old('kode')" required autofocus
                                    autocomplete="kode" />
                                <x-input-error :messages="$errors->get('kode')" class="mt-2" />
                            </div>
                            <div>
                                <x-input-label for="nama">{{ __('Nama Class') }}</x-input-label>
                                <x-text-input id="nama" class="block mt-1 w-full rounded-xl bg-gray-100"
                                    type="text" name="nama" :value="old('nama')" required autofocus
                                    autocomplete="nama" />
                                <x-input-error :messages="$errors->get('nama')" class="mt-2" />
                            </div>
                            <div>
                                <x-input-label for="warna">{{ __('Warna Buah') }}</x-input-label>
                                <x-text-input id="warna" class="block mt-1 w-full rounded-xl bg-gray-100"
                                    type="text" name="warna" :value="old('warna')" required autofocus
                                    autocomplete="warna" />
                                <x-input-error :messages="$errors->get('warna')" class="mt-2" />
                            </div>
                            <div class="flex items-center justify-end gap-3 md:col-span-2">
                                <a href="{{ route('sawit-dataset.index') }}"
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
