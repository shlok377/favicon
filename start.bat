@echo off
setlocal enabledelayedexpansion

echo ====================================================
echo  Starting Favi - Favicon ^& Social Asset Generator
echo ====================================================

:: Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not found in PATH. Please install Python 3.
    pause
    exit /b 1
)

:: Check Node
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found in PATH. Please install Node.js.
    pause
    exit /b 1
)

:: 1. Backend venv
if not exist "backend\.venv\" (
    echo [1/2] Creating Python virtual environment...
    python -m venv backend\.venv
    backend\.venv\Scripts\python.exe -m pip install --upgrade pip
    echo [1/2] Installing backend requirements...
    backend\.venv\Scripts\pip.exe install -r backend\requirements.txt
)

:: 2. Frontend node_modules
if not exist "frontend\node_modules\" (
    echo [2/2] Installing frontend dependencies...
    cd frontend && npm install && cd ..
)

echo ====================================================
echo  Launching Services:
echo    - Backend (FastAPI): http://localhost:1937
echo    - Frontend (Vite):   http://localhost:3737
echo ====================================================

:: Start backend in background window
start "Favi Backend (Port 1937)" cmd /k "cd backend && .venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 1937"

:: Start frontend in background window
start "Favi Frontend (Port 3737)" cmd /k "cd frontend && npm run dev"

:: Wait for servers to spin up
timeout /t 3 /nobreak >nul

:: Launch default browser
start http://localhost:3737

echo Services are running. Close the launched terminal windows to stop.
