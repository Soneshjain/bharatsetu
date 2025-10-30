"""
Intelligent Eligibility Matching Engine
Combines rule-based matching with weighted scoring for accurate scheme recommendations
"""

from typing import Dict, List, Any, Tuple
from dataclasses import dataclass
from schemes_database import SchemesDatabase, Scheme, EligibilityRule
import logging

logger = logging.getLogger(__name__)

@dataclass
class EligibilityMatch:
    scheme: Scheme
    score: float
    matched_rules: List[EligibilityRule]
    unmatched_rules: List[EligibilityRule]
    confidence: float
    reasons: List[str]

class EligibilityEngine:
    def __init__(self):
        self.schemes_db = SchemesDatabase()
        self.match_threshold = 0.6  # Minimum score to consider a scheme eligible
    
    def evaluate_eligibility(self, business_profile: Dict[str, Any]) -> List[EligibilityMatch]:
        """
        Evaluate business profile against all schemes and return ranked matches
        """
        matches = []
        
        for scheme in self.schemes_db.get_all_schemes():
            match = self._evaluate_scheme_eligibility(scheme, business_profile)
            if match.score >= self.match_threshold:
                matches.append(match)
        
        # Sort by score (highest first)
        matches.sort(key=lambda x: x.score, reverse=True)
        
        # Limit to top 10 matches
        return matches[:10]
    
    def _evaluate_scheme_eligibility(self, scheme: Scheme, business_profile: Dict[str, Any]) -> EligibilityMatch:
        """
        Evaluate a single scheme against business profile
        """
        matched_rules = []
        unmatched_rules = []
        total_weight = 0
        matched_weight = 0
        reasons = []
        
        for rule in scheme.eligibility_rules:
            total_weight += rule.weight
            
            if self._evaluate_rule(rule, business_profile):
                matched_rules.append(rule)
                matched_weight += rule.weight
                reasons.append(f"✓ {rule.description}")
            else:
                unmatched_rules.append(rule)
                reasons.append(f"✗ {rule.description}")
        
        # Calculate score (0-1)
        score = matched_weight / total_weight if total_weight > 0 else 0
        
        # Calculate confidence based on number of matched rules
        confidence = len(matched_rules) / len(scheme.eligibility_rules) if scheme.eligibility_rules else 0
        
        # Apply bonus for state-specific schemes
        if scheme.state_specific and business_profile.get('company_state', '').lower() == scheme.state_specific.lower():
            score += 0.1
            reasons.append(f"✓ State-specific scheme for {scheme.state_specific}")
        
        # Apply bonus for women/SC/ST schemes
        if scheme.category.value == "Women & SC/ST Focused":
            if business_profile.get('women_directors_equity') == 'yes':
                score += 0.15
                reasons.append("✓ Women entrepreneur bonus")
            if business_profile.get('sc_st_entrepreneur') == 'yes':
                score += 0.15
                reasons.append("✓ SC/ST entrepreneur bonus")
        
        # Cap score at 1.0
        score = min(score, 1.0)
        
        return EligibilityMatch(
            scheme=scheme,
            score=score,
            matched_rules=matched_rules,
            unmatched_rules=unmatched_rules,
            confidence=confidence,
            reasons=reasons
        )
    
    def _evaluate_rule(self, rule: EligibilityRule, business_profile: Dict[str, Any]) -> bool:
        """
        Evaluate a single eligibility rule against business profile
        """
        field_value = business_profile.get(rule.field)
        
        if field_value is None:
            return False
        
        try:
            if rule.operator == "equals":
                return str(field_value).lower() == str(rule.value).lower()
            elif rule.operator == "contains":
                return str(rule.value).lower() in str(field_value).lower()
            elif rule.operator == "greater_than":
                return float(field_value) > float(rule.value)
            elif rule.operator == "less_than":
                return float(field_value) < float(rule.value)
            elif rule.operator == "in":
                return str(field_value).lower() in [str(v).lower() for v in rule.value]
            elif rule.operator == "not_in":
                return str(field_value).lower() not in [str(v).lower() for v in rule.value]
            else:
                logger.warning(f"Unknown operator: {rule.operator}")
                return False
        except (ValueError, TypeError) as e:
            logger.warning(f"Error evaluating rule {rule.field}: {e}")
            return False
    
    def get_benefit_breakdown(self, matches: List[EligibilityMatch]) -> Dict[str, str]:
        """
        Calculate benefit breakdown by category
        """
        breakdown = {
            "direct_incentives": 0,
            "interest_subsidies": 0,
            "loan_guarantees": 0,
            "tax_benefits": 0
        }
        
        for match in matches:
            if match.scheme.benefit_type == "Direct Incentive":
                breakdown["direct_incentives"] += 1
            elif match.scheme.benefit_type == "Interest Subsidy":
                breakdown["interest_subsidies"] += 1
            elif match.scheme.benefit_type == "Loan Guarantee":
                breakdown["loan_guarantees"] += 1
            elif match.scheme.benefit_type == "Tax Benefit":
                breakdown["tax_benefits"] += 1
        
        # Convert to formatted strings
        return {
            "direct_incentives": f"₹{breakdown['direct_incentives'] * 5} Lakhs",
            "interest_subsidies": f"₹{breakdown['interest_subsidies'] * 3} Lakhs",
            "loan_guarantees": f"₹{breakdown['loan_guarantees'] * 10} Lakhs"
        }
    
    def get_total_estimated_benefits(self, matches: List[EligibilityMatch]) -> str:
        """
        Calculate total estimated benefits
        """
        total_schemes = len(matches)
        if total_schemes == 0:
            return "₹0 Lakhs"
        
        # Rough estimation based on number of schemes and types
        estimated_benefits = total_schemes * 15  # Average ₹15 Lakhs per scheme
        return f"₹{estimated_benefits} Lakhs"
    
    def get_recommended_actions(self, matches: List[EligibilityMatch]) -> List[str]:
        """
        Generate recommended actions based on matched schemes
        """
        actions = []
        
        if not matches:
            return ["Complete MSME registration", "Contact local DIC for guidance"]
        
        # Check for common requirements
        msme_registration_needed = any(
            rule.field == "msme_registered" and rule.value == True 
            for match in matches 
            for rule in match.scheme.eligibility_rules
        )
        
        if msme_registration_needed:
            actions.append("Complete Udyam registration if not already done")
        
        # State-specific actions
        haryana_schemes = [m for m in matches if m.scheme.state_specific == "Haryana"]
        if haryana_schemes:
            actions.append("Contact Haryana Industries & Commerce Department")
        
        # Women/SC/ST specific actions
        women_schemes = [m for m in matches if "Women" in m.scheme.name or "women" in m.scheme.description.lower()]
        if women_schemes:
            actions.append("Prepare women entrepreneur documentation")
        
        # Technology schemes
        tech_schemes = [m for m in matches if m.scheme.category.value == "Technology & Competitiveness"]
        if tech_schemes:
            actions.append("Prepare technology upgradation project report")
        
        # Startup schemes
        startup_schemes = [m for m in matches if m.scheme.category.value == "Startup & Innovation"]
        if startup_schemes:
            actions.append("Get DPIIT startup recognition")
        
        # Default actions
        if not actions:
            actions = [
                "Review scheme eligibility criteria",
                "Prepare required documentation",
                "Contact nodal agencies for application process"
            ]
        
        return actions[:5]  # Limit to 5 actions
