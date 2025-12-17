# Start BaloGPS with HTTPS support
Write-Host "🚀 Starting BaloGPS with HTTPS..." -ForegroundColor Green
Write-Host ""

# Check if in correct directory
if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    Write-Host "   Current directory: $PWD" -ForegroundColor Yellow
    Write-Host "   Expected: d:\Work\BaloGPS\" -ForegroundColor Yellow
    pause
    exit 1
}

# Check if SSL certificate exists
$certPath = "backend\ssl\server.crt"
$keyPath = "backend\ssl\server.key"

if (-not (Test-Path $certPath) -or -not (Test-Path $keyPath)) {
    Write-Host "⚠️  SSL certificate not found" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Generating self-signed certificate..." -ForegroundColor Cyan
    
    Push-Location backend
    
    # Check if OpenSSL is available
    $openssl = Get-Command openssl -ErrorAction SilentlyContinue
    
    if ($null -eq $openssl) {
        Write-Host "❌ OpenSSL not found!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please install OpenSSL:" -ForegroundColor Yellow
        Write-Host "  Option 1: choco install openssl" -ForegroundColor White
        Write-Host "  Option 2: scoop install openssl" -ForegroundColor White
        Write-Host "  Option 3: Download from https://slproweb.com/products/Win32OpenSSL.html" -ForegroundColor White
        Write-Host ""
        Write-Host "After installation, restart PowerShell and run this script again." -ForegroundColor Yellow
        Pop-Location
        pause
        exit 1
    }
    
    # Run generate-cert script
    node generate-cert.js
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to generate certificate" -ForegroundColor Red
        Pop-Location
        pause
        exit 1
    }
    
    Pop-Location
    Write-Host ""
}

# Start backend
Write-Host "📦 Starting Backend Server..." -ForegroundColor Cyan
Push-Location backend

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ npm install failed" -ForegroundColor Red
        Pop-Location
        pause
        exit 1
    }
}

# Start backend in background
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm start" -WindowStyle Normal

Pop-Location
Write-Host "✅ Backend started" -ForegroundColor Green

# Wait a bit for backend to start
Write-Host ""
Write-Host "Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host "🎉 BaloGPS is running!" -ForegroundColor Green
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host ""
Write-Host "📡 Backend API:" -ForegroundColor White
Write-Host "   HTTP:  http://localhost:3000/api" -ForegroundColor Gray
Write-Host "   HTTPS: https://localhost:3443/api" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Frontend:" -ForegroundColor White
Write-Host "   HTTP:  http://localhost:3000" -ForegroundColor Gray
Write-Host "   HTTPS: https://localhost:3443" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Tracker (for iPhone):" -ForegroundColor White
Write-Host "   HTTPS: https://localhost:3443/tracker.html" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  Browser Warning:" -ForegroundColor Yellow
Write-Host "   When accessing HTTPS for the first time, you'll see a security warning" -ForegroundColor White
Write-Host "   because this is a self-signed certificate. Click 'Advanced' then 'Proceed'." -ForegroundColor White
Write-Host ""
Write-Host "📖 For iPhone testing:" -ForegroundColor White
Write-Host "   Self-signed cert won't work on iPhone. Use ngrok instead:" -ForegroundColor White
Write-Host "   1. Open new terminal: ngrok http 3000" -ForegroundColor Gray
Write-Host "   2. Use the ngrok HTTPS URL on your iPhone" -ForegroundColor Gray
Write-Host "   3. See IPHONE_TESTING.md for details" -ForegroundColor Gray
Write-Host ""
Write-Host "🛑 To stop:" -ForegroundColor White
Write-Host "   Close the backend PowerShell window or run: .\stop-all.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "=" * 70 -ForegroundColor Cyan

# Open browser to HTTPS URL
Write-Host ""
Write-Host "Opening browser..." -ForegroundColor Cyan
Start-Sleep -Seconds 2
Start-Process "https://localhost:3443"

Write-Host ""
Write-Host "Press any key to exit this window (backend will keep running)..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
