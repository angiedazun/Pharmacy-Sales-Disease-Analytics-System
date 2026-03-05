@echo off
echo =====================================
echo  MediTrend Analytics - Starting Backend API
echo =====================================
cd /d "%~dp0backend"
echo Installing backend dependencies...
call npm install
echo.
echo Seeding database...
node seeders/seed.js
echo.
echo Starting backend server on port 5000...
npm run dev
