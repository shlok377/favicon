# 01: Project Scaffolding, Bootstrapping Scripts & Health Checks

**What to build:** The foundational dual-service repository structure with a FastAPI Python backend on port 1947 and a React/Vite/Tailwind frontend on port 3737 (configured to proxy `/api` requests to port 1947). Includes self-bootstrapping launcher scripts (`start.bat` for Windows and `start.sh` for Linux/macOS) that check for Python 3 and Node.js, create `.venv`, install all backend and frontend dependencies, launch both processes concurrently, and automatically open the web UI in the default browser.

**Blocked by:** None (can start immediately)

**Status:** completed

- [x] Python backend scaffolded with FastAPI, Uvicorn, and Pillow running on port 1947 with a `/api/health` check endpoint.
- [x] React + Vite + Tailwind CSS frontend scaffolded on port 3737 with `/api` proxy forwarding to `http://localhost:1947`.
- [x] `start.sh` executable script for Linux/macOS that installs dependencies, starts both services, handles graceful shutdown on exit, and opens the browser.
- [x] `start.bat` batch script for Windows that automates environment creation, dependency installation, and launching.
- [x] Basic verification test confirming frontend can communicate with backend `/api/health`.
