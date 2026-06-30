const { spawn } = require('child_process');

class USBCamera {
  constructor(devicePath, resolution, onFrame, onError) {
    this.devicePath = devicePath || '/dev/video0';
    this.resolution = resolution || '1280x720';
    this.onFrame = onFrame;
    this.onError = onError;
    this.ffmpeg = null;
    this.running = false;
  }

  start() {
    this.running = true;
    const [width, height] = this.resolution.split('x');

    // Argumen ffmpeg yang universal dan pasti jalan di semua jenis webcam.
    // Omit input_format agar ffmpeg mendeteksi format mentah kamera (misal YUYV)
    // dan encode ke mjpeg di sisi software dengan kualitas kompresi yang baik (-q:v 5).
    const args = [
      '-f', 'v4l2',
      '-video_size', `${width}x${height}`,
      '-i', this.devicePath,
      '-f', 'image2pipe',
      '-vcodec', 'mjpeg',
      '-q:v', '5',
      '-'
    ];

    console.log(`[USBCamera] Menjalankan ffmpeg: ffmpeg ${args.join(' ')}`);

    this.ffmpeg = spawn('ffmpeg', args);

    let buffer = Buffer.alloc(0);

    this.ffmpeg.stdout.on('data', (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);

      while (buffer.length > 0) {
        const soi = buffer.indexOf(Buffer.from([0xff, 0xd8]));
        if (soi === -1) {
          // Buang buffer jika tidak ada tanda awal gambar (SOI)
          buffer = Buffer.alloc(0);
          break;
        }

        if (soi > 0) {
          buffer = buffer.subarray(soi);
        }

        const eoi = buffer.indexOf(Buffer.from([0xff, 0xd9]));
        if (eoi === -1) {
          // Tunggu sisa fragment frame berikutnya
          break;
        }

        // Potong frame JPEG utuh
        const jpeg = buffer.subarray(0, eoi + 2);
        this.onFrame(jpeg);

        // Simpan sisa data untuk frame berikutnya
        buffer = buffer.subarray(eoi + 2);
      }
    });

    this.ffmpeg.stderr.on('data', (data) => {
      // Log dari stderr ffmpeg biasanya berupa statistik frame rate
      // Tidak perlu diprint agar terminal tidak penuh, kecuali ada kata Error
      const msg = data.toString();
      if (msg.toLowerCase().includes('error') || msg.toLowerCase().includes('cannot')) {
        console.error(`[USBCamera ffmpeg error] ${msg.trim()}`);
      }
    });

    this.ffmpeg.on('close', (code) => {
      console.log(`[USBCamera] ffmpeg dihentikan dengan kode ${code}`);
      if (this.running) {
        // Auto restart jika mati mendadak
        setTimeout(() => {
          if (this.running) this.start();
        }, 2000);
      }
    });

    this.ffmpeg.on('error', (err) => {
      console.error('[USBCamera] Gagal memulai ffmpeg:', err.message);
      if (this.onError) this.onError(err);
    });
  }

  stop() {
    this.running = false;
    if (this.ffmpeg) {
      this.ffmpeg.kill('SIGKILL');
      this.ffmpeg = null;
      console.log('[USBCamera] USB Camera stopped.');
    }
  }
}

module.exports = USBCamera;
