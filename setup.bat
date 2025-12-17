@echo off
echo ================================
echo BaloGPS - Setup Script
echo ================================
echo.

echo [1/4] Installing Backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Error: Backend installation failed
    pause
    exit /b 1
)
cd ..

echo.
echo [2/4] Installing Frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo Error: Frontend installation failed
    pause
    exit /b 1
)
cd ..

echo.
echo [3/4] Starting PostgreSQL with Docker...
docker-compose up -d postgres
if %errorlevel% neq 0 (
    echo Error: Failed to start PostgreSQL
    pause
    exit /b 1
)

echo Waiting for PostgreSQL to be ready...
timeout /t 10 /nobreak

echo.
echo [4/4] Running database migrations...
cd backend
call npm run db:migrate
if %errorlevel% neq 0 (
    echo Error: Migration failed
    pause
    exit /b 1
)
cd ..

echo.
echo ================================
echo Setup completed successfully!
echo ================================
echo.
echo Next steps:
echo 1. Run 'start-dev.bat' to start the application
echo 2. Open http://localhost:3001 in your browser
echo.
pause
