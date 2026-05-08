# D16 Mini Drone - Panduan Diagnosis Masalah Stabilitas

## Ringkasan Eksekutif

Drone D16 yang tidak stabil (drift/melayang ke arah tertentu) bisa disebabkan oleh:
1. **Hardware Issues** (Motor, Propeller, IMU fisik rusak)
2. **Software Issues** (Kalibrasi IMU/Compass, Trim settings, Firmware)
3. **Environmental Issues** (Gangguan elektromagnetik, GPS signal lemah)

Dokumen ini menjelaskan cara mengidentifikasi root cause dan melakukan pengujian sistematis.

---

## BAGIAN 1: IDENTIFIKASI AWAL (5 Menit)

### 1.1 Observasi Perilaku Drone

Lakukan test takeoff di area terbuka, datar, dan bebas gangguan:

```
Test Sequence:
1. Power on drone → tunggu 5-10 detik (auto-calibration)
2. Takeoff manual (GCS atau remote)
3. Hover di ketinggian 1-2 meter selama 30 detik
4. Catat arah drift (jika ada)
```

**Gejala yang Mungkin Terjadi:**

| Gejala | Indikasi Awal |
|--------|---------------|
| Drift ke satu arah konsisten | IMU/Trim issue atau Motor imbalance |
| Drift berubah-ubah arah | Gangguan elektromagnetik atau GPS signal lemah |
| Takeoff miring/flip | Motor failure atau Propeller rusak |
| Hover stabil tapi lambat respond | Firmware issue atau Sensor lag |
| Drift semakin parah seiring waktu | Overheating atau Battery voltage drop |

---

## BAGIAN 2: HARDWARE DIAGNOSTICS (10-15 Menit)

### 2.1 Inspeksi Motor

**Prosedur:**
```
1. Power OFF drone
2. Pegang drone di satu tangan
3. Coba putar setiap propeller dengan jari (tanpa power)
   - Seharusnya berputar smooth tanpa hambatan
   - Jika ada resistance → motor mungkin rusak

4. Power ON drone (tanpa propeller)
5. Accelerate throttle perlahan
   - Dengarkan suara motor
   - Seharusnya 4 motor berbunyi sama
   - Jika ada motor yang berbunyi berbeda → motor rusak
```

**Hasil Interpretasi:**
- ✅ Semua motor smooth & suara sama → Motor OK
- ❌ Ada motor yang tersendat/berbunyi aneh → **MOTOR RUSAK** (ganti motor)
- ⚠️ Ada motor yang lebih kuat → **MOTOR IMBALANCE** (kalibrasi ESC atau ganti motor)

### 2.2 Inspeksi Propeller

**Prosedur:**
```
1. Power OFF drone
2. Lepas semua propeller
3. Periksa setiap propeller:
   - Lihat dari samping → seharusnya lurus
   - Jalankan jari di tepi → cek ada crack/bend
   - Bandingkan dengan propeller lain → seharusnya identik
```

**Hasil Interpretasi:**
- ✅ Semua propeller lurus & identik → Propeller OK
- ❌ Ada propeller yang bent/crack → **PROPELLER RUSAK** (ganti set propeller baru)
- ⚠️ Propeller kotor/ada debu → **BERSIHKAN** propeller

### 2.3 Inspeksi Fisik Drone

**Prosedur:**
```
1. Cek frame drone:
   - Ada crack atau bend?
   - Semua screw tight?
   
2. Cek sensor area (di bawah drone):
   - Ada debu/kotoran di sensor?
   - Ada kerusakan fisik?
   
3. Cek battery:
   - Voltage normal? (gunakan multimeter)
   - Tidak bengkak/rusak?
```

**Hasil Interpretasi:**
- ✅ Semua OK → Lanjut ke Software Diagnostics
- ❌ Ada kerusakan fisik → **HARDWARE RUSAK** (perlu repair/ganti)

---

