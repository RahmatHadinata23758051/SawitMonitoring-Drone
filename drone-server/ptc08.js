const { SerialPort } = require('serialport');

class PTC08Camera {
  constructor(portPath, baudRate, resolution, onFrame, onError) {
    this.portPath = portPath;
    this.baudRate = parseInt(baudRate, 10) || 38400;
    this.resolution = resolution || '640x480';
    this.onFrame = onFrame;
    this.onError = onError;
    this.port = null;
    this.running = false;
    this.readBuffer = Buffer.alloc(0);
  }

  async start() {
    this.running = true;
    try {
      this.port = new SerialPort({
        path: this.portPath,
        baudRate: this.baudRate,
        autoOpen: false
      });

      this.port.on('data', (data) => {
        this.readBuffer = Buffer.concat([this.readBuffer, data]);
      });

      this.port.on('error', (err) => {
        console.error('[PTC08] Serial Port Error:', err.message);
        if (this.onError) this.onError(err);
      });

      await new Promise((resolve, reject) => {
        this.port.open((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      console.log(`[PTC08] Serial camera opened on ${this.portPath} @ ${this.baudRate}`);
      
      // Atur Resolusi terlebih dahulu
      const resByte = this.resolution === '320x240' ? 0x11 : 0x00;
      console.log(`[PTC08] Mengatur resolusi ke ${this.resolution} (Byte: 0x${resByte.toString(16)})`);
      try {
        await this.sendCommand(Buffer.from([0x56, 0x00, 0x31, 0x05, 0x04, 0x01, 0x00, 0x19, resByte]));
        await this.sleep(200);
      } catch (err) {
        console.warn('[PTC08] Gagal mengatur resolusi (kamera mungkin tidak merespons perintah ini):', err.message);
      }

      // Reset camera
      await this.sendCommand(Buffer.from([0x56, 0x00, 0x26, 0x00]));
      await this.sleep(1500); // Tunggu boot selesai
      this.readBuffer = Buffer.alloc(0); // Bersihkan buffer sisa boot text

      // Mulai loop pengambilan gambar
      this.captureLoop();
    } catch (err) {
      console.error('[PTC08] Gagal menyalakan kamera:', err.message);
      if (this.onError) this.onError(err);
    }
  }

  stop() {
    this.running = false;
    if (this.port && this.port.isOpen) {
      this.port.close();
      console.log('[PTC08] Serial camera closed.');
    }
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async sendCommand(cmd, expectedResponseLength = 5, timeout = 2000) {
    this.readBuffer = Buffer.alloc(0);
    if (!this.port || !this.port.isOpen) {
      throw new Error('Serial port is not open');
    }
    this.port.write(cmd);

    const start = Date.now();
    while (this.readBuffer.length < expectedResponseLength) {
      if (!this.running) return Buffer.alloc(0);
      if (Date.now() - start > timeout) {
        throw new Error(`Command response timeout (expected ${expectedResponseLength} bytes, got ${this.readBuffer.length})`);
      }
      await this.sleep(10);
    }
    const resp = this.readBuffer.subarray(0, expectedResponseLength);
    this.readBuffer = this.readBuffer.subarray(expectedResponseLength);
    return resp;
  }

  async captureLoop() {
    while (this.running) {
      try {
        // 1. Ambil snapshot (Stop frame buffer)
        // Cmd: 56 00 36 01 00
        // Resp: 76 00 36 00 00
        const stopResp = await this.sendCommand(Buffer.from([0x56, 0x00, 0x36, 0x01, 0x00]), 5);
        if (stopResp[0] !== 0x76 || stopResp[2] !== 0x36) {
          throw new Error('Stop frame failed');
        }

        // 2. Baca panjang buffer data gambar
        // Cmd: 56 00 34 01 00
        // Resp: 76 00 34 00 04 00 00 XX YY (9 bytes)
        const lenResp = await this.sendCommand(Buffer.from([0x56, 0x00, 0x34, 0x01, 0x00]), 9);
        if (lenResp[0] !== 0x76 || lenResp[2] !== 0x34) {
          throw new Error('Get length failed');
        }
        const len = lenResp.readUInt32BE(5);
        if (len <= 0 || len > 1024 * 1024) {
          throw new Error('Invalid frame length: ' + len);
        }

        // 3. Baca data gambar
        // Cmd: 56 00 32 0C 00 0A 00 00 00 00 [4 bytes offset] [4 bytes length] [2 bytes delay]
        // Offset = 0, Delay = 10ms (00 0A)
        const readCmd = Buffer.alloc(16);
        readCmd.writeUInt8(0x56, 0);
        readCmd.writeUInt8(0x00, 1);
        readCmd.writeUInt8(0x32, 2);
        readCmd.writeUInt8(0x0C, 3);
        readCmd.writeUInt8(0x00, 4);
        readCmd.writeUInt8(0x0A, 5);
        readCmd.writeUInt32BE(0, 6); // offset 0
        readCmd.writeUInt32BE(len, 10); // length
        readCmd.writeUInt16BE(10, 14); // delay 10ms

        // Response structure: 5 bytes header + len bytes data + 5 bytes footer = len + 10 bytes
        const totalLen = len + 10;
        const frameData = await this.sendCommand(readCmd, totalLen, 25000);
        
        // Ambil data JPEG asli (potong header dan footer 5 bytes)
        const jpeg = frameData.subarray(5, 5 + len);

        // Verifikasi SOI (FF D8) dan EOI (FF D9) dari file JPEG
        if (jpeg[0] === 0xff && jpeg[1] === 0xd8 && jpeg[jpeg.length - 2] === 0xff && jpeg[jpeg.length - 1] === 0xd9) {
          this.onFrame(jpeg);
        } else {
          console.warn('[PTC08] Frame JPEG rusak (SOI/EOI tidak valid)');
        }

        // 4. Resume frame buffer (unfreeze)
        // Cmd: 56 00 36 01 03
        // Resp: 76 00 36 00 00
        await this.sendCommand(Buffer.from([0x56, 0x00, 0x36, 0x01, 0x03]), 5);

        // Jeda 500ms sebelum mengambil frame berikutnya (sekitar 2 FPS)
        await this.sleep(500);
      } catch (err) {
        console.error('[PTC08] Error saat capture:', err.message);
        // Bersihkan buffer agar sisa data yang menggantung terbuang
        this.readBuffer = Buffer.alloc(0);
        // Coba kirim resume jika terjadi stuck
        try {
          await this.sendCommand(Buffer.from([0x56, 0x00, 0x36, 0x01, 0x03]), 5, 500);
        } catch {}
        await this.sleep(2000); // Jeda lebih lama jika error agar port tidak tersumbat
      }
    }
  }
}

module.exports = PTC08Camera;
