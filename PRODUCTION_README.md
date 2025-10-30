# BharatSetu - Production Ready

## 🚀 Production Application

BharatSetu is a complete MSME government scheme application platform with AI-powered chatbot assistance.

## 📁 Clean File Structure

```
bharatsetu/
├── index.html              # Main homepage
├── dashboard.html          # User dashboard
├── css/
│   ├── base.css           # Base styles & variables
│   └── main.css           # Homepage styles
├── js/
│   ├── main.js            # Main functionality
│   ├── auth-service.js    # Authentication
│   ├── auth-flow.js       # OAuth flow
│   └── utils.js           # Utilities
├── schemes/               # Individual scheme pages
├── schemes-chatbot/       # AI Chatbot (separate service)
│   ├── backend/           # FastAPI backend
│   └── frontend/          # Next.js frontend
├── database/
│   └── schemes.db         # SQLite database
└── assets/                # Images & videos
```

## 🎯 Core Features

### Homepage
- **Hero Section**: Fixed CTA buttons at bottom
- **Promise Section**: 6 benefit tiles with icons
- **Enable MSMEs**: Value proposition section
- **Why Choose**: Problem-solving section
- **Popular Schemes**: Government scheme showcase
- **Responsive Design**: Mobile-first approach

### AI Chatbot
- **Backend**: FastAPI with Groq LLM
- **Frontend**: Next.js with React
- **Features**: MSME scheme recommendations, business profiling
- **Integration**: Seamless connection to main site

### Authentication
- **Google OAuth**: Secure user authentication
- **Session Management**: Persistent user sessions
- **Dashboard**: User application tracking

## 🛠️ Setup Instructions

### Main Website
```bash
# No build process required - static files
# Just serve the files from a web server
```

### AI Chatbot
```bash
# Backend
cd schemes-chatbot/backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
echo "GROQ_API_KEY=your_key_here" > .env
python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload

# Frontend
cd schemes-chatbot/frontend
npm install
npm run dev
```

## 🌐 Production URLs

- **Main Site**: Your domain
- **Chatbot**: http://localhost:5000
- **API**: http://localhost:8001

## 📱 Responsive Design

- **Desktop**: Full feature set
- **Tablet**: Optimized layout
- **Mobile**: Touch-friendly interface

## 🔧 Production Checklist

- ✅ Clean file structure
- ✅ Removed test files
- ✅ Optimized CSS
- ✅ Minimal JavaScript
- ✅ Production-ready HTML
- ✅ AI Chatbot integrated
- ✅ Responsive design
- ✅ SEO optimized

## 🚀 Deployment Ready

The application is now production-ready with:
- Clean, minimal codebase
- No unused files
- Optimized performance
- Professional structure
- AI integration complete
