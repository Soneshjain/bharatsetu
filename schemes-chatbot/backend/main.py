# main.py - BharatSetu AI Assistant Backend
import os
import json
import logging
from typing import Any, Dict, Optional, List
from datetime import datetime
from threading import Lock

from dotenv import load_dotenv
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse

from langchain_groq import ChatGroq
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory
from langchain.schema import SystemMessage

# Import our custom modules
from schemes_database import SchemesDatabase
from eligibility_engine import EligibilityEngine

# ----- Logging -----
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("bharatsetu-backend")

# ----- App -----
app = FastAPI(title="BharatSetu AI Assistant Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/ping")
def ping():
    """Used by frontend to cold-start backend."""
    logger.info("Ping received")
    return {"status": "ok"}

@app.post("/clear-session")
async def clear_session(request: Request):
    """Clear session data for debugging."""
    session_id = request.headers.get("X-Session-Id", "default")
    
    with _chain_lock:
        if session_id in _chain_store:
            del _chain_store[session_id]
            logger.info("Cleared conversation chain for session: %s", session_id)
    
    with _profile_lock:
        if session_id in _business_profile_store:
            del _business_profile_store[session_id]
            logger.info("Cleared business profile for session: %s", session_id)
    
    return {"status": "session_cleared", "session_id": session_id}

# ----- Load env and validate -----
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    logger.error("GROQ_API_KEY is not set")
    raise RuntimeError("GROQ_API_KEY environment variable is required")

# ----- Shared LLM client -----
llm = ChatGroq(model="openai/gpt-oss-120b", api_key=GROQ_API_KEY)

# Initialize our custom systems
schemes_db = SchemesDatabase()
eligibility_engine = EligibilityEngine()

# Initialize database manager
from database import db_manager, SchemesRepository
schemes_repo = SchemesRepository(db_manager)
from web_scraper import GovernmentSchemesScraper, ScrapedScheme

# ----- Lifespan hooks -----
@app.on_event("startup")
async def on_startup() -> None:
    try:
        await db_manager.initialize()
        logger.info("PostgreSQL connection pool initialized")
    except Exception as e:
        logger.exception("Failed to initialize database: %s", e)
        # Don't crash the server; admin endpoints that depend on DB will return errors

@app.on_event("shutdown")
async def on_shutdown() -> None:
    try:
        await db_manager.close()
        logger.info("PostgreSQL connection pool closed")
    except Exception as e:
        logger.exception("Failed to close database: %s", e)

# ----- Per-session stores (thread-safe) -----
_business_profile_store: Dict[str, Dict[str, Any]] = {}
_profile_lock = Lock()

_chain_store: Dict[str, ConversationChain] = {}
_chain_lock = Lock()

# ----- Lead Storage (Persistent) -----
import sqlite3
import os

# Initialize SQLite database for leads
def init_lead_database():
    """Initialize SQLite database for persistent lead storage"""
    db_path = "leads.db"
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create leads table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT UNIQUE,
            company_name TEXT,
            applicant_name TEXT,
            applicant_phone TEXT,
            company_industry TEXT,
            company_state TEXT,
            directors_partners INTEGER,
            operational_units INTEGER,
            upcoming_units INTEGER,
            women_directors_equity TEXT,
            startup_status TEXT,
            lead_priority TEXT,
            total_estimated_benefits TEXT,
            eligible_schemes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()
    logger.info("Lead database initialized at leads.db")

# Initialize database on startup
init_lead_database()


def store_business_profile(session_id: str, profile: Dict[str, Any]) -> None:
    with _profile_lock:
        _business_profile_store[session_id] = profile


def get_business_profile(session_id: str) -> Optional[Dict[str, Any]]:
    with _profile_lock:
        return _business_profile_store.get(session_id)


def save_lead_to_database(session_id: str, profile: Dict[str, Any], ai_results: Dict[str, Any]) -> None:
    """Save lead to SQLite database for persistent storage"""
    try:
        conn = sqlite3.connect("leads.db")
        cursor = conn.cursor()
        
        # Extract data from profile and AI results
        eligible_schemes_json = json.dumps(ai_results.get('eligible_schemes', []))
        
        cursor.execute('''
            INSERT OR REPLACE INTO leads (
                session_id, company_name, applicant_name, applicant_phone,
                company_industry, company_state, directors_partners,
                operational_units, upcoming_units, women_directors_equity,
                startup_status, lead_priority, total_estimated_benefits,
                eligible_schemes, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ''', (
            session_id,
            profile.get('company-name', ''),
            profile.get('applicant-name', ''),
            profile.get('applicant-phone', ''),
            profile.get('company-industry', ''),
            profile.get('company-state', ''),
            profile.get('directors-partners', 0),
            profile.get('operational-manufacturing-units', 0),
            profile.get('upcoming-manufacturing-units', 0),
            profile.get('women-directors-equity', ''),
            profile.get('startup-status', ''),
            ai_results.get('lead_priority', 'Medium'),
            ai_results.get('total_estimated_benefits', ''),
            eligible_schemes_json
        ))
        
        conn.commit()
        conn.close()
        logger.info(f"Lead saved to database for session_id={session_id}")
        
    except Exception as e:
        logger.error(f"Error saving lead to database: {e}")


