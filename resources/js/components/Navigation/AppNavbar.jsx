import React, { useState, useEffect, useRef } from 'react';
import { 
    LayoutDashboard, 
    Database, 
    Map, 
    Leaf, 
    Plane, 
    Users, 
    Gamepad2, 
    Layers, 
    Route, 
    Wifi, 
    Eye,
    Brain, 
    History, 
    Settings, 
    Cloud, 
    ChevronDown, 
    User, 
    LogOut, 
    Menu, 
    X, 
    Clock,
    Cog,
    BarChart3,
    Cpu
} from 'lucide-react';

const AppNavbar = ({ 
    userName, 
    userEmail, 
    userInitial, 
    routes, 
    currentRoute, 
    csrfToken 
}) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [scrolled, setScrolled] = useState(false);
    const navRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (navRef.current && !navRef.current.contains(event.target)) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const toggleDropdown = (name) => setActiveDropdown(activeDropdown === name ? null : name);

    const isRouteActive = (routePrefixes) => {
        if (!currentRoute) return false;
        return routePrefixes.some(prefix => currentRoute === prefix || currentRoute.startsWith(prefix + '.'));
    };

    /* ── Pill nav link ── */
    const NavLink = ({ href, active, icon: Icon, children }) => (
        <a href={href}
            className={`relative flex items-center gap-2 px-3.5 py-2 text-[13px] font-semibold rounded-xl transition-all duration-200 group
                ${active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'}`}>
            {Icon && <Icon size={14} className={`shrink-0 transition-colors ${active ? 'text-blue-200' : 'text-slate-400 group-hover:text-slate-600'}`} />}
            {children}
            {active && <span className="absolute inset-0 rounded-xl ring-1 ring-blue-500/30 pointer-events-none" />}
        </a>
    );

    /* ── Dropdown trigger ── */
    const DropTrigger = ({ name, active, icon: Icon, children }) => (
        <button onClick={() => toggleDropdown(name)}
            className={`relative flex items-center gap-2 px-3.5 py-2 text-[13px] font-semibold rounded-xl transition-all duration-200 group
                ${active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'}`}>
            {Icon && <Icon size={14} className={`shrink-0 ${active ? 'text-blue-200' : 'text-slate-400 group-hover:text-slate-600'}`} />}
            {children}
            <ChevronDown size={12} className={`ml-0.5 transition-transform duration-200 ${activeDropdown === name ? 'rotate-180' : ''} ${active ? 'text-blue-200' : 'text-slate-400'}`} />
            {active && <span className="absolute inset-0 rounded-xl ring-1 ring-blue-500/30 pointer-events-none" />}
        </button>
    );

    /* ── Dropdown item ── */
    const DropItem = ({ href, active, icon: Icon, badge, children }) => (
        <a href={href}
            className={`flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium rounded-xl transition-all duration-150 mx-1
                ${active
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-0.5'}`}>
            {Icon && (
                <span className={`w-7 h-7 flex items-center justify-center rounded-lg shrink-0 ${active ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                    <Icon size={13} />
                </span>
            )}
            <span className="flex-1">{children}</span>
            {badge && <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">{badge}</span>}
        </a>
    );

    /* ── Disabled dropdown item ── */
    const DropItemDisabled = ({ icon: Icon, badge, children }) => (
        <div className="flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium rounded-xl mx-1 opacity-50 cursor-not-allowed">
            {Icon && <span className="w-7 h-7 flex items-center justify-center rounded-lg shrink-0 bg-slate-100 text-slate-400"><Icon size={13} /></span>}
            <span className="flex-1 text-slate-500">{children}</span>
            {badge && <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">{badge}</span>}
        </div>
    );

    /* ── Dropdown panel ── */
    const DropPanel = ({ children, width = 'w-52' }) => (
        <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 ${width} bg-white border border-slate-100 rounded-2xl shadow-xl shadow-black/[0.08] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150`}>
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-t border-l border-slate-100 rotate-45 rounded-tl-sm" />
            {children}
        </div>
    );

    return (
        <nav ref={navRef}
            className={`w-full sticky top-0 z-[100] transition-all duration-300
                ${scrolled
                    ? 'bg-white/95 backdrop-blur-xl shadow-[0_1px_24px_-4px_rgba(0,0,0,0.12)] border-b border-slate-200/80'
                    : 'bg-white/90 backdrop-blur-xl border-b border-slate-200/50 shadow-sm'}`}>

            <div className="flex items-center justify-between h-16 px-4 lg:px-6 max-w-[1920px] mx-auto gap-3">

                {/* ── BRAND ── */}
                <a href={routes.dashboard || '/'} className="flex items-center gap-3 shrink-0 group">
                    <div className="relative">
                        <img
                            src="/images/logo-ipb-full.png"
                            alt="Logo IPB"
                            className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                        />
                        <div style={{ display: 'none' }}
                            className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white items-center justify-center font-black text-sm shadow-md">
                            GCS
                        </div>
                    </div>
                    <div className="hidden sm:flex flex-col leading-none">
                        <span className="font-black text-[14px] text-slate-900 tracking-tight" style={{ letterSpacing: '-0.03em' }}>Drone CPS</span>
                        <span className="text-slate-400 text-[10px] font-semibold tracking-widest uppercase mt-0.5">GCS Platform</span>
                    </div>
                </a>

                {/* ── DESKTOP NAV ── */}
                <div className="hidden xl:flex items-center gap-1 flex-1 justify-center">

                    <NavLink href={routes.dashboard} active={isRouteActive(['dashboard'])} icon={LayoutDashboard}>
                        Dashboard
                    </NavLink>

                    {/* Data Master */}
                    <div className="relative">
                        <DropTrigger name="master" active={isRouteActive(['lahan', 'kebun', 'perangkat', 'user'])} icon={Database}>
                            Data Master
                        </DropTrigger>
                        {activeDropdown === 'master' && (
                            <DropPanel>
                                <DropItem href={routes.lahan} active={isRouteActive(['lahan'])} icon={Map}>Data Lahan</DropItem>
                                <DropItem href={routes.kebun} active={isRouteActive(['kebun'])} icon={Leaf}>Data Kebun</DropItem>
                                <DropItem href={routes.perangkat} active={isRouteActive(['perangkat'])} icon={Plane}>Data Perangkat</DropItem>
                                <DropItem href={routes.user} active={isRouteActive(['user'])} icon={Users}>Data User</DropItem>
                            </DropPanel>
                        )}
                    </div>

                    {/* GCS — special pill */}
                    <a href={routes.gcs}
                        className={`relative flex items-center gap-2 px-4 py-2 text-[13px] font-black rounded-xl transition-all duration-200 shadow-sm mx-1
                            ${isRouteActive(['gcs'])
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/40 hover:shadow-blue-500/60 hover:-translate-y-0.5'
                                : 'bg-slate-900 text-white hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-900/20'}`}>
                        <Gamepad2 size={14} className={isRouteActive(['gcs']) ? 'text-blue-200 animate-pulse' : 'text-slate-400'} />
                        GCS
                        {isRouteActive(['gcs']) && <span className="absolute inset-0 rounded-xl ring-2 ring-blue-400/30 pointer-events-none" />}
                    </a>

                    {/* Dataset */}
                    <div className="relative">
                        <DropTrigger name="dataset" active={isRouteActive(['drone-dataset', 'kebun-dataset', 'sawit-dataset'])} icon={Layers}>
                            Dataset
                        </DropTrigger>
                        {activeDropdown === 'dataset' && (
                            <DropPanel>
                                <DropItem href={routes.droneDataset} active={isRouteActive(['drone-dataset'])} icon={Plane}>Dataset Drone</DropItem>
                                <DropItem href={routes.kebunDataset} active={isRouteActive(['kebun-dataset'])} icon={Leaf}>Dataset Kebun</DropItem>
                                <DropItem href={routes.sawitDataset} active={isRouteActive(['sawit-dataset'])} icon={Database}>Dataset Sawit</DropItem>
                            </DropPanel>
                        )}
                    </div>

                    {/* Rule Engine */}
                    <div className="relative">
                        <DropTrigger name="rule" active={isRouteActive(['dead-reckoning'])} icon={Cog}>
                            Rule Engine
                        </DropTrigger>
                        {activeDropdown === 'rule' && (
                            <DropPanel width="w-60">
                                <DropItem href={routes.deadReckoning} active={isRouteActive(['dead-reckoning'])} icon={Route}>Dead-Reckoning</DropItem>
                                <DropItemDisabled icon={Wifi} badge="SOON">Live-Reckoning</DropItemDisabled>
                                <DropItemDisabled icon={Eye} badge="SOON">Quick Look Vision</DropItemDisabled>
                            </DropPanel>
                        )}
                    </div>

                    {/* Laporan */}
                    <div className="relative">
                        <DropTrigger name="laporan" active={isRouteActive(['laporan'])} icon={BarChart3}>
                            Laporan
                        </DropTrigger>
                        {activeDropdown === 'laporan' && (
                            <DropPanel width="w-56">
                                <DropItem href={routes.laporanAi} active={currentRoute === 'laporan.index'} icon={Brain}>Prediksi Kematangan</DropItem>
                                <DropItem href={routes.laporanLog} active={currentRoute === 'laporan.log-penerbangan'} icon={History}>Log Penerbangan</DropItem>
                            </DropPanel>
                        )}
                    </div>

                    <NavLink href={routes.pengaturan} active={isRouteActive(['pengaturan-aplikasi'])} icon={Settings}>
                        Pengaturan
                    </NavLink>

                </div>

                {/* ── RIGHT ICONS ── */}
                <div className="hidden xl:flex items-center gap-2">
                    <a href={routes.logAktivitas} title="Log Aktivitas"
                        className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-all">
                        <Clock size={17} />
                    </a>
                    <a href={routes.cuaca} title="Cuaca Misi"
                        className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-sky-500 transition-all">
                        <Cloud size={17} />
                    </a>

                    {/* Separator */}
                    <div className="w-px h-5 bg-slate-200 mx-1" />

                    {/* User pill */}
                    <div className="relative">
                        <button onClick={() => toggleDropdown('user')}
                            className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-all duration-200 group">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-[11px] font-black text-white shadow">
                                {userInitial}
                            </div>
                            <div className="hidden lg:flex flex-col items-start leading-none">
                                <span className="text-[12px] font-bold text-slate-800">{userName}</span>
                                <span className="text-[10px] text-slate-400 font-medium mt-0.5">Admin</span>
                            </div>
                            <ChevronDown size={12} className={`text-slate-400 transition-transform duration-200 ${activeDropdown === 'user' ? 'rotate-180' : ''}`} />
                        </button>

                        {activeDropdown === 'user' && (
                            <div className="absolute top-full right-0 mt-3 w-64 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-black/[0.08] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                                {/* User info header */}
                                <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50/50 border-b border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-sm font-black text-white shadow-md">
                                            {userInitial}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-800">{userName}</div>
                                            <div className="text-xs text-slate-500 mt-0.5">{userEmail}</div>
                                        </div>
                                    </div>
                                    <div className="mt-3 inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                        Administrator
                                    </div>
                                </div>
                                <div className="p-2">
                                    <a href={routes.profile}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-700 transition-colors">
                                        <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500"><User size={13} /></span>
                                        Profil Saya
                                    </a>
                                    <form action={routes.logout} method="POST" className="w-full">
                                        <input type="hidden" name="_token" value={csrfToken} />
                                        <button type="submit"
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors">
                                            <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-rose-50 text-rose-500"><LogOut size={13} /></span>
                                            Keluar Sistem
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── MOBILE HAMBURGER ── */}
                <button onClick={() => setMobileOpen(!mobileOpen)}
                    className="xl:hidden w-9 h-9 flex items-center justify-center bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all">
                    {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
            </div>

            {/* ── MOBILE MENU ── */}
            {mobileOpen && (
                <div className="xl:hidden bg-white border-t border-slate-200/60 shadow-2xl max-h-[80vh] overflow-y-auto animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="p-4 space-y-1">

                        <a href={routes.dashboard} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isRouteActive(['dashboard']) ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-700 hover:bg-slate-100'}`}>
                            <LayoutDashboard size={16} className={isRouteActive(['dashboard']) ? 'text-blue-200' : 'text-slate-400'} />Dashboard
                        </a>

                        <div className="pt-3 pb-1.5 px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.12em]">Data Master</div>
                        {[
                            { href: routes.lahan, label: 'Data Lahan', icon: Map, key: 'lahan' },
                            { href: routes.kebun, label: 'Data Kebun', icon: Leaf, key: 'kebun' },
                            { href: routes.perangkat, label: 'Data Perangkat', icon: Plane, key: 'perangkat' },
                            { href: routes.user, label: 'Data User', icon: Users, key: 'user' },
                        ].map(({ href, label, icon: Icon, key }) => (
                            <a key={key} href={href} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isRouteActive([key]) ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-700 hover:bg-slate-100'}`}>
                                <Icon size={16} className={isRouteActive([key]) ? 'text-blue-200' : 'text-slate-400'} />{label}
                            </a>
                        ))}

                        <div className="pt-3 pb-1.5 px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.12em]">GCS & Laporan</div>
                        <a href={routes.gcs} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black transition-all ${isRouteActive(['gcs']) ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                            <Gamepad2 size={16} className="text-slate-400" />Ground Control Station
                        </a>
                        <a href={routes.laporanAi} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${currentRoute === 'laporan.index' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-700 hover:bg-slate-100'}`}>
                            <Brain size={16} className={currentRoute === 'laporan.index' ? 'text-blue-200' : 'text-slate-400'} />Prediksi Kematangan
                        </a>
                        <a href={routes.laporanLog} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${currentRoute === 'laporan.log-penerbangan' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-700 hover:bg-slate-100'}`}>
                            <History size={16} className={currentRoute === 'laporan.log-penerbangan' ? 'text-blue-200' : 'text-slate-400'} />Log Penerbangan
                        </a>

                        <div className="pt-3 pb-1.5 px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.12em]">Dataset & Rule Engine</div>
                        <a href={routes.droneDataset} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isRouteActive(['drone-dataset']) ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-700 hover:bg-slate-100'}`}>
                            <Layers size={16} className={isRouteActive(['drone-dataset']) ? 'text-blue-200' : 'text-slate-400'} />Dataset Drone
                        </a>
                        <a href={routes.deadReckoning} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isRouteActive(['dead-reckoning']) ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-700 hover:bg-slate-100'}`}>
                            <Route size={16} className={isRouteActive(['dead-reckoning']) ? 'text-blue-200' : 'text-slate-400'} />Dead-Reckoning
                        </a>

                        <div className="pt-3 pb-1.5 px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.12em]">Sistem</div>
                        <a href={routes.cuaca} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isRouteActive(['cuaca']) ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-700 hover:bg-slate-100'}`}>
                            <Cloud size={16} className={isRouteActive(['cuaca']) ? 'text-blue-200' : 'text-slate-400'} />Cuaca Misi
                        </a>
                        <a href={routes.pengaturan} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isRouteActive(['pengaturan-aplikasi']) ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-700 hover:bg-slate-100'}`}>
                            <Settings size={16} className={isRouteActive(['pengaturan-aplikasi']) ? 'text-blue-200' : 'text-slate-400'} />Pengaturan Aplikasi
                        </a>
                        <a href={routes.logAktivitas} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isRouteActive(['log-aktivitas']) ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-700 hover:bg-slate-100'}`}>
                            <Clock size={16} className={isRouteActive(['log-aktivitas']) ? 'text-blue-200' : 'text-slate-400'} />Log Aktivitas
                        </a>

                        {/* User Section */}
                        <div className="border-t border-slate-100 mt-4 pt-4 space-y-2">
                            <a href={routes.profile} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 transition-all">
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-[11px] font-black text-white">{userInitial}</div>
                                {userName}
                            </a>
                            <form method="POST" action={routes.logout} className="w-full">
                                <input type="hidden" name="_token" value={csrfToken} />
                                <button type="submit" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-all">
                                    <LogOut size={16} className="text-rose-500" />Keluar Sistem
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default AppNavbar;
