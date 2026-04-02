@echo off
REM ==========================================
REM Metra Innovations - Git Setup Script
REM ==========================================
REM This script initializes Git and prepares the project for GitHub push

echo.
echo ========================================
echo  Metra Innovations - Git Setup
echo ========================================
echo.

REM Check if Git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git is not installed!
    echo Please install Git from https://git-scm.com/
    pause
    exit /b 1
)

echo [OK] Git is installed
echo.

REM Check if already initialized
if exist .git (
    echo [INFO] Git repository already initialized
) else (
    echo [INIT] Initializing Git repository...
    git init
    echo [OK] Git initialized
)

echo.
echo [INFO] Current Git status:
git status --short

echo.
echo ========================================
echo  Next Steps:
echo ========================================
echo.
echo 1. Create a new repository on GitHub:
echo    https://github.com/new
echo.
echo 2. Set repository name to: metra-innovations
echo.
echo 3. Run these commands (replace YOUR_USERNAME):
echo.
echo    git branch -M main
echo    git remote add origin https://github.com/YOUR_USERNAME/metra-innovations.git
echo    git add .
echo    git commit -m "Initial commit - Metra Innovations website"
echo    git push -u origin main
echo.
echo 4. Deploy to Vercel:
echo    - Go to https://vercel.com
echo    - Sign in with GitHub
echo    - Import your repository
echo.
echo ========================================
echo.

pause
