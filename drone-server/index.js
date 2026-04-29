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
// FLAGS (dari hasil reverse engineering + analisis pcap E88 Pro)
// Setiap flag hanya aktif ~1 detik (pulse/trigger), lalu kembali ke 0
// ==========================
const CMD_TAKEOFF = 0x01;
const CMD_LAND = 0x02;
const CMD_EMERGENCY = 0x04;
const CMD_UNLOCK_MOTOR = 0x40; // Arming (Idle)
const CMD_CALIBRATE = 0x80;

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
    // Menyala tanpa terbang (Unlock Motor)
    case "arm":
      if (Date.now() - connectedAt < 3000) {
        return res.json({ status: "wait_stabilize" });
      }
      roll = pitch = yaw = 128;
      throttle = 128;
      pulseFlag(CMD_UNLOCK_MOTOR);
      break;

    // --- TAKEOFF ---
    // Auto takeoff — naik ke udara
    case "takeoff":
      pulseFlag(CMD_TAKEOFF);
      break;

    // --- LANDING ---
    // Auto landing — drone turun perlahan
    case "land":
      roll = pitch = yaw = 128; // reset attitude sebelum landing
      pulseFlag(CMD_LAND);
      break;

    // --- DISARM ---
    // Mematikan motor, ekuivalen dengan emergency atau unlock ulang
    case "disarm":
      roll = pitch = yaw = 128;
      throttle = 128;
      pulseFlag(CMD_EMERGENCY); // Untuk drone mainan, emergency stop mematikan motor
      break;

    // --- EMERGENCY STOP ---
    // Berhenti mendadak
    case "emergency":
      roll = pitch = yaw = 128;
      throttle = 128;
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
