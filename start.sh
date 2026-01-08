#!/bin/bash

echo "🚀 Starting Atlas DCA Development Services..."

# Check if concurrently is installed
if ! command -v concurrently &> /dev/null; then
    echo "📦 Installing concurrently..."
    npm install -g concurrently
fi

# Kill any existing processes on ports
echo "🛑 Cleaning up existing processes..."
npx kill-port 3000 3001 3002 5000 8000 2>/dev/null

echo "▶️  Starting Frontend (port 3002) and Backend (port 5000)..."
npm run dev

echo "✨ Services started!"
echo "🌐 Frontend: http://localhost:3002"
echo "⚙️  Backend: http://localhost:5000"