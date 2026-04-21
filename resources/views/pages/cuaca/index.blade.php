<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-lg text-gray-800 leading-tight">
            {{ __('Pengaturan Data Cuaca') }}
        </h2>
    </x-slot>

    <div class="pt-2 pb-12">
        <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex flex-col gap-4">

            {{-- ===== FORM PILIH LOKASI ===== --}}
            <form action="{{ route('cuaca.store') }}" method="post" class="bg-white rounded-xl shadow p-5">
                @csrf
                <h3 class="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
                    <i class="fa-solid fa-location-dot text-primary"></i> Pilih Wilayah Sumber Data Cuaca
                </h3>
                <p class="text-xs text-slate-400 mb-4">Setelah menyimpan lokasi, data cuaca akan otomatis diambil dari OpenWeatherMap.</p>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <x-input-label for="province">{{ __('Provinsi') }}</x-input-label>
                        <select id="province" class="block mt-1 w-full rounded-xl bg-gray-100 border-gray-200 text-sm" name="province" required>
                            <option value="">-- Pilih Provinsi --</option>
                            @foreach ($provinces as $province)
                                <option value="{{ $province->code }}" {{ ($cuaca?->province_code == $province->code) ? 'selected' : '' }}>
                                    {{ $province->name }}
                                </option>
                            @endforeach
                        </select>
                        <x-input-error :messages="$errors->get('province')" class="mt-2" />
                    </div>
                    <div>
                        <x-input-label for="city">{{ __('Kabupaten/Kota') }}</x-input-label>
                        <select id="city" class="block mt-1 w-full rounded-xl bg-gray-100 border-gray-200 text-sm" name="city" required>
                            <option value="">-- Pilih Kota/Kabupaten --</option>
                            @foreach($cities as $city)
                                <option value="{{ $city->code }}" {{ $cuaca?->city_code == $city->code ? 'selected' : '' }}>{{ $city->name }}</option>
                            @endforeach
                        </select>
                        <x-input-error :messages="$errors->get('city')" class="mt-2" />
                    </div>
                    <div>
                        <x-input-label for="district">{{ __('Kecamatan') }}</x-input-label>
                        <select id="district" class="block mt-1 w-full rounded-xl bg-gray-100 border-gray-200 text-sm" name="district" required>
                            <option value="">-- Pilih Kecamatan --</option>
                            @foreach($districts as $district)
                                <option value="{{ $district->code }}" {{ $cuaca?->district_code == $district->code ? 'selected' : '' }}>{{ $district->name }}</option>
                            @endforeach
                        </select>
                        <x-input-error :messages="$errors->get('district')" class="mt-2" />
                    </div>
                    <div>
                        <x-input-label for="village">{{ __('Desa') }}</x-input-label>
                        <select id="village" class="block mt-1 w-full rounded-xl bg-gray-100 border-gray-200 text-sm" name="village" required>
                            <option value="">-- Pilih Desa --</option>
                            @foreach($villages as $village)
                                <option value="{{ $village->code }}" {{ $cuaca?->village_code == $village->code ? 'selected' : '' }}>{{ $village->name }}</option>
                            @endforeach
                        </select>
                        <x-input-error :messages="$errors->get('village')" class="mt-2" />
                    </div>
                    <div class="md:col-span-2 mt-1 flex justify-end">
                        <button type="submit"
                            class="bg-primary text-white px-6 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition flex items-center gap-2">
                            <i class="fa-solid fa-floppy-disk"></i> Simpan & Perbarui Cuaca
                        </button>
                    </div>
                </div>
            </form>

            {{-- ===== WIDGET DATA CUACA TERKINI ===== --}}
            @if($cuaca && $cuaca->temperature)
                <div class="bg-white rounded-xl shadow p-5">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-base font-bold text-slate-800 flex items-center gap-2">
                            <i class="fa-solid fa-cloud-sun text-yellow-500"></i> Data Cuaca Terkini
                            <span class="text-xs font-normal text-slate-400 ml-1">
                                — {{ $cuaca->kabupaten_kota ?? '-' }}, {{ $cuaca->provinsi ?? '-' }}
                            </span>
                        </h3>
                        {{-- Tombol Refresh --}}
                        <form action="{{ route('cuaca.refresh') }}" method="POST" id="form-refresh">
                            @csrf
                            <button type="submit" id="btn-refresh"
                                class="flex items-center gap-1.5 px-4 py-1.5 bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold rounded-lg hover:bg-sky-100 transition">
                                <i class="fa-solid fa-rotate-right" id="icon-refresh"></i> Refresh dari OWM
                            </button>
                        </form>
                    </div>

                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {{-- Suhu --}}
                        <div class="flex flex-col items-center gap-2 p-4 rounded-xl bg-orange-50 border border-orange-100 text-center">
                            @if($cuaca->image)
                                <img src="{{ $cuaca->image }}" alt="Cuaca" class="w-14 h-14">
                            @else
                                <i class="fa-solid fa-temperature-half text-orange-400 text-3xl"></i>
                            @endif
                            <p class="text-3xl font-black text-slate-800">{{ $cuaca->temperature }}<span class="text-base text-slate-400">°C</span></p>
                            <p class="text-xs text-slate-500 font-medium">{{ ucfirst($cuaca->description ?? '-') }}</p>
                        </div>

                        {{-- Angin --}}
                        <div class="flex flex-col items-center justify-center gap-1.5 p-4 rounded-xl bg-sky-50 border border-sky-100 text-center">
                            <i class="fa-solid fa-wind text-sky-400 text-2xl"></i>
                            <p class="text-2xl font-black text-slate-800">{{ $cuaca->wind_speed ?? '--' }}<span class="text-xs text-slate-400 ml-1">km/h</span></p>
                            <p class="text-xs text-slate-500 font-medium">Kecepatan Angin</p>
                        </div>

                        {{-- Kelembaban --}}
                        <div class="flex flex-col items-center justify-center gap-1.5 p-4 rounded-xl bg-teal-50 border border-teal-100 text-center">
                            <i class="fa-solid fa-droplet text-teal-400 text-2xl"></i>
                            <p class="text-2xl font-black text-slate-800">{{ $cuaca->humidity ?? '--' }}<span class="text-xs text-slate-400 ml-1">%</span></p>
                            <p class="text-xs text-slate-500 font-medium">Kelembaban</p>
                        </div>

                        {{-- Curah Hujan --}}
                        <div class="flex flex-col items-center justify-center gap-1.5 p-4 rounded-xl bg-blue-50 border border-blue-100 text-center">
                            <i class="fa-solid fa-cloud-rain text-blue-400 text-2xl"></i>
                            <p class="text-2xl font-black text-slate-800">{{ $cuaca->rainfall ?? '0' }}<span class="text-xs text-slate-400 ml-1">mm</span></p>
                            <p class="text-xs text-slate-500 font-medium">Curah Hujan (1h)</p>
                        </div>
                    </div>

                    {{-- Diperbarui --}}
                    <p class="text-[11px] text-slate-400 mt-3 text-right">
                        <i class="fa-regular fa-clock"></i>
                        Terakhir diperbarui: {{ $cuaca->updated_at ? $cuaca->updated_at->timezone('Asia/Jakarta')->format('d M Y, H:i') . ' WIB' : '-' }}
                    </p>
                </div>
            @else
                <div class="bg-white rounded-xl shadow p-6 text-center text-slate-400 text-sm">
                    <i class="fa-solid fa-cloud-sun text-4xl mb-2 block opacity-30"></i>
                    Data cuaca belum tersedia. Simpan lokasi terlebih dahulu untuk mengambil data dari OpenWeatherMap.
                </div>
            @endif

        </div>
    </div>

    @push('scripts')
        <script>
            // Toast notifikasi
            @if (session('success'))
                Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: '{{ session('success') }}', showConfirmButton: false, timer: 3000, timerProgressBar: true });
            @endif
            @if (session('error'))
                Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: '{{ session('error') }}', showConfirmButton: false, timer: 4000, timerProgressBar: true });
            @endif

            // Spinner saat refresh
            document.getElementById('form-refresh')?.addEventListener('submit', function() {
                const icon = document.getElementById('icon-refresh');
                const btn  = document.getElementById('btn-refresh');
                if (icon) icon.classList.add('fa-spin');
                if (btn)  { btn.disabled = true; }
            });

            window.addEventListener('load', function() {

                // ===== CASCADE EVENT HANDLERS =====
                $('#province').on('change', function() {
                    const province_code = $(this).val();
                    $.post('/cuaca/kota', { province_code, _token: '{{ csrf_token() }}' }, function(data) {
                        $('#city').html('<option value="">-- Pilih Kota/Kabupaten --</option>');
                        data.forEach(c => $('#city').append(`<option value="${c.code}">${c.name}</option>`));
                        $('#district').html('<option value="">-- Pilih Kecamatan --</option>');
                        $('#village').html('<option value="">-- Pilih Desa --</option>');
                    });
                });

                $('#city').on('change', function() {
                    const city_code = $(this).val();
                    $.post('/cuaca/kecamatan', { city_code, _token: '{{ csrf_token() }}' }, function(data) {
                        $('#district').html('<option value="">-- Pilih Kecamatan --</option>');
                        data.forEach(d => $('#district').append(`<option value="${d.code}">${d.name}</option>`));
                        $('#village').html('<option value="">-- Pilih Desa --</option>');
                    });
                });

                $('#district').on('change', function() {
                    const district_code = $(this).val();
                    $.post('/cuaca/desa', { district_code, _token: '{{ csrf_token() }}' }, function(data) {
                        $('#village').html('<option value="">-- Pilih Desa --</option>');
                        data.forEach(v => $('#village').append(`<option value="${v.code}">${v.name}</option>`));
                    });
                });
                // (tidak perlu lagi auto-populate AJAX karena sudah dirender dari server)
            });
        </script>
    @endpush
</x-app-layout>
