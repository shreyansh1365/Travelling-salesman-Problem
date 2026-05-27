@echo off
REM CLEANUP PORTS - Run this if you get "port already in use" errors
echo ========================================
echo CLEANING UP PORTS 8000 and 5173...
echo ========================================

REM Force kill all node and python processes
echo Killing all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1

echo Killing all Python processes...
taskkill /F /IM python.exe >nul 2>&1
taskkill /F /IM python3.exe >nul 2>&1

REM More aggressive: find by port and kill
echo Force-closing port 8000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000"') do (
    taskkill /PID %%a /F >nul 2>&1
)

echo Force-closing port 5173...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173"') do (
    taskkill /PID %%a /F >nul 2>&1
)

timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo DONE! Ports are now clear.
echo Run start_project.bat now.
echo ========================================
pause
