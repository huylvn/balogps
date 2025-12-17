@echo off
REM Start BaloGPS with HTTPS support
chcp 65001 >nul
echo.
echo ========================================
echo 🚀 Starting BaloGPS with HTTPS...
echo ========================================
echo.

REM Check if in correct directory
if not exist "backend" (
    echo ❌ Error: backend directory not found
    echo Please run this script from project root
    pause
    exit /b 1
)

REM Check if SSL certificate exists
if not exist "backend\ssl\server.crt" (
    echo ⚠️  SSL certificate not found
    echo.
    echo Generating certificate...
    cd backend
    
    where openssl >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ OpenSSL not found!
        echo.
        echo Please install OpenSSL:
        echo   Option 1: choco install openssl
        echo   Option 2: scoop install openssl
        echo   Option 3: Download from https://slproweb.com/products/Win32OpenSSL.html
        echo.
        pause
        exit /b 1
    )
    
    call generate-cert.bat
    cd ..
    echo.
)

REM Start backend
echo 📦 Starting Backend Server...
cd backend

if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

start "BaloGPS Backend" cmd /k "npm start"

cd ..

echo.
echo ========================================
echo 🎉 BaloGPS is running!
echo ========================================
echo.
echo 📡 Backend API:
echo    HTTP:  http://localhost:3000/api
echo    HTTPS: https://localhost:3443/api
echo.
echo 🌐 Frontend:
echo    HTTP:  http://localhost:3000
echo    HTTPS: https://localhost:3443
echo.
echo 📱 Tracker (for iPhone):
echo    HTTPS: https://localhost:3443/tracker.html
echo.
echo ⚠️  Browser Warning:
echo    Accept the self-signed certificate warning
echo    Click 'Advanced' then 'Proceed'
echo.
echo 📖 For iPhone testing:
echo    Use ngrok: ngrok http 3000
echo    See IPHONE_TESTING.md for details
echo.
echo 🛑 To stop: Close the backend window or run stop-all.bat
echo ========================================
echo.

REM Open browser
timeout /t 2 >nul
start https://localhost:3443

pause
