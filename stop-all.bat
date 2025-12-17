@echo off
echo ================================
echo BaloGPS - Stop All Services
echo ================================
echo.

echo Stopping Docker containers...
docker-compose down

echo Stopping Node processes...
taskkill /FI "WINDOWTITLE eq BaloGPS*" /T /F 2>nul

echo.
echo All services stopped.
pause
