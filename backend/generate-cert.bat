@echo off
REM Generate SSL certificate for Windows
echo Checking for OpenSSL...

where openssl >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: OpenSSL not found!
    echo.
    echo Please install OpenSSL:
    echo   Option 1: Download from https://slproweb.com/products/Win32OpenSSL.html
    echo   Option 2: Install via Chocolatey: choco install openssl
    echo   Option 3: Install via Scoop: scoop install openssl
    echo.
    echo After installation, add OpenSSL to your PATH and try again.
    pause
    exit /b 1
)

if not exist ssl mkdir ssl

if exist ssl\server.crt (
    echo Certificate already exists!
    echo Delete ssl\ directory to regenerate
    pause
    exit /b 0
)

echo Generating SSL certificate...
openssl req -x509 -newkey rsa:4096 -nodes -sha256 -subj "/CN=localhost" -keyout ssl\server.key -out ssl\server.crt -days 365

if %ERRORLEVEL% EQU 0 (
    echo.
    echo SUCCESS! SSL Certificate generated
    echo.
    echo Certificate: ssl\server.crt
    echo Private Key: ssl\server.key
    echo.
    echo Next steps:
    echo   1. Restart backend server
    echo   2. Access https://localhost:3443
    echo   3. Accept the certificate warning in browser
    echo.
    echo NOTE: This is for DEVELOPMENT ONLY
) else (
    echo.
    echo ERROR: Failed to generate certificate
)

pause
