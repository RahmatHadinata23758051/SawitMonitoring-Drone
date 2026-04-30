const http = require("http");
const net = require("net");
const os = require("os");

const host = process.argv[2] || "192.168.169.1";
const timeoutMs = Number(process.argv[3] || 1200);

const ports = [80, 81, 8080, 8081, 8888, 8899, 9000, 7060];
const paths = [
  "/",
  "/stream",
  "/video",
  "/live",
  "/mjpeg",
  "/?action=stream",
  "/videostream.cgi",
  "/mjpg/video.mjpg",
  "/cam.mjpg",
];

function getIpv4Interfaces() {
  const items = [];
  const interfaces = os.networkInterfaces();

  for (const [name, addresses] of Object.entries(interfaces)) {
    for (const address of addresses || []) {
      if (address.family === "IPv4" && !address.internal) {
        items.push({
          name,
          address: address.address,
          netmask: address.netmask,
        });
      }
    }
  }

  return items;
}

function printNetworkHint() {
  const ipv4 = getIpv4Interfaces();
  const expectedPrefix = host.split(".").slice(0, 3).join(".") + ".";
  const matching = ipv4.filter((item) => item.address.startsWith(expectedPrefix));

  console.log("IPv4 adapter aktif:");
  if (ipv4.length === 0) {
    console.log("- Tidak ada IPv4 adapter aktif.");
  } else {
    for (const item of ipv4) {
      console.log(`- ${item.name}: ${item.address} / ${item.netmask}`);
    }
  }
  console.log("");

  if (matching.length === 0) {
    console.log(`PERINGATAN: Tidak ada adapter dengan IP ${expectedPrefix}x.`);
    console.log(`Untuk D16 default (${host}), laptop biasanya harus mendapat IP 192.168.169.x dari WiFi drone.`);
    console.log("Jika Windows reconnect ke WiFi rumah/kampus karena WiFi drone tidak ada internet, probe tidak bisa menjangkau drone.");
    console.log("");
  }
}

function checkTcpPort(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;

    const done = (open) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve({ port, open });
    };

    socket.setTimeout(timeoutMs);
    socket.once("connect", () => done(true));
    socket.once("timeout", () => done(false));
    socket.once("error", () => done(false));
    socket.connect(port, host);
  });
}

function checkHttpUrl(port, path) {
  return new Promise((resolve) => {
    const url = `http://${host}:${port}${path}`;
    const req = http.get(url, { timeout: timeoutMs }, (res) => {
      const contentType = res.headers["content-type"] || "";
      let firstBytes = 0;

      res.once("data", (chunk) => {
        firstBytes = chunk.length;
        req.destroy();
      });

      res.once("end", () => {
        resolve({ url, status: res.statusCode, contentType, firstBytes });
      });

      setTimeout(() => {
        req.destroy();
        resolve({ url, status: res.statusCode, contentType, firstBytes });
      }, timeoutMs);
    });

    req.once("timeout", () => {
      req.destroy();
      resolve(null);
    });

    req.once("error", () => resolve(null));
  });
}

async function main() {
  console.log(`[camera-probe] Target: ${host}`);
  console.log(`[camera-probe] Timeout: ${timeoutMs}ms`);
  console.log("");
  printNetworkHint();

  const tcpResults = await Promise.all(ports.map(checkTcpPort));
  const openPorts = tcpResults.filter((item) => item.open).map((item) => item.port);

  if (openPorts.length === 0) {
    console.log("Tidak ada port TCP umum yang terbuka.");
    console.log("Pastikan laptop sudah connect ke WiFi drone D16 dan drone dalam keadaan ON.");
    return;
  }

  console.log(`Port TCP terbuka: ${openPorts.join(", ")}`);
  console.log("");

  const checks = [];
  for (const port of openPorts) {
    for (const path of paths) {
      checks.push(checkHttpUrl(port, path));
    }
  }

  const results = (await Promise.all(checks)).filter(Boolean);
  const interesting = results.filter((item) => {
    const type = item.contentType.toLowerCase();
    return item.status < 500 && (
      type.includes("image") ||
      type.includes("video") ||
      type.includes("mpegurl") ||
      type.includes("octet-stream") ||
      item.firstBytes > 0
    );
  });

  if (interesting.length === 0) {
    console.log("Belum ketemu endpoint HTTP stream.");
    console.log("Kemungkinan kamera memakai protokol app proprietary atau raw video.");
    console.log("Coba sniff traffic app bawaan dengan Wireshark, lalu arahkan hasil proxy ke GCS.");
    return;
  }

  console.log("Kandidat URL stream:");
  for (const item of interesting) {
    console.log(`- ${item.url} | status=${item.status} | type=${item.contentType || "-"} | bytes=${item.firstBytes}`);
  }
  console.log("");
  console.log("Masukkan URL kandidat ke GCS > Pengaturan > Video Stream > D16 / Custom Stream URL.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
