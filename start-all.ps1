# Atlas DCA - Start All Services Script
# Run this from the project root directory

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Starting Atlas DCA Services..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Get the current directory
$rootDir = $PSScriptRoot
if (-not $rootDir) {
    $rootDir = Get-Location
}

# Start Frontend
Write-Host "[1/3] Starting Frontend (Next.js)..." -ForegroundColor Cyan
$frontendPath = Join-Path $rootDir "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendPath'; npm run dev"

# Wait a moment
Start-Sleep -Seconds 3

# Start Backend  
Write-Host "[2/3] Starting Backend (Express)..." -ForegroundColor Yellow
$backendPath = Join-Path $rootDir "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backendPath'; npm run dev"

# Wait a moment
Start-Sleep -Seconds 3

# Check if ML service exists
$mlPath = Join-Path $rootDir "ml-service"
if (Test-Path $mlPath) {
    Write-Host "[3/3] Starting ML Service (FastAPI)..." -ForegroundColor Magenta
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$mlPath'; python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
} else {
    Write-Host "[3/3] ML Service not found, skipping..." -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  All services are starting!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend:   http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Backend:    http://localhost:3001" -ForegroundColor Yellow  
Write-Host "  ML Service: http://localhost:8000" -ForegroundColor Magenta
Write-Host ""
Write-Host "Press Ctrl+C in each terminal window to stop services" -ForegroundColor Gray
Write-Host ""