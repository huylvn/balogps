@echo off
echo ================================
echo BaloGPS - Starting Development
echo ================================
echo.

echo Starting Backend on port 3000...
start "BaloGPS Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak

echo Starting Frontend on port 3001...
start "BaloGPS Frontend" cmd /k "cd frontend && npm start"

echo.
echo ================================
echo Services started!
echo ================================
echo.
echo Backend:  http://localhost:3000/api
echo Frontend: http://localhost:3001
echo Tracker:  http://localhost:3000/tracker.html
echo.
echo Press any key to stop all services...
pause > nul

taskkill /FI "WINDOWTITLE eq BaloGPS Backend" /T /F
taskkill /FI "WINDOWTITLE eq BaloGPS Frontend" /T /F

echo.
echo Services stopped.
pause
