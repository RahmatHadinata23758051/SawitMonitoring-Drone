{{-- ================================================================
     NAVBAR UTAMA — Drone CPS Ground Control Station
     Warna: putih + navy blue (seperti referensi PrecisionFlow)
     ================================================================ --}}
<nav x-data="{
        mobileOpen: false,
        activeDropdown: null,
        toggle(name) { this.activeDropdown = this.activeDropdown === name ? null : name; },
    }"
    @click.away="activeDropdown = null"
    class="w-full bg-white border-b border-slate-200 shadow-sm z-50 relative"
    id="main-navbar">

    <div class="flex items-center justify-between h-16 px-4 lg:px-6">

        {{-- ===== BRAND (Logo + Nama) ===== --}}
        <a href="{{ route('dashboard') }}" id="app-logo"
           class="flex items-center gap-3 shrink-0 group">
            <img src="{{ asset('images/logo-ipb-color.png') }}"
                 alt="Logo IPB"
                 class="h-10 w-auto object-contain"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div style="display:none; background:#1e3a8a; color:white;"
                 class="w-10 h-10 rounded-full items-center justify-center font-black text-base">GCS</div>
            <div class="hidden sm:flex flex-col leading-none">
                <span id="web-name"  class="font-bold text-base leading-tight" style="color:#1e3a8a">Drone CPS</span>
                <span id="web-subtitle" class="text-slate-400 text-[10px] font-medium tracking-wide">Ground Control Station</span>
            </div>
        </a>

        {{-- ===== MENU DESKTOP ===== --}}
        <div class="hidden lg:flex items-center gap-0.5 flex-1 justify-center">

            {{-- Dashboard --}}
            <a href="{{ route('dashboard') }}"
               class="nav-link {{ request()->routeIs('dashboard') ? 'nav-link-active' : '' }}">
                Dashboard
            </a>

            {{-- Data Master Dropdown --}}
            <div class="relative">
                <button @click="toggle('data-master')"
                    class="nav-link {{ request()->routeIs('lahan.*','kebun.*','perangkat.*','user.*') ? 'nav-link-active' : '' }}">
                    Data Master
                    <i class="fa-solid fa-chevron-down text-[9px] ml-1 transition-transform duration-200"
                       :class="{ 'rotate-180': activeDropdown === 'data-master' }"></i>
                </button>
                <div x-show="activeDropdown === 'data-master'" x-cloak
                     class="nav-dropdown"
                     x-transition:enter="transition ease-out duration-150"
                     x-transition:enter-start="opacity-0 -translate-y-1"
                     x-transition:enter-end="opacity-100 translate-y-0"
                     x-transition:leave="transition ease-in duration-100"
                     x-transition:leave-end="opacity-0 -translate-y-1">
                    <a href="{{ route('lahan.index') }}"     class="nav-dropdown-item {{ request()->routeIs('lahan.*') ? 'nav-dropdown-active' : '' }}"><i class="fa-solid fa-map w-4 text-blue-500"></i> Data Lahan</a>
                    <a href="{{ route('kebun.index') }}"     class="nav-dropdown-item {{ request()->routeIs('kebun.*') ? 'nav-dropdown-active' : '' }}"><i class="fa-solid fa-leaf w-4 text-blue-500"></i> Data Kebun</a>
                    <a href="{{ route('perangkat.index') }}" class="nav-dropdown-item {{ request()->routeIs('perangkat.*') ? 'nav-dropdown-active' : '' }}"><i class="fa-solid fa-helicopter w-4 text-blue-500"></i> Data Perangkat (Drone)</a>
                    <a href="{{ route('user.index') }}"      class="nav-dropdown-item {{ request()->routeIs('user.*') ? 'nav-dropdown-active' : '' }}"><i class="fa-solid fa-users w-4 text-blue-500"></i> Data User</a>
                </div>
            </div>

            {{-- GCS --}}
            <a href="{{ route('gcs.index') }}"
               class="nav-link-gcs {{ request()->routeIs('gcs.*') ? 'nav-link-gcs-active' : '' }}">
                <i class="fa-solid fa-gamepad text-xs"></i> GCS
            </a>

            {{-- Dataset Dropdown --}}
            <div class="relative">
                <button @click="toggle('dataset')"
                    class="nav-link {{ request()->routeIs('drone-dataset.*','kebun-dataset.*','sawit-dataset.*') ? 'nav-link-active' : '' }}">
                    Dataset
                    <i class="fa-solid fa-chevron-down text-[9px] ml-1 transition-transform duration-200"
                       :class="{ 'rotate-180': activeDropdown === 'dataset' }"></i>
                </button>
                <div x-show="activeDropdown === 'dataset'" x-cloak class="nav-dropdown"
                     x-transition:enter="transition ease-out duration-150"
                     x-transition:enter-start="opacity-0 -translate-y-1"
                     x-transition:enter-end="opacity-100 translate-y-0">
                    <a href="{{ route('drone-dataset.index') }}"  class="nav-dropdown-item {{ request()->routeIs('drone-dataset.*') ? 'nav-dropdown-active' : '' }}"><i class="fa-solid fa-helicopter w-4 text-blue-500"></i> Drone</a>
                    <a href="{{ route('kebun-dataset.index') }}"  class="nav-dropdown-item {{ request()->routeIs('kebun-dataset.*') ? 'nav-dropdown-active' : '' }}"><i class="fa-solid fa-leaf w-4 text-blue-500"></i> Kebun</a>
                    <a href="{{ route('sawit-dataset.index') }}"  class="nav-dropdown-item {{ request()->routeIs('sawit-dataset.*') ? 'nav-dropdown-active' : '' }}"><i class="fa-solid fa-seedling w-4 text-blue-500"></i> Sawit</a>
                </div>
            </div>

            {{-- Rule Engine Dropdown --}}
            <div class="relative">
                <button @click="toggle('rule-engine')"
                    class="nav-link {{ request()->routeIs('dead-reckoning.*') ? 'nav-link-active' : '' }}">
                    Rule Engine
                    <i class="fa-solid fa-chevron-down text-[9px] ml-1 transition-transform duration-200"
                       :class="{ 'rotate-180': activeDropdown === 'rule-engine' }"></i>
                </button>
                <div x-show="activeDropdown === 'rule-engine'" x-cloak class="nav-dropdown"
                     x-transition:enter="transition ease-out duration-150"
                     x-transition:enter-start="opacity-0 -translate-y-1"
                     x-transition:enter-end="opacity-100 translate-y-0">
                    <a href="{{ route('dead-reckoning.index') }}" class="nav-dropdown-item {{ request()->routeIs('dead-reckoning.*') ? 'nav-dropdown-active' : '' }}"><i class="fa-solid fa-route w-4 text-blue-500"></i> Dead-Reckoning</a>
                    <span class="nav-dropdown-item opacity-40 cursor-not-allowed select-none"><i class="fa-solid fa-wifi w-4"></i> Live-Reckoning <span class="text-[9px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full ml-1">Soon</span></span>
                    <span class="nav-dropdown-item opacity-40 cursor-not-allowed select-none"><i class="fa-solid fa-eye w-4"></i> Quick Look Vision <span class="text-[9px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full ml-1">Soon</span></span>
                </div>
            </div>

            {{-- Laporan Dropdown --}}
            <div class="relative">
                <button @click="toggle('laporan')"
                    class="nav-link {{ request()->routeIs('laporan.*') ? 'nav-link-active' : '' }}">
                    Laporan
                    <i class="fa-solid fa-chevron-down text-[9px] ml-1 transition-transform duration-200"
                       :class="{ 'rotate-180': activeDropdown === 'laporan' }"></i>
                </button>
                <div x-show="activeDropdown === 'laporan'" x-cloak class="nav-dropdown"
                     x-transition:enter="transition ease-out duration-150"
                     x-transition:enter-start="opacity-0 -translate-y-1"
                     x-transition:enter-end="opacity-100 translate-y-0">
                    <a href="{{ route('laporan.index') }}"           class="nav-dropdown-item {{ request()->routeIs('laporan.index') ? 'nav-dropdown-active' : '' }}"><i class="fa-solid fa-brain w-4 text-blue-500"></i> Prediksi Kematangan</a>
                    <a href="{{ route('laporan.log-penerbangan') }}" class="nav-dropdown-item {{ request()->routeIs('laporan.log-penerbangan') ? 'nav-dropdown-active' : '' }}"><i class="fa-solid fa-paper-plane w-4 text-blue-500"></i> Log Penerbangan</a>
                </div>
            </div>

            {{-- Pengaturan --}}
            <a href="{{ route('pengaturan-aplikasi.index') }}"
               class="nav-link {{ request()->routeIs('cuaca.*','pengaturan-aplikasi.*','log-aktivitas') ? 'nav-link-active' : '' }}">
                Pengaturan Aplikasi
            </a>

        </div>

        {{-- ===== RIGHT: bell + gear + user ===== --}}
        <div class="hidden lg:flex items-center gap-2">
            {{-- Log Aktivitas --}}
            <a href="{{ route('log-aktivitas') }}" title="Log Aktivitas"
               class="w-9 h-9 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-blue-700 transition">
                <i class="fa-solid fa-clock-rotate-left text-sm"></i>
            </a>

            {{-- Cuaca --}}
            <a href="{{ route('cuaca.index') }}" title="Pengaturan Cuaca"
               class="w-9 h-9 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-blue-700 transition">
                <i class="fa-solid fa-cloud text-sm"></i>
            </a>

            {{-- Divider --}}
            <div class="w-px h-6 bg-slate-200 mx-1"></div>

            {{-- User Dropdown --}}
            <div class="relative">
                <button @click="toggle('user')"
                    class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded-lg transition">
                    <div class="w-6 h-6 rounded-full bg-blue-400 flex items-center justify-center text-xs font-bold">
                        {{ strtoupper(substr(Auth::user()->name, 0, 1)) }}
                    </div>
                    <div class="hidden xl:flex flex-col text-left leading-none">
                        <span class="text-xs font-semibold">{{ Auth::user()->name }}</span>
                        <span class="text-[9px] text-blue-200">Administrator</span>
                    </div>
                    <i class="fa-solid fa-chevron-down text-[9px]"
                       :class="{ 'rotate-180': activeDropdown === 'user' }"></i>
                </button>
                <div x-show="activeDropdown === 'user'" x-cloak class="nav-dropdown right-0 left-auto w-56"
                     x-transition:enter="transition ease-out duration-150"
                     x-transition:enter-start="opacity-0 -translate-y-1"
                     x-transition:enter-end="opacity-100 translate-y-0">
                    <div class="px-4 py-3 border-b border-slate-100 bg-blue-50 rounded-t-xl">
                        <div class="text-xs text-slate-500">Login sebagai</div>
                        <div class="font-bold text-slate-800 text-sm">{{ Auth::user()->name }}</div>
                        <div class="text-xs text-slate-400">{{ Auth::user()->email }}</div>
                    </div>
                    <a href="{{ route('profile.edit') }}" class="nav-dropdown-item"><i class="fa-solid fa-user w-4 text-blue-500"></i> Profile</a>
                    <div class="border-t border-slate-100 mt-1 pt-1">
                        <button x-on:click.prevent="$dispatch('open-modal', 'sign-out')"
                            class="nav-dropdown-item text-red-500 hover:bg-red-50 w-full text-left">
                            <i class="fa-solid fa-right-from-bracket w-4"></i> Keluar
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {{-- ===== HAMBURGER MOBILE ===== --}}
        <button @click="mobileOpen = !mobileOpen"
            class="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition">
            <i class="fa-solid" :class="mobileOpen ? 'fa-times' : 'fa-bars'"></i>
        </button>
    </div>

    {{-- ===== MOBILE MENU ===== --}}
    <div x-show="mobileOpen" x-cloak
         class="lg:hidden bg-white border-t border-slate-200 pb-4 shadow-lg"
         x-transition:enter="transition ease-out duration-200"
         x-transition:enter-start="opacity-0 -translate-y-2"
         x-transition:enter-end="opacity-100 translate-y-0">
        <div class="px-4 pt-3 space-y-1">
            <a href="{{ route('dashboard') }}" class="mobile-nav {{ request()->routeIs('dashboard') ? 'mobile-nav-active' : '' }}"><i class="fa-solid fa-house w-5 text-blue-500"></i> Dashboard</a>

            <div class="text-blue-400 text-[10px] font-bold uppercase tracking-wider pt-2 pb-1">Data Master</div>
            <a href="{{ route('lahan.index') }}"     class="mobile-nav {{ request()->routeIs('lahan.*') ? 'mobile-nav-active' : '' }}"><i class="fa-solid fa-map w-5 text-blue-400"></i> Data Lahan</a>
            <a href="{{ route('kebun.index') }}"     class="mobile-nav {{ request()->routeIs('kebun.*') ? 'mobile-nav-active' : '' }}"><i class="fa-solid fa-leaf w-5 text-blue-400"></i> Data Kebun</a>
            <a href="{{ route('perangkat.index') }}" class="mobile-nav {{ request()->routeIs('perangkat.*') ? 'mobile-nav-active' : '' }}"><i class="fa-solid fa-helicopter w-5 text-blue-400"></i> Data Perangkat</a>
            <a href="{{ route('user.index') }}"      class="mobile-nav {{ request()->routeIs('user.*') ? 'mobile-nav-active' : '' }}"><i class="fa-solid fa-users w-5 text-blue-400"></i> Data User</a>

            <div class="text-blue-400 text-[10px] font-bold uppercase tracking-wider pt-2 pb-1">Misi & Laporan</div>
            <a href="{{ route('gcs.index') }}"               class="mobile-nav {{ request()->routeIs('gcs.*') ? 'mobile-nav-active' : '' }}"><i class="fa-solid fa-gamepad w-5 text-blue-500"></i> GCS</a>
            <a href="{{ route('laporan.index') }}"           class="mobile-nav {{ request()->routeIs('laporan.index') ? 'mobile-nav-active' : '' }}"><i class="fa-solid fa-brain w-5 text-blue-400"></i> Prediksi Kematangan</a>
            <a href="{{ route('laporan.log-penerbangan') }}" class="mobile-nav {{ request()->routeIs('laporan.log-penerbangan') ? 'mobile-nav-active' : '' }}"><i class="fa-solid fa-paper-plane w-5 text-blue-400"></i> Log Penerbangan</a>

            <div class="text-blue-400 text-[10px] font-bold uppercase tracking-wider pt-2 pb-1">Dataset & Rule Engine</div>
            <a href="{{ route('drone-dataset.index') }}"  class="mobile-nav"><i class="fa-solid fa-layer-group w-5 text-blue-400"></i> Dataset Drone</a>
            <a href="{{ route('dead-reckoning.index') }}" class="mobile-nav"><i class="fa-solid fa-route w-5 text-blue-400"></i> Dead-Reckoning</a>

            <div class="text-blue-400 text-[10px] font-bold uppercase tracking-wider pt-2 pb-1">Pengaturan</div>
            <a href="{{ route('cuaca.index') }}"              class="mobile-nav"><i class="fa-solid fa-cloud w-5 text-blue-400"></i> Cuaca</a>
            <a href="{{ route('pengaturan-aplikasi.index') }}" class="mobile-nav"><i class="fa-solid fa-gear w-5 text-blue-400"></i> Pengaturan Aplikasi</a>
            <a href="{{ route('log-aktivitas') }}"            class="mobile-nav"><i class="fa-solid fa-clock-rotate-left w-5 text-blue-400"></i> Log Aktivitas</a>

            <div class="border-t border-slate-200 mt-3 pt-3">
                <a href="{{ route('profile.edit') }}" class="mobile-nav"><i class="fa-solid fa-user w-5 text-blue-400"></i> Profile</a>
                <button x-on:click.prevent="$dispatch('open-modal', 'sign-out')"
                    class="mobile-nav text-red-500 w-full text-left">
                    <i class="fa-solid fa-right-from-bracket w-5"></i> Keluar
                </button>
            </div>
        </div>
    </div>
</nav>
