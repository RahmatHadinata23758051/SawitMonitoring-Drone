const fs = require("fs");
const path = require("path");

const inputPath = process.argv[2];

if (!inputPath) {
  console.error("Usage: node d16-frame-extract.js captures\\d16-udp-xxxx.bin");
  process.exit(1);
}

const raw = fs.readFileSync(inputPath);
const outDir = path.join(path.dirname(inputPath), path.basename(inputPath, path.extname(inputPath)) + "-frames");
fs.mkdirSync(outDir, { recursive: true });

const frames = new Map();
let offset = 0;
let packets = 0;

while (offset + 56 <= raw.length) {
  if (raw[offset] !== 0x93 || raw[offset + 1] !== 0x01) {
    console.error(`Bad D16 packet magic at offset ${offset}`);
    break;
  }

  const length = raw.readUInt16LE(offset + 2);
  if (length <= 56 || offset + length > raw.length) {
    console.error(`Bad D16 packet length ${length} at offset ${offset}`);
    break;
  }

  const packet = raw.subarray(offset, offset + length);
  const fragmentIndex = packet.readUInt32LE(32);
  const fragmentTotal = packet.readUInt32LE(36);
  const frameId = packet.readUInt32LE(40);
  const payload = packet.subarray(56);

  if (!frames.has(frameId)) {
    frames.set(frameId, {
      fragmentTotal,
      fragments: new Map(),
    });
  }

  frames.get(frameId).fragments.set(fragmentIndex, payload);
  packets += 1;
  offset += length;
}

let complete = 0;
let incomplete = 0;
let payloadBytes = 0;

for (const [frameId, frame] of frames) {
  const chunks = [];
  for (let i = 0; i < frame.fragmentTotal; i++) {
    const fragment = frame.fragments.get(i);
    if (!fragment) break;
    chunks.push(fragment);
  }

  if (chunks.length === frame.fragmentTotal) complete += 1;
  else incomplete += 1;

  const frameBytes = Buffer.concat(chunks);
  payloadBytes += frameBytes.length;
  const outPath = path.join(outDir, `frame-${String(frameId).padStart(6, "0")}.bin`);
  fs.writeFileSync(outPath, frameBytes);
}

console.log(`Input          : ${inputPath}`);
console.log(`Parsed bytes   : ${offset} / ${raw.length}`);
console.log(`Packets        : ${packets}`);
console.log(`Frames         : ${frames.size}`);
console.log(`Complete       : ${complete}`);
console.log(`Incomplete     : ${incomplete}`);
console.log(`Payload bytes  : ${payloadBytes}`);
console.log(`Output folder  : ${outDir}`);
console.log("");
console.log("Catatan: frame .bin ini masih payload proprietary D16. Jika tidak ada marker JPEG/H.264, perlu decoder/proxy khusus app WiFi UAV.");
