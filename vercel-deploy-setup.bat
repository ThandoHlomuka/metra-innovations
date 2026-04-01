@echo off
REM ============================================
REM Vercel Auto-Deployment Setup Script
REM ============================================
REM This script helps you configure Vercel deployment
REM ============================================

echo.
echo ========================================
echo  Vercel Auto-Deployment Setup
echo ========================================
echo.
echo This script will help you configure automatic deployments to Vercel.
echo.
echo TWO OPTIONS FOR AUTO-DEPLOYMENT:
echo.
echo OPTION 1: Vercel Native GitHub Integration (RECOMMENDED - Easiest)
echo   - Go to https://vercel.com/new
echo   - Click "Import Git Repository"
echo   - Select GitHub and authorize
echo   - Choose this repository: metra-innovations
echo   - Click Deploy
echo   - Done! Every push to main will auto-deploy
echo.
echo OPTION 2: GitHub Actions (Requires Vercel Token)
echo   - Requires VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID
echo   - Set these in GitHub Repository Secrets
echo.
echo ========================================
echo.

:CHOICE
echo Please choose an option:
echo   1. Open Vercel to connect repository (Recommended)
echo   2. I already connected - Test deployment now
echo   3. Exit
echo.
set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" goto OPEN_VERCEL
if "%choice%"=="2" goto TEST_DEPLOY
if "%choice%"=="3" goto EXIT

echo Invalid choice. Please try again.
echo.
goto CHOICE

:OPEN_VERCEL
echo.
echo Opening Vercel in your default browser...
start https://vercel.com/new
echo.
echo Follow these steps:
echo   1. Sign in to Vercel (or create account)
echo   2. Click "Import Git Repository"
echo   3. Select GitHub and authorize Vercel
echo   4. Find and select: ThandoHlomuka/metra-innovations
echo   5. Click "Import"
echo   6. Keep default settings and click "Deploy"
echo.
echo Once connected, every push to 'main' will auto-deploy!
echo.
pause
goto EXIT

:TEST_DEPLOY
echo.
echo Testing Vercel deployment...
echo.
echo Checking if Vercel CLI is installed...
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Vercel CLI not found. Installing...
    npm install --global vercel@latest
)

echo.
echo Logging in to Vercel...
vercel login

echo.
echo Linking to Vercel project...
vercel link --yes

echo.
echo Deploying to production...
vercel --prod

echo.
echo ========================================
echo  Deployment Complete!
echo ========================================
echo.
echo Your site is now live on Vercel.
echo Future pushes to 'main' will auto-deploy.
echo.
pause
goto EXIT

:EXIT
echo.
echo Setup script completed.
echo For support, visit: https://vercel.com/docs
echo.
pause
