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
    FileText, 
    Brain, 
    History, 
    Settings, 
    Cloud, 
    ChevronDown, 
    User, 
    LogOut, 
    Menu, 
    X, 
    Clock
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
    const navRef = useRef(null);

    // Handle click outside to close dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (navRef.current && !navRef.current.contains(event.target)) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = (name) => {
        setActiveDropdown(activeDropdown === name ? null : name);
    };

    // Helper for active route classes
    const isRouteActive = (routePrefixes) => {
        if (!currentRoute) return false;
        return routePrefixes.some(prefix => currentRoute === prefix || currentRoute.startsWith(prefix + '.'));
    };

    const navLinkClass = (isActive) => 
        `relative px-4 py-2.5 text-[13px] font-bold rounded-xl transition-all duration-300 flex items-center gap-2 overflow-hidden
        ${isActive ? 'text-blue-700 bg-blue-50/90 shadow-[0_2px_10px_-3px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/10' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100/60'}`;

    const dropdownItemClass = (isActive) => 
        `flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold transition-all duration-200 rounded-lg mx-2 mb-1 last:mb-0
        ${isActive ? 'bg-blue-50/80 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600 hover:translate-x-1'}`;

    const mobileNavLinkClass = (isActive) => 
        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 mx-4 mb-1 last:mb-0
        ${isActive ? 'bg-blue-50/80 text-blue-700 shadow-sm ring-1 ring-blue-500/10' : 'text-slate-600 hover:bg-slate-50/80'}`;

    return (
        <nav ref={navRef} className="w-full sticky top-0 z-[100] backdrop-blur-xl bg-white/80 border-b border-slate-200/60 shadow-sm">
            <div className="flex items-center justify-between h-[72px] px-4 lg:px-6 max-w-[1920px] mx-auto">
                
                {/* BRAND LOGO */}
                <a href={routes.dashboard || '/'} className="flex items-center gap-3 shrink-0 group">
                    <img 
                        src="/images/logo-ipb-full.png" 
                        alt="Logo IPB" 
                        className="h-16 w-auto object-contain transition-transform group-hover:scale-105" 
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                    <div style={{ display: 'none' }} className="w-10 h-10 rounded-full bg-blue-900 text-white items-center justify-center font-black text-base shrink-0">
                        GCS
                    </div>
                    <div className="w-px h-8 bg-slate-200 hidden sm:block mx-1"></div>
                    <div className="hidden sm:flex flex-col leading-none gap-0.5">
                        <span className="font-bold text-[15px] leading-tight text-blue-900">Drone CPS</span>
                        <span className="text-slate-400 text-[10px] font-medium tracking-wide">Ground Control Station</span>
                    </div>
                </a>

                {/* DESKTOP MENU */}
                <div className="hidden xl:flex items-center gap-1 flex-1 justify-center">
                    
                    {/* Dashboard */}
                    <a href={routes.dashboard} className={navLinkClass(isRouteActive(['dashboard']))}>
                        Dashboard
                    </a>

                    {/* Data Master Dropdown */}
                    <div className="relative">
                        <button onClick={() => toggleDropdown('master')} className={navLinkClass(isRouteActive(['lahan', 'kebun', 'perangkat', 'user']))}>
                            Data Master
                            <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === 'master' ? 'rotate-180' : ''}`} />
                        </button>
                        {activeDropdown === 'master' && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 py-3 animate-in fade-in slide-in-from-top-4 duration-300">
                                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t border-l border-slate-100 rotate-45 rounded-sm"></div>
                                <a href={routes.lahan} className={dropdownItemClass(isRouteActive(['lahan']))}><Map size={16} className="text-blue-500" /> Data Lahan</a>
                                <a href={routes.kebun} className={dropdownItemClass(isRouteActive(['kebun']))}><Leaf size={16} className="text-emerald-500" /> Data Kebun</a>
                                <a href={routes.perangkat} className={dropdownItemClass(isRouteActive(['perangkat']))}><Plane size={16} className="text-sky-500" /> Data Perangkat</a>
                                <a href={routes.user} className={dropdownItemClass(isRouteActive(['user']))}><Users size={16} className="text-indigo-500" /> Data User</a>
                            </div>
                        )}
                    </div>

                    {/* GCS BUTTON */}
                    <div className="px-2">
                        <a href={routes.gcs} className={`relative px-5 py-2.5 text-[13px] font-black rounded-xl transition-all duration-300 flex items-center gap-2 overflow-hidden shadow-sm hover:shadow-lg ${isRouteActive(['gcs']) ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/40 hover:-translate-y-0.5' : 'bg-slate-800 text-white hover:bg-slate-700 hover:-translate-y-0.5'}`}>
                            <Gamepad2 size={16} className={isRouteActive(['gcs']) ? 'animate-pulse' : ''} /> GCS
                        </a>
                    </div>

                    {/* Dataset Dropdown */}
                    <div className="relative">
                        <button onClick={() => toggleDropdown('dataset')} className={navLinkClass(isRouteActive(['drone-dataset', 'kebun-dataset', 'sawit-dataset']))}>
                            Dataset
                            <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === 'dataset' ? 'rotate-180' : ''}`} />
                        </button>
                        {activeDropdown === 'dataset' && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-48 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 py-3 animate-in fade-in slide-in-from-top-4 duration-300">
                                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t border-l border-slate-100 rotate-45 rounded-sm"></div>
                                <a href={routes.droneDataset} className={dropdownItemClass(isRouteActive(['drone-dataset']))}><Plane size={16} className="text-blue-500" /> Drone</a>
                                <a href={routes.kebunDataset} className={dropdownItemClass(isRouteActive(['kebun-dataset']))}><Leaf size={16} className="text-emerald-500" /> Kebun</a>
                                <a href={routes.sawitDataset} className={dropdownItemClass(isRouteActive(['sawit-dataset']))}><Database size={16} className="text-amber-500" /> Sawit</a>
                            </div>
                        )}
                    </div>

                    {/* Rule Engine Dropdown */}
                    <div className="relative">
                        <button onClick={() => toggleDropdown('rule')} className={navLinkClass(isRouteActive(['dead-reckoning']))}>
                            Rule Engine
                            <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === 'rule' ? 'rotate-180' : ''}`} />
                        </button>
                        {activeDropdown === 'rule' && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 py-3 animate-in fade-in slide-in-from-top-4 duration-300">
                                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t border-l border-slate-100 rotate-45 rounded-sm"></div>
                                <a href={routes.deadReckoning} className={dropdownItemClass(isRouteActive(['dead-reckoning']))}><Route size={16} className="text-blue-500" /> Dead-Reckoning</a>
                                <div className="flex items-center justify-between px-4 py-2 text-[13px] font-semibold text-slate-400 bg-slate-50/50 cursor-not-allowed mx-2 mb-1 rounded-lg">
                                    <span className="flex items-center gap-3"><Wifi size={16} /> Live-Reckoning</span>
                                    <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold shadow-sm">SOON</span>
                                </div>
                                <div className="flex items-center justify-between px-4 py-2 text-[13px] font-semibold text-slate-400 bg-slate-50/50 cursor-not-allowed mx-2 rounded-lg">
                                    <span className="flex items-center gap-3"><Eye size={16} /> Quick Look Vision</span>
                                    <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold shadow-sm">SOON</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Laporan Dropdown */}
                    <div className="relative">
                        <button onClick={() => toggleDropdown('laporan')} className={navLinkClass(isRouteActive(['laporan']))}>
                            Laporan
                            <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === 'laporan' ? 'rotate-180' : ''}`} />
                        </button>
                        {activeDropdown === 'laporan' && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-60 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 py-3 animate-in fade-in slide-in-from-top-4 duration-300">
                                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t border-l border-slate-100 rotate-45 rounded-sm"></div>
                                <a href={routes.laporanAi} className={dropdownItemClass(currentRoute === 'laporan.index')}><Brain size={16} className="text-purple-500" /> Prediksi Kematangan</a>
                                <a href={routes.laporanLog} className={dropdownItemClass(currentRoute === 'laporan.log-penerbangan')}><History size={16} className="text-blue-500" /> Log Penerbangan</a>
                            </div>
                        )}
                    </div>

                    {/* Pengaturan */}
                    <a href={routes.pengaturan} className={navLinkClass(isRouteActive(['pengaturan-aplikasi']))}>
                        Pengaturan
                    </a>
                </div>

                {/* RIGHT ICONS & USER */}
                <div className="hidden xl:flex items-center gap-3">
                    <a href={routes.logAktivitas} title="Log Aktivitas" className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors">
                        <Clock size={18} />
                    </a>
                    <a href={routes.cuaca} title="Pengaturan Cuaca" className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-sky-500 transition-colors">
                        <Cloud size={18} />
                    </a>
                    <div className="w-px h-6 bg-slate-200 mx-1"></div>

                    {/* User Profile */}
                    <div className="relative">
                        <button onClick={() => toggleDropdown('user')} className="flex items-center gap-3 bg-slate-50 hover:bg-blue-50/50 border border-slate-200/60 hover:border-blue-200 px-2 py-1.5 rounded-2xl transition-all shadow-sm">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-black text-white shadow-[0_2px_8px_-2px_rgba(79,70,229,0.4)]">
                                {userInitial}
                            </div>
                            <div className="hidden lg:flex flex-col text-left leading-none pr-1">
                                <span className="text-xs font-bold text-slate-700">{userName}</span>
                                <span className="text-[10px] font-semibold text-slate-400 mt-0.5">Administrator</span>
                            </div>
                            <ChevronDown size={14} className={`text-slate-400 mr-1 transition-transform duration-200 ${activeDropdown === 'user' ? 'rotate-180' : ''}`} />
                        </button>

                        {activeDropdown === 'user' && (
                            <div className="absolute top-full right-0 mt-4 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                                <div className="p-4 bg-slate-50/50 border-b border-slate-100">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Login Sebagai</div>
                                    <div className="font-black text-slate-800 text-sm">{userName}</div>
                                    <div className="text-xs font-medium text-slate-500 mt-0.5">{userEmail}</div>
                                </div>
                                <div className="p-2 flex flex-col">
                                    <a href={routes.profile} className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors">
                                        <User size={16} /> Profil Saya
                                    </a>
                                    <form action={routes.logout} method="POST" className="w-full">
                                        <input type="hidden" name="_token" value={csrfToken} />
                                        <button type="submit" className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                                            <LogOut size={16} /> Keluar
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* MOBILE HAMBURGER */}
                <button onClick={() => setMobileOpen(!mobileOpen)} className="xl:hidden p-2.5 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-blue-600 rounded-xl transition-colors">
                    {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* MOBILE MENU DROPDOWN */}
            {mobileOpen && (
                <div className="xl:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200/60 shadow-2xl overflow-y-auto max-h-[calc(100vh-[72px])] animate-in slide-in-from-top-4 fade-in duration-300 pb-8">
                    <div className="py-6 space-y-1">
                        <a href={routes.dashboard} className={mobileNavLinkClass(isRouteActive(['dashboard']))}>
                            <LayoutDashboard size={18} className={isRouteActive(['dashboard']) ? 'text-blue-600' : 'text-slate-400'} /> Dashboard
                        </a>

                        <div className="pt-5 pb-2 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Master</div>
                        <a href={routes.lahan} className={mobileNavLinkClass(isRouteActive(['lahan']))}>
                            <Map size={18} className={isRouteActive(['lahan']) ? 'text-blue-600' : 'text-slate-400'} /> Data Lahan
                        </a>
                        <a href={routes.kebun} className={mobileNavLinkClass(isRouteActive(['kebun']))}>
                            <Leaf size={18} className={isRouteActive(['kebun']) ? 'text-blue-600' : 'text-slate-400'} /> Data Kebun
                        </a>
                        <a href={routes.perangkat} className={mobileNavLinkClass(isRouteActive(['perangkat']))}>
                            <Plane size={18} className={isRouteActive(['perangkat']) ? 'text-blue-600' : 'text-slate-400'} /> Data Perangkat
                        </a>
                        <a href={routes.user} className={mobileNavLinkClass(isRouteActive(['user']))}>
                            <Users size={18} className={isRouteActive(['user']) ? 'text-blue-600' : 'text-slate-400'} /> Data User
                        </a>

                        <div className="pt-5 pb-2 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Laporan</div>
                        <a href={routes.gcs} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black transition-all shadow-sm ${isRouteActive(['gcs']) ? 'bg-blue-600 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>
                            <Gamepad2 size={18} /> Ground Control Station
                        </a>
                        <a href={routes.laporanAi} className={mobileNavLinkClass(currentRoute === 'laporan.index')}>
                            <Brain size={18} className={currentRoute === 'laporan.index' ? 'text-blue-600' : 'text-slate-400'} /> Prediksi Kematangan
                        </a>
                        <a href={routes.laporanLog} className={mobileNavLinkClass(currentRoute === 'laporan.log-penerbangan')}>
                            <History size={18} className={currentRoute === 'laporan.log-penerbangan' ? 'text-blue-600' : 'text-slate-400'} /> Log Penerbangan
                        </a>

                        <div className="pt-5 pb-2 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Dataset & Rule Engine</div>
                        <a href={routes.droneDataset} className={mobileNavLinkClass(isRouteActive(['drone-dataset']))}>
                            <Layers size={18} className={isRouteActive(['drone-dataset']) ? 'text-blue-600' : 'text-slate-400'} /> Dataset Drone
                        </a>
                        <a href={routes.deadReckoning} className={mobileNavLinkClass(isRouteActive(['dead-reckoning']))}>
                            <Route size={18} className={isRouteActive(['dead-reckoning']) ? 'text-blue-600' : 'text-slate-400'} /> Dead-Reckoning
                        </a>

                        <div className="pt-4 pb-2 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pengaturan Sistem</div>
                        <a href={routes.cuaca} className={mobileNavLinkClass(isRouteActive(['cuaca']))}>
                            <Cloud size={18} className={isRouteActive(['cuaca']) ? 'text-blue-600' : 'text-slate-400'} /> Cuaca Misi
                        </a>
                        <a href={routes.pengaturan} className={mobileNavLinkClass(isRouteActive(['pengaturan-aplikasi']))}>
                            <Settings size={18} className={isRouteActive(['pengaturan-aplikasi']) ? 'text-blue-600' : 'text-slate-400'} /> Pengaturan Aplikasi
                        </a>
                        <a href={routes.logAktivitas} className={mobileNavLinkClass(isRouteActive(['log-aktivitas']))}>
                            <Clock size={18} className={isRouteActive(['log-aktivitas']) ? 'text-blue-600' : 'text-slate-400'} /> Log Aktivitas
                        </a>
                        
                        <div className="border-t border-slate-100 mt-6 pt-4 space-y-2">
                            <a href={routes.profile} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors">
                                <User size={18} className="text-slate-400" /> Profil Saya
                            </a>
                            <form method="POST" action={routes.logout} className="w-full">
                                <input type="hidden" name="_token" value={csrfToken} />
                                <button type="submit" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors shadow-sm">
                                    <LogOut size={18} className="text-red-500" /> Keluar Sistem
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
