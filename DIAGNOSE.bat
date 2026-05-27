@echo off
REM DIAGNOSTIC SCRIPT - Shows exactly what's happening

title TSP Diagnostic Tool

echo.
echo ==========================================================
echo     TSP DIAGNOSTIC TOOL
echo ==========================================================
echo.

REM Check if ports are in use
echo [1] CHECKING PORTS...
echo.
echo Port 8000 (Backend):
netstat -ano | findstr ":8000" || echo   (FREE - No process using this port)
echo.

echo Port 5173 (Frontend):
netstat -ano | findstr ":5173" || echo   (FREE - No process using this port)
echo.

REM Check running processes
echo [2] RUNNING NODE/PYTHON PROCESSES...
tasklist | findstr /I "node python py" || echo   (NONE - All clear)
echo.

REM Check if Python 3.13 is installed
echo [3] CHECKING PYTHON 3.13...
py -3.13 --version
if errorlevel 1 (
    echo   ERROR: Python 3.13 not found!
) else (
    echo   (OK - Found)
)
echo.

REM Check if npm is installed
echo [4] CHECKING NPM...
call npm --version
if errorlevel 1 (
    echo   ERROR: npm not found or not accessible!
) else (
    echo   (OK - Found)
)
echo.

REM Test backend startup
echo [5] TESTING BACKEND STARTUP (5 second test)...
cd /d d:\TSP AI\backend
timeout /t 1 >nul
start "Backend Test" cmd /k "py -3.13 -m pip install -q --upgrade pip 2>nul && py -3.13 -m pip install -q -r requirements.txt 2>nul && (py -3.13 -m uvicorn main:app --port 8000 --reload & timeout /t 5 >nul & taskkill /IM py.exe /F 2>nul)"
timeout /t 7 >nul

echo.
echo [6] TESTING FRONTEND STARTUP (5 second test)...
cd /d d:\TSP AI\frontend
timeout /t 1 >nul
start "Frontend Test" cmd /k "npm run dev -- --port 5173 & timeout /t 5 >nul & taskkill /IM node.exe /F 2>nul"
timeout /t 7 >nul

echo.
echo ==========================================================
echo  DIAGNOSTIC COMPLETE
echo ==========================================================
echo.
pause
