# D16 Drone Server - Version Comparison & Changes

## 📋 Overview

Dokumentasi perubahan `drone-server/index.js` dari berbagai commit. Mencatat fitur yang ditambahkan, dihapus, dan dimodifikasi.

---

## 🔄 Version Timeline

```
Commit 38fe8bce (Paling Awal)
    ↓ Packet 9 bytes, Flags: ARM/TAKEOFF/EMERGENCY
    ↓
Commit 7b8cf7d (D16 UDP Server)
    ↓ Packet 88 bytes, CMD_CALIBRATE ditambahkan
    ↓
Commit 51b2d8c (Drone Server + Video Proxy)
    ↓ WebSocket video, heartbeat 10Hz
    ↓
Commit 58aab61 (Fix Fitur Rule Engine) ← CURRENT
    ↓ Rule engine integration, auto-hover, soft landing
    ↓
Commit dd1f7c4 (Dead Reckoning CRUD)
    ↓ Full CRUD, drag-drop reorder
    ↓
Commit 9f62974 (Fix Bug)
    ↓ Bug fixes
    ↓
Commit 5c879de (Revert + Soft Landing)
    ↓ Restore dd1f7c4, add soft landing
    ↓
Commit CURRENT (Latest)
    ↓ Soft landing + auto-hover + TRIM system
```

---

## 📊 Commit 38fe8bce → 58aab61 (Major Changes)

### ✅ Added Features

| Feature | Commit | Details |
|---------|--------|---------|
| **88-byte Packet Format** | 7b8cf7d | Dari 9 bytes → 88 bytes dengan magic headers |
| **CMD_CALIBRATE (0x80)** | 7b8cf7d | Gyro calibration command |
| **Sequence Counter** | 7b8cf7d | Anti-replay security (Byte 12-15) |
| **XOR Checksum** | 7b8cf7d | Byte 36 checksum validation |
| **Video Proxy (WebSocket)** | 51b2d8c | FPV stream via ws://localhost:3003 |
| **10Hz Heartbeat** | 51b2d8c | UDP 100ms interval (dari 50Hz) |
| **TRIM System** | 58aab61 | TRIM_ROLL, TRIM_PITCH untuk drift compensation |
| **Rule Engine Integration** | 58aab61 | `/execute-sequence` endpoint |
| **Auto-Hover** | 58aab61 | 1 detik jeda antar langkah |
| **Soft Landing** | 58aab61 | Gradual throttle decrease (2.5s) |
| **Calibration Procedure** | 58aab61 | Fase 0 kalibrasi gyro otomatis |

### ❌ Removed Features

| Feature | Reason |
|---------|--------|
| **FLAG_ARM (1)** | Diganti dengan 0x40 |
| **FLAG_TAKEOFF_LANDING (2)** | Diganti dengan 0x01 (TAKEOFF) & 0x02 (LAND) |
| **FLAG_EMERGENCY (4)** | Tetap 0x04 |
| **9-byte Packet** | Diganti 88-byte format |
| **50Hz Heartbeat** | Diganti 10Hz (100ms) |
| **3-second Watchdog** | Diganti 5-second watchdog |

---

## 🔍 Detailed Comparison: 38fe8bce vs 58aab61

### Packet Structure

**Commit 38fe8bce (9 bytes):**
```
[0x03] [0x66] [Roll] [Pitch] [Throttle] [Yaw] [Flags] [Checksum] [0x99]
```

**Commit 58aab61 (88 bytes):**
```
[Magic Header 4B] [Magic 2 4B] [Reserved 4B] [Seq Counter 4B] [Magic 3 4B]
[Roll] [Pitch] [Throttle] [Yaw] [Flags] [Headless] [Reserved 10B]
[Checksum] [Padding 51B]
```

### Command Flags

**Commit 38fe8bce:**
```javascript
const FLAG_ARM = 1;
const FLAG_TAKEOFF_LANDING = 2;
const FLAG_EMERGENCY = 4;
```

**Commit 58aab61:**
```javascript
const CMD_ARM = 0x40;
const CMD_TAKEOFF = 0x01;
const CMD_LAND = 0x02;
const CMD_EMERGENCY = 0x04;
const CMD_CALIBRATE = 0x80;
```

### Heartbeat Frequency

**Commit 38fe8bce:**
```javascript
const INTERVAL = 20; // 50Hz
setInterval(sendPacket, INTERVAL);
```

**Commit 58aab61:**
```javascript
const INTERVAL = 100; // 10Hz
setInterval(() => {
  // Build packet with current values
  // Send UDP
}, INTERVAL);
```

### Watchdog Timeout

**Commit 38fe8bce:**
```javascript
const idle = Date.now() - lastCommandAt > 3000; // 3 seconds
```

**Commit 58aab61:**
```javascript
const idle = Date.now() - lastCommandAt > 5000; // 5 seconds
```

### TRIM System

**Commit 38fe8bce:**
```javascript
// No TRIM system
```

**Commit 58aab61:**
```javascript
let TRIM_ROLL  = -5;  // Drift compensation
let TRIM_PITCH =  8;  // Drift compensation

// Applied in buildPacket:
packet.writeUInt8(b(roll     + TRIM_ROLL),  20);
packet.writeUInt8(b(pitch    + TRIM_PITCH), 21);
```

