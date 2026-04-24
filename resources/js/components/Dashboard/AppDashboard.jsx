import React from 'react';
import { 
  Map, Grid, Plane, Crosshair, PlaneTakeoff, BrainCircuit, 
  Activity, History, Cloud, Wind, Droplets, CloudRain, 
  Trees, CheckCircle, Clock, Users, Rocket, FileText, Leaf, 
  Cpu, MapPin, ArrowRight, PlaneTakeoff as PlaneTakeoffIcon,
  HelpCircle, Clock3
} from 'lucide-react';

const AppDashboard = ({
  countLahan, countKebun, countPerangkat, countUser,
  countPohon, countPohonMatang, countPohonBelumMatang,
  lahan, cuaca,
  countMissions, countFlightLogs, totalSampel, totalMatang, totalBelum,
  avgAccuracy, recentFlights
}) => {
  // Helpers
  const formatNumber = (num) => new Intl.NumberFormat('id-ID').format(num || 0);
  const matangPct = totalSampel > 0 ? ((totalMatang / totalSampel) * 100).toFixed(1) : 0;
  const belumPct = totalSampel > 0 ? (100 - matangPct).toFixed(1) : 0;

  return (
    <div className="relative w-full bg-white overflow-hidden text-slate-800 font-sans">
      
      {/* Hero Section */}
      <section className="relative min-h-[55vh] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCx5wuGXtnP9piFc99hTY8V_-NYijS_aFz6W5dxR1oc8DCInJN695GTSYWWSbM7cHZ4JVDeweooE12gu7bQ-A961oXddYQqZqLURIEKW9ChW2QMn4o-XCTLBdNt2ph_Vw4MDkYKiWger5ETVPN_Rtf3KslWkLNuqkIC9bAOyv0eRpddV37OOHNxqELrjdaMY_CL8rMd9kQXsB5Y9AxzCLpp8u5cfrxZq8QrlThnJx7QCc38VkTEIMQ8xU6mtskq_TE_l-CVhses5jI" 
            alt="Hero Background" 
            className="w-full h-full object-cover filter brightness-[0.85]" 
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-transparent z-10"></div>
        <div className="relative z-20 max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold tracking-wider uppercase backdrop-blur-md border border-blue-500/30 mb-6">
              <Activity className="w-3.5 h-3.5" /> IPB University
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5 tracking-tight">
              Pusat Kendali <span className="text-blue-400">Digital</span>
            </h1>
            <p className="text-lg text-slate-300 font-light leading-relaxed mb-8 max-w-xl">
              Sistem cerdas pemantauan perkebunan kelapa sawit terintegrasi. Dilengkapi dengan telemetri drone langsung dan analisis kematangan AI.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="/gcs" className="px-7 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 hover:-translate-y-0.5 transform">
                <Plane className="w-4 h-4" /> Buka GCS
              </a>
              <a href="/laporan/log-penerbangan" className="px-7 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md text-sm font-bold rounded-xl transition-all flex items-center gap-2 hover:-translate-y-0.5 transform">
                <History className="w-4 h-4" /> Log Penerbangan
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* STATS OVERVIEW SECTION */}
      <section className="bg-white border-b border-slate-100 py-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            
            {/* Lahan */}
            <a href="/lahan" className="group bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-2xl p-5 flex flex-col items-center text-center transition-all hover:shadow-md">
              <div className="w-11 h-11 bg-blue-100 group-hover:bg-blue-600 text-blue-600 group-hover:text-white rounded-xl flex items-center justify-center transition-all mb-3">
                <Map className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-slate-800">{countLahan}</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Lahan</p>
            </a>

            {/* Kebun */}
            <a href="/kebun" className="group bg-slate-50 hover:bg-green-50 border border-slate-200 hover:border-green-300 rounded-2xl p-5 flex flex-col items-center text-center transition-all hover:shadow-md">
              <div className="w-11 h-11 bg-green-100 group-hover:bg-green-600 text-green-600 group-hover:text-white rounded-xl flex items-center justify-center transition-all mb-3">
                <Grid className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-slate-800">{countKebun}</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Kebun</p>
            </a>

            {/* Perangkat */}
            <a href="/perangkat" className="group bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 flex flex-col items-center text-center transition-all hover:shadow-md">
              <div className="w-11 h-11 bg-indigo-100 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white rounded-xl flex items-center justify-center transition-all mb-3">
                <Plane className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-slate-800">{countPerangkat}</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Drone</p>
            </a>

            {/* Misi GCS */}
            <a href="/gcs" className="group bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-300 rounded-2xl p-5 flex flex-col items-center text-center transition-all hover:shadow-md">
              <div className="w-11 h-11 bg-cyan-100 group-hover:bg-cyan-600 text-cyan-600 group-hover:text-white rounded-xl flex items-center justify-center transition-all mb-3">
                <Crosshair className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-slate-800">{countMissions}</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Misi GCS</p>
            </a>

            {/* Flight Logs */}
            <a href="/laporan/log-penerbangan" className="group bg-slate-50 hover:bg-violet-50 border border-slate-200 hover:border-violet-300 rounded-2xl p-5 flex flex-col items-center text-center transition-all hover:shadow-md">
              <div className="w-11 h-11 bg-violet-100 group-hover:bg-violet-600 text-violet-600 group-hover:text-white rounded-xl flex items-center justify-center transition-all mb-3">
                <PlaneTakeoff className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-slate-800">{countFlightLogs}</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Penerbangan</p>
            </a>

            {/* Avg Akurasi AI */}
            <div className="group bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col items-center text-center hover:shadow-sm transition-all">
              <div className="w-11 h-11 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-3">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-slate-800">
                {avgAccuracy > 0 ? `${Number(avgAccuracy).toFixed(1)}%` : '--'}
              </p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Avg. Akurasi AI</p>
            </div>

          </div>
        </div>
      </section>

      {/* MAIN DASHBOARD CONTENT */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* KOLOM KIRI: Statistik Penerbangan + Terbaru */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Flight Scan Summary */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-500" /> Ringkasan Pemindaian
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">Akumulasi hasil scan dari semua penerbangan</p>
                    <div className="mt-3">
                      {recentFlights && recentFlights.length > 0 ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-[10px] font-bold text-slate-600">
                          <Clock3 className="w-3 h-3 text-blue-500" />
                          Update terakhir: {new Date(recentFlights[0].created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-[10px] font-bold text-slate-500">
                          <Clock3 className="w-3 h-3 text-slate-400" />
                          Belum ada update scan
                        </span>
                      )}
                    </div>
                  </div>
                  <a href="/laporan/log-penerbangan" className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors">
                    Lihat semua <ArrowRight className="w-3 h-3" />
                  </a>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                    <p className="text-3xl font-black text-slate-800">{formatNumber(totalSampel)}</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Total Sampel</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10"><Leaf className="w-12 h-12 text-green-700" /></div>
                    <p className="text-3xl font-black text-green-700 relative z-10">{formatNumber(totalMatang)}</p>
                    <p className="text-xs text-green-600 font-bold mt-1 relative z-10">Matang</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10"><Leaf className="w-12 h-12 text-amber-700" /></div>
                    <p className="text-3xl font-black text-amber-700 relative z-10">{formatNumber(totalBelum)}</p>
                    <p className="text-xs text-amber-600 font-bold mt-1 relative z-10">Belum Matang</p>
                  </div>
                </div>

                {/* Progress Bar */}
                {totalSampel > 0 ? (
                  <div className="mt-6">
                    <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1.5">
                      <span>TINGKAT KEMATANGAN</span>
                      <span className="text-green-600">{matangPct}% MATANG</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
                      <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${matangPct}%` }}></div>
                      <div className="h-full bg-amber-400 transition-all duration-1000" style={{ width: `${belumPct}%` }}></div>
                    </div>
                    <div className="flex gap-4 mt-2 font-mono text-[10px] font-bold">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <span className="w-2.5 h-2.5 bg-green-500 rounded-full inline-block"></span>MATANG {matangPct}%
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <span className="w-2.5 h-2.5 bg-amber-400 rounded-full inline-block"></span>BELUM {belumPct}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 flex flex-col items-center justify-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <PlaneTakeoffIcon className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-sm text-slate-400 font-medium">Belum ada data penerbangan.</p>
                    <a href="/gcs" className="mt-2 text-xs text-blue-600 font-bold hover:underline">Mulai misi dari GCS &rarr;</a>
                  </div>
                )}
              </div>

              {/* Recent Flights */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <History className="w-4 h-4 text-blue-500" /> Penerbangan Terbaru
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">5 log terakhir dari database</p>
                  </div>
                </div>

                {!recentFlights || recentFlights.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <History className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-sm text-slate-400 font-medium">Belum ada log penerbangan tersimpan.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="text-left text-xs text-slate-400 font-bold pb-3 pr-4 uppercase tracking-wider">Nama Misi</th>
                          <th className="text-left text-xs text-slate-400 font-bold pb-3 pr-4 uppercase tracking-wider">Mode</th>
                          <th className="text-right text-xs text-slate-400 font-bold pb-3 pr-4 uppercase tracking-wider">Sampel</th>
                          <th className="text-right text-xs text-slate-400 font-bold pb-3 uppercase tracking-wider">Akurasi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {recentFlights.map((fl) => (
                          <tr key={fl.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="py-3 pr-4">
                              <p className="font-bold text-slate-700 truncate max-w-[160px] group-hover:text-blue-600 transition-colors">{fl.mission_name}</p>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                {new Date(fl.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                              </p>
                            </td>
                            <td className="py-3 pr-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black tracking-wider ${fl.scan_mode === 'qlv' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                                {(fl.scan_mode || '-').toUpperCase()}
                              </span>
                            </td>
                            <td className="py-3 pr-4 text-right font-black text-slate-700">
                              {formatNumber(fl.samples_count)}
                            </td>
                            <td className="py-3 text-right">
                              <span className={`font-black ${fl.accuracy >= 90 ? 'text-green-600' : 'text-amber-600'}`}>
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

            {/* KOLOM KANAN: Cuaca + Data Master */}
            <div className="flex flex-col gap-6">
              
              {/* Widget Cuaca */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-blue-500" /> Cuaca Terkini
                </h2>
                {cuaca ? (
                  <>
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <p className="text-4xl font-black text-slate-800 tracking-tighter">
                          {cuaca.temperature ?? '--'}
                          <span className="text-xl font-medium text-slate-400 ml-1">°C</span>
                        </p>
                        <p className="text-[11px] font-bold text-slate-500 mt-2 flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-rose-500" />
                          {(cuaca.desa || '')} {cuaca.desa && cuaca.kabupaten_kota ? ', ' : ''} {(cuaca.kabupaten_kota || '-')}
                        </p>
                        <p className="text-[10px] font-medium text-slate-400 mt-1 capitalize">{cuaca.description || ''}</p>
                      </div>
                      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100">
                        {cuaca.image ? (
                          <img src={cuaca.image} alt="Cuaca" className="w-10 h-10 object-contain drop-shadow-sm" />
                        ) : (
                          <HelpCircle className="w-8 h-8 text-slate-300" />
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center border-t border-slate-100 pt-4">
                      <div className="bg-slate-50 p-2 rounded-xl">
                        <Wind className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                        <p className="text-sm font-black text-slate-700">{cuaca.wind_speed ?? '--'}</p>
                        <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">km/h</p>
                      </div>
                      <div className="bg-blue-50 p-2 rounded-xl border border-blue-100">
                        <Droplets className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                        <p className="text-sm font-black text-blue-700">{cuaca.humidity ?? '--'}</p>
                        <p className="text-[9px] font-bold text-blue-400 mt-0.5 uppercase tracking-wider">Kelembaban %</p>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl">
                        <CloudRain className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                        <p className="text-sm font-black text-slate-700">{cuaca.rainfall ?? '--'}</p>
                        <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">mm Curah</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <Cloud className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-sm text-slate-400 font-medium text-center">Data cuaca belum disetup.</p>
                    <a href="/cuaca" className="mt-2 text-xs text-blue-600 font-bold hover:underline">Setup Cuaca &rarr;</a>
                  </div>
                )}
              </div>

              {/* Data Master Summary */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
                  <Trees className="w-4 h-4 text-emerald-500" /> Inventaris & Rekap
                </h2>
                <p className="text-[10px] text-slate-400 mb-5 leading-relaxed">
                  Inventaris pohon master dan hasil scan AI menggunakan sumber data terpisah yang sudah diselaraskan.
                </p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between py-2 border-b border-slate-50 group hover:bg-slate-50 px-2 rounded transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-slate-100 rounded flex items-center justify-center text-slate-500">
                        <Trees className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-xs font-bold text-slate-600">Total Pohon Master</p>
                    </div>
                    <p className="font-black text-slate-800 font-mono">{formatNumber(countPohon)}</p>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-50 group hover:bg-green-50 px-2 rounded transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-green-100 rounded flex items-center justify-center text-green-600">
                        <CheckCircle className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-xs font-bold text-slate-600">Hasil Scan Matang</p>
                    </div>
                    <p className="font-black text-green-600 font-mono">{formatNumber(countPohonMatang)}</p>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-50 group hover:bg-amber-50 px-2 rounded transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-amber-100 rounded flex items-center justify-center text-amber-600">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-xs font-bold text-slate-600">Scan Belum Matang</p>
                    </div>
                    <p className="font-black text-amber-600 font-mono">{formatNumber(countPohonBelumMatang)}</p>
                  </div>
                  <div className="flex items-center justify-between py-2 group hover:bg-indigo-50 px-2 rounded transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-indigo-100 rounded flex items-center justify-center text-indigo-600">
                        <Users className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-xs font-bold text-slate-600">Total User</p>
                    </div>
                    <p className="font-black text-slate-800 font-mono">{countUser}</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-800 rounded-2xl p-6 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                  <Rocket className="w-24 h-24" />
                </div>
                <h2 className="text-base font-black mb-1 relative z-10">Aksi Cepat</h2>
                <p className="text-blue-200 text-[10px] mb-5 font-medium relative z-10">Navigasi langsung ke fitur utama</p>
                <div className="grid grid-cols-2 gap-3 relative z-10">
                  <a href="/gcs" className="bg-white/10 hover:bg-white/20 border border-white/5 rounded-xl p-3 text-center transition-all hover:scale-105 active:scale-95 group">
                    <Plane className="w-5 h-5 mx-auto mb-2 text-blue-200 group-hover:text-white transition-colors" />
                    <p className="text-[10px] font-bold tracking-wider uppercase">Buka GCS</p>
                  </a>
                  <a href="/laporan/log-penerbangan" className="bg-white/10 hover:bg-white/20 border border-white/5 rounded-xl p-3 text-center transition-all hover:scale-105 active:scale-95 group">
                    <History className="w-5 h-5 mx-auto mb-2 text-blue-200 group-hover:text-white transition-colors" />
                    <p className="text-[10px] font-bold tracking-wider uppercase">Log Terbang</p>
                  </a>
                  <a href="/kebun" className="bg-white/10 hover:bg-white/20 border border-white/5 rounded-xl p-3 text-center transition-all hover:scale-105 active:scale-95 group">
                    <Leaf className="w-5 h-5 mx-auto mb-2 text-blue-200 group-hover:text-white transition-colors" />
                    <p className="text-[10px] font-bold tracking-wider uppercase">Data Kebun</p>
                  </a>
                  <a href="/laporan" className="bg-white/10 hover:bg-white/20 border border-white/5 rounded-xl p-3 text-center transition-all hover:scale-105 active:scale-95 group">
                    <BrainCircuit className="w-5 h-5 mx-auto mb-2 text-blue-200 group-hover:text-white transition-colors" />
                    <p className="text-[10px] font-bold tracking-wider uppercase">Laporan AI</p>
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* MODUL PINTAR SECTION */}
      <section className="py-16 bg-white border-t border-slate-100 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Modul Pintar</h2>
            <div className="w-16 h-1.5 bg-blue-500 mx-auto rounded-full mt-4 mb-4"></div>
            <p className="text-slate-500 text-sm md:text-base leading-relaxed">
              Manfaatkan arsitektur sistem cerdas untuk memetakan, menganalisis, dan memonitor kondisi kebun secara komprehensif.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-xl hover:-translate-y-1 hover:border-blue-200 transition-all duration-300 group">
              <div className="w-14 h-14 bg-white text-blue-600 rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <Crosshair className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Ground Control Station</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">Kendali penuh operasi drone secara real-time. Pantau rute, telemetri, GPS, dan status perangkat langsung dari GCS.</p>
              <a href="/gcs" className="text-blue-600 text-sm font-black flex items-center gap-1.5 hover:gap-2.5 transition-all">
                Luncurkan Aplikasi <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
            
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-xl hover:-translate-y-1 hover:border-green-200 transition-all duration-300 group">
              <div className="w-14 h-14 bg-white text-green-600 rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Analisis Kematangan AI</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">Laporan prediksi algoritma AI untuk membedakan TBS matang dan mentah berdasarkan pemindaian citra udara kecepatan tinggi.</p>
              <a href="/laporan" className="text-green-600 text-sm font-black flex items-center gap-1.5 hover:gap-2.5 transition-all">
                Lihat Prediksi <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
            
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-xl hover:-translate-y-1 hover:border-orange-200 transition-all duration-300 group">
              <div className="w-14 h-14 bg-white text-orange-600 rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Manajemen Lahan</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">Kelola titik poligon perkebunan, hitung luas aktual, dan integrasikan dengan profil pohon sawit dari waktu ke waktu.</p>
              <a href="/lahan" className="text-orange-600 text-sm font-black flex items-center gap-1.5 hover:gap-2.5 transition-all">
                Atur Data Master <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default AppDashboard;
