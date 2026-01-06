#!/bin/bash
# Development startup script for browser service
# This script starts Xvfb and the Node.js server for local development

set -e

echo "🚀 Starting Sovryn Browser Service (Development Mode)"
echo "=================================================="

# Check for required dependencies
check_dependency() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 is not installed. Please install it first."
        echo "   On Ubuntu/Debian: sudo apt-get install $2"
        exit 1
    fi
}

# Check dependencies
check_dependency "Xvfb" "xvfb"
check_dependency "x11vnc" "x11vnc"
check_dependency "node" "nodejs"

# Configuration
DISPLAY_NUM=${DISPLAY_NUM:-99}
VNC_PORT=${VNC_PORT:-5900}
SERVICE_PORT=${BROWSER_SERVICE_PORT:-3001}

echo "📺 Display: :$DISPLAY_NUM"
echo "🖥️  VNC Port: $VNC_PORT"
echo "🌐 Service Port: $SERVICE_PORT"
echo ""

# Kill any existing processes
cleanup() {
    echo ""
    echo "🛑 Shutting down..."
    pkill -f "Xvfb :$DISPLAY_NUM" 2>/dev/null || true
    pkill -f "x11vnc.*:$DISPLAY_NUM" 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Xvfb
echo "📺 Starting Xvfb on display :$DISPLAY_NUM..."
Xvfb :$DISPLAY_NUM -screen 0 1920x1080x24 -ac &
XVFB_PID=$!
sleep 2

# Check if Xvfb started
if ! kill -0 $XVFB_PID 2>/dev/null; then
    echo "❌ Failed to start Xvfb"
    exit 1
fi
echo "✅ Xvfb started (PID: $XVFB_PID)"

# Start x11vnc
echo "🖥️  Starting x11vnc..."
x11vnc -display :$DISPLAY_NUM -rfbport $VNC_PORT -nopw -forever -shared -noxdamage -bg
sleep 1
echo "✅ x11vnc started on port $VNC_PORT"

# Set display for Node.js
export DISPLAY=:$DISPLAY_NUM
export BROWSER_SERVICE_PORT=$SERVICE_PORT

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the Node.js server
echo ""
echo "🚀 Starting Node.js server..."
echo "=================================================="
npm run dev

# Cleanup on exit
cleanup
