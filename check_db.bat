@echo off
title Check TripNest PostgreSQL Database
echo ===================================================
echo       Checking TripNest PostgreSQL Database
echo ===================================================
echo.

set "PG_BIN="
if exist "C:\Program Files\PostgreSQL\18\bin\psql.exe" set "PG_BIN=C:\Program Files\PostgreSQL\18\bin"
if exist "C:\Program Files\PostgreSQL\17\bin\psql.exe" set "PG_BIN=C:\Program Files\PostgreSQL\17\bin"
if exist "C:\Program Files\PostgreSQL\16\bin\psql.exe" set "PG_BIN=C:\Program Files\PostgreSQL\16\bin"
if exist "C:\Program Files\PostgreSQL\15\bin\psql.exe" set "PG_BIN=C:\Program Files\PostgreSQL\15\bin"

if not "%PG_BIN%"=="" set "PATH=%PG_BIN%;%PATH%"

set PGPASSWORD=Saki@123

echo [1] Testing connection to PostgreSQL (password: Saki@123)...
psql -U postgres -h localhost -p 5432 -c "SELECT version();" 2>&1
if %ERRORLEVEL% neq 0 (
    echo.
    echo Connection failed with password Saki@123. Trying with password 'root'...
    set PGPASSWORD=root
    psql -U postgres -h localhost -p 5432 -c "SELECT version();" 2>&1
)

echo.
echo [2] Checking database 'tripnest'...
psql -U postgres -h localhost -p 5432 -d tripnest -c "\dt" 2>&1

echo.
echo [3] Checking record counts...
psql -U postgres -h localhost -p 5432 -d tripnest -c "SELECT 'Users: ' || count(*) FROM users; SELECT 'Trips: ' || count(*) FROM trips; SELECT 'Destinations: ' || count(*) FROM destination;" 2>&1

echo.
echo ===================================================
echo Check complete.
echo ===================================================
pause
