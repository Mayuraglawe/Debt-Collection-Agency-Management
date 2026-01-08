Write-Host "🚀 Starting Atlas DCA Development Services..." -ForegroundColor Green

# Kill any existing processes on ports
Write-Host "🛑 Cleaning up existing processes..." -ForegroundColor Yellow
try {
    npx kill-port 3000 3001 3002 5000 8000
} catch {
    Write-Host "No existing processes to kill" -ForegroundColor Gray
}

Write-Host "▶️  Starting Frontend (port 3002) and Backend (port 5000)..." -ForegroundColor Cyan
npm run dev

Write-Host "✨ Services started!" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost:3002" -ForegroundColor Blue
Write-Host "⚙️  Backend: http://localhost:5000" -ForegroundColor Blue