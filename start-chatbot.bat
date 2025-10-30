@echo off
echo =========================================
echo  Starting BharatSetu AI Chatbot
echo =========================================
echo.

echo [1/2] Starting Backend (Python/FastAPI)...
cd schemes-chatbot\backend
start "BharatSetu Backend" cmd /k ".\venv\Scripts\Activate.ps1 && python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend (Next.js)...
cd ..\frontend
start "BharatSetu Frontend" cmd /k "npm run dev"

echo.
echo =========================================
echo  Chatbot servers starting!
echo =========================================
echo.
echo  Backend:  http://localhost:8001
echo  Frontend: http://localhost:5000
echo  Docs:     http://localhost:8001/docs
echo.
echo  Press any key to close this window...
echo =========================================
pause >nul

