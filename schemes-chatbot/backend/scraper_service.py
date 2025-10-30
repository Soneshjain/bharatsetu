import asyncio
import json
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse

from dotenv import load_dotenv
load_dotenv()  # ensure DATABASE_URL and GROQ_API_KEY are loaded before DB import
from database import db_manager
from web_scraper import GovernmentSchemesScraper, ScrapedScheme


logger = logging.getLogger("scraper-service")
logging.basicConfig(level=logging.INFO)

app = FastAPI(title="BharatSetu Scraper Service", version="1.0.0")


class ScraperState:
    def __init__(self) -> None:
        self.running: bool = False
        self.started_at: Optional[datetime] = None
        self.finished_at: Optional[datetime] = None
        self.total_discovered: int = 0
        self.total_persisted: int = 0
        self.total_skipped: int = 0
        self.last_error: Optional[str] = None
        self.logs: List[str] = []
        self.task: Optional[asyncio.Task] = None

    def log(self, message: str) -> None:
        ts = datetime.now().isoformat(timespec="seconds")
        line = f"[{ts}] {message}"
        self.logs.append(line)
        # Keep last 500 lines
        if len(self.logs) > 500:
            self.logs = self.logs[-500:]


state = ScraperState()

class StateLogHandler(logging.Handler):
    def emit(self, record: logging.LogRecord) -> None:
        try:
            msg = self.format(record)
            state.log(msg)
        except Exception:
            pass

# Attach handler to capture logs from our modules
_h = StateLogHandler()
_h.setLevel(logging.INFO)
logging.getLogger("scraper-service").addHandler(_h)
logging.getLogger("web_scraper").addHandler(_h)
logging.getLogger().addHandler(_h)


@app.on_event("startup")
async def on_startup() -> None:
    # Initialize DB pool for this service
    try:
        await db_manager.initialize()
        state.log("Database pool initialized (scraper service)")
    except Exception as e:
        state.last_error = str(e)
        state.log(f"Failed to init DB: {e}")


@app.on_event("shutdown")
async def on_shutdown() -> None:
    try:
        await db_manager.close()
        state.log("Database pool closed")
    except Exception as e:
        state.log(f"Failed to close DB: {e}")


@app.get("/health")
async def health() -> Dict[str, Any]:
    return {"status": "ok", "timestamp": datetime.now().isoformat()}


@app.get("/scrape/status")
async def scrape_status() -> Dict[str, Any]:
    return {
        "running": state.running,
        "started_at": state.started_at.isoformat() if state.started_at else None,
        "finished_at": state.finished_at.isoformat() if state.finished_at else None,
        "total_discovered": state.total_discovered,
        "total_persisted": state.total_persisted,
        "total_skipped": state.total_skipped,
        "last_error": state.last_error,
    }


@app.get("/scrape/logs")
async def scrape_logs(limit: int = 200) -> JSONResponse:
    return JSONResponse(content={"logs": state.logs[-abs(limit):]})


@app.post("/scrape/start")
async def scrape_start(payload: Dict[str, Any] | None = None) -> Dict[str, Any]:
    if state.running:
        raise HTTPException(status_code=409, detail="Scraper already running")

    opts = payload or {}
    concurrency = int(opts.get("concurrency", 5))
    state.log(f"Starting scrape with concurrency={concurrency}")

    state.running = True
    state.started_at = datetime.now()
    state.finished_at = None
    state.total_discovered = 0
    state.total_persisted = 0
    state.total_skipped = 0
    state.last_error = None

    async def runner() -> None:
        scraper = GovernmentSchemesScraper()
        try:
            await scraper.initialize()
            items = await scraper.scrape_all_sources()
            state.total_discovered = len(items)
            state.log(f"Discovered {len(items)} candidate schemes")
            persisted, skipped = await persist_scraped_schemes(items)
            state.total_persisted = persisted
            state.total_skipped = skipped
            state.log(f"Persisted={persisted}, skipped={skipped}")
        except Exception as e:
            state.last_error = str(e)
            state.log(f"Runner error: {e}")
        finally:
            try:
                await scraper.close()
            except Exception:
                pass
            state.running = False
            state.finished_at = datetime.now()

    state.task = asyncio.create_task(runner())
    return {"status": "started"}


@app.get("/scrape/sources")
async def scrape_sources() -> Dict[str, Any]:
    s = GovernmentSchemesScraper()
    return {"sources": s.base_urls}


async def persist_scraped_schemes(items: List[ScrapedScheme]) -> tuple[int, int]:
    inserted = 0
    skipped = 0
    for sc in items:
        try:
            scheme_id = slugify_id(sc.scheme_name)
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
            state.log(f"Persist skip {getattr(sc,'scheme_name','?')}: {e}")
            skipped += 1
    return inserted, skipped


def slugify_id(name: str) -> str:
    import re
    s = re.sub(r"[^a-zA-Z0-9]+", "-", (name or "").lower()).strip("-")
    return ("scr_" + s)[:48]


