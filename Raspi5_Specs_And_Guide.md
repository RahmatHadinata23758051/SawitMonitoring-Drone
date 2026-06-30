# Panduan Spesifikasi Raspberry Pi 5 & Cara Menjalankan GCS

Dokumen ini berisi informasi mengenai spesifikasi teknis riil Raspberry Pi 5 yang Anda gunakan, cara koneksi SSH, perintah CLI untuk memeriksa detail sistem, serta langkah-langkah untuk menjalankan seluruh komponen server secara mandiri.

---

## 1. Spesifikasi Teknis Hasil Deteksi Raspberry Pi 5
Berdasarkan hasil pembacaan sistem langsung, berikut adalah spesifikasi teknis dari Raspberry Pi 5 Anda:
* **Model Board:** `Raspberry Pi 5 Model B Rev 1.0` (Versi RPi 5 komersial resmi).
* **Prosesor (CPU):** Broadcom BCM2712 Quad-core ARM Cortex-A76 @ 2.4GHz (CPU max clock: 2400 MHz, min clock: 1500 MHz).
* **Keadaan Suhu CPU:** Standby sekitar **60.4°C** (Normal tanpa beban kerja berat).
* **Memori RAM:** **4.0 GB** (Total kapasitas fisik `4.0 GiB`).
* **ROM / Penyimpanan (SD Card):** **32 GB MicroSD** (terdeteksi partisi utama `/dev/mmcblk0p2` berukuran `29 GB` dengan kapasitas terisi `7.1 GB` (26%) dan tersisa `21 GB` ruang kosong).
* **Sistem Operasi (OS):** **Debian GNU/Linux 13 (Trixie)** (Raspberry Pi OS 64-bit).
* **Versi Kernel:** Linux `6.18.34+rpt-rpi-2712` aarch64 (Arsitektur ARM 64-bit).

### Rincian Output Perintah Deteksi Sistem:

#### A. Model Hardware (`cat /proc/device-tree/model`)
```text
Raspberry Pi 5 Model B Rev 1.0
```

#### B. Detail CPU (`lscpu`)
```text
Architecture:                aarch64
  CPU op-mode(s):            32-bit, 64-bit
  Byte Order:                Little Endian
CPU(s):                      4
  On-line CPU(s) list:       0-3
Vendor ID:                   ARM
  Model name:                Cortex-A76
    Model:                   1
    Thread(s) per core:      1
    Core(s) per cluster:     4
    Socket(s):               -
    Cluster(s):              1
    Stepping:                r4p1
    Frequency boost:         disabled
    CPU(s) scaling MHz:      62%
    CPU max MHz:             2400.0000
    CPU min MHz:             1500.0000
    BogoMIPS:                108.00
    Flags:                   fp asimd evtstrm aes pmull sha1 sha2 crc32 atomics fphp asimdhp cpuid asimdrdm lrcpc dcpop asimddp
Caches (sum of all):
  L1d:                       256 KiB (4 instances)
  L1i:                       256 KiB (4 instances)
  L2:                        2 MiB (4 instances)
  L3:                        2 MiB (1 instance)
```

#### C. Suhu Chipset (`vcgencmd measure_temp`)
```text
temp=60.4'C
```

#### D. Penggunaan Memori RAM (`free -h`)
```text
               total        used        free      shared  buff/cache   available
Mem:           4.0Gi       592Mi       2.6Gi        37Mi       911Mi       3.4Gi
Swap:          2.0Gi          0B       2.0Gi
```

#### E. Penggunaan Penyimpanan / Disk (`df -h`)
```text
Filesystem      Size  Used Avail Use% Mounted on
udev            2.0G     0  2.0G   0% /dev
tmpfs           810M   13M  798M   2% /run
/dev/mmcblk0p2   29G  7.1G   21G  26% /
tmpfs           2.0G     0  2.0G   0% /dev/shm
tmpfs           5.0M   48K  5.0M   1% /run/lock
tmpfs           1.0M     0  1.0M   0% /run/credentials/systemd-journald.service
tmpfs           2.0G   16K  2.0G   1% /tmp
/dev/mmcblk0p1  505M   75M  430M  15% /boot/firmware
```

