{{-- ================================================================
     NAVBAR UTAMA — Drone CPS Ground Control Station
     Ditenagai oleh React SPA (resources/js/components/Navigation/AppNavbar.jsx)
     ================================================================ --}}

<div id="react-navbar-root" data-props="{{ json_encode([
    'userName' => Auth::user()->name,
    'userEmail' => Auth::user()->email,
    'userInitial' => strtoupper(substr(Auth::user()->name, 0, 1)),
    'currentRoute' => Route::currentRouteName(),
    'csrfToken' => csrf_token(),
    'routes' => [
        'dashboard' => route('dashboard'),
        'lahan' => route('lahan.index'),
        'kebun' => route('kebun.index'),
        'perangkat' => route('perangkat.index'),
        'user' => route('user.index'),
        'gcs' => route('gcs.index'),
        'droneDataset' => route('drone-dataset.index'),
        'kebunDataset' => route('kebun-dataset.index'),
        'sawitDataset' => route('sawit-dataset.index'),
        'deadReckoning' => route('dead-reckoning.index'),
        'laporanAi' => route('laporan.index'),
        'laporanLog' => route('laporan.log-penerbangan'),
        'cuaca' => route('cuaca.index'),
        'pengaturan' => route('pengaturan-aplikasi.index'),
        'logAktivitas' => route('log-aktivitas'),
        'profile' => route('profile.edit'),
        'logout' => route('logout')
    ]
]) }}"></div>

@push('scripts')
    @viteReactRefresh
    @vite('resources/js/navbar-react.jsx')
@endpush
