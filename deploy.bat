@echo off
echo ================================
echo BaloGPS Docker Deployment
echo ================================
echo.

REM Check if Docker is running
echo Checking Docker...
docker version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)
echo Docker is running
echo.

REM Stop existing containers
echo Stopping existing containers...
docker-compose down
echo.

REM Build images
echo Building Docker images...
echo This may take a few minutes on first run...
docker-compose build --no-cache
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)
echo Build successful
echo.

REM Start containers
echo Starting containers...
docker-compose up -d
if %errorlevel% neq 0 (
    echo ERROR: Failed to start containers!
    pause
    exit /b 1
)
echo.

REM Wait for services
echo Waiting for services to be ready...
timeout /t 10 /nobreak >nul
echo.

REM Show status
echo Container Status:
docker-compose ps
echo.

echo ================================
echo Deployment Complete!
echo ================================
echo.
echo Application URLs:
echo   HTTP:  http://localhost:3000
echo   HTTPS: https://localhost:3443
echo.
echo Useful Commands:
echo   View logs:        docker-compose logs -f
echo   Stop containers:  docker-compose down
echo   Restart:          docker-compose restart
echo.
echo Note: Browser will show security warning for self-signed SSL cert
echo       Click 'Advanced' - 'Proceed to localhost' to continue
echo.
pause
