@echo off
echo Setting up AI Finance Assistant...
echo.

echo Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Failed to install root dependencies
    pause
    exit /b 1
)

echo Installing server dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo Failed to install server dependencies
    pause
    exit /b 1
)

echo Installing client dependencies...
cd ..\client
call npm install
if %errorlevel% neq 0 (
    echo Failed to install client dependencies
    pause
    exit /b 1
)

cd ..
echo.
echo Setup complete!
echo.
echo Next steps:
echo 1. Copy server\.env.example to server\.env and configure
echo 2. Copy client\src\.env.example to client\src\.env and configure
echo 3. Run 'npm run dev' to start the application
echo.
pause
