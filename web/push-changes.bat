@echo off
echo ========================================
echo Pushing AI Chatbot Fix to GitHub
echo ========================================
echo.

cd /d "%~dp0"

echo Current status:
git status
echo.

echo Attempting to push...
git push origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! Changes pushed to GitHub
    echo ========================================
    echo.
    echo Next steps:
    echo 1. Go to https://vercel.com/dashboard
    echo 2. Wait for deployment to complete (2-3 minutes)
    echo 3. Hard refresh your browser: Ctrl + Shift + R
    echo.
) else (
    echo.
    echo ========================================
    echo PUSH FAILED - Authentication Required
    echo ========================================
    echo.
    echo Please authenticate with GitHub:
    echo 1. Username: lekhanpro
    echo 2. Password: Use your GitHub Personal Access Token
    echo.
    echo Get token from: https://github.com/settings/tokens
    echo.
)

pause
