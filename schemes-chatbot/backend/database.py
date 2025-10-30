"""
Database connection and ORM models for Government Schemes Database
"""

import os
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
import asyncpg
import json
from dataclasses import dataclass, asdict
from enum import Enum

logger = logging.getLogger(__name__)

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/schemes_db")
POOL_SIZE = 10
MAX_OVERFLOW = 20

class DatabaseManager:
    def __init__(self):
        self.pool = None
    
    async def initialize(self):
        """Initialize database connection pool"""
        try:
            self.pool = await asyncpg.create_pool(
                DATABASE_URL,
                min_size=5,
                max_size=POOL_SIZE,
                command_timeout=60
            )
            logger.info("Database connection pool initialized")
        except Exception as e:
            logger.error(f"Failed to initialize database pool: {e}")
            raise
    
    async def close(self):
        """Close database connection pool"""
        if self.pool:
            await self.pool.close()
            logger.info("Database connection pool closed")
    
    async def execute_query(self, query: str, *args):
        """Execute a query and return results"""
        async with self.pool.acquire() as conn:
            return await conn.fetch(query, *args)
    
    async def execute_one(self, query: str, *args):
        """Execute a query and return single result"""
        async with self.pool.acquire() as conn:
            return await conn.fetchrow(query, *args)
    
    async def execute_insert(self, query: str, *args):
        """Execute an insert query and return ID"""
        async with self.pool.acquire() as conn:
            return await conn.fetchval(query, *args)

# Global database manager instance
db_manager = DatabaseManager()

@dataclass
class Scheme:
    scheme_id: str
    scheme_name: str
    ministry: Optional[str] = None
    department: Optional[str] = None
    launch_date: Optional[datetime] = None
    last_updated: Optional[datetime] = None
    status: str = "active"
    short_description: Optional[str] = None
    long_description: Optional[str] = None
    objectives: Optional[str] = None
    scheme_type: Optional[str] = None
    category: Optional[str] = None
    budget_allocation: Optional[float] = None
    max_benefit_amount: Optional[float] = None
    benefit_percentage: Optional[float] = None
    coverage_type: Optional[str] = None
    states_covered: Optional[List[str]] = None
    districts_covered: Optional[List[str]] = None
    official_website: Optional[str] = None
    application_portal: Optional[str] = None
    guidelines_pdf_url: Optional[str] = None
    source_url: Optional[str] = None
    last_verified_date: Optional[datetime] = None
    data_quality_score: float = 0.0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

@dataclass
class EligibilityCriteria:
    criteria_id: str
    scheme_id: str
    business_type: Optional[List[str]] = None
    industry_sectors: Optional[List[str]] = None
    min_turnover: Optional[float] = None
    max_turnover: Optional[float] = None
    min_employees: Optional[int] = None
    max_employees: Optional[int] = None
    business_age_years: Optional[int] = None
    location_requirement: Optional[List[str]] = None
    women_owned: bool = False
    sc_st_owned: bool = False
    minority_owned: bool = False
    export_oriented: bool = False
    manufacturing_unit: bool = False
    technology_adoption: bool = False
    startup_recognized: bool = False
    udyam_registered: bool = False
    required_documents: Optional[List[str]] = None
    exclusions: Optional[str] = None
    special_conditions: Optional[str] = None

@dataclass
class Benefit:
    benefit_id: str
    scheme_id: str
    benefit_type: str
    benefit_category: Optional[str] = None
    calculation_method: Optional[str] = None
    fixed_amount: Optional[float] = None
    percentage_value: Optional[float] = None
    max_cap: Optional[float] = None
    min_amount: Optional[float] = None
    tier_1_amount: Optional[float] = None
    tier_1_condition: Optional[str] = None
    tier_2_amount: Optional[float] = None
    tier_2_condition: Optional[str] = None
    tier_3_amount: Optional[float] = None
    tier_3_condition: Optional[str] = None
    disbursement_method: Optional[str] = None
    payment_schedule: Optional[str] = None
    validity_period: Optional[str] = None
    description: Optional[str] = None

