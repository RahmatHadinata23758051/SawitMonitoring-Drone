<x-app-layout>
    <x-slot name="header">
        <h2 class="leading-tight">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">
                    {{ __('Dataset') }}
                </li>
                <li class="breadcrumb-item">
                    <a href="{{ route('kebun-dataset.index') }}">Kebun</a>
                </li>
                <li class="breadcrumb-item breadcrumb-active">
                    {{ __('Edit Dataset') }}
                </li>
            </ol>
        </h2>
    </x-slot>

    <div class="pt-2 pb-12">
        <div class="max-w-8xl mx-auto px-3 sm:px-6 lg:px-8 flex flex-col gap-4">
            <div class="flex justify-center items-center w-full">
                <div class="bg-white shadow-sm w-full md:w-5/6 lg:w-3/4 h-auto px-6 py-4 rounded-lg">
                    <div class="mb-5">
                        <h3 class="text-lg font-semibold">Edit Dataset Kebun</h3>
                        <p class="text-sm text-slate-500">Silakan isi semua informasi yang dibutuhkan</p>
                    </div>
                    <form action="{{ route('kebun-dataset.update', $kebunDataset->id) }}" method="post">
                        @csrf
                        @method('PUT')
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <x-input-label for="kebun">{{ __('Pilih Kebun') }}</x-input-label>
                                <select name="kebun" id="kebun" class="block mt-1 w-full rounded-xl bg-gray-100">
                                    <option value="">--- Pilih Kebun ---</option>
                                    @foreach ($kebuns as $kebun)
                                        <option value="{{ $kebun->id }}" @selected($kebunDataset->kebun_id == $kebun->id)>
                                            {{ $kebun->nama }}</option>
                                    @endforeach
                                </select>
                            </div>
                            <div>
                                <x-input-label for="jumlah_pohon">{{ __('Jumlah Pohon') }}</x-input-label>
                                <x-text-input id="jumlah_pohon" class="block mt-1 w-full rounded-xl bg-gray-100"
                                    type="number" name="jumlah_pohon" :value="old('jumlah_pohon', $kebunDataset->jumlah_pohon)" required autofocus
                                    autocomplete="jumlah_pohon" min="0" step="1" />
                                <x-input-error :messages="$errors->get('jumlah_pohon')" class="mt-2" />
                            </div>
                            <div>
                                <x-input-label for="tinggi_pohon">{{ __('Tinggi Pohon (m)') }}</x-input-label>
                                <x-text-input id="tinggi_pohon" class="block mt-1 w-full rounded-xl bg-gray-100"
                                    type="number" name="tinggi_pohon" :value="old('tinggi_pohon', $kebunDataset->tinggi_pohon)" required autofocus
                                    autocomplete="tinggi_pohon" min="0" step="0.1" />
                                <x-input-error :messages="$errors->get('tinggi_pohon')" class="mt-2" />
                            </div>
                            <div>
                                <x-input-label
                                    for="interval_sejalur">{{ __('Interval Pohon Sejalur (m)') }}</x-input-label>
                                <x-text-input id="interval_sejalur" class="block mt-1 w-full rounded-xl bg-gray-100"
                                    type="number" name="interval_sejalur" :value="old('interval_sejalur', $kebunDataset->interval_pohon_sejalur)" required autofocus
                                    autocomplete="interval_sejalur" min="0" step="0.1" />
                                <x-input-error :messages="$errors->get('interval_sejalur')" class="mt-2" />
                            </div>
                            <div>
                                <x-input-label
                                    for="interval_menyamping">{{ __('Interval Pohon Menyamping (m)') }}</x-input-label>
                                <x-text-input id="interval_menyamping" class="block mt-1 w-full rounded-xl bg-gray-100"
                                    type="number" name="interval_menyamping" :value="old('interval_menyamping', $kebunDataset->interval_pohon_menyamping)" required autofocus
                                    autocomplete="interval_menyamping" min="0" step="0.1" />
                                <x-input-error :messages="$errors->get('interval_menyamping')" class="mt-2" />
                            </div>
                            <div class="flex items-center justify-end gap-3 md:col-span-2">
                                <a href="{{ route('kebun-dataset.index') }}"
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
