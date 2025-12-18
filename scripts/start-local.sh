#!/bin/bash
# SOVRYN.AI + PRIMEX - Local Development Startup Script

echo "🚀 Starting SOVRYN.AI + PRIMEX (Local Development)"
echo "=================================================="
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/.."

# Check Ollama
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama not installed. Run: bash primex-backend/scripts/setup-ollama.sh"
    exit 1
fi

# Start Ollama service (if not running)
if ! pgrep -x "ollama" > /dev/null; then
    echo "🔧 Starting Ollama service..."
    ollama serve &
    sleep 3
fi

echo "✅ Ollama running"

# Start PRIMEX backend
echo ""
echo "🔧 Starting PRIMEX backend API..."
cd "$PROJECT_ROOT/primex-backend" || exit 1

if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -q -r requirements.txt

echo "Backend starting on http://localhost:8000"
uvicorn services.clone-orchestrator:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

sleep 3

# Start Next.js frontend
echo ""
echo "🎨 Starting Next.js frontend..."
cd "$PROJECT_ROOT" || exit 1

if [ ! -d "node_modules" ]; then
    echo "Installing Node dependencies..."
    npm install
fi

echo "Frontend starting on http://localhost:3000"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ SOVRYN.AI + PRIMEX ONLINE"
echo "=================================================="
echo "Frontend UI:    http://localhost:3000"
echo "PRIMEX Mode:    http://localhost:3000/primex"
echo "Backend API:    http://localhost:8000"
echo "API Docs:       http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for interrupt
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
