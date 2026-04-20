<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-lg text-gray-800 leading-tight">
            {{ __('Pengaturan Aplikasi') }}
        </h2>
    </x-slot>

    <div class="pt-2 pb-12">
        <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex flex-col gap-4">
            <form action="{{ route('pengaturan-aplikasi.store') }}" method="post" enctype="multipart/form-data">
                @csrf
                <div class="grid md:grid-cols-3 gap-3">
                    <div class="bg-white shadow-sm rounded-lg p-4 flex flex-col gap-3">
                        <p class="font-medium text-gray-700">
                            <i class="fa-solid fa-laptop text-primary mr-2"></i> Logo Website
                        </p>

                        <!-- Preview / Placeholder -->
                        <div class="border rounded-lg w-56 h-56 flex items-center justify-center bg-gray-50">
                            <span id="logoPlaceholder" class="text-gray-400 text-sm text-center px-2">
                                Foto max 2MB<br>format JPG/PNG
                            </span>
                            <img id="logoPreview" src="" alt="Logo Website"
                                class="hidden object-contain w-full h-full">
                        </div>

                        <!-- Buttons -->
                        <div class="flex gap-2 justify-between">
                            <input type="file" id="logoInput" name="logo_aplikasi" accept="image/*" class="hidden">

                            <button type="button"
                                class="px-3 py-2 bg-green-500 text-white text-sm rounded-lg shadow hover:bg-green-600 transition"
                                onclick="document.getElementById('logoInput').click()">
                                <i class="fa-solid fa-upload mr-1"></i> Upload Baru
                            </button>

                            <button type="button"
                                class="px-3 py-2 bg-gray-100 text-danger text-sm rounded-lg shadow hover:bg-gray-200 transition"
                                onclick="clearLogo()">
                                <i class="fa-solid fa-trash mr-1"></i> Hapus Logo
                            </button>
                        </div>
                    </div>
                    <div class="bg-white shadow-sm rounded-lg p-4 md:col-span-2 flex flex-col gap-3">
                        <p><i class="fa-solid fa-laptop text-primary me-2"></i> Informasi Website</p>
                        <div class="grid md:grid-cols-2 gap-3">
                            <div>
                                <x-input-label for="nama">{{ __('Nama Website') }}</x-input-label>
                                <x-text-input id="nama" class="block mt-1 w-full rounded-xl bg-gray-100"
                                    type="text" name="nama" :value="old('nama', $setting->nama ?? '')" required autofocus
                                    autocomplete="nama" />
                                <x-input-error :messages="$errors->get('nama')" class="mt-2" />
                            </div>
                            <div>
                                <x-input-label for="nama_tab">{{ __('Nama Tab Browser') }}</x-input-label>
                                <x-text-input id="nama_tab" class="block mt-1 w-full rounded-xl bg-gray-100"
                                    type="text" name="nama_tab" :value="old('nama_tab', $setting->nama_tab ?? '')" required autofocus
                                    autocomplete="nama_tab" />
                                <x-input-error :messages="$errors->get('nama_tab')" class="mt-2" />
                            </div>
                            <div>
                                <x-input-label for="versi">{{ __('Versi') }}</x-input-label>
                                <x-text-input id="versi" class="block mt-1 w-full rounded-xl bg-gray-100"
                                    type="text" name="versi" :value="old('versi', $setting->versi ?? '')" required autocomplete="versi" />
                                <x-input-error :messages="$errors->get('versi')" class="mt-2" />
                            </div>
                            <div>
                                <x-input-label for="copyright">{{ __('Copyright') }}</x-input-label>
                                <x-text-input id="copyright" class="block mt-1 w-full rounded-xl bg-gray-100"
                                    type="text" name="copyright" :value="old('copyright', $setting->copyright ?? '')" required
                                    autocomplete="copyright" />
                                <x-input-error :messages="$errors->get('copyright')" class="mt-2" />
                            </div>
                            <div>
                                <x-input-label for="tahun_copyright">{{ __('Tahun Copyright') }}</x-input-label>
                                <x-text-input id="tahun_copyright" class="block mt-1 w-full rounded-xl bg-gray-100"
                                    type="text" name="tahun_copyright" :value="old('tahun_copyright', $setting->tahun_copyright ?? '')" required
                                    autocomplete="tahun_copyright" />
                                <x-input-error :messages="$errors->get('tahun_copyright')" class="mt-2" />
                            </div>
                            <div class="md:col-span-2 mt-1 flex justify-end">
                                <div>
                                    <button type="submit"
                                        class="bg-primary text-white px-5 py-1.5 rounded-lg">Simpan</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
    @push('scripts')
        <script>
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

            // Handle input logo
            const logoInput = document.getElementById('logoInput');
            const logoPreview = document.getElementById('logoPreview');
            const logoPlaceholder = document.getElementById('logoPlaceholder');

            logoInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];

                    const reader = new FileReader();
                    reader.onload = (e) => {
                        logoPreview.src = e.target.result;
                        logoPreview.classList.remove('hidden');
                        logoPlaceholder.classList.add('hidden');
                    }
                    reader.readAsDataURL(file);
                }
            });

            function clearLogo() {
                logoInput.value = ""; // reset input
                logoPreview.src = "";
                logoPreview.classList.add('hidden');
                logoPlaceholder.classList.remove('hidden');
            }
        </script>
    @endpush
</x-app-layout>
