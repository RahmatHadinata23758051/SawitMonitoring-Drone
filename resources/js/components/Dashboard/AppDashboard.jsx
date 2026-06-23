import React, { useState, useEffect } from 'react';
import {
  Map, Plane, Trees, BrainCircuit, Cloud, Wind, Droplets,
  CloudRain, CheckCircle, Clock, MapPin, ArrowRight, PlaneTakeoff,
  Clock3, Rocket, Crosshair, History, BarChart3, Users
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Design tokens — selaras dengan skema warna global aplikasi:
//   • Page bg   : gray-100 (#f3f4f6)   → sama dengan app.blade.php
//   • Card bg   : white (#ffffff)       → sama dengan semua halaman lain
//   • Text      : slate-900 (#0f172a)   → sama dengan body & navbar
//   • Border    : slate-200 (#e2e8f0)   → sama dengan header & footer
//   • Accent    : blue-600 (#2563eb)    → sama dengan navbar active & CTA
//   • Secondary : green-700 (#15803d)   → selaras dengan sidebar brand green-800
//   • Muted     : slate-500 (#64748b)   → sama dengan app.css body color
// ---------------------------------------------------------------------------
const tk = {
  // Backgrounds
  pageBg:     '#f3f4f6',   // gray-100 — sama persis dengan app.blade main-layout-container
  card:       '#ffffff',   // white — semua card halaman lain
  cardHover:  '#f8fafc',   // slate-50 — hover state ringan

  // Text
  textPrimary:   '#0f172a',  // slate-900
  textSecondary: '#475569',  // slate-600
  textMuted:     '#94a3b8',  // slate-400

  // Borders & dividers
  border:    '#e2e8f0',   // slate-200 — sama dengan header/footer border
  borderLight: '#f1f5f9', // slate-100 — divider halus

  // Accent — Blue (selaras dengan navbar active state bg-blue-600)
  accentBlue:       '#2563eb',  // blue-600
  accentBlueLight:  '#eff6ff',  // blue-50 — background subtle
  accentBlueMid:    '#dbeafe',  // blue-100
  accentBlueMuted:  '#93c5fd',  // blue-300
  accentBlueDark:   '#1d4ed8',  // blue-700

  // Secondary — Green (selaras dengan sidebar bg-green-800 & scrollbar #10b981)
  accentGreen:      '#15803d',  // green-700
  accentGreenLight: '#f0fdf4',  // green-50
  accentGreenMid:   '#dcfce7',  // green-100
  accentGreenMuted: '#86efac',  // green-300

  // Amber — untuk status/warning saja (label kematangan)
  amber:       '#d97706',  // amber-600
  amberLight:  '#fffbeb',  // amber-50
  amberMid:    '#fef3c7',  // amber-100
};

const fontDisplay = "'Manrope', sans-serif";
const fontMono    = "'JetBrains Mono', monospace";  // sesuai app.css code override
const fontBody    = "'Inter', sans-serif";

const AppDashboard = ({
  countLahan, countKebun, countPerangkat, countUser,
  countPohon, countPohonMatang, countPohonBelumMatang,
  lahan, cuaca,
  countMissions, countFlightLogs, totalSampel, totalMatang, totalBelum,
  avgAccuracy, recentFlights
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const fmt = (n) => new Intl.NumberFormat('id-ID').format(n || 0);
  const matangPct = totalSampel > 0 ? (totalMatang / totalSampel) * 100 : 0;

  // SVG ripeness arc
  const dialR = 72;
  const circ  = 2 * Math.PI * dialR;
  const arc   = mounted ? circ * (matangPct / 100) : 0;

  return (
    <div
      className={`min-h-screen transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: tk.pageBg, color: tk.textPrimary, fontFamily: fontBody }}
    >
      {/* ── Fonts fallback (sudah ada di app.blade tapi sebagai cadangan) ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
      `}</style>

      {/* ============================================================
          HERO SECTION
          Warna: white card di atas gray-100, accent blue sesuai navbar
          ============================================================ */}
      <section
        className="border-b"
        style={{ background: '#ffffff', borderColor: tk.border }}
      >
        <div className="max-w-7xl mx-auto px-6 py-10 lg:py-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">

          {/* Left — headline & CTA */}
          <div className="max-w-2xl">
            {/* breadcrumb / system label */}
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-2 w-2 relative">
                <span
                  className="absolute inline-flex h-full w-full rounded-full animate-ping opacity-60"
                  style={{ background: tk.accentGreen }}
                />
                <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: tk.accentGreen }} />
              </span>
              <span
                className="text-[11px] font-semibold tracking-[.12em] uppercase"
                style={{ color: tk.accentGreen, fontFamily: fontMono }}
              >
                Sistem Aktif
              </span>
              <span className="text-[11px]" style={{ color: tk.textMuted }}>·</span>
              <span className="text-[11px]" style={{ color: tk.textMuted, fontFamily: fontMono }}>
                IPB University — Drone CPS
              </span>
            </div>

            <h1
              className="text-3xl lg:text-[2.25rem] font-extrabold leading-tight mb-3"
              style={{ fontFamily: fontDisplay, color: tk.textPrimary, letterSpacing: '-0.03em' }}
            >
              Monitoring Kebun Sawit<br />
              <span style={{ color: tk.accentBlue }}>Berbasis Drone & AI</span>
            </h1>

            <p className="text-[15px] leading-relaxed mb-7 max-w-lg" style={{ color: tk.textSecondary }}>
              Platform GCS untuk pemetaan otomatis kebun kelapa sawit, telemetri
              drone real-time, dan deteksi kematangan buah menggunakan computer vision.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/gcs"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 shadow-md"
                style={{ background: tk.accentBlue, boxShadow: `0 4px 14px ${tk.accentBlue}40` }}
              >
                <PlaneTakeoff className="w-4 h-4" />
                Luncurkan GCS
              </a>
              <a
                href="/laporan"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:bg-slate-50 border"
                style={{ color: tk.textSecondary, borderColor: tk.border, background: '#ffffff' }}
              >
                Laporan Analisis
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Right — status telemetry panel */}
          <div
            className="w-full lg:w-[264px] rounded-2xl p-5 flex-none"
            style={{ background: tk.accentBlueLight, border: `1px solid ${tk.accentBlueMid}` }}
          >
            <div
              className="flex items-center justify-between pb-3 mb-4"
              style={{ borderBottom: `1px solid ${tk.accentBlueMid}` }}
            >
              <span className="text-sm font-bold" style={{ color: tk.accentBlueDark, fontFamily: fontDisplay }}>
                Status Sistem
              </span>
              <span
                className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: tk.accentGreenMid, color: tk.accentGreen, fontFamily: fontMono }}
              >
                ONLINE
              </span>
            </div>
            <div className="space-y-3" style={{ fontFamily: fontMono }}>
              <StatusRow label="Drone Terdaftar"  value={`${fmt(countPerangkat)} unit`}   color={tk.accentBlue} />
              <StatusRow label="Total Lahan"       value={`${fmt(countLahan)} area`}        color={tk.accentBlue} />
              <StatusRow label="Total Misi"         value={`${fmt(countMissions)} misi`}    color={tk.accentBlue} />
              <StatusRow label="Akurasi AI"
                value={avgAccuracy > 0 ? `${Number(avgAccuracy).toFixed(1)}%` : '—'}
                color={tk.amber}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          STAT STRIP
          White cards dengan blue/green accent icons
          ============================================================ */}
      <section className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Map}          label="Total Lahan"   value={fmt(countLahan)}      unit="area"  accent={tk.accentBlue} />
          <StatCard icon={Trees}        label="Total Pohon"   value={fmt(countPohon)}      unit="pohon" accent={tk.accentGreen} />
          <StatCard icon={Plane}        label="Drone Aktif"   value={fmt(countPerangkat)}  unit="unit"  accent={tk.accentBlue} />
          <StatCard icon={BrainCircuit} label="Akurasi Rata"
            value={avgAccuracy > 0 ? `${Number(avgAccuracy).toFixed(1)}%` : '—'}
            accent={tk.amber}
          />
        </div>
      </section>

      {/* ============================================================
          MAIN CONTENT GRID
          ============================================================ */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left column (2/3) ── */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Ripeness Analytics Panel */}
            <Panel
              icon={Crosshair}
              title="Analisis Kematangan Buah (AI)"
              subtitle="Akumulasi hasil deteksi dari seluruh penerbangan"
              action={{ href: '/laporan/log-penerbangan', label: 'Log Penerbangan' }}
            >
              <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-8 items-center">

                {/* Gauge */}
                <div className="relative w-[160px] h-[160px] mx-auto md:mx-0 flex-none">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    {/* Track */}
                    <circle cx="100" cy="100" r={dialR}
                      fill="none" stroke={tk.borderLight} strokeWidth="14" />
                    {/* Arc */}
                    <circle cx="100" cy="100" r={dialR}
                      fill="none" stroke={tk.amber} strokeWidth="14"
                      strokeLinecap="round"
                      strokeDasharray={`${arc} ${circ}`}
                      transform="rotate(-90 100 100)"
                      style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(.16,.8,.3,1)' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[26px] font-extrabold leading-none"
                      style={{ fontFamily: fontDisplay, color: tk.textPrimary }}>
                      {matangPct.toFixed(0)}%
                    </span>
                    <span className="text-[9px] tracking-[.14em] uppercase mt-1 font-semibold"
                      style={{ fontFamily: fontMono, color: tk.amber }}>
                      Matang
                    </span>
                  </div>
                </div>

                {/* Metric tiles */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <MetricTile label="Total Sampel"  value={fmt(totalSampel)}  />
                  <MetricTile label="Buah Matang"   value={fmt(totalMatang)}  accent={tk.amber}        icon={CheckCircle} />
                  <MetricTile label="Buah Mentah"   value={fmt(totalBelum)}   accent={tk.accentGreen}  icon={Clock} />
                </div>
              </div>
            </Panel>

            {/* Recent Flights */}
            <Panel icon={History} title="Riwayat Misi Terkini">
              {!recentFlights || recentFlights.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12" style={{ color: tk.textMuted }}>
                  <Plane className="w-8 h-8 mb-3 opacity-30" />
                  <p className="text-sm font-medium">Belum ada misi penerbangan.</p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-6">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${tk.border}` }}>
                        <Th className="pl-6">Informasi Misi</Th>
                        <Th>Model AI</Th>
                        <Th align="right">Deteksi</Th>
                        <Th align="right" className="pr-6">Akurasi</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentFlights.map((fl) => (
                        <tr key={fl.id} className="hover:bg-slate-50 transition-colors"
                          style={{ borderBottom: `1px solid ${tk.borderLight}` }}>
                          <td className="pl-6 py-3.5">
                            <div className="font-semibold text-[13px]" style={{ color: tk.textPrimary }}>
                              {fl.mission_name}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[11px]"
                              style={{ fontFamily: fontMono, color: tk.textMuted }}>
                              <Clock3 className="w-3 h-3" />
                              {new Date(fl.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                            </div>
                          </td>
                          <td className="py-3.5">
                            <span
                              className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-full"
                              style={{
                                fontFamily: fontMono,
                                background: tk.accentBlueLight,
                                color: tk.accentBlue,
                                border: `1px solid ${tk.accentBlueMid}`,
                              }}
                            >
                              {(fl.scan_mode || '-').toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3.5 text-right font-semibold text-[13px]"
                            style={{ fontFamily: fontMono, color: tk.textPrimary }}>
                            {fmt(fl.samples_count)}
                          </td>
                          <td className="pr-6 py-3.5 text-right font-bold text-[13px]"
                            style={{ fontFamily: fontMono, color: tk.accentGreen }}>
                            {Number(fl.accuracy).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Panel>
          </div>

          {/* ── Right column (1/3) ── */}
          <div className="flex flex-col gap-6">

            {/* Weather Card */}
            <div
              className="rounded-2xl p-6"
              style={{ background: tk.card, border: `1px solid ${tk.border}` }}
            >
              <div className="flex items-center gap-2 mb-5">
                <Cloud className="w-4 h-4" style={{ color: tk.accentBlue }} />
                <h2 className="text-[11px] tracking-[.12em] uppercase font-bold"
                  style={{ fontFamily: fontMono, color: tk.textSecondary }}>
                  Cuaca Kebun
                </h2>
              </div>

              {cuaca ? (
                <>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-[42px] font-extrabold leading-none"
                      style={{ fontFamily: fontDisplay, color: tk.textPrimary }}>
                      {cuaca.temperature ?? '--'}
                    </span>
                    <span className="text-lg font-medium" style={{ color: tk.textMuted }}>°C</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm mb-6" style={{ color: tk.textSecondary }}>
                    <MapPin className="w-3.5 h-3.5" style={{ color: tk.accentBlue }} />
                    {(cuaca.desa || '')} {(cuaca.kabupaten_kota || '-')}
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-4"
                    style={{ borderTop: `1px solid ${tk.border}` }}>
                    <WeatherCell icon={Wind}      value={cuaca.wind_speed} unit="km/h"  />
                    <WeatherCell icon={Droplets}  value={cuaca.humidity}   unit="lembab" />
                    <WeatherCell icon={CloudRain} value={cuaca.rainfall}   unit="curah"  />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center text-center py-8" style={{ color: tk.textMuted }}>
                  <Cloud className="w-7 h-7 mb-2 opacity-30" />
                  <p className="text-sm">Data cuaca tidak tersedia.</p>
                </div>
              )}
            </div>

            {/* Inventory Summary */}
            <Panel icon={BarChart3} title="Ringkasan Inventaris">
              <div className="space-y-3">
                <InventoryRow label="Lahan Terdaftar"  value={fmt(countLahan)}      icon={Map}    />
                <InventoryRow label="Kebun Aktif"       value={fmt(countKebun)}      icon={Trees}  />
                <InventoryRow label="Drone Terdaftar"   value={fmt(countPerangkat)}  icon={Plane}  />
                <InventoryRow label="Pengguna Sistem"   value={fmt(countUser)}       icon={Users}  />
              </div>
            </Panel>

            {/* Quick Actions */}
            <Panel icon={Rocket} title="Akses Cepat">
              <div className="grid grid-cols-2 gap-3">
                <QuickAction href="/gcs"    icon={PlaneTakeoff} label="Mulai GCS"   primary />
                <QuickAction href="/lahan"  icon={Map}          label="Peta Lahan"  />
              </div>
            </Panel>
          </div>
        </div>
      </section>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const StatusRow = ({ label, value, color }) => (
  <div className="flex justify-between text-xs">
    <span style={{ color: '#64748b' }}>{label}</span>
    <span className="font-bold" style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
  </div>
);

const StatCard = ({ icon: Icon, label, value, unit, accent }) => (
  <div
    className="rounded-2xl p-5 transition-shadow hover:shadow-md"
    style={{ background: '#ffffff', border: `1px solid #e2e8f0` }}
  >
    <div
      className="w-8 h-8 rounded-xl flex items-center justify-center mb-4"
      style={{ background: accent + '18' }}
    >
      <Icon className="w-4 h-4" style={{ color: accent }} />
    </div>
    <p className="text-[10.5px] tracking-[.08em] uppercase font-semibold mb-1"
      style={{ fontFamily: "'JetBrains Mono', monospace", color: '#94a3b8' }}>
      {label}
    </p>
    <p className="text-2xl font-extrabold" style={{ fontFamily: "'Manrope', sans-serif", color: '#0f172a' }}>
      {value}{unit && <span className="text-sm font-medium ml-1" style={{ color: '#94a3b8' }}>{unit}</span>}
    </p>
  </div>
);

const Panel = ({ icon: Icon, title, subtitle, action, children }) => (
  <div
    className="rounded-2xl p-6 transition-shadow hover:shadow-md"
    style={{ background: '#ffffff', border: `1px solid #e2e8f0` }}
  >
    <div className="flex items-start justify-between mb-5 gap-4">
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-none"
          style={{ background: '#eff6ff' }}
        >
          <Icon className="w-4 h-4" style={{ color: '#2563eb' }} />
        </div>
        <div>
          <h2 className="text-[13px] font-bold" style={{ fontFamily: "'Manrope', sans-serif", color: '#0f172a' }}>
            {title}
          </h2>
          {subtitle && <p className="text-[12px] mt-0.5" style={{ color: '#94a3b8' }}>{subtitle}</p>}
        </div>
      </div>
      {action && (
        <a
          href={action.href}
          className="text-[12px] font-bold flex items-center gap-1 flex-none transition-colors hover:opacity-70"
          style={{ color: '#2563eb' }}
        >
          {action.label} <ArrowRight className="w-3 h-3" />
        </a>
      )}
    </div>
    {children}
  </div>
);

const MetricTile = ({ label, value, accent, icon: Icon }) => (
  <div
    className="rounded-xl p-4"
    style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}
  >
    <p className="text-[10px] tracking-[.07em] uppercase font-bold mb-2 flex items-center gap-1.5"
      style={{ fontFamily: "'JetBrains Mono', monospace", color: accent || '#94a3b8' }}>
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {label}
    </p>
    <p className="text-xl font-extrabold" style={{ fontFamily: "'Manrope', sans-serif", color: '#0f172a' }}>
      {value}
    </p>
  </div>
);

const Th = ({ children, align = 'left', className = '' }) => (
  <th
    className={`py-3 text-[10px] tracking-[.08em] uppercase font-bold ${className}`}
    style={{ fontFamily: "'JetBrains Mono', monospace", color: '#94a3b8', textAlign: align }}
  >
    {children}
  </th>
);

const WeatherCell = ({ icon: Icon, value, unit }) => (
  <div className="rounded-xl py-3 text-center" style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}>
    <Icon className="w-4 h-4 mx-auto mb-1.5" style={{ color: '#2563eb' }} />
    <p className="text-sm font-bold" style={{ color: '#0f172a', fontFamily: "'JetBrains Mono', monospace" }}>
      {value ?? '--'}
    </p>
    <p className="text-[9px] tracking-[.08em] uppercase mt-0.5"
      style={{ color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace" }}>
      {unit}
    </p>
  </div>
);

const InventoryRow = ({ label, value, icon: Icon }) => (
  <div
    className="flex items-center justify-between py-2.5 px-3 rounded-xl"
    style={{ background: '#f8fafc' }}
  >
    <div className="flex items-center gap-2.5">
      <div className="w-6 h-6 rounded-lg flex items-center justify-center"
        style={{ background: '#eff6ff' }}>
        <Icon className="w-3.5 h-3.5" style={{ color: '#2563eb' }} />
      </div>
      <span className="text-[13px] font-medium" style={{ color: '#475569' }}>{label}</span>
    </div>
    <span className="text-[13px] font-bold"
      style={{ fontFamily: "'JetBrains Mono', monospace", color: '#0f172a' }}>
      {value}
    </span>
  </div>
);

const QuickAction = ({ href, icon: Icon, label, primary }) => (
  <a
    href={href}
    className="rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all hover:opacity-90"
    style={primary
      ? { background: '#2563eb', boxShadow: '0 4px 14px #2563eb30' }
      : { background: '#f8fafc', border: '1px solid #e2e8f0' }
    }
  >
    <Icon className="w-5 h-5 mb-2" style={{ color: primary ? '#ffffff' : '#2563eb' }} />
    <p className="text-[10px] tracking-[.07em] uppercase font-bold"
      style={{ fontFamily: "'JetBrains Mono', monospace", color: primary ? '#ffffff' : '#475569' }}>
      {label}
    </p>
  </a>
);

export default AppDashboard;