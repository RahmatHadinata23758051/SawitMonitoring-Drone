<div>
    <div :class="{ 'block': sideopen, 'hidden': !sideopen }"
        class="flex flex-col bg-white w-64 lg:fixed lg:top-0 lg:bottom-0 lg:left-0 lg:ml-0 lg:mr-0 max-md:hidden overflow-y-scroll styled-scrollbars h-full"
        id="sidebar">
        <!-- App Brand Area -->
        <div id="app-brand" class="w-full py-4 px-4 bg-green-800 flex flex-col items-center gap-1">
            <a href="{{ route('dashboard') }}" class="flex flex-col items-center gap-2" id="app-logo">
                <img src="{{ asset('images/logo-ipb.png') }}" alt="Logo" class="h-16 w-auto object-contain"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div style="display:none" class="w-14 h-14 rounded-full bg-green-600 items-center justify-center text-white font-black text-xl">GCS</div>
            </a>
            <div class="text-center mt-1">
                <div id="web-name" class="text-white font-bold text-sm leading-tight">Drone CPS</div>
                <div id="web-subtitle" class="text-green-200 text-[10px]">Ground Control Station</div>
            </div>
        </div>

        <div class="flex-grow">
            <ul id="menu-inner"
                class="flex flex-col flex-auto items-start justify-start m-0 p-0 pt-6 relative overflow-hidden touch-auto pb-6">
                <li class="menu-item">
                    <a href="{{ route('dashboard') }}" @class([
                        'menu-link',
                        'active-icon' => request()->routeIs('dashboard'),
                    ])>
                        <i class="menu-icon fa-solid fa-house"></i>
                        <div class="text-base">Dashboard</div>
                    </a>
                </li>

                <li x-data="{
                    open: {{ request()->routeIs('lahan.*') ||
                    request()->routeIs('kebun.*') ||
                    request()->routeIs('perangkat.*') ||
                    request()->routeIs('user.*')
                        ? 'true'
                        : 'false' }}
                }" class="menu-item w-full">
                    <button @click="open = !open" :aria-expanded="open"
                        class="menu-link w-full flex items-center pe-10 py-2 text-left">
                        <i class="menu-icon fa-solid fa-database"></i>
                        <div class="text-base flex-1">Data Master</div>
                        <i class="fa-solid fa-chevron-down ml-2 transition-transform duration-200"
                            :class="{ 'rotate-180': open }"></i>
                    </button>

                    <!-- submenu -->
                    <ul x-show="open" x-cloak class="ml-8 mt-1 space-y-1"
                        x-transition:enter="transition ease-out duration-150"
                        x-transition:enter-start="opacity-0 -translate-y-1"
                        x-transition:enter-end="opacity-100 translate-y-0"
                        x-transition:leave="transition ease-in duration-125"
                        x-transition:leave-start="opacity-100 translate-y-0"
                        x-transition:leave-end="opacity-0 -translate-y-1">
                        <li>
                            <a href="{{ route('lahan.index') }}" @class(['menu-link', 'active-icon' => request()->routeIs('lahan.*')])>
                                <div class="text-sm"><span class="me-2">--</span>Data Lahan</div>
                            </a>
                        </li>
                        <li>
                            <a href="{{ route('kebun.index') }}" @class(['menu-link', 'active-icon' => request()->routeIs('kebun.*')])>
                                <div class="text-sm"><span class="me-2">--</span>Data Kebun</div>
                            </a>
                        </li>
                        <li>
                            <a href="{{ route('perangkat.index') }}" @class([
                                'menu-link',
                                'active-icon' => request()->routeIs('perangkat.*'),
                            ])>
                                <div class="text-sm"><span class="me-2">--</span>Data Perangkat (Drone)</div>
                            </a>
                        </li>
                        <li>
                            <a href="{{ route('user.index') }}" @class(['menu-link', 'active-icon' => request()->routeIs('user.*')])>
                                <div class="text-sm"><span class="me-2">--</span>Data User</div>
                            </a>
                        </li>
                    </ul>
                </li>

                <li class="menu-item">
                    <a href="{{ route('panen.index') }}" @class(['menu-link', 'active-icon' => request()->routeIs('panen.*')])>
                        <i class="menu-icon fa-solid fa-seedling"></i>
                        <div class="text-base">Manajemen Panen</div>
                    </a>
                </li>

                <li class="menu-item">
                    <a href="{{ route('cuaca.index') }}" @class(['menu-link', 'active-icon' => request()->routeIs('cuaca.*')])>
                        <i class="menu-icon fa-solid fa-cloud"></i>
                        <div class="text-base">Pengaturan Data Cuaca</div>
                    </a>
                </li>

                <li class="menu-item">
                    <a href="{{ route('gcs.index') }}" @class(['menu-link', 'active-icon' => request()->routeIs('gcs.*')])>
                        <i class="menu-icon fa-solid fa-gamepad"></i>
                        <div class="text-base">Ground Control Station (GCS)</div>
                    </a>
                </li>

                <li x-data="{
                    open: {{ request()->routeIs('drone-dataset.*') ||
                    request()->routeIs('kebun-dataset.*') ||
                    request()->routeIs('sawit-dataset.*')
                        ? 'true'
                        : 'false' }}
                }" class="menu-item w-full">
                    <button @click="open = !open" :aria-expanded="open"
                        class="menu-link w-full flex items-center pe-10 py-2 text-left">
                        <i class="menu-icon fa-solid fa-layer-group"></i>
                        <div class="text-base flex-1">Dataset</div>
                        <i class="fa-solid fa-chevron-down ml-2 transition-transform duration-200"
                            :class="{ 'rotate-180': open }"></i>
                    </button>

                    <!-- submenu -->
                    <ul x-show="open" x-cloak class="ml-8 mt-1 space-y-1"
                        x-transition:enter="transition ease-out duration-150"
                        x-transition:enter-start="opacity-0 -translate-y-1"
                        x-transition:enter-end="opacity-100 translate-y-0"
                        x-transition:leave="transition ease-in duration-125"
                        x-transition:leave-start="opacity-100 translate-y-0"
                        x-transition:leave-end="opacity-0 -translate-y-1">
                        <li>
                            <a href="{{ route('drone-dataset.index') }}" @class([
                                'menu-link',
                                'active-icon' => request()->routeIs('drone-dataset.*'),
                            ])>
                                <div class="text-sm"><span class="me-2">--</span>Drone</div>
                            </a>
                        </li>
                        <li>
                            <a href="{{ route('kebun-dataset.index') }}" @class([
                                'menu-link',
                                'active-icon' => request()->routeIs('kebun-dataset.*'),
                            ])>
                                <div class="text-sm"><span class="me-2">--</span>Kebun</div>
                            </a>
                        </li>
                        <li>
                            <a href="{{ route('sawit-dataset.index') }}" @class([
                                'menu-link',
                                'active-icon' => request()->routeIs('sawit-dataset.*'),
                            ])>
                                <div class="text-sm"><span class="me-2">--</span>Sawit</div>
                            </a>
                        </li>
                    </ul>
                </li>

                <li x-data="{
                    open: {{ request()->routeIs('dead-reckoning.*') ? 'true' : 'false' }}
                }" class="menu-item w-full">
                    <button @click="open = !open" :aria-expanded="open"
                        class="menu-link w-full flex items-center pe-10 py-2 text-left">
                        <i class="menu-icon fa-solid fa-diagram-project"></i>
                        <div class="text-base flex-1">Rule Engine & Algoritma</div>
                        <i class="fa-solid fa-chevron-down ml-2 transition-transform duration-200"
                            :class="{ 'rotate-180': open }"></i>
                    </button>

                    <!-- submenu -->
                    <ul x-show="open" x-cloak class="ml-8 mt-1 space-y-1"
                        x-transition:enter="transition ease-out duration-150"
                        x-transition:enter-start="opacity-0 -translate-y-1"
                        x-transition:enter-end="opacity-100 translate-y-0"
                        x-transition:leave="transition ease-in duration-125"
                        x-transition:leave-start="opacity-100 translate-y-0"
                        x-transition:leave-end="opacity-0 -translate-y-1">
                        <li>
                            <a href="{{ route('dead-reckoning.index') }}" @class([
                                'menu-link',
                                'active-icon' => request()->routeIs('dead-reckoning.*'),
                            ])>
                                <div class="text-sm"><span class="me-2">--</span>Dead-Reckoning</div>
                            </a>
                        </li>
                        <li>
                            <a href="#" @class(['menu-link'])>
                                <div class="text-sm"><span class="me-2">--</span>Live-Reckoning</div>
                            </a>
                        </li>
                        <li>
                            <a href="#" @class(['menu-link'])>
                                <div class="text-sm"><span class="me-2">--</span>Quick Look Vision</div>
                            </a>
                        </li>
                    </ul>
                </li>

                <li x-data="{
                    open: {{ request()->routeIs('laporan.*') ? 'true' : 'false' }}
                }" class="menu-item w-full">
                    <button @click="open = !open" :aria-expanded="open"
                        class="menu-link w-full flex items-center pe-10 py-2 text-left">
                        <i class="menu-icon fa-solid fa-clipboard"></i>
                        <div class="text-base flex-1">Laporan</div>
                        <i class="fa-solid fa-chevron-down ml-2 transition-transform duration-200"
                            :class="{ 'rotate-180': open }"></i>
                    </button>

                    <!-- submenu -->
                    <ul x-show="open" x-cloak class="ml-8 mt-1 space-y-1"
                        x-transition:enter="transition ease-out duration-150"
                        x-transition:enter-start="opacity-0 -translate-y-1"
                        x-transition:enter-end="opacity-100 translate-y-0"
                        x-transition:leave="transition ease-in duration-125"
                        x-transition:leave-start="opacity-100 translate-y-0"
                        x-transition:leave-end="opacity-0 -translate-y-1">
                        <li>
                            <a href="{{ route('laporan.index') }}" @class([
                                'menu-link',
                                'active-icon' => request()->routeIs('laporan.*'),
                            ])>
                                <div class="text-sm"><span class="me-2">--</span>Prediksi Kematangan</div>
                            </a>
                        </li>
                        <li>
                            <a href="{{ route('laporan.log-penerbangan') }}" @class([
                                'menu-link',
                                'active-icon' => request()->routeIs('laporan.log-penerbangan'),
                            ])>
                                <div class="text-sm"><span class="me-2">--</span>Log Penerbangan</div>
                            </a>
                        </li>
                    </ul>
                </li>

                <li class="menu-item">
                    <a href="{{ route('pengaturan-aplikasi.index') }}" @class([
                        'menu-link',
                        'active-icon' => request()->routeIs('pengaturan-aplikasi.*'),
                    ])>
                        <i class="menu-icon fa-solid fa-gear"></i>
                        <div class="text-base">Pengaturan Aplikasi</div>
                    </a>
                </li>

                <li class="menu-item">
                    <a href="{{ route('log-aktivitas') }}" @class([
                        'menu-link',
                        'active-icon' => request()->routeIs('log-aktivitas'),
                    ])>
                        <i class="menu-icon fa-solid fa-clock-rotate-left"></i>
                        <div class="text-base">Log Aktivitas</div>
                    </a>
                </li>
            </ul>
        </div>
        <div id="menu-footer" class="mb-3 text-center font-normal text-xs text-slate-400 px-2 leading-relaxed">
            <div id="menu-version" class="text-slate-500 mb-0.5"></div>
        </div>

    </div>
</div>
