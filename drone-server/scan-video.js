const dgram = require('dgram');

const ports = [8800, 8888, 8080, 7070, 9000, 5000, 50000];
const sockets = [];

console.log("Mendengarkan traffic UDP dari drone...");

ports.forEach(port => {
    const server = dgram.createSocket('udp4');
    
    server.on('error', (err) => {
        console.log(`Error di port ${port}:\n${err.stack}`);
        server.close();
    });

    server.on('message', (msg, rinfo) => {
        if (rinfo.address === '192.168.169.1') {
            // Ignore small control heartbeat packets (usually 88 bytes)
            if (msg.length !== 88) {
                console.log(`[VIDEO DETECTED?] Port ${port} menerima ${msg.length} bytes dari ${rinfo.address}:${rinfo.port}`);
            }
        }
    });

    server.on('listening', () => {
        const address = server.address();
        console.log(`Listening UDP on port ${address.port}`);
    });

    try {
        server.bind(port);
        sockets.push(server);
    } catch(e) {
        console.log(`Gagal bind port ${port}`);
    }
});

// Tutup setelah 10 detik
setTimeout(() => {
    console.log("Selesai scan.");
    sockets.forEach(s => s.close());
    process.exit(0);
}, 10000);
