const dgram = require("dgram");
const express = require("express");

const droneHost = process.env.D16_HOST || "192.168.169.1";
const dronePort = Number(process.env.D16_PORT || 8800);
const httpPort = Number(process.env.D16_HTTP_PORT || 3002);
const initPacket = Buffer.from([0xef, 0x00, 0x04, 0x00]);
const MJPEG_BOUNDARY = "d16-frame";
const JPEG_HEADER_640X360_Q50_444 = Buffer.from(
  "ffd8ffe000104a46494600010100000100010000ffdb004300100b0c0e0c0a100e0d0e1211101318281a181616183123251d283a333d3c3933383740485c4e404457453738506d51575f626768673e4d71797064785c656763ffdb0043011112121815182f1a1a2f634238426363636363636363636363636363636363636363636363636363636363636363636363636363636363636363636363636363ffc00011080168028003011100021101031101ffc4001f0000010501010101010100000000000000000102030405060708090a0bffc400b5100002010303020403050504040000017d01020300041105122131410613516107227114328191a1082342b1c11552d1f02433627282090a161718191a25262728292a3435363738393a434445464748494a535455565758595a636465666768696a737475767778797a838485868788898a92939495969798999aa2a3a4a5a6a7a8a9aab2b3b4b5b6b7b8b9bac2c3c4c5c6c7c8c9cad2d3d4d5d6d7d8d9dae1e2e3e4e5e6e7e8e9eaf1f2f3f4f5f6f7f8f9faffc4001f0100030101010101010101010000000000000102030405060708090a0bffc400b51100020102040403040705040400010277000102031104052131061241510761711322328108144291a1b1c109233352f0156272d10a162434e125f11718191a262728292a35363738393a434445464748494a535455565758595a636465666768696a737475767778797a82838485868788898a92939495969798999aa2a3a4a5a6a7a8a9aab2b3b4b5b6b7b8b9bac2c3c4c5c6c7c8c9cad2d3d4d5d6d7d8d9dae2e3e4e5e6e7e8e9eaf2f3f4f5f6f7f8f9faffda000c03010002110311003f00",
  "hex",
);

const app = express();
const udp = dgram.createSocket("udp4");

let startedAt = Date.now();
let initSent = 0;
let packets = 0;
let bytes = 0;
let source = null;
let lastPacketAt = 0;
let lastFrameId = null;
let frameIds = new Set();
let lastPayloadHead = "";
let lastJpeg = null;
let mjpegClients = new Set();
let partialFrames = new Map();

function parseD16Packet(msg) {
  if (msg.length < 56 || msg[0] !== 0x93 || msg[1] !== 0x01) return null;

  return {
    declaredLength: msg.readUInt16LE(2),
    fragmentIndex: msg.readUInt32LE(32),
    fragmentTotal: msg.readUInt32LE(36),
    frameId: msg.readUInt32LE(40),
    width: msg.readUInt16LE(44),
    height: msg.readUInt16LE(46),
    payload: msg.subarray(56),
  };
}

function makeJpegFromPayload(packet, payload) {
  if (packet.width !== 640 || packet.height !== 360) return null;
  return Buffer.concat([JPEG_HEADER_640X360_Q50_444, payload, Buffer.from([0xff, 0xd9])]);
}

function emitJpeg(jpeg) {
  lastJpeg = jpeg;
  const chunkHeader = Buffer.from(
    `--${MJPEG_BOUNDARY}\r\nContent-Type: image/jpeg\r\nContent-Length: ${jpeg.length}\r\n\r\n`,
    "ascii",
  );
  const chunkTail = Buffer.from("\r\n", "ascii");

  for (const res of Array.from(mjpegClients)) {
    try {
      res.write(chunkHeader);
      res.write(jpeg);
      res.write(chunkTail);
    } catch {
      mjpegClients.delete(res);
    }
  }
}

function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function sendInit() {
  initSent += 1;
  udp.send(initPacket, dronePort, droneHost, (err) => {
    if (err) console.error("[D16 UDP] init failed:", err.message);
  });
}

function statusPayload() {
  const now = Date.now();
  const ageMs = lastPacketAt ? now - lastPacketAt : null;

  return {
    status: ageMs !== null && ageMs < 3000 ? "connected" : "waiting",
    drone: `${droneHost}:${dronePort}`,
    source,
    init_sent: initSent,
    packets,
    bytes,
    frames: frameIds.size,
    mjpeg_ready: Boolean(lastJpeg),
    mjpeg_clients: mjpegClients.size,
    last_frame_id: lastFrameId === null ? null : `0x${lastFrameId.toString(16)}`,
    last_packet_age_ms: ageMs,
    uptime: formatDuration(now - startedAt),
    payload_note: "D16 UDP dirakit sebagai MJPEG eksperimental dengan header JPEG 640x360 Q50.",
    last_payload_head: lastPayloadHead,
  };
}

