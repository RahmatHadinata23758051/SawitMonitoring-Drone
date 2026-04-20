<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title id="tab-browser"></title>

    {{-- <link rel="icon" href="{{ asset('images/logoMakesens.png') }}"> --}}

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700&display=swap"
        rel="stylesheet">

    <!-- Icons. Uncomment required icon fonts -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
        integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A=="
        crossorigin="anonymous" referrerpolicy="no-referrer" />

    @stack('styles')
    <!-- Scripts -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>

<body class="font-sans antialiased">
    <div x-data="{}" class="min-h-screen w-full flex flex-col bg-gray-100">
        @include('layouts.navigation')

        <!-- Page Heading -->
        @isset($header)
            <header class="bg-white shadow-sm border-b border-gray-200">
                <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                    {{ $header }}
                </div>
            </header>
        @endisset

        <!-- Page Content -->
        <main class="flex-1">
            {{ $slot }}
        </main>

        <!-- Footer -->
        <footer class="px-6 py-3 text-center font-normal text-sm text-slate-400 border-t border-slate-200 bg-white" id="footer"></footer>
    </div>


    <x-modal name="sign-out" style="z-index: 999999999;" focusable>
        <form method="post" action="{{ route('logout') }}" class="p-6">
            @csrf
            <h2 class="text-lg font-medium text-gray-900">
                {{ __('Apakah anda yakin ingin keluar?') }}
            </h2>

            <div class="mt-6 flex justify-end">
                <x-secondary-button x-on:click="$dispatch('close')">
                    {{ __('Batalkan') }}
                </x-secondary-button>

                <x-danger-button class="ms-3">
                    {{ __('Keluar') }}
                </x-danger-button>
            </div>
        </form>
    </x-modal>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/js/all.min.js"
        integrity="sha512-u3fPA7V8qQmhBPNT5quvaXVa1mnnLSXUep5PS1qo5NRzHwG19aHmNJnj1Q8hpA/nBWZtZD4r4AX6YOt5ynLN2g=="
        crossorigin="anonymous" referrerpolicy="no-referrer"></script>

    <script>
        const getApplicationSettings = async () => {
            try {
                const response = await fetch('/api/pengaturan-aplikasi');
                const data = await response.json();

                const footer      = document.getElementById('footer');
                const logoImg     = document.querySelector('#app-logo img');
                const logFallback = document.querySelector('#app-logo div');
                const menuVersion = document.getElementById('menu-version');
                const tabBrowser  = document.getElementById('tab-browser');
                const webName     = document.getElementById('web-name');
                const webSubtitle = document.getElementById('web-subtitle');

                // --- Tab Browser ---
                if (tabBrowser) tabBrowser.textContent = data.tab_name || data.name || 'Drone CPS';

                // --- Update teks nama & subtitle ---
                if (webName)     webName.textContent     = data.name || 'Drone CPS';
                if (webSubtitle) webSubtitle.textContent = 'Ground Control Station';

                // --- Update src logo bila ada ---
                if (logoImg && data.image) {
                    logoImg.src = `/${data.image}`;
                    logoImg.onerror = () => {
                        logoImg.style.display = 'none';
                        if (logFallback) logFallback.style.display = 'flex';
                    };
                }

                // --- Versi di sidebar footer ---
                if (menuVersion) menuVersion.textContent = `v${data.version || '1.0.1'}`;

                // --- Footer Halaman ---
                if (footer) {
                    footer.innerHTML = `Copyright &copy; ${data.copyright_year || '2026'} <strong>${data.copyright || 'IPB University'}</strong>. All Rights Reserved.`;
                }
            } catch (e) {
                console.warn('Gagal fetch pengaturan aplikasi:', e);
            }
        }

        document.addEventListener("DOMContentLoaded", function() {
            getApplicationSettings()
        });
    </script>
    @stack('scripts')
</body>
</html>
