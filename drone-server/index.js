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
const { WebSocketServer } = require("ws");
const mc = require("./d16MovementController");

const HOST = mc.HOST;
const PORT = mc.PORT;

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

  // === INIT MOVEMENT CONTROLLER ===
  // Pass the UDP send function so the movement module uses the SAME socket
  mc.init((packet, port, host) => {
    client.send(packet, port, host);
  });

  // FPS monitor
  setInterval(() => {
    if (currentFps > 0 || videoPackets > 0) {
      console.log(`📊 FPS: ${currentFps} | Frames: ${emittedFrameCount}`);
      videoPackets = 0;
    }
  }, 5000);
});

// ==========================
// COMMAND HANDLER
// ==========================
app.post("/command", async (req, res) => {
  const cmd = req.body.command;
  const result = await mc.handleCommand(cmd, req.body);

  if (result === null) {
    return res.status(400).json({ status: "unknown_command", command: cmd });
  }

  if (result.status === "rejected") {
    return res.status(400).json(result);
  }

  console.log("CMD:", cmd, "→", result.message || "ok");
  res.json({ ...result, command: cmd });
});

// ==========================
// RULE ENGINE SEQUENCE EXECUTOR
// ==========================
app.post('/execute-sequence', async (req, res) => {
  const { sequence } = req.body;
  if (!sequence || !Array.isArray(sequence)) {
    return res.status(400).json({ error: "Invalid sequence payload." });
  }

  // Validate preconditions BEFORE sending success response
  const precondErr = mc.canExecuteSequence();
  if (precondErr) {
    return res.status(400).json({ error: precondErr });
  }

  // Preconditions passed — respond then run async
  res.json({ message: "Eksekusi rule engine dimulai", steps: sequence.length });
  mc.executeSequence(sequence).catch(err => {
    console.error("[Rule Engine] Error during execution:", err.message);
  });
});

// ==========================
// CONTROL STATUS ENDPOINT
// ==========================
app.get("/control/status", (req, res) => {
  res.json(mc.getStatus());
});

// ==========================
app.listen(3001, () => {
  console.log("✈️  GCS Drone Server D16 Ready pada port 3001");
  console.log(`📡 Target Drone: ${HOST}:${PORT}`);
});
