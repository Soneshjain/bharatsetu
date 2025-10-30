"""
Intelligent Web Scraper for Government Schemes
Follows the comprehensive data sourcing strategy provided
"""

import asyncio
import aiohttp
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import json
import re
from dataclasses import dataclass
import hashlib
import io
from pdfminer.high_level import extract_text

logger = logging.getLogger(__name__)

@dataclass
class ScrapedScheme:
    scheme_name: str
    ministry: str
    department: str
    description: str
    scheme_type: str
    category: str
    benefits: List[Dict[str, Any]]
    eligibility: Dict[str, Any]
    application_process: List[Dict[str, Any]]
    source_url: str
    official_website: str
    guidelines_pdf_url: Optional[str] = None
    last_updated: Optional[datetime] = None
    data_quality_score: float = 0.0

class GovernmentSchemesScraper:
    def __init__(self):
        self.base_urls = {
            # Primary Sources (Highest Accuracy)
            "msme_gov": "https://msme.gov.in/schemes-programmes",
            "dcmsme": "https://dcmsme.gov.in/schemes",
            "udyam": "https://udyamregistration.gov.in/",
            "startup_india": "https://www.startupindia.gov.in/",
            "make_in_india": "https://www.makeinindia.com/",
            "dpiit": "https://dpiit.gov.in/",
            "data_gov": "https://data.gov.in/",
            
            # State Government Portals
            "maharashtra": "https://www.maharashtra.gov.in/",
            "gujarat": "https://www.gujarat.gov.in/",
            "karnataka": "https://www.karnataka.gov.in/",
            "haryana": "https://www.haryana.gov.in/",
            "tamil_nadu": "https://www.tn.gov.in/",
            "west_bengal": "https://www.wb.gov.in/",
            "rajasthan": "https://www.rajasthan.gov.in/",
            "uttar_pradesh": "https://www.up.gov.in/",
            "bihar": "https://www.bihar.gov.in/",
            "odisha": "https://www.odisha.gov.in/",
            "kerala": "https://www.kerala.gov.in/",
            "andhra_pradesh": "https://www.ap.gov.in/",
            "telangana": "https://www.telangana.gov.in/",
            "punjab": "https://www.punjab.gov.in/",
            "himachal_pradesh": "https://www.himachal.gov.in/",
            "jammu_kashmir": "https://www.jk.gov.in/",
            "assam": "https://www.assam.gov.in/",
            "manipur": "https://www.manipur.gov.in/",
            "meghalaya": "https://www.meghalaya.gov.in/",
            "mizoram": "https://www.mizoram.gov.in/",
            "nagaland": "https://www.nagaland.gov.in/",
            "sikkim": "https://www.sikkim.gov.in/",
            "tripura": "https://www.tripura.gov.in/",
            "arunachal_pradesh": "https://www.arunachal.gov.in/",
            "goa": "https://www.goa.gov.in/",
            "chhattisgarh": "https://www.chhattisgarh.gov.in/",
            "jharkhand": "https://www.jharkhand.gov.in/",
            "uttarakhand": "https://www.uk.gov.in/",
            "madhya_pradesh": "https://www.mp.gov.in/",
            "delhi": "https://www.delhi.gov.in/",
            "chandigarh": "https://www.chandigarh.gov.in/",
            "puducherry": "https://www.puducherry.gov.in/",
            "andaman_nicobar": "https://www.andaman.gov.in/",
            "dadra_nagar_haveli": "https://www.dnh.gov.in/",
            "daman_diu": "https://www.daman.nic.in/",
            "lakshadweep": "https://www.lakshadweep.gov.in/"
        }
        # Targeted sources the user requested
        self.target_docs = [
            "https://msme.icai.org/wp-content/uploads/2022/12/MSME-Schemes-Haryana.pdf",
            "https://investharyana.in/content/pdfs/Draft%20EPP%202020%20chapters_5th%20Sept%202020.pdf",
            "https://msme.haryana.gov.in/",
            "https://msme.haryana.gov.in/central-acts-and-rules/",
            "https://msme.haryana.gov.in/haryana-enterprises-and-employment-policy-2020/",
            "https://msme.haryana.gov.in/haryana-msme-policy-2019/",
            "https://msme.haryana.gov.in/enterprises-promotion-policy-2015/",
            "https://msme.haryana.gov.in/haryana-textile-policy/",
            "https://msme.haryana.gov.in/agribusiness-food-processing/",
            "https://msme.haryana.gov.in/haryana-pharmaceutical-policy/",
            "https://msme.haryana.gov.in/haryana-logistic-warehousing-and-retail-policy/",
            "https://msme.haryana.gov.in/amended-heep-2020-caqm-schemes-and-orders/",
            "https://msme.haryana.gov.in/hum-registration/",
            "https://msme.haryana.gov.in/udyam-registration/",
            "https://msme.haryana.gov.in/eodb/",
            "https://msme.haryana.gov.in/compendium-of-schemes/",
            "https://msme.haryana.gov.in/act-of-hmsefc/",
            "https://msme.haryana.gov.in/whats-an-msme/",
            "https://msme.haryana.gov.in/access-to-finance/",
            "https://msme.haryana.gov.in/access-to-infrastructure-and-entrepreneurship-development/",
            "https://msme.haryana.gov.in/access-to-markets/",
            "https://msme.haryana.gov.in/access-to-technology/",
            "https://msme.haryana.gov.in/agro-msme-cell/",
            "https://msme.haryana.gov.in/apparel-park-barhi/",
            "https://msme.haryana.gov.in/pm-formalization-of-micro-food-processing-enterprises-scheme/",
            "https://msme.haryana.gov.in/financial-service-and-credit-facilitation-cell/",
            "https://msme.haryana.gov.in/food-beverages/",
        ]
        
        self.session = None
        self.scraped_schemes = []
    
    async def initialize(self):
        """Initialize async session"""
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=60),
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        )
    
    async def close(self):
        """Close async session"""
        if self.session:
            await self.session.close()
    
    async def _fetch_text(self, url: str) -> Optional[str]:
        try:
            if "investharyana.in" in url:
                async with self.session.get(url, ssl=False) as resp:
                    if resp.status == 200:
                        return await resp.text()
            async with self.session.get(url) as resp:
                if resp.status == 200:
                    return await resp.text()
        except Exception as e:
            logger.error(f"fetch_text error for {url}: {e}")
        return None

    async def _fetch_bytes(self, url: str) -> Optional[bytes]:
        try:
            if "investharyana.in" in url:
                async with self.session.get(url, ssl=False) as resp:
                    if resp.status == 200:
                        return await resp.read()
            async with self.session.get(url) as resp:
                if resp.status == 200:
                    return await resp.read()
        except Exception as e:
            logger.error(f"fetch_bytes error for {url}: {e}")
        return None

    async def _scrape_pdf_schemes(self, url: str) -> List[ScrapedScheme]:
        """Download a PDF and use LLM to extract multiple schemes from the text"""
        out: List[ScrapedScheme] = []
        pdf = await self._fetch_bytes(url)
        if not pdf:
            return out
        try:
            # Offload CPU-bound PDF parsing to a background thread so the event loop stays responsive
            import asyncio as _asyncio
            text = await _asyncio.to_thread(extract_text, io.BytesIO(pdf))
            if not text:
                return out
            # Ask LLM to enumerate schemes as JSON array
            from langchain_groq import ChatGroq
            import os
            llm = ChatGroq(model="openai/gpt-oss-120b", api_key=os.getenv("GROQ_API_KEY"))
            prompt = f"""
            The following text comes from an official government/industry PDF about Haryana MSME schemes.
            Extract a JSON array of schemes with fields:
            [
              {{
                "scheme_name":"...",
                "ministry":"...",
                "department":"...",
                "description":"...",
                "scheme_type":"subsidy|grant|loan_guarantee|tax_incentive|certification|training",
                "category":"manufacturing|export|technology|green_energy|women_entrepreneurs|sc_st|textile|agriculture",
                "benefits":[{{"benefit_type":"...","description":"..."}}],
                "eligibility":{{"women_owned":false,"sc_st_owned":false}},
                "application_process":[{{"step_number":1,"step_name":"","step_description":""}}]
              }}
            ]
            Return ONLY a JSON array.
            TEXT:\n{text[:30000]}
            """
            resp = await llm.ainvoke(prompt)
            import json as _json
            arr = _json.loads(resp.content.strip())
            for s in arr:
                out.append(ScrapedScheme(
                    scheme_name=s.get('scheme_name',''),
                    ministry=s.get('ministry','Haryana'),
                    department=s.get('department',''),
                    description=s.get('description',''),
                    scheme_type=s.get('scheme_type',''),
                    category=s.get('category',''),
                    benefits=s.get('benefits',[]),
                    eligibility=s.get('eligibility',{}),
                    application_process=s.get('application_process',[]),
                    source_url=url,
                    official_website='',
                    data_quality_score=0.85
                ))
        except Exception as e:
            logger.error(f"PDF extract failed for {url}: {e}")
        return out
    async def scrape_all_sources(self) -> List[ScrapedScheme]:
        """Scrape all government sources"""
        logger.info("Starting comprehensive government schemes scraping")
        
        all_schemes = []
        # Scrape user-specified targets first
        try:
            logger.info("Scraping user targets (PDFs/pages)")
            for url in self.target_docs:
                try:
                    if url.lower().endswith('.pdf'):
                        scheme_list = await self._scrape_pdf_schemes(url)
                        all_schemes.extend(scheme_list)
                    else:
                        html = await self._fetch_text(url)
                        if html:
                            scheme = await self._extract_with_llm(html, url, "Haryana")
                            if scheme:
                                all_schemes.append(scheme)
                            # Also crawl internal links on msme.haryana.gov.in to depth 1
                            if urlparse(url).netloc.endswith("msme.haryana.gov.in"):
                                crawled = await self._crawl_domain_for_schemes(url, html, domain="msme.haryana.gov.in", max_pages=50)
                                all_schemes.extend(crawled)
                except Exception as e:
                    logger.error(f"Error scraping target {url}: {e}")
        except Exception as e:
            logger.error(f"Error scraping user targets: {e}")
        
        # Scrape primary sources
        primary_sources = [
            ("msme_gov", self.scrape_msme_portal),
            ("dcmsme", self.scrape_dcmsme_portal),
            ("startup_india", self.scrape_startup_india),
            ("data_gov", self.scrape_data_gov_portal)
        ]
        
        for source_name, scraper_func in primary_sources:
            try:
                logger.info(f"Scraping {source_name}")
                schemes = await scraper_func()
                all_schemes.extend(schemes)
                logger.info(f"Found {len(schemes)} schemes from {source_name}")
            except Exception as e:
                logger.error(f"Error scraping {source_name}: {e}")
        
        # Scrape state sources
        state_sources = [
            ("haryana", self.scrape_haryana_schemes),
            ("maharashtra", self.scrape_maharashtra_schemes),
            ("gujarat", self.scrape_gujarat_schemes),
            ("karnataka", self.scrape_karnataka_schemes),
            ("tamil_nadu", self.scrape_tamil_nadu_schemes)
        ]
        
        for state_name, scraper_func in state_sources:
            try:
                logger.info(f"Scraping {state_name} schemes")
                schemes = await scraper_func()
                all_schemes.extend(schemes)
                logger.info(f"Found {len(schemes)} schemes from {state_name}")
            except Exception as e:
                logger.error(f"Error scraping {state_name}: {e}")
        
        # Remove duplicates
        unique_schemes = self._deduplicate_schemes(all_schemes)
        logger.info(f"Total unique schemes found: {len(unique_schemes)}")
        
        return unique_schemes
    
    async def scrape_msme_portal(self) -> List[ScrapedScheme]:
        """Scrape MSME ministry portal (LLM-only; no fallback inserts)"""
        schemes = []
        
        try:
            async with self.session.get(self.base_urls["msme_gov"]) as response:
                if response.status == 200:
                    html = await response.text()
                    soup = BeautifulSoup(html, 'html.parser')
                    
                    # Find scheme cards/links
                    scheme_links = soup.find_all('a', href=re.compile(r'scheme|programme|yojana', re.I))
                    total = len(scheme_links)
                    success = 0
                    logger.info("MSME list: discovered %d links", total)
                    for link in scheme_links:
                        href = link.get('href')
                        if not href:
                            continue
                        scheme_url = urljoin(self.base_urls["msme_gov"], href)
                        scheme_data = await self._scrape_scheme_detail(scheme_url, "MSME")
                        if scheme_data:
                            schemes.append(scheme_data)
                            success += 1
                    logger.info("MSME detail parsed: %d/%d", success, total)
        
        except Exception as e:
            logger.error(f"Error scraping MSME portal: {e}")
        
        return schemes
    
    async def scrape_dcmsme_portal(self) -> List[ScrapedScheme]:
        """Scrape DC-MSME portal"""
        schemes = []
        
        try:
            async with self.session.get(self.base_urls["dcmsme"]) as response:
                if response.status == 200:
                    html = await response.text()
                    soup = BeautifulSoup(html, 'html.parser')
                    
                    # Find scheme sections
                    scheme_sections = soup.find_all('div', class_=re.compile(r'scheme|program'))
                    
                    for section in scheme_sections:
                        scheme_data = self._extract_scheme_from_section(section, "DC-MSME")
                        if scheme_data:
                            schemes.append(scheme_data)
        
        except Exception as e:
            logger.error(f"Error scraping DC-MSME portal: {e}")
        
        return schemes
    
    async def scrape_startup_india(self) -> List[ScrapedScheme]:
        """Scrape Startup India portal"""
        schemes = []
        
        try:
            async with self.session.get(self.base_urls["startup_india"]) as response:
                if response.status == 200:
                    html = await response.text()
                    soup = BeautifulSoup(html, 'html.parser')
                    
                    # Find startup schemes
                    startup_schemes = soup.find_all('div', class_=re.compile(r'scheme|program|initiative'))
                    
                    for scheme_div in startup_schemes:
                        scheme_data = self._extract_startup_scheme(scheme_div)
                        if scheme_data:
                            schemes.append(scheme_data)
        
        except Exception as e:
            logger.error(f"Error scraping Startup India: {e}")
        
        return schemes
    
    async def scrape_data_gov_portal(self) -> List[ScrapedScheme]:
        """Scrape data.gov.in for structured scheme data"""
        schemes = []
        
        try:
            # Search for MSME related datasets
            search_url = f"{self.base_urls['data_gov']}/api/3/action/package_search"
            params = {
                'q': 'MSME schemes government',
                'rows': 100
            }
            
            async with self.session.get(search_url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    for dataset in data.get('result', {}).get('results', []):
                        scheme_data = self._extract_from_dataset(dataset)
                        if scheme_data:
                            schemes.append(scheme_data)
        
        except Exception as e:
            logger.error(f"Error scraping data.gov.in: {e}")
        
        return schemes
    
    async def scrape_haryana_schemes(self) -> List[ScrapedScheme]:
        """Scrape Haryana state schemes"""
        schemes = []
        
        try:
            # Haryana Industries & Commerce Department
            haryana_url = "https://haryana.gov.in/industries-commerce"
            
            async with self.session.get(haryana_url) as response:
                if response.status == 200:
                    html = await response.text()
                    soup = BeautifulSoup(html, 'html.parser')
                    
                    # Find Haryana specific schemes
                    haryana_schemes = soup.find_all('div', class_=re.compile(r'scheme|policy|yojana'))
                    
                    for scheme_div in haryana_schemes:
                        scheme_data = self._extract_haryana_scheme(scheme_div)
                        if scheme_data:
                            schemes.append(scheme_data)
        
        except Exception as e:
            logger.error(f"Error scraping Haryana schemes: {e}")
        
        return schemes
    
    async def _scrape_scheme_detail(self, url: str, ministry: str) -> Optional[ScrapedScheme]:
        """Scrape detailed scheme information from a specific URL"""
        try:
            async with self.session.get(url) as response:
                if response.status == 200:
                    html = await response.text()
                    soup = BeautifulSoup(html, 'html.parser')
                    
                    # Extract scheme information using LLM
                    scheme_data = await self._extract_with_llm(html, url, ministry)
                    return scheme_data
        
        except Exception as e:
            logger.error(f"Error scraping scheme detail from {url}: {e}")
        
        return None
    
    async def _extract_with_llm(self, html_content: str, url: str, ministry: str) -> Optional[ScrapedScheme]:
        """Use LLM to extract structured data from unstructured HTML"""
        from langchain_groq import ChatGroq
        import os
        
        llm = ChatGroq(model="openai/gpt-oss-120b", api_key=os.getenv("GROQ_API_KEY"))
        
        prompt = f"""
        Extract government scheme information from this HTML content:
        
        URL: {url}
        Ministry: {ministry}
        HTML Content (truncated): {html_content[:5000]}
        
        Extract and return JSON with this exact structure:
        {{
            "scheme_name": "Full scheme name",
            "ministry": "{ministry}",
            "department": "Specific department",
            "description": "Brief description",
            "scheme_type": "subsidy/grant/loan_guarantee/tax_incentive/certification/training",
            "category": "manufacturing/export/technology/green_energy/women_entrepreneurs/sc_st/textile/agriculture",
            "benefits": [
                {{
                    "benefit_type": "direct_subsidy/interest_subvention/credit_guarantee/tax_exemption",
                    "amount": "₹X Lakhs",
                    "description": "Benefit description"
                }}
            ],
            "eligibility": {{
                "business_type": ["proprietorship", "partnership", "pvt_ltd"],
                "industry_sectors": ["manufacturing", "service", "trading"],
                "women_owned": true/false,
                "sc_st_owned": true/false,
                "export_oriented": true/false,
                "manufacturing_unit": true/false,
                "technology_adoption": true/false,
                "startup_recognized": true/false,
                "udyam_registered": true/false,
                "min_turnover": 0,
                "max_turnover": 1000000,
                "min_employees": 1,
                "max_employees": 100,
                "business_age_years": 0,
                "location_requirement": ["haryana", "rural", "urban"],
                "required_documents": ["udyam_certificate", "bank_statement", "project_report"]
            }},
            "application_process": [
                {{
                    "step_number": 1,
                    "step_name": "Registration",
                    "step_description": "Register on portal",
                    "required_documents": ["udyam_certificate"],
                    "processing_time": "7 days",
                    "approval_authority": "District Industries Centre"
                }}
            ],
            "official_website": "https://example.gov.in",
            "guidelines_pdf_url": "https://example.gov.in/guidelines.pdf"
        }}
        
        Return ONLY valid JSON. No markdown formatting or explanations.
        """
        
        try:
            response = await llm.ainvoke(prompt)
            parsed = json.loads(response.content.strip())
            obj = parsed[0] if isinstance(parsed, list) and parsed else parsed
            return ScrapedScheme(
                scheme_name=obj.get('scheme_name', ''),
                ministry=obj.get('ministry', ministry),
                department=obj.get('department', ''),
                description=obj.get('description', ''),
                scheme_type=obj.get('scheme_type', ''),
                category=obj.get('category', ''),
                benefits=obj.get('benefits', []),
                eligibility=obj.get('eligibility', {}),
                application_process=obj.get('application_process', []),
                source_url=url,
                official_website=obj.get('official_website', ''),
                guidelines_pdf_url=obj.get('guidelines_pdf_url'),
                last_updated=datetime.now(),
                data_quality_score=0.8
            )
        except Exception as e:
            logger.warning("LLM extract failed for %s: %s", url, e)
            # Retry with a smaller, simplified prompt focusing on name+description only
            try:
                simple_prompt = f"""
                From the following HTML extract minimal scheme info.
                URL: {url}
                HTML (truncated): {html_content[:3000]}
                Return JSON: {{"scheme_name":"...","description":"...","official_website":""}}
                Only JSON.
                """
                response = await llm.ainvoke(simple_prompt)
                m = json.loads(response.content.strip())
                obj = m[0] if isinstance(m, list) and m else m
                return ScrapedScheme(
                    scheme_name=obj.get('scheme_name',''),
                    ministry=ministry,
                    department='',
                    description=obj.get('description',''),
                    scheme_type='',
                    category='',
                    benefits=[],
                    eligibility={},
                    application_process=[],
                    source_url=url,
                    official_website=obj.get('official_website',''),
                    data_quality_score=0.6
                )
            except Exception as e2:
                logger.error("LLM minimal extract failed for %s: %s", url, e2)
                return None
    
    def _extract_scheme_from_section(self, section, ministry: str) -> Optional[ScrapedScheme]:
        """Extract scheme from a section element"""
        try:
            title = section.find('h3') or section.find('h2') or section.find('h1')
            description = section.find('p') or section.find('div', class_='description')
            
            if title and description:
                return ScrapedScheme(
                    scheme_name=title.get_text().strip(),
                    ministry=ministry,
                    department="",
                    description=description.get_text().strip(),
                    scheme_type="",
                    category="",
                    benefits=[],
                    eligibility={},
                    application_process=[],
                    source_url="",
                    official_website="",
                    data_quality_score=0.6
                )
        except Exception as e:
            logger.error(f"Error extracting scheme from section: {e}")
        
        return None
    
    def _extract_startup_scheme(self, scheme_div) -> Optional[ScrapedScheme]:
        """Extract startup scheme information"""
        try:
            title = scheme_div.find('h3') or scheme_div.find('h2')
            description = scheme_div.find('p')
            
            if title:
                return ScrapedScheme(
                    scheme_name=title.get_text().strip(),
                    ministry="DPIIT",
                    department="Startup India",
                    description=description.get_text().strip() if description else "",
                    scheme_type="grant",
                    category="startup",
                    benefits=[],
                    eligibility={"startup_recognized": True},
                    application_process=[],
                    source_url="",
                    official_website="https://www.startupindia.gov.in/",
                    data_quality_score=0.9
                )
        except Exception as e:
            logger.error(f"Error extracting startup scheme: {e}")
        
        return None
    
    def _extract_haryana_scheme(self, scheme_div) -> Optional[ScrapedScheme]:
        """Extract Haryana state scheme"""
        try:
            title = scheme_div.find('h3') or scheme_div.find('h2')
            description = scheme_div.find('p')
            
            if title:
                return ScrapedScheme(
                    scheme_name=title.get_text().strip(),
                    ministry="Haryana Government",
                    department="Industries & Commerce Department",
                    description=description.get_text().strip() if description else "",
                    scheme_type="subsidy",
                    category="state_scheme",
                    benefits=[],
                    eligibility={"location_requirement": ["haryana"]},
                    application_process=[],
                    source_url="",
                    official_website="https://haryana.gov.in/",
                    data_quality_score=0.8
                )
        except Exception as e:
            logger.error(f"Error extracting Haryana scheme: {e}")
        
        return None
    
    def _extract_from_dataset(self, dataset) -> Optional[ScrapedScheme]:
        """Extract scheme from data.gov.in dataset"""
        try:
            return ScrapedScheme(
                scheme_name=dataset.get('title', ''),
                ministry=dataset.get('organization', {}).get('title', ''),
                department="",
                description=dataset.get('notes', ''),
                scheme_type="",
                category="",
                benefits=[],
                eligibility={},
                application_process=[],
                source_url=dataset.get('url', ''),
                official_website="",
                data_quality_score=0.7
            )
        except Exception as e:
            logger.error(f"Error extracting from dataset: {e}")
            return None
    
    def _deduplicate_schemes(self, schemes: List[ScrapedScheme]) -> List[ScrapedScheme]:
        """Remove duplicate schemes based on name similarity"""
        unique_schemes = []
        seen_names = set()
        
        for scheme in schemes:
            # Create a normalized name for comparison
            normalized_name = re.sub(r'[^\w\s]', '', scheme.scheme_name.lower()).strip()
            
            if normalized_name not in seen_names:
                seen_names.add(normalized_name)
                unique_schemes.append(scheme)
        
        return unique_schemes
    
    # Additional state scrapers (implement as needed)
    async def scrape_maharashtra_schemes(self) -> List[ScrapedScheme]:
        """Scrape Maharashtra state schemes"""
        return []
    
    async def scrape_gujarat_schemes(self) -> List[ScrapedScheme]:
        """Scrape Gujarat state schemes"""
        return []
    
    async def scrape_karnataka_schemes(self) -> List[ScrapedScheme]:
        """Scrape Karnataka state schemes"""
        return []
    
    async def scrape_tamil_nadu_schemes(self) -> List[ScrapedScheme]:
        """Scrape Tamil Nadu state schemes"""
        return []

    async def _crawl_domain_for_schemes(self, base_url: str, html: str, domain: str, max_pages: int = 50) -> List[ScrapedScheme]:
        """Find internal links containing scheme keywords and extract with LLM"""
        schemes: List[ScrapedScheme] = []
        visited: set[str] = set()
        queue: List[str] = []

        def enqueue_links(page_html: str, page_url: str) -> None:
            soup = BeautifulSoup(page_html, 'html.parser')
            for a in soup.find_all('a', href=True):
                text = (a.get_text() or '').lower()
                href = a['href']
                url = urljoin(page_url, href)
                netloc = urlparse(url).netloc
                if not netloc.endswith(domain):
                    continue
                if any(k in (url.lower()+" "+text) for k in ["scheme", "schemes", "yojana", "policy", "incentive", "subsidy", "msme"]):
                    if url not in visited and len(queue) + len(visited) < max_pages:
                        queue.append(url)

        enqueue_links(html, base_url)
        while queue and len(visited) < max_pages:
            url = queue.pop(0)
            if url in visited:
                continue
            visited.add(url)
            try:
                page = await self._fetch_text(url)
                if not page:
                    continue
                scheme = await self._extract_with_llm(page, url, "Haryana")
                if scheme:
                    schemes.append(scheme)
                # discover more links shallowly
                enqueue_links(page, url)
            except Exception as e:
                logger.error(f"crawl extract failed for {url}: {e}")
                continue
        logger.info(f"Crawl {domain}: visited={len(visited)} extracted={len(schemes)}")
        return schemes
