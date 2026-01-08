#!/usr/bin/env pwsh
# Atlas DCA - Start All Services Script

Write-Host "🚀 Starting Atlas DCA Services..." -ForegroundColor Green

# Start Frontend
Write-Host "📱 Starting Frontend (Next.js)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev" -WindowStyle Normal

# Wait a moment
Start-Sleep -Seconds 2

# Start Backend  
Write-Host "🔧 Starting Backend (Express)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npx ts-node --transpile-only src/index.ts" -WindowStyle Normal

# Wait a moment
Start-Sleep -Seconds 2

# Start ML Service
Write-Host "🤖 Starting ML Service (FastAPI)..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\ml-service'; python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000" -WindowStyle Normal

Write-Host ""
Write-Host "✅ All services are starting..." -ForegroundColor Green
Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend: http://localhost:5000" -ForegroundColor Yellow  
Write-Host "🤖 ML Service: http://localhost:8000" -ForegroundColor Magenta
Write-Host ""
Write-Host "Press Ctrl+C in each terminal to stop services" -ForegroundColor Gray