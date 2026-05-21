@echo off
REM Property Management System - Supabase Deployment Setup Script (Windows)

echo ================================
echo Supabase Deployment Setup Helper
echo ================================
echo.

REM Check Node.js
echo Checking Node.js...
node -v >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found. Please install Node.js 18+
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo [OK] Node.js %NODE_VERSION%

REM Check npm
echo Checking npm...
npm -v >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm not found.
    exit /b 1
)
for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo [OK] npm %NPM_VERSION%

echo.
echo Setting up project for Supabase...

REM Create .env files if they don't exist
if not exist "backend\.env" (
    echo Creating backend\.env
    copy backend\.env.example backend\.env >nul
    echo [OK] Created backend\.env - Please fill in your Supabase credentials
) else (
    echo [OK] backend\.env already exists
)

if not exist "frontend\.env.production" (
    echo Creating frontend\.env.production
    copy frontend\.env.example frontend\.env.production >nul
    echo [OK] Created frontend\.env.production - Please fill in your credentials
) else (
    echo [OK] frontend\.env.production already exists
)

REM Install dependencies
echo.
echo Installing dependencies...

echo Backend dependencies...
cd backend
call npm install >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Backend dependency installation may have issues
) else (
    echo [OK] Backend dependencies installed
)
cd ..

echo Frontend dependencies...
cd frontend
call npm install >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Frontend dependency installation may have issues
) else (
    echo [OK] Frontend dependencies installed
)
cd ..

REM Summary
echo.
echo ================================
echo Setup Complete!
echo ================================
echo.
echo Next steps:
echo 1. Edit backend\.env with your Supabase credentials
echo 2. Edit frontend\.env.production with your credentials
echo 3. Create Supabase project: https://supabase.com
echo 4. Run migrations in Supabase SQL Editor
echo 5. Test locally: npm run dev (in each folder)
echo 6. Deploy to Vercel when ready
echo.
echo For detailed instructions, see DEPLOYMENT_QUICK_START.md
echo.
pause
