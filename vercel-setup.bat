# Vercel Auto-Deploy Setup Script
# This script helps you connect your GitHub repository to Vercel

@echo off
echo.
echo ========================================
echo  Vercel Auto-Deploy Setup
echo ========================================
echo.
echo Your repository is ready at:
echo https://github.com/ThandoHlomuka/metra-innovations
echo.
echo ========================================
echo  Step 1: Connect to Vercel
echo ========================================
echo.
echo 1. Go to: https://vercel.com/new
echo 2. Sign in with GitHub
echo 3. Click "Import Git Repository"
echo 4. Find and select "metra-innovations"
echo 5. Click "Import"
echo 6. Click "Deploy"
echo.
echo ========================================
echo  Step 2: Enable Auto-Deploy
echo ========================================
echo.
echo Auto-deploy is AUTOMATIC! 
echo Every push to "main" branch will trigger deployment.
echo.
echo To test, run:
echo   git add .
echo   git commit -m "Your changes"
echo   git push origin main
echo.
echo ========================================
echo  Step 3: Verify Deployment
echo ========================================
echo.
echo Your site will be live at:
echo https://metra-innovations.vercel.app
echo.
echo Check deployment status at:
echo https://vercel.com/ThandoHlomuka/metra-innovations
echo.
echo ========================================
echo  Optional: Install Vercel CLI
echo ========================================
echo.
echo npm install -g vercel
echo vercel login
echo vercel link
echo.
echo ========================================

pause
