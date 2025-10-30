# BharatSetu AI Chatbot Setup Instructions

## Overview
This AI chatbot helps users discover eligible MSME government schemes and understand BharatSetu's services (₹9,999 + GST per application + 5% success fee).

## Prerequisites
- Node.js (v18+)
- Python 3.9+
- Groq API Key (get from https://console.groq.com/)

---

## Backend Setup

### 1. Navigate to backend directory
```powershell
cd c:\Users\sones\.cursor-tutor\projects\bharatsetu\schemes-chatbot\backend
```

### 2. Create virtual environment (recommended)
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### 3. Install dependencies
```powershell
pip install -r requirements.txt
```

### 4. Create `.env` file
Create a file named `.env` in the backend directory with:
```
GROQ_API_KEY=your_groq_api_key_here
```

Get your Groq API key from: https://console.groq.com/keys

### 5. Start the backend server
```powershell
python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

Backend will be running at: **http://localhost:8001**

---

## Frontend Setup

### 1. Navigate to frontend directory
```powershell
cd c:\Users\sones\.cursor-tutor\projects\bharatsetu\schemes-chatbot\frontend
```

### 2. Install dependencies
```powershell
npm install
```

### 3. Update configuration (if needed)
The frontend automatically detects the backend at `http://localhost:8001` in development.

For production, update `next.config.js` with your production backend URL.

### 4. Start the development server
```powershell
npm run dev
```

Frontend will be running at: **http://localhost:5000**

---

## Testing the Chatbot

1. Open your browser and go to: **http://localhost:5000**
2. You should see the BharatSetu AI Assistant welcome screen
3. Start chatting! Try asking:
   - "What MSME schemes are available in Haryana?"
   - "How much does it cost to apply?"
   - "What is the electricity duty reimbursement scheme?"
   - "I need help with patent filing support"

---

## Integration with Main Website

The chatbot has been integrated into the main BharatSetu website:
- **Desktop**: "Chat with AI" button in the top navigation
- **Mobile**: "Chat with AI Assistant" in the hamburger menu

Both buttons open the chatbot in a new tab at `http://localhost:5000` (development).

### For Production
Update the URLs in `index.html`:
- Change `http://localhost:5000` to your production chatbot URL
- Example: `https://chat.bharatsetu.com` or `https://bharatsetu.com/chat`

---

## Running Both Servers Together

### Option 1: Two Terminal Windows
**Terminal 1 - Backend:**
```powershell
cd c:\Users\sones\.cursor-tutor\projects\bharatsetu\schemes-chatbot\backend
.\venv\Scripts\Activate.ps1
python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

**Terminal 2 - Frontend:**
```powershell
cd c:\Users\sones\.cursor-tutor\projects\bharatsetu\schemes-chatbot\frontend
npm run dev
```

### Option 2: Create Start Script
Create `start-chatbot.bat` in the `bharatsetu` directory:
```batch
@echo off
echo Starting BharatSetu AI Chatbot...

cd schemes-chatbot\backend
start cmd /k ".\venv\Scripts\Activate.ps1 && python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload"

cd ..\frontend
start cmd /k "npm run dev"

echo Both servers started!
echo Backend: http://localhost:8001
echo Frontend: http://localhost:5000
pause
```

---

## Customization

### Backend Prompts
Edit `schemes-chatbot/backend/main.py`:
- `build_greeting_prompt()` - Welcome message
- `build_pricing_prompt()` - Pricing information
- `build_application_prompt()` - Application process
- Main chat prompts - Lines 344-376

### Frontend Branding
Edit `schemes-chatbot/frontend/src/components/ChatPage.tsx`:
- Line 56-68: Welcome message
- Update colors, styling, and UI elements

### Scheme Information
The chatbot uses Groq's LLM knowledge about Indian MSME schemes. To add specific details:
- Update prompts in `main.py` with scheme-specific information
- Add scheme details in the system instructions (lines 344-376)

---

## Troubleshooting

### Backend Issues
1. **Port 8001 already in use:**
   ```powershell
   netstat -ano | findstr :8001
   taskkill /PID <process_id> /F
   ```

2. **Groq API Key errors:**
   - Verify `.env` file exists in backend directory
   - Check API key is valid at https://console.groq.com/keys
   - Ensure no extra spaces in the `.env` file

3. **Module not found errors:**
   ```powershell
   pip install -r requirements.txt --force-reinstall
   ```

### Frontend Issues
1. **Port 5000 already in use:**
   - Update `package.json` to use different port:
   ```json
   "dev": "next dev -p 5001"
   ```

2. **Cannot connect to backend:**
   - Verify backend is running at http://localhost:8001
   - Check `next.config.js` has correct backend URL
   - Look for CORS errors in browser console

3. **npm install fails:**
   ```powershell
   rm -rf node_modules package-lock.json
   npm install
   ```

---

## Production Deployment

### Backend (Python/FastAPI)
- Deploy to Railway, Render, or any Python hosting
- Set `GROQ_API_KEY` environment variable
- Use production ASGI server: `gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8001`

### Frontend (Next.js)
- Deploy to Vercel (recommended), Netlify, or any static host
- Set `NEXT_PUBLIC_BACKEND_URL` to production backend URL
- Run `npm run build` before deployment

---

## Support

For issues or questions:
1. Check the logs in terminal windows
2. Review browser console for frontend errors
3. Test backend directly at http://localhost:8001/ping
4. Refer to main project documentation

---

## Features

✅ AI-powered scheme recommendations  
✅ Conversational interface  
✅ Pricing information (₹9,999 + GST + 5% success fee)  
✅ Real-time chat with memory  
✅ Mobile-responsive design  
✅ Integrated with main website  
✅ Session-based conversations  

---

**Happy Coding! 🚀**

