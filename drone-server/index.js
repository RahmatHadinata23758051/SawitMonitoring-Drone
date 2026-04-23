const express = require("express");

// =====================================================
// MAVLink dependencies — di-comment sampai Pixhawk ready
// Uncomment baris di bawah saat hardware Pixhawk sudah tersambung:
// const dgram = require("dgram");
// const { MavLinkPacket, MavLinkPacketSplitter, MavLinkPacketParser } = require('node-mavlink');
// const client = dgram.createSocket("udp4");
// =====================================================

// Konfigurasi Pixhawk — aktifkan saat hardware ready
// const HOST = "192.168.1.1"; // IP Telemetry Drone
// const PORT = 14550;          // Standard MAVLink UDP port
// const INTERVAL = 50;         // 20Hz

const app = express();
app.use(express.json());

// ==========================
// STATE DRONE (Mock / Simulasi)
// ==========================
let x = 0;      // pitch  (maju/mundur)   MAVLink: -1000 s/d 1000
let y = 0;      // roll   (kiri/kanan)
let z = 500;    // throttle               0 = turun, 1000 = naik, 500 = hover
let r = 0;      // yaw    (rotasi)
let buttons = 0;

// ==========================
// MAVLink Packet Builders
// (digunakan jika Pixhawk sudah tersambung)
// ==========================
function buildMavlinkManualControl(pitch, roll, throttle, yaw, btnMask) {
  return {
    target: 1,
    message_id: 69, // MANUAL_CONTROL
    payload: { x: pitch, y: roll, z: throttle, r: yaw, buttons: btnMask }
  };
}

function buildMavlinkCommandLong(command_id, p1=0, p2=0, p3=0, p4=0, p5=0, p6=0, p7=0) {
  return {
    target_system: 1, target_component: 1,
    message_id: 76,   // COMMAND_LONG
    command: command_id, confirmation: 0,
    param1: p1, param2: p2, param3: p3, param4: p4, param5: p5, param6: p6, param7: p7
  };
}

// Mapping command string → MAVLink nominal value
const STEP = 400; // langkah kontrol manual (0-1000 range)

// ==========================
// COMMAND HANDLER
// ==========================
app.post("/command", (req, res) => {
  const cmd = req.body.command;
  let mavlinkMessage = null;

  switch (cmd) {
    // --- CORE FLIGHT ---
    case "arm":
      mavlinkMessage = buildMavlinkCommandLong(400, 1); // MAV_CMD_COMPONENT_ARM_DISARM
      break;
    case "disarm":
      mavlinkMessage = buildMavlinkCommandLong(400, 0);
      break;
    case "takeoff":
      mavlinkMessage = buildMavlinkCommandLong(22, 0, 0, 0, 0, 0, 0, 2.5); // MAV_CMD_NAV_TAKEOFF
      break;
    case "land":
      mavlinkMessage = buildMavlinkCommandLong(21); // MAV_CMD_NAV_LAND
      break;
    case "emergency":
      x = 0; y = 0; r = 0; z = 0;
      mavlinkMessage = buildMavlinkCommandLong(185, 1); // Flight Termination
      break;

    // --- THROTTLE ---
    case "throttle_up":
      z = Math.min(1000, z + STEP);
      mavlinkMessage = buildMavlinkManualControl(x, y, z, r, buttons);
      break;
    case "throttle_down":
      z = Math.max(0, z - STEP);
      mavlinkMessage = buildMavlinkManualControl(x, y, z, r, buttons);
      break;

    // --- PITCH (maju/mundur) ---
    case "pitch_forward":
      x = STEP; y = 0; r = 0;
      mavlinkMessage = buildMavlinkManualControl(x, y, z, r, buttons);
      break;
    case "pitch_backward":
      x = -STEP; y = 0; r = 0;
      mavlinkMessage = buildMavlinkManualControl(x, y, z, r, buttons);
      break;

    // --- ROLL (kiri/kanan) ---
    case "roll_left":
      y = -STEP; x = 0; r = 0;
      mavlinkMessage = buildMavlinkManualControl(x, y, z, r, buttons);
      break;
    case "roll_right":
      y = STEP; x = 0; r = 0;
      mavlinkMessage = buildMavlinkManualControl(x, y, z, r, buttons);
      break;

    // --- YAW (rotasi) ---
    case "yaw_left":
      r = -STEP; x = 0; y = 0;
      mavlinkMessage = buildMavlinkManualControl(x, y, z, r, buttons);
      break;
    case "yaw_right":
      r = STEP; x = 0; y = 0;
      mavlinkMessage = buildMavlinkManualControl(x, y, z, r, buttons);
      break;

    // --- RESET / HOVER ---
    case "reset_attitude":
    case "diam_terbang":
      x = 0; y = 0; r = 0; z = 500;
      mavlinkMessage = buildMavlinkManualControl(x, y, z, r, buttons);
      break;

    // --- JOYSTICK (analog input dari gamepad) ---
    case "joystick": {
      const jRoll     = parseInt(req.body.roll)     || 128;
      const jPitch    = parseInt(req.body.pitch)    || 128;
      const jYaw      = parseInt(req.body.yaw)      || 128;
      const jThrottle = parseInt(req.body.throttle) || 128;
      y = Math.round(((jRoll - 128) / 128) * 1000);
      x = Math.round(((jPitch - 128) / 128) * 1000);
      r = Math.round(((jYaw - 128) / 128) * 1000);
      z = Math.round((jThrottle / 255) * 1000);
      mavlinkMessage = buildMavlinkManualControl(x, y, z, r, buttons);
      break;
    }

    default:
      return res.status(400).json({ status: "unknown_command", command: cmd });
  }

  console.log(`CMD: ${cmd.padEnd(20)} | x=${String(x).padStart(5)} y=${String(y).padStart(5)} z=${String(z).padStart(5)} r=${String(r).padStart(5)}`);

  // =====================================================
  // Kirim ke Pixhawk via UDP MAVLink — uncomment saat hardware ready:
  // const mavlinkBuffer = encodeMavlink(mavlinkMessage); // TODO: gunakan node-mavlink encoder
  // client.send(mavlinkBuffer, PORT, HOST);
  // =====================================================

  res.json({
    status: "ok",
    command: cmd,
    mode: "default_mock", // ganti ke "mavlink" saat Pixhawk ready
    state: { x, y, z, r },
    packet: mavlinkMessage
  });
});

// ==========================
// SERVER INIT
// ==========================
app.listen(3001, () => {
  console.log("=========================================");
  console.log("🛸  Drone GCS Server — DEFAULT MODE");
  console.log("    (MAVLink UDP disabled — Pixhawk belum terhubung)");
  console.log("PORT    : 3001 (HTTP JSON Command)");
  console.log("=========================================");
  console.log("✅ Siap menerima command dari GCS");
  console.log("💡 Uncomment baris MAVLink saat Pixhawk tersambung");
  console.log("=========================================");
});
