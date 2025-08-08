@echo off
echo Starting BharatSetu MSME Eligibility Checker...
echo.
echo Checking if .env file exists...
if not exist .env (
    echo Creating .env file from template...
    copy env.example .env
    echo.
    echo Please configure your .env file with Google OAuth credentials before starting the server.
    echo.
    pause
    exit /b
)

echo Starting development server...
npm run dev 