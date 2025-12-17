Write-Host "================================" -ForegroundColor Red
Write-Host "BaloGPS - Stop All Services" -ForegroundColor Red
Write-Host "================================" -ForegroundColor Red
Write-Host ""

Write-Host "Stopping Docker containers..." -ForegroundColor Yellow
docker-compose down

Write-Host "Stopping Node processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host ""
Write-Host "All services stopped." -ForegroundColor Green
Write-Host ""
