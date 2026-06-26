---
skill_type: pdf_agent
protocol_status: abstract
last_updated: 2026-06-22
applies_to: Sawit GCS
---

# Panduan Analisis Spesifikasi Hardware Drone (PDF Agent)

Berkas ini memandu Agen AI dalam membaca, mengekstrak, dan mengevaluasi data teknis dari dokumen PDF spesifikasi perangkat keras drone. Agen harus menilai apakah hardware yang diusulkan mampu menunjang misi pemindaian *Traditional Scan* (mengitari pohon 360°) dan *QLV Scan* (dual-camera barisan pohon) di perkebunan kelapa sawit.

---

## 1. Parameter Teknis yang Harus Diekstrak

Saat mengevaluasi dokumen PDF spesifikasi drone, Agen wajib mengekstrak data berikut ke dalam struktur tabel:

| Kategori Parameter | Parameter Teknis | Satuan | Contoh Nilai | Relevansi terhadap Misi (Traditional / QLV) |
| :--- | :--- | :--- | :--- | :--- |
| **Sistem Penentu Posisi** | Akurasi Horizontal GPS | meter / cm | $\pm$ 2.5 m (M8N) / $\pm$ 2 cm (RTK) | Menentukan toleransi jarak drone dengan dahan/pelepah kelapa sawit agar tidak menabrak. |
| | Frekuensi Update GPS | Hz | 5 Hz s.d 10 Hz | Kecepatan pembaruan koordinat di peta GCS real-time. |
| **Sensor Jarak & Stabilitas** | LiDAR Rangefinder (Bawah) | meter | 0.1 m s.d 12 m (TFmini-S) | Menjaga ketinggian absolut drone di atas permukaan tanah yang bergelombang. |
| | Optical Flow (Bawah) | pixel/sec | Aktif pada tinggi < 3m | Mengunci posisi melayang (*hover*) jika sinyal GPS terhalang daun sawit. |
| **Kamera & Pemindaian** | Resolusi Kamera FPV | piksel | 1920x1080 (1080p) | Kualitas deteksi buah matang/mentah menggunakan model YOLO. |
| | Field of View (FOV) Kamera | derajat | $85^\circ$ Horizontal | Lebar pandangan lensa. Sangat menentukan cakupan area dahan sawit. |
| | Konfigurasi Kamera (QLV) | unit | Dual Camera (Kiri & Kanan) | Mampu memindai 2 baris pohon sekaligus tanpa manuver berputar. |
| **Bobot & Efisiensi** | Takeoff Weight (TOW) | gram / kg | 1850 gram (F450 kustom) | Menentukan beban kerja motor dan efisiensi konsumsi baterai. |
| | Thrust-to-Weight Ratio | rasio | 2.2 : 1 | Kemampuan drone membawa beban kamera tambahan dengan stabil (aman jika $\ge$ 2:1). |
| **Integrasi Protokol** | Kompatibilitas Protokol | tipe | MAVLink / SDK / Custom | Menentukan tingkat kesulitan penulisan adaptor ke GCS [drone_protocol_abstraction.md](file:///c:/Users/user/Nata/Project/Sawit-Website/monitoring-sawit-web-main/monitoring-sawit-web-main/.skill/drone_protocol_abstraction.md). |

> 🔄 Akan berubah jika drone/protokol berganti.

---

## 2. Langkah Evaluasi Spesifikasi Baru

Agen AI wajib mengikuti langkah-langkah terstruktur berikut ketika ditugaskan menganalisis dokumen PDF rancangan perangkat keras baru:

1. **Ekstraksi Teks Mentah**:
   Baca halaman dokumen PDF yang berisi spesifikasi teknis dan komponen drone.
2. **Penyusunan Tabel**:
   Pindahkan data parameter teknis ke dalam format tabel parameter seperti pada Seksi 1.
3. **Pencocokan Protokol Kontrol**:
   Identifikasi jenis protokol kontrol yang didukung oleh Flight Controller drone tersebut (misalnya PX4 MAVLink, DJI SDK, dll). Cocokkan dengan antarmuka yang didefinisikan di [drone_protocol_abstraction.md](file:///c:/Users/user/Nata/Project/Sawit-Website/monitoring-sawit-web-main/monitoring-sawit-web-main/.skill/drone_protocol_abstraction.md).
4. **Analisis Gap**:
   Tandai jika ada fungsionalitas kontrak abstrak yang tidak didukung secara bawaan oleh hardware baru, dan berikan catatan solusi teknisnya.
5. **Verifikasi Keamanan Daya (Thrust Calculation)**:
   Hitung rasio daya dorong dengan formula berikut:
   $$\text{Thrust-to-Weight Ratio} = \frac{\text{Total Daya Dorong Motor Maksimal (gram)}}{\text{TOW Drone (gram)}}$$
   Pastikan hasilnya minimal **2:1**. Jika rasio di bawah **1.8:1**, drone akan sangat lamban merespons, tidak stabil ditiup angin kebun, dan baterai cepat panas.

---

## 3. Checklist Kelayakan Hardware Terhadap Misi

Gunakan checklist ini untuk menentukan apakah spesifikasi drone dalam PDF layak untuk dideploy di perkebunan sawit:

* **Untuk Misi Traditional Scan (Melingkari 1 Pohon 360°)**:
  - [ ] Memiliki sensor kompas (*Magnetometer*) internal untuk mengetahui orientasi hadap drone secara absolut.
  - [ ] Memiliki modul GPS dengan akurasi horizontal minimal $\pm 1$ meter (atau RTK GPS).
  - [ ] Memiliki kamera dengan gimbal minimal 2-axis yang mendukung kontrol sudut kamera secara otomatis dari GCS.
  - [ ] Waktu terbang drone (*flight endurance*) minimal 15 menit.

* **Untuk Misi QLV Scan (Dual-Camera Row Scan)**:
  - [ ] Memiliki modul RTK GPS (akurasi tingkat centimeter) untuk terbang lurus presisi di koridor barisan pohon sawit.
  - [ ] Memiliki sensor LiDAR bawah untuk stabilisasi ketinggian di kontur tanah kebun sawit yang miring.
  - [ ] Menggunakan konfigurasi **dua kamera fisik samping (Dual-Camera)** dengan sudut tetap atau gimbal terpisah untuk memotret sisi kiri dan kanan secara simultan.
  - [ ] Companion computer (misal Jetson Nano/Orin) memiliki daya komputasi GPU yang cukup untuk memproses dua aliran video FPV sekaligus tanpa mengalami *stuck*.

---

## 4. Contoh Prompt Internal Ekstraksi Data PDF

Gunakan prompt ini saat meminta asisten AI lain untuk mengekstrak data dari berkas spesifikasi PDF:

```text
Ekstrak semua data spesifikasi teknis dari dokumen rancangan hardware drone kelapa sawit ini. 
Identifikasi komponen penting berikut dan sajikan hasilnya dalam bentuk tabel markdown:
1. Jenis Flight Controller yang digunakan dan kompatibilitas protokolnya (MAVLink/proprietary).
2. Berat total lepas landas (TOW) dan model baterai.
3. Jenis dan resolusi kamera (apakah kamera tunggal atau ganda).
4. Ketersediaan sensor penentu posisi tambahan (GPS/RTK GPS, LiDAR bawah, Optical Flow).
Analisis apakah rasio Thrust-to-Weight memenuhi batas aman 2:1 berdasarkan spesifikasi motor dan baling-baling yang tertera.
```
