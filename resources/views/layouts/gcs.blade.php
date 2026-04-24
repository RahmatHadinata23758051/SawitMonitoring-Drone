<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>GCS &mdash; {{ optional(\App\Models\PengaturanAplikasi::first())->nama_tab ?? optional(\App\Models\PengaturanAplikasi::first())->nama ?? 'Drone CPS' }}</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <!-- Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
        integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A=="
        crossorigin="anonymous" referrerpolicy="no-referrer" />

    <!-- Tailwind & Global CSS via Vite -->
    @vite(['resources/css/app.css'])
</head>

<body class="font-sans antialiased bg-slate-950">

    <!-- React GCS Root — Full Screen SPA -->
    <div id="react-gcs-root" class="w-screen min-h-screen page-transition-enter"></div>

    @viteReactRefresh
    @vite('resources/js/gcs-react.jsx')

    <script>
        // Page Transition Script
        document.addEventListener("DOMContentLoaded", () => {
            const container = document.getElementById('react-gcs-root');
            if(container) {
                container.classList.add('page-transition-enter');
            }

            document.querySelectorAll('a').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    if (
                        this.hasAttribute('target') && this.getAttribute('target') === '_blank' ||
                        this.href.includes('#') ||
                        this.href.startsWith('javascript:') ||
                        this.hasAttribute('download') ||
                        !this.href ||
                        e.ctrlKey || e.metaKey || e.shiftKey
                    ) {
                        return;
                    }

                    if (this.hostname === window.location.hostname) {
                        e.preventDefault();
                        const href = this.href;

                        if (container) {
                            container.classList.remove('page-transition-enter');
                            container.classList.add('page-transition-exit');
                        }

                        setTimeout(() => {
                            window.location.href = href;
                        }, 200);
                    }
                });
            });
        });
    </script>

</body>
</html>
