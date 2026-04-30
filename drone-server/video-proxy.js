const net = require('net');
const WebSocket = require('ws');

// Konfigurasi Drone
const DRONE_IP = '192.168.169.1';
const DRONE_TCP_PORT = 8888; // Default port untuk video E88/D16 (wifi_uav)
const PROXY_WS_PORT = 8082;  // Port WebSocket yang akan diakses oleh GCS Web

// 1. Buat WebSocket Server untuk Web Client
const wss = new WebSocket.Server({ port: PROXY_WS_PORT }, () => {
    console.log(`🎥 [Video Proxy] WebSocket Server berjalan di ws://localhost:${PROXY_WS_PORT}`);
});

let clients = [];

wss.on('connection', (ws) => {
    console.log(`💻 [Client] Web browser terhubung! Total clients: ${wss.clients.size}`);
    clients.push(ws);

    ws.on('close', () => {
        console.log(`💻 [Client] Web browser terputus.`);
        clients = clients.filter((c) => c !== ws);
    });

    ws.on('error', (err) => {
        console.error(`💻 [Client] Error:`, err.message);
    });
});

// 2. Buat koneksi TCP ke Drone
let droneSocket = null;
let isConnected = false;

function connectToDrone() {
    if (isConnected) return;
    
    console.log(`🛰️  [Drone] Mencoba koneksi TCP ke ${DRONE_IP}:${DRONE_TCP_PORT}...`);
    
    droneSocket = new net.Socket();

    droneSocket.connect(DRONE_TCP_PORT, DRONE_IP, () => {
        isConnected = true;
        console.log(`🛰️  [Drone] BERHASIL terhubung ke aliran video drone!`);
    });

    droneSocket.on('data', (data) => {
        // Broadcast raw H.264 NAL units ke semua web clients
        for (const ws of clients) {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(data, { binary: true });
            }
        }
    });

    droneSocket.on('close', () => {
        if (isConnected) {
            console.log(`🛰️  [Drone] Koneksi video terputus. Mencoba reconnect dalam 3 detik...`);
        }
        isConnected = false;
        setTimeout(connectToDrone, 3000);
    });

    droneSocket.on('error', (err) => {
        if (err.code === 'ECONNREFUSED') {
            console.error(`🛰️  [Drone] Koneksi ditolak (Port ${DRONE_TCP_PORT} tertutup atau drone tidak siap).`);
        } else if (err.code === 'EHOSTUNREACH') {
            console.error(`🛰️  [Drone] Host tidak dapat dijangkau. Pastikan laptop terhubung ke WiFi Drone!`);
        } else {
            console.error(`🛰️  [Drone] Error:`, err.message);
        }
        droneSocket.destroy();
    });
}

// Mulai koneksi ke drone
connectToDrone();