## BAGIAN 3: SOFTWARE DIAGNOSTICS (15-20 Menit)

### 3.1 IMU Calibration Check

**Prosedur:**
```
1. Pilih lokasi:
   - Area terbuka, datar, bebas gangguan
   - Jauh dari power lines, tower, elektronik
   - Permukaan rata (bukan rumput/pasir)

2. Power ON drone
3. Tunggu 5-10 detik (auto-calibration)
4. Takeoff dan hover 30 detik
5. Catat drift direction & magnitude

6. Jika masih drift:
   - Trigger manual IMU calibration via GCS
   - Atau: Power OFF → tunggu 30 detik → Power ON
```

**Hasil Interpretasi:**
- ✅ Drift hilang setelah calibration → **IMU CALIBRATION ISSUE** (FIXED)
- ❌ Drift masih ada → Lanjut ke Trim Adjustment

### 3.2 Trim Adjustment

**Prosedur (untuk D16 dengan trim system):**
```
1. Takeoff drone ke ketinggian 1-2 meter
2. Hover dan catat arah drift:
   - Drift ke kanan? → Trim ke KANAN
   - Drift ke depan? → Trim ke DEPAN
   - Drift ke belakang? → Trim ke BELAKANG
   - Drift ke kiri? → Trim ke KIRI

3. Adjust trim sedikit demi sedikit (1-2 step)
4. Hover lagi 30 detik
5. Ulangi sampai hover stabil

6. Catat final trim values untuk reference
```

**Hasil Interpretasi:**
- ✅ Hover stabil setelah trim → **TRIM ADJUSTMENT ISSUE** (FIXED)
- ❌ Trim tidak membantu → Lanjut ke Environmental Check

### 3.3 Firmware Check

**Prosedur:**
```
1. Cek firmware version di GCS atau app
2. Bandingkan dengan latest version di:
   - Manufacturer website
   - GitHub repository
   - Official documentation

3. Jika outdated:
   - Update firmware ke latest version
   - Power OFF → Power ON
   - Repeat Hardware + Software Diagnostics
```

**Hasil Interpretasi:**
- ✅ Firmware updated & drift hilang → **FIRMWARE ISSUE** (FIXED)
- ❌ Drift masih ada → Lanjut ke Environmental Check

---

## BAGIAN 4: ENVIRONMENTAL DIAGNOSTICS (10 Menit)

### 4.1 Electromagnetic Interference Check

**Prosedur:**
```
1. Identifikasi sumber EM interference:
   - Power lines (tegangan tinggi)
   - Telephone towers
   - WiFi router
   - Elektronik besar (AC, microwave)

2. Pindah ke lokasi berbeda:
   - Minimal 50 meter dari sumber EM
   - Area terbuka, datar, bebas gangguan

3. Repeat test takeoff & hover
4. Catat apakah drift berkurang/hilang
```

**Hasil Interpretasi:**
- ✅ Drift hilang di lokasi baru → **EM INTERFERENCE** (FIXED - gunakan lokasi berbeda)
- ❌ Drift masih ada → Lanjut ke GPS Signal Check

### 4.2 GPS Signal Check (jika drone punya GPS)

**Prosedur:**
```
1. Power ON drone di area terbuka
2. Tunggu sampai minimal 8 satellites connected
3. Catat GPS signal strength
4. Takeoff dan hover
5. Catat apakah stabilitas lebih baik
```

**Hasil Interpretasi:**
- ✅ Stabilitas lebih baik dengan GPS → **GPS SIGNAL ISSUE** (FIXED - tunggu lebih lama)
- ❌ Masih drift → Lanjut ke Advanced Diagnostics

---

## BAGIAN 5: ADVANCED DIAGNOSTICS (Untuk Kasus Kompleks)

### 5.1 Telemetry Data Analysis

