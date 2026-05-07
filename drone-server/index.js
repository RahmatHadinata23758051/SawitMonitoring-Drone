// === GLOBAL ERROR TRAP (untuk debug crash tersembunyi) ===
process.on('uncaughtException', (err) => {
  console.error('\n[FATAL] Uncaught Exception:', err.message);
  console.error(err.stack);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('[FATAL] Unhandled Promise Rejection:', reason);
});

const dgram = require("dgram");
const express = require("express");

const HOST = "192.168.169.1";
const PORT = 8800;
const INTERVAL = 100;

const app = express();
app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

const { WebSocketServer } = require("ws");

// ==========================
// D16 VIDEO PROXY (referensi: d16-web-proxy.js)
// ==========================
const HTTP_PORT = 3002;
const WS_PORT = 3003;
const wss = new WebSocketServer({ port: WS_PORT });

console.log(`🔌 [WebSocket] FPV Stream di ws://localhost:${WS_PORT}`);

const INIT_PACKET = Buffer.from([0xef, 0x00, 0x04, 0x00]);
const MJPEG_BOUNDARY = "d16-frame";
const JPEG_HEADER = Buffer.from(
  "ffd8ffe000104a46494600010100000100010000ffdb004300100b0c0e0c0a100e0d0e1211101318281a181616183123251d283a333d3c3933383740485c4e404457453738506d51575f626768673e4d71797064785c656763ffdb0043011112121815182f1a1a2f634238426363636363636363636363636363636363636363636363636363636363636363636363636363636363636363636363636363ffc00011080168028003011100021101031101ffc4001f0000010501010101010100000000000000000102030405060708090a0bffc400b5100002010303020403050504040000017d01020300041105122131410613516107227114328191a1082342b1c11552d1f02433627282090a161718191a25262728292a3435363738393a434445464748494a535455565758595a636465666768696a737475767778797a838485868788898a92939495969798999aa2a3a4a5a6a7a8a9aab2b3b4b5b6b7b8b9bac2c3c4c5c6c7c8c9cad2d3d4d5d6d7d8d9dae1e2e3e4e5e6e7e8e9eaf1f2f3f4f5f6f7f8f9faffc4001f0100030101010101010101010000000000000102030405060708090a0bffc400b51100020102040403040705040400010277000102031104052131061241510761711322328108144291a1b1c109233352f0156272d10a162434e125f11718191a262728292a35363738393a434445464748494a535455565758595a636465666768696a737475767778797a82838485868788898a92939495969798999aa2a3a4a5a6a7a8a9aab2b3b4b5b6b7b8b9bac2c3c4c5c6c7c8c9cad2d3d4d5d6d7d8d9dae2e3e4e5e6e7e8e9eaf2f3f4f5f6f7f8f9faffda000c03010002110311003f00",
  "hex",
);

const videoApp = express();
let lastJpeg = null;
let mjpegClients = new Set();
let partialFrames = new Map();
let emittedFrameCount = 0;
let fpsCounter = 0;
let currentFps = 0;
let videoPackets = 0;
let lastPacketAt = 0;

setInterval(() => { currentFps = fpsCounter; fpsCounter = 0; }, 1000);

// Video processing: direct emit (zero latency)

function emitJpeg(jpeg) {
  lastJpeg = jpeg;
  emittedFrameCount++;
  fpsCounter++;
  const hdr = Buffer.from(`--${MJPEG_BOUNDARY}\r\nContent-Type: image/jpeg\r\nContent-Length: ${jpeg.length}\r\n\r\n`, "ascii");
  for (const res of Array.from(mjpegClients)) {
    try { res.write(hdr); res.write(jpeg); res.write(Buffer.from("\r\n", "ascii")); }
    catch { mjpegClients.delete(res); }
  }
  wss.clients.forEach(c => { if (c.readyState === 1) c.send(jpeg); });
}

