const dgram = require("dgram");
const express = require("express");
const WebSocket = require("ws");

const HOST = "192.168.169.1";
const PORT = 8800;
const INTERVAL = 100; // 10Hz (Persis seperti test script V2)
const PROXY_WS_PORT = 8082; // Port WebSocket untuk video streaming

const app = express();
app.use(express.json());

const client = dgram.createSocket("udp4");
client.on('error', (err) => {
    console.log(`[Socket Error] ${err.message}`);
});
client.bind(PORT, () => {
    console.log(`[UDP] Local socket bound to port ${PORT}`);
});

// ==========================
// VIDEO WEBSOCKET PROXY
// ==========================
const wss = new WebSocket.Server({ port: PROXY_WS_PORT }, () => {
    console.log(`🎥 [Video Proxy] WebSocket Server berjalan di ws://localhost:${PROXY_WS_PORT}`);
});

let wsClients = [];
wss.on('connection', (ws) => {
    console.log(`💻 [Client] Web browser GCS terhubung ke Video Stream!`);
    wsClients.push(ws);
    ws.on('close', () => {
        wsClients = wsClients.filter(c => c !== ws);
    });
});

// Dengarkan balasan paket dari Drone di socket kontrol
let videoPacketCount = 0;
let initCount = 0;

function parseD16Packet(msg) {
  // Jika panjang kurang dari 56 atau magic byte bukan 0x93 0x01, ini bukan paket video
  if (msg.length < 56 || msg[0] !== 0x93 || msg[1] !== 0x01) return null;
  // Ekstrak isi video/H264 murni tanpa header D16
  return msg.subarray(56);
}

client.on('message', (msg, rinfo) => {
    if (rinfo.address === HOST) {
        const payload = parseD16Packet(msg);
        if (payload) {
            videoPacketCount++;
            if (videoPacketCount % 50 === 0) console.log(`🎥 [Video] Menerima 50 frame/fragment H.264 dari drone...`);
            
            // Kirim frame murni ke GCS Frontend (JMuxer)
            for (const ws of wsClients) {
                if (ws.readyState === WebSocket.OPEN) ws.send(payload, { binary: true });
            }
        }
    }
});

// ==========================
// CAMERA WAKEUP SENDER
// ==========================
// Menembakkan INIT_PACKET setiap 1 detik agar drone terus mengirim stream video
setInterval(() => {
    initCount++;
    const initPacket = Buffer.from([0xef, 0x00, 0x04, 0x00]);
    client.send(initPacket, PORT, HOST, (err) => {
        if (err) console.error(`[Video] Gagal mengirim Wakeup: ${err.message}`);
    });
}, 1000);

let connectedAt = Date.now();

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
// PACKET
// ==========================
let sequenceCounter = 0;

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
