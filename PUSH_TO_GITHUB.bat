@echo off
title AgriCare - Push to GitHub
cd /d "C:\Users\sudha\OneDrive\Desktop\S5 MINI PROJECT_AGRICARE"
echo ========================================================
echo   AGRICARE: Pushing project to GitHub repository...
echo   Target: https://github.com/sudharshanaa1417-lab/AGRICARE_SHANA.git
echo ========================================================
echo.

git add .
git commit -m "Fix Vercel build: explicitly define npm install and npx vite build"
git push -u origin main

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Attempting force push...
    git push -u origin main --force
)

echo.
echo ========================================================
echo Finished! Check the status above.
echo ========================================================
pause
