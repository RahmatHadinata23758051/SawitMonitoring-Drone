# Agent Skill: Analisis Protokol Drone D16

Skill ini membekali Agen AI baru untuk memahami, memelihara, dan menguji protokol biner tertutup (*proprietary UDP protocol*) milik drone mainan D16 yang diimplementasikan pada [drone-server/index.js](file:///c:/Users/user/Nata/Project/Sawit-Website/monitoring-sawit-web-main/monitoring-sawit-web-main/drone-server/index.js).

---

## 1. Konfigurasi Jaringan & Handshake

Drone D16 bertindak sebagai WiFi Access Point dengan parameter statis:
- **IP Target Drone**: `192.168.169.1`
- **Port Target**: `8800`

### Protokol Handshake Video & Kontrol (Auto-Binding)
Saat pertama kali dihubungkan, drone tidak akan merespons sebelum urutan *Throttle Sweep* dilakukan. Agen wajib mempertahankan alur `runBindSequence()` berikut saat inisiasi koneksi atau sebelum perintah *Takeoff*:
1. **Throttle Neutral**: Kirim nilai throttle `128` (Stick tengah) selama 500ms.
2. **Throttle UP**: Kirim nilai throttle `255` (Stick maksimal) selama 800ms.
3. **Throttle Neutral**: Kembalikan ke `128` selama 300ms.
4. **Throttle DOWN**: Kirim nilai throttle `0` (Stick minimal) selama 800ms.
5. **Throttle Neutral**: Kembalikan ke `128` selama 1000ms. Drone terikat (*paired*) dan motor siap di-ARM.

---

## 2. Struktur Paket Kontrol (88 Byte)

Sistem mengirimkan paket data biner 88-byte kontinu ke drone dengan format sebagai berikut:

```text
Byte Index  |  Tipe/Nilai  |  Keterangan
-----------------------------------------------------------
0           |  0xef        |  Magic Header 1
1           |  0x02        |  Magic Header 2
2           |  0x58        |  Magic Header 3 (Panjang Paket 88-byte)
3           |  0x00        |  Magic Header 4
4 - 7       |  0x02,0x02,0x00,0x01 | Magic Sub-headers
12 - 15     |  UInt32LE    |  Sequence Counter (terus bertambah)
16 - 19     |  0x14,0x00,0x66,0x14 | Konfigurasi transmisi statis
20          |  UInt8       |  Roll (0 = Kiri, 128 = Netral, 255 = Kanan)
21          |  UInt8       |  Pitch (0 = Mundur, 128 = Netral, 255 = Maju)
22          |  UInt8       |  Throttle (0 = Turun, 128 = Netral, 255 = Naik)
23          |  UInt8       |  Yaw (0 = Rotasi Kiri, 128 = Netral, 255 = Kanan)
24          |  UInt8       |  Command Flags (0x01: Takeoff, 0x02: Land, 0x04: Emergency, 0x40: Arm/Unlock Motor, 0x80: Gyro Calibrate)
25          |  0x00        |  Headless Mode Flag (0x00: Off, 0x02: On)
36          |  UInt8       |  Checksum XOR (roll ^ pitch ^ throttle ^ yaw ^ flags ^ headless)
37          |  0x99        |  Static Suffix
82 - 85     |  0x32,0x4b,0x14,0x2d | Tail bytes akhir paket
```

---

## 3. Aturan Heartbeat & Watchdog (On-Demand)

Untuk mempertahankan koneksi video stream dan stabilitas kemudi:
1. **Heartbeat Frekuensi Tinggi**: Hanya boleh dikirimkan secara kontinu (10Hz / setiap 100ms) saat stik joystick tidak berada di posisi netral (`128`) ATAU ketika perintah rute jalan (*Rule Engine*) sedang aktif.
2. **Watchdog Proteksi**: Jika tidak ada data kontrol baru dari pengguna selama 3 detik, server wajib mengembalikan status stik ke netral (`128`) untuk mencegah drone melayang tanpa arah (*flyaway protection*).
3. **Pengujian Independen**: Untuk menguji validitas parser paket kontrol D16, Agen dapat menjalankan berkas pengujian di [drone-server/tests/test-movement.js](file:///c:/Users/user/Nata/Project/Sawit-Website/monitoring-sawit-web-main/monitoring-sawit-web-main/drone-server/tests/test-movement.js).
