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

let droneProfile = process.env.DRONE_PROFILE || "d16";
let HOST = process.env.DRONE_IP || (droneProfile === "e88" ? "192.168.1.1" : "192.168.169.1");
let PORT = parseInt(process.env.DRONE_PORT || (droneProfile === "e88" ? "7099" : "8800"), 10);
const INTERVAL = parseInt(process.env.DRONE_INTERVAL || "100", 10);

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

  // Heartbeat kontrol kontinu dinonaktifkan di sini karena menggunakan
  // HEARTBEAT (ON-DEMAND) di bawah agar tidak membekukan FPV Video stream.
  console.log(`⚡ Heartbeat Kontrol: On-Demand (10Hz)`);

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

app.post('/execute-sequence', async (req, res) => {
  if (isExecutingSequence) {
    return res.status(400).json({ error: "Drone sedang mengeksekusi misi lain." });
  }

  const { sequence } = req.body;
  if (!sequence || !Array.isArray(sequence) || sequence.length === 0) {
    return res.status(400).json({ error: "Sequence kosong atau tidak valid." });
  }

  isExecutingSequence = true;
  markControlActive(60000); // Pastikan heartbeat aktif
  res.json({ message: "Eksekusi rule engine dimulai", steps: sequence.length });

  console.log(`\n🚀 [Rule Engine] Memulai eksekusi ${sequence.length} instruksi...`);

  try {
    // === FASE 0: BIND & CALIBRATE ===
    console.log(`🎬 [Rule Engine] Fase 0 — Auto-Binding & Kalibrasi...`);
    await runBindSequence();
    
    // Gyro Calibration
    resetSticks();
    pulseFlag(0x80, 1000); // 0x80 = calibrate
    await sleep(2000);

    // === FASE 1: ARM ===
    console.log(`🔓 [Rule Engine] Fase 1 — ARM (unlock motor)...`);
    resetSticks();
    lastCommandAt = Date.now();
    pulseFlag(0x40, 1500);
    await sleep(2000);

    // === FASE 2: TAKEOFF ===
    console.log(`🛫 [Rule Engine] Fase 2 — TAKEOFF, tunggu drone stabil 4 detik...`);
    resetSticks();
    lastCommandAt = Date.now();
    pulseFlag(CMD_TAKEOFF, 2000);
    await sleep(4000);

    // === FASE 3: EKSEKUSI INSTRUKSI USER ===
    for (let i = 0; i < sequence.length; i++) {
      const step = sequence[i];

      // Bug fix #3: guard aksi undefined
      if (!step || !step.aksi) {
        console.warn(`[Rule Engine] Step ${i+1} tidak punya aksi, dilewati.`);
        continue;
      }

      let durationMs = parseFloat(step.durasi) || 1000;

      // Bug fix #2: handle semua satuan waktu
      if (step.satuan_waktu === 'detik') durationMs *= 1000;
      else if (step.satuan_waktu === 'menit') durationMs *= 60000;
      // milidetik → gunakan as-is

      // Batas minimal 200ms, maksimal 60 detik per step
      durationMs = Math.max(200, Math.min(60000, durationMs));

      const action = step.aksi.toLowerCase().trim();
      console.log(`👉 Step ${i+1}/${sequence.length}: "${action}" (${durationMs}ms)`);

      resetSticks();
      lastCommandAt = Date.now();

      // === Mapping aksi → kontrol D16 ===
      if (action.includes('mendarat') || action.includes('land')) {
        pulseFlag(CMD_LAND, Math.min(durationMs, 2000));
      } else if (action.includes('diam') || action.includes('hover')) {
        // Hover — stik netral, drone melayang
      } else if (action.includes('maju')) {
        pitch = 192;
      } else if (action.includes('mundur')) {
        pitch = 64;
      } else if (action.includes('naik')) {
        throttle = 192;
      } else if (action.includes('turun')) {
        throttle = 64;
      } else if (action.includes('roll kanan') || action.includes('belok kanan')) {
        roll = 192;
      } else if (action.includes('roll kiri') || action.includes('belok kiri')) {
        roll = 64;
      } else if (action.includes('rotasi kanan')) {
        yaw = 192;
      } else if (action.includes('rotasi kiri')) {
        yaw = 64;
      } else if (action.includes('pitch atas')) {
        pitch = 64;
      } else if (action.includes('pitch bawah')) {
        pitch = 192;
      } else {
        console.warn(`[Rule Engine] Aksi tidak dikenal: "${action}", hover saja.`);
      }

      // Refresh lastCommandAt & heartbeat tiap 400ms agar watchdog tidak reset
      const chunks = Math.floor(durationMs / 400);
      for (let t = 0; t < chunks; t++) {
        await sleep(400);
        lastCommandAt = Date.now();
        markControlActive(1500);
      }
      await sleep(durationMs % 400);
    }

    // === FASE 4: AUTO-LAND ===
    const lastAction = (sequence[sequence.length - 1]?.aksi || '').toLowerCase();
    if (!lastAction.includes('mendarat') && !lastAction.includes('land')) {
      console.log(`🛬 [Rule Engine] Fase 4 — Auto-LAND...`);
      resetSticks();
      lastCommandAt = Date.now();
      pulseFlag(CMD_LAND, 2000);
      await sleep(3000);
    }

    console.log(`✅ [Rule Engine] Misi selesai.`);

  } catch (err) {
    // Bug fix #1: selalu reset state meski error
    console.error(`[Rule Engine] Error:`, err.message);
    resetSticks();
    pulseFlag(CMD_LAND, 1500); // emergency land
  } finally {
    // Bug fix #1: isExecutingSequence SELALU di-reset
    isExecutingSequence = false;
    controlActiveUntil = 0;
    console.log(`[Rule Engine] State di-reset.`);
  }
});


