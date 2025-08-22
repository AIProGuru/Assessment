@echo off
echo Starting Home Assessment Project...
echo.

echo Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo Installing frontend dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo Failed to install frontend dependencies
    pause
    exit /b 1
)

echo.
echo Starting backend server...
cd ..\backend
start "Backend Server" cmd /k "npm start"

echo.
echo Starting frontend server...
cd ..\frontend
start "Frontend Server" cmd /k "npm start"

echo.
echo Both servers are starting...
echo Backend will be available at: http://localhost:3001
echo Frontend will be available at: http://localhost:3000
echo.
echo Press any key to close this window...
pause > nul
