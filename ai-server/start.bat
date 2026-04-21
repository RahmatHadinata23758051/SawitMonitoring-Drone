@echo off
title Sawit AI Server - Port 8001
echo ==============================
echo   Sawit AI Server (FastAPI)
echo   MobileNetV2 Kematangan Sawit
echo   Port: http://localhost:8001
echo ==============================
echo.
echo [INFO] Memuat model (harap tunggu ~10 detik pertama kali)...
echo.

cd /d "%~dp0"
uvicorn main:app --host 0.0.0.0 --port 8001 --reload

pause
