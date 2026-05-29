@echo off
setlocal enabledelayedexpansion

title TSP Solver — Travelling Salesman Problem Visualizer

cls
echo ==========================================================
echo     TSP Solver - Travelling Salesman Problem Visualizer    
echo ==========================================================
echo.

cd /d "%~dp0"

REM AGGRESSIVE CLEANUP - Kill all processes
echo [CLEANUP] Force-terminating any existing processes...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1
taskkill /F /IM python3.exe >nul 2>&1

REM Kill by port number as well
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":8000"') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":5173"') do taskkill /PID %%a /F >nul 2>&1

timeout /t 3 /nobreak >nul

echo [1/2] Starting Backend (FastAPI on port 8000)...
start "TSP Backend" cmd /k "cd /d d:\TSP AI\backend && py -3.13 -m pip install -q --upgrade pip 2>nul && py -3.13 -m pip install -q -r requirements.txt 2>nul && py -3.13 -m uvicorn main:app --port 8000 --reload"

echo [2/2] Starting Frontend (Vite on port 5173)...
start "TSP Frontend" cmd /k "cd /d d:\TSP AI\frontend && if not exist node_modules (npm install -q --legacy-peer-deps 2>nul) && npm run dev -- --port 5173"

echo.
echo Waiting 35 seconds for servers to initialize...
timeout /t 35 /nobreak >nul

echo Opening http://localhost:5173 in your browser...
start "" http://localhost:5173

echo.
echo ==========================================================
echo  PROJECT IS RUNNING!
echo  - Backend : http://localhost:8000
echo  - Frontend: http://localhost:5173
echo.
echo  Minimize the two terminal windows (do NOT close them).
echo  Close them when you are done.
echo ==========================================================
pause
