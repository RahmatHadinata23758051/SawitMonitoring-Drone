<x-app-layout>
    <div class="min-h-screen bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl mx-auto space-y-6">

            {{-- PAGE HEADER --}}
            <div class="flex items-center gap-3">
                <a href="{{ route('dead-reckoning.index') }}" class="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-all shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </a>
                <div>
                    <div class="flex items-center gap-2 text-xs text-slate-400 font-medium mb-0.5">
                        <span>Rule Engine</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                        <a href="{{ route('dead-reckoning.index') }}" class="hover:text-blue-600 transition-colors">Dead-Reckoning</a>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                        <span class="text-slate-600 font-semibold">Tambah Rule</span>
                    </div>
                    <h1 class="text-xl font-black text-slate-800" style="letter-spacing:-0.03em">Tambah Rule Baru</h1>
                </div>
            </div>

            {{-- FORM CARD --}}
            <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

                {{-- Card Header --}}
                <div class="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/60">
                    <div class="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    </div>
                    <div>
                        <h3 class="font-bold text-slate-800 text-sm">Konfigurasi Rule Dead-Reckoning</h3>
                        <p class="text-xs text-slate-400 mt-0.5">Tentukan aksi drone, durasi, dan satuan waktu eksekusi</p>
                    </div>
                </div>

                {{-- Info Banner --}}
                <div class="mx-6 mt-5 p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3">
                    <div class="shrink-0 mt-0.5">
                        <svg class="w-4 h-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                    </div>
                    <p class="text-xs text-blue-700 font-medium leading-relaxed">
                        Rule dead-reckoning mendefinisikan berapa lama drone akan melakukan suatu aksi tertentu tanpa input sensor eksternal. Pastikan durasi dan satuan waktu sudah sesuai dengan spesifikasi misi.
                    </p>
                </div>

                {{-- Form --}}
                <form action="{{ route('dead-reckoning.store') }}" method="post" class="p-6">
                    @csrf
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">

                        {{-- Aksi Drone --}}
                        <div class="md:col-span-2">
                            <label for="aksi" class="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                                Aksi Drone <span class="text-rose-500">*</span>
                            </label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg class="w-4 h-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                                </div>
                                <select name="aksi" id="aksi"
                                    class="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium appearance-none cursor-pointer">
                                    <option value="">— Pilih Aksi Drone —</option>
                                    @foreach ($aksi as $item)
                                        <option value="{{ $item->id }}" @selected(old('aksi') == $item->id)>{{ $item->label }}</option>
                                    @endforeach
                                </select>
                                <div class="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                    <svg class="w-4 h-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                </div>
                            </div>
                            <x-input-error :messages="$errors->get('aksi')" class="mt-2" />
                        </div>

                        {{-- Durasi --}}
                        <div>
                            <label for="durasi" class="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                                Durasi <span class="text-rose-500">*</span>
                            </label>
                            <div class="relative group">
                                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg class="w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                </div>
                                <input id="durasi" name="durasi" type="number"
                                    value="{{ old('durasi') }}"
                                    required autofocus step="1" min="1"
                                    class="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium"
                                    placeholder="contoh: 30">
                            </div>
                            <x-input-error :messages="$errors->get('durasi')" class="mt-2" />
                        </div>

                        {{-- Satuan Waktu --}}
                        <div>
                            <label for="satuan_waktu" class="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                                Satuan Waktu <span class="text-rose-500">*</span>
                            </label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg class="w-4 h-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 6v6l4 2"/></svg>
                                </div>
                                <select name="satuan_waktu" id="satuan_waktu"
                                    class="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium appearance-none cursor-pointer">
                                    <option value="">— Pilih Satuan Waktu —</option>
                                    <option value="menit" @selected(old('satuan_waktu') == 'menit')>Menit</option>
                                    <option value="detik" @selected(old('satuan_waktu') == 'detik')>Detik</option>
                                    <option value="milidetik" @selected(old('satuan_waktu') == 'milidetik')>Milidetik</option>
                                </select>
                                <div class="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                    <svg class="w-4 h-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                </div>
                            </div>
                            <x-input-error :messages="$errors->get('satuan_waktu')" class="mt-2" />
                        </div>

                        {{-- Actions --}}
                        <div class="md:col-span-2 flex items-center justify-between pt-3 border-t border-slate-100">
                            <a href="{{ route('dead-reckoning.index') }}"
                                class="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-bold rounded-xl transition-all shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                                Batalkan
                            </a>
                            <button type="submit"
                                class="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md hover:shadow-blue-600/20 hover:-translate-y-0.5 active:translate-y-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                                Simpan Rule
                            </button>
                        </div>

                    </div>
                </form>
            </div>

        </div>
    </div>
</x-app-layout>
