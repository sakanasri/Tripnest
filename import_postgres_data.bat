@echo off
title TripNest PostgreSQL Setup & Data Migration
echo ========================================================
echo       TripNest: PostgreSQL Setup & Data Migration
echo ========================================================
echo.

:: Detect PostgreSQL Installation bin path
set "PG_BIN="
if exist "C:\Program Files\PostgreSQL\18\bin\psql.exe" set "PG_BIN=C:\Program Files\PostgreSQL\18\bin"
if exist "C:\Program Files\PostgreSQL\17\bin\psql.exe" set "PG_BIN=C:\Program Files\PostgreSQL\17\bin"
if exist "C:\Program Files\PostgreSQL\16\bin\psql.exe" set "PG_BIN=C:\Program Files\PostgreSQL\16\bin"
if exist "C:\Program Files\PostgreSQL\15\bin\psql.exe" set "PG_BIN=C:\Program Files\PostgreSQL\15\bin"

if "%PG_BIN%"=="" (
    where psql >nul 2>&1
    if %ERRORLEVEL% equ 0 (
        for /f "delims=" %%i in ('where psql') do (
            set "PG_BIN=%%~dpi"
            goto :found_pg
        )
    )
    echo [ERROR] PostgreSQL was not found in Program Files or system PATH.
    echo Please make sure you have finished running postgresql-18.6-5-windows-x64.exe installer.
    pause
    exit /b 1
)

:found_pg
set "PATH=%PG_BIN%;%PATH%"
echo [OK] Found PostgreSQL at: %PG_BIN%
echo.

set PGPASSWORD=Saki@123

echo [1/3] Checking connection to PostgreSQL...
psql -U postgres -p 5432 -c "SELECT 1;" >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [!] Could not connect with password 'Saki@123'.
    echo Please enter your PostgreSQL 'postgres' user password:
    set /p PGPASSWORD=Password: 
)

echo [2/3] Ensuring 'tripnest' database exists...
psql -U postgres -p 5432 -tc "SELECT 1 FROM pg_database WHERE datname = 'tripnest'" | findstr "1" >nul
if %ERRORLEVEL% neq 0 (
    echo Creating database 'tripnest'...
    psql -U postgres -p 5432 -c "CREATE DATABASE tripnest;"
) else (
    echo Database 'tripnest' already exists.
)

echo.
echo [3/3] Generating Hibernate schema and importing data...
powershell -ExecutionPolicy Bypass -File "%~dp0apply_migration.ps1" -PgPass "%PGPASSWORD%"

echo.
echo ========================================================
echo   Migration complete! You can now run start-tripnest.bat
echo ========================================================
pause