def get_all_leads() -> List[Dict[str, Any]]:
    """Retrieve all leads from database"""
    try:
        conn = sqlite3.connect("leads.db")
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM leads ORDER BY created_at DESC
        ''')
        
        columns = [description[0] for description in cursor.description]
        leads = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        conn.close()
        return leads
        
    except Exception as e:
        logger.error(f"Error retrieving leads: {e}")
        return []


def create_chain_for_session(session_id: str) -> ConversationChain:
    """
    Create a new ConversationChain with its own memory for a session.
    """
    memory = ConversationBufferMemory(llm=llm, return_messages=True)
    chain = ConversationChain(llm=llm, memory=memory, verbose=False)
    return chain


def get_or_create_chain(session_id: str) -> ConversationChain:
    with _chain_lock:
        chain = _chain_store.get(session_id)
        if chain is None:
            chain = create_chain_for_session(session_id)
            _chain_store[session_id] = chain
            logger.info("Created new conversation chain for session: %s", session_id)
        return chain


def get_conversation_memory(session_id: str) -> str:
    """Get conversation history for context analysis."""
    chain = get_or_create_chain(session_id)
    if hasattr(chain.memory, 'buffer'):
        buffer = chain.memory.buffer
        # Handle both string and list formats
        if isinstance(buffer, str):
            return buffer
        elif isinstance(buffer, list):
            # Convert list of messages to string
            return " ".join([str(msg) for msg in buffer])
    return ""


def analyze_conversation_context(user_query: str, conversation_memory: str) -> Dict[str, Any]:
    """Analyze conversation context to determine appropriate response strategy."""
    try:
        user_query_lower = user_query.lower().strip()
        history_lower = conversation_memory.lower() if conversation_memory else ""
        
        # Greeting detection
        greeting_words = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'namaste']
        if any(word in user_query_lower for word in greeting_words) and len(conversation_memory) < 100:
            return {
                "stage": "greeting",
                "time_of_day": get_time_of_day(),
                "is_first_interaction": len(conversation_memory) == 0
            }
        
        # Information gathering stage
        scheme_keywords = ['scheme', 'loan', 'subsidy', 'incentive', 'msme', 'funding', 'grant', 'electricity', 'stamp duty', 'patent']
        if any(keyword in user_query_lower for keyword in scheme_keywords):
            # Check what information we still need
            has_msme_status = any(phrase in history_lower for phrase in ['registered as an msme', 'msme registered', 'not registered', 'yes', 'no'])
            has_state = any(state in history_lower for state in ['karnataka', 'maharashtra', 'delhi', 'gujarat', 'tamil nadu', 'rajasthan', 'haryana', 'uttar pradesh', 'west bengal', 'andhra pradesh'])
            has_sector = any(word in history_lower for word in ['sector', 'industry', 'manufacturing', 'textile', 'it', 'food', 'service'])
            
            if not has_msme_status or not has_state or not has_sector:
                return {
                    "stage": "information_gathering", 
                    "needs_msme_status": not has_msme_status,
                    "needs_state": not has_state,
                    "needs_sector": not has_sector
                }
        
        # Pricing inquiry stage
        pricing_keywords = ['cost', 'price', 'fee', 'charge', 'how much', 'pricing', 'payment']
        if any(keyword in user_query_lower for keyword in pricing_keywords):
            return {
                "stage": "pricing_inquiry",
                "context": "user_asking_about_pricing"
            }
        
        # Application process inquiry
        process_keywords = ['apply', 'application', 'how to', 'process', 'start', 'get started']
        if any(keyword in user_query_lower for keyword in process_keywords):
            return {
                "stage": "application_inquiry",
                "context": "user_asking_about_process"
            }
        
        return {
            "stage": "detailed_response",
            "has_context": len(conversation_memory) > 100
        }
    except Exception as e:
        logger.error(f"Error in analyze_conversation_context: {e}")
        return {
            "stage": "detailed_response",
            "has_context": False
        }


def get_time_of_day() -> str:
    """Get appropriate greeting based on current time."""
    import datetime
    current_hour = datetime.datetime.now().hour
    
    if 5 <= current_hour < 12:
        return "morning"
    elif 12 <= current_hour < 17:
        return "afternoon"  
    elif 17 <= current_hour < 21:
        return "evening"
    else:
        return "evening"


def is_off_topic_query(user_query: str) -> bool:
    """Detect if the query is off-topic and should be redirected."""
    off_topic_keywords = [
        # Medical/Health
        'doctor', 'medical', 'health', 'medicine', 'symptoms', 'treatment', 'hospital',
        'covid', 'vaccine', 'disease', 'illness', 'pain', 'fever', 'cough',
        
        # Legal
        'lawyer', 'legal', 'court', 'lawsuit', 'contract', 'divorce', 'criminal',
        'attorney', 'legal advice', 'jurisdiction', 'litigation',
        
        # Political
        'politics', 'election', 'government policy', 'political party', 'minister',
        'parliament', 'democracy', 'vote', 'candidate', 'campaign',
        
        # Personal/General
        'relationship', 'dating', 'marriage', 'family', 'personal advice',
        'life advice', 'emotional', 'depression', 'anxiety', 'therapy',
        
        # Academic/Homework
        'homework', 'assignment', 'essay', 'thesis', 'research paper',
        'math problem', 'algebra', 'calculus', 'physics', 'chemistry',
        'biology', 'history', 'geography', 'literature', 'poem', 'poetry',
        
        # Creative/Entertainment
        'story', 'novel', 'script', 'movie', 'song', 'music', 'art',
        'creative writing', 'joke', 'jokes', 'funny', 'entertainment',
        
        # Technical (non-business)
        'programming help', 'code review', 'debug', 'software development',
        'web design', 'app development', 'database', 'server',
        
        # Financial (non-scheme)
        'investment advice', 'stock market', 'trading', 'cryptocurrency',
        'bitcoin', 'forex', 'mutual funds', 'insurance advice',
        
        # General business strategy (non-scheme)
        'business plan', 'marketing strategy', 'sales strategy', 'pricing strategy',
        'competitor analysis', 'market research', 'branding', 'advertising'
    ]
    
    query_lower = user_query.lower()
    
    # Check for off-topic keywords
    for keyword in off_topic_keywords:
        if keyword in query_lower:
            return True
    
    # Check for question patterns that are clearly off-topic
    off_topic_patterns = [
        'how to write', 'help me write', 'can you write', 'write a',
        'solve this math', 'calculate', 'what is the answer to',
        'explain this concept', 'teach me', 'how do i learn',
        'recommend a', 'best way to', 'should i', 'what should i do',
        'advice on', 'help with my', 'my problem is'
    ]
    
    for pattern in off_topic_patterns:
        if pattern in query_lower:
            return True
    
    return False


def build_redirect_response(user_query: str) -> str:
    """Build a polite redirect response for off-topic queries."""
    return f"""I understand you're asking about that, but I specialize specifically in Indian MSME government schemes, subsidies, and business incentives. 

I can help you with:
• **State & National MSME Schemes** - Haryana, Delhi, and other state-specific benefits
• **Subsidies & Incentives** - Electricity Duty, Stamp Duty, Power Tariff, Patent Filing
• **Quality Certifications** - ZED, ISO, BIS certifications
• **Technology Support** - Testing Equipment, Technology Adoption schemes
• **Export Incentives** - MEIS, Advance Authorization, EPCG schemes

How can I help you discover relevant government schemes for your business today? 🏭💰"""


def build_greeting_prompt(user_query: str) -> str:
    """Build greeting response prompt."""
    time_of_day = get_time_of_day()
    return f"""
User Query: {user_query}

### Instructions:
- You are GrantSetu AI Assistant, helping businesses access government subsidies and schemes
- Respond warmly with "Good {time_of_day}! I'm your GrantSetu AI Assistant."
- Ask "How can I help you access government schemes and subsidies today?" 
- Keep it brief and welcoming (2-3 sentences max)
- Don't mention pricing unless they specifically ask
- This is the FIRST interaction - be welcoming but not repetitive in future responses

### GUARDRAILS - STRICTLY ENFORCE:
- ONLY discuss Indian MSME government schemes, subsidies, and business incentives
- If asked about anything else (medical, legal, political, personal advice, poems, math, etc.), politely redirect: "I specialize in MSME government schemes. How can I help you with business subsidies and incentives today?"
- NEVER provide business strategy, financial planning, or investment advice beyond scheme information
- NEVER comment on political issues or government policies beyond scheme details
- ALWAYS redirect off-topic queries back to MSME schemes
"""


def build_info_gathering_prompt(user_query: str, context: Dict[str, Any]) -> str:
    """Build information gathering prompt."""
    return f"""
User Query: {user_query}
Context: {context}

### Instructions:
- You are BharatSetu AI Assistant, a friendly MSME consultant
- DO NOT repeat your introduction - you already introduced yourself
- The user is interested in schemes but you need basic information first
- Ask ONE qualifying question at a time:
  * If MSME status unknown: "Are you registered as an MSME under Udyam?"
  * If MSME known but state unknown: "Which state is your business located in?"  
  * If state known: "What sector/industry are you in? (Manufacturing, Services, Trading, etc.)"
- Be natural and conversational - like a real business consultant would talk
- Keep responses short (1-2 sentences + 1 question)
- Don't repeat explanations - just ask what you need to know
- Don't overwhelm with scheme details yet
"""


def build_pricing_prompt(user_query: str, context: Dict[str, Any]) -> str:
    """Build pricing information prompt."""
    return f"""
User Query: {user_query}
Context: {context}

### Instructions:
- You are BharatSetu AI Assistant explaining our transparent pricing
- Clearly state our pricing model:
  **₹9,999 + GST per application**
  **+ 5% success fee** (only when subsidy is received)
- Highlight what's included:
  • Complete application preparation & filing
  • Document verification & compliance check
  • Government liaison & follow-ups
  • Real-time application tracking
  • Expert consultation throughout
- Emphasize: "You only pay the success fee when you actually receive the subsidy"
- Compare to traditional agents: "Unlike agents charging 15-20% upfront, we have transparent pricing with success-based fees"
- Keep it clear, professional, and confident
- End with: "Would you like to know which schemes you're eligible for?"
"""


def build_application_prompt(user_query: str, context: Dict[str, Any]) -> str:
    """Build application process explanation prompt."""
    return f"""
User Query: {user_query}
Context: {context}

### Instructions:
- You are BharatSetu AI Assistant explaining the application process
- Explain our simple 4-step process:
  1. **Check Eligibility** - Free eligibility check on our platform
  2. **Choose Schemes** - Select schemes you want to apply for
  3. **Pay Application Fee** - ₹9,999 + GST per scheme
  4. **We Handle Everything** - Document prep, filing, tracking, follow-ups
- Mention our 95% success rate
- Highlight: "You pay the 5% success fee only when subsidy is credited to your account"
- Emphasize real-time tracking and expert support
- Keep it clear and action-oriented
- End with: "Would you like to start with a free eligibility check?"
"""


# ----- Endpoints -----

@app.post("/business-profile")
async def business_profile(request: Request):
    """
    Store business profile for a session.
    Expects a JSON body with business details.
    Session id is read from header 'X-Session-Id' (fallback to 'default').
    """
    session_id = request.headers.get("x-session-id", "default")
    try:
        payload = await request.json()
    except Exception:
        logger.exception("Invalid JSON in /business-profile")
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    # Store business profile per session
    store_business_profile(session_id, payload)
    logger.info("Stored business profile for session_id=%s", session_id)

    # Create or get the conversation chain for this session
    chain = get_or_create_chain(session_id)
    try:
        intro = f"This is the user's business profile for reference during the chat:\n{json.dumps(payload)}"
        chain.memory.chat_memory.add_user_message("My business details")
        chain.memory.chat_memory.add_message(SystemMessage(content=intro))
    except Exception:
        logger.exception("Failed to add business profile to session memory (non-fatal)")

    # Generate scheme recommendations using LLM knowledge
    try:
        prompt = f"""Based on this business profile, provide recommendations for relevant Indian MSME government schemes:

Business Profile: {json.dumps(payload, indent=2)}

Focus on schemes from:
- Haryana State schemes (if location is Haryana)
- National MSME schemes from Ministry of MSME
- Key schemes include: Electricity Duty Reimbursement, Stamp Duty Refund, Power Tariff Subsidy, Testing Equipment Support, Technology Adoption, Patent Filing Support, Quality Certifications, ZED Certification, etc.

Please provide:
1. Top 5-7 most relevant schemes for this business
2. Brief description of benefits (1-2 lines each)
3. Estimated benefit amounts where applicable
4. Focus on actionable schemes with clear benefits

Use markdown formatting with bullet points and **bold** for scheme names.
Keep it concise - maximum 300 words.
End with: "With BharatSetu, you can apply for these schemes at ₹9,999 + GST per application, with a 5% success fee only when you receive the subsidy."
"""
        
        llm_resp = llm.invoke(prompt)
        summary_text = getattr(llm_resp, "content", str(llm_resp)).strip()
    except Exception:
        logger.exception("LLM invoke failed for scheme recommendations")
        summary_text = "Based on your business profile, you may be eligible for multiple MSME schemes including subsidies, incentives, and grants."

    return {"summary": summary_text, "recommendations": []}


@app.post("/chat")
async def chat(request: Request):
    """
    Chat endpoint:
    - Reads session id from header X-Session-Id (fallback 'default')
    - Looks up business profile for that session and appends it to the input prompt (if present)
    - Uses a per-session ConversationChain to keep chats isolated
    """
    session_id = request.headers.get("x-session-id", "default")

    try:
        payload = await request.json()
    except Exception:
        logger.exception("Invalid JSON in /chat")
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    user_query = payload.get("query")
    if not user_query:
        raise HTTPException(status_code=400, detail="Missing 'query' in payload")

    logger.info("Received chat (session=%s): %s", session_id, user_query)

    # Check if query is off-topic and redirect if necessary
    if is_off_topic_query(user_query):
        logger.info("Off-topic query detected, sending redirect response")
        return JSONResponse(content={"response": build_redirect_response(user_query)})

    # get or create chain for session
    chain = get_or_create_chain(session_id)

    # Get conversation history to understand context
    try:
        conversation_memory = get_conversation_memory(session_id)
        # Determine conversation stage and context
        conversation_context = analyze_conversation_context(user_query, conversation_memory)
    except Exception as e:
        logger.error(f"Error getting conversation context: {e}")
        conversation_context = {"stage": "detailed_response", "has_context": False}
        conversation_memory = ""
    
    # append business profile if available for the session
    profile = get_business_profile(session_id)
    
    # Build conversational prompt based on context
    try:
        if conversation_context.get("stage") == "greeting":
            final_input = build_greeting_prompt(user_query)
        elif conversation_context.get("stage") == "information_gathering":
            final_input = build_info_gathering_prompt(user_query, conversation_context)
        elif conversation_context.get("stage") == "pricing_inquiry":
            final_input = build_pricing_prompt(user_query, conversation_context)
        elif conversation_context.get("stage") == "application_inquiry":
            final_input = build_application_prompt(user_query, conversation_context)
        else:
            # Default detailed response stage
            if profile:
                profile_str = json.dumps(profile)
                final_input = (
                    f"User Query: {user_query}\n\n### Reference Business Profile:\n{profile_str}\n\n"
                    f"### Instructions:\n"
                    f"- You are GrantSetu AI Assistant, expert in Indian MSME government schemes\n"
                    f"- Be conversational, professional, and helpful in your responses\n"
                    f"- FOCUS ONLY on Indian MSME schemes, subsidies, incentives, and business development programs\n"
                    f"- Cover both Haryana State schemes and National MSME schemes\n"
                    f"- Key schemes to know: Electricity Duty Reimbursement, Stamp Duty Refund, Power Tariff Subsidy, Testing Equipment, Technology Adoption, Patent Support, Quality Certifications, ZED, PMEGP, MUDRA, CGTMSE, etc.\n"
                    f"- Provide actionable insights with specific scheme names and benefit amounts\n"
                    f"- Use the business profile context to provide personalized recommendations\n"
                    f"- Use markdown formatting with bullet points, **bold**, and lists\n"
                    f"- Use emojis sparingly (🏭, 💰, 📋, ✅, 🎯)\n"
                    f"- Keep responses focused - maximum 300-400 words\n"
                    f"- When relevant, mention: 'Apply at ₹9,999 + GST per application + 5% success fee'\n"
                    f"- End with a relevant question or call to action\n\n"
                    f"### GUARDRAILS - STRICTLY ENFORCE:\n"
                    f"- ONLY discuss Indian MSME government schemes, subsidies, and business incentives\n"
                    f"- If asked about anything else (medical, legal, political, personal advice, poems, math, general business strategy, investment advice, etc.), politely redirect: 'I specialize in MSME government schemes. How can I help you with business subsidies and incentives today?'\n"
                    f"- NEVER provide business strategy, financial planning, or investment advice beyond scheme information\n"
                    f"- NEVER comment on political issues or government policies beyond scheme details\n"
                    f"- NEVER help with homework, creative writing, or non-business topics\n"
                    f"- ALWAYS redirect off-topic queries back to MSME schemes\n"
                    f"- If user asks about non-MSME topics, acknowledge politely but redirect immediately"
                )
            else:
                final_input = (
                    f"User Query: {user_query}\n\n### Conversation Context: {conversation_context}\n\n"
                    f"### Instructions:\n"
                    f"- You are GrantSetu AI Assistant, expert in Indian MSME government schemes\n"
                    f"- DO NOT repeat your introduction - you already introduced yourself\n"
                    f"- Be natural and conversational - like a real business consultant\n"
                    f"- FOCUS ONLY on Indian MSME-related schemes, subsidies, and incentives\n"
                    f"- Key areas: Manufacturing incentives, Technology support, Patent/IP support, Export schemes, Quality certifications, Power subsidies, Duty reimbursements\n"
                    f"- If user asks about schemes generally, ask qualifying questions first:\n"
                    f"  * Are you registered as an MSME under Udyam?\n"
                    f"  * Which state is your business operating in?\n"
                    f"  * What sector/industry are you in?\n"
                    f"  * Manufacturing or service-based?\n"
                    f"- Don't repeat explanations or say the same thing twice\n"
                    f"- Keep responses concise and actionable\n"
                    f"- Use markdown formatting with bullet points and **bold**\n"
                    f"- Use emojis sparingly (🏭, 💰, 📋, ✅)\n"
                    f"- Maximum 250-300 words\n"
                    f"- Ask ONE clear question at a time to gather information\n\n"
                    f"### GUARDRAILS - STRICTLY ENFORCE:\n"
                    f"- ONLY discuss Indian MSME government schemes, subsidies, and business incentives\n"
                    f"- If asked about anything else (medical, legal, political, personal advice, poems, math, general business strategy, investment advice, etc.), politely redirect: 'I specialize in MSME government schemes. How can I help you with business subsidies and incentives today?'\n"
                    f"- NEVER provide business strategy, financial planning, or investment advice beyond scheme information\n"
                    f"- NEVER comment on political issues or government policies beyond scheme details\n"
                    f"- NEVER help with homework, creative writing, or non-business topics\n"
                    f"- ALWAYS redirect off-topic queries back to MSME schemes\n"
                    f"- If user asks about non-MSME topics, acknowledge politely but redirect immediately"
                )
    except Exception as e:
        logger.error(f"Error building prompt: {e}")
        # Fallback to simple prompt
        final_input = f"User Query: {user_query}\n\nYou are GrantSetu AI Assistant, helping businesses access Indian MSME government schemes. Be helpful and professional.\n\nGUARDRAILS: ONLY discuss Indian MSME government schemes, subsidies, and business incentives. If asked about anything else, politely redirect: 'I specialize in MSME government schemes. How can I help you with business subsidies and incentives today?'"

    # run the conversation chain
    try:
        resp_text = chain.predict(input=final_input).strip()
    except Exception:
        logger.exception("ConversationChain failed for session %s", session_id)
        raise HTTPException(status_code=500, detail="LLM conversation failed")

    return JSONResponse(content={"response": resp_text})


@app.post("/eligibility-check")
async def eligibility_check(request: Request):
    """
    Process eligibility check form and return AI-powered scheme recommendations.
    Also captures lead information for follow-up.
    """
    session_id = request.headers.get("x-session-id", "default")
    
    try:
        payload = await request.json()
    except Exception:
        logger.exception("Invalid JSON in /eligibility-check")
        raise HTTPException(status_code=400, detail="Invalid JSON payload")
    
    logger.info("Processing eligibility check for session_id=%s", session_id)
    
    # Store as business profile for lead capture
    store_business_profile(session_id, payload)
    
    # Use our hybrid AI system: Rule-based engine + LLM enhancement
    logger.info("Using hybrid AI system for eligibility analysis")
    
    # Step 1: Rule-based eligibility matching
    business_profile = {
        'company_name': payload.get('company-name', ''),
        'company_industry': payload.get('company-industry', ''),
        'company_state': payload.get('company-state', ''),
        'directors_partners': payload.get('directors-partners', ''),
        'operational_manufacturing_units': payload.get('operational-manufacturing-units', ''),
        'upcoming_manufacturing_units': payload.get('upcoming-manufacturing-units', ''),
        'women_directors_equity': payload.get('women-directors-equity', ''),
        'startup_status': payload.get('startup-status', ''),
        'msme_registered': payload.get('msme-registered', ''),
        'applicant_name': payload.get('applicant-name', ''),
        'applicant_phone': payload.get('applicant-phone', '')
    }
    
    # Get rule-based matches
    matches = eligibility_engine.evaluate_eligibility(business_profile)
    
    # Step 2: Enhance with LLM for better descriptions and context
    if matches:
        # Prepare scheme data for LLM enhancement
        scheme_data = []
        for match in matches[:5]:  # Top 5 matches
            scheme_data.append({
                "name": match.scheme.name,
                "description": match.scheme.description,
                "benefit_amount": match.scheme.benefit_amount,
                "benefit_type": match.scheme.benefit_type,
                "score": match.score,
                "reasons": match.reasons
            })
        
        # Create enhanced prompt for LLM
        llm_prompt = f"""
        Based on the rule-based eligibility analysis below, enhance the scheme descriptions and provide better context.
        
        BUSINESS PROFILE:
        - Company: {business_profile['company_name']}
        - Industry: {business_profile['company_industry']}
        - State: {business_profile['company_state']}
        - Women Directors: {business_profile['women_directors_equity']}
        - Startup Status: {business_profile['startup_status']}
        - MSME Registered: {business_profile['msme_registered']}
        
        RULE-BASED MATCHES:
        {json.dumps(scheme_data, indent=2)}
        
        Please enhance these matches with:
        1. Better scheme descriptions
        2. More specific benefit calculations
        3. Clearer eligibility requirements
        4. Next steps for application
        
        Respond with JSON in this exact format:
        {{
            "eligible_schemes": [
                {{
                    "name": "Scheme Name",
                    "benefit_amount": "₹X Lakhs",
                    "benefit_type": "Direct Incentive/Interest Subsidy/Loan Guarantee",
                    "eligibility_score": "85%",
                    "description": "Enhanced description",
                    "requirements": ["Requirement 1", "Requirement 2"]
                }}
            ],
            "benefit_breakdown": {{
                "direct_incentives": "₹X Lakhs",
                "interest_subsidies": "₹X Lakhs", 
                "loan_guarantees": "₹X Lakhs"
            }},
            "total_estimated_benefits": "₹X Lakhs",
            "recommended_actions": ["Action 1", "Action 2"]
        }}
        """
    else:
        # Fallback to LLM-only if no rule-based matches
        llm_prompt = f"""
        Analyze this business for MSME scheme eligibility:
        
        BUSINESS PROFILE:
        - Company: {business_profile['company_name']}
        - Industry: {business_profile['company_industry']}
        - State: {business_profile['company_state']}
        - Women Directors: {business_profile['women_directors_equity']}
        - Startup Status: {business_profile['startup_status']}
        - MSME Registered: {business_profile['msme_registered']}
        
        Provide scheme recommendations in JSON format as specified above.
        """
    
    try:
        # Use the LLM to enhance rule-based results
        response = llm.invoke(llm_prompt)
        ai_response = response.content.strip()
        
        # Try to parse JSON response
        try:
            import json
            # Clean the response to extract JSON if it's wrapped in markdown
            if "```json" in ai_response:
                ai_response = ai_response.split("```json")[1].split("```")[0].strip()
            elif "```" in ai_response:
                ai_response = ai_response.split("```")[1].split("```")[0].strip()
            
            parsed_response = json.loads(ai_response)
            logger.info("Successfully parsed AI response as JSON")
        except Exception as e:
            logger.warning("Failed to parse AI response as JSON: %s", str(e))
            logger.info("Raw AI response: %s", ai_response[:500])  # Log first 500 chars
            
            # Fallback to rule-based results
            logger.info("Using rule-based fallback results")
            parsed_response = {
                "eligible_schemes": [],
                "benefit_breakdown": eligibility_engine.get_benefit_breakdown(matches),
                "total_estimated_benefits": eligibility_engine.get_total_estimated_benefits(matches),
                "lead_priority": "High" if matches else "Medium",
                "recommended_actions": eligibility_engine.get_recommended_actions(matches)
            }
            
            # Convert matches to scheme format
            for match in matches[:5]:  # Top 5 matches
                parsed_response["eligible_schemes"].append({
                    "name": match.scheme.name,
                    "benefit_amount": match.scheme.benefit_amount,
                    "benefit_type": match.scheme.benefit_type,
                    "eligibility_score": f"{int(match.score * 100)}%",
                    "description": match.scheme.description,
                    "requirements": [rule.description for rule in match.matched_rules]
                })
            
            # If no matches, provide default schemes
            if not parsed_response["eligible_schemes"]:
                parsed_response["eligible_schemes"] = [
                    {
                        "name": "Pradhan Mantri Mudra Yojana (PMMY)",
                        "benefit_amount": "₹10 Lakh",
                        "benefit_type": "Loan Guarantee",
                        "eligibility_score": "75%",
                        "description": "Collateral-free loans for micro-enterprises",
                        "requirements": ["Udyam registration", "No formal collateral required"]
                    }
                ]
        
        # Add lead capture metadata
        parsed_response["lead_info"] = {
            "session_id": session_id,
            "timestamp": datetime.now().isoformat(),
            "contact_info": {
                "name": payload.get('applicant-name', ''),
                "phone": payload.get('applicant-phone', ''),
                "company": payload.get('company-name', '')
            }
        }
        
        # Add company name to results for frontend display
        parsed_response["company_name"] = payload.get('company-name', 'Your Company')
        
        # Save lead to database for persistent storage
        save_lead_to_database(session_id, payload, parsed_response)
        
        logger.info("Generated eligibility analysis for session_id=%s", session_id)
        return JSONResponse(content=parsed_response, media_type="application/json; charset=utf-8")
        
    except Exception as e:
        logger.exception("Error processing eligibility check: %s", e)
        raise HTTPException(status_code=500, detail="Failed to process eligibility check")


@app.get("/leads")
async def get_leads():
    """
    Retrieve all captured leads from the database.
    Useful for your team to see and follow up with leads.
    """
    try:
        leads = get_all_leads()
        logger.info(f"Retrieved {len(leads)} leads from database")
        return JSONResponse(content={"leads": leads, "count": len(leads)})
    except Exception as e:
        logger.exception("Error retrieving leads: %s", e)
        raise HTTPException(status_code=500, detail="Failed to retrieve leads")

# ===== ADMIN API ENDPOINTS =====

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

@app.get("/api/admin/dashboard")
async def get_dashboard_stats():
    """Get dashboard statistics"""
    try:
        # Real counts
        total = await db_manager.execute_one("SELECT COUNT(*) AS c FROM schemes")
        active = await db_manager.execute_one("SELECT COUNT(*) AS c FROM schemes WHERE status='active'")
        state = await db_manager.execute_one("SELECT COUNT(*) AS c FROM schemes WHERE coverage_type='state'")
        central = await db_manager.execute_one("SELECT COUNT(*) AS c FROM schemes WHERE coverage_type='national'")
        last = await db_manager.execute_one("SELECT MAX(last_updated) AS m FROM schemes")
        return {
            "total_schemes": total["c"] if total else 0,
            "active_schemes": active["c"] if active else 0,
            "state_schemes": state["c"] if state else 0,
            "central_schemes": central["c"] if central else 0,
            "women_schemes": 0,
            "sc_st_schemes": 0,
            "last_updated": (last["m"].isoformat() if last and last["m"] else None)
        }
    except Exception as e:
        logger.exception("Error getting dashboard stats: %s", e)
        raise HTTPException(status_code=500, detail="Failed to get dashboard statistics")

@app.get("/api/admin/schemes")
async def get_admin_schemes(
    page: int = 1,
    limit: int = 20,
    search: Optional[str] = None,
    ministry: Optional[str] = None,
    scheme_type: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None
):
    """Get schemes for admin interface"""
    try:
        offset = (page - 1) * limit
        rows = await db_manager.execute_query(
            """
            SELECT scheme_id, scheme_name, ministry, department, scheme_type, category, status,
                   data_quality_score, short_description
            FROM schemes
            ORDER BY COALESCE(last_updated, created_at) DESC NULLS LAST
            LIMIT $1 OFFSET $2
            """,
            limit, offset
        )
        total = await db_manager.execute_one("SELECT COUNT(*) AS c FROM schemes")
        return {
            "schemes": [dict(r) for r in rows],
            "total": total["c"] if total else 0,
            "page": page,
            "limit": limit
        }
    except Exception as e:
        logger.exception("Error getting schemes: %s", e)
        raise HTTPException(status_code=500, detail="Failed to get schemes")

@app.get("/api/admin/schemes/{scheme_id}")
async def get_scheme_details(scheme_id: str):
    """Get detailed scheme information"""
    try:
        # This would fetch from database
        mock_scheme = {
            "scheme_id": scheme_id,
            "scheme_name": "Sample Scheme",
            "ministry": "MSME",
            "department": "DC-MSME",
            "long_description": "Detailed description of the scheme",
            "scheme_type": "subsidy",
            "category": "manufacturing",
            "status": "active",
            "data_quality_score": 0.8
        }
        
        return mock_scheme
    except Exception as e:
        logger.exception("Error getting scheme details: %s", e)
        raise HTTPException(status_code=500, detail="Failed to get scheme details")

@app.post("/api/admin/scraper/start")
async def start_scraper(request: Request):
    """Start web scraping process and persist results"""
    try:
        data = await request.json()
        sources = data.get("sources", [])
        mode = data.get("mode", "full")

        scraper = GovernmentSchemesScraper()
        await scraper.initialize()
        try:
            scraped = await scraper.scrape_all_sources()
        finally:
            await scraper.close()

        logger.info("Scraper completed: %d items scraped", len(scraped))
        inserted, skipped = await persist_scraped_schemes(scraped)
        return {
            "status": "completed",
            "inserted": inserted,
            "skipped": skipped,
            "sources": sources,
            "mode": mode
        }
    except Exception as e:
        logger.exception("Error starting scraper: %s", e)
        raise HTTPException(status_code=500, detail="Failed to start scraper")

@app.get("/api/admin/scraper/status")
async def get_scraper_status():
    """Get scraper status"""
    try:
        # This would return actual scraper status
        return {
            "status": "running",
            "schemes_found": 0,
            "schemes_added": 0,
            "schemes_updated": 0,
            "errors": 0,
            "start_time": datetime.now().isoformat()
        }
    except Exception as e:
        logger.exception("Error getting scraper status: %s", e)
        raise HTTPException(status_code=500, detail="Failed to get scraper status")

@app.get("/api/admin/scraper/stop")
async def stop_scraper():
    """Stop web scraping process"""
    try:
        # This would stop the actual scraper
        logger.info("Stopping scraper")
        
        return {
            "status": "stopped",
            "message": "Scraping process stopped"
        }
    except Exception as e:
        logger.exception("Error stopping scraper: %s", e)
        raise HTTPException(status_code=500, detail="Failed to stop scraper")

@app.get("/admin")
async def admin_frontend():
    """Serve admin frontend"""
    try:
        with open("admin_frontend.html", "r", encoding="utf-8") as f:
            content = f.read()
        return HTMLResponse(content=content)
    except Exception as e:
        logger.exception("Error serving admin frontend: %s", e)
        raise HTTPException(status_code=500, detail="Failed to serve admin frontend")


# ----- Admin: Create Scheme -----
@app.post("/api/admin/schemes")
async def create_scheme_admin(request: Request):
    """Create a scheme manually from Admin UI"""
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    try:
        # Basic required fields
        name = payload.get("scheme_name")
        if not name:
            raise HTTPException(status_code=400, detail="scheme_name is required")

        scheme_id = payload.get("scheme_id") or slugify_id(name)
        query = """
        INSERT INTO schemes (
            scheme_id, scheme_name, ministry, department, launch_date, last_updated,
            status, short_description, long_description, objectives, scheme_type, category,
            budget_allocation, max_benefit_amount, benefit_percentage, coverage_type,
            states_covered, districts_covered, official_website, application_portal,
            guidelines_pdf_url, source_url, last_verified_date, data_quality_score
        ) VALUES (
            $1,$2,$3,$4,NULL,NOW(),
            'active',$5,$6,NULL,$7,$8,
            NULL,NULL,NULL,$9,
            NULL,NULL,$10,$11,
            $12,$13,NOW(),0.8
        ) ON CONFLICT (scheme_id) DO UPDATE SET
            scheme_name=EXCLUDED.scheme_name,
            ministry=EXCLUDED.ministry,
            department=EXCLUDED.department,
            short_description=EXCLUDED.short_description,
            long_description=EXCLUDED.long_description,
            scheme_type=EXCLUDED.scheme_type,
            category=EXCLUDED.category,
            coverage_type=EXCLUDED.coverage_type,
            official_website=EXCLUDED.official_website,
            application_portal=EXCLUDED.application_portal,
            guidelines_pdf_url=EXCLUDED.guidelines_pdf_url,
            source_url=EXCLUDED.source_url
        ;
        """
        await db_manager.execute_query(
            query,
            scheme_id, name, payload.get("ministry"), payload.get("department"),
            payload.get("short_description"), payload.get("long_description"),
            payload.get("scheme_type"), payload.get("category"),
            payload.get("coverage_type","national"),
            payload.get("official_website"), payload.get("application_portal"),
            payload.get("guidelines_pdf_url"), payload.get("source_url")
        )
        return {"status":"ok","scheme_id":scheme_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to create scheme: %s", e)
        raise HTTPException(status_code=500, detail="Failed to create scheme")


def slugify_id(name: str) -> str:
    import re
    s = re.sub(r"[^a-zA-Z0-9]+","-", name.lower()).strip('-')
    return ("admin_" + s)[:48]


async def persist_scraped_schemes(items: list[ScrapedScheme]) -> tuple[int,int]:
    """Persist scraped schemes into DB; returns (inserted, skipped)"""
    inserted = 0
    skipped = 0
    for sc in items:
        try:
            scheme_id = slugify_id(sc.scheme_name)
            # Insert scheme
            await db_manager.execute_query(
                """
                INSERT INTO schemes (
                    scheme_id, scheme_name, ministry, department, last_updated, status,
                    short_description, long_description, objectives, scheme_type, category,
                    coverage_type, official_website, guidelines_pdf_url, source_url, data_quality_score
                ) VALUES (
                    $1,$2,$3,$4,NOW(),'active',
                    $5,$6,NULL,$7,$8,
                    'national',$9,$10,$11,$12
                ) ON CONFLICT (scheme_id) DO NOTHING
                """,
                scheme_id, sc.scheme_name, sc.ministry, sc.department,
                sc.description, sc.description, sc.scheme_type, sc.category,
                sc.official_website, sc.guidelines_pdf_url, sc.source_url, sc.data_quality_score
            )

            # Insert a simple eligibility row if any flags present
            if sc.eligibility:
                await db_manager.execute_query(
                    """
                    INSERT INTO eligibility_criteria (
                        criteria_id, scheme_id, business_type, industry_sectors,
                        women_owned, sc_st_owned, export_oriented, manufacturing_unit,
                        technology_adoption, startup_recognized, udyam_registered,
                        required_documents
                    ) VALUES (
                        $1,$2,$3,$4,
                        $5,$6,$7,$8,
                        $9,$10,$11,$12
                    ) ON CONFLICT (scheme_id) DO NOTHING
                    """,
                    f"elig_{scheme_id}", scheme_id,
                    json.dumps(sc.eligibility.get('business_type')) if sc.eligibility.get('business_type') else None,
                    json.dumps(sc.eligibility.get('industry_sectors')) if sc.eligibility.get('industry_sectors') else None,
                    sc.eligibility.get('women_owned'), sc.eligibility.get('sc_st_owned'),
                    sc.eligibility.get('export_oriented'), sc.eligibility.get('manufacturing_unit'),
                    sc.eligibility.get('technology_adoption'), sc.eligibility.get('startup_recognized'),
                    sc.eligibility.get('udyam_registered'),
                    json.dumps(sc.eligibility.get('required_documents')) if sc.eligibility.get('required_documents') else None
                )

            # Insert benefits
            for idx, b in enumerate(sc.benefits or []):
                await db_manager.execute_query(
                    """
                    INSERT INTO benefits (
                        benefit_id, scheme_id, benefit_type, benefit_category, description
                    ) VALUES ($1,$2,$3,$4,$5)
                    ON CONFLICT (benefit_id) DO NOTHING
                    """,
                    f"ben_{scheme_id}_{idx}", scheme_id, b.get('benefit_type',''), None, b.get('description','')
                )

            # Insert application process steps
            for step in sc.application_process or []:
                await db_manager.execute_query(
                    """
                    INSERT INTO application_process (
                        process_id, scheme_id, step_number, step_name, step_description,
                        required_documents, processing_time, approval_authority
                    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
                    ON CONFLICT (process_id) DO NOTHING
                    """,
                    f"proc_{scheme_id}_{step.get('step_number',1)}", scheme_id,
                    step.get('step_number',1), step.get('step_name',''), step.get('step_description',''),
                    json.dumps(step.get('required_documents')) if step.get('required_documents') else None,
                    step.get('processing_time'), step.get('approval_authority')
                )

            inserted += 1
        except Exception as e:
            logger.warning("Skip scheme %s due to error: %s", getattr(sc,'scheme_name','?'), e)
            skipped += 1
    return inserted, skipped

# uvicorn main:app --host 0.0.0.0 --port 8001 --reload
