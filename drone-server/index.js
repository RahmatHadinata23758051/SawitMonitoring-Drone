const dgram = require("dgram");
const express = require("express");

const HOST = "192.168.1.1";
const PORT = 7099;
const INTERVAL = 20; // 50Hz

const app = express();
app.use(express.json());

const client = dgram.createSocket("udp4");

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
// FLAGS (dari hasil reverse engineering + analisis pcap)
// Setiap flag hanya aktif ~1 detik (pulse/trigger), lalu kembali ke 0
// ==========================
const FLAG_ARM = 1; // arm / disarm
const FLAG_TAKEOFF_LANDING = 2; // auto takeoff & auto landing (konteks tergantung kondisi drone)
const FLAG_EMERGENCY = 4; // emergency stop

const b = (v) => v & 0xff;

// ==========================
// PACKET
// ==========================
function buildPacket() {
  const checksum = b(roll ^ pitch ^ yaw ^ throttle ^ flags);
  return Buffer.from([
    0x03,
    0x66,
    roll,
    pitch,
    throttle,
    yaw,
    flags,
    checksum,
    0x99,
  ]);
}

function sendPacket() {
  client.send(buildPacket(), PORT, HOST);
}

// ==========================
// FLAG PULSE HELPER
// Kirim flag selama ~1 detik lalu reset ke 0 (sesuai behavior RC UFO asli)
// ==========================
let flagTimer = null;

function pulseFlag(flagValue, durationMs = 1000) {
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
// WATCHDOG
// Jika tidak ada command selama 3 detik saat drone aktif (throttle > 128),
// otomatis reset attitude sebagai keamanan
// ==========================
let lastCommandAt = Date.now();

setInterval(() => {
  const idle = Date.now() - lastCommandAt > 3000;
  const droneActive = throttle > 128;

  if (idle && droneActive) {
    console.warn("[WATCHDOG] Tidak ada command 3 detik, reset attitude");
    roll = pitch = yaw = 128;
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
    // Hanya menyalakan motor (idle), TIDAK langsung takeoff
    // Throttle tetap di 128 (netral/idle)
    case "arm":
      if (Date.now() - connectedAt < 3000) {
        return res.json({ status: "wait_stabilize" });
      }
      roll = pitch = yaw = 128;
      throttle = 128;
      pulseFlag(FLAG_ARM);
      break;

    // --- TAKEOFF ---
    // Auto takeoff — aktifkan setelah arm
    case "takeoff":
      pulseFlag(FLAG_TAKEOFF_LANDING);
      break;

    // --- LANDING ---
    // Auto landing — drone turun otomatis
    case "land":
      roll = pitch = yaw = 128; // reset attitude sebelum landing
      pulseFlag(FLAG_TAKEOFF_LANDING);
      break;

    // --- DISARM ---
    // Matikan motor sepenuhnya
    case "disarm":
      roll = pitch = yaw = 128;
      throttle = 128;
      pulseFlag(FLAG_ARM);
      break;

    // --- EMERGENCY STOP ---
    // Kirim flag emergency (flag 4), drone akan stop mendadak
    case "emergency":
      roll = pitch = yaw = 128;
      throttle = 128;
      pulseFlag(FLAG_EMERGENCY);
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
      throttle = Math.max(128, Math.min(200, jThrottle)); // min 128 (idle), max 200

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
      throttle = Math.min(throttle + 5, 200);
      break;

    case "throttle_down":
      throttle = Math.max(throttle - 5, 128);
      break;

    // --- ROLL ---
    case "roll_left":
      roll = Math.max(roll - 5, 0);
      break;

    case "roll_right":
      roll = Math.min(roll + 5, 255);
      break;

    // --- PITCH ---
    case "pitch_forward":
      pitch = Math.min(pitch + 5, 255);
      break;

    case "pitch_backward":
      pitch = Math.max(pitch - 5, 0);
      break;

    // --- YAW ---
    case "yaw_left":
      yaw = Math.max(yaw - 5, 0);
      break;

    case "yaw_right":
      yaw = Math.min(yaw + 5, 255);
      break;

    // --- RESET ATTITUDE ---
    case "reset_attitude":
      roll = pitch = yaw = 128;
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
  console.log("Drone UDP Service running on port 3001");
  console.log(`Target: ${HOST}:${PORT}`);
  console.log("Heartbeat: 50Hz (20ms)");
});
