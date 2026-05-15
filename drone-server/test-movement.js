// ============================================================
// D16 Movement Controller — Verification Tests
// Uses node:assert/strict (no external deps needed)
// ============================================================
const assert = require("node:assert/strict");
const mc = require("./d16MovementController");

let sentPackets = [];
mc.init((packet, port, host) => {
  sentPackets.push({ packet, port, host });
});

let passed = 0;
let failed = 0;

function test(name, fn) {
  s
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err) {
    console.log(`  ❌ ${name}`);
    console.log(`     ${err.message}`);
    failed++;
  }
}

async function asyncTest(name, fn) {
  try {
    await fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err) {
    console.log(`  ❌ ${name}`);
    console.log(`     ${err.message}`);
    failed++;
  }
}

console.log("\n=== D16 Movement Controller Tests ===\n");

// --- Packet builder ---
console.log("Packet Builder:");

test("buildPacket returns 88 bytes", () => {
  const pkt = mc.buildPacket();
  assert.equal(pkt.length, 88);
});

test("Magic bytes are ef 02 58 00", () => {
  const pkt = mc.buildPacket();
  assert.equal(pkt[0], 0xef);
  assert.equal(pkt[1], 0x02);
  assert.equal(pkt[2], 0x58);
  assert.equal(pkt[3], 0x00);
});

test("Default controls are neutral (128), flags=0, controlMode=0x02", () => {
  const pkt = mc.buildPacket();
  assert.equal(pkt[20], 0x80, "roll should be 128");
  assert.equal(pkt[21], 0x80, "pitch should be 128");
  assert.equal(pkt[22], 0x80, "throttle should be 128");
  assert.equal(pkt[23], 0x80, "yaw should be 128");
  assert.equal(pkt[24], 0x00, "flags should be 0");
  assert.equal(pkt[25], 0x02, "controlMode should be 0x02");
});

test("Checksum byte[36] = XOR of bytes 20-25", () => {
  const pkt = mc.buildPacket();
  const expected = pkt[20] ^ pkt[21] ^ pkt[22] ^ pkt[23] ^ pkt[24] ^ pkt[25];
  assert.equal(pkt[36], expected);
});

test("Tail bytes are correct", () => {
  const pkt = mc.buildPacket();
  assert.equal(pkt[82], 0x32);
  assert.equal(pkt[83], 0x4b);
  assert.equal(pkt[84], 0x14);
  assert.equal(pkt[85], 0x2d);
});

// --- parseByteEnv ---
console.log("\nparseByteEnv:");

test("parseByteEnv('0x02') returns 2", () => {
  assert.equal(mc.parseByteEnv("0x02", 0), 2);
});

test("parseByteEnv('0xFF') returns 255", () => {
  assert.equal(mc.parseByteEnv("0xFF", 0), 255);
});

test("parseByteEnv('2') returns 2 (decimal)", () => {
  assert.equal(mc.parseByteEnv("2", 0), 2);
});

test("parseByteEnv('') returns fallback", () => {
  assert.equal(mc.parseByteEnv("", 99), 99);
});

test("parseByteEnv(undefined) returns fallback", () => {
  assert.equal(mc.parseByteEnv(undefined, 42), 42);
});

test("parseByteEnv('garbage') returns fallback", () => {
  assert.equal(mc.parseByteEnv("garbage", 7), 7);
});

// --- Movement blocked before arm ---
console.log("\nMovement Guards:");

(async () => {
  // Ensure disarmed state
  await mc.handleCommand("safety_disarm", {});

  await asyncTest("Movement rejected before arm (throttle_up)", async () => {
    const r = await mc.handleCommand("throttle_up", {});
    assert.equal(r.status, "rejected");
    assert.ok(r.message.includes("not armed"), `msg: ${r.message}`);
  });

  await asyncTest("Movement rejected before arm (pitch_forward_start)", async () => {
    const r = await mc.handleCommand("pitch_forward_start", {});
    assert.equal(r.status, "rejected");
  });

  await asyncTest("Joystick rejected before arm", async () => {
    const r = await mc.handleCommand("joystick", { roll: 100, pitch: 100, yaw: 100, throttle: 100 });
    assert.equal(r.status, "rejected");
  });

  // --- Arm, then test movement works ---
  await mc.handleCommand("arm", {});

  await asyncTest("arm returns ok with safety message", async () => {
    const r = await mc.handleCommand("arm", {});
    assert.equal(r.status, "ok");
    assert.ok(r.message.includes("safety"), `msg: ${r.message}`);
  });

  await asyncTest("Movement allowed after arm (throttle_up)", async () => {
    const r = await mc.handleCommand("throttle_up", {});
    assert.equal(r.status, "ok");
  });

  // --- Emergency lock ---
  console.log("\nEmergency Lock:");

  await asyncTest("Emergency locks movement", async () => {
    await mc.handleCommand("emergency", {});
    const r = await mc.handleCommand("pitch_forward", {});
    assert.equal(r.status, "rejected");
    assert.ok(r.message.includes("Emergency"), `msg: ${r.message}`);
  });

  await asyncTest("Re-arm clears emergency lock", async () => {
    await mc.handleCommand("arm", {});
    const r = await mc.handleCommand("pitch_forward", {});
    assert.equal(r.status, "ok");
  });

  // --- Joystick parseAxis (0 is valid) ---
  console.log("\nJoystick parseAxis:");

  await asyncTest("Joystick accepts 0 as valid value (not NEUTRAL)", async () => {
    await mc.handleCommand("arm", {});
    const r = await mc.handleCommand("joystick", { roll: 0, pitch: 0, yaw: 0, throttle: 0 });
    assert.equal(r.status, "ok");
    assert.equal(r.roll, 0, "roll should be 0, not 128");
    assert.equal(r.pitch, 0);
    assert.equal(r.yaw, 0);
    assert.equal(r.throttle, 0);
  });

  await asyncTest("Joystick NaN falls back to NEUTRAL", async () => {
    const r = await mc.handleCommand("joystick", { roll: "abc", pitch: undefined });
    assert.equal(r.status, "ok");
    assert.equal(r.roll, 128, "NaN roll should be NEUTRAL");
    assert.equal(r.pitch, 128, "undefined pitch should be NEUTRAL");
  });

  // --- Nudge resets previous axis ---
  console.log("\nNudge Behavior:");

  await asyncTest("Nudge resets previous axis before setting new one", async () => {
    await mc.handleCommand("arm", {});
    // First nudge sets roll
    await mc.handleCommand("roll_right", {});
    const s1 = mc.getStatus();
    assert.notEqual(s1.desired.roll, 128, "roll should be set");

    // Second nudge on pitch should reset roll
    await mc.handleCommand("pitch_forward", {});
    const s2 = mc.getStatus();
    assert.equal(s2.desired.roll, 128, "roll should be reset when pitch nudge fires");
    assert.notEqual(s2.desired.pitch, 128, "pitch should be set");
  });

  // --- canExecuteSequence ---
  console.log("\nSequence Preconditions:");

  await asyncTest("canExecuteSequence rejects when disarmed", async () => {
    await mc.handleCommand("safety_disarm", {});
    const err = mc.canExecuteSequence();
    assert.ok(err !== null, "should return error string");
    assert.ok(err.includes("not armed"));
  });

  await asyncTest("canExecuteSequence rejects when emergency locked", async () => {
    await mc.handleCommand("arm", {});
    await mc.handleCommand("emergency", {});
    const err = mc.canExecuteSequence();
    assert.ok(err !== null);
    assert.ok(err.includes("Emergency"));
  });

  await asyncTest("canExecuteSequence returns null when ready", async () => {
    await mc.handleCommand("arm", {});
    const err = mc.canExecuteSequence();
    assert.equal(err, null);
  });

  // --- Status includes isMacroRunning ---
  console.log("\nStatus:");

  test("getStatus includes isMacroRunning", () => {
    const s = mc.getStatus();
    assert.ok("isMacroRunning" in s, "isMacroRunning missing from status");
    assert.equal(typeof s.isMacroRunning, "boolean");
  });

  test("getStatus has all required fields", () => {
    const s = mc.getStatus();
    const requiredFields = [
      "gcsArmed", "emergencyLocked", "isFlying", "isExecutingSequence",
      "isMacroRunning", "speedProfile", "desired", "actual",
      "trimRoll", "trimPitch", "trimYaw", "flags",
      "controlIntervalMs", "controlModeByte", "sequenceCounter",
      "lastCommandAgeMs", "packetsSent"
    ];
    for (const f of requiredFields) {
      assert.ok(f in s, `Missing field: ${f}`);
    }
  });

  test("Unknown command returns null", () => {
    // handleCommand is async but unknown returns immediately
  });

  await asyncTest("Unknown command returns null", async () => {
    const r = await mc.handleCommand("xyzzy_unknown_cmd", {});
    assert.equal(r, null);
  });

  // --- Summary ---
  console.log(`\n${"=".repeat(40)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    console.log("❌ SOME TESTS FAILED");
    process.exit(1);
  } else {
    console.log("🎉 ALL TESTS PASSED");
    process.exit(0);
  }
})();
