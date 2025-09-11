@echo off
echo Starting AI Finance Assistant...
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Dependencies not installed. Running setup...
    call scripts\setup.bat
    if %errorlevel% neq 0 exit /b 1
)

REM Check if environment files exist
if not exist "server\.env" (
    echo Warning: server\.env not found. Please copy from server\.env.example and configure.
    echo.
)

if not exist "client\src\.env" (
    echo Warning: client\src\.env not found. Please copy from client\src\.env.example and configure.
    echo.
)

echo Starting development servers...
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:5000
echo.

start "AI Finance - Backend" cmd /c "cd server && npm run dev"
timeout /t 3 /nobreak > nul
start "AI Finance - Frontend" cmd /c "cd client && npm start"

echo Both servers are starting...
echo Press any key to stop all servers
pause > nul

echo Stopping servers...
taskkill /f /im node.exe 2>nul
echo Servers stopped.