**Prosedur:**
```
1. Catat telemetry data saat drone hover:
   - Roll angle (seharusnya ~0°)
   - Pitch angle (seharusnya ~0°)
   - Yaw angle (bisa berubah)
   - Throttle value (seharusnya ~50% untuk hover)
   - Motor PWM values (seharusnya balanced)

2. Analisis:
   - Jika Roll/Pitch tidak 0° → IMU offset
   - Jika Motor PWM tidak balanced → Motor imbalance
   - Jika Throttle > 60% → Drone overweight atau motor lemah
```

### 5.2 Slow Motion Video Analysis

**Prosedur:**
```
1. Record video drone hover dengan slow motion (120fps)
2. Analisis frame-by-frame:
   - Apakah drone bergerak smooth atau jerky?
   - Apakah ada oscillation (getaran)?
   - Apakah propeller balance?

3. Hasil:
   - Smooth movement → Software issue
   - Jerky/oscillation → Hardware issue (motor/propeller)
```

---

## BAGIAN 6: DIAGNOSIS FLOWCHART

```
START: Drone Drift Issue
│
├─→ [HARDWARE CHECK]
│   ├─→ Motor test → Motor rusak? → REPLACE MOTOR
│   ├─→ Propeller check → Propeller rusak? → REPLACE PROPELLER
│   └─→ Physical inspection → Kerusakan fisik? → REPAIR/REPLACE
│
├─→ [SOFTWARE CHECK]
│   ├─→ IMU Calibration → Drift hilang? → DONE ✅
│   ├─→ Trim Adjustment → Hover stabil? → DONE ✅
│   └─→ Firmware Update → Drift hilang? → DONE ✅
│
├─→ [ENVIRONMENTAL CHECK]
│   ├─→ EM Interference → Drift hilang di lokasi baru? → DONE ✅
│   └─→ GPS Signal → Stabilitas lebih baik? → DONE ✅
│
└─→ [ADVANCED CHECK]
    ├─→ Telemetry Analysis → Identifikasi root cause
    └─→ Video Analysis → Confirm hardware vs software
```

---

## BAGIAN 7: TESTING PROTOCOL UNTUK D16

### 7.1 Standardized Test Sequence

**Setup:**
- Lokasi: Area terbuka, datar, 50m dari EM source
- Cuaca: Angin < 5 km/h, tidak hujan
- Drone: Battery penuh, propeller bersih
- Duration: 5 menit per test

**Test Steps:**
```
Test 1: Auto-Calibration Test
├─ Power ON drone
├─ Tunggu 5-10 detik
├─ Takeoff & hover 30 detik
├─ Catat drift direction & magnitude
└─ Result: [PASS/FAIL]

Test 2: Manual Trim Test
├─ Adjust trim sesuai drift direction
├─ Takeoff & hover 30 detik
├─ Catat apakah drift berkurang
└─ Result: [PASS/FAIL]

Test 3: Repeated Takeoff Test
├─ Lakukan 5x takeoff & hover
├─ Catat consistency drift
├─ Jika konsisten → software issue
├─ Jika random → hardware/environmental issue
└─ Result: [PASS/FAIL]

Test 4: Environmental Test
├─ Pindah ke lokasi berbeda
├─ Repeat Test 1
├─ Bandingkan hasil
└─ Result: [PASS/FAIL]
```

### 7.2 Acceptance Criteria

**Drone dianggap STABIL jika:**
- ✅ Hover drift < 0.5 meter dalam 30 detik
- ✅ Drift direction konsisten (bukan random)
- ✅ Trim adjustment dapat mengurangi drift
- ✅ Tidak ada oscillation atau jerky movement
- ✅ Motor PWM balanced (perbedaan < 5%)

**Drone dianggap UNSTABLE jika:**
- ❌ Hover drift > 1 meter dalam 30 detik
- ❌ Drift direction random/unpredictable
- ❌ Trim adjustment tidak membantu
- ❌ Ada oscillation atau jerky movement
- ❌ Motor PWM tidak balanced (perbedaan > 10%)

---

