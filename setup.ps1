Write-Host "================================" -ForegroundColor Green
Write-Host "BaloGPS - Setup Script" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

Write-Host "[1/4] Installing Backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Backend installation failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Set-Location ..

Write-Host ""
Write-Host "[2/4] Installing Frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Frontend installation failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Set-Location ..

Write-Host ""
Write-Host "[3/4] Starting PostgreSQL with Docker..." -ForegroundColor Yellow
docker-compose up -d postgres
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to start PostgreSQL" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Waiting for PostgreSQL to be ready..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "[4/4] Running database migrations..." -ForegroundColor Yellow
Set-Location backend
npm run db:migrate
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Migration failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Set-Location ..

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "Setup completed successfully!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Run '.\start-dev.ps1' to start the application" -ForegroundColor White
Write-Host "2. Open http://localhost:3001 in your browser" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to exit"
