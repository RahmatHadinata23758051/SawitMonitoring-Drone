import React, { useState, useEffect } from 'react';
import { 
  Map, Grid, Plane, Crosshair, PlaneTakeoff, BrainCircuit, 
  Activity, History, Cloud, Wind, Droplets, CloudRain, 
  Trees, CheckCircle, Clock, Users, Rocket, FileText, Leaf, 
  Cpu, MapPin, ArrowRight, PlaneTakeoff as PlaneTakeoffIcon,
  HelpCircle, Clock3, ChevronRight, Zap, Info, BarChart3, CloudLightning
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
    <div className={`relative w-full bg-slate-50 min-h-screen text-slate-900 font-sans transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* Clean Hero Section */}
      <section className="bg-white border-b border-slate-200 pt-10 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-4 border border-blue-200">
              <Activity className="w-3.5 h-3.5" /> Sistem Terintegrasi AI Aktif
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-3">
              Pusat Kendali Cerdas
            </h1>
            <p className="text-base text-slate-500 leading-relaxed">
              Monitoring perkebunan kelapa sawit presisi tinggi. Gabungan telemetri drone dan analisis citra udara menggunakan Artificial Intelligence.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <a href="/gcs" className="inline-flex items-center gap-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
              <PlaneTakeoff className="w-4 h-4 text-slate-500" /> Buka GCS
            </a>
            <a href="/laporan" className="inline-flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
              <BarChart3 className="w-4 h-4" /> Laporan AI
            </a>
          </div>
        </div>
      </section>

      {/* Primary Stats Row */}
      <section className="-mt-8 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
              <Map className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Lahan</p>
              <p className="text-xl font-bold text-slate-900">{formatNumber(countLahan)}</p>
            </div>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
              <Trees className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Pohon Master</p>
              <p className="text-xl font-bold text-slate-900">{formatNumber(countPohon)}</p>
            </div>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Drone Aktif</p>
              <p className="text-xl font-bold text-slate-900">{formatNumber(countPerangkat)}</p>
            </div>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Akurasi AI</p>
              <p className="text-xl font-bold text-slate-900">{avgAccuracy > 0 ? `${Number(avgAccuracy).toFixed(1)}%` : '--'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid Area */}
      <section className="py-8 relative z-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            
            {/* Left Column (Wider) */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Scan Summary Container */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Ringkasan Pemindaian AI</h2>
                    <p className="text-sm text-slate-500">Akumulasi hasil deteksi dari seluruh riwayat penerbangan</p>
                  </div>
                  <a href="/laporan/log-penerbangan" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    Lihat detail <ArrowRight className="w-4 h-4" />
                  </a>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
                    <p className="text-sm font-medium text-slate-500 mb-1">Total Sampel</p>
                    <p className="text-3xl font-bold text-slate-900">{formatNumber(totalSampel)}</p>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-5 border border-emerald-200">
                    <p className="text-sm font-medium text-emerald-700 mb-1">Buah Matang</p>
                    <p className="text-3xl font-bold text-emerald-800">{formatNumber(totalMatang)}</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-5 border border-amber-200">
                    <p className="text-sm font-medium text-amber-700 mb-1">Buah Mentah</p>
                    <p className="text-3xl font-bold text-amber-800">{formatNumber(totalBelum)}</p>
                  </div>
                </div>

                {/* Clean Progress Bar */}
                {totalSampel > 0 && (
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">
                      <span>Rasio Kematangan</span>
                      <span className="text-emerald-600">{matangPct}% Matang</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                      <div className="bg-emerald-500" style={{ width: `${matangPct}%` }}></div>
                      <div className="bg-amber-400" style={{ width: `${belumPct}%` }}></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Flights Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                  <h2 className="text-lg font-semibold text-slate-900">Penerbangan Terbaru</h2>
                  <p className="text-sm text-slate-500">Log sinkronisasi data dari GCS</p>
                </div>

                {!recentFlights || recentFlights.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 bg-slate-50/50">
                    <History className="w-8 h-8 text-slate-300 mb-3" />
                    <p className="text-sm text-slate-500 font-medium">Belum ada aktivitas penerbangan tersimpan.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-3 font-semibold">Nama Misi</th>
                          <th className="px-6 py-3 font-semibold">Tipe AI</th>
                          <th className="px-6 py-3 font-semibold text-right">Objek (Sampel)</th>
                          <th className="px-6 py-3 font-semibold text-right">Akurasi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {recentFlights.map((fl) => (
                          <tr key={fl.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-medium text-slate-900">{fl.mission_name}</div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                {new Date(fl.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                                {fl.scan_mode || '-'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="font-mono text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                                {formatNumber(fl.samples_count)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className={`font-semibold ${fl.accuracy >= 90 ? 'text-emerald-600' : 'text-amber-600'}`}>
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

            {/* Right Column (Narrower) */}
            <div className="flex flex-col gap-6">
              
              {/* Clean Weather Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CloudLightning className="w-5 h-5 text-slate-400" />
                  <h2 className="text-lg font-semibold text-slate-900">Kondisi Lapangan</h2>
                </div>
                
                {cuaca ? (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-5xl font-light text-slate-900 tracking-tighter">
                          {cuaca.temperature ?? '--'}<span className="text-3xl text-slate-400">°</span>
                        </p>
                        <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          {(cuaca.desa || '')} {(cuaca.kabupaten_kota || '-')}
                        </p>
                      </div>
                      {cuaca.image && (
                        <img src={cuaca.image} alt="Cuaca" className="w-16 h-16 object-contain opacity-80" />
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-center pt-4 border-t border-slate-100">
                      <div className="bg-slate-50 rounded-lg py-2 border border-slate-100">
                        <Wind className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                        <p className="text-sm font-semibold text-slate-700">{cuaca.wind_speed ?? '--'}</p>
                        <p className="text-[10px] font-medium text-slate-500 uppercase">km/h</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg py-2 border border-slate-100">
                        <Droplets className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                        <p className="text-sm font-semibold text-slate-700">{cuaca.humidity ?? '--'}</p>
                        <p className="text-[10px] font-medium text-slate-500 uppercase">Lembab %</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg py-2 border border-slate-100">
                        <CloudRain className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                        <p className="text-sm font-semibold text-slate-700">{cuaca.rainfall ?? '--'}</p>
                        <p className="text-[10px] font-medium text-slate-500 uppercase">Curah</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Cloud className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-sm text-slate-500">Data cuaca tidak tersedia.</p>
                  </div>
                )}
              </div>

              {/* Data Master Summary List */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Grid className="w-5 h-5 text-slate-400" />
                  <h2 className="text-lg font-semibold text-slate-900">Rekap Data</h2>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-3">
                      <Trees className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-medium text-slate-700">Total Kebun</span>
                    </div>
                    <span className="font-semibold text-slate-900">{formatNumber(countKebun)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-3">
                      <Crosshair className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-medium text-slate-700">Misi GCS</span>
                    </div>
                    <span className="font-semibold text-slate-900">{formatNumber(countMissions)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-medium text-slate-700">Total Pengguna</span>
                    </div>
                    <span className="font-semibold text-slate-900">{countUser}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default AppDashboard;
