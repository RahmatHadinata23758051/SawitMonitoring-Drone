<x-app-layout>
    <x-slot name="header">
        <h2 class="leading-tight">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">
                    {{ __('Rule Engine') }}
                </li>
                <li class="breadcrumb-item">
                    <a href="{{ route('dead-reckoning.index') }}">Dead-Reckoning</a>
                </li>
                <li class="breadcrumb-item breadcrumb-active">
                    {{ __('Tambah Rule') }}
                </li>
            </ol>
        </h2>
    </x-slot>

    <div class="pt-2 pb-12">
        <div class="max-w-8xl mx-auto px-3 sm:px-6 lg:px-8 flex flex-col gap-4">
            <div class="flex justify-center items-center w-full">
                <div class="bg-white shadow-sm w-full md:w-5/6 lg:w-3/4 h-auto px-6 py-4 rounded-lg">
                    <div class="mb-5">
                        <h3 class="text-lg font-semibold">Tambah Rule</h3>
                        <p class="text-sm text-slate-500">Silakan isi semua informasi yang dibutuhkan</p>
                    </div>
                    <form action="{{ route('dead-reckoning.store') }}" method="post">
                        @csrf
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <x-input-label for="aksi">{{ __('Aksi Drone') }}</x-input-label>
                                <select name="aksi" id="aksi" class="block mt-1 w-full rounded-xl bg-gray-100">
                                    <option value="">--- Pilih aksi ---</option>
                                    @foreach ($aksi as $item)
                                        <option value="{{ $item->id }}" @selected(old('aksi') == $item->id)>{{ $item->label }}</option>
                                    @endforeach
                                </select>
                                <x-input-error :messages="$errors->get('aksi')" class="mt-2" />
                            </div>
                            <div>
                                <x-input-label for="durasi">{{ __('Durasi') }}</x-input-label>
                                <x-text-input id="durasi" class="block mt-1 w-full rounded-xl bg-gray-100"
                                    type="number" name="durasi" :value="old('durasi')" required autofocus
                                    autocomplete="durasi" step="1" min="1" />
                                <x-input-error :messages="$errors->get('durasi')" class="mt-2" />
                            </div>
                            <div>
                                <x-input-label for="satuan_waktu">{{ __('Satuan Waktu') }}</x-input-label>
                                <select name="satuan_waktu" id="satuan_waktu"
                                    class="block mt-1 w-full rounded-xl bg-gray-100">
                                    <option value="">--- Pilih satuan waktu ---</option>
                                    <option value="menit" @selected(old('satuan_waktu') == 'menit')>Menit</option>
                                    <option value="detik" @selected(old('satuan_waktu') == 'detik')>Detik</option>
                                    <option value="milidetik" @selected(old('satuan_waktu') == 'milidetik')>Milidetik</option>
                                </select>
                                <x-input-error :messages="$errors->get('satuan_waktu')" class="mt-2" />
                            </div>
                            <div class="flex items-center justify-end gap-3 md:col-span-2">
                                <a href="{{ route('dead-reckoning.index') }}"
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
