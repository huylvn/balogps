@echo off
REM Reset BaloGPS Backend
REM This script will reset the entire backend (database + server)

echo ======================================
echo    RESET BALOGPS BACKEND
echo ======================================
echo.

REM Step 1: Stop all services
echo 1. Stopping all services...
docker-compose down
echo    Done!
echo.

REM Step 2: Remove database volume
echo 2. Removing database volume...
docker volume rm balogps_postgres_data 2>nul
echo    Done!
echo.

REM Step 3: Start PostgreSQL
echo 3. Starting fresh PostgreSQL...
docker-compose up -d postgres
echo    Done!
echo.

REM Step 4: Wait for PostgreSQL
echo 4. Waiting for PostgreSQL to be ready...
timeout /t 10 /nobreak >nul
echo    Done!
echo.

REM Step 5: Run migrations
echo 5. Running database migrations...
cd backend
call npm run db:migrate
cd ..
echo    Done!
echo.

echo ======================================
echo    BACKEND RESET COMPLETE!
echo ======================================
echo.
echo Next steps:
echo 1. Start backend: cd backend ^&^& npm run dev
echo 2. Start frontend: cd frontend ^&^& npm start
echo.
pause
