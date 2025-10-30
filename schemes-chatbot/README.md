# Government Schemes AI Chatbot

An AI-powered chatbot that helps businesses find relevant government schemes, loans, and MSME benefits using FastAPI, LangChain, and Groq.

## Features

- **Business Profile Analysis**: Collects comprehensive business information
- **AI-Powered Recommendations**: Uses Groq LLM to provide personalized scheme recommendations
- **Real-time Chat**: Interactive chat interface for scheme queries
- **Lead Generation**: Collects consultation leads for premium services
- **Comprehensive Scheme Database**: Covers MSME, export, startup, and rural development schemes

## Architecture

### Backend (FastAPI + LangChain + Groq)
- **FastAPI**: REST API server
- **LangChain**: LLM integration and conversation management
- **Groq**: High-performance LLM inference
- **Session Management**: Per-user conversation tracking
- **Scheme Database**: Comprehensive Indian government schemes data

### Frontend (Next.js + React + Tailwind)
- **Next.js 15**: React framework with App Router
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible component primitives
- **React Markdown**: Rich text rendering
- **Responsive Design**: Mobile-first approach

## Setup Instructions

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**:
   Create a `.env` file in the backend directory:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```

4. **Start the backend server**:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8001 --reload
   ```

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the frontend directory:
   ```env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8001
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to `http://localhost:5000`

## API Endpoints

### Backend Endpoints

- `GET /ping` - Health check endpoint
- `POST /business-profile` - Submit business profile for analysis
- `POST /chat` - Send chat messages to the AI assistant

### Request/Response Format

#### Business Profile Submission
```json
POST /business-profile
{
  "business_name": "My Business",
  "business_type": "manufacturing",
  "business_stage": "startup",
  "sector": "msme",
  "location": "Mumbai, Maharashtra",
  "annual_turnover": 1000000,
  "employee_count": 5,
  "age": 30,
  "category": "general",
  "export_potential": false,
  "business_description": "Manufacturing company..."
}
```

#### Chat Message
```json
POST /chat
{
  "query": "What schemes are available for my business?"
}
```

## Scheme Categories

The chatbot covers the following government scheme categories:

1. **MSME Schemes**
   - PMEGP (Prime Minister's Employment Generation Programme)
   - MUDRA (Micro Units Development and Refinance Agency)
   - CGTMSE (Credit Guarantee Fund Trust)
   - Stand Up India

2. **Technology Schemes**
   - TUF (Technology Upgradation Fund)
   - CLCSS (Credit Linked Capital Subsidy Scheme)

3. **Export Schemes**
   - MEIS (Merchandise Exports from India Scheme)
   - SEIS (Services Exports from India Scheme)

4. **Startup Schemes**
   - Startup India Initiative
   - SIDBI Fund of Funds

5. **Rural Development**
   - PMFME (PM Formalisation of Micro Food Processing)
   - PMKSY (Pradhan Mantri Kisan Sampada Yojana)

## Customization

### Adding New Schemes
1. Update `backend/schemes/scheme_data.py` with new scheme information
2. Modify `backend/schemes/scheme_processor.py` for recommendation logic
3. Update the AI prompts in `backend/main.py`

### Styling Changes
1. Modify Tailwind classes in component files
2. Update color scheme in `tailwind.config.js`
3. Customize components in `src/components/ui/`

### Business Logic
1. Update business profile fields in `BusinessProfileForm.tsx`
2. Modify recommendation algorithm in `scheme_processor.py`
3. Adjust AI prompts for different responses

## Deployment

### Backend Deployment
- Deploy to any Python hosting service (Railway, Render, Heroku)
- Set environment variables for production
- Use production-grade ASGI server (Gunicorn + Uvicorn)

### Frontend Deployment
- Deploy to Vercel, Netlify, or any static hosting
- Update `NEXT_PUBLIC_BACKEND_URL` to production backend URL
- Build with `npm run build`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.
