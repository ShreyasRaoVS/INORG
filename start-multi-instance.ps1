# Quick Start Script for Testing Multi-Instance Setup
# This script starts 3 instances locally for testing

Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  INORG ERP - Multi-Instance Test Setup" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check if Redis is running
Write-Host "✓ Checking Redis..." -ForegroundColor Yellow
try {
    $redisTest = redis-cli ping 2>$null
    if ($redisTest -eq "PONG") {
        Write-Host "  Redis is running ✓" -ForegroundColor Green
    } else {
        throw "Redis not responding"
    }
} catch {
    Write-Host "  ❌ Redis is not running!" -ForegroundColor Red
    Write-Host "  Please start Redis first:" -ForegroundColor Yellow
    Write-Host "    - Docker: docker run -d --name redis -p 6379:6379 redis:7-alpine" -ForegroundColor White
    Write-Host "    - Windows: Download from https://github.com/tporadowski/redis/releases" -ForegroundColor White
    Write-Host "    - WSL: sudo service redis-server start" -ForegroundColor White
    exit 1
}

# Check if PostgreSQL is accessible
Write-Host "✓ Checking Database..." -ForegroundColor Yellow
if (Test-Path .env) {
    Write-Host "  .env file found ✓" -ForegroundColor Green
} else {
    Write-Host "  ⚠ .env file not found. Please create it from .env.example" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Starting 3 instances for testing..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Instance 1: http://localhost:5001" -ForegroundColor White
Write-Host "Instance 2: http://localhost:5002" -ForegroundColor White
Write-Host "Instance 3: http://localhost:5003" -ForegroundColor White
Write-Host ""
Write-Host "Health checks:" -ForegroundColor White
Write-Host "  curl http://localhost:5001/api/health" -ForegroundColor Gray
Write-Host "  curl http://localhost:5002/api/health" -ForegroundColor Gray
Write-Host "  curl http://localhost:5003/api/health" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C to stop all instances" -ForegroundColor Yellow
Write-Host ""

# Start instances in separate PowerShell windows
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; `$env:PORT=5001; `$env:INSTANCE_ID='instance-1'; npm run server:dev"
Start-Sleep -Seconds 2

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; `$env:PORT=5002; `$env:INSTANCE_ID='instance-2'; npm run server:dev"
Start-Sleep -Seconds 2

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; `$env:PORT=5003; `$env:INSTANCE_ID='instance-3'; npm run server:dev"

Write-Host "✓ All instances started!" -ForegroundColor Green
Write-Host ""
Write-Host "Monitor the individual PowerShell windows for each instance." -ForegroundColor Cyan
Write-Host "Close those windows to stop the instances." -ForegroundColor Cyan