function buildPacket() {
  if (droneProfile === "e88") {
    const packet = Buffer.alloc(9);
    packet.writeUInt8(0x03, 0); // Header byte 1
    packet.writeUInt8(0x66, 1); // Header byte 2
    packet.writeUInt8(roll, 2);
    packet.writeUInt8(pitch, 3);
    packet.writeUInt8(throttle, 4);
    packet.writeUInt8(yaw, 5);
    packet.writeUInt8(flags, 6); // command flag
    const checksum = roll ^ pitch ^ throttle ^ yaw ^ flags;
    packet.writeUInt8(checksum, 7);
    packet.writeUInt8(0x99, 8); // Footer byte
    return packet;
  }

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

  // Controls
  const headless = 0x00; // Matikan Headless Mode (0x02 -> 0x00) agar orientasi normal
  packet.writeUInt8(roll, 20);
  packet.writeUInt8(pitch, 21);
  packet.writeUInt8(throttle, 22);
  packet.writeUInt8(yaw, 23);
  packet.writeUInt8(flags, 24); // flags variable stores the command
  packet.writeUInt8(headless, 25);

  // Checksum
  const checksum = roll ^ pitch ^ throttle ^ yaw ^ flags ^ headless;
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
let controlActiveUntil = 0;

function markControlActive(ms = 1000) {
  controlActiveUntil = Date.now() + ms;
}

setInterval(() => {
  const hasStickInput = roll !== 128 || pitch !== 128 || yaw !== 128 || throttle !== 128;
  const hasFlags = flags !== 0;
  // E88 Pro selalu mengirim heartbeat secara kontinyu agar tidak disconnect/loss-control
  const shouldSend = droneProfile === "e88" || hasStickInput || hasFlags || Date.now() < controlActiveUntil;

  if (shouldSend) {
    sendPacket();
  }
}, INTERVAL);

// ==========================
// AUTO-BIND FLOW ON START / ARM
// Toy drone D16 membutuhkan sweep Throttle UP -> DOWN -> NEUTRAL untuk pairing
// ==========================
async function runBindSequence() {
  if (droneProfile === "e88") {
    console.log("🎬 [Bind] E88 Pro tidak memerlukan throttle sweep handshake. Melewati bind sequence...");
    return;
  }
  console.log("🎬 [Bind] Memulai handshake pairing drone...");
  
  // 1. Pastikan stick di tengah
  roll = 128; pitch = 128; yaw = 128; throttle = 128;
  flags = 0;
  markControlActive(5000); // Biarkan control loop mengirim paket selama 5 detik ke depan
  await sleep(500);

  // 2. Throttle UP (255)
  console.log("   ↑ Throttle UP (255) - Handshake");
  throttle = 255;
  await sleep(800);

  // 3. Throttle NEUTRAL (128)
  console.log("   - Throttle NEUTRAL (128)");
  throttle = 128;
  await sleep(300);

  // 4. Throttle DOWN (0)
  console.log("   ↓ Throttle DOWN (0) - Pairing lock");
  throttle = 0;
  await sleep(800);

  // 5. Kembalikan ke NEUTRAL
  console.log("   - Throttle NEUTRAL (128) - Pairing selesai");
  throttle = 128;
  await sleep(1000);
}

// ==========================
// COMMAND HANDLER
// ==========================
app.post("/command", (req, res) => {
  const cmd = req.body.command;
  lastCommandAt = Date.now();
  markControlActive(1500); // Aktifkan heartbeat selama 1.5 detik sejak command diterima

  switch (cmd) {
    // --- ARM ---
    // Menyala tanpa terbang (Unlock Motor + Auto Bind jika belum)
    case "arm":
      (async () => {
        try {
          if (droneProfile === "e88") {
            // E88 Pro: Kalibrasi gyro terlebih dahulu (0x80) untuk me-reset lock emergency / sensor
            throttle = 0;
            roll = pitch = yaw = 128;
            console.log("   📐 Mengirim sinyal KALIBRASI GYRO (0x80) E88 Pro...");
            pulseFlag(0x80, 1000);
            await sleep(1200);
          } else {
            await runBindSequence();
          }
          console.log("   🔓 Mengirim sinyal UNLOCK MOTOR (0x40)...");
          pulseFlag(0x40, 1500);
          await sleep(1500);
          console.log("✅ [Arming Flow] Drone berhasil di-ARM dan siap terbang!");
        } catch (err) {
          console.error("❌ Error during arming:", err);
        }
      })();
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
      if (droneProfile === "d16") {
        yaw = 2; // Tarik yaw full ke kiri (kombinasi kill switch D16)
      }
      pulseFlag(CMD_EMERGENCY);
      break;

    // --- EMERGENCY STOP ---
    // Berhenti mendadak
    case "emergency":
      roll = pitch = yaw = 128;
      throttle = 0; // Throttle 0
      if (droneProfile === "d16") {
        yaw = 2; // Yaw 2 (kiri bawah)
      }
      pulseFlag(CMD_EMERGENCY);
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
// DRONE PROFILE SETTINGS
// ==========================
app.get("/profile", (req, res) => {
  res.json({
    status: "ok",
    profile: droneProfile,
    host: HOST,
    port: PORT,
  });
});

app.post("/profile", (req, res) => {
  const { profile, host, port } = req.body;
  
  if (profile && ["d16", "e88"].includes(profile)) {
    const oldProfile = droneProfile;
    droneProfile = profile;
    
    // Auto IP target update if still at default
    const oldDefaultHost = oldProfile === "e88" ? "192.168.1.1" : "192.168.169.1";
    const newDefaultHost = profile === "e88" ? "192.168.1.1" : "192.168.169.1";
    if (HOST === oldDefaultHost) {
      HOST = newDefaultHost;
    }

    // Auto Port target update if still at default
    const oldDefaultPort = oldProfile === "e88" ? 7099 : 8800;
    const newDefaultPort = profile === "e88" ? 7099 : 8800;
    if (PORT === oldDefaultPort) {
      PORT = newDefaultPort;
    }
    
    console.log(`🔄 [Profile] Diubah dari ${oldProfile} ke ${profile}. Target: ${HOST}:${PORT}`);
  }

  if (host) {
    HOST = host;
    console.log(`📡 [IP Target] Diubah ke: ${HOST}`);
  }

  if (port) {
    PORT = parseInt(port, 10);
    console.log(`🔌 [Port Target] Diubah ke: ${PORT}`);
  }

  res.json({
    status: "ok",
    profile: droneProfile,
    host: HOST,
    port: PORT,
  });
});

// ==========================
// PTC08 SERIAL & USB CAMERA INTEGRATION
// ==========================
let ptc08Camera = null;
let usbCamera = null;
let ptc08Config = {
  protocol: 'd16_proxy', // default
  port: '/dev/ttyUSB0',
  baudRate: 38400,
  resolution: '640x480'
};

app.get("/camera/config", (req, res) => {
  res.json({
    status: 'ok',
    config: ptc08Config
  });
});

app.post("/camera/config", (req, res) => {
  const { protocol, port, baudRate, resolution } = req.body;
  if (protocol) ptc08Config.protocol = protocol;
  if (port) ptc08Config.port = port;
  if (baudRate) ptc08Config.baudRate = parseInt(baudRate, 10);
  if (resolution) ptc08Config.resolution = resolution;

  console.log("🎥 [Camera Config] Diupdate:", ptc08Config);

  // Matikan kamera serial yang aktif jika ada
  if (ptc08Camera) {
    console.log("Menghentikan kamera serial PTC08...");
    ptc08Camera.stop();
    ptc08Camera = null;
  }

  // Matikan kamera USB yang aktif jika ada
  if (usbCamera) {
    console.log("Menghentikan kamera USB...");
    usbCamera.stop();
    usbCamera = null;
  }

  // Jika memilih protokol PTC08 Serial, jalankan kameranya
  if (ptc08Config.protocol === 'ptc08_serial') {
    try {
      const PTC08Camera = require('./ptc08');
      ptc08Camera = new PTC08Camera(
        ptc08Config.port,
        ptc08Config.baudRate,
        ptc08Config.resolution,
        (jpeg) => {
          // Kirim frame ke stream MJPEG
          emitJpeg(jpeg);
        },
        (err) => {
          console.error('[PTC08] Event error kamera:', err.message);
        }
      );
      ptc08Camera.start();
      console.log(`Menyalakan kamera serial PTC08 di ${ptc08Config.port} (${ptc08Config.resolution})...`);
    } catch (err) {
      console.error('Gagal menginisialisasi modul kamera PTC08:', err.message);
    }
  }

  // Jika memilih protokol USB Webcam (UVC)
  if (ptc08Config.protocol === 'usb_webcam') {
    try {
      const USBCamera = require('./usb_camera');
      usbCamera = new USBCamera(
        ptc08Config.port, // misal '/dev/video0'
        ptc08Config.resolution,
        (jpeg) => {
          // Kirim frame ke stream MJPEG
          emitJpeg(jpeg);
        },
        (err) => {
          console.error('[USBCamera] Event error kamera USB:', err.message);
        }
      );
      usbCamera.start();
      console.log(`Menyalakan kamera USB di ${ptc08Config.port} (${ptc08Config.resolution})...`);
    } catch (err) {
      console.error('Gagal menginisialisasi modul kamera USB:', err.message);
    }
  }

  res.json({
    status: 'ok',
    config: ptc08Config
  });
});

// ==========================
app.listen(3001, () => {
  console.log("✈️  GCS Drone Server Ready pada port 3001");
  console.log(`📡 Target Drone: ${HOST}:${PORT}`);
  console.log("⚡ Heartbeat Rate: 10Hz (100ms)");
});