videoApp.use((_, res, next) => { res.setHeader("Access-Control-Allow-Origin", "*"); next(); });
videoApp.get("/stream", (req, res) => {
  res.writeHead(200, { "Cache-Control": "no-store", "Connection": "close", "Content-Type": `multipart/x-mixed-replace; boundary=${MJPEG_BOUNDARY}` });
  mjpegClients.add(res);
  if (lastJpeg) emitJpeg(lastJpeg);
  req.on("close", () => mjpegClients.delete(res));
});
videoApp.get("/snapshot.jpg", (_, res) => {
  if (!lastJpeg) return res.status(503).send("No frame");
  res.type("image/jpeg").send(lastJpeg);
});
videoApp.get("/status", (_, res) => {
  const age = lastPacketAt ? Date.now() - lastPacketAt : null;
  res.json({
    status: age !== null && age < 3000 ? "connected" : "waiting",
    drone: `${HOST}:${PORT}`, packets: videoPackets, has_frame: !!lastJpeg,
    fps: currentFps, emitted_frames: emittedFrameCount,
    mjpeg_clients: mjpegClients.size, ws_clients: wss.clients.size,
    last_packet_age_ms: age, uptime_s: Math.floor(process.uptime()),
  });
});
videoApp.listen(HTTP_PORT, () => {
  console.log(`🎥 [Video] D16 MJPEG: http://localhost:${HTTP_PORT}/stream`);
  console.log(`📊 [Video] Status: http://localhost:${HTTP_PORT}/status`);
});

// ==========================
// SATU UDP SOCKET (video + control gabungan)
// KRITIS: Drone D16 membalas video ke port pengirim.
// Jika pakai 2 socket, drone bingung kirim video ke mana.
// SEMUA komunikasi HARUS lewat socket yang sama.
// ==========================
const client = dgram.createSocket("udp4");

client.on("message", (msg, rinfo) => {
  if (msg.length < 56 || msg[0] !== 0x93 || msg[1] !== 0x01) return;
  videoPackets++;
  lastPacketAt = Date.now();

  const frameId = msg.readUInt32LE(40);
  const fragIndex = msg.readUInt32LE(32);
  const fragTotal = msg.readUInt32LE(36);
  const width = msg.readUInt16LE(44);
  const height = msg.readUInt16LE(46);
  const payload = msg.subarray(56);

  if (!partialFrames.has(frameId)) {
    partialFrames.set(frameId, { 
      width, height, total: fragTotal, fragments: new Map(), firstSeen: Date.now() 
    });
  }
  const frame = partialFrames.get(frameId);
  frame.fragments.set(fragIndex, payload);

  // Emit jika 100% lengkap ATAU >= 80% (turunkan ke 80% agar cepat dirender tanpa menunggu sisa drop packet)
  const pct = frame.fragments.size / frame.total;
  const ready = (pct >= 1.0) || (pct >= 0.8 && Date.now() - frame.firstSeen > 100);

  if (ready && !frame.emitted && width === 640 && height === 360) {
    frame.emitted = true;
    // Ambil fragment berurutan dari awal (tanpa gap)
    const chunks = [];
    for (let i = 0; i < frame.total; i++) {
      const c = frame.fragments.get(i);
      if (!c) break; // Stop di fragment pertama yang hilang
      chunks.push(c);
    }
    if (chunks.length >= Math.floor(frame.total * 0.7)) {
      const body = Buffer.concat(chunks);
      emitJpeg(Buffer.concat([JPEG_HEADER, body, Buffer.from([0xff, 0xd9])]));
    }
    partialFrames.delete(frameId);
  }

  // GC: hapus frame lama agar memori tidak bocor
  const now = Date.now();
  for (const [fId, fData] of partialFrames.entries()) {
    if (now - fData.firstSeen > 1000) { // Beri toleransi 1 detik penuh
      partialFrames.delete(fId);
    }
  }
});

