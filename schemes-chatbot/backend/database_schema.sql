-- Comprehensive Government Schemes Database Schema
-- Proprietary database for BharatSetu platform

-- Core Schemes Table
CREATE TABLE schemes (
    scheme_id VARCHAR(50) PRIMARY KEY,
    scheme_name VARCHAR(500) NOT NULL,
    ministry VARCHAR(200),
    department VARCHAR(200),
    launch_date DATE,
    last_updated DATE,
    status VARCHAR(20) DEFAULT 'active', -- active, closed, upcoming
    
    -- Descriptive Information
    short_description TEXT,
    long_description TEXT,
    objectives TEXT,
    
    -- Classification
    scheme_type VARCHAR(50), -- subsidy, grant, loan_guarantee, tax_incentive, certification, training
    category VARCHAR(100), -- manufacturing, export, technology, green_energy, women_entrepreneurs, sc_st, textile, agriculture
    
    -- Financial Details
    budget_allocation DECIMAL(15,2),
    max_benefit_amount DECIMAL(15,2),
    benefit_percentage DECIMAL(5,2),
    
    -- Geographic Coverage
    coverage_type VARCHAR(20), -- national, state, district
    states_covered JSONB, -- array of state codes
    districts_covered JSONB,
    
    -- Official Links
    official_website VARCHAR(500),
    application_portal VARCHAR(500),
    guidelines_pdf_url VARCHAR(500),
    
    -- Metadata
    source_url VARCHAR(500),
    last_verified_date DATE,
    data_quality_score DECIMAL(3,2) DEFAULT 0.0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(scheme_name, ministry)
);

-- Eligibility Criteria Table
CREATE TABLE eligibility_criteria (
    criteria_id VARCHAR(50) PRIMARY KEY,
    scheme_id VARCHAR(50) REFERENCES schemes(scheme_id) ON DELETE CASCADE,
    
    -- Business Criteria
    business_type JSONB, -- ["proprietorship", "partnership", "pvt_ltd", "llp", "public_ltd"]
    industry_sectors JSONB, -- MSME classification codes, specific industries
    min_turnover DECIMAL(15,2),
    max_turnover DECIMAL(15,2),
    min_employees INTEGER,
    max_employees INTEGER,
    business_age_years INTEGER,
    
    -- Geographic Criteria
    location_requirement JSONB, -- states, districts, SEZ, industrial_areas, rural_urban
    
    -- Specific Requirements
    women_owned BOOLEAN DEFAULT FALSE,
    sc_st_owned BOOLEAN DEFAULT FALSE,
    minority_owned BOOLEAN DEFAULT FALSE,
    export_oriented BOOLEAN DEFAULT FALSE,
    manufacturing_unit BOOLEAN DEFAULT FALSE,
    technology_adoption BOOLEAN DEFAULT FALSE,
    startup_recognized BOOLEAN DEFAULT FALSE,
    udyam_registered BOOLEAN DEFAULT FALSE,
    
    -- Documentation Required
    required_documents JSONB,
    
    -- Special Conditions
    exclusions TEXT,
    special_conditions TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(scheme_id)
);

