import argparse
import hashlib
import io
import os
import re
import sys
from typing import List, Dict, Tuple

import requests
from dotenv import load_dotenv
from pdfminer.high_level import extract_text
import asyncio
import asyncpg
from bs4 import BeautifulSoup


TARGET_PDFS = [
    "https://investharyana.in/content/pdfs/Draft%20EPP%202020%20chapters_5th%20Sept%202020.pdf",
    "https://msme.haryana.gov.in/haryana-enterprises-and-employment-policy-2020/",
]


def slugify(text: str) -> str:
    s = re.sub(r"[^a-zA-Z0-9]+", "-", (text or "").lower()).strip("-")
    # scheme_id is VARCHAR(50). We prefix with 'pdf_' (4 chars), so cap slug at 46.
    return s[:46] or "scheme"


def fetch_bytes(url: str, timeout: int = 60) -> bytes:
    verify = not ("investharyana.in" in url)
    resp = requests.get(url, timeout=timeout, verify=verify)
    resp.raise_for_status()
    return resp.content


def fetch_text(url: str, timeout: int = 60) -> str:
    verify = not ("investharyana.in" in url)
    resp = requests.get(url, timeout=timeout, verify=verify)
    resp.raise_for_status()
    return resp.text


def paragraphs_from_pdf(pdf_bytes: bytes) -> List[str]:
    text = extract_text(io.BytesIO(pdf_bytes)) or ""
    # Normalize whitespace
    text = re.sub(r"\r", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return [p.strip() for p in text.split("\n\n") if p.strip()]


KEYWORDS = re.compile(r"(scheme|incentive|subsidy|refund|exemption|duty|interest|reimbursement|support|assistance|grant|benefit)", re.I)
VALUE_SIGNALS = re.compile(r"(₹|percent|%|up to|per annum|per cent|maximum|cap|coverage)", re.I)
BAD_HEADINGS = {
    "abbreviations", "executive summary", "overview", "contents", "table of contents",
}


def _looks_like_heading(text: str) -> bool:
    # Skip ALL CAPS long headings or TOC dot-leaders
    if re.search(r"\.{5,}", text):
        return True
    letters = [c for c in text if c.isalpha()]
    if letters and sum(1 for c in letters if c.isupper()) / max(1, len(letters)) > 0.8 and len(text.split()) >= 3:
        return True
    return False


def extract_candidates(paragraphs: List[str], source_url: str) -> List[Dict[str, str]]:
    candidates: List[Dict[str, str]] = []
    seen_titles = set()
    for p in paragraphs:
        # Take first line as possible title
        first_line = p.splitlines()[0].strip()
        # Clean numbering like "1.", "1)"
        first_line_clean = re.sub(r"^\s*\d+[\.)]\s*", "", first_line)
        if len(first_line_clean) < 6 or len(first_line_clean) > 160:
            continue
        if _looks_like_heading(first_line_clean):
            continue
        if first_line_clean.lower() in BAD_HEADINGS:
            continue
        if re.match(r"^page\s+\d+\s+of\s+\d+$", first_line_clean, re.I):
            continue
        lines = p.splitlines()
        body_text = " ".join(lines[:6])  # early portion of paragraph
        # Require scheme/incentive keyword anywhere in early portion AND a value/benefit signal
        if not KEYWORDS.search(body_text):
            continue
        if not VALUE_SIGNALS.search(body_text):
            continue
        # Ensure paragraph has at least two lines (title + some description)
        if len(lines) < 2:
            continue
        title = first_line_clean
        if title in seen_titles:
            continue
        seen_titles.add(title)
        # Keep a compact description
        desc = "\n".join(lines[:10])
        if len(desc) > 1200:
            desc = desc[:1200] + "…"
        candidates.append({
            "scheme_name": title,
            "description": desc,
            "source_url": source_url
        })
    return candidates


async def upsert_schemes(db_url: str, rows: List[Dict[str, str]], dry_run: bool) -> Tuple[int, int]:
    if dry_run or not rows:
        return (0, 0)
    conn = await asyncpg.connect(db_url)
    inserted = 0
    try:
        for r in rows:
            scheme_id = f"pdf_{slugify(r['scheme_name'])}"
            await conn.execute(
                """
                INSERT INTO schemes (
                    scheme_id, scheme_name, ministry, department, last_updated, status,
                    short_description, long_description, objectives, scheme_type, category,
                    coverage_type, official_website, guidelines_pdf_url, source_url, data_quality_score
                ) VALUES (
                    $1,$2,NULL,NULL,NOW(),'active',
                    $3,$4,NULL,NULL,'policy','state',NULL,NULL,$5,0.7
                ) ON CONFLICT (scheme_id) DO NOTHING
                """,
                scheme_id,
                r["scheme_name"],
                r["description"],
                r["description"],
                r["source_url"],
            )
            inserted += 1
    finally:
        await conn.close()
    return (inserted, 0)


def main() -> None:
    parser = argparse.ArgumentParser(description="Deterministic PDF importer (Haryana policies)")
    parser.add_argument("--dry-run", action="store_true", help="Do not write to DB; print sample output")
    parser.add_argument("--limit", type=int, default=200, help="Max candidates to consider")
    args = parser.parse_args()

    load_dotenv()
    db_url = os.getenv("DATABASE_URL")
    if not db_url and not args.dry_run:
        print("DATABASE_URL not set in .env", file=sys.stderr)
        sys.exit(2)

    all_rows: List[Dict[str, str]] = []
    for url in TARGET_PDFS:
        try:
            if url.lower().endswith(".pdf"):
                pdf = fetch_bytes(url)
                paras = paragraphs_from_pdf(pdf)
                rows = extract_candidates(paras, url)
            else:
                html = fetch_text(url)
                soup = BeautifulSoup(html, "html.parser")
                block_texts: List[str] = []
                for selector in ["h1", "h2", "h3", "h4", "li", "p"]:
                    for el in soup.select(selector):
                        txt = el.get_text(separator=" ", strip=True)
                        if txt:
                            block_texts.append(txt)
                # Make faux paragraphs by grouping nearby items
                paragraphs: List[str] = []
                para: List[str] = []
                for t in block_texts:
                    para.append(t)
                    if len(" ".join(para)) > 300:
                        paragraphs.append("\n".join(para))
                        para = []
                if para:
                    paragraphs.append("\n".join(para))
                rows = extract_candidates(paragraphs, url)
            all_rows.extend(rows)
        except Exception as e:
            print(f"Error fetching {url}: {e}", file=sys.stderr)

    # De-duplicate by scheme_name
    uniq: Dict[str, Dict[str, str]] = {}
    for r in all_rows:
        if r["scheme_name"] not in uniq:
            uniq[r["scheme_name"]] = r
    result_rows = list(uniq.values())[: args.limit]

    if args.dry_run:
        print(f"[DRY RUN] candidates={len(result_rows)} of total={len(all_rows)}")
        for r in result_rows[:10]:
            print("- ", r["scheme_name"], "| source=", r["source_url"])
        return

    inserted, _ = asyncio.run(upsert_schemes(db_url, result_rows, args.dry_run))
    print(f"Inserted={inserted} (of {len(result_rows)})")


if __name__ == "__main__":
    main()


