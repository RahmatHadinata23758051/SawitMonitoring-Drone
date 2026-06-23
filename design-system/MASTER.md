# Sawit GCS Design System — Master Specification

Dokumen ini mendefinisikan standar visual, interaksi, dan aksesibilitas untuk Ground Control Station (GCS) Sawit. Semua komponen di dalam proyek harus mematuhi sistem desain ini untuk menjamin konsistensi, kemudahan penggunaan di lapangan, dan kualitas antarmuka yang premium.

---

## 1. Tema & Sistem Warna Semantik

Sistem menggunakan skema warna terkurasi dengan kontras tinggi yang dirancang agar tetap terbaca jelas di bawah terik matahari perkebunan (Light Mode) maupun dalam ruangan (Dark Mode).

### A. Palet Warna Utama

| Token Warna | Light Mode (Hex) | Dark Mode (Hex) | Peran UI / Aplikasi |
| :--- | :--- | :--- | :--- |
| **Primary (Emerald)** | `#10b981` (emerald-500) | `#34d399` (emerald-400) | Identitas produk, tombol aksi utama, status normal/sukses. |
| **Secondary (Slate)** | `#475569` (slate-600) | `#94a3b8` (slate-400) | Teks sekunder, label, ikon penunjang, border tidak aktif. |
| **Background (Base)** | `#f8fafc` (slate-50) | `#020617` (slate-950) | Latar belakang dasar aplikasi. |
| **Surface (Card)** | `#ffffff` | `#0f172a` (slate-900) | Latar belakang card, widget, panel samping, modal dialog. |
| **Border** | `#e2e8f0` (slate-200) | `#1e293b` (slate-800) | Garis pemisah antar panel, outline input, border card. |
| **Information (Sky)** | `#0ea5e9` (sky-500) | `#38bdf8` (sky-400) | Indikator telemetri, rute terbang aktif, status loading. |
| **Warning (Amber)** | `#f59e0b` (amber-500) | `#fbbf24` (amber-400) | Status baterai lemah ($\le 30\%$), sinyal lemah, jeda misi. |
| **Danger (Rose)** | `#f43f5e` (rose-500) | `#fb7185` (rose-400) | Tombol stop darurat, status baterai kritis ($\le 15\%$), link putus. |

---

## 2. Tipografi & Skala Teks

Kami menggunakan pasangan font modern yang dioptimalkan untuk keterbacaan data angka koordinat (*telemetry readouts*).
*   **Header / Judul**: **Outfit** (Sans-serif, memberikan kesan modern dan futuristik).
*   **Body / Data**: **Inter** (Sangat terbaca pada layar resolusi tinggi maupun rendah).
*   **Ketinggian Baris (Line Height)**: `1.5` untuk teks biasa, `1.2` untuk judul besar.

| Skala Teks | Ukuran (px/pt) | Berat (Weight) | Contoh Penggunaan |
| :--- | :--- | :--- | :--- |
| **Title / Heading 1**| `24px` (1.5rem) | Bold (700) | Judul dashboard utama, nama blok kebun aktif. |
| **Subheading / H2** | `18px` (1.125rem) | Semi-Bold (600) | Judul panel samping, judul widget telemetri. |
| **Body Large** | `16px` (1rem) | Regular (400) | Input field data, teks deskripsi laporan. |
| **Body Regular** | `14px` (0.875rem) | Regular (400) | Daftar instruksi rute, notifikasi toast biasa. |
| **Telemetry / Data** | `12px` (0.75rem) | Mono (700) | Angka koordinat GPS, ketinggian, kecepatan, persentase baterai. |
| **Microcopy** | `10px` (0.625rem) | Medium (500) | Label kecil di bawah data ("LAT", "LON", "FLIGHT TIME"). |

---

## 3. Sistem Spacing & Grid Layout

Tata letak dashboard GCS didasarkan pada **grid modular 3 kolom** dengan sistem kelipatan jarak **8dp** untuk menjamin visual yang seimbang (*rhythm*).

*   **Jarak Margin Luar (Padding Container)**: `16px` (1rem) di sekeliling layar.
*   **Celah Antar Widget (Gaps)**: `16px` (1rem).
*   **Padding Dalam Card/Widget**: `16px` (1rem) untuk kenyamanan tata letak konten.
*   **Border Radius (Rounded corners)**:
    *   Button & Input: `6px` (rounded)
    *   Card, Widget & Panels: `12px` (rounded-xl)
    *   Modals: `16px` (rounded-2xl)

---

## 4. Standar Interaksi & Efek Visual (Micro-animations)

Antarmuka GCS harus terasa hidup, responsif, dan memberikan umpan balik visual instan saat digunakan.

*   **Efek Hover (Tombol & Menu)**:
    *   Transformasi skala: naik `1.02` kali lipat.
    *   Durasi transisi: `150ms` dengan kurva `ease-out`.
    *   Perubahan latar belakang: sedikit lebih terang (misal `hover:bg-slate-800` di mode gelap).
*   **Efek Active / Pressed (Saat Diklik)**:
    *   Transformasi skala: turun ke `0.98` kali lipat.
    *   Durasi transisi: `100ms`.
*   **Status Tidak Aktif (Disabled)**:
    *   Opacity diturunkan menjadi **40%** (tidak boleh kurang dari itu agar teks tetap terbaca).
    *   Pointer mouse berubah menjadi `not-allowed`.
*   **Target Sentuh Minimal**: Semua tombol yang dapat ditekan wajib memiliki area tap minimal **44x44 piksel** untuk kemudahan pengoperasian di tablet lapangan dengan tangan bersarung tangan.

---

## 5. Aksesibilitas & Penanganan Kasus Kritis (Failsafe UX)

GCS wajib menjaga aspek keselamatan penerbangan drone melalui indikasi visual yang andal:

*   **Indikator Masalah Kritis**: Warna merah menyala (`#f43f5e`) **wajib disertai ikon peringatan** (seperti ikon `AlertTriangle`) dan animasi berkedip (*pulse*). Tidak boleh hanya menggunakan warna saja untuk menyampaikan status darurat (memenuhi asas WCAG 2.1).
*   **Sinyal Drone Terputus**:
    *   Border luar widget telemetri langsung berubah menjadi merah menyala.
    *   Nilai telemetri dibekukan (*freeze*) dan ditandai label "DISCONNECTED".
    *   Tombol kontrol joystick dinonaktifkan secara otomatis untuk mencegah pilot salah kirim sinyal tanpa koneksi.
*   **Loading state**: Setiap widget yang memuat data dari database (blok lahan/misi) wajib menampilkan *skeleton loader* berwarna abu-abu yang bergerak berdenyut lembut, bukan menampilkan layar kosong.
