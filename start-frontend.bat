@echo off
echo =====================================
echo  MediTrend Analytics - Starting Frontend
echo =====================================
cd /d "%~dp0frontend"
echo Installing frontend dependencies...
call npm install
echo.
echo Starting frontend on http://localhost:5173
npm run dev
