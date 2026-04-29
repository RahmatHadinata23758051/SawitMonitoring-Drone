import React, { useState, useEffect } from 'react';
import { 
  Map, Grid, Plane, Crosshair, PlaneTakeoff, BrainCircuit, 
  Activity, History, Cloud, Wind, Droplets, CloudRain, 
  Trees, CheckCircle, Clock, Users, Rocket, FileText, Leaf, 
  Cpu, MapPin, ArrowRight, PlaneTakeoff as PlaneTakeoffIcon,
  HelpCircle, Clock3, ChevronRight, Zap, Info, BarChart3, CloudLightning, Maximize, Play
} from 'lucide-react';

const AppDashboard = ({
  countLahan, countKebun, countPerangkat, countUser,
  countPohon, countPohonMatang, countPohonBelumMatang,
  lahan, cuaca,
  countMissions, countFlightLogs, totalSampel, totalMatang, totalBelum,
  avgAccuracy, recentFlights
}) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Helpers
  const formatNumber = (num) => new Intl.NumberFormat('id-ID').format(num || 0);
  const matangPct = totalSampel > 0 ? ((totalMatang / totalSampel) * 100).toFixed(1) : 0;
  const belumPct = totalSampel > 0 ? (100 - matangPct).toFixed(1) : 0;

  return (
    <div className={`relative w-full bg-slate-50 min-h-screen text-slate-900 font-sans transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* Premium Hero Section with Image Background */}
      <section className="relative w-full bg-slate-900 overflow-hidden pb-32 pt-12 md:pt-20 border-b border-slate-800 shadow-2xl">
        <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=2000" 
              alt="Drone over plantation" 
              className="w-full h-full object-cover opacity-20 mix-blend-luminosity transform scale-105 animate-[pulse_20s_ease-in-out_infinite_alternate]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-80"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="max-w-3xl transform transition-all duration-1000 translate-y-0 opacity-100">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold mb-6 border border-blue-500/20 backdrop-blur-sm animate-[pulse_3s_infinite]">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
              Sistem Terintegrasi AI Aktif
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white mb-5 leading-tight">
              Pusat Kendali <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Drone Cerdas</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-medium mb-8 max-w-2xl border-l-4 border-emerald-500 pl-4">
              Monitoring perkebunan kelapa sawit presisi tinggi. Menggabungkan telemetri <strong className="text-white">Real-time</strong> dan deteksi kematangan visual melalui <strong className="text-white">Artificial Intelligence</strong>.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <a href="/gcs" className="group relative inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-blue-600 text-white rounded-xl font-bold text-sm overflow-hidden transition-all hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:-translate-y-1">
                <PlaneTakeoff className="w-5 h-5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" /> 
                <span>Luncurkan GCS</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              </a>
              <a href="/laporan" className="group inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-slate-800 border border-slate-700 text-white rounded-xl font-bold text-sm transition-all hover:bg-slate-700 hover:border-slate-500 hover:shadow-lg hover:-translate-y-1">
                <BarChart3 className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" /> Laporan Analisis
              </a>
            </div>
          </div>
          
          <div className="hidden lg:block relative w-full max-w-md perspective-1000 transform transition-all duration-1000 delay-300 translate-y-0 opacity-100">
            <div className="relative rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-md p-6 shadow-2xl rotate-y-[-10deg] rotate-x-[5deg] hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-700 ease-out">
                <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-4">
                    <span className="text-slate-300 font-semibold flex items-center gap-2"><Activity className="w-4 h-4 text-blue-400" /> Status Koneksi</span>
                    <span className="text-xs font-bold px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-md">1 Terhubung</span>
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-400">Satelit GPS</span>
                        <span className="text-sm font-mono text-white font-bold">12 Lock</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-400">Latensi Video</span>
                        <span className="text-sm font-mono text-emerald-400 font-bold">42ms</span>
                    </div>
                    <div className="w-full bg-slate-700/50 h-2 rounded-full overflow-hidden mt-2">
                        <div className="bg-emerald-500 w-[95%] h-full animate-pulse"></div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Stats Grid */}
      <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-200 transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group flex flex-col justify-between h-36 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
              <Map className="w-16 h-16 text-blue-600" />
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm relative z-10">
              <Map className="w-5 h-5" />
            </div>
            <div className="relative z-10 mt-auto pt-4 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Lahan</p>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{formatNumber(countLahan)} <span className="text-sm font-semibold text-slate-400">Area</span></p>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-200 transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group flex flex-col justify-between h-36 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
              <Trees className="w-16 h-16 text-emerald-600" />
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm relative z-10">
              <Trees className="w-5 h-5" />
            </div>
            <div className="relative z-10 mt-auto pt-4 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pohon Master</p>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{formatNumber(countPohon)} <span className="text-sm font-semibold text-slate-400">Pohon</span></p>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-200 transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group flex flex-col justify-between h-36 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
              <Plane className="w-16 h-16 text-orange-600" />
            </div>
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100 shadow-sm relative z-10">
              <Plane className="w-5 h-5" />
            </div>
            <div className="relative z-10 mt-auto pt-4 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Drone Aktif</p>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{formatNumber(countPerangkat)} <span className="text-sm font-semibold text-slate-400">Unit</span></p>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-200 transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group flex flex-col justify-between h-36 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
              <BrainCircuit className="w-16 h-16 text-indigo-600" />
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm relative z-10">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div className="relative z-10 mt-auto pt-4 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Akurasi Rata-rata</p>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{avgAccuracy > 0 ? `${Number(avgAccuracy).toFixed(1)}%` : '--'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Areas */}
      <section className="py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              
              {/* Scan Summary Card - Elevated Design */}
              <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden group hover:shadow-lg transition-shadow duration-300">
                <div className="border-b border-slate-100 p-6 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                      <ScanIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Performa Pemindaian AI</h2>
                      <p className="text-sm text-slate-500 font-medium">Akumulasi hasil deteksi kematangan buah</p>
                    </div>
                  </div>
                  <a href="/laporan/log-penerbangan" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                    Log Lengkap <ArrowRight className="w-4 h-4" />
                  </a>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="relative p-5 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 overflow-hidden">
                      <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/10 rounded-full blur-xl"></div>
                      <p className="text-sm font-bold text-slate-500 mb-1 uppercase tracking-wider">Total Terdeteksi</p>
                      <p className="text-4xl font-black text-slate-900">{formatNumber(totalSampel)}</p>
                    </div>
                    
                    <div className="relative p-5 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 overflow-hidden">
                      <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-500/20 rounded-full blur-xl"></div>
                      <p className="text-sm font-bold text-emerald-700 mb-1 uppercase tracking-wider flex items-center gap-2"><CheckCircle className="w-4 h-4"/> Buah Matang</p>
                      <p className="text-4xl font-black text-emerald-800">{formatNumber(totalMatang)}</p>
                    </div>
                    
                    <div className="relative p-5 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200 overflow-hidden">
                      <div className="absolute -right-4 -top-4 w-16 h-16 bg-amber-500/20 rounded-full blur-xl"></div>
                      <p className="text-sm font-bold text-amber-700 mb-1 uppercase tracking-wider flex items-center gap-2"><Clock className="w-4 h-4"/> Buah Mentah</p>
                      <p className="text-4xl font-black text-amber-800">{formatNumber(totalBelum)}</p>
                    </div>
                  </div>

                  {totalSampel > 0 && (
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2"><BarChart3 className="w-4 h-4"/> Rasio Kematangan</span>
                        <span className="text-sm font-black text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">{matangPct}% Matang</span>
                      </div>
                      <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
                        <div className="bg-emerald-500 transition-all duration-1000 ease-out relative" style={{ width: `${matangPct}%` }}>
                          <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                        </div>
                        <div className="bg-amber-400 transition-all duration-1000 ease-out" style={{ width: `${belumPct}%` }}></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Flights Table */}
              <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
                <div className="border-b border-slate-100 p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                      <History className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">Riwayat Misi Terkini</h2>
                  </div>
                </div>

                {!recentFlights || recentFlights.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 bg-slate-50/50">
                    <img src="https://illustrations.popsy.co/amber/shipped.svg" alt="Empty" className="w-32 h-32 mb-4 opacity-50 grayscale" />
                    <p className="text-slate-500 font-semibold">Belum ada misi penerbangan terbaru.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Informasi Misi</th>
                          <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Model AI</th>
                          <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right">Deteksi</th>
                          <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right">Akurasi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {recentFlights.map((fl) => (
                          <tr key={fl.id} className="hover:bg-slate-50/80 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{fl.mission_name}</div>
                              <div className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-1.5">
                                <Clock3 className="w-3.5 h-3.5" />
                                {new Date(fl.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-widest">
                                {fl.scan_mode || '-'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="font-mono text-sm font-bold text-slate-700">
                                {formatNumber(fl.samples_count)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className={`font-black text-sm ${fl.accuracy >= 90 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {Number(fl.accuracy).toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-8">
              
              {/* Weather Card - Beautiful Image BG */}
              <div className="relative rounded-2xl shadow-md border border-slate-200 overflow-hidden bg-slate-900 group">
                <div className="absolute inset-0">
                  <img src="https://images.unsplash.com/photo-1501426026826-31c667bdf23d?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-700" alt="Weather Background" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/40"></div>
                </div>
                
                <div className="relative p-6 z-10">
                  <div className="flex items-center gap-2 mb-6 text-blue-300">
                    <CloudLightning className="w-5 h-5" />
                    <h2 className="text-lg font-bold">Kondisi Lapangan</h2>
                  </div>
                  
                  {cuaca ? (
                    <>
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <p className="text-6xl font-light text-white tracking-tighter">
                            {cuaca.temperature ?? '--'}<span className="text-4xl text-blue-300">°</span>
                          </p>
                          <p className="text-sm font-medium text-slate-300 mt-2 flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-blue-400" />
                            {(cuaca.desa || '')} {(cuaca.kabupaten_kota || '-')}
                          </p>
                        </div>
                        {cuaca.image && (
                          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
                            <img src={cuaca.image} alt="Cuaca" className="w-12 h-12 object-contain drop-shadow-lg" />
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 text-center border-t border-white/10 pt-5">
                        <div className="bg-black/20 backdrop-blur-sm rounded-xl py-3 border border-white/5">
                          <Wind className="w-4 h-4 text-blue-300 mx-auto mb-1.5" />
                          <p className="text-base font-bold text-white">{cuaca.wind_speed ?? '--'}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">km/h</p>
                        </div>
                        <div className="bg-black/20 backdrop-blur-sm rounded-xl py-3 border border-white/5">
                          <Droplets className="w-4 h-4 text-blue-300 mx-auto mb-1.5" />
                          <p className="text-base font-bold text-white">{cuaca.humidity ?? '--'}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Lembab %</p>
                        </div>
                        <div className="bg-black/20 backdrop-blur-sm rounded-xl py-3 border border-white/5">
                          <CloudRain className="w-4 h-4 text-blue-300 mx-auto mb-1.5" />
                          <p className="text-base font-bold text-white">{cuaca.rainfall ?? '--'}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Curah</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <Cloud className="w-10 h-10 text-slate-500 mb-3" />
                      <p className="text-sm font-semibold text-slate-400">Data cuaca tidak tersedia.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions / Shortcuts */}
              <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
                <div className="border-b border-slate-100 p-5 flex items-center gap-3 bg-slate-50/50">
                    <Rocket className="w-5 h-5 text-rose-500" />
                    <h2 className="text-lg font-bold text-slate-900">Akses Cepat</h2>
                </div>
                <div className="p-5 grid grid-cols-2 gap-4">
                  <a href="/gcs" className="bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all group">
                    <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 group-hover:text-blue-600 transition-transform"><PlaneTakeoffIcon size={20} /></div>
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Mulai GCS</p>
                  </a>
                  <a href="/lahan" className="bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all group">
                    <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 group-hover:text-emerald-600 transition-transform"><Map size={20} /></div>
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Pemetaan</p>
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

// Simple scan icon component
const ScanIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 7V5a2 2 0 0 1 2-2h2"></path>
    <path d="M17 3h2a2 2 0 0 1 2 2v2"></path>
    <path d="M21 17v2a2 2 0 0 1-2 2h-2"></path>
    <path d="M7 21H5a2 2 0 0 1-2-2v-2"></path>
    <rect x="7" y="7" width="10" height="10" rx="1"></rect>
  </svg>
);

export default AppDashboard;
