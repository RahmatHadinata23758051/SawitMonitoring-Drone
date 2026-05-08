// ============================================================
// D16 Movement Controller Module
// Refactored: smooth ramping, speed profiles, stick macros,
// safety arm, trim, press-and-hold, single control loop.
// Drone: D16 Mini C0 toy — UDP custom protocol (PCAP-verified)
// ============================================================

const NEUTRAL = 128;
const CONTROL_INTERVAL_MS = parseInt(process.env.D16_CONTROL_INTERVAL_MS || "25", 10);

// Supports both decimal ("2") and hex ("0x02") env values
function parseByteEnv(envVal, fallback) {
  if (envVal === undefined || envVal === null || envVal === "") return fallback;
  const s = String(envVal).trim();
  const n = s.startsWith("0x") || s.startsWith("0X") ? parseInt(s, 16) : parseInt(s, 10);
  return isNaN(n) ? fallback : n & 0xff;
}
const CONTROL_MODE_BYTE = parseByteEnv(process.env.D16_CONTROL_MODE_BYTE, 0x02);

const HOST = "192.168.169.1";
const PORT = 8800;

// --- Command flags (PCAP-verified) ---
const CMD_TAKEOFF = 0x01;
const CMD_LAND = 0x02;
const CMD_EMERGENCY = 0x04;

// --- Speed profiles ---
const SPEED_PROFILES = {
  low: {
    pitchForward: 150, pitchBackward: 106,
    rollRight: 150, rollLeft: 106,
    yawRight: 146, yawLeft: 110,
    throttleUp: 146, throttleDown: 110,
    slewStep: 5
  },
  medium: {
    pitchForward: 165, pitchBackward: 91,
    rollRight: 165, rollLeft: 91,
    yawRight: 158, yawLeft: 98,
    throttleUp: 158, throttleDown: 98,
    slewStep: 6
  },
  high: {
    pitchForward: 185, pitchBackward: 71,
    rollRight: 185, rollLeft: 71,
    yawRight: 175, yawLeft: 81,
    throttleUp: 175, throttleDown: 81,
    slewStep: 8
  }
};

// --- State ---
let desired = { roll: NEUTRAL, pitch: NEUTRAL, throttle: NEUTRAL, yaw: NEUTRAL };
let actual = { roll: NEUTRAL, pitch: NEUTRAL, throttle: NEUTRAL, yaw: NEUTRAL };
let flags = 0;
let gcsArmed = false;
let emergencyLocked = false;
let isFlying = false;
let isExecutingSequence = false;
let missionCancelRequested = false;
let speedProfile = "low";
let controlActiveUntil = 0;
let lastCommandAt = Date.now();
let trimRoll = 0;
let trimPitch = 0;
let trimYaw = 0;
let sequenceCounter = 0;
let packetsSent = 0;
let flagTimer = null;
let nudgeTimer = null;
let isMacroRunning = false;

// Will be set by init()
let _udpSendFn = null;

// --- Movement blocked guard ---
function movementBlocked() {
  if (!gcsArmed) return "GCS not armed";
  if (emergencyLocked) return "Emergency locked — arm first";
  if (isExecutingSequence) return "Mission executing — wait or emergency stop";
  return null;
}

// --- Axis parser (0 is valid, only NaN falls back to NEUTRAL) ---
function parseAxis(value) {
  const n = Number(value);
  return isNaN(n) ? NEUTRAL : clampByte(n);
}

// --- Helpers ---
function clampByte(v) { return Math.max(0, Math.min(255, Math.round(v))); }
function clampTrim(v) { return Math.max(-30, Math.min(30, v)); }

function resetDesired() {
  desired.roll = NEUTRAL; desired.pitch = NEUTRAL;
  desired.throttle = NEUTRAL; desired.yaw = NEUTRAL;
}
function resetActual() {
  actual.roll = NEUTRAL; actual.pitch = NEUTRAL;
  actual.throttle = NEUTRAL; actual.yaw = NEUTRAL;
}
function resetSticks() {
  resetDesired(); resetActual(); flags = 0;
  if (flagTimer) { clearTimeout(flagTimer); flagTimer = null; }
  if (nudgeTimer) { clearTimeout(nudgeTimer); nudgeTimer = null; }
}
function markControlActive(ms = 1000) {
  controlActiveUntil = Date.now() + ms;
}
function slew(current, target, step) {
  if (Math.abs(target - current) <= step) return target;
  return current + Math.sign(target - current) * step;
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// Cancellable sleep that checks missionCancelRequested
async function cancellableSleep(ms) {
  const chunkMs = 250;
  let remaining = ms;
  while (remaining > 0 && !missionCancelRequested) {
    const wait = Math.min(remaining, chunkMs);
    await sleep(wait);
    remaining -= wait;
    lastCommandAt = Date.now(); // keep watchdog happy during mission
  }
  if (missionCancelRequested) throw new Error("MISSION_CANCELLED");
}

function pulseFlag(flagValue, durationMs = 2000) {
  if (flagTimer) { clearTimeout(flagTimer); flagTimer = null; }
  flags = flagValue;
  flagTimer = setTimeout(() => { flags = 0; flagTimer = null; }, durationMs);
}

function getProfile() {
  return SPEED_PROFILES[speedProfile] || SPEED_PROFILES.low;
}

// --- Packet Builder ---
function buildPacket() {
  const packet = Buffer.alloc(88, 0x00);

  // Magic & Size
  packet.writeUInt8(0xef, 0);
  packet.writeUInt8(0x02, 1);
  packet.writeUInt8(0x58, 2); // 88 bytes
  packet.writeUInt8(0x00, 3);

  // Magic 2
  packet.writeUInt8(0x02, 4);
  packet.writeUInt8(0x02, 5);
  packet.writeUInt8(0x00, 6);
  packet.writeUInt8(0x01, 7);

  // Dynamic Sequence Counter (LE)
  packet.writeUInt32LE(sequenceCounter, 12);

  // Magic 3
  packet.writeUInt8(0x14, 16);
  packet.writeUInt8(0x00, 17);
  packet.writeUInt8(0x66, 18);
  packet.writeUInt8(0x14, 19);

  // Controls with trim applied
  const finalRoll = clampByte(actual.roll + trimRoll);
  const finalPitch = clampByte(actual.pitch + trimPitch);
  const finalThrottle = clampByte(actual.throttle);
  const finalYaw = clampByte(actual.yaw + trimYaw);
  const controlMode = CONTROL_MODE_BYTE;

  packet.writeUInt8(finalRoll, 20);
  packet.writeUInt8(finalPitch, 21);
  packet.writeUInt8(finalThrottle, 22);
  packet.writeUInt8(finalYaw, 23);
  packet.writeUInt8(flags, 24);
  packet.writeUInt8(controlMode, 25);

  // Checksum: XOR of control bytes
  const checksum = finalRoll ^ finalPitch ^ finalThrottle ^ finalYaw ^ flags ^ controlMode;
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
  if (_udpSendFn) {
    _udpSendFn(buildPacket(), PORT, HOST);
    packetsSent++;
  }
}

// --- Nudge helper (backward compat for click commands) ---
function nudge(axis, value, durationMs = 550) {
  if (nudgeTimer) { clearTimeout(nudgeTimer); nudgeTimer = null; }
  resetDesired(); // clear any previous axis
  desired[axis] = value;
  lastCommandAt = Date.now();
  markControlActive(durationMs + 500);
  nudgeTimer = setTimeout(() => {
    resetDesired(); // reset all axes, not just the one
    nudgeTimer = null;
  }, durationMs);
}

// --- Run motion helper for rule engine ---
async function runMotion(axis, targetValue, durationMs, hoverMs = 700) {
  resetDesired();
  await cancellableSleep(300);
  desired[axis] = targetValue;
  markControlActive(durationMs + hoverMs + 1000);
  await cancellableSleep(durationMs);
  desired[axis] = NEUTRAL;
  await cancellableSleep(hoverMs);
}

// --- Stick macros (async, blocks caller) ---
async function macroBindInit() {
  if (isMacroRunning) return;
  isMacroRunning = true;
  try {
    console.log("[MACRO] bind_init: throttle high→low");
    resetSticks();
    markControlActive(5000);
    await sleep(500);
    desired.throttle = 255; actual.throttle = 255;
    await sleep(800);
    desired.throttle = NEUTRAL; actual.throttle = NEUTRAL;
    await sleep(300);
    desired.throttle = 0; actual.throttle = 0;
    await sleep(800);
    resetSticks();
    markControlActive(1000);
    await sleep(1000);
    console.log("[MACRO] bind_init complete");
  } finally { isMacroRunning = false; }
}

async function macroLevelCalibration() {
  if (isMacroRunning) return;
  isMacroRunning = true;
  try {
    console.log("[MACRO] level_calibration: stick macro per manual");
    resetSticks();
    markControlActive(6000);
    await sleep(700);
    desired.throttle = 0; actual.throttle = 0;
    desired.yaw = 0; actual.yaw = 0;
    desired.pitch = 0; actual.pitch = 0;
    desired.roll = 255; actual.roll = 255;
    flags = 0;
    await sleep(2500);
    resetSticks();
    markControlActive(2000);
    await sleep(1500);
    console.log("[MACRO] level_calibration complete");
  } finally { isMacroRunning = false; }
}

async function macroMotorIdleTest() {
  if (isMacroRunning) return;
  isMacroRunning = true;
  try {
    console.log("[MACRO] motor_idle_test: throttle 170 for 400ms");
    resetSticks();
    markControlActive(2000);
    desired.throttle = 170; actual.throttle = 170;
    await sleep(400);
    resetSticks();
    markControlActive(1000);
    console.log("[MACRO] motor_idle_test complete");
  } finally { isMacroRunning = false; }
}

// --- Command Handler ---
// Returns { status, message, ...extra } object
async function handleCommand(cmd, body) {
  lastCommandAt = Date.now();
  const p = getProfile();

  switch (cmd) {
    // === SAFETY ===
    case "arm":
    case "safety_arm": {
      gcsArmed = true;
      emergencyLocked = false;
      resetSticks();
      markControlActive(1000);
      return { status: "ok", message: "GCS safety enabled, no physical motor command sent" };
    }
    case "safety_disarm": {
      gcsArmed = false;
      isFlying = false;
      resetSticks();
      return { status: "ok", message: "GCS disarmed, all controls reset" };
    }

    // === MACROS ===
    case "bind_init": {
      if (isFlying || isExecutingSequence) return { status: "rejected", message: "Cannot bind while flying/executing" };
      if (isMacroRunning) return { status: "rejected", message: "Another macro is running" };
      macroBindInit();
      return { status: "ok", message: "Bind init macro started (throttle high→low)" };
    }
    case "level_calibration": {
      if (isFlying || isExecutingSequence) return { status: "rejected", message: "Cannot calibrate while flying/executing" };
      if (isMacroRunning) return { status: "rejected", message: "Another macro is running" };
      macroLevelCalibration();
      return { status: "ok", message: "Level calibration stick macro started" };
    }
    case "motor_idle_test": {
      if (!gcsArmed) return { status: "rejected", message: "GCS not armed" };
      if (isFlying || isExecutingSequence) return { status: "rejected", message: "Cannot test while flying/executing" };
      if (isMacroRunning) return { status: "rejected", message: "Another macro is running" };
      macroMotorIdleTest();
      return { status: "ok", message: "Motor idle test started (throttle 170 for 400ms)" };
    }

    // === FLIGHT COMMANDS ===
    case "takeoff": {
      if (!gcsArmed) return { status: "rejected", message: "GCS not armed. Send 'arm' first." };
      if (emergencyLocked) return { status: "rejected", message: "Emergency locked. Send 'arm' to reset." };
      resetSticks();
      pulseFlag(CMD_TAKEOFF, 2000);
      markControlActive(5000);
      isFlying = true;
      return { status: "ok", message: "Takeoff command sent" };
    }
    case "land": {
      resetSticks();
      pulseFlag(CMD_LAND, 2000);
      markControlActive(4000);
      setTimeout(() => { isFlying = false; }, 4000);
      return { status: "ok", message: "Land command sent" };
    }
    case "disarm": {
      // Legacy: treated as emergency now
      resetSticks();
      desired.throttle = 0; actual.throttle = 0;
      desired.yaw = 0; actual.yaw = 0;
      pulseFlag(CMD_EMERGENCY, 1500);
      markControlActive(2000);
      emergencyLocked = true;
      isFlying = false;
      if (isExecutingSequence) missionCancelRequested = true;
      return { status: "ok", message: "Disarm/emergency executed" };
    }
    case "emergency": {
      if (isExecutingSequence) missionCancelRequested = true;
      isMacroRunning = false; // cancel any running macro
      resetSticks();
      desired.throttle = 0; actual.throttle = 0;
      desired.yaw = 0; actual.yaw = 0;
      pulseFlag(CMD_EMERGENCY, 1500);
      markControlActive(2000);
      emergencyLocked = true;
      isFlying = false;
      isExecutingSequence = false;
      return { status: "ok", message: "EMERGENCY STOP — arm required to resume" };
    }

    // === PRESS-AND-HOLD START COMMANDS ===
    // Frontend resends every 300-500ms; keepalive 1200ms so watchdog
    // resets if frontend stops sending.
    case "pitch_forward_start": {
      const blk1 = movementBlocked(); if (blk1) return { status: "rejected", message: blk1 };
      desired.pitch = p.pitchForward; markControlActive(1200); break;
    }
    case "pitch_backward_start": {
      const blk2 = movementBlocked(); if (blk2) return { status: "rejected", message: blk2 };
      desired.pitch = p.pitchBackward; markControlActive(1200); break;
    }
    case "roll_left_start": {
      const blk3 = movementBlocked(); if (blk3) return { status: "rejected", message: blk3 };
      desired.roll = p.rollLeft; markControlActive(1200); break;
    }
    case "roll_right_start": {
      const blk4 = movementBlocked(); if (blk4) return { status: "rejected", message: blk4 };
      desired.roll = p.rollRight; markControlActive(1200); break;
    }
    case "yaw_left_start": {
      const blk5 = movementBlocked(); if (blk5) return { status: "rejected", message: blk5 };
      desired.yaw = p.yawLeft; markControlActive(1200); break;
    }
    case "yaw_right_start": {
      const blk6 = movementBlocked(); if (blk6) return { status: "rejected", message: blk6 };
      desired.yaw = p.yawRight; markControlActive(1200); break;
    }
    case "throttle_up_start": {
      const blk7 = movementBlocked(); if (blk7) return { status: "rejected", message: blk7 };
      desired.throttle = p.throttleUp; markControlActive(1200); break;
    }
    case "throttle_down_start": {
      const blk8 = movementBlocked(); if (blk8) return { status: "rejected", message: blk8 };
      desired.throttle = p.throttleDown; markControlActive(1200); break;
    }

    // === STOP MOTION ===
    case "stop_motion":
      resetDesired();
      markControlActive(1000);
      return { status: "ok", message: "Motion stopped, ramping to neutral" };

    // === LEGACY CLICK/NUDGE COMMANDS (backward compat, guarded) ===
    case "throttle_up": {
      const nb1 = movementBlocked(); if (nb1) return { status: "rejected", message: nb1 };
      nudge("throttle", p.throttleUp); break;
    }
    case "throttle_down": {
      const nb2 = movementBlocked(); if (nb2) return { status: "rejected", message: nb2 };
      nudge("throttle", p.throttleDown); break;
    }
    case "roll_left": {
      const nb3 = movementBlocked(); if (nb3) return { status: "rejected", message: nb3 };
      nudge("roll", p.rollLeft); break;
    }
    case "roll_right": {
      const nb4 = movementBlocked(); if (nb4) return { status: "rejected", message: nb4 };
      nudge("roll", p.rollRight); break;
    }
    case "pitch_forward": {
      const nb5 = movementBlocked(); if (nb5) return { status: "rejected", message: nb5 };
      nudge("pitch", p.pitchForward); break;
    }
    case "pitch_backward": {
      const nb6 = movementBlocked(); if (nb6) return { status: "rejected", message: nb6 };
      nudge("pitch", p.pitchBackward); break;
    }
    case "yaw_left": {
      const nb7 = movementBlocked(); if (nb7) return { status: "rejected", message: nb7 };
      nudge("yaw", p.yawLeft); break;
    }
    case "yaw_right": {
      const nb8 = movementBlocked(); if (nb8) return { status: "rejected", message: nb8 };
      nudge("yaw", p.yawRight); break;
    }

    // === JOYSTICK (continuous from frontend) ===
    case "joystick": {
      const jBlk = movementBlocked(); if (jBlk) return { status: "rejected", message: jBlk };
      const jRoll = parseAxis(body.roll);
      const jPitch = parseAxis(body.pitch);
      const jYaw = parseAxis(body.yaw);
      const jThrottle = parseAxis(body.throttle);
      desired.roll = jRoll; desired.pitch = jPitch;
      desired.yaw = jYaw; desired.throttle = jThrottle;
      markControlActive(500);
      return { status: "ok", command: cmd, roll: jRoll, pitch: jPitch, yaw: jYaw, throttle: jThrottle };
    }

    // === RESET ATTITUDE ===
    case "reset_attitude":
      resetDesired(); flags = 0;
      markControlActive(1000);
      return { status: "ok", message: "Attitude reset to neutral" };

    // === TRIM ===
    case "trim_forward":
      trimPitch = clampTrim(trimPitch + 2);
      return { status: "ok", message: `trimPitch = ${trimPitch}` };
    case "trim_back":
      trimPitch = clampTrim(trimPitch - 2);
      return { status: "ok", message: `trimPitch = ${trimPitch}` };
    case "trim_right":
      trimRoll = clampTrim(trimRoll + 2);
      return { status: "ok", message: `trimRoll = ${trimRoll}` };
    case "trim_left":
      trimRoll = clampTrim(trimRoll - 2);
      return { status: "ok", message: `trimRoll = ${trimRoll}` };
    case "trim_reset":
      trimRoll = 0; trimPitch = 0; trimYaw = 0;
      return { status: "ok", message: "All trims reset to 0" };

    // === SPEED PROFILE ===
    case "speed_low":
      speedProfile = "low";
      return { status: "ok", message: "Speed profile: low" };
    case "speed_medium":
      speedProfile = "medium";
      return { status: "ok", message: "Speed profile: medium" };
    case "speed_high":
      speedProfile = "high";
      return { status: "ok", message: "Speed profile: high" };

    default:
      return null; // unknown command
  }

  // For commands that used break (movement nudge/start):
  return {
    status: "ok", command: cmd,
    throttle: desired.throttle, flags,
    roll: desired.roll, pitch: desired.pitch, yaw: desired.yaw
  };
}

// --- Rule Engine Sequence Executor ---
async function executeSequence(sequence) {
  if (isExecutingSequence) throw new Error("Already executing a mission");
  if (!gcsArmed) throw new Error("GCS not armed");
  if (emergencyLocked) throw new Error("Emergency locked — arm first");

  isExecutingSequence = true;
  missionCancelRequested = false;

  console.log(`\n🚀 [Rule Engine] Starting ${sequence.length} steps...`);

  try {
    // --- TAKEOFF ---
    console.log("[Rule Engine] Phase 1: TAKEOFF");
    resetSticks();
    pulseFlag(CMD_TAKEOFF, 2000);
    isFlying = true;
    markControlActive(8000);
    await cancellableSleep(5000);

    // --- STABILIZE ---
    console.log("[Rule Engine] Phase 2: Stabilize hover");
    resetDesired();
    await cancellableSleep(1000);

    // --- EXECUTE STEPS ---
    const p = getProfile();
    for (let i = 0; i < sequence.length; i++) {
      if (missionCancelRequested) throw new Error("MISSION_CANCELLED");

      const step = sequence[i];
      let durationMs = step.durasi || 1000;
      if (step.satuan_waktu === 'detik') durationMs *= 1000;
      else if (step.satuan_waktu === 'menit') durationMs *= 60000;

      const action = (step.aksi || "").toLowerCase();
      console.log(`  Step ${i + 1}/${sequence.length}: "${action}" (${durationMs}ms)`);

      if (action.includes('mendarat') || action.includes('land')) {
        resetSticks();
        pulseFlag(CMD_LAND, 2000);
        markControlActive(5000);
        await cancellableSleep(4000);
        isFlying = false;
      }
      else if (action.includes('diam') || action.includes('hover')) {
        resetDesired();
        markControlActive(durationMs + 1000);
        await cancellableSleep(durationMs);
      }
      else if (action.includes('maju')) {
        await runMotion("pitch", p.pitchForward, durationMs);
      }
      else if (action.includes('mundur')) {
        await runMotion("pitch", p.pitchBackward, durationMs);
      }
      else if (action.includes('naik')) {
        await runMotion("throttle", p.throttleUp, durationMs);
      }
      else if (action.includes('turun')) {
        await runMotion("throttle", p.throttleDown, durationMs);
      }
      else if (action.includes('roll kanan') || action.includes('belok kanan')) {
        await runMotion("roll", p.rollRight, durationMs);
      }
      else if (action.includes('roll kiri') || action.includes('belok kiri')) {
        await runMotion("roll", p.rollLeft, durationMs);
      }
      else if (action.includes('rotasi kanan')) {
        await runMotion("yaw", p.yawRight, durationMs);
      }
      else if (action.includes('rotasi kiri')) {
        await runMotion("yaw", p.yawLeft, durationMs);
      }
      else if (action.includes('pitch atas')) {
        await runMotion("pitch", p.pitchBackward, durationMs);
      }
      else if (action.includes('pitch bawah')) {
        await runMotion("pitch", p.pitchForward, durationMs);
      }
      else {
        // Unknown action — hover for duration
        console.log(`  [Rule Engine] Unknown action "${action}", hovering...`);
        resetDesired();
        markControlActive(durationMs + 1000);
        await cancellableSleep(durationMs);
      }
    }

    // --- AUTO-LAND if last step wasn't land ---
    const lastAction = (sequence[sequence.length - 1]?.aksi || "").toLowerCase();
    if (!lastAction.includes('mendarat') && !lastAction.includes('land')) {
      console.log("[Rule Engine] Phase 4: Auto-LAND");
      resetSticks();
      pulseFlag(CMD_LAND, 2000);
      markControlActive(5000);
      await cancellableSleep(4000);
      isFlying = false;
    }

    console.log("✅ [Rule Engine] Mission complete.");
  } catch (err) {
    if (err.message === "MISSION_CANCELLED") {
      console.log("⚠️ [Rule Engine] Mission CANCELLED by emergency.");
    } else {
      console.error("[Rule Engine] Error:", err.message);
    }
  } finally {
    resetSticks();
    isExecutingSequence = false;
    missionCancelRequested = false;
  }
}

// --- Precondition check for sequence ---
function canExecuteSequence() {
  if (isExecutingSequence) return "Already executing a mission";
  if (!gcsArmed) return "GCS not armed";
  if (emergencyLocked) return "Emergency locked — arm first";
  return null;
}

// --- Status ---
function getStatus() {
  return {
    gcsArmed, emergencyLocked, isFlying, isExecutingSequence,
    isMacroRunning, speedProfile,
    desired: { ...desired }, actual: { ...actual },
    trimRoll, trimPitch, trimYaw,
    flags, controlIntervalMs: CONTROL_INTERVAL_MS,
    controlModeByte: CONTROL_MODE_BYTE,
    sequenceCounter, lastCommandAgeMs: Date.now() - lastCommandAt,
    packetsSent
  };
}

// --- Control Loop & Watchdog (started by init) ---
function init(udpSendFn) {
  _udpSendFn = udpSendFn;

  // === SINGLE CONTROL LOOP ===
  setInterval(() => {
    const now = Date.now();
    const hasDesiredInput = desired.roll !== NEUTRAL || desired.pitch !== NEUTRAL ||
      desired.throttle !== NEUTRAL || desired.yaw !== NEUTRAL;
    const hasActualInput = actual.roll !== NEUTRAL || actual.pitch !== NEUTRAL ||
      actual.throttle !== NEUTRAL || actual.yaw !== NEUTRAL;
    const shouldSend = gcsArmed || isFlying || isExecutingSequence ||
      hasDesiredInput || hasActualInput || flags !== 0 || now < controlActiveUntil;

    if (!shouldSend) return;

    const p = getProfile();
    actual.roll = slew(actual.roll, desired.roll, p.slewStep);
    actual.pitch = slew(actual.pitch, desired.pitch, p.slewStep);
    actual.throttle = slew(actual.throttle, desired.throttle, p.slewStep);
    actual.yaw = slew(actual.yaw, desired.yaw, p.slewStep);

    sendPacket();
  }, CONTROL_INTERVAL_MS);

  console.log(`⚡ Control Loop: ${Math.round(1000 / CONTROL_INTERVAL_MS)}Hz (${CONTROL_INTERVAL_MS}ms)`);
  console.log(`🎮 Control Mode Byte: 0x${CONTROL_MODE_BYTE.toString(16).padStart(2, '0')}`);

  // === WATCHDOG ===
  setInterval(() => {
    if (isExecutingSequence) return;
    const now = Date.now();
    const idle = now - lastCommandAt > 1000;
    const expired = now > controlActiveUntil;
    const hasDesired = desired.roll !== NEUTRAL || desired.pitch !== NEUTRAL ||
      desired.throttle !== NEUTRAL || desired.yaw !== NEUTRAL;
    const hasFlags = flags !== 0;

    if (idle && expired && (hasDesired || hasFlags)) {
      console.warn("[WATCHDOG] Idle >1s & keepalive expired, resetting desired");
      resetDesired();
      flags = 0;
      markControlActive(500);
    }
  }, 250);
}

module.exports = {
  init, handleCommand, executeSequence, canExecuteSequence,
  getStatus, buildPacket, parseByteEnv,
  HOST, PORT, CONTROL_INTERVAL_MS
};
