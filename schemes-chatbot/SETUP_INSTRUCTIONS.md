# Schemes Chatbot Setup Instructions

## 🚀 Quick Setup

### 1. Backend Setup
```bash
cd schemes-chatbot/backend

# Install dependencies
pip install -r requirements.txt

# Create .env file with your Groq API key
echo "GROQ_API_KEY=your_actual_groq_api_key_here" > .env

# Start backend
python3 -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

### 2. Frontend Setup
```bash
cd schemes-chatbot/frontend

# Install dependencies
npm install

# Start frontend (will use localhost:8001 for backend)
npm run dev
```

## 🌐 Production Deployment

### 1. Update Configuration
The frontend automatically detects production vs development:
- **Development**: Uses `http://localhost:8001` for backend
- **Production**: Uses `http://65.2.78.125:8001` for backend

### 2. Server Setup
```bash
# On your server (65.2.78.125)

# Backend
cd /path/to/schemes-chatbot/backend
nohup python3 -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload > backend.log 2>&1 &

# Frontend
cd /path/to/schemes-chatbot/frontend
npm run build
nohup npm start > frontend.log 2>&1 &
```

## 🔧 Environment Variables

### Backend (.env)
```
GROQ_API_KEY=your_groq_api_key_here
```

### Frontend (automatic via next.config.js)
- Development: `http://localhost:8001`
- Production: `http://65.2.78.125:8001`

## 📝 Notes
- The frontend automatically switches between localhost and server IP based on NODE_ENV
- No manual URL changes needed
- Just run `npm run build` for production
- Backend runs on port 8001, frontend on port 5000