class SchemesRepository:
    def __init__(self, db_manager: DatabaseManager):
        self.db = db_manager
    
    async def create_scheme(self, scheme: Scheme) -> str:
        """Create a new scheme"""
        query = """
        INSERT INTO schemes (
            scheme_id, scheme_name, ministry, department, launch_date, last_updated,
            status, short_description, long_description, objectives, scheme_type,
            category, budget_allocation, max_benefit_amount, benefit_percentage,
            coverage_type, states_covered, districts_covered, official_website,
            application_portal, guidelines_pdf_url, source_url, last_verified_date,
            data_quality_score
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
            $17, $18, $19, $20, $21, $22, $23, $24
        ) RETURNING scheme_id
        """
        
        return await self.db.execute_insert(
            query,
            scheme.scheme_id, scheme.scheme_name, scheme.ministry, scheme.department,
            scheme.launch_date, scheme.last_updated, scheme.status, scheme.short_description,
            scheme.long_description, scheme.objectives, scheme.scheme_type, scheme.category,
            scheme.budget_allocation, scheme.max_benefit_amount, scheme.benefit_percentage,
            scheme.coverage_type, json.dumps(scheme.states_covered) if scheme.states_covered else None,
            json.dumps(scheme.districts_covered) if scheme.districts_covered else None,
            scheme.official_website, scheme.application_portal, scheme.guidelines_pdf_url,
            scheme.source_url, scheme.last_verified_date, scheme.data_quality_score
        )
    
    async def get_scheme_by_id(self, scheme_id: str) -> Optional[Scheme]:
        """Get scheme by ID"""
        query = """
        SELECT * FROM schemes WHERE scheme_id = $1
        """
        row = await self.db.execute_one(query, scheme_id)
        if row:
            return self._row_to_scheme(row)
        return None
    
    async def search_schemes(self, 
                           state: Optional[str] = None,
                           category: Optional[str] = None,
                           scheme_type: Optional[str] = None,
                           women_owned: Optional[bool] = None,
                           sc_st_owned: Optional[bool] = None,
                           export_oriented: Optional[bool] = None,
                           manufacturing_unit: Optional[bool] = None,
                           limit: int = 50) -> List[Scheme]:
        """Search schemes with filters"""
        
        conditions = ["s.status = 'active'"]
        params = []
        param_count = 0
        
        if state:
            param_count += 1
            conditions.append(f"s.states_covered @> ${param_count}")
            params.append(json.dumps([state]))
        
        if category:
            param_count += 1
            conditions.append(f"s.category = ${param_count}")
            params.append(category)
        
        if scheme_type:
            param_count += 1
            conditions.append(f"s.scheme_type = ${param_count}")
            params.append(scheme_type)
        
        # Join with eligibility criteria for advanced filters
        if any([women_owned, sc_st_owned, export_oriented, manufacturing_unit]):
            join_clause = "LEFT JOIN eligibility_criteria ec ON s.scheme_id = ec.scheme_id"
            
            if women_owned is not None:
                param_count += 1
                conditions.append(f"ec.women_owned = ${param_count}")
                params.append(women_owned)
            
            if sc_st_owned is not None:
                param_count += 1
                conditions.append(f"ec.sc_st_owned = ${param_count}")
                params.append(sc_st_owned)
            
            if export_oriented is not None:
                param_count += 1
                conditions.append(f"ec.export_oriented = ${param_count}")
                params.append(export_oriented)
            
            if manufacturing_unit is not None:
                param_count += 1
                conditions.append(f"ec.manufacturing_unit = ${param_count}")
                params.append(manufacturing_unit)
        else:
            join_clause = ""
        
        param_count += 1
        params.append(limit)
        
        query = f"""
        SELECT DISTINCT s.* FROM schemes s {join_clause}
        WHERE {' AND '.join(conditions)}
        ORDER BY s.data_quality_score DESC, s.last_updated DESC
        LIMIT ${param_count}
        """
        
        rows = await self.db.execute_query(query, *params)
        return [self._row_to_scheme(row) for row in rows]
    
    async def get_scheme_with_details(self, scheme_id: str) -> Dict[str, Any]:
        """Get scheme with all related details"""
        # Get scheme
        scheme = await self.get_scheme_by_id(scheme_id)
        if not scheme:
            return None
        
        # Get eligibility criteria
        eligibility_query = """
        SELECT * FROM eligibility_criteria WHERE scheme_id = $1
        """
        eligibility_row = await self.db.execute_one(eligibility_query, scheme_id)
        
        # Get benefits
        benefits_query = """
        SELECT * FROM benefits WHERE scheme_id = $1 ORDER BY benefit_id
        """
        benefits_rows = await self.db.execute_query(benefits_query, scheme_id)
        
        # Get application process
        process_query = """
        SELECT * FROM application_process WHERE scheme_id = $1 ORDER BY step_number
        """
        process_rows = await self.db.execute_query(process_query, scheme_id)
        
        return {
            "scheme": asdict(scheme),
            "eligibility": self._row_to_eligibility(eligibility_row) if eligibility_row else None,
            "benefits": [self._row_to_benefit(row) for row in benefits_rows],
            "application_process": [dict(row) for row in process_rows]
        }
    
    def _row_to_scheme(self, row) -> Scheme:
        """Convert database row to Scheme object"""
        return Scheme(
            scheme_id=row['scheme_id'],
            scheme_name=row['scheme_name'],
            ministry=row['ministry'],
            department=row['department'],
            launch_date=row['launch_date'],
            last_updated=row['last_updated'],
            status=row['status'],
            short_description=row['short_description'],
            long_description=row['long_description'],
            objectives=row['objectives'],
            scheme_type=row['scheme_type'],
            category=row['category'],
            budget_allocation=row['budget_allocation'],
            max_benefit_amount=row['max_benefit_amount'],
            benefit_percentage=row['benefit_percentage'],
            coverage_type=row['coverage_type'],
            states_covered=json.loads(row['states_covered']) if row['states_covered'] else None,
            districts_covered=json.loads(row['districts_covered']) if row['districts_covered'] else None,
            official_website=row['official_website'],
            application_portal=row['application_portal'],
            guidelines_pdf_url=row['guidelines_pdf_url'],
            source_url=row['source_url'],
            last_verified_date=row['last_verified_date'],
            data_quality_score=row['data_quality_score'],
            created_at=row['created_at'],
            updated_at=row['updated_at']
        )
    
    def _row_to_eligibility(self, row) -> EligibilityCriteria:
        """Convert database row to EligibilityCriteria object"""
        if not row:
            return None
        
        return EligibilityCriteria(
            criteria_id=row['criteria_id'],
            scheme_id=row['scheme_id'],
            business_type=json.loads(row['business_type']) if row['business_type'] else None,
            industry_sectors=json.loads(row['industry_sectors']) if row['industry_sectors'] else None,
            min_turnover=row['min_turnover'],
            max_turnover=row['max_turnover'],
            min_employees=row['min_employees'],
            max_employees=row['max_employees'],
            business_age_years=row['business_age_years'],
            location_requirement=json.loads(row['location_requirement']) if row['location_requirement'] else None,
            women_owned=row['women_owned'],
            sc_st_owned=row['sc_st_owned'],
            minority_owned=row['minority_owned'],
            export_oriented=row['export_oriented'],
            manufacturing_unit=row['manufacturing_unit'],
            technology_adoption=row['technology_adoption'],
            startup_recognized=row['startup_recognized'],
            udyam_registered=row['udyam_registered'],
            required_documents=json.loads(row['required_documents']) if row['required_documents'] else None,
            exclusions=row['exclusions'],
            special_conditions=row['special_conditions']
        )
    
    def _row_to_benefit(self, row) -> Benefit:
        """Convert database row to Benefit object"""
        return Benefit(
            benefit_id=row['benefit_id'],
            scheme_id=row['scheme_id'],
            benefit_type=row['benefit_type'],
            benefit_category=row['benefit_category'],
            calculation_method=row['calculation_method'],
            fixed_amount=row['fixed_amount'],
            percentage_value=row['percentage_value'],
            max_cap=row['max_cap'],
            min_amount=row['min_amount'],
            tier_1_amount=row['tier_1_amount'],
            tier_1_condition=row['tier_1_condition'],
            tier_2_amount=row['tier_2_amount'],
            tier_2_condition=row['tier_2_condition'],
            tier_3_amount=row['tier_3_amount'],
            tier_3_condition=row['tier_3_condition'],
            disbursement_method=row['disbursement_method'],
            payment_schedule=row['payment_schedule'],
            validity_period=row['validity_period'],
            description=row['description']
        )
