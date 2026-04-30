const dgram = require("dgram");
const fs = require("fs");
const os = require("os");
const path = require("path");

const host = process.argv[2] || "192.168.169.1";
const dronePort = Number(process.argv[3] || 8800);
const listenPort = Number(process.argv[4] || 0);
const durationMs = Number(process.argv[5] || 15000);

const INIT_PACKET = Buffer.from([0xef, 0x00, 0x04, 0x00]);
const outputDir = path.join(__dirname, "captures");
const outputPath = path.join(outputDir, `d16-udp-${Date.now()}.bin`);

function getIpv4Interfaces() {
  const items = [];
  const interfaces = os.networkInterfaces();

  for (const [name, addresses] of Object.entries(interfaces)) {
    for (const address of addresses || []) {
      if (address.family === "IPv4" && !address.internal) {
        items.push({ name, address: address.address, netmask: address.netmask });
      }
    }
  }

  return items;
}

function printNetworkHint() {
  const expectedPrefix = host.split(".").slice(0, 3).join(".") + ".";
  const ipv4 = getIpv4Interfaces();
  const matching = ipv4.filter((item) => item.address.startsWith(expectedPrefix));

  console.log("IPv4 adapter aktif:");
  for (const item of ipv4) {
    console.log(`- ${item.name}: ${item.address} / ${item.netmask}`);
  }
  console.log("");

  if (matching.length === 0) {
    console.log(`PERINGATAN: Tidak ada adapter dengan IP ${expectedPrefix}x.`);
    console.log("Sambungkan laptop ke WiFi drone dulu, lalu jalankan ulang probe.");
    console.log("");
  }
}

function findMarker(buf, marker) {
  for (let i = 0; i <= buf.length - marker.length; i++) {
    let ok = true;
    for (let j = 0; j < marker.length; j++) {
      if (buf[i + j] !== marker[j]) {
        ok = false;
        break;
      }
    }
    if (ok) return i;
  }

  return -1;
}

function parseD16Packet(msg) {
  if (msg.length < 56 || msg[0] !== 0x93 || msg[1] !== 0x01) return null;

  return {
    declaredLength: msg.readUInt16LE(2),
    fragmentIndex: msg.readUInt32LE(32),
    fragmentTotal: msg.readUInt32LE(36),
    frameId: msg.readUInt32LE(40),
    payload: msg.subarray(56),
  };
}

function classifyPacket(msg) {
  const packet = parseD16Packet(msg);
  const payload = packet?.payload || msg;
  const hex = payload.subarray(0, Math.min(payload.length, 24)).toString("hex").match(/.{1,2}/g)?.join(" ") || "";
  const hasJpegStart = findMarker(payload, Buffer.from([0xff, 0xd8])) !== -1;
  const hasJpegEnd = findMarker(payload, Buffer.from([0xff, 0xd9])) !== -1;
  const hasH264Start3 = findMarker(payload, Buffer.from([0x00, 0x00, 0x01])) !== -1;
  const hasH264Start4 = findMarker(payload, Buffer.from([0x00, 0x00, 0x00, 0x01])) !== -1;

  const flags = [];
  if (hasJpegStart) flags.push("JPEG_SOI");
  if (hasJpegEnd) flags.push("JPEG_EOI");
  if (hasH264Start3 || hasH264Start4) flags.push("H264_NAL");

  if (!packet) return `${msg.length} bytes | ${flags.join(", ") || "raw"} | ${hex}`;

  const frame = `frame=0x${packet.frameId.toString(16)} frag=${packet.fragmentIndex + 1}/${packet.fragmentTotal}`;
  const declared = packet.declaredLength === msg.length ? "len-ok" : `len=${packet.declaredLength}`;
  return `${msg.length} bytes | ${declared} | ${frame} | payload=${payload.length} | ${flags.join(", ") || "proprietary/raw"} | ${hex}`;
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });

  console.log("[d16-udp-probe] Mode UDP / WiFi UAV");
  console.log(`[d16-udp-probe] Target drone : ${host}:${dronePort}`);
  console.log(`[d16-udp-probe] Listen port  : ${listenPort || "ephemeral/otomatis"}`);
  console.log(`[d16-udp-probe] Durasi       : ${durationMs}ms`);
  console.log(`[d16-udp-probe] Init packet  : ${INIT_PACKET.toString("hex").match(/.{1,2}/g).join(" ")}`);
  console.log(`[d16-udp-probe] Raw capture  : ${outputPath}`);
  console.log("");
  printNetworkHint();

  const socket = dgram.createSocket("udp4");
  const rawStream = fs.createWriteStream(outputPath);

  let received = 0;
  let totalBytes = 0;
  let initCount = 0;
  let lastPacketAt = 0;

  socket.on("message", (msg, rinfo) => {
    received += 1;
    totalBytes += msg.length;
    lastPacketAt = Date.now();
    rawStream.write(msg);

    if (received <= 20 || received % 50 === 0) {
      console.log(`[RX #${received}] ${rinfo.address}:${rinfo.port} -> ${classifyPacket(msg)}`);
    }
  });

  socket.on("error", (err) => {
    console.error("[UDP ERROR]", err.message);
    socket.close();
  });

  socket.bind(listenPort, () => {
    const address = socket.address();
    console.log(`[d16-udp-probe] Listening on ${address.address}:${address.port}`);
    console.log("[d16-udp-probe] Mengirim init packet tiap 1 detik...");
    console.log("");

    const sendInit = () => {
      initCount += 1;
      socket.send(INIT_PACKET, dronePort, host, (err) => {
        if (err) console.error(`[TX #${initCount}] gagal: ${err.message}`);
        else console.log(`[TX #${initCount}] ef 00 04 00 -> ${host}:${dronePort}`);
      });
    };

    sendInit();
    const interval = setInterval(sendInit, 1000);

    setTimeout(() => {
      clearInterval(interval);
      socket.close();
      rawStream.end();

      console.log("");
      console.log("[d16-udp-probe] Selesai.");
      console.log(`Init terkirim : ${initCount}`);
      console.log(`Paket diterima: ${received}`);
      console.log(`Total data    : ${totalBytes} bytes`);
      console.log(`Capture       : ${outputPath}`);

      if (received === 0) {
        console.log("");
        console.log("Belum ada balasan UDP.");
        console.log("Coba lagi dengan listen port umum app:");
        console.log("  node d16-udp-probe.js 192.168.169.1 8800 8800");
        console.log("  node d16-udp-probe.js 192.168.169.1 8800 1234");
        console.log("  node d16-udp-probe.js 192.168.169.1 8800 57817");
        console.log("Pastikan app WiFi UAV di HP sedang tidak terhubung, karena drone murah sering hanya melayani satu client.");
      } else {
        const ageMs = Date.now() - lastPacketAt;
        console.log(`Paket terakhir: ${ageMs}ms sebelum selesai`);
        console.log("Jika ada tanda JPEG_SOI/JPEG_EOI/H264_NAL, data ini bisa kita lanjutkan jadi proxy stream ke GCS.");
      }
    }, durationMs);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
