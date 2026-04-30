const net = require('net');

const DRONE_IP = '192.168.169.1';
const portsToScan = [
    554,   // RTSP
    5000,  // Generic UDP/TCP video
    6000,  // Generic video
    7070,  // Common D16 / WiFi UAV alternate
    8000,  // Video HTTP/TCP
    8080,  // Generic HTTP
    8888,  // Common E88/wifi_uav TCP
    9000,  // Generic stream
    50000  // Common control/video
];

console.log(`🔍 Memulai scan TCP Port pada ${DRONE_IP}...`);

let openPorts = [];
let scannedCount = 0;

portsToScan.forEach(port => {
    const socket = new net.Socket();
    socket.setTimeout(1500); // Timeout 1.5 detik

    socket.connect(port, DRONE_IP, () => {
        console.log(`✅ PORT ${port} OPEN! (Mungkin ini port videonya)`);
        openPorts.push(port);
        socket.destroy();
    });

    socket.on('timeout', () => {
        socket.destroy();
    });

    socket.on('error', (err) => {
        // Port closed (ECONNREFUSED)
    });

    socket.on('close', () => {
        scannedCount++;
        if (scannedCount === portsToScan.length) {
            console.log('\n--- SCAN SELESAI ---');
            if (openPorts.length > 0) {
                console.log(`Port TCP yang terbuka: ${openPorts.join(', ')}`);
            } else {
                console.log(`Semua port TCP yang dites tertutup. Kemungkinan drone menggunakan full UDP.`);
            }
        }
    });
});
