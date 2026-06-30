#!/bin/bash

echo "==========================================="
echo "   MENGHENTIKAN SEMUA KOMPONEN SERVER GCS  "
echo "==========================================="

# 1. Hentikan Laravel
if pkill -f "artisan serve" > /dev/null; then
    echo "[✓] Laravel Web Server dihentikan."
else
    echo "[-] Laravel Web Server tidak sedang berjalan."
fi

# 2. Hentikan Drone Server (Node.js)
if pkill -f "node index.js" > /dev/null; then
    echo "[✓] Drone Server Proxy dihentikan."
else
    echo "[-] Drone Server Proxy tidak sedang berjalan."
fi

# 3. Hentikan AI Server (FastAPI / Uvicorn)
if pkill -f "uvicorn main:app" > /dev/null; then
    echo "[✓] AI Inference Server dihentikan."
else
    echo "[-] AI Inference Server tidak sedang berjalan."
fi

echo "==========================================="
