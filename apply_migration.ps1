param(
    [string]$PgPass = "Saki@123"
)

$env:PGPASSWORD = $PgPass
$sqlFile = Join-Path $PSScriptRoot "postgres_full_migration.sql"

if (-not (Test-Path $sqlFile)) {
    Write-Host "[ERROR] Migration SQL file not found: $sqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "Importing schema and data into PostgreSQL (tripnest database)..." -ForegroundColor Cyan
$output = psql -U postgres -d tripnest -p 5432 -f "$sqlFile" 2>&1
$hasErrors = $false

foreach ($line in $output) {
    if ($line -match "ERROR:") {
        Write-Host $line -ForegroundColor Red
        $hasErrors = $true
    }
}

if (-not $hasErrors) {
    Write-Host "[SUCCESS] All tables created and data migrated successfully!" -ForegroundColor Green
    
    # Verify counts
    $counts = psql -U postgres -d tripnest -p 5432 -t -c "SELECT 'Users: ' || count(*) FROM users; SELECT 'Trips: ' || count(*) FROM trips; SELECT 'Destinations: ' || count(*) FROM destination;"
    Write-Host "`nDatabase verification:" -ForegroundColor Yellow
    $counts | ForEach-Object { if (-not [string]::IsNullOrWhiteSpace($_)) { Write-Host "  $_" -ForegroundColor Yellow } }
} else {
    Write-Host "[WARNING] Migration finished with some warnings or errors. Check log output above." -ForegroundColor Yellow
}
