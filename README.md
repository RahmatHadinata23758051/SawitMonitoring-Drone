# Dokumentasi Proyek SawitMonitoring-Drone

Proyek ini adalah sistem Ground Control Station (GCS) berbasis web untuk melakukan pemantauan otonom dan manual terhadap kesehatan serta tingkat kematangan buah kelapa sawit menggunakan drone. Sistem ini mengintegrasikan pemetaan interaktif, kendali penerbangan otonom/manual, penanganan video streaming dari kamera drone, serta inferensi AI untuk klasifikasi kematangan buah.

## Arsitektur Sistem

Proyek ini terdiri dari tiga komponen utama yang berjalan secara bersamaan:

1. **Aplikasi GCS (Laravel & React)**: Server utama yang menyediakan antarmuka pengguna, basis data riwayat penerbangan, dan manajemen data perkebunan.
2. **Drone Proxy Server (Node.js)**: Server perantara yang meneruskan instruksi kontrol penerbangan dari aplikasi web ke fisik drone melalui protokol UDP biner, serta mengelola FPV streaming.
3. **AI Inference Server (FastAPI)**: Layanan kecerdasan buatan berbasis Python untuk mendeteksi tingkat kematangan buah kelapa sawit secara real-time berdasarkan data visual dari drone.

---

## Persyaratan Sistem

Sebelum melakukan instalasi, pastikan sistem Anda telah memiliki perangkat lunak berikut:
- **PHP** (Minimal versi 8.1)
- **Composer**
- **Node.js** (Minimal versi 18) & **NPM**
- **Python** (Minimal versi 3.9) & **pip**
- **SQLite**

---

## Panduan Instalasi dan Konfigurasi

### 1. Kloning Repositori
Kloning repositori proyek dari GitHub ke direktori lokal Anda:
```bash
git clone https://github.com/RahmatHadinata23758051/SawitMonitoring-Drone.git
cd SawitMonitoring-Drone
```

### 2. Konfigurasi Aplikasi GCS (Laravel & React)
Jalankan perintah berikut pada direktori utama proyek:

1. Instal dependensi PHP:
   ```bash
   composer install
   ```

2. Salin berkas konfigurasi lingkungan:
   ```bash
   copy .env.example .env
   ```

3. Buat kunci aplikasi Laravel:
   ```bash
   php artisan key:generate
   ```

4. Buat basis data SQLite kosong:
   Di Windows PowerShell:
   ```powershell
   New-Item -ItemType File -Path database/database.sqlite -Force
   ```
   Di Linux/macOS:
   ```bash
   touch database/database.sqlite
   ```

5. Jalankan migrasi basis data beserta pengisian data awal (seeding):
   ```bash
   php artisan migrate --seed
   ```

6. Instal dependensi JavaScript:
   ```bash
   npm install
   ```

### 3. Konfigurasi Drone Proxy Server (Node.js)
Masuk ke direktori server drone dan instal dependensinya:
```bash
cd drone-server
npm install
cd ..
```

### 4. Konfigurasi AI Inference Server (FastAPI)
Masuk ke direktori server AI, disarankan membuat virtual environment Python terlebih dahulu:
```bash
cd ai-server
python -m venv venv
```

Aktifkan virtual environment Anda:
- Di Windows:
  ```cmd
  venv\Scripts\activate
  ```
- Di Linux/macOS:
  ```bash
  source venv/bin/activate
  ```

Instal dependensi Python:
```bash
pip install -r requirements.txt
cd ..
```

---

## Cara Menjalankan Aplikasi

Untuk menggunakan sistem secara penuh, Anda harus menjalankan ketiga server secara bersamaan. Buka tiga jendela terminal terpisah:

### Terminal 1: Aplikasi Web GCS (Laravel & React)
Jalankan server pengembangan Laravel dan kompilasi aset frontend di direktori utama proyek:
```bash
# Jalankan server Laravel (port default: 8000)
php artisan serve

# Jalankan Vite dev server di terminal/tab yang sama atau terpisah
npm run dev
```
Aplikasi web dapat diakses melalui browser di alamat: `http://127.0.0.1:8000`.

### Terminal 2: Drone Proxy Server (Node.js)
Jalankan server proxy kontrol penerbangan:
```bash
cd drone-server
node index.js
```
Server ini akan berjalan pada port `3001` untuk penanganan instruksi kontrol penerbangan, port `3002` untuk proxy aliran MJPEG/HLS, dan port `3003` untuk WebSocket FPV Stream.

### Terminal 3: AI Inference Server (FastAPI)
Jalankan layanan klasifikasi AI di direktori `ai-server`. Pastikan virtual environment Anda aktif:
```bash
cd ai-server
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```
Atau di sistem Windows, Anda dapat langsung menjalankan berkas `start.bat`.

---

## Panduan Penggunaan dan Alur Kontrol

### 1. Pemilihan Mode Sistem (Simulasi vs Real)
Buka GCS di browser Anda, klik ikon gerigi untuk membuka **Pengaturan Sistem GCS** -> tab **Sistem & Tampilan**:
- **Mode Simulasi**: Drone dikontrol secara virtual menggunakan koordinat tiruan dan kamera simulasi.
- **Mode Real**: Digunakan untuk menghubungkan aplikasi langsung ke fisik drone.

### 2. Koneksi ke Fisik Drone
Hubungkan Wi-Fi komputer Anda ke jaringan Wi-Fi access point bawaan drone. Sistem mendeteksi profil secara dinamis berdasarkan konfigurasi berikut:

* **D16 Mini**:
  - Hubungkan ke Wi-Fi drone D16.
  - Pilih profil **D16 Mini** di Pengaturan GCS.
  - Server otomatis mengarahkan koneksi ke IP **`192.168.169.1`** dan Port UDP **`8800`** dengan format paket 88-byte.
* **E88 Pro**:
  - Hubungkan ke Wi-Fi drone E88 Pro.
  - Pilih profil **E88 Pro** di Pengaturan GCS.
  - Server otomatis mengarahkan koneksi ke IP **`192.168.1.1`** dan Port UDP **`7099`** dengan format paket 9-byte.

### 3. Prosedur Kendali Terbang (ARM & Takeoff)
- **ARM**: Sinyal pembuka kunci motor. Khusus untuk **E88 Pro**, menekan tombol ARM akan otomatis mengirimkan perintah Kalibrasi Gyro (`0x80`) untuk me-reset sensor dan melepaskan kunci darurat (*emergency lock*) sebelum membuka kunci motor (`0x40`) pada tingkat throttle `0` (idle).
- **Takeoff**: Mengirimkan perintah terbang otonom (`0x01`) sekaligus menyesuaikan throttle ke tingkat melayang (`128`).
- **Emergency Stop (STOP)**: Tombol darurat untuk mematikan motor instan. Pada E88 Pro, menekan tombol ini akan mengaktifkan *emergency lock* pada hardware drone. Untuk terbang kembali, Anda hanya perlu menekan tombol **ARM** kembali untuk melepas kunci tersebut melalui auto-kalibrasi.
