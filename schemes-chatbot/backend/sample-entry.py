import os
import asyncio
import asyncpg
import uuid
import datetime
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()
url = os.getenv("DATABASE_URL")

async def run():
    """Connects to the database and inserts seed MSME scheme data."""
    if not url:
        print("Error: DATABASE_URL not found in environment variables.")
        return

    conn = await asyncpg.connect(url)
    try:
        now = datetime.date.today()
        q = """
INSERT INTO schemes (
    scheme_id, scheme_name, ministry, department, launch_date, last_updated,
    status, short_description, long_description, objectives, scheme_type, category,
    budget_allocation, max_benefit_amount, benefit_percentage, coverage_type,
    states_covered, districts_covered, official_website, application_portal,
    guidelines_pdf_url, source_url, last_verified_date, data_quality_score
) VALUES (
    $1,$2,$3,$4,$5,$6,
    'active',$7,$8,$9,$10,$11,
    NULL, NULL, NULL, $12,
    $13, $14, $15, $16,
    $17, $18, $19, 0.9
)
ON CONFLICT (scheme_id) DO NOTHING;
"""
        rows = [
            {
                "id": "scheme_seed_001",
                "name": "Pradhan Mantri Mudra Yojana (PMMY)",
                "ministry": "Ministry of Finance",
                "dept": "Department of Financial Services",
                "launch": datetime.date(2015, 4, 8),
                "updated": now,
                "short": "Collateral-free loans for micro-enterprises",
                "long": "Collateral-free working capital and term loans for non-farm micro enterprises (Shishu, Kishor, Tarun).",
                "obj": "Enable micro-units to access finance and grow employment.",
                "type": "loan_direct",  # Changed type to better reflect PMMY
                "cat": "finance",
                "coverage": "national",
                "states": None,
                "districts": None,
                "site": "https://www.mudra.org.in/",
                "portal": "https://www.udyamassist.gov.in/",
                "pdf": None,
                "src": "https://msme.gov.in/",
                "verify": now
            },
            {
                "id": "scheme_seed_002",
                "name": "Credit Guarantee Scheme for MSEs (CGTMSE)",
                "ministry": "Ministry of MSME",
                "dept": "CGTMSE Trust",
                "launch": datetime.date(2000, 8, 30),
                "updated": now,
                "short": "Collateral-free credit guarantee to banks for MSE loans",
                "long": "Guarantee coverage up to defined limits to facilitate collateral-free lending to Micro and Small Enterprises.",
                "obj": "Improve institutional credit flow to MSEs.",
                "type": "loan_guarantee",
                "cat": "finance",
                "coverage": "national",
                "states": None,
                "districts": None,
                "site": "https://www.cgtmse.in/",
                "portal": "https://www.cgtmse.in/Default.aspx",
                "pdf": None,
                "src": "https://msme.gov.in/",
                "verify": now
            },
        ]
        
        # Execute the INSERT query for each row
        for r in rows:
            await conn.execute(q,
                r["id"], r["name"], r["ministry"], r["dept"], r["launch"], r["updated"],
                r["short"], r["long"], r["obj"], r["type"], r["cat"], r["coverage"],
                # Correctly handle None for JSON types
                None if r["states"] is None else asyncpg.types.Json(r["states"]),
                None if r["districts"] is None else asyncpg.types.Json(r["districts"]),
                r["site"], r["portal"], r["pdf"], r["src"], r["verify"]
            )
        print("Inserted seed schemes")
    except Exception as e:
        print(f"An error occurred during database operation: {e}")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(run())