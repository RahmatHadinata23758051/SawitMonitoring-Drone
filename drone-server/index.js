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
const INTERVAL = 100; // 10Hz (Persis seperti test script V2)

const app = express();
app.use(express.json());

// CORS — izinkan akses dari browser (Laravel frontend & GCS)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

const { WebSocketServer } = require("ws");

// ==========================
// D16 VIDEO PROXY — Konstanta
// ==========================
const HTTP_PORT = 3002;
const WS_PORT = 3003;
const wss = new WebSocketServer({ port: WS_PORT });
console.log(`🔌 [WebSocket] FPV Stream berjalan di ws://localhost:${WS_PORT}`);

const INIT_PACKET = Buffer.from([0xef, 0x00, 0x04, 0x00]);
const MJPEG_BOUNDARY = "d16-frame";
const JPEG_HEADER_640X360 = Buffer.from("ffd8ffe000104a46494600010100000100010000ffdb004300100b0c0e0c0a100e0d0e1211101318281a181616183123251d283a333d3c3933383740485c4e404457453738506d51575f626768673e4d71797064785c656763ffdb0043011112121815182f1a1a2f634238426363636363636363636363636363636363636363636363636363636363636363636363636363636363636363636363636363ffc00011080168028003011100021101031101ffc4001f0000010501010101010100000000000000000102030405060708090a0bffc400b5100002010303020403050504040000017d01020300041105122131410613516107227114328191a1082342b1c11552d1f02433627282090a161718191a25262728292a3435363738393a434445464748494a535455565758595a636465666768696a737475767778797a838485868788898a92939495969798999aa2a3a4a5a6a7a8a9aab2b3b4b5b6b7b8b9bac2c3c4c5c6c7c8c9cad2d3d4d5d6d7d8d9dae1e2e3e4e5e6e7e8e9eaf1f2f3f4f5f6f7f8f9faffc4001f0100030101010101010101010000000000000102030405060708090a0bffc400b51100020102040403040705040400010277000102031104052131061241510761711322328108144291a1b1c109233352f0156272d10a162434e125f11718191a262728292a35363738393a434445464748494a535455565758595a636465666768696a737475767778797a82838485868788898a92939495969798999aa2a3a4a5a6a7a8a9aab2b3b4b5b6b7b8b9bac2c3c4c5c6c7c8c9cad2d3d4d5d6d7d8d9dae2e3e4e5e6e7e8e9eaf2f3f4f5f6f7f8f9faffda000c03010002110311003f00", "hex");

const videoApp = express();

let lastJpeg = null;
let mjpegClients = new Set();
let partialFrames = new Map();
let currentVideoFrameId = -1;
let videoPacketCount = 0;
let totalRawPackets = 0;
let lastRawPacketAt = 0;

const client = dgram.createSocket("udp4");
client.on('error', (err) => {
  console.log(`[Socket Error] ${err.message}`);
});

// ==== SINGLE SOCKET (Port Acak) ====
// Menghindari bind port 8800 lokal agar tidak bentrok dengan port drone
client.bind(0, () => {
  const address = client.address();
  console.log(`[UDP] Local socket bound to random port ${address.port}`);

  client.on('message', (msg, rinfo) => {
    try {
      totalRawPackets++;
      lastRawPacketAt = Date.now();
      if (totalRawPackets <= 5 || totalRawPackets % 100 === 0) {
        console.log(`[UDP IN] dari ${rinfo.address}:${rinfo.port} len=${msg.length} magic=0x${msg[0]?.toString(16)} 0x${msg[1]?.toString(16)}`);
      }
      if (rinfo.address === HOST) processVideoPacket(msg);
    } catch (e) {
      console.error('[Video Error]', e.message);
    }
  });

  // Kirim INIT tiap detik
  client.send(INIT_PACKET, PORT, HOST, () => {});
  setInterval(() => { client.send(INIT_PACKET, PORT, HOST, () => {}); }, 1000);
});

// ==========================
// D16 VIDEO PROXY — Functions
// ==========================
let connectedAt = Date.now();

function emitJpeg(jpeg) {
  lastJpeg = jpeg;
  // Tetap simpan emit MJPEG HTTP jika sewaktu-waktu dibutuhkan untuk legacy player
  const chunkHeader = Buffer.from(`--${MJPEG_BOUNDARY}\r\nContent-Type: image/jpeg\r\nContent-Length: ${jpeg.length}\r\n\r\n`, "ascii");
  for (const res of Array.from(mjpegClients)) {
    try { res.write(chunkHeader); res.write(jpeg); res.write(Buffer.from("\r\n", "ascii")); }
    catch { mjpegClients.delete(res); }
  }

  // === WEBSOCKET ZERO-LATENCY BROADCAST ===
  wss.clients.forEach(client => {
    if (client.readyState === 1 /* WebSocket.OPEN */) {
      client.send(jpeg); // Kirim buffer binary murni
    }
  });
}

function processVideoPacket(msg) {
  if (msg.length < 56 || msg[0] !== 0x93 || msg[1] !== 0x01) return;

  videoPacketCount++;
  if (videoPacketCount % 100 === 0) console.log(`🎥 [Video] ${videoPacketCount} paket diterima dari drone`);

  const frameId   = msg.readUInt32LE(40);
  const fragIndex = msg.readUInt32LE(32);
  const fragTotal = msg.readUInt32LE(36);
  const payload   = msg.subarray(56);

  // Jika drone mengirim frame baru, paksa render frame lama apa adanya (Best Effort FPV)
  // Ini kunci agar tidak stuck 1 menit meskipun ada paket hilang!
  if (frameId > currentVideoFrameId && partialFrames.has(currentVideoFrameId)) {
    const oldF = partialFrames.get(currentVideoFrameId);
    // Render jika kita punya lebih dari separuh data (mengurangi blank screen)
    if (oldF.fragments.size > (oldF.total * 0.4)) {
      const chunks = [];
      for (let i = 0; i < oldF.total; i++) {
        const chunk = oldF.fragments.get(i);
        if (chunk) chunks.push(chunk);
        // Kalau hilang, kita skip saja byte-nya, decoder Chrome/Canvas sangat pintar memperbaiki JPEG rusak
      }
      emitJpeg(Buffer.concat([JPEG_HEADER_640X360, Buffer.concat(chunks), Buffer.from([0xff, 0xd9])]));
    }
    partialFrames.delete(currentVideoFrameId);
  }

  currentVideoFrameId = frameId;

  if (!partialFrames.has(frameId)) {
    partialFrames.set(frameId, { total: fragTotal, fragments: new Map() });
  }

  const frame = partialFrames.get(frameId);
  frame.fragments.set(fragIndex, payload);

  // Jika paket sempurna 100% tanpa packet loss, langsung render
  if (frame.fragments.size === frame.total) {
    const chunks = [];
    for (let i = 0; i < frame.total; i++) {
      chunks.push(frame.fragments.get(i));
    }
    emitJpeg(Buffer.concat([JPEG_HEADER_640X360, Buffer.concat(chunks), Buffer.from([0xff, 0xd9])]));
    partialFrames.delete(frameId);
  }

  // Garbage collection: batasi memory
  while (partialFrames.size > 24) {
    const oldest = partialFrames.keys().next().value;
    partialFrames.delete(oldest);
  }
}


videoApp.use((_, res, next) => { res.setHeader("Access-Control-Allow-Origin", "*"); next(); });
videoApp.get("/stream", (req, res) => {
  res.writeHead(200, { "Cache-Control": "no-store", "Connection": "close", "Content-Type": `multipart/x-mixed-replace; boundary=${MJPEG_BOUNDARY}` });
  mjpegClients.add(res);
  if (lastJpeg) emitJpeg(lastJpeg);
  req.on("close", () => mjpegClients.delete(res));
});
// Status & diagnostic endpoint
videoApp.get("/status", (_, res) => {
  res.json({
    drone: `${HOST}:${PORT}`,
    video_packets_received: videoPacketCount,
    total_raw_udp: totalRawPackets,
    last_packet_ms_ago: lastRawPacketAt ? Date.now() - lastRawPacketAt : null,
    mjpeg_clients: mjpegClients.size,
    has_frame: !!lastJpeg,
    uptime_s: Math.floor(process.uptime()),
  });
});
videoApp.listen(HTTP_PORT, () => {
  console.log(`🎥 [Video] D16 MJPEG Proxy siap di http://localhost:${HTTP_PORT}/stream`);
  console.log(`📊 [Video] Status: http://localhost:${HTTP_PORT}/status`);
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
const CMD_CALIBRATE = 0x80;

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
  if (!sequence || !Array.isArray(sequence)) {
    return res.status(400).json({ error: "Invalid sequence payload." });
  }

  isExecutingSequence = true;
  res.json({ message: "Eksekusi rule engine dimulai", steps: sequence.length });

  console.log(`\n🚀 [Rule Engine] Memulai eksekusi ${sequence.length} instruksi...`);

  // === AUTO-ARM: Drone D16 HARUS di-ARM dulu sebelum bisa bergerak ===
  console.log(`🔓 [Rule Engine] Auto-ARM: Unlock motor drone...`);
  resetSticks();
  pulseFlag(0x40, 2000); // Unlock motor (ARM)
  lastCommandAt = Date.now();
  await sleep(2500); // Tunggu ARM selesai

  for (let i = 0; i < sequence.length; i++) {
    const step = sequence[i];
    let durationMs = step.durasi || 1000;
    
    // Konversi satuan waktu ke milidetik
    if (step.satuan_waktu === 'detik') durationMs *= 1000;
    else if (step.satuan_waktu === 'menit') durationMs *= 60000;

    const action = step.aksi.toLowerCase();
    console.log(`👉 Step ${i+1}: ${action} (${durationMs}ms)`);

    resetSticks();
    lastCommandAt = Date.now(); // Cegah WATCHDOG mereset sticks saat eksekusi

    // Mapping Dataset label ke IMU Telemetry (D16 Protocol)
    if (action.includes('takeoff') || action.includes('lepas landas')) {
      pulseFlag(CMD_TAKEOFF, Math.min(durationMs, 2000));
    }
    else if (action.includes('mendarat') || action.includes('land')) {
      pulseFlag(CMD_LAND, Math.min(durationMs, 2000));
    }
    else if (action.includes('diam (darat)')) {
      // ARM/Unlock saja - motor menyala tapi tidak terbang
      pulseFlag(0x40, Math.min(durationMs, 2000));
    }
    else if (action.includes('diam')) {
      // Hover di udara (tetap di 128 / netral)
    }
    else if (action.includes('maju')) {
      pitch = 192; // Maju
    }
    else if (action.includes('mundur')) {
      pitch = 64; // Mundur
    }
    else if (action.includes('naik')) {
      throttle = 192; // Naik
    }
    else if (action.includes('turun')) {
      throttle = 64; // Turun
    }
    else if (action.includes('roll kanan') || action.includes('belok kanan')) {
      roll = 192; // Geser Kanan
    }
    else if (action.includes('roll kiri') || action.includes('belok kiri')) {
      roll = 64; // Geser Kiri
    }
    else if (action.includes('rotasi kanan')) {
      yaw = 192; // Putar Kanan
    }
    else if (action.includes('rotasi kiri')) {
      yaw = 64; // Putar Kiri
    }

    // Refresh lastCommandAt tiap 500ms agar WATCHDOG tidak cut in
    const steps = Math.floor(durationMs / 500);
    for (let t = 0; t < steps; t++) {
      await sleep(500);
      lastCommandAt = Date.now();
    }
    await sleep(durationMs % 500); // Sisa waktu
  }

  console.log(`✅ [Rule Engine] Misi selesai. Drone hover.`);
  resetSticks();
  isExecutingSequence = false;
});

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
    console.warn("[WATCHDOG] Tidak ada command 3 detik, reset attitude & hover");
    roll = pitch = yaw = throttle = 128;
  }
}, 500);

// ==========================
// HEARTBEAT (ALWAYS ON)
// ==========================
setInterval(sendPacket, INTERVAL);

// ==========================
// COMMAND HANDLER
// ==========================
app.post("/command", (req, res) => {
  const cmd = req.body.command;
  lastCommandAt = Date.now();

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
      roll = pitch = yaw = 128;
      throttle = 128;
      pulseFlag(CMD_CALIBRATE);
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
