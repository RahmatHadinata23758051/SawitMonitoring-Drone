{{-- ================================================================
     NAVBAR UTAMA — Drone CPS Ground Control Station
     Menggantikan sidebar vertikal dengan top navbar horizontal
     ================================================================ --}}
<nav x-data="{
        mobileOpen: false,
        activeDropdown: null,
        toggle(name) { this.activeDropdown = this.activeDropdown === name ? null : name; },
        close() { this.activeDropdown = null; mobileOpen = false; }
    }"
    @click.away="activeDropdown = null"
    class="w-full bg-green-800 shadow-lg z-50 relative"
    id="main-navbar">

    <div class="flex items-center justify-between h-16 px-4 lg:px-6">

        {{-- ===== BRAND (Logo + Nama) ===== --}}
        <a href="{{ route('dashboard') }}" id="app-logo"
           class="flex items-center gap-3 shrink-0">
            <img src="{{ asset('images/logo-ipb.png') }}"
                 alt="Logo IPB"
                 class="h-10 w-auto object-contain"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div style="display:none"
                 class="w-10 h-10 rounded-full bg-green-600 items-center justify-center text-white font-black text-lg">GCS</div>
            <div class="hidden sm:flex flex-col leading-none">
                <span id="web-name"  class="text-white font-bold text-base leading-tight">Drone CPS</span>
                <span id="web-subtitle" class="text-green-200 text-[10px] font-medium tracking-wide">Ground Control Station</span>
            </div>
        </a>

        {{-- ===== MENU DESKTOP ===== --}}
        <div class="hidden lg:flex items-center gap-1 flex-1 justify-center">

            {{-- Dashboard --}}
            <a href="{{ route('dashboard') }}"
               class="navbar-item {{ request()->routeIs('dashboard') ? 'navbar-active' : '' }}">
                <i class="fa-solid fa-house text-xs"></i>
                <span>Dashboard</span>
            </a>

            {{-- Data Master Dropdown --}}
            <div class="relative" x-data>
                <button @click="toggle('data-master')"
                    class="navbar-item {{ request()->routeIs('lahan.*','kebun.*','perangkat.*','user.*') ? 'navbar-active' : '' }}">
                    <i class="fa-solid fa-database text-xs"></i>
                    <span>Data Master</span>
                    <i class="fa-solid fa-chevron-down text-[9px] ml-1 transition-transform duration-200"
                       :class="{ 'rotate-180': activeDropdown === 'data-master' }"></i>
                </button>
                <div x-show="activeDropdown === 'data-master'" x-cloak
                     class="navbar-dropdown"
                     x-transition:enter="transition ease-out duration-150"
                     x-transition:enter-start="opacity-0 -translate-y-1"
                     x-transition:enter-end="opacity-100 translate-y-0"
                     x-transition:leave="transition ease-in duration-100"
                     x-transition:leave-end="opacity-0 -translate-y-1">
                    <a href="{{ route('lahan.index') }}"   class="dropdown-item {{ request()->routeIs('lahan.*') ? 'dropdown-active' : '' }}"><i class="fa-solid fa-map w-4"></i> Data Lahan</a>
                    <a href="{{ route('kebun.index') }}"   class="dropdown-item {{ request()->routeIs('kebun.*') ? 'dropdown-active' : '' }}"><i class="fa-solid fa-leaf w-4"></i> Data Kebun</a>
                    <a href="{{ route('perangkat.index') }}" class="dropdown-item {{ request()->routeIs('perangkat.*') ? 'dropdown-active' : '' }}"><i class="fa-solid fa-helicopter w-4"></i> Data Perangkat (Drone)</a>
                    <a href="{{ route('user.index') }}"    class="dropdown-item {{ request()->routeIs('user.*') ? 'dropdown-active' : '' }}"><i class="fa-solid fa-users w-4"></i> Data User</a>
                </div>
            </div>

            {{-- GCS --}}
            <a href="{{ route('gcs.index') }}"
               class="navbar-item-highlight {{ request()->routeIs('gcs.*') ? 'navbar-highlight-active' : '' }}">
                <i class="fa-solid fa-gamepad text-xs"></i>
                <span>GCS</span>
            </a>

            {{-- Dataset Dropdown --}}
            <div class="relative" x-data>
                <button @click="toggle('dataset')"
                    class="navbar-item {{ request()->routeIs('drone-dataset.*','kebun-dataset.*','sawit-dataset.*') ? 'navbar-active' : '' }}">
                    <i class="fa-solid fa-layer-group text-xs"></i>
                    <span>Dataset</span>
                    <i class="fa-solid fa-chevron-down text-[9px] ml-1 transition-transform duration-200"
                       :class="{ 'rotate-180': activeDropdown === 'dataset' }"></i>
                </button>
                <div x-show="activeDropdown === 'dataset'" x-cloak class="navbar-dropdown"
                     x-transition:enter="transition ease-out duration-150"
                     x-transition:enter-start="opacity-0 -translate-y-1"
                     x-transition:enter-end="opacity-100 translate-y-0">
                    <a href="{{ route('drone-dataset.index') }}"  class="dropdown-item {{ request()->routeIs('drone-dataset.*') ? 'dropdown-active' : '' }}"><i class="fa-solid fa-helicopter w-4"></i> Drone</a>
                    <a href="{{ route('kebun-dataset.index') }}"  class="dropdown-item {{ request()->routeIs('kebun-dataset.*') ? 'dropdown-active' : '' }}"><i class="fa-solid fa-leaf w-4"></i> Kebun</a>
                    <a href="{{ route('sawit-dataset.index') }}"  class="dropdown-item {{ request()->routeIs('sawit-dataset.*') ? 'dropdown-active' : '' }}"><i class="fa-solid fa-seedling w-4"></i> Sawit</a>
                </div>
            </div>

            {{-- Rule Engine Dropdown --}}
            <div class="relative" x-data>
                <button @click="toggle('rule-engine')"
                    class="navbar-item {{ request()->routeIs('dead-reckoning.*') ? 'navbar-active' : '' }}">
                    <i class="fa-solid fa-diagram-project text-xs"></i>
                    <span>Rule Engine</span>
                    <i class="fa-solid fa-chevron-down text-[9px] ml-1 transition-transform duration-200"
                       :class="{ 'rotate-180': activeDropdown === 'rule-engine' }"></i>
                </button>
                <div x-show="activeDropdown === 'rule-engine'" x-cloak class="navbar-dropdown"
                     x-transition:enter="transition ease-out duration-150"
                     x-transition:enter-start="opacity-0 -translate-y-1"
                     x-transition:enter-end="opacity-100 translate-y-0">
                    <a href="{{ route('dead-reckoning.index') }}" class="dropdown-item {{ request()->routeIs('dead-reckoning.*') ? 'dropdown-active' : '' }}"><i class="fa-solid fa-route w-4"></i> Dead-Reckoning</a>
                    <span class="dropdown-item opacity-50 cursor-not-allowed"><i class="fa-solid fa-wifi w-4"></i> Live-Reckoning <span class="text-[9px] bg-amber-200 text-amber-700 px-1 rounded">Soon</span></span>
                    <span class="dropdown-item opacity-50 cursor-not-allowed"><i class="fa-solid fa-eye w-4"></i> Quick Look Vision <span class="text-[9px] bg-amber-200 text-amber-700 px-1 rounded">Soon</span></span>
                </div>
            </div>

            {{-- Laporan Dropdown --}}
            <div class="relative" x-data>
                <button @click="toggle('laporan')"
                    class="navbar-item {{ request()->routeIs('laporan.*') ? 'navbar-active' : '' }}">
                    <i class="fa-solid fa-clipboard text-xs"></i>
                    <span>Laporan</span>
                    <i class="fa-solid fa-chevron-down text-[9px] ml-1 transition-transform duration-200"
                       :class="{ 'rotate-180': activeDropdown === 'laporan' }"></i>
                </button>
                <div x-show="activeDropdown === 'laporan'" x-cloak class="navbar-dropdown"
                     x-transition:enter="transition ease-out duration-150"
                     x-transition:enter-start="opacity-0 -translate-y-1"
                     x-transition:enter-end="opacity-100 translate-y-0">
                    <a href="{{ route('laporan.index') }}"            class="dropdown-item {{ request()->routeIs('laporan.index') ? 'dropdown-active' : '' }}"><i class="fa-solid fa-brain w-4"></i> Prediksi Kematangan</a>
                    <a href="{{ route('laporan.log-penerbangan') }}"  class="dropdown-item {{ request()->routeIs('laporan.log-penerbangan') ? 'dropdown-active' : '' }}"><i class="fa-solid fa-paper-plane w-4"></i> Log Penerbangan</a>
                </div>
            </div>

            {{-- Cuaca --}}
            <a href="{{ route('cuaca.index') }}"
               class="navbar-item {{ request()->routeIs('cuaca.*') ? 'navbar-active' : '' }}">
                <i class="fa-solid fa-cloud text-xs"></i>
                <span>Cuaca</span>
            </a>

        </div>

        {{-- ===== RIGHT SIDE: User & Settings ===== --}}
        <div class="hidden lg:flex items-center gap-2">
            {{-- Settings --}}
            <div class="relative" x-data>
                <button @click="toggle('settings')" class="navbar-item">
                    <i class="fa-solid fa-gear text-xs"></i>
                    <i class="fa-solid fa-chevron-down text-[9px] ml-0.5"
                       :class="{ 'rotate-180': activeDropdown === 'settings' }"></i>
                </button>
                <div x-show="activeDropdown === 'settings'" x-cloak class="navbar-dropdown right-0"
                     x-transition:enter="transition ease-out duration-150"
                     x-transition:enter-start="opacity-0 -translate-y-1"
                     x-transition:enter-end="opacity-100 translate-y-0">
                    <a href="{{ route('pengaturan-aplikasi.index') }}" class="dropdown-item {{ request()->routeIs('pengaturan-aplikasi.*') ? 'dropdown-active' : '' }}"><i class="fa-solid fa-sliders w-4"></i> Pengaturan Aplikasi</a>
                    <a href="{{ route('cuaca.index') }}"               class="dropdown-item {{ request()->routeIs('cuaca.*') ? 'dropdown-active' : '' }}"><i class="fa-solid fa-cloud w-4"></i> Pengaturan Cuaca</a>
                    <a href="{{ route('log-aktivitas') }}"             class="dropdown-item {{ request()->routeIs('log-aktivitas') ? 'dropdown-active' : '' }}"><i class="fa-solid fa-clock-rotate-left w-4"></i> Log Aktivitas</a>
                </div>
            </div>

            {{-- User Dropdown --}}
            <div class="relative" x-data>
                <button @click="toggle('user')"
                    class="flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white text-sm px-3 py-1.5 rounded-lg transition">
                    <div class="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-xs font-bold">
                        {{ strtoupper(substr(Auth::user()->name, 0, 1)) }}
                    </div>
                    <span class="hidden xl:block">{{ Auth::user()->name }}</span>
                    <i class="fa-solid fa-chevron-down text-[9px]"
                       :class="{ 'rotate-180': activeDropdown === 'user' }"></i>
                </button>
                <div x-show="activeDropdown === 'user'" x-cloak class="navbar-dropdown right-0"
                     x-transition:enter="transition ease-out duration-150"
                     x-transition:enter-start="opacity-0 -translate-y-1"
                     x-transition:enter-end="opacity-100 translate-y-0">
                    <div class="px-3 py-2 border-b border-slate-100">
                        <div class="text-xs text-slate-500">Login sebagai</div>
                        <div class="font-semibold text-slate-800 text-sm">{{ Auth::user()->name }}</div>
                        <div class="text-xs text-slate-400">{{ Auth::user()->email }}</div>
                    </div>
                    <a href="{{ route('profile.edit') }}" class="dropdown-item"><i class="fa-solid fa-user w-4"></i> Profile</a>
                    <div class="border-t border-slate-100 mt-1 pt-1">
                        <button x-on:click.prevent="$dispatch('open-modal', 'sign-out')"
                            class="dropdown-item text-red-600 hover:bg-red-50 w-full text-left">
                            <i class="fa-solid fa-right-from-bracket w-4"></i> Keluar
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {{-- ===== HAMBURGER MOBILE ===== --}}
        <button @click="mobileOpen = !mobileOpen"
            class="lg:hidden p-2 text-white hover:bg-green-700 rounded-lg transition">
            <i class="fa-solid" :class="mobileOpen ? 'fa-times' : 'fa-bars'"></i>
        </button>
    </div>

    {{-- ===== MOBILE MENU ===== --}}
    <div x-show="mobileOpen" x-cloak
         class="lg:hidden bg-green-900 border-t border-green-700 pb-4"
         x-transition:enter="transition ease-out duration-200"
         x-transition:enter-start="opacity-0 -translate-y-2"
         x-transition:enter-end="opacity-100 translate-y-0">
        <div class="px-4 pt-3 space-y-1">
            <a href="{{ route('dashboard') }}" class="mobile-item {{ request()->routeIs('dashboard') ? 'mobile-active' : '' }}"><i class="fa-solid fa-house w-5"></i> Dashboard</a>

            <div class="text-green-400 text-[10px] font-bold uppercase tracking-wider pt-2 pb-1">Data Master</div>
            <a href="{{ route('lahan.index') }}"     class="mobile-item {{ request()->routeIs('lahan.*') ? 'mobile-active' : '' }}"><i class="fa-solid fa-map w-5"></i> Data Lahan</a>
            <a href="{{ route('kebun.index') }}"     class="mobile-item {{ request()->routeIs('kebun.*') ? 'mobile-active' : '' }}"><i class="fa-solid fa-leaf w-5"></i> Data Kebun</a>
            <a href="{{ route('perangkat.index') }}" class="mobile-item {{ request()->routeIs('perangkat.*') ? 'mobile-active' : '' }}"><i class="fa-solid fa-helicopter w-5"></i> Data Perangkat</a>
            <a href="{{ route('user.index') }}"      class="mobile-item {{ request()->routeIs('user.*') ? 'mobile-active' : '' }}"><i class="fa-solid fa-users w-5"></i> Data User</a>

            <div class="text-green-400 text-[10px] font-bold uppercase tracking-wider pt-2 pb-1">Misi</div>
            <a href="{{ route('gcs.index') }}"       class="mobile-item {{ request()->routeIs('gcs.*') ? 'mobile-active' : '' }}"><i class="fa-solid fa-gamepad w-5"></i> GCS</a>
            <a href="{{ route('laporan.index') }}"   class="mobile-item {{ request()->routeIs('laporan.index') ? 'mobile-active' : '' }}"><i class="fa-solid fa-brain w-5"></i> Prediksi Kematangan</a>
            <a href="{{ route('laporan.log-penerbangan') }}" class="mobile-item {{ request()->routeIs('laporan.log-penerbangan') ? 'mobile-active' : '' }}"><i class="fa-solid fa-paper-plane w-5"></i> Log Penerbangan</a>

            <div class="text-green-400 text-[10px] font-bold uppercase tracking-wider pt-2 pb-1">Lainnya</div>
            <a href="{{ route('drone-dataset.index') }}"  class="mobile-item"><i class="fa-solid fa-layer-group w-5"></i> Dataset Drone</a>
            <a href="{{ route('dead-reckoning.index') }}" class="mobile-item"><i class="fa-solid fa-route w-5"></i> Dead-Reckoning</a>
            <a href="{{ route('cuaca.index') }}"          class="mobile-item"><i class="fa-solid fa-cloud w-5"></i> Cuaca</a>
            <a href="{{ route('pengaturan-aplikasi.index') }}" class="mobile-item"><i class="fa-solid fa-gear w-5"></i> Pengaturan</a>
            <a href="{{ route('log-aktivitas') }}"        class="mobile-item"><i class="fa-solid fa-clock-rotate-left w-5"></i> Log Aktivitas</a>

            <div class="border-t border-green-700 mt-3 pt-3">
                <a href="{{ route('profile.edit') }}" class="mobile-item"><i class="fa-solid fa-user w-5"></i> Profile</a>
                <button x-on:click.prevent="$dispatch('open-modal', 'sign-out')"
                    class="mobile-item text-red-400 w-full text-left">
                    <i class="fa-solid fa-right-from-bracket w-5"></i> Keluar
                </button>
            </div>
        </div>
    </div>
</nav>
