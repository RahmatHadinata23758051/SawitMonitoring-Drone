/**
 * missionFormatter.js
 * Pure helper functions untuk format dan export data misi GCS.
 * Tidak ada state React — semua input lewat parameter.
 */

// ============================================
// CSV EXPORT UTILITY
// ============================================
/**
 * Download data sebagai file CSV.
 * @param {string} filename - Nama file (tanpa ekstensi)
 * @param {string[]} headers - Array nama kolom
 * @param {string[]} rows - Array baris data (sudah diformat sebagai string CSV)
 */
export function exportCSV(filename, headers, rows) {
  const blob = new Blob(
    [[headers.join(','), ...rows].join('\n')],
    { type: 'text/csv;charset=utf-8;' }
  );
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ============================================
// EXPORT HANDLERS
// ============================================
/**
 * Export data Manajemen Blok Kebun ke CSV.
 * @param {Array} managedBlocks
 */
export function exportBlokKebun(managedBlocks) {
  if (!managedBlocks.length) return;
  exportCSV(
    'Manajemen_Blok_Sawit',
    ['ID Blok', 'Nama Blok', 'Luas (Ha)', 'Total Pohon', 'Tinggi (m)', 'Sampel', 'Status'],
    managedBlocks.map(b =>
      `${b.id},"${b.namaBlok}",${b.luasKebun},${b.totalPohon},${b.tinggiPohon},${b.jumlahSampel},${b.status}`
    )
  );
}

/**
 * Export data Raw Telemetry ke CSV.
 * @param {Array} telemetryHistory
 */
export function exportTelemetry(telemetryHistory) {
  if (!telemetryHistory.length) return;
  exportCSV(
    'Raw_Telemetry',
    ['Waktu', 'Latitude', 'Longitude', 'Alt(m)', 'Speed(m/s)', 'Pitch', 'Roll', 'Yaw', 'Mode', 'Battery(%)'],
    telemetryHistory.map(d =>
      `"${d.timestamp}",${d.lat.toFixed(6)},${d.lon.toFixed(6)},${d.alt.toFixed(2)},` +
      `${d.speed.toFixed(2)},${d.pitch.toFixed(2)},${d.roll.toFixed(2)},${d.yaw.toFixed(0)},"${d.mode}",${d.bat.toFixed(2)}`
    )
  );
}

/**
 * Export data Laporan Kinerja Drone ke CSV.
 * @param {Array} flightLogs
 */
export function exportFlightReport(flightLogs) {
  if (!flightLogs.length) return;
  exportCSV(
    'Laporan_Kinerja_Drone',
    ['ID Log', 'Tanggal', 'Nama Misi', 'Algoritma', 'Mode Scan', 'Waktu(s)', 'Baterai(%)', 'Sampel', 'Matang', 'Mentah', 'Akurasi(%)'],
    flightLogs.map(l =>
      `${l.id},"${l.date}","${l.name}",${l.nav},${l.scan},${l.flightTime},${l.batteryUsed},` +
      `${l.samples},${l.matang},${l.belumMatang},${l.accuracy}`
    )
  );
}

// ============================================
// DISPLAY FORMATTERS
// ============================================
/**
 * Format waktu detik ke MM:SS.
 * @param {number} seconds
 * @returns {string}
 */
export function formatFlightTime(seconds) {
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
}

/**
 * Format nama algoritma navigasi untuk display.
 * @param {string} algo
 * @returns {string}
 */
export function formatAlgorithmLabel(algo) {
  const map = {
    dead_reckoning: 'Dead-Reckoning',
    live_reckoning: 'Live-Reckoning',
    hybrid: 'Hybrid',
  };
  return map[algo] || algo || '-';
}

/**
 * Format scan mode untuk display.
 * @param {string} mode
 * @returns {string}
 */
export function formatScanModeLabel(mode) {
  const map = {
    traditional: 'Traditional Scan',
    qlv: 'QLV (Koridor)',
  };
  return map[mode] || mode || '-';
}
