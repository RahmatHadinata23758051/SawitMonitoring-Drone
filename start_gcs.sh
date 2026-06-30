#!/bin/bash

# Buat folder logs jika belum ada
mkdir -p logs

echo "==========================================="
echo "   MEMULAI SEMUA KOMPONEN SERVER SAWIT GCS  "
echo "==========================================="

# 1. Jalankan Laravel Web Server (Port 8000)
if pgrep -f "artisan serve" > /dev/null; then
    echo "[!] Laravel Web Server sudah berjalan."
else
    echo "[+] Menjalankan Laravel Web Server di port 8000..."
    nohup php artisan serve --host=0.0.0.0 --port=8000 > logs/laravel.log 2>&1 &
fi

# 2. Jalankan Drone Server Proxy Node.js (Port 3001)
if pgrep -f "node index.js" > /dev/null; then
    echo "[!] Drone Server Proxy sudah berjalan."
else
    echo "[+] Menjalankan Drone Server Proxy..."
    cd drone-server
    nohup node index.js > ../logs/drone-server.log 2>&1 &
    cd ..
fi

# 3. Jalankan AI Inference Server FastAPI (Port 8001)
if pgrep -f "uvicorn main:app" > /dev/null; then
    echo "[!] AI Server FastAPI sudah berjalan."
else
    echo "[+] Menjalankan AI Inference Server FastAPI..."
    cd ai-server
    nohup venv/bin/uvicorn main:app --host 0.0.0.0 --port 8001 > ../logs/ai-server.log 2>&1 &
    cd ..
fi

echo "-------------------------------------------"
echo "[✓] Semua server telah dipicu di background!"
echo "    - Laravel: http://coba2.local:8000/gcs"
echo "    - Drone Server Proxy: http://coba2.local:3001"
echo "    - AI Server: http://coba2.local:8001"
echo "-------------------------------------------"
echo "Untuk melihat log aktivitas, Anda dapat membaca berkas di folder 'logs/':"
echo "  * tail -f logs/laravel.log"
echo "  * tail -f logs/drone-server.log"
echo "  * tail -f logs/ai-server.log"
echo "Untuk menghentikan semua server, jalankan: ./stop_gcs.sh"
echo "==========================================="
