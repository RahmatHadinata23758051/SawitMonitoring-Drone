/**
 * pathGenerator.js
 * Pure functions untuk generate flight path drone.
 * Tidak ada state React — semua input lewat parameter.
 */

import { BASE_LAT, BASE_LON, METER_TO_DEG } from './gcsConstants';

// ============================================
// GRID POHON HEKSAGONAL
// ============================================
/**
 * Generate grid pohon hexagonal berdasarkan konfigurasi kebun.
 * @param {{ luasKebun: number, totalPohon: number, tinggiPohon: number }} config
 * @returns {{ trees: Array, max_x: number, max_y: number }}
 */
export function generateTreeGrid(config) {
  const { luasKebun, totalPohon, tinggiPohon } = config;
  const areaM2 = luasKebun * 10000;
  const areaPerTree = areaM2 / totalPohon;
  const spacingX = Math.sqrt(areaPerTree * 1.1547);
  const spacingY = spacingX * Math.sin(Math.PI / 3);
  const ratio = spacingY / spacingX;
  const cols = Math.max(3, Math.ceil(Math.sqrt(totalPohon / ratio)));
  const rows = Math.ceil(totalPohon / cols);

  let count = 0;
  const generatedTrees = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (count >= totalPohon) break;
      const offsetX = (row % 2 !== 0) ? (spacingX / 2) : 0;
      const x = (col * spacingX) + offsetX;
      const y = row * spacingY;
      const lat = BASE_LAT - (y * METER_TO_DEG);
      const lon = BASE_LON + (x * METER_TO_DEG);
      const crownRadius = spacingX * 0.22;
      generatedTrees.push({
        id: `L${row + 1}P${col + 1}`,
        x, y, lat, lon, row, col,
        height: tinggiPohon + (Math.random() * 2 - 1),
        crownRadius,
      });
      count++;
    }
  }

  return {
    trees: generatedTrees,
    max_x: cols * spacingX + spacingX / 2,
    max_y: rows * spacingY,
  };
}

// ============================================
// QLV PATH GENERATOR
// ============================================
/**
 * Generate jalur QLV (Quick Look Vision) berdasarkan pohon awal yang dipilih.
 * @param {{ waypoints: Array, trees: Array, jumlahSampel: number }} params
 * @returns {Array} jalur waypoint QLV
 */
export function generateQLVPath({ waypoints, trees, jumlahSampel }) {
  if (waypoints.length === 0) return [];
  const startTree = waypoints[0];
  const targetPoints = Math.ceil(jumlahSampel / 2);
  const rowTrees = trees.filter(t => t.row === startTree.row).sort((a, b) => a.x - b.x);
  const startIndex = rowTrees.findIndex(t => t.id === startTree.id);
  if (startIndex === -1) return [];

  let selectedTrees = rowTrees.length - startIndex >= targetPoints
    ? rowTrees.slice(startIndex, startIndex + targetPoints)
    : rowTrees.slice(Math.max(0, startIndex - targetPoints + 1), startIndex + 1).reverse();

  const nextRowTrees = trees.filter(t => t.row === startTree.row + 1);
  let yCorridor = startTree.y;
  if (nextRowTrees.length > 0) {
    yCorridor = (startTree.y + nextRowTrees[0].y) / 2;
  } else {
    const prevRow = trees.filter(t => t.row === startTree.row - 1);
    yCorridor = prevRow.length > 0
      ? startTree.y + (startTree.y - prevRow[0].y) / 2
      : startTree.y + 5;
  }

  return selectedTrees.map((t, i) => ({
    x: t.x,
    y: yCorridor,
    id: `QLV-${i}`,
    lat: BASE_LAT - (yCorridor * METER_TO_DEG),
    lon: BASE_LON + (t.x * METER_TO_DEG),
  }));
}

// ============================================
// QLV TARGET TREES
// ============================================
/**
 * Tentukan pohon-pohon target dalam mode QLV berdasarkan jalur.
 * @param {{ waypoints: Array, qlvPath: Array, trees: Array, jumlahSampel: number }} params
 * @returns {Array} daftar pohon target
 */
export function getQLVTargetTrees({ waypoints, qlvPath, trees, jumlahSampel }) {
  if (waypoints.length === 0 || qlvPath.length === 0) return [];
  const startTree = waypoints[0];
  const targetRow1 = startTree.row;
  const targetRow2 = trees.filter(t => t.row === targetRow1 + 1).length > 0
    ? targetRow1 + 1
    : targetRow1 - 1;
  const row2Trees = trees.filter(t => t.row === targetRow2);
  let candidates = [];

  qlvPath.forEach(wp => {
    const t1 = trees.find(t => t.row === targetRow1 && Math.abs(t.x - wp.x) < 0.1);
    let t2 = null; let minDist = Infinity;
    row2Trees.forEach(t => {
      const d = Math.abs(t.x - wp.x);
      if (d < minDist) { minDist = d; t2 = t; }
    });
    if (t1 && !candidates.some(c => c.id === t1.id)) candidates.push(t1);
    if (t2 && !candidates.some(c => c.id === t2.id)) candidates.push(t2);
  });

  return candidates.slice(0, jumlahSampel);
}

// ============================================
// TRADITIONAL PATH GENERATOR
// ============================================
/**
 * Generate jalur Traditional Scan (zigzag 2 lajur).
 * @param {{ waypoints: Array, trees: Array }} params
 * @returns {Array} jalur waypoint tradisional
 */
export function generateTradPath({ waypoints, trees }) {
  if (waypoints.length !== 3) return [];
  const wp1 = waypoints[0]; const wp2 = waypoints[1]; const wp3 = waypoints[2];
  const minX = Math.min(wp1.x, wp2.x); const maxX = Math.max(wp1.x, wp2.x);

  let row1Trees = trees.filter(t => t.row === wp1.row && t.x >= minX - 1 && t.x <= maxX + 1);
  let row2Trees = trees.filter(t => t.row === wp3.row && t.x >= minX - 1 && t.x <= maxX + 1);

  if (wp1.x > wp2.x) {
    row1Trees.sort((a, b) => b.x - a.x);
    row2Trees.sort((a, b) => a.x - b.x);
  } else {
    row1Trees.sort((a, b) => a.x - b.x);
    row2Trees.sort((a, b) => b.x - a.x);
  }

  return [...row1Trees, ...row2Trees];
}

// ============================================
// PATH STRING FOR SVG
// ============================================
/**
 * Convert jalur waypoints ke string koordinat untuk SVG polyline.
 * @param {{ scanMode: string, waypoints: Array, qlvPath: Array, tradPath: Array }} params
 * @param {string} homeX - x koordinat home waypoint
 * @param {string} homeY - y koordinat home waypoint
 * @returns {string} SVG points string
 */
export function buildPathString({ scanMode, waypoints, qlvPath, tradPath }, homeX, homeY) {
  const src = scanMode === 'qlv' && waypoints.length > 0
    ? qlvPath
    : scanMode === 'traditional' && waypoints.length === 3
      ? tradPath
      : waypoints;
  return src.length > 0
    ? `${homeX},${homeY} ${src.map(wp => `${wp.x},${wp.y}`).join(' ')}`
    : '';
}
