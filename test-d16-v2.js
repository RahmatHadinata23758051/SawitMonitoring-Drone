import dgram from 'dgram';

const DRONE_IP = '192.168.169.1';
const DRONE_PORT = 8800;
const client = dgram.createSocket('udp4');

let sequenceCounter = 0;

function buildPacket(roll = 0x80, pitch = 0x80, throttle = 0x80, yaw = 0x80, command = 0x00) {
    // Total packet size must be 88 bytes (0x58)
    const packet = Buffer.alloc(88, 0x00);
    
    // 0-3: Magic & Size (0x58 = 88)
    packet.writeUInt8(0xef, 0);
    packet.writeUInt8(0x02, 1);
    packet.writeUInt8(0x58, 2);
    packet.writeUInt8(0x00, 3);
    
    // 4-7: Magic 2
    packet.writeUInt8(0x02, 4);
    packet.writeUInt8(0x02, 5);
    packet.writeUInt8(0x00, 6);
    packet.writeUInt8(0x01, 7);
    
    // 8-11: Padding
    // (All zeros)
    
    // 12-15: Dynamic Sequence Counter (Little Endian)
    packet.writeUInt32LE(sequenceCounter, 12);
    
    // 16-19: Magic 3
    packet.writeUInt8(0x14, 16);
    packet.writeUInt8(0x00, 17);
    packet.writeUInt8(0x66, 18);
    packet.writeUInt8(0x14, 19);
    
    // 20-25: Controls
    const headless = 0x02;
    packet.writeUInt8(roll, 20);
    packet.writeUInt8(pitch, 21);
    packet.writeUInt8(throttle, 22);
    packet.writeUInt8(yaw, 23);
    packet.writeUInt8(command, 24);
    packet.writeUInt8(headless, 25);
    
    // 26-35: 10 bytes zero padding
    // (Already zero)
    
    // 36: Checksum (XOR of controls)
    const checksum = roll ^ pitch ^ throttle ^ yaw ^ command ^ headless;
    packet.writeUInt8(checksum, 36);
    
    // 37: Static suffix start
    packet.writeUInt8(0x99, 37);
    
    // 38-81: 44 bytes zero padding
    // (Already zero)
    
    // 82-87: Static tail (32 4b 14 2d 00 00)
    packet.writeUInt8(0x32, 82);
    packet.writeUInt8(0x4b, 83);
    packet.writeUInt8(0x14, 84);
    packet.writeUInt8(0x2d, 85);
    // 86, 87 are zero
    
    sequenceCounter++; // Increment for the next packet!
    return packet;
}

const COMMAND_TAKEOFF = 0x01;
const COMMAND_LAND = 0x02;

console.log("🚁 D16 Mini Drone - V2 Test Script (Dynamic Sequence Counter)");
console.log("-----------------------------------------------------------------");

const args = process.argv.slice(2);
const action = args[0] ? args[0].toLowerCase() : '';

let commandByte = 0x00;

if (action === 'takeoff') {
    commandByte = COMMAND_TAKEOFF;
    console.log("🚀 MENGIRIM PERINTAH: TAKEOFF...");
} else if (action === 'land') {
    commandByte = COMMAND_LAND;
    console.log("🛬 MENGIRIM PERINTAH: LAND...");
} else {
    console.log("⚠️ Penggunaan: node test-d16-v2.js [takeoff | land]");
    process.exit(1);
}

// Kirim secara kontinu selama 2 detik agar drone yakin ini bukan spoofing
let count = 0;
const interval = setInterval(() => {
    const packet = buildPacket(0x80, 0x80, 0x80, 0x80, commandByte);
    client.send(packet, 0, packet.length, DRONE_PORT, DRONE_IP, (err) => {
        if (err) console.error("Error mengirim:", err);
        else console.log(`[Seq: ${sequenceCounter-1}] Paket terkirim: ${packet.toString('hex').substring(0, 56)}...`);
    });
    
    count++;
    if (count >= 20) { // Kirim 20 paket berturut-turut (1 per 100ms = 2 detik)
        clearInterval(interval);
        setTimeout(() => {
            console.log("✅ Transmisi Selesai.");
            client.close();
            process.exit(0);
        }, 500);
    }
}, 100);
