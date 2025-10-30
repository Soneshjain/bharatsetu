import os
import csv
import re
import argparse
import asyncio
import asyncpg
from dotenv import load_dotenv


def slugify(text: str) -> str:
    text = text.strip().lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return re.sub(r"-+", "-", text).strip('-')[:48]


def guess_benefit_type(benefit_text: str) -> str:
    t = (benefit_text or "").lower()
    if any(k in t for k in ["loan", "credit", "guarantee", "cgtmse"]):
        return "loan_guarantee"
    if any(k in t for k in ["subsidy", "reimbursement", "grant", "interest", "capital"]):
        return "direct_subsidy"
    if any(k in t for k in ["tax", "duty", "sgst", "stamp"]):
        return "tax_incentive"
    return "support"


def map_coverage(level: str) -> str:
    s = (level or "").lower()
    if "national" in s or "central" in s:
        return "national"
    if "state" in s:
        return "state"
    return "national"


async def main(file_path: str):
    load_dotenv()
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        raise SystemExit("DATABASE_URL not set")

    conn = await asyncpg.connect(db_url)
    try:
        # Basic UPSERTs
        insert_scheme = """
        INSERT INTO schemes (
            scheme_id, scheme_name, ministry, department, launch_date, last_updated,
            status, short_description, long_description, objectives, scheme_type, category,
            budget_allocation, max_benefit_amount, benefit_percentage, coverage_type,
            states_covered, districts_covered, official_website, application_portal,
            guidelines_pdf_url, source_url, last_verified_date, data_quality_score
        ) VALUES (
            $1, $2, NULL, NULL, NULL, NULL,
            'active', $3, $4, NULL, NULL, NULL,
            NULL, NULL, NULL, $5,
            NULL, NULL, NULL, NULL,
            NULL, NULL, NULL, 0.7
        ) ON CONFLICT (scheme_id) DO UPDATE SET
            short_description = EXCLUDED.short_description,
            long_description = EXCLUDED.long_description,
            coverage_type = EXCLUDED.coverage_type
        ;
        """

        insert_benefit = """
        INSERT INTO benefits (
            benefit_id, scheme_id, benefit_type, benefit_category, calculation_method,
            fixed_amount, percentage_value, max_cap, min_amount,
            tier_1_amount, tier_1_condition, tier_2_amount, tier_2_condition, tier_3_amount, tier_3_condition,
            disbursement_method, payment_schedule, validity_period,
            description
        ) VALUES (
            $1, $2, $3, NULL, NULL,
            NULL, NULL, NULL, NULL,
            NULL, NULL, NULL, NULL, NULL, NULL,
            NULL, NULL, NULL,
            $4
        ) ON CONFLICT (benefit_id) DO NOTHING;
        """

        insert_agency = """
        INSERT INTO nodal_agencies (agency_id, agency_name)
        VALUES ($1, $2)
        ON CONFLICT (agency_id) DO NOTHING;
        """

        map_scheme_agency = """
        INSERT INTO scheme_agencies (mapping_id, scheme_id, agency_id, role)
        VALUES ($1, $2, $3, 'implementing')
        ON CONFLICT DO NOTHING;
        """

        with open(file_path, newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                name = (row.get('Name of Scheme') or '').strip()
                if not name:
                    continue
                scheme_id = f"csv_{slugify(name)}"
                short_desc = (row.get('Description') or '').strip()
                long_desc = short_desc
                coverage = map_coverage(row.get('Level'))
                benefit_text = (row.get('Benefit') or '').strip()
                nodal = (row.get('Nodal Agency/Implementation') or '').strip()

                await conn.execute(
                    insert_scheme,
                    scheme_id, name, short_desc, long_desc, coverage
                )

                if benefit_text:
                    benefit_id = f"benefit_{slugify(name)}"
                    await conn.execute(
                        insert_benefit,
                        benefit_id, scheme_id, guess_benefit_type(benefit_text), benefit_text
                    )

                if nodal:
                    agency_id = f"agency_{slugify(nodal)}"
                    await conn.execute(insert_agency, agency_id, nodal)
                    mapping_id = f"map_{scheme_id}_{agency_id}"
                    await conn.execute(map_scheme_agency, mapping_id, scheme_id, agency_id)

        print("CSV import completed")
    finally:
        await conn.close()


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--file", required=True)
    args = p.parse_args()
    asyncio.run(main(args.file))


