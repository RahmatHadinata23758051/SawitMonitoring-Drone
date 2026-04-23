const dgram = require("dgram");
const express = require("express");
const { MavLinkPacket, MavLinkPacketSplitter, MavLinkPacketParser } = require('node-mavlink');

// Konfigurasi Pixhawk Telemetry (SITL / Real Radio Telemetry)
const HOST = "192.168.1.1"; // IP Telemetry
const PORT = 14550; // Standar port MAVLink UDP (Pixhawk)
const INTERVAL = 50; // 20Hz untuk pengiriman manual control

const app = express();
app.use(express.json());

const client = dgram.createSocket("udp4");

// ==========================
// STATE DRONE MAVLINK
// ==========================
// MAVLink SET_POSITION_TARGET_LOCAL_NED atau MANUAL_CONTROL menggunakan range -1000 s/d 1000
let x = 0; // pitch (maju/mundur)
let y = 0; // roll (kiri/kanan)
let z = 500; // throttle (naik/turun) -> 500 = hover
let r = 0; // yaw (rotasi)
let buttons = 0; // bitmask tombol

let connectedAt = Date.now();

// ==========================
// SIMULASI MAVLINK GENERATOR
// ==========================
// Fungsi ini mengonversi command kita menjadi struktur MAVLink mentah (Buffer)
// (Dalam implementasi full, kita akan menggunakan class bawaan node-mavlink)
function buildMavlinkManualControl(pitch, roll, throttle, yaw, btnMask) {
  // Struktur pseudo MAVLink: MANUAL_CONTROL (Message ID: 69)
  // Ini hanya kerangka logis untuk menunjukkan perubahan format ke Pixhawk
  // Format aslinya akan di-encode oleh node-mavlink menjadi packet biner
  return {
    target: 1, // Target System ID (Pixhawk)
    message_id: 69, // MANUAL_CONTROL
    payload: {
      x: pitch,      // -1000 to 1000
      y: roll,       // -1000 to 1000
      z: throttle,   // 0 to 1000
      r: yaw,        // -1000 to 1000
      buttons: btnMask
    }
  };
}

function buildMavlinkCommandLong(command_id, param1=0, param2=0, param3=0, param4=0, param5=0, param6=0, param7=0) {
  // Struktur MAVLink COMMAND_LONG (Message ID: 76)
  return {
    target_system: 1,
    target_component: 1,
    message_id: 76, // COMMAND_LONG
    command: command_id,
    confirmation: 0,
    param1, param2, param3, param4, param5, param6, param7
  };
}

// ==========================
// COMMAND HANDLER (JSON to MAVLink)
// ==========================
app.post("/command", (req, res) => {
  const cmd = req.body.command;
  let mavlinkMessage = null;

  switch (cmd) {
    case "arm":
      // MAV_CMD_COMPONENT_ARM_DISARM (400)
      // param1: 1 = arm, 0 = disarm
      mavlinkMessage = buildMavlinkCommandLong(400, 1);
      break;

    case "disarm":
      // param1: 0 = disarm
      mavlinkMessage = buildMavlinkCommandLong(400, 0);
      break;

    case "takeoff":
      // MAV_CMD_NAV_TAKEOFF (22)
      // param7 = Ketinggian takeoff (meter)
      mavlinkMessage = buildMavlinkCommandLong(22, 0, 0, 0, 0, 0, 0, 2.5);
      break;

    case "land":
      // MAV_CMD_NAV_LAND (21)
      mavlinkMessage = buildMavlinkCommandLong(21);
      break;

    case "emergency":
      // Flight Termination (185) atau KILL_SWITCH
      mavlinkMessage = buildMavlinkCommandLong(185, 1); // 1 = terminate
      break;

    case "joystick": {
      // Mengonversi input GCS (0-255) ke MAVLink (-1000 s/d 1000)
      const jRoll = parseInt(req.body.roll) || 128;
      const jPitch = parseInt(req.body.pitch) || 128;
      const jYaw = parseInt(req.body.yaw) || 128;
      const jThrottle = parseInt(req.body.throttle) || 128;

      y = Math.round(((jRoll - 128) / 128) * 1000);   // Roll
      x = Math.round(((jPitch - 128) / 128) * 1000);  // Pitch
      r = Math.round(((jYaw - 128) / 128) * 1000);    // Yaw
      z = Math.round((jThrottle / 255) * 1000);       // Throttle (0-1000)

      mavlinkMessage = buildMavlinkManualControl(x, y, z, r, buttons);
      break;
    }

    // --- NAVIGASI WAYPOINT/ACTION SESUAI DATASET IMU ---
    case "maju":
      x = 500; // Pitch forward (+500)
      y = 0; r = 0; z = 500;
      mavlinkMessage = buildMavlinkManualControl(x, y, z, r, buttons);
      break;

    case "mundur":
      x = -500; // Pitch backward (-500)
      y = 0; r = 0; z = 500;
      mavlinkMessage = buildMavlinkManualControl(x, y, z, r, buttons);
      break;

    case "roll_kanan":
      y = 500; // Roll right (+500)
      x = 0; r = 0; z = 500;
      mavlinkMessage = buildMavlinkManualControl(x, y, z, r, buttons);
      break;

    case "rotasi_kiri":
      r = -500; // Yaw left (-500)
      x = 0; y = 0; z = 500;
      mavlinkMessage = buildMavlinkManualControl(x, y, z, r, buttons);
      break;

    case "reset_attitude":
    case "diam_terbang":
      // Hover stabil
      x = 0; y = 0; r = 0; z = 500; 
      mavlinkMessage = buildMavlinkManualControl(x, y, z, r, buttons);
      break;

    default:
      return res.status(400).json({ status: "unknown_command", command: cmd });
  }

  console.log("CMD DITERIMA :", cmd);
  console.log("MAVLINK OUT  :", JSON.stringify(mavlinkMessage, null, 2));
  console.log("-----------------------------------------");

  // TODO: Encode mavlinkMessage ke buffer byte array menggunakan library node-mavlink
  // client.send(mavlinkBuffer, PORT, HOST);

  res.json({
    status: "ok",
    command: cmd,
    format: "mavlink",
    packet: mavlinkMessage
  });
});

// ==========================
// SERVER INIT
// ==========================
app.listen(3001, () => {
  console.log("=========================================");
  console.log("🛰️  Drone GCS to MAVLink Server Running");
  console.log("PORT    : 3001 (HTTP JSON Command)");
  console.log(`TARGET  : ${HOST}:${PORT} (Pixhawk UDP)`);
  console.log("=========================================");
});