function svgStatus() {
  const data = statusPayload();
  const connected = data.status === "connected";
  const bg = connected ? "#071a13" : "#1b1420";
  const accent = connected ? "#22c55e" : "#f97316";
  const title = connected ? "D16 UDP CONNECTED" : "WAITING FOR D16 UDP";
  const age = data.last_packet_age_ms === null ? "-" : `${data.last_packet_age_ms} ms`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <rect width="1280" height="720" fill="${bg}"/>
  <rect x="36" y="36" width="1208" height="648" rx="24" fill="#020617" stroke="${accent}" stroke-width="3"/>
  <circle cx="94" cy="96" r="12" fill="${accent}">
    <animate attributeName="opacity" values="1;0.35;1" dur="1.2s" repeatCount="indefinite"/>
  </circle>
  <text x="122" y="106" fill="${accent}" font-family="Consolas, monospace" font-size="34" font-weight="700">${title}</text>
  <text x="72" y="174" fill="#cbd5e1" font-family="Consolas, monospace" font-size="24">Drone target : ${data.drone}</text>
  <text x="72" y="218" fill="#cbd5e1" font-family="Consolas, monospace" font-size="24">UDP source   : ${data.source || "-"}</text>
  <text x="72" y="262" fill="#cbd5e1" font-family="Consolas, monospace" font-size="24">Packets      : ${data.packets}</text>
  <text x="72" y="306" fill="#cbd5e1" font-family="Consolas, monospace" font-size="24">Bytes        : ${data.bytes}</text>
  <text x="72" y="350" fill="#cbd5e1" font-family="Consolas, monospace" font-size="24">Frames       : ${data.frames}</text>
  <text x="72" y="394" fill="#cbd5e1" font-family="Consolas, monospace" font-size="24">Last frame   : ${data.last_frame_id || "-"}</text>
  <text x="72" y="438" fill="#cbd5e1" font-family="Consolas, monospace" font-size="24">Last packet  : ${age}</text>
  <text x="72" y="482" fill="#cbd5e1" font-family="Consolas, monospace" font-size="24">Uptime       : ${data.uptime}</text>
  <text x="72" y="548" fill="#fbbf24" font-family="Consolas, monospace" font-size="22">MJPEG stream: http://127.0.0.1:${httpPort}/stream</text>
  <text x="72" y="592" fill="#94a3b8" font-family="Consolas, monospace" font-size="18">Head: ${data.last_payload_head || "-"}</text>
</svg>`;
}

udp.on("message", (msg, rinfo) => {
  const packet = parseD16Packet(msg);
  packets += 1;
  bytes += msg.length;
  source = `${rinfo.address}:${rinfo.port}`;
  lastPacketAt = Date.now();

  if (packet) {
    lastFrameId = packet.frameId;
    frameIds.add(packet.frameId);
    lastPayloadHead = packet.payload
      .subarray(0, Math.min(packet.payload.length, 16))
      .toString("hex")
      .match(/.{1,2}/g)
      ?.join(" ") || "";

    if (!partialFrames.has(packet.frameId)) {
      partialFrames.set(packet.frameId, {
        width: packet.width,
        height: packet.height,
        total: packet.fragmentTotal,
        fragments: new Map(),
      });
    }

    const frame = partialFrames.get(packet.frameId);
    frame.fragments.set(packet.fragmentIndex, packet.payload);

    if (frame.fragments.size === frame.total) {
      const chunks = [];
      for (let i = 0; i < frame.total; i += 1) {
        const chunk = frame.fragments.get(i);
        if (!chunk) return;
        chunks.push(chunk);
      }

      const payload = Buffer.concat(chunks);
      const jpeg = makeJpegFromPayload({ width: frame.width, height: frame.height }, payload);
      if (jpeg) emitJpeg(jpeg);
      partialFrames.delete(packet.frameId);
    }

    while (partialFrames.size > 24) {
      const oldest = partialFrames.keys().next().value;
      partialFrames.delete(oldest);
    }
  }
});

udp.bind(0, () => {
  const address = udp.address();
  console.log(`[D16 UDP] listening on ${address.address}:${address.port}`);
  console.log(`[D16 UDP] sending init ${initPacket.toString("hex")} to ${droneHost}:${dronePort}`);
  sendInit();
  setInterval(sendInit, 1000);
});

app.use((_, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-store");
  next();
});

app.get("/status", (_, res) => {
  res.json(statusPayload());
});

app.get("/snapshot.jpg", (_, res) => {
  if (!lastJpeg) {
    res.status(503).type("text/plain").send("Belum ada frame JPEG dari D16.");
    return;
  }
  res.type("image/jpeg").send(lastJpeg);
});

app.get("/stream", (req, res) => {
  res.writeHead(200, {
    "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    "Pragma": "no-cache",
    "Connection": "close",
    "Content-Type": `multipart/x-mixed-replace; boundary=${MJPEG_BOUNDARY}`,
    "Access-Control-Allow-Origin": "*",
  });

  mjpegClients.add(res);
  if (lastJpeg) emitJpeg(lastJpeg);

  req.on("close", () => {
    mjpegClients.delete(res);
  });
});

app.get(["/", "/preview.svg"], (_, res) => {
  res.type("image/svg+xml").send(svgStatus());
});

app.listen(httpPort, () => {
  console.log(`[D16 HTTP] preview: http://127.0.0.1:${httpPort}/preview.svg`);
  console.log(`[D16 HTTP] stream : http://127.0.0.1:${httpPort}/stream`);
  console.log(`[D16 HTTP] snap   : http://127.0.0.1:${httpPort}/snapshot.jpg`);
  console.log(`[D16 HTTP] status : http://127.0.0.1:${httpPort}/status`);
});