client.bind(0, () => {
  const addr = client.address();

  try {
    client.setRecvBufferSize(4 * 1024 * 1024);
    console.log(`📡 [UDP] Port ${addr.port} → ${HOST}:${PORT} | RecvBuf: 4MB`);
  } catch (e) {
    console.log(`📡 [UDP] Port ${addr.port} → ${HOST}:${PORT} | RecvBuf: default`);
  }

  // Kirim INIT setiap 1 detik agar drone terus kirim video
  function sendInit() { client.send(INIT_PACKET, PORT, HOST); }
  sendInit();
  setInterval(sendInit, 1000);

  // =========================================================
  // HEARTBEAT KONTROL — 10Hz (100ms)
  // KRITIS: Tanpa ini, drone tidak akan merespon APAPUN!
  // Paket 88-byte dikirim terus-menerus ke drone.
  // =========================================================
  setInterval(sendPacket, INTERVAL);
  console.log(`⚡ Heartbeat Kontrol: ${1000/INTERVAL}Hz`);

  // FPS monitor
  setInterval(() => {
    if (currentFps > 0 || videoPackets > 0) {
      console.log(`📊 FPS: ${currentFps} | Frames: ${emittedFrameCount}`);
      videoPackets = 0;
    }
  }, 5000);
});

// ==========================
// STATE (SINGLE SOURCE OF TRUTH)
// ==========================
let roll = 128;
let pitch = 128;
let yaw = 128;
let throttle = 128;
let flags = 0;

// ==========================
// FLAGS (dari hasil reverse engineering + analisis pcap E88 Pro)
// Setiap flag hanya aktif ~1 detik (pulse/trigger), lalu kembali ke 0
// ==========================
const CMD_TAKEOFF = 0x01;
const CMD_LAND = 0x02;
const CMD_EMERGENCY = 0x04;
const CMD_UNLOCK_MOTOR = 0x00; // Not explicitly used in D16 byte command
const CMD_CALIBRATE_CANDIDATE = 0x80; // belum tervalidasi untuk D16

const b = (v) => v & 0xff;

// ==========================
// TELEMETRY & RULE ENGINE EXECUTION
// ==========================
let sequenceCounter = 0;
let isExecutingSequence = false;