## BAGIAN 8: TROUBLESHOOTING MATRIX

| Gejala | Penyebab Kemungkinan | Solusi |
|--------|---------------------|--------|
| Drift ke satu arah konsisten | IMU offset, Trim needed | Calibrate IMU, Adjust trim |
| Drift berubah-ubah arah | EM interference, GPS signal | Pindah lokasi, Tunggu GPS lock |
| Takeoff miring/flip | Motor failure, Propeller rusak | Ganti motor/propeller |
| Hover stabil tapi lambat respond | Firmware lag, Sensor delay | Update firmware, Check sensor |
| Drift semakin parah seiring waktu | Overheating, Battery voltage drop | Tunggu cool down, Charge battery |
| Oscillation/getaran | Motor imbalance, Propeller bent | Balance motor, Ganti propeller |
| Tidak bisa hover (jatuh) | Motor failure, Propeller rusak | Ganti motor/propeller |
| Hover OK tapi tidak bisa maju | Pitch trim issue, Motor imbalance | Adjust pitch trim, Balance motor |

---

## BAGIAN 9: REKOMENDASI UNTUK D16

### 9.1 Preventive Maintenance

**Setiap Kali Sebelum Terbang:**
- [ ] Cek propeller (lurus, tidak ada crack)
- [ ] Cek motor (smooth rotation, suara normal)
- [ ] Cek battery (voltage normal, tidak bengkak)
- [ ] Cek frame (tidak ada crack/bend)
- [ ] Cek sensor area (bersih dari debu)

**Setiap Minggu (jika sering terbang):**
- [ ] Bersihkan propeller & motor
- [ ] Cek screw (semua tight)
- [ ] Cek battery connector (tidak loose)

**Setiap Bulan:**
- [ ] Calibrate IMU (di lokasi berbeda)
- [ ] Check firmware version
- [ ] Inspect frame untuk micro-cracks

### 9.2 Best Practices

1. **Selalu calibrate IMU setelah:**
   - Drone baru dibeli
   - Setelah crash/jatuh
   - Setelah perjalanan jauh (> 50 km)
   - Setelah firmware update

2. **Selalu trim di lokasi yang sama:**
   - Trim values bisa berbeda di lokasi berbeda
   - Catat trim values untuk reference

3. **Hindari EM interference:**
   - Jangan terbang dekat power lines
   - Jangan terbang dekat tower/antenna
   - Jangan terbang dekat WiFi router

4. **Tunggu GPS lock sebelum terbang:**
   - Minimal 8 satellites
   - Ideal 10+ satellites
   - Tunggu 1-2 menit setelah power ON

---

## BAGIAN 10: REFERENCE - D16 SPECIFICATIONS

**D16 Mini Drone Specs:**
- Weight: < 100g
- Motor: 4x brushless motor
- Propeller: 4x fixed propeller
- Battery: LiPo (capacity varies)
- Flight time: 10-15 menit
- Max speed: 30-40 km/h
- Sensors: IMU, Barometer, Optical flow (optional)
- Control: WiFi (2.4 GHz)

**Known Issues:**
- Drift ke kanan (4 o'clock position) - common pada unit tertentu
- Overheating setelah 15 menit terbang
- Battery voltage drop cepat
- IMU calibration perlu sering dilakukan

---

## KESIMPULAN

Untuk mendiagnosis masalah stabilitas D16:

1. **Mulai dari Hardware** (motor, propeller, frame)
2. **Lanjut ke Software** (IMU calibration, trim, firmware)
3. **Cek Environmental** (EM interference, GPS signal)
4. **Advanced Analysis** (telemetry, video) jika masih belum ketemu

**Waktu total diagnosis: 30-45 menit**

Dengan mengikuti protokol ini, Anda bisa mengidentifikasi apakah masalah berasal dari software atau hardware dengan akurasi tinggi.

---

**Last Updated:** May 8, 2026
**Author:** Kiro Development Team
**Status:** Complete