-- Benefits Table
CREATE TABLE benefits (
    benefit_id VARCHAR(50) PRIMARY KEY,
    scheme_id VARCHAR(50) REFERENCES schemes(scheme_id) ON DELETE CASCADE,
    
    benefit_type VARCHAR(50), -- direct_subsidy, interest_subvention, credit_guarantee, tax_exemption, reimbursement, training, certification
    benefit_category VARCHAR(100), -- capital_subsidy, working_capital, technology_upgradation, export_promotion, quality_certification
    
    -- Financial Details
    calculation_method VARCHAR(20), -- fixed_amount, percentage, tiered, slab_based
    fixed_amount DECIMAL(15,2),
    percentage_value DECIMAL(5,2),
    max_cap DECIMAL(15,2),
    min_amount DECIMAL(15,2),
    
    -- Tier-based benefits
    tier_1_amount DECIMAL(15,2),
    tier_1_condition VARCHAR(200),
    tier_2_amount DECIMAL(15,2),
    tier_2_condition VARCHAR(200),
    tier_3_amount DECIMAL(15,2),
    tier_3_condition VARCHAR(200),
    
    -- Conditions
    disbursement_method VARCHAR(100), -- upfront, reimbursement, installment
    payment_schedule VARCHAR(100),
    validity_period VARCHAR(100),
    
    description TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Application Process Table
CREATE TABLE application_process (
    process_id VARCHAR(50) PRIMARY KEY,
    scheme_id VARCHAR(50) REFERENCES schemes(scheme_id) ON DELETE CASCADE,
    
    step_number INTEGER,
    step_name VARCHAR(200),
    step_description TEXT,
    
    required_documents JSONB,
    forms_required JSONB,
    
    processing_time VARCHAR(100),
    approval_authority VARCHAR(200),
    
    online_portal_url VARCHAR(500),
    offline_process TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(scheme_id, step_number)
);

-- Scheme Updates Table
CREATE TABLE scheme_updates (
    update_id VARCHAR(50) PRIMARY KEY,
    scheme_id VARCHAR(50) REFERENCES schemes(scheme_id) ON DELETE CASCADE,
    update_date TIMESTAMP,
    update_type VARCHAR(50), -- amendment, extension, closure, new_guidelines
    update_description TEXT,
    source_url VARCHAR(500),
    verified BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Nodal Agencies Table
CREATE TABLE nodal_agencies (
    agency_id VARCHAR(50) PRIMARY KEY,
    agency_name VARCHAR(200) NOT NULL,
    ministry VARCHAR(200),
    department VARCHAR(200),
    contact_person VARCHAR(200),
    email VARCHAR(200),
    phone VARCHAR(20),
    address TEXT,
    website VARCHAR(500),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scheme-Agency Mapping
CREATE TABLE scheme_agencies (
    mapping_id VARCHAR(50) PRIMARY KEY,
    scheme_id VARCHAR(50) REFERENCES schemes(scheme_id) ON DELETE CASCADE,
    agency_id VARCHAR(50) REFERENCES nodal_agencies(agency_id) ON DELETE CASCADE,
    role VARCHAR(100), -- implementing, monitoring, disbursing, approving
    
    UNIQUE(scheme_id, agency_id, role)
);

-- Data Sources Table
CREATE TABLE data_sources (
    source_id VARCHAR(50) PRIMARY KEY,
    source_name VARCHAR(200) NOT NULL,
    source_type VARCHAR(50), -- official_portal, news_article, press_release, api
    base_url VARCHAR(500),
    last_scraped TIMESTAMP,
    reliability_score DECIMAL(3,2) DEFAULT 0.0,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scraping Logs Table
CREATE TABLE scraping_logs (
    log_id VARCHAR(50) PRIMARY KEY,
    source_id VARCHAR(50) REFERENCES data_sources(source_id),
    scheme_id VARCHAR(50) REFERENCES schemes(scheme_id),
    scraping_date TIMESTAMP,
    status VARCHAR(20), -- success, failed, partial
    records_added INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX idx_scheme_status ON schemes(status);
CREATE INDEX idx_scheme_type ON schemes(scheme_type);
CREATE INDEX idx_category ON schemes(category);
CREATE INDEX idx_ministry ON schemes(ministry);
CREATE INDEX idx_coverage_type ON schemes(coverage_type);
CREATE INDEX idx_states_covered ON schemes USING GIN(states_covered);
CREATE INDEX idx_launch_date ON schemes(launch_date);
CREATE INDEX idx_last_updated ON schemes(last_updated);

CREATE INDEX idx_eligibility_business_type ON eligibility_criteria USING GIN(business_type);
CREATE INDEX idx_eligibility_industry ON eligibility_criteria USING GIN(industry_sectors);
CREATE INDEX idx_eligibility_women_owned ON eligibility_criteria(women_owned);
CREATE INDEX idx_eligibility_sc_st ON eligibility_criteria(sc_st_owned);
CREATE INDEX idx_eligibility_export ON eligibility_criteria(export_oriented);
CREATE INDEX idx_eligibility_manufacturing ON eligibility_criteria(manufacturing_unit);

CREATE INDEX idx_benefits_type ON benefits(benefit_type);
CREATE INDEX idx_benefits_category ON benefits(benefit_category);

CREATE INDEX idx_scraping_date ON scraping_logs(scraping_date);
CREATE INDEX idx_scraping_status ON scraping_logs(status);

-- Views for Common Queries
CREATE VIEW active_schemes AS
SELECT 
    s.*,
    ec.business_type,
    ec.industry_sectors,
    ec.women_owned,
    ec.sc_st_owned,
    ec.export_oriented,
    ec.manufacturing_unit
FROM schemes s
LEFT JOIN eligibility_criteria ec ON s.scheme_id = ec.scheme_id
WHERE s.status = 'active';

CREATE VIEW scheme_benefits_summary AS
SELECT 
    s.scheme_id,
    s.scheme_name,
    s.scheme_type,
    s.category,
    COUNT(b.benefit_id) as benefit_count,
    MAX(b.max_cap) as max_benefit,
    STRING_AGG(b.benefit_type, ', ') as benefit_types
FROM schemes s
LEFT JOIN benefits b ON s.scheme_id = b.scheme_id
WHERE s.status = 'active'
GROUP BY s.scheme_id, s.scheme_name, s.scheme_type, s.category;

-- Triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_schemes_updated_at BEFORE UPDATE ON schemes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_eligibility_updated_at BEFORE UPDATE ON eligibility_criteria
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_benefits_updated_at BEFORE UPDATE ON benefits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_updated_at BEFORE UPDATE ON application_process
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
