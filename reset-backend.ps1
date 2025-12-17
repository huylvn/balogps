# Reset BaloGPS Backend
# This script will reset the entire backend (database + server)

Write-Host "🔄 RESET BALOGPS BACKEND" -ForegroundColor Yellow
Write-Host "=========================" -ForegroundColor Yellow
Write-Host ""

# Step 1: Stop all services
Write-Host "1. Stopping all services..." -ForegroundColor Cyan
docker-compose down
Write-Host "✓ Services stopped" -ForegroundColor Green
Write-Host ""

# Step 2: Remove database volume
Write-Host "2. Removing database volume..." -ForegroundColor Cyan
docker volume rm balogps_postgres_data -ErrorAction SilentlyContinue
Write-Host "✓ Database volume removed" -ForegroundColor Green
Write-Host ""

# Step 3: Start PostgreSQL
Write-Host "3. Starting fresh PostgreSQL..." -ForegroundColor Cyan
docker-compose up -d postgres
Write-Host "✓ PostgreSQL started" -ForegroundColor Green
Write-Host ""

# Step 4: Wait for PostgreSQL to be ready
Write-Host "4. Waiting for PostgreSQL to be ready..." -ForegroundColor Cyan
Start-Sleep -Seconds 10
Write-Host "✓ PostgreSQL ready" -ForegroundColor Green
Write-Host ""

# Step 5: Run migrations
Write-Host "5. Running database migrations..." -ForegroundColor Cyan
cd backend
npm run db:migrate
cd ..
Write-Host "✓ Migrations completed" -ForegroundColor Green
Write-Host ""

# Done
Write-Host "✅ BACKEND RESET COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Start backend: cd backend && npm run dev" -ForegroundColor White
Write-Host "2. Start frontend: cd frontend && npm start" -ForegroundColor White
Write-Host ""
