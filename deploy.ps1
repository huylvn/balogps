#!/usr/bin/env pwsh

Write-Host "🚀 BaloGPS Docker Deployment" -ForegroundColor Cyan
Write-Host "============================`n" -ForegroundColor Cyan

# Check if Docker is running
Write-Host "📋 Checking Docker..." -ForegroundColor Yellow
try {
    docker version | Out-Null
    Write-Host "✅ Docker is running`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Stop existing containers
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose down
Write-Host "✅ Containers stopped`n" -ForegroundColor Green

# Build images
Write-Host "🔨 Building Docker images..." -ForegroundColor Yellow
Write-Host "   This may take a few minutes on first run...`n" -ForegroundColor Gray
docker-compose build --no-cache
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Images built successfully`n" -ForegroundColor Green

# Start containers
Write-Host "🚀 Starting containers..." -ForegroundColor Yellow
docker-compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to start containers!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Containers started`n" -ForegroundColor Green

# Wait for services to be ready
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check container status
Write-Host "`n📊 Container Status:" -ForegroundColor Cyan
docker-compose ps

# Show logs
Write-Host "`n📝 Recent logs:" -ForegroundColor Cyan
docker-compose logs --tail=20

Write-Host "`n✅ Deployment Complete!" -ForegroundColor Green
Write-Host "============================`n" -ForegroundColor Cyan
Write-Host "🌐 Application URLs:" -ForegroundColor Yellow
Write-Host "   HTTP:  http://localhost:3000" -ForegroundColor White
Write-Host "   HTTPS: https://localhost:3443" -ForegroundColor White
Write-Host ""
Write-Host "📊 Useful Commands:" -ForegroundColor Yellow
Write-Host "   View logs:        docker-compose logs -f" -ForegroundColor White
Write-Host "   Stop containers:  docker-compose down" -ForegroundColor White
Write-Host "   Restart:          docker-compose restart" -ForegroundColor White
Write-Host "   Shell access:     docker exec -it balogps-backend sh" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Note: Browser will show security warning for self-signed SSL cert" -ForegroundColor Gray
Write-Host "   Click 'Advanced' → 'Proceed to localhost' to continue`n" -ForegroundColor Gray