#### F. Rilis Sistem Operasi (`cat /etc/os-release`)
```text
PRETTY_NAME="Debian GNU/Linux 13 (trixie)"
NAME="Debian GNU/Linux"
VERSION_ID="13"
VERSION="13 (trixie)"
VERSION_CODENAME=trixie
DEBIAN_VERSION_FULL=13.5
ID=debian
```

#### G. Detail Kernel Linux (`uname -a`)
```text
Linux coba2 6.18.34+rpt-rpi-2712 #1 SMP PREEMPT Debian 1:6.18.34-1+rpt1 (2026-06-09) aarch64 GNU/Linux
```

---

## 2. Koneksi SSH ke Raspberry Pi 5
Gunakan format SSH berikut untuk terhubung dari CMD laptop / PowerShell Anda:

```bash
ssh pi5@coba2.local
# ATAU jika menggunakan alamat IP secara langsung:
ssh pi5@192.168.1.49
```
* **Username:** `pi5`
* **Host:** `coba2.local` (IP default saat ini: `192.168.1.49` atau `192.168.1.15`)
* **Kata Sandi (Password):** *(Masukkan password user pi5 Anda)*

---

## 3. Perintah CLI untuk Membedah Spesifikasi Raspberry Pi 5
Jika Anda ingin memeriksa komponen internal Raspberry Pi 5 Anda secara langsung dari terminal SSH, gunakan perintah-perintah berikut:

### A. Informasi Hardware & CPU
* **Cek Model Board Resmi:**
  ```bash
  cat /proc/device-tree/model
  ```
* **Cek Arsitektur CPU & Kecepatan:**
  ```bash
  lscpu
  ```
* **Cek Suhu Chipset Saat Ini:**
  ```bash
  vcgencmd measure_temp
  ```

### B. Kapasitas Memori (RAM) & Disk
* **Cek Kapasitas RAM (dalam format MB/GB):**
  ```bash
  free -h
  ```
* **Cek Penggunaan Ruang Penyimpanan (MicroSD / SSD):**
  ```bash
  df -h
  ```

### C. Sistem Operasi (OS) & Kernel
* **Cek Versi OS Debian/Raspbian:**
  ```bash
  cat /etc/os-release
  ```
* **Cek Versi Kernel Linux:**
  ```bash
  uname -a
  ```

---

## 4. Cara Menjalankan Semua Server GCS dengan Satu Command (Otomatis)
Untuk mempermudah orkestrasi server, gunakan script otomatisasi `start_gcs.sh` dan `stop_gcs.sh` yang berada di direktori utama proyek.

### A. Persiapan Awal (Hanya Sekali)
Setelah Anda melakukan `git pull`, berikan izin eksekusi (*permission*) pada kedua file script tersebut:
```bash
chmod +x start_gcs.sh stop_gcs.sh
```

### B. Menyalakan Seluruh Server GCS Sekaligus
Jalankan perintah berikut di folder utama:
```bash
./start_gcs.sh
```
Script ini akan otomatis memicu jalannya 3 server utama di background:
1. **Laravel Web Server** di port `8000`.
2. **Drone Server Proxy Node.js** di port `3001` (MJPEG Stream port `3002`, Websocket port `3003`).
3. **AI Inference Server FastAPI** di port `8001`.

### C. Memantau Log Aktivitas Server secara Real-Time
Semua output log server diarahkan ke folder `logs/`. Anda dapat membaca aktivitas server menggunakan perintah `tail -f`:
* **Melihat log Laravel:** `tail -f logs/laravel.log`
* **Melihat log Kamera & Telemetry:** `tail -f logs/drone-server.log`
* **Melihat log AI Server:** `tail -f logs/ai-server.log`
*(Tekan `CTRL + C` untuk keluar dari pemantauan log).*

### D. Mematikan Seluruh Server Sekaligus
Jika pengujian telah selesai dan Anda ingin mematikan semua server untuk mengosongkan memori RAM Raspberry Pi, jalankan:
```bash
./stop_gcs.sh
```
