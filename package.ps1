#!/usr/bin/env pwsh

Write-Host "📦 BaloGPS - Package for Transfer" -ForegroundColor Cyan
Write-Host "=================================`n" -ForegroundColor Cyan

# Output file
$outputFile = "BaloGPS-Transfer.zip"

# Folders to exclude (giảm dung lượng)
$excludeFolders = @(
    "node_modules",
    "build",
    "dist",
    "ssl",
    ".git",
    "postgres_data",
    "backups",
    "logs"
)

Write-Host "🗑️  Cleaning up..." -ForegroundColor Yellow

# Xóa các thư mục không cần thiết
foreach ($folder in $excludeFolders) {
    if (Test-Path "backend\$folder") {
        Write-Host "   Removing backend\$folder" -ForegroundColor Gray
        Remove-Item -Recurse -Force "backend\$folder" -ErrorAction SilentlyContinue
    }
    if (Test-Path "frontend\$folder") {
        Write-Host "   Removing frontend\$folder" -ForegroundColor Gray
        Remove-Item -Recurse -Force "frontend\$folder" -ErrorAction SilentlyContinue
    }
    if (Test-Path $folder) {
        Write-Host "   Removing $folder" -ForegroundColor Gray
        Remove-Item -Recurse -Force $folder -ErrorAction SilentlyContinue
    }
}

Write-Host "✅ Cleanup complete`n" -ForegroundColor Green

# Xóa file ZIP cũ nếu có
if (Test-Path $outputFile) {
    Write-Host "🗑️  Removing old $outputFile..." -ForegroundColor Yellow
    Remove-Item $outputFile -Force
}

# Nén project
Write-Host "📦 Creating archive..." -ForegroundColor Yellow
Write-Host "   This may take a few minutes...`n" -ForegroundColor Gray

try {
    Compress-Archive -Path * -DestinationPath $outputFile -CompressionLevel Optimal
    
    $fileSize = (Get-Item $outputFile).Length / 1MB
    Write-Host "✅ Package created successfully!`n" -ForegroundColor Green
    Write-Host "📄 File: $outputFile" -ForegroundColor Cyan
    Write-Host "📊 Size: $([math]::Round($fileSize, 2)) MB`n" -ForegroundColor Cyan
    
    Write-Host "📋 Next Steps:" -ForegroundColor Yellow
    Write-Host "   1. Copy $outputFile to the new computer" -ForegroundColor White
    Write-Host "   2. Extract the archive" -ForegroundColor White
    Write-Host "   3. Install Docker Desktop" -ForegroundColor White
    Write-Host "   4. Run .\deploy.ps1`n" -ForegroundColor White
    
    Write-Host "📚 See TRANSFER.md for detailed instructions`n" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ Error creating archive: $_" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Done!" -ForegroundColor Green
