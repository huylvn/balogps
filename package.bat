@echo off
echo ================================
echo BaloGPS - Package for Transfer
echo ================================
echo.

set OUTPUT_FILE=BaloGPS-Transfer.zip

echo Cleaning up...
rd /s /q backend\node_modules 2>nul
rd /s /q frontend\node_modules 2>nul
rd /s /q backend\build 2>nul
rd /s /q frontend\build 2>nul
rd /s /q backend\ssl 2>nul
rd /s /q postgres_data 2>nul
rd /s /q backups 2>nul
rd /s /q logs 2>nul
echo Cleanup complete
echo.

echo Removing old package...
del %OUTPUT_FILE% 2>nul

echo Creating archive...
echo This may take a few minutes...
powershell -Command "Compress-Archive -Path * -DestinationPath %OUTPUT_FILE% -CompressionLevel Optimal"

if %errorlevel% neq 0 (
    echo ERROR: Failed to create archive
    pause
    exit /b 1
)

echo.
echo ================================
echo Package created successfully!
echo ================================
echo.
echo File: %OUTPUT_FILE%
echo.
echo Next Steps:
echo   1. Copy %OUTPUT_FILE% to the new computer
echo   2. Extract the archive
echo   3. Install Docker Desktop
echo   4. Run deploy.bat or deploy.ps1
echo.
echo See TRANSFER.md for detailed instructions
echo.
pause
