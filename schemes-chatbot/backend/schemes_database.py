"""
Comprehensive Schemes Database with Structured Eligibility Rules
Built from the 100+ schemes data provided
"""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from enum import Enum

class SchemeLevel(Enum):
    NATIONAL = "National"
    STATE = "State"

class SchemeCategory(Enum):
    FINANCE_CREDIT = "Finance & Credit"
    TECHNOLOGY = "Technology & Competitiveness"
    MARKETING = "Marketing & Procurement"
    INFRASTRUCTURE = "Infrastructure & Clusters"
    WOMEN_SCST = "Women & SC/ST Focused"
    TEXTILE = "Textile & Manufacturing"
    STARTUP = "Startup & Innovation"

@dataclass
class EligibilityRule:
    field: str
    operator: str  # "equals", "contains", "greater_than", "less_than", "in", "not_in"
    value: Any
    weight: float = 1.0
    description: str = ""

@dataclass
class Scheme:
    id: str
    name: str
    description: str
    level: SchemeLevel
    category: SchemeCategory
    benefit_amount: str
    benefit_type: str  # "Direct Incentive", "Interest Subsidy", "Loan Guarantee", "Tax Benefit"
    target_group: str
    eligibility_rules: List[EligibilityRule]
    nodal_agency: str
    state_specific: Optional[str] = None
    priority_score: float = 0.0

