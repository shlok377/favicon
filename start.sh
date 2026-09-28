#!/usr/bin/env bash
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
VENV_DIR="$BACKEND_DIR/.venv"

echo "===================================================="
echo "🚀 Starting Favicon & Social Asset Generator"
echo "===================================================="

# Check Python 3
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: python3 is not installed. Please install Python 3."
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed. Please install Node.js."
    exit 1
fi

# 1. Setup Backend Python Virtual Environment
if [ ! -d "$VENV_DIR" ]; then
    echo "📦 Creating Python virtual environment in backend/.venv..."
    python3 -m venv "$VENV_DIR"
    "$VENV_DIR/bin/pip" install --upgrade pip
    echo "📥 Installing backend dependencies..."
    "$VENV_DIR/bin/pip" install -r "$BACKEND_DIR/requirements.txt"
fi

# 2. Setup Frontend Dependencies
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo "📦 Installing frontend dependencies with npm..."
    (cd "$FRONTEND_DIR" && npm install)
fi

echo "===================================================="
echo "⚡ Launching Services:"
echo "   - Backend (FastAPI): http://localhost:1947"
echo "   - Frontend (Vite):   http://localhost:3737"
echo "===================================================="

# Process tracking and clean shutdown trap
BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
    echo ""
    echo "🛑 Shutting down Favi services..."
    if [ -n "$FRONTEND_PID" ]; then
        kill "$FRONTEND_PID" 2>/dev/null || true
    fi
    if [ -n "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
    # Also ensure port processes are stopped
    fuser -k 1947/tcp 2>/dev/null || true
    fuser -k 3737/tcp 2>/dev/null || true
    echo "✅ Done. Goodbye!"
    exit 0
}

trap cleanup INT TERM EXIT

# Start Backend
(
    cd "$BACKEND_DIR"
    "$VENV_DIR/bin/uvicorn" app.main:app --host 0.0.0.0 --port 1947
) &
BACKEND_PID=$!

# Start Frontend
(
    cd "$FRONTEND_DIR"
    npm run dev -- --host
) &
FRONTEND_PID=$!

# Wait for services to be ready
echo "⏳ Waiting for services to initialize..."
sleep 2

# Open in default browser
URL="http://localhost:3737"
if command -v xdg-open &> /dev/null; then
    xdg-open "$URL" >/dev/null 2>&1 &
elif command -v open &> /dev/null; then
    open "$URL" >/dev/null 2>&1 &
fi

echo "✨ Favi is running at $URL"
echo "Press Ctrl+C to stop both servers."

# Wait on background processes
wait "$BACKEND_PID" "$FRONTEND_PID"