### Rule Engine

**Commit 38fe8bce:**
```javascript
// No rule engine
```

**Commit 58aab61:**
```javascript
app.post('/execute-sequence', async (req, res) => {
  // Fase 0: Kalibrasi
  // Fase 1: ARM
  // Fase 2: TAKEOFF
  // Fase 3: Eksekusi instruksi
  // Fase 4: Auto-LAND
});
```

### Soft Landing

**Commit 38fe8bce:**
```javascript
case "land":
  roll = pitch = yaw = 128;
  pulseFlag(FLAG_TAKEOFF_LANDING);
  break;
```

**Commit 58aab61:**
```javascript
async function softLand() {
  // Turunkan throttle 128 → 50 (2.5 detik)
  // Kirim CMD_LAND
  // Tunggu 3 detik
}
```

---

## 📈 Feature Progression

### Packet Evolution
```
38fe8bce: 9 bytes (minimal)
    ↓
7b8cf7d: 88 bytes (full protocol)
    ↓
51b2d8c: 88 bytes + video proxy
    ↓
58aab61: 88 bytes + rule engine + soft landing
```

### Security Evolution
```
38fe8bce: No security
    ↓
7b8cf7d: Checksum only
    ↓
51b2d8c: Checksum + Sequence counter
    ↓
58aab61: Checksum + Sequence counter + Watchdog
```

### Control Evolution
```
38fe8bce: Manual joystick only
    ↓
7b8cf7d: Manual + calibrate
    ↓
51b2d8c: Manual + calibrate + video
    ↓
58aab61: Manual + calibrate + video + rule engine
```

---

## 🎯 Current Version (58aab61) Features

### ✅ Working
- ✅ 88-byte UDP packet format
- ✅ Sequence counter (anti-replay)
- ✅ XOR checksum validation
- ✅ 10Hz heartbeat (100ms)
- ✅ 5-second watchdog
- ✅ TRIM system (drift compensation)
- ✅ Manual joystick control
- ✅ ARM/TAKEOFF/LAND commands
- ✅ Calibrate command (0x80)
- ✅ Rule engine with sequences
- ✅ Auto-hover between steps
- ✅ Soft landing (gradual throttle)
- ✅ WebSocket video proxy
- ✅ Emergency stop

### ⚠️ Known Issues
- ⚠️ Calibrate flag (0x80) - Candidate, not verified for D16
- ⚠️ Drift compensation - TRIM values need tuning
- ⚠️ Video stream - Intermittent, needs optimization

---

## 📝 Backup Files

| File | Purpose | Date |
|------|---------|------|
| `drone-server/index.js.backup` | Backup dari commit dd1f7c4 | Previous |
| `drone-server/index.js.current-backup` | Backup sebelum revert ke 58aab61 | Now |
| `drone-server/index.js` | Current version (58aab61) | Now |

---

## 🔄 How to Switch Versions

### Revert to 38fe8bce (Original)
```bash
git checkout 38fe8bce -- drone-server/index.js
```

### Revert to 7b8cf7d (88-byte packet)
```bash
git checkout 7b8cf7d -- drone-server/index.js
```

### Revert to 51b2d8c (Video proxy)
```bash
git checkout 51b2d8c -- drone-server/index.js
```

### Revert to 58aab61 (Rule engine)
```bash
git checkout 58aab61 -- drone-server/index.js
```

### Revert to dd1f7c4 (Full CRUD)
```bash
git checkout dd1f7c4 -- drone-server/index.js
```

### Revert to 9f62974 (Bug fixes)
```bash
git checkout 9f62974 -- drone-server/index.js
```

### Revert to 5c879de (Soft landing)
```bash
git checkout 5c879de -- drone-server/index.js
```

---

## 📊 Code Metrics

| Metric | 38fe8bce | 58aab61 | Growth |
|--------|----------|---------|--------|
| Lines of Code | 199 | ~600 | 3x |
| Packet Size | 9 bytes | 88 bytes | 9.8x |
| Heartbeat Freq | 50Hz | 10Hz | 5x slower |
| Watchdog Timeout | 3s | 5s | 1.67x |
| Commands | 10 | 15+ | 1.5x |
| Features | 1 (joystick) | 8+ | 8x |

---

## 🎓 Key Learnings

1. **Protocol Evolution** - Dari simple 9-byte ke complex 88-byte format
2. **Security** - Sequence counter + checksum untuk anti-replay
3. **Stability** - Watchdog + heartbeat untuk failsafe
4. **Automation** - Rule engine untuk autonomous missions
5. **Smoothness** - Soft landing + auto-hover untuk better UX
6. **Compensation** - TRIM system untuk hardware imbalance

---

## 📚 References

- **Commit 38fe8bce**: Original boilerplate
- **Commit 7b8cf7d**: D16 protocol reverse engineering
- **Commit 51b2d8c**: Video proxy + optimization
- **Commit 58aab61**: Rule engine integration
- **Commit dd1f7c4**: Full CRUD + reordering
- **Commit 9f62974**: Bug fixes
- **Commit 5c879de**: Soft landing + auto-hover