class SchemesDatabase:
    def __init__(self):
        self.schemes = self._load_schemes()
        self._build_indexes()
    
    def _load_schemes(self) -> List[Scheme]:
        """Load comprehensive schemes database"""
        return [
            # CENTRAL SCHEMES - FINANCE & CREDIT
            Scheme(
                id="pmmu_001",
                name="Pradhan Mantri Mudra Yojana (PMMY)",
                description="Collateral-free loans for income-generating micro-enterprises",
                level=SchemeLevel.NATIONAL,
                category=SchemeCategory.FINANCE_CREDIT,
                benefit_amount="₹10 Lakh",
                benefit_type="Loan Guarantee",
                target_group="Non-Corporate, Non-Farm Micro Enterprises",
                eligibility_rules=[
                    EligibilityRule("msme_registered", "equals", True, 1.0, "Must be Udyam registered"),
                    EligibilityRule("company_type", "in", ["micro", "small"], 1.0, "Micro or Small enterprise"),
                    EligibilityRule("collateral_available", "equals", False, 0.8, "No formal collateral required")
                ],
                nodal_agency="Banks/NBFCs/MFIs"
            ),
            
            Scheme(
                id="cgtmse_002",
                name="Credit Guarantee Scheme for MSEs (CGTMSE)",
                description="Provides collateral-free credit guarantee to banks against loans extended to MSEs",
                level=SchemeLevel.NATIONAL,
                category=SchemeCategory.FINANCE_CREDIT,
                benefit_amount="₹5 Crore",
                benefit_type="Loan Guarantee",
                target_group="New & Existing Micro & Small Enterprises (MSEs)",
                eligibility_rules=[
                    EligibilityRule("msme_registered", "equals", True, 1.0, "Udyam registered"),
                    EligibilityRule("company_type", "in", ["micro", "small"], 1.0, "Micro or Small enterprise"),
                    EligibilityRule("loan_purpose", "in", ["term_loan", "working_capital"], 0.9, "Term Loans & Working Capital")
                ],
                nodal_agency="CGTMSE/SIDBI"
            ),
            
            Scheme(
                id="interest_sub_003",
                name="2% Interest Subvention Scheme",
                description="Interest relief on fresh or incremental working capital/term loans",
                level=SchemeLevel.NATIONAL,
                category=SchemeCategory.FINANCE_CREDIT,
                benefit_amount="₹1 Crore",
                benefit_type="Interest Subsidy",
                target_group="Manufacturing & Service MSMEs",
                eligibility_rules=[
                    EligibilityRule("msme_registered", "equals", True, 1.0, "Must have Udyam Registration"),
                    EligibilityRule("company_type", "in", ["micro", "small", "medium"], 1.0, "Manufacturing & Service MSMEs"),
                    EligibilityRule("other_interest_subsidies", "equals", False, 0.8, "Excludes those availing other interest subsidies")
                ],
                nodal_agency="SIDBI/Banks"
            ),
            
            Scheme(
                id="stand_up_india_004",
                name="Stand Up India Scheme",
                description="Promotes entrepreneurship by facilitating composite loans for greenfield projects",
                level=SchemeLevel.NATIONAL,
                category=SchemeCategory.WOMEN_SCST,
                benefit_amount="₹1 Crore",
                benefit_type="Loan Guarantee",
                target_group="Women and SC/ST Entrepreneurs (51% stake)",
                eligibility_rules=[
                    EligibilityRule("women_directors_equity", "greater_than", 0.5, 1.0, "Women entrepreneurs with 51% stake"),
                    EligibilityRule("sc_st_entrepreneur", "equals", True, 1.0, "SC/ST entrepreneurs with 51% stake"),
                    EligibilityRule("project_type", "equals", "greenfield", 1.0, "Must be a greenfield project"),
                    EligibilityRule("bank_default", "equals", False, 0.9, "Applicant not in default to any bank")
                ],
                nodal_agency="SIDBI/Scheduled Commercial Banks"
            ),
            
            Scheme(
                id="pmegp_005",
                name="Prime Minister's Employment Generation Programme (PMEGP)",
                description="Credit-linked subsidy for setting up new micro-enterprises",
                level=SchemeLevel.NATIONAL,
                category=SchemeCategory.FINANCE_CREDIT,
                benefit_amount="35% of project cost",
                benefit_type="Direct Incentive",
                target_group="New Entrepreneurs, Unemployed Youth, SHGs",
                eligibility_rules=[
                    EligibilityRule("project_type", "equals", "new", 1.0, "New micro-enterprises"),
                    EligibilityRule("education_level", "greater_than", 7, 0.8, "8th pass for projects >₹5 Lakh (Service) / >₹10 Lakh (Mfg)"),
                    EligibilityRule("women_directors_equity", "greater_than", 0.5, 1.2, "Higher subsidy for women entrepreneurs"),
                    EligibilityRule("sc_st_entrepreneur", "equals", True, 1.2, "Higher subsidy for SC/ST entrepreneurs")
                ],
                nodal_agency="KVIC/State KVIC/DIC"
            ),
            
            # HARYANA STATE SCHEMES
            Scheme(
                id="haryana_sgst_029",
                name="Investment Subsidy on Net SGST (D Block, MSME)",
                description="Reimbursement of State GST to attract investment in backward areas",
                level=SchemeLevel.STATE,
                category=SchemeCategory.FINANCE_CREDIT,
                benefit_amount="150% of FCI",
                benefit_type="Tax Benefit",
                target_group="MSMEs in 'D' Category Blocks",
                eligibility_rules=[
                    EligibilityRule("company_state", "equals", "haryana", 1.0, "Must be in Haryana"),
                    EligibilityRule("block_category", "equals", "D", 1.0, "Must be in D Category Block"),
                    EligibilityRule("project_type", "in", ["new", "expansion"], 1.0, "New/Expanding Unit"),
                    EligibilityRule("msme_registered", "equals", True, 1.0, "Udyam/HUM required")
                ],
                nodal_agency="Industries & Commerce Dept.",
                state_specific="Haryana"
            ),
            
            Scheme(
                id="haryana_women_sgst_031",
                name="Investment Subsidy on Net SGST (Woman/SC/ST Micro Ent. in B, C, D Block)",
                description="Enhanced SGST reimbursement for disadvantaged groups",
                level=SchemeLevel.STATE,
                category=SchemeCategory.WOMEN_SCST,
                benefit_amount="150% of FCI",
                benefit_type="Tax Benefit",
                target_group="Micro Enterprises led by Women/SC/ST",
                eligibility_rules=[
                    EligibilityRule("company_state", "equals", "haryana", 1.0, "Must be in Haryana"),
                    EligibilityRule("company_type", "equals", "micro", 1.0, "Micro Enterprises only"),
                    EligibilityRule("women_directors_equity", "greater_than", 0.5, 1.0, "Women-led enterprise"),
                    EligibilityRule("sc_st_entrepreneur", "equals", True, 1.0, "SC/ST entrepreneur"),
                    EligibilityRule("block_category", "in", ["B", "C", "D"], 1.0, "B, C, or D Category Block")
                ],
                nodal_agency="Industries & Commerce Dept.",
                state_specific="Haryana"
            ),
            
            Scheme(
                id="haryana_hguyv_045",
                name="Haryana Gramin Udyogik Vikas Yojana (HGUVY) - Capital Subsidy",
                description="Capital support for new Micro Enterprises in rural areas",
                level=SchemeLevel.STATE,
                category=SchemeCategory.FINANCE_CREDIT,
                benefit_amount="₹25 Lakh",
                benefit_type="Direct Incentive",
                target_group="New Micro Enterprises in Rural Areas",
                eligibility_rules=[
                    EligibilityRule("company_state", "equals", "haryana", 1.0, "Must be in Haryana"),
                    EligibilityRule("company_type", "equals", "micro", 1.0, "Micro Enterprises only"),
                    EligibilityRule("location_type", "equals", "rural", 1.0, "Rural areas"),
                    EligibilityRule("block_category", "in", ["B", "C", "D"], 1.0, "B, C, or D blocks"),
                    EligibilityRule("women_directors_equity", "greater_than", 0.5, 1.2, "Higher subsidy for women"),
                    EligibilityRule("sc_st_entrepreneur", "equals", True, 1.2, "Higher subsidy for SC/ST")
                ],
                nodal_agency="Industries & Commerce Dept.",
                state_specific="Haryana"
            ),
            
            # TECHNOLOGY & COMPETITIVENESS
            Scheme(
                id="clcss_010",
                name="Credit Linked Capital Subsidy Scheme (CLCSS)",
                description="Capital subsidy on loans for technology modernization",
                level=SchemeLevel.NATIONAL,
                category=SchemeCategory.TECHNOLOGY,
                benefit_amount="₹15 Lakh",
                benefit_type="Direct Incentive",
                target_group="Micro & Small Enterprises (MSEs)",
                eligibility_rules=[
                    EligibilityRule("company_type", "in", ["micro", "small"], 1.0, "Micro & Small Enterprises"),
                    EligibilityRule("technology_upgradation", "equals", True, 1.0, "Loan must be for technology modernization"),
                    EligibilityRule("approved_technology", "equals", True, 0.9, "Approved and proven technology")
                ],
                nodal_agency="DC-MSME/SIDBI"
            ),
            
            Scheme(
                id="zed_gold_011",
                name="MSME-Sustainable (ZED) Certification - Gold",
                description="Certification to promote Zero Defect, Zero Effect practices (Highest Level)",
                level=SchemeLevel.NATIONAL,
                category=SchemeCategory.TECHNOLOGY,
                benefit_amount="50% of certification cost",
                benefit_type="Direct Incentive",
                target_group="MSMEs",
                eligibility_rules=[
                    EligibilityRule("msme_registered", "equals", True, 1.0, "Udyam registration required"),
                    EligibilityRule("zed_level", "equals", "gold", 1.0, "Must pass Gold-level criteria"),
                    EligibilityRule("women_directors_equity", "greater_than", 0.5, 1.1, "Additional 10% for Women"),
                    EligibilityRule("sc_st_entrepreneur", "equals", True, 1.1, "Additional 10% for SC/ST/NER")
                ],
                nodal_agency="QCI/DC-MSME"
            ),
            
            # STARTUP SCHEMES
            Scheme(
                id="startup_india_009",
                name="Startup India Seed Fund Scheme (SISFS)",
                description="Provides early-stage financial assistance to innovative startups",
                level=SchemeLevel.NATIONAL,
                category=SchemeCategory.STARTUP,
                benefit_amount="₹50 Lakh",
                benefit_type="Direct Incentive",
                target_group="DPIIT-Recognized Startups",
                eligibility_rules=[
                    EligibilityRule("startup_status", "equals", True, 1.0, "DPIIT-Recognized Startups"),
                    EligibilityRule("company_age", "less_than", 2, 1.0, "Incorporated less than 2 years ago"),
                    EligibilityRule("previous_funding", "less_than", 100000, 0.9, "Should not have received >₹10 Lakh from other schemes")
                ],
                nodal_agency="DPIIT/Approved Incubators"
            )
        ]
    
    def _build_indexes(self):
        """Build indexes for fast lookup"""
        self.by_state = {}
        self.by_category = {}
        self.by_company_type = {}
        
        for scheme in self.schemes:
            # State index
            if scheme.state_specific:
                if scheme.state_specific not in self.by_state:
                    self.by_state[scheme.state_specific] = []
                self.by_state[scheme.state_specific].append(scheme)
            
            # Category index
            if scheme.category not in self.by_category:
                self.by_category[scheme.category] = []
            self.by_category[scheme.category].append(scheme)
    
    def get_schemes_by_state(self, state: str) -> List[Scheme]:
        """Get all schemes for a specific state"""
        return self.by_state.get(state, [])
    
    def get_schemes_by_category(self, category: SchemeCategory) -> List[Scheme]:
        """Get all schemes for a specific category"""
        return self.by_category.get(category, [])
    
    def get_all_schemes(self) -> List[Scheme]:
        """Get all schemes"""
        return self.schemes