// Helpers untuk mengembalikan stik ke tengah
function resetSticks() {
  roll = 128;
  pitch = 128;
  yaw = 128;
  throttle = 128;
  flags = 0;
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ==========================
// SOFT LANDING (Gradual Throttle Decrease)
// Turunkan throttle perlahan dari hover (128) → nilai rendah (50) lalu kirim CMD_LAND
// Ini mencegah drone "jatuh" mendadak saat mendarat
// ==========================
async function softLand() {
  console.log(`🛬 [SoftLand] Menurunkan throttle perlahan...`);
  const START_THROTTLE = 128;  // Posisi hover
  const END_THROTTLE   = 50;   // Nilai rendah sebelum cut (jangan 0, bisa jatuh bebas)
  const DESCENT_MS     = 2500; // Total durasi penurunan (2.5 detik)
  const STEPS          = 20;   // Jumlah langkah penurunan
  const stepDelay      = Math.floor(DESCENT_MS / STEPS);
  const stepSize       = (START_THROTTLE - END_THROTTLE) / STEPS;

  // Reset attitude — stik netral, hanya throttle yang dimanipulasi
  roll = 128; pitch = 128; yaw = 128;
  flags = 0;

  for (let s = 0; s <= STEPS; s++) {
    throttle = Math.round(START_THROTTLE - s * stepSize);
    lastCommandAt = Date.now();
    console.log(`  ↓ Throttle: ${throttle}`);
    await sleep(stepDelay);
  }

  // Kirim flag landing setelah throttle rendah
  throttle = 128; // Kembalikan ke netral sebelum CMD_LAND
  pulseFlag(CMD_LAND, 2000);
  lastCommandAt = Date.now();
  await sleep(3000); // Tunggu drone benar-benar di tanah
  resetSticks();
  console.log(`✅ [SoftLand] Selesai.`);
}

app.post('/execute-sequence', async (req, res) => {
  if (isExecutingSequence) {
    return res.status(400).json({ error: "Drone sedang mengeksekusi misi lain." });
  }
  
  const { sequence } = req.body;
  if (!sequence || !Array.isArray(sequence)) {
    return res.status(400).json({ error: "Invalid sequence payload." });
  }

  isExecutingSequence = true;
  res.json({ message: "Eksekusi rule engine dimulai", steps: sequence.length });

  console.log(`\n🚀 [Rule Engine] Memulai eksekusi ${sequence.length} instruksi...`);

  // === FASE 0: KALIBRASI GYRO ===
  // Kirim CMD_CALIBRATE_CANDIDATE dulu agar sensor di-zero sebelum terbang
  // Ini kunci konsistensi antar misi (mencegah gyro thermal drift)
  console.log(`🧭 [Rule Engine] Fase 0 — Kalibrasi sensor gyro (Kandidat)...`);
  resetSticks();
  pulseFlag(CMD_CALIBRATE_CANDIDATE, 1000); // 0x80 = calibrate candidate
  lastCommandAt = Date.now();
  await sleep(3000); // Beri waktu gyro settle di posisi diam

  // === FASE 1: ARM ===
  console.log(`🔓 [Rule Engine] Fase 1 — ARM (unlock motor)...`);
  resetSticks();
  pulseFlag(0x40, 1500);
  lastCommandAt = Date.now();
  await sleep(2000);

  // === FASE 2: TAKEOFF ===
  // KRITIS: Drone D16 WAJIB menerima TAKEOFF sebelum merespon throttle/pitch/roll!
  console.log(`🛫 [Rule Engine] Fase 2 — TAKEOFF, tunggu drone stabil 5 detik...`);
  resetSticks();
  pulseFlag(CMD_TAKEOFF, 2000);
  lastCommandAt = Date.now();
  await sleep(5000); // Diperpanjang 4→5 detik agar drone lebih stabil

  // === FASE 3: EKSEKUSI INSTRUKSI USER ===
  const AUTO_INTER_STEP_HOVER_MS = 1000; // Jeda hover otomatis antar langkah

  for (let i = 0; i < sequence.length; i++) {
    const step = sequence[i];
    let durationMs = step.durasi || 1000;
    
    // Konversi satuan waktu ke milidetik
    if (step.satuan_waktu === 'detik') durationMs *= 1000;
    else if (step.satuan_waktu === 'menit') durationMs *= 60000;

    const action = step.aksi.toLowerCase();
    const isDiamTerbang = action.includes('diam terbang') || action.includes('hover');
    const isLast = i === sequence.length - 1;

    console.log(`👉 Step ${i+1}/${sequence.length}: ${action} (${durationMs}ms)`);

    resetSticks();
    lastCommandAt = Date.now();

    // === Mapping Dataset label → Telemetri D16 ===
    if (action.includes('mendarat') || action.includes('land')) {
      // Soft landing: turunkan throttle perlahan lalu kirim CMD_LAND
      await softLand();
      // Skip timer loop di bawah karena softLand sudah handle timing-nya
      continue;
    }
    else if (action.includes('diam (darat)') || action.includes('diam')) {
      // Hover — stik tetap di tengah (128), drone melayang
    }
    else if (action.includes('maju')) {
      pitch = 192;
    }
    else if (action.includes('mundur')) {
      pitch = 64;
    }
    else if (action.includes('naik')) {
      throttle = 192;
    }
    else if (action.includes('turun')) {
      throttle = 64;
    }
    else if (action.includes('roll kanan') || action.includes('belok kanan')) {
      roll = 192;
    }
    else if (action.includes('roll kiri') || action.includes('belok kiri')) {
      roll = 64;
    }
    else if (action.includes('rotasi kanan')) {
      yaw = 192;
    }
    else if (action.includes('rotasi kiri')) {
      yaw = 64;
    }
    else if (action.includes('pitch atas')) {
      pitch = 64;  // Tilt ke atas (nose up = gerak mundur/naik)
    }
    else if (action.includes('pitch bawah')) {
      pitch = 192; // Tilt ke bawah (nose down = gerak maju)
    }

    // Refresh lastCommandAt tiap 500ms agar WATCHDOG tidak cut in
    const steps = Math.floor(durationMs / 500);
    for (let t = 0; t < steps; t++) {
      await sleep(500);
      lastCommandAt = Date.now();
    }
    await sleep(durationMs % 500); // Sisa waktu

    // === JEDA HOVER OTOMATIS antar langkah ===
    // Tidak perlu jeda jika:
    // - Ini langkah terakhir (akan langsung ke Auto-Land)
    // - Step ini sendiri adalah "Diam Terbang" (user sudah set durasinya)
    // - Step ini adalah mendarat (tidak masuk akal hover dulu setelah landing)
    const skipAutoHover = isLast || isDiamTerbang || action.includes('mendarat') || action.includes('land');
    if (!skipAutoHover) {
      console.log(`  ⏸️  [Auto-Hover] Jeda ${AUTO_INTER_STEP_HOVER_MS}ms sebelum step berikutnya...`);
      resetSticks(); // Kembali ke hover (stik tengah)
      lastCommandAt = Date.now();
      const hoverSteps = Math.floor(AUTO_INTER_STEP_HOVER_MS / 500);
      for (let t = 0; t < hoverSteps; t++) {
        await sleep(500);
        lastCommandAt = Date.now();
      }
      await sleep(AUTO_INTER_STEP_HOVER_MS % 500);
    }
  }

  // === FASE 4: AUTO-LAND (jika user tidak mendefinisikan mendarat di akhir) ===
  const lastAction = sequence[sequence.length - 1]?.aksi?.toLowerCase() || '';
  if (!lastAction.includes('mendarat') && !lastAction.includes('land')) {
    console.log(`🛬 [Rule Engine] Fase 4 — Auto-LAND (step terakhir bukan mendarat)...`);
    resetSticks();
    await softLand();
  }

  console.log(`✅ [Rule Engine] Misi selesai.`);
  resetSticks();
  isExecutingSequence = false;
});

// ==========================
// TRIM KOREKSI DRIFT HARDWARE
// Sesuaikan nilai ini jika drone selalu drift ke satu arah saat hover
// Positif = dorong ke kanan/maju, Negatif = dorong ke kiri/mundur
// Range: -20 sampai +20 (hati-hati jangan terlalu besar)
// ==========================
let TRIM_ROLL  = -5;  // Drone drift KANAN → trim ke kiri
let TRIM_PITCH =  8;  // Drone drift BELAKANG → trim ke depan
let TRIM_YAW   =  0;  // Tidak ada drift rotasi

function buildPacket() {
  const packet = Buffer.alloc(88, 0x00);

  // Magic & Size
  packet.writeUInt8(0xef, 0);
  packet.writeUInt8(0x02, 1);
  packet.writeUInt8(0x58, 2);
  packet.writeUInt8(0x00, 3);

  // Magic 2
  packet.writeUInt8(0x02, 4);
  packet.writeUInt8(0x02, 5);
  packet.writeUInt8(0x00, 6);
  packet.writeUInt8(0x01, 7);

  // Dynamic Sequence Counter (Little Endian)
  packet.writeUInt32LE(sequenceCounter, 12);

  // Magic 3
  packet.writeUInt8(0x14, 16);
  packet.writeUInt8(0x00, 17);
  packet.writeUInt8(0x66, 18);
  packet.writeUInt8(0x14, 19);

  // Controls (dengan trim koreksi drift hardware)
  const headless = 0x00;
  const b = (v) => Math.max(0, Math.min(255, Math.round(v)));
  packet.writeUInt8(b(roll     + TRIM_ROLL),  20);
  packet.writeUInt8(b(pitch    + TRIM_PITCH), 21);
  packet.writeUInt8(b(throttle),              22); // Throttle tidak perlu trim
  packet.writeUInt8(b(yaw      + TRIM_YAW),   23);
  packet.writeUInt8(flags,                    24);
  packet.writeUInt8(headless,                 25);

  // Checksum (gunakan nilai SETELAH trim)
  const finalRoll  = b(roll  + TRIM_ROLL);
  const finalPitch = b(pitch + TRIM_PITCH);
  const finalYaw   = b(yaw   + TRIM_YAW);
  const checksum = finalRoll ^ finalPitch ^ throttle ^ finalYaw ^ flags ^ headless;
  packet.writeUInt8(checksum, 36);

  // Static suffix
  packet.writeUInt8(0x99, 37);

  // Tail
  packet.writeUInt8(0x32, 82);
  packet.writeUInt8(0x4b, 83);
  packet.writeUInt8(0x14, 84);
  packet.writeUInt8(0x2d, 85);

  sequenceCounter++;
  return packet;
}

function sendPacket() {
  // KRITIS: Pakai socket yang SAMA dengan video (client)
  // agar drone tetap mengirim video ke port yang sama
  client.send(buildPacket(), PORT, HOST);
}

// ==========================
// FLAG PULSE HELPER
// Kirim flag selama ~2 detik lalu reset ke 0 (meniru test script 2 detik)
// ==========================
let flagTimer = null;

function pulseFlag(flagValue, durationMs = 2000) {
  // Batalkan timer sebelumnya jika ada
  if (flagTimer) {
    clearTimeout(flagTimer);
    flagTimer = null;
  }

  flags = flagValue;

  flagTimer = setTimeout(() => {
    flags = 0;
    flagTimer = null;
  }, durationMs);
}

// ==========================
// WATCHDOG & JOYSTICK NUDGE
// ==========================
let lastCommandAt = Date.now();
let joystickTimer = null;

// Helper untuk tombol D-Pad UI agar bertindak seperti sentuhan (nudge)
// Memberikan nilai yang cukup kuat untuk melampaui deadzone drone (biasanya 128 +- 30)
function nudgeJoystick(axis, value, durationMs = 600) {
  if (joystickTimer) clearTimeout(joystickTimer);

  if (axis === 'pitch') pitch = value;
  if (axis === 'roll') roll = value;
  if (axis === 'yaw') yaw = value;
  if (axis === 'throttle') throttle = value;

  joystickTimer = setTimeout(() => {
    // Auto-reset ke netral (hover) saat tombol tidak lagi diklik
    roll = 128;
    pitch = 128;
    yaw = 128;
    throttle = 128;
    joystickTimer = null;
  }, durationMs);
}

setInterval(() => {
  const idle = Date.now() - lastCommandAt > 3000;
  const droneActive = throttle > 128 || flags > 0;

  // Jangan ganggu saat Rule Engine sedang berjalan
  if (isExecutingSequence) return;

  if (idle && droneActive) {
    console.warn("[WATCHDOG] Tidak ada command 3 detik, reset ke hover");
    roll = pitch = yaw = throttle = 128;
    flags = 0;
  }
}, 500);

// ==========================
// HEARTBEAT (ON-DEMAND)
// Paket control 88-byte (0xef 0x02...) MENGHENTIKAN video stream jika dikirim terus.
// Hanya kirim control saat ada command aktif (stick bukan netral, atau flag aktif).
// ==========================
let controlActive = false;

setInterval(() => {
  const hasStickInput = roll !== 128 || pitch !== 128 || yaw !== 128 || throttle !== 128;
  const hasFlags = flags !== 0;
  const shouldSend = hasStickInput || hasFlags || controlActive;

  if (shouldSend) {
    sendPacket();
  }
}, INTERVAL);

// ==========================
// TEST FLAG ENDPOINT (Untuk mencari flag D16 yang benar)
// Wajib: Motor mati, propeller dilepas, drone di meja rata
// ==========================
app.post("/test-flag", (req, res) => {
  const value = Number(req.body.value);

  if (!Number.isInteger(value) || value < 0 || value > 255) {
    return res.status(400).json({ error: "value harus 0-255" });
  }

  resetSticks();
  pulseFlag(value, 1200);
  lastCommandAt = Date.now();

  console.log(`\n🧪 [Test Flag] Mencoba flag: 0x${value.toString(16).padStart(2, "0")} (${value})`);

  res.json({
    status: "ok",
    flag_decimal: value,
    flag_hex: `0x${value.toString(16).padStart(2, "0")}`,
  });
});

// ==========================
// COMMAND HANDLER
// ==========================
app.post("/command", (req, res) => {
  const cmd = req.body.command;
  lastCommandAt = Date.now();
  controlActive = true; // Aktifkan heartbeat selama ada command

  switch (cmd) {
    // --- ARM ---
    // Menyala tanpa terbang (Unlock Motor)
    case "arm":
      roll = pitch = yaw = throttle = 128;
      pulseFlag(0x40, 1000); // 0x40 adalah standar byte Unlock Motor untuk wifi_uav
      break;

    // --- TAKEOFF ---
    // Auto takeoff — naik ke udara
    case "takeoff":
      // Pastikan semua stick netral saat takeoff agar tidak gagal / nungging
      roll = pitch = yaw = 128;
      throttle = 128;
      pulseFlag(CMD_TAKEOFF);
      break;

    // --- LANDING ---
    // Auto landing — drone turun perlahan
    case "land":
      roll = pitch = yaw = 128; // reset attitude sebelum landing
      throttle = 128;
      pulseFlag(CMD_LAND);
      break;

    // --- DISARM ---
    // Mematikan motor, ekuivalen dengan emergency atau unlock ulang
    case "disarm":
      roll = pitch = yaw = 128;
      throttle = 0; // Tarik throttle full kebawah
      yaw = 2; // Tarik yaw full ke kiri (kombinasi kill switch D16)
      pulseFlag(CMD_EMERGENCY);
      break;

    // --- EMERGENCY STOP ---
    // Berhenti mendadak
    case "emergency":
      roll = pitch = yaw = 128;
      throttle = 0; // Throttle 0
      yaw = 2; // Yaw 2 (kiri bawah)
      pulseFlag(CMD_EMERGENCY);
      break;

    // --- CALIBRATE GYRO ---
    case "calibrate":
    case "calibrate_candidate":
      resetSticks();
      pulseFlag(CMD_CALIBRATE_CANDIDATE, 1200);
      break;

    // --- JOYSTICK (continuous dari frontend, 10Hz) ---
    // Menerima nilai roll, pitch, yaw, throttle langsung dari nipplejs
    case "joystick": {
      const jRoll = parseInt(req.body.roll) || 128;
      const jPitch = parseInt(req.body.pitch) || 128;
      const jYaw = parseInt(req.body.yaw) || 128;
      const jThrottle = parseInt(req.body.throttle) || 128;

      roll = Math.max(0, Math.min(255, jRoll));
      pitch = Math.max(0, Math.min(255, jPitch));
      yaw = Math.max(0, Math.min(255, jYaw));
      throttle = Math.max(0, Math.min(255, jThrottle)); // D16 supports 0-255

      return res.json({
        status: "ok",
        command: cmd,
        roll,
        pitch,
        yaw,
        throttle,
      });
    }

    // --- THROTTLE ---
    case "throttle_up":
      nudgeJoystick('throttle', 255); // Naik maksimal
      break;

    case "throttle_down":
      nudgeJoystick('throttle', 0); // Turun maksimal
      break;

    // --- ROLL ---
    case "roll_left":
      nudgeJoystick('roll', 0); // Kiri maksimal
      break;

    case "roll_right":
      nudgeJoystick('roll', 255); // Kanan maksimal
      break;

    // --- PITCH ---
    case "pitch_forward":
      nudgeJoystick('pitch', 255); // Maju maksimal
      break;

    case "pitch_backward":
      nudgeJoystick('pitch', 0); // Mundur maksimal
      break;

    // --- YAW ---
    case "yaw_left":
      nudgeJoystick('yaw', 0); // Putar kiri
      break;

    case "yaw_right":
      nudgeJoystick('yaw', 255); // Putar kanan
      break;

    // --- RESET ATTITUDE ---
    case "reset_attitude":
      roll = pitch = yaw = throttle = 128;
      if (joystickTimer) clearTimeout(joystickTimer);
      break;

    default:
      return res.status(400).json({ status: "unknown_command", command: cmd });
  }

  console.log("CMD     :", cmd);
  console.log("Throttle:", throttle);
  console.log("Flags   :", flags);
  console.log("Roll    :", roll, "| Pitch:", pitch, "| Yaw:", yaw);
  console.log("--------------------");

  res.json({
    status: "ok",
    command: cmd,
    throttle,
    flags,
    roll,
    pitch,
    yaw,
  });
});

// ==========================
app.listen(3001, () => {
  console.log("✈️  GCS Drone Server D16 Ready pada port 3001");
  console.log(`📡 Target Drone: ${HOST}:${PORT}`);
  console.log("⚡ Heartbeat Rate: 10Hz (100ms)");
});
