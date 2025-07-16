// Eligibility Engine for BharatSetu
// Handles eligibility determination for all 22 Haryana schemes

class EligibilityEngine {
    constructor() {
        this.schemes = this.initializeSchemes();
        this.policies = this.initializePolicies();
    }

    initializePolicies() {
        return {
            industrial_policy_2020: {
                name: "Industrial Investment and Employment Promotion Policy 2020",
                features: {
                    stamp_duty: {
                        block_b: "60% refund",
                        block_c: "75% refund", 
                        block_d: "100% refund"
                    },
                    sgst_reimbursement: {
                        block_b: "50% of Net SGST for first 5 years, 25% for next 3 years (cap: 100% of FCI)",
                        block_c: "75% of Net SGST for first 7 years, 35% for next 3 years (cap: 125% of FCI)",
                        block_d: "75% of Net SGST for first 10 years, 35% for next 3 years (cap: 150% of FCI)"
                    },
                    infrastructure_interest_subsidy: {
                        block_b: "5% for Micro and Small Enterprises on term loan (max. INR 20L/year) for 3 years",
                        block_c_d: "5% for Micro and Small Enterprises on term loan (max. INR 20L/year) for 5 years"
                    },
                    electricity_duty: {
                        block_b: "100% exemption for 7 years",
                        block_c: "100% exemption for 10 years", 
                        block_d: "100% exemption for 12 years"
                    },
                    testing_equipment: "75% (up to INR 50L) of cost for acquiring technology",
                    employment_generation: {
                        general: "INR 30,000/year for 7 years",
                        sc_women: "INR 36,000/year for 7 years"
                    },
                    credit_rating: "75% reimbursement (max. INR 2L) for credit rating expenses"
                }
            },
            msme_policy_2019: {
                name: "Haryana MSME Policy 2019",
                features: {
                    cluster_development: "50% of project cost up to max. Rs. 5 Cr.",
                    lean_manufacturing: "80% of project cost up to max. INR 2L per unit",
                    sme_exchange: "20% of expenditure up to max. INR 5L after successful equity raising"
                }
            },
            food_processing_policy_2017: {
                name: "Haryana Food Processing Industry Policy 2017",
                features: {
                    capital_investment: "35% up to Rs 5cr for storage, packaging and transport infrastructure",
                    food_park: "50% of total project cost with maximum limit of INR 10 crore (C&D block)",
                    backward_linkages: "50% Capital Investment subsidy on project cost limited to Rs. 3.5 cr. in C&D blocks"
                }
            }
        };
    }

    initializeSchemes() {
        return [

            {
                id: "sme_exchange_equity",
                name: "SME Exchange Equity Scheme",
                category: "finance",
                eligibility: {
                    enterprise_type: ["micro", "small", "medium"],
                    requires_urc: true,
                    requires_hum: true,
                    requires_listing: true
                },
                benefits: {
                    subsidy: "20% of expenditure",
                    max_amount: "INR 5L"
                },
                documents: ["Application Form", "Statement of Expenditure", "CA Certificate", "Declaration"]
            },
            {
                id: "renewable_energy",
                name: "State Renewable Energy Scheme",
                category: "renewable_energy",
                eligibility: {
                    enterprise_type: ["micro", "small", "medium"],
                    block_categories: ["a", "b", "c", "d"],
                    requires_urc: true,
                    requires_hum: true,
                    requires_renewable_tech: true
                },
                benefits: {
                    subsidy: "Interest subsidy on renewable energy technology",
                    max_amount: "Varies by technology"
                },
                documents: ["Application Form", "Declaration", "Bank Certificate", "CA Certificate", "Undertaking"]
            },
            {
                id: "lean_manufacturing",
                name: "State Mini Lean Manufacturing Competitiveness Scheme",
                category: "productivity",
                eligibility: {
                    enterprise_type: ["micro", "small", "medium"],
                    block_categories: ["a", "b", "c", "d"],
                    requires_urc: true,
                    requires_hum: true,
                    min_units: 8,
                    requires_cluster: true
                },
                benefits: {
                    subsidy: "80% of project cost",
                    max_amount: "INR 2L per unit"
                },
                documents: ["Application Form", "Power of Attorney", "MoU", "Bi-party Agreement", "MBR"]
            },

            {
                id: "electricity_duty",
                name: "Reimbursement of Electricity Duty Payment",
                category: "utility",
                eligibility: {
                    enterprise_type: ["micro", "small", "medium"],
                    block_categories: ["a", "b", "c", "d"],
                    requires_urc: true,
                    requires_hum: true,
                    new_unit: true,
                    electricity_connection_after: "2019-02-26"
                },
                benefits: {
                    block_b: "100% exemption for 7 years",
                    block_c: "100% exemption for 10 years",
                    block_d: "100% exemption for 12 years"
                },
                documents: ["Application Form", "SDO Certificate", "CA Certificate", "Declaration"]
            },
            {
                id: "power_tariff_subsidy",
                name: "Power Tariff Subsidy",
                category: "utility",
                eligibility: {
                    enterprise_type: ["micro", "small"],
                    block_categories: ["c", "d"],
                    requires_urc: true,
                    requires_hum: true
                },
                benefits: {
                    block_d: "₹2 per unit subsidy up to 40 KW connected load",
                    block_c: "₹2 per unit subsidy up to 30 KW connected load"
                },
                documents: ["Application Form", "Electricity Connection Certificate", "Load Details", "CA Certificate"]
            },
            {
                id: "employment_generation",
                name: "Employment Generation Subsidy",
                category: "employment",
                eligibility: {
                    enterprise_type: ["micro", "small", "medium"],
                    block_categories: ["b", "c", "d"],
                    requires_urc: true,
                    requires_hum: true,
                    requires_haryana_residents: true
                },
                benefits: {
                    sc_women_employees: "₹36,000 per year for SC/Women employees",
                    general_employees: "₹30,000 per year for General Category employees",
                    duration: "7 years in B/C/D category blocks"
                },
                documents: ["Application Form", "Employee Details", "Haryana Resident Certificates", "ESI/PF Numbers", "CA Certificate"]
            },
            {
                id: "skill_development",
                name: "Skill Development & Training Scheme",
                category: "training",
                eligibility: {
                    enterprise_type: ["micro", "small", "medium"],
                    block_categories: ["a", "b", "c", "d"],
                    requires_urc: true,
                    requires_hum: true
                },
                benefits: {
                    subsidy: "Reimbursement of training expenses",
                    max_amount: "Varies by training program"
                },
                documents: ["Application Form", "CA Certificate", "Declaration", "Statement of Expenditure"]
            },
            {
                id: "stamp_duty_refund",
                name: "Stamp Duty Refund Scheme",
                category: "tax",
                eligibility: {
                    enterprise_type: ["micro", "small", "medium", "large", "mega"],
                    block_categories: ["a", "b", "c", "d"],
                    requires_urc: true,
                    requires_hum: true,
                    land_purchase_within_years: 5,
                    commercial_production_within_years: 5
                },
                benefits: {
                    block_d: "100% refund of stamp duty",
                    block_c: "75% refund of stamp duty",
                    block_b: "60% refund of stamp duty"
                },
                documents: ["Application Form", "Declaration", "Land Purchase Documents", "Commercial Production Certificate", "CA Certificate"]
            },
            {
                id: "testing_equipment",
                name: "Testing Equipment Assistance Scheme",
                category: "technology",
                eligibility: {
                    enterprise_type: ["micro", "small"],
                    block_categories: ["a", "b", "c", "d"],
                    requires_urc: true,
                    requires_hum: true
                },
                benefits: {
                    subsidy: "50% subsidy on testing equipment",
                    max_amount: "₹10L per year"
                },
                documents: ["Application Form", "Equipment Quotations", "CA Certificate", "Utilization Certificate"]
            },
            {
                id: "ict_promotion",
                name: "Promotion of ICT Scheme",
                category: "technology",
                eligibility: {
                    enterprise_type: ["micro", "small", "medium"],
                    block_categories: ["a", "b", "c", "d"],
                    requires_urc: true,
                    requires_hum: true,
                    requires_cloud_erp: true
                },
                benefits: {
                    subsidy: "Reimbursement of cloud ERP subscription",
                    max_amount: "Varies by usage"
                },
                documents: ["Application Form", "CA Certificate"]
            },
            {
                id: "textile_park",
                name: "Textile Park Scheme",
                category: "textile",
                eligibility: {
                    enterprise_type: ["micro", "small", "medium", "large"],
                    block_categories: ["a", "b", "c", "d"],
                    requires_urc: true,
                    requires_hum: true,
                    textile_sector: true,
                    min_area: "10 acres"
                },
                benefits: {
                    subsidy: "Capital Investment Subsidy",
                    max_amount: "Varies by project"
                },
                documents: ["Application Form", "DPR", "Bank Sanction", "Incorporation Certificate", "Land Documents", "CE Certificate"]
            },
            {
                id: "green_sustainable",
                name: "Promoting Green and Sustainable Production Scheme",
                category: "environment",
                eligibility: {
                    enterprise_type: ["micro", "small", "medium"],
                    block_categories: ["a", "b", "c", "d"],
                    requires_urc: true,
                    requires_hum: true,
                    textile_sector: true,
                    requires_etp_zld_solar: true
                },
                benefits: {
                    subsidy: "Assistance for ETP/ZLD/Solar implementation",
                    max_amount: "Varies by technology"
                },
                documents: ["Application Form", "DPR", "Incorporation Certificate", "GST Returns", "Land Documents", "CA Certificate", "PCB Certificate"]
            },

            {
                id: "interest_subsidy",
                name: "Interest Subsidy Scheme",
                category: "finance",
                eligibility: {
                    enterprise_type: ["micro", "small", "medium"],
                    block_categories: ["a", "b", "c", "d"],
                    requires_urc: true,
                    requires_hum: true,
                    requires_term_loan: true
                },
                benefits: {
                    block_c_d: "5% per annum on term loan, max ₹20L/year for 5 years",
                    block_b: "5% per annum on term loan, max ₹20L/year for 3 years",
                    women_sc_st_micro: "6% per annum on term loan, max ₹20L/year for 5 years in B/C/D blocks",
                    technology_upgradation: "6% in C/D blocks, 5% in A/B blocks, max ₹10L/year for 3 years"
                },
                documents: ["Application Form", "Bank Certificate", "CA Certificate", "Undertaking", "Loan Sanction Letter"]
            },
            {
                id: "capital_investment_textile",
                name: "Capital Investment Subsidy for Textile Units",
                category: "textile",
                eligibility: {
                    enterprise_type: ["micro", "small", "medium", "large", "anchor"],
                    block_categories: ["a", "b", "c", "d"],
                    requires_urc: true,
                    requires_hum: true,
                    textile_sector: true
                },
                benefits: {
                    block_b: "Up to INR 2 Cr",
                    block_c: "Up to INR 5 Cr",
                    block_d: "Up to INR 10 Cr"
                },
                documents: ["Application Form", "DPR", "Bank Sanction", "Incorporation Certificate", "Land Documents", "Surety Bond", "Affidavit", "CA Certificate", "Bank Certificate", "Utilization Certificate"]
            },
            {
                id: "sgst_reimbursement",
                name: "Investment Subsidy in lieu of Net SGST",
                category: "tax",
                eligibility: {
                    enterprise_type: ["micro", "small", "medium"],
                    block_categories: ["a", "b", "c", "d"],
                    requires_urc: true,
                    requires_hum: true
                },
                benefits: {
                    block_d: "75% of Net SGST for first 7 years, 35% for next 3 years (cap: 150% of FCI)",
                    block_c: "75% of Net SGST for first 7 years, 35% for next 3 years (cap: 125% of FCI)",
                    block_b: "50% of Net SGST for first 5 years, 25% for next 3 years (cap: 100% of FCI)",
                    women_sc_st_micro: "75% of Net SGST for first 7 years, 35% for next 3 years (cap: 150% of FCI) in B/C/D blocks"
                },
                documents: ["Application Form", "DETC Certificate", "Affidavit", "GST Returns", "CA Certificate"]
            },
            {
                id: "technology_acquisition",
                name: "Assistance for Technology Acquisition",
                category: "technology",
                eligibility: {
                    enterprise_type: ["micro", "small", "medium"],
                    block_categories: ["a", "b", "c", "d"],
                    requires_urc: true,
                    requires_hum: true
                },
                benefits: {
                    subsidy: "75% of the cost for adopting/acquiring technology",
                    max_amount: "₹50L"
                },
                documents: ["Application Form", "Technology Agreement", "CA Certificate", "Utilization Certificate"]
            },
            {
                id: "patent_cost_reimbursement",
                name: "Patent Cost Reimbursement",
                category: "intellectual_property",
                eligibility: {
                    enterprise_type: ["micro", "small", "medium"],
                    block_categories: ["a", "b", "c", "d"],
                    requires_urc: true,
                    requires_hum: true
                },
                benefits: {
                    subsidy: "100% reimbursement of patent registration costs",
                    max_amount: "₹25L for domestic and international patents"
                },
                documents: ["Application Form", "Patent Registration Certificate", "CA Certificate", "Expense Details"]
            },
            {
                id: "fire_insurance",
                name: "Support for Obtaining Fire Insurance Policy",
                category: "insurance",
                eligibility: {
                    enterprise_type: ["micro", "small", "medium"],
                    block_categories: ["a", "b", "c", "d"],
                    requires_urc: true,
                    requires_hum: true,
                    textile_sector: true,
                    requires_fire_safety: true
                },
                benefits: {
                    subsidy: "Fire insurance assistance",
                    max_amount: "Varies by policy"
                },
                documents: ["Application Form", "Fire Safety NOC", "Insurance Policy"]
            },
            {
                id: "quality_certification",
                name: "Quality Certification Assistance",
                category: "quality",
                eligibility: {
                    enterprise_type: ["micro", "small", "medium"],
                    block_categories: ["a", "b", "c", "d"],
                    requires_urc: true,
                    requires_hum: true
                },
                benefits: {
                    subsidy: "75% reimbursement of certification costs",
                    general_certifications: "Max ₹5L for general certifications",
                    export_certifications: "Max ₹10L for country-specific export certifications"
                },
                documents: ["Application Form", "Certification Details", "CA Certificate", "Expense Details"]
            },
            {
                id: "environment_compliance",
                name: "Assistance for Environment Compliance",
                category: "environment",
                eligibility: {
                    enterprise_type: ["micro", "small", "medium"],
                    block_categories: ["a", "b", "c", "d"],
                    requires_urc: true,
                    requires_hum: true
                },
                benefits: {
                    etp_apcd: "50% financial support, max ₹25L for ETP and APCDs",
                    zld: "75% subsidy, max ₹1 Cr for Zero Liquid Discharge"
                },
                documents: ["Application Form", "PCB Consent", "Equipment Details", "CA Certificate", "Utilization Certificate"]
            },

            {
                id: "padma_capital",
                name: "PADMA Capital Investment Subsidy Scheme",
                category: "padma",
                eligibility: {
                    enterprise_type: ["micro", "small", "medium"],
                    requires_urc: true,
                    requires_hum: true
                },
                benefits: {
                    subsidy: "Capital Investment Subsidy",
                    max_amount: "Varies by project"
                },
                documents: ["Application Form", "Declaration", "CA Certificate"]
            },
            {
                id: "padma_entrepreneurship",
                name: "PADMA Entrepreneurship Acceleration Scheme",
                category: "padma",
                eligibility: {
                    enterprise_type: ["micro", "small", "medium"],
                    requires_urc: true,
                    requires_hum: true
                },
                benefits: {
                    subsidy: "Entrepreneurship acceleration support",
                    max_amount: "Varies by startup stage"
                },
                documents: ["Application Form", "Concept Note", "Startup Certificate", "Incorporation Certificate", "Land Documents", "Declaration"]
            },
            {
                id: "padma_interest",
                name: "PADMA Interest Subsidy Scheme",
                category: "padma",
                eligibility: {
                    enterprise_type: ["micro", "small", "medium"],
                    requires_urc: true,
                    requires_hum: true,
                    requires_term_loan: true
                },
                benefits: {
                    subsidy: "Interest subsidy on term loan",
                    max_amount: "Varies by loan amount"
                },
                documents: ["Application Form", "Declaration", "Bank Certificate", "CA Certificate"]
            },
            {
                id: "padma_designing",
                name: "PADMA Designing, Branding, Marketing & Exports Promotion Scheme",
                category: "padma",
                eligibility: {
                    enterprise_type: ["micro", "small", "medium"],
                    requires_urc: true,
                    requires_hum: true
                },
                benefits: {
                    subsidy: "Designing, branding, marketing support",
                    max_amount: "Varies by expenses"
                },
                documents: ["Application Form", "CA Certificate", "Declaration"]
            },
            {
                id: "energy_conservation",
                name: "Energy Conservation Scheme",
                category: "energy",
                eligibility: {
                    enterprise_type: ["micro", "small", "medium"],
                    block_categories: ["a", "b", "c", "d"],
                    requires_urc: true,
                    requires_hum: true
                },
                benefits: {
                    energy_audit: "75% reimbursement, max ₹2L for energy audits",
                    block_d: "50% subsidy on capital equipment, max ₹20L",
                    block_c: "40% subsidy on capital equipment, max ₹20L",
                    block_b: "30% subsidy on capital equipment, max ₹20L",
                    block_a: "20% subsidy on capital equipment, max ₹20L"
                },
                documents: ["Application Form", "Energy Audit Report", "Equipment Details", "CA Certificate", "Utilization Certificate"]
            },
            {
                id: "water_conservation",
                name: "Water Conservation Scheme",
                category: "water",
                eligibility: {
                    enterprise_type: ["micro", "small", "medium"],
                    block_categories: ["a", "b", "c", "d"],
                    requires_urc: true,
                    requires_hum: true
                },
                benefits: {
                    water_audit: "75% reimbursement, max ₹1L for water audits",
                    conservation_equipment: "50% subsidy on capital equipment, max ₹20L for water conservation systems"
                },
                documents: ["Application Form", "Water Audit Report", "Equipment Details", "CA Certificate", "Utilization Certificate"]
            },

            {
                id: "hsjuy",
                name: "Haryana Swarn Jayanti Udyami Yojana (HSJUY)",
                category: "entrepreneurship",
                eligibility: {
                    enterprise_type: ["micro", "small", "medium"],
                    block_categories: ["a", "b", "c", "d"],
                    requires_urc: true,
                    requires_hum: true,
                    sc_st_women: true
                },
                benefits: {
                    subsidy: "Financial assistance up to ₹1 Cr",
                    max_amount: "₹1 Cr"
                },
                documents: ["Application Form", "Caste Certificate", "Project Report", "Bank Certificate", "CA Certificate"]
            },
            {
                id: "hsiidc_loans",
                name: "HSIIDC Loans",
                category: "finance",
                eligibility: {
                    enterprise_type: ["micro", "small", "medium"],
                    block_categories: ["a", "b", "c", "d"],
                    requires_urc: true,
                    requires_hum: true
                },
                benefits: {
                    subsidy: "Loan assistance for new units, expansion, modernization",
                    max_amount: "₹20 Cr"
                },
                documents: ["Application Form", "Project Report", "Bank Certificate", "Land Documents", "CA Certificate"]
            },
            {
                id: "gramin_udyogik",
                name: "Haryana Gramin Udyogik Vikas Yojana",
                category: "rural_development",
                eligibility: {
                    enterprise_type: ["micro", "small", "medium"],
                    block_categories: ["a", "b", "c", "d"],
                    requires_urc: true,
                    requires_hum: true,
                    rural_area: true
                },
                benefits: {
                    subsidy: "Maximum assistance for rural industrial development",
                    max_amount: "₹25L"
                },
                documents: ["Application Form", "Rural Area Certificate", "Project Report", "Bank Certificate", "CA Certificate"]
            },

            {
                id: "startup_policy",
                name: "Haryana State Startup Policy Benefits",
                category: "startup",
                eligibility: {
                    enterprise_type: ["micro", "small", "medium"],
                    block_categories: ["a", "b", "c", "d"],
                    requires_urc: true,
                    requires_hum: true,
                    dpiit_startup: true
                },
                benefits: {
                    interest_subsidy: "8% per annum for 5 years",
                    lease_rental: "25% reimbursement, max ₹3L per annum for 1 year",
                    seed_grant: "Up to ₹3L per startup",
                    sgst_reimbursement: "100% Net SGST Reimbursement for 7 years",
                    incubator_support: "Capital grants up to ₹2 Cr for government, ₹1 Cr for private incubators"
                },
                documents: ["Application Form", "DPIIT Startup Certificate", "Project Report", "CA Certificate", "Incubator Documents"]
            },
            {
                id: "basic_support",
                name: "Basic MSME Support Scheme",
                category: "general",
                eligibility: {
                    enterprise_type: ["micro", "small", "medium"],
                    block_categories: ["a", "b", "c", "d"],
                    requires_urc: false,
                    requires_hum: false
                },
                benefits: {
                    subsidy: "Basic support and guidance",
                    max_amount: "INR 1L"
                },
                documents: ["Application Form", "Basic Documents"]
            },
            // NATIONAL SCHEMES
            {
                id: "pmegp",
                name: "Prime Minister's Employment Generation Programme (PMEGP) - National",
                category: "national_employment",
                eligibility: {
                    enterprise_type: ["micro"],
                    requires_udyam: true,
                    new_project: true,
                    age_above_18: true
                },
                benefits: {
                    general_rural: "25% subsidy + 10% margin money",
                    general_urban: "15% subsidy + 10% margin money",
                    special_rural: "35% subsidy + 5% margin money",
                    special_urban: "25% subsidy + 5% margin money",
                    max_amount: "INR 50L (manufacturing), INR 20L (service)"
                },
                documents: ["Application Form", "Project Report", "Bank Certificate", "Identity Proof", "Educational Certificate", "Caste Certificate (if applicable)"]
            },
            {
                id: "pmmy",
                name: "Pradhan Mantri Mudra Yojana (PMMY) - National",
                category: "national_finance",
                eligibility: {
                    enterprise_type: ["micro", "small"],
                    non_farm_sector: true
                },
                benefits: {
                    shishu: "Up to INR 50,000 (new businesses)",
                    kishore: "INR 50,000 to 5L",
                    tarun: "INR 5L to 10L",
                    tarun_plus: "INR 10L to 20L (for successful Tarun borrowers)"
                },
                documents: ["Application Form", "Business Plan", "Identity Proof", "Address Proof", "Bank Account Details"]
            },
            {
                id: "cgtmse",
                name: "Credit Guarantee Fund Trust for Micro & Small Enterprises (CGTMSE) - National",
                category: "national_finance",
                eligibility: {
                    enterprise_type: ["micro", "small"],
                    requires_udyam: true
                },
                benefits: {
                    micro_enterprises: "85% guarantee cover (up to 5L)",
                    north_east_jk: "80% guarantee cover (up to 50L), 75% (above 50L)",
                    women_entrepreneurs: "90% guarantee cover",
                    sc_st_pwd: "85% guarantee cover",
                    aspirational_zed: "85% guarantee cover",
                    others: "75% guarantee cover",
                    max_amount: "INR 2 Cr"
                },
                documents: ["Application Form", "Udyam Certificate", "Business Plan", "Bank Documents", "Identity Proof"]
            },
            {
                id: "clcss",
                name: "Credit Linked Capital Subsidy Scheme (CLCSS) for Technology Upgradation - National",
                category: "national_technology",
                eligibility: {
                    enterprise_type: ["micro", "small"],
                    requires_udyam: true,
                    requires_term_loan: true,
                    technology_upgradation: true
                },
                benefits: {
                    subsidy: "15% capital subsidy on institutional credit",
                    max_amount: "INR 15L",
                    sc_st_additional: "Additional 10% for SC/ST entrepreneurs"
                },
                documents: ["Application Form", "Udyam Certificate", "Bank Sanction Letter", "Equipment Quotations", "CA Certificate"]
            },

            {
                id: "msme_innovative",
                name: "MSME Innovative Scheme (Incubation, Design, IPR) - National",
                category: "national_innovation",
                eligibility: {
                    enterprise_type: ["micro", "small", "medium"],
                    requires_udyam: true
                },
                benefits: {
                    incubation_idea: "Up to INR 15L per idea",
                    incubation_hi: "Up to INR 1 Cr for R&D infrastructure",
                    design_micro: "75% of project cost (max INR 40L)",
                    design_small_medium: "60% of project cost (max INR 40L)",
                    design_student: "75% of project cost (max INR 2.5L)",
                    ipr_foreign: "Up to INR 5L for foreign patent",
                    ipr_domestic: "Up to INR 1L for domestic patent",
                    ipr_gi: "Up to INR 2L for GI registration",
                    ipr_design: "Up to INR 15,000 for design registration",
                    ipr_trademark: "Up to INR 10,000 for trademark registration"
                },
                documents: ["Application Form", "Udyam Certificate", "Project Proposal", "CA Certificate", "IPR Registration Certificate"]
            },
            {
                id: "zed_certification",
                name: "MSME Sustainable (ZED) Certification Scheme - National",
                category: "national_quality",
                eligibility: {
                    enterprise_type: ["micro", "small", "medium"],
                    requires_udyam: true,
                    manufacturing_sector: true
                },
                benefits: {
                    joining_reward: "INR 10,000 (makes Bronze certification free)",
                    micro_subsidy: "80% subsidy on certification cost",
                    small_subsidy: "60% subsidy on certification cost",
                    medium_subsidy: "50% subsidy on certification cost",
                    women_sc_st_additional: "Additional 10% for Women/SC/ST/NER/Himalayan/LWE/Island/Aspirational Districts",
                    sfurti_cdp_additional: "Additional 5% for SFURTI/MSE-CDP participants"
                },
                documents: ["Application Form", "Udyam Certificate", "Quality Management Documents", "CA Certificate", "Testing Reports"]
            }
        ];
    }

    // Check eligibility for a specific scheme
    checkSchemeEligibility(schemeId, userData) {
        const scheme = this.schemes.find(s => s.id === schemeId);
        if (!scheme) return { eligible: false, reason: "Scheme not found" };

        const eligibility = scheme.eligibility;
        const results = [];

        // Check enterprise type
        if (eligibility.enterprise_type && !eligibility.enterprise_type.includes(userData.enterprise_type)) {
            results.push({ field: "enterprise_type", eligible: false, message: `Only ${eligibility.enterprise_type.join(", ")} enterprises are eligible` });
        }

        // Check block categories
        if (eligibility.block_categories && !eligibility.block_categories.includes(userData.block_category.toLowerCase())) {
            results.push({ field: "block_category", eligible: false, message: `Only blocks ${eligibility.block_categories.join(", ")} are eligible` });
        }

        // Check URC requirement
        if (eligibility.requires_urc && !userData.has_urc) {
            results.push({ field: "urc", eligible: false, message: "Udhyam Registration Certificate (URC) is required" });
        }

        // Check HUM requirement
        if (eligibility.requires_hum && !userData.has_hum) {
            results.push({ field: "hum", eligible: false, message: "Haryana Udhyam Memorandum (HUM) is required" });
        }

        // Check sector requirements
        if (eligibility.textile_sector && userData.sector !== "textile") {
            results.push({ field: "sector", eligible: false, message: "Only textile sector enterprises are eligible" });
        }

        // Check cloud ERP requirement
        if (eligibility.requires_cloud_erp && !userData.requires_cloud_erp) {
            results.push({ field: "cloud_erp", eligible: false, message: "Cloud ERP implementation is required" });
        }

        // PADMA block requirement removed - PADMA is available across all blocks

        // Check minimum units for cluster schemes
        if (eligibility.min_units && userData.number_of_units < eligibility.min_units) {
            results.push({ field: "min_units", eligible: false, message: `Minimum ${eligibility.min_units} units required for cluster scheme` });
        }

        // Check SPV requirement
        if (eligibility.requires_spv && !userData.has_spv) {
            results.push({ field: "spv", eligible: false, message: "Special Purpose Vehicle (SPV) formation is required" });
        }

        // Check startup registration requirement
        if (eligibility.requires_startup_registration && !userData.is_startup_registered) {
            results.push({ field: "startup_registration", eligible: false, message: "Must be registered with Startup Haryana/DITECH/DPIIT" });
        }

        // Check term loan requirement
        if (eligibility.requires_term_loan && !userData.has_term_loan) {
            results.push({ field: "term_loan", eligible: false, message: "Term loan from bank/financial institution is required" });
        }

        // Check land purchase within years
        if (eligibility.land_purchase_within_years && userData.land_purchase_years > eligibility.land_purchase_within_years) {
            results.push({ field: "land_purchase", eligible: false, message: `Land must be purchased within last ${eligibility.land_purchase_within_years} years` });
        }

        // Check electricity connection date
        if (eligibility.electricity_connection_after && userData.electricity_connection_date < eligibility.electricity_connection_after) {
            results.push({ field: "electricity_connection", eligible: false, message: "Electricity connection must be after specified date" });
        }

        // NATIONAL SCHEME CHECKS
        // Check Udyam registration requirement
        if (eligibility.requires_udyam && !userData.has_udyam) {
            results.push({ field: "udyam", eligible: false, message: "Udyam registration is required" });
        }

        // Check new project requirement
        if (eligibility.new_project && userData.project_type !== "new") {
            results.push({ field: "new_project", eligible: false, message: "Only new projects are eligible" });
        }

        // Check age requirement
        if (eligibility.age_above_18 && !userData.age_above_18) {
            results.push({ field: "age", eligible: false, message: "Applicant must be above 18 years of age" });
        }

        // Check non-farm sector requirement
        if (eligibility.non_farm_sector && userData.sector === "agriculture") {
            results.push({ field: "sector", eligible: false, message: "Only non-farm sector enterprises are eligible" });
        }

        // Check technology upgradation requirement
        if (eligibility.technology_upgradation && !userData.technology_upgradation) {
            results.push({ field: "technology_upgradation", eligible: false, message: "Technology upgradation is required" });
        }

        // Check manufacturing sector requirement
        if (eligibility.manufacturing_sector && userData.sector === "service") {
            results.push({ field: "sector", eligible: false, message: "Only manufacturing sector enterprises are eligible" });
        }

        const ineligibleFields = results.filter(r => !r.eligible);
        
        return {
            eligible: ineligibleFields.length === 0,
            scheme: scheme,
            results: results,
            ineligible_reasons: ineligibleFields.map(f => f.message)
        };
    }

    // Check eligibility for all schemes
    checkAllEligibility(userData) {
        const results = [];
        console.log('Checking eligibility for user data:', userData);
        
        this.schemes.forEach(scheme => {
            const eligibility = this.checkSchemeEligibility(scheme.id, userData);
            console.log(`Scheme: ${scheme.name} - Eligible: ${eligibility.eligible}`);
            if (!eligibility.eligible && eligibility.ineligible_reasons) {
                console.log(`  Reasons: ${eligibility.ineligible_reasons.join(', ')}`);
            }
            
            if (eligibility.eligible) {
                results.push({
                    scheme: scheme,
                    benefits: scheme.benefits,
                    documents: scheme.documents
                });
            }
        });

        console.log(`Total eligible schemes: ${results.length}`);
        return {
            total_eligible: results.length,
            eligible_schemes: results,
            total_schemes: this.schemes.length
        };
    }

    // Calculate total potential benefits
    calculateTotalBenefits(eligibleSchemes, userData) {
        let totalValue = 0;
        const benefits = [];
        
        console.log('Calculating benefits with user data:', userData);

        eligibleSchemes.forEach(scheme => {
            let schemeValue = 0;
            let benefitDescription = "";

            // Calculate based on block category
            if (scheme.benefits[userData.block_category.toLowerCase()]) {
                benefitDescription = scheme.benefits[userData.block_category.toLowerCase()];
                // Extract numeric values (simplified calculation)
                const numericMatch = benefitDescription.match(/INR\s*(\d+(?:\.\d+)?)\s*(?:Cr|L|Lakh)/i);
                if (numericMatch) {
                    const value = parseFloat(numericMatch[1]);
                    const unit = numericMatch[0].includes('Cr') ? 10000000 : 
                               numericMatch[0].includes('L') ? 100000 : 100000;
                    schemeValue = value * unit;
                }
            } else if (scheme.benefits.subsidy) {
                benefitDescription = scheme.benefits.subsidy;
                // Estimate value based on subsidy percentage - but only for specific schemes
                if (benefitDescription.includes('50%') && scheme.scheme.name.includes('SME Exchange')) {
                    schemeValue = 500000; // Fixed amount for SME Exchange
                } else if (benefitDescription.includes('75%') && scheme.scheme.name.includes('Technology Acquisition')) {
                    // Technology acquisition is handled in the detailed calculations below
                    schemeValue = 0; // Let it be calculated in the detailed section
                } else if (benefitDescription.includes('75%') && scheme.scheme.name.includes('Quality Certification')) {
                    // Quality certification is handled in the detailed calculations below
                    schemeValue = 0; // Let it be calculated in the detailed section
                } else {
                    // For other schemes, don't use generic calculation
                    schemeValue = 0; // Let it be calculated in the detailed section
                }
            } else if (scheme.benefits.max_amount) {
                benefitDescription = scheme.benefits.subsidy || scheme.benefits.max_amount;
                // Extract numeric values from max_amount
                const numericMatch = scheme.benefits.max_amount.match(/INR\s*(\d+(?:\.\d+)?)\s*(?:Cr|L|Lakh)/i);
                if (numericMatch) {
                    const value = parseFloat(numericMatch[1]);
                    const unit = numericMatch[0].includes('Cr') ? 10000000 : 
                               numericMatch[0].includes('L') ? 100000 : 100000;
                    schemeValue = value * unit;
                }
            }

            // For schemes without specific amounts, provide reasonable estimates
            if (schemeValue === 0) {
                // SGST REIMBURSEMENT CALCULATIONS
                if (scheme.scheme.name.includes('SGST')) {
                    // SGST is based on actual turnover, not project cost
                    const estimatedAnnualTurnover = userData.annual_turnover || userData.project_cost * 2; // Assume 2x project cost as annual turnover
                    const sgstRate = 0.09; // 9% SGST rate
                    const annualSGST = estimatedAnnualTurnover * sgstRate * 10000000; // Convert Cr to Rs
                    const years = userData.block_category.toLowerCase() === 'd' ? 10 : 
                                userData.block_category.toLowerCase() === 'c' ? 10 : 8;
                    const avgSubsidyRate = 0.55; // Average of 75% for first 7 years and 35% for next 3 years
                    schemeValue = Math.min(annualSGST * avgSubsidyRate * years, 50000000); // Cap at 5 Cr
                    benefitDescription = `${avgSubsidyRate * 100}% SGST reimbursement for ${years} years (estimated)`;
                }
                // PADMA SCHEME CALCULATIONS
                else if (scheme.scheme.name.includes('PADMA Interest Subsidy')) {
                    if (userData.has_term_loan && userData.term_loan_amount && userData.interest_rate) {
                        const loanAmount = userData.term_loan_amount; // Already in rupees
                        const interestRate = userData.interest_rate / 100;
                        const subsidyRate = 0.06; // 6% subsidy
                        const years = 5;
                        schemeValue = Math.min(loanAmount * interestRate * subsidyRate * years, 2000000); // Max 20L
                        benefitDescription = `6% interest subsidy on ₹${(loanAmount/100000).toFixed(2)}L loan for 5 years`;
                    } else {
                        schemeValue = 2000000; // Default 20L
                        benefitDescription = "6% interest subsidy (max ₹20L/year inside, ₹10L/year outside clusters) for 5 years";
                    }
                } else if (scheme.scheme.name.includes('PADMA Designing, Branding, Marketing')) {
                    if (userData.marketing_export_expenses) {
                        // Values are already in rupees
                        const expenses = userData.marketing_export_expenses;
                        schemeValue = Math.min(expenses * 0.5, 1000000); // 50% subsidy, max 10L
                        benefitDescription = `50% subsidy on ₹${(expenses/100000).toFixed(2)}L marketing expenses`;
                    } else {
                        schemeValue = 1000000; // Default 10L
                        benefitDescription = "50% subsidy (max ₹10L/year) for branding, marketing, and export promotion";
                    }
                } else if (scheme.scheme.name.includes('PADMA Capital Investment')) {
                    const isSpecialCategory = ['sc', 'st', 'women', 'shg'].includes(userData.promoter_category);
                    const subsidyRate = isSpecialCategory ? 0.35 : 0.25;
                    const maxAmount = isSpecialCategory ? 3500000 : 2500000; // 35L or 25L
                    schemeValue = Math.min(userData.project_cost * subsidyRate * 10000000, maxAmount);
                    benefitDescription = `${subsidyRate * 100}% subsidy (max ₹${maxAmount/100000}L) for ${userData.promoter_category || 'general'} category`;
                } else if (scheme.scheme.name.includes('PADMA Entrepreneurship')) {
                    schemeValue = 500000; // 5L for entrepreneurship acceleration
                    benefitDescription = "₹5L per start-up for early-stage capital in/around PADMA clusters";
                }
                // EMPLOYMENT GENERATION CALCULATIONS
                else if (scheme.scheme.name.includes('Employment Generation')) {
                    if (userData.total_employees) {
                        const scWomenEmployees = (userData.sc_st_employees || 0) + (userData.women_employees || 0);
                        const generalEmployees = Math.max(0, userData.total_employees - scWomenEmployees);
                        const scWomenBenefit = scWomenEmployees * 36000 * 7; // ₹36K/year for 7 years
                        const generalBenefit = generalEmployees * 30000 * 7; // ₹30K/year for 7 years
                        schemeValue = scWomenBenefit + generalBenefit;
                        benefitDescription = `₹${(schemeValue/100000).toFixed(2)}L for ${userData.total_employees} employees (${scWomenEmployees} SC/Women, ${generalEmployees} General)`;
                    } else {
                        schemeValue = 252000; // Default
                        benefitDescription = "₹36K/year for SC/Women, ₹30K/year for General employees";
                    }
                }
                // POWER TARIFF CALCULATIONS
                else if (scheme.scheme.name.includes('Power Tariff')) {
                    if (userData.connected_load && userData.annual_electricity_consumption) {
                        const maxLoad = userData.block_category.toLowerCase() === 'd' ? 40 : 30; // KW
                        const actualLoad = Math.min(userData.connected_load, maxLoad);
                        const subsidyPerUnit = 2; // ₹2 per unit
                        const estimatedUnits = userData.annual_electricity_consumption;
                        schemeValue = Math.min(actualLoad * subsidyPerUnit * estimatedUnits, 240000); // Max 24L
                        benefitDescription = `₹2/unit subsidy for ${actualLoad}KW load`;
                    } else {
                        schemeValue = 240000; // Default
                        benefitDescription = "₹2 per unit subsidy up to 30-40 KW load";
                    }
                }
                // ELECTRICITY DUTY CALCULATIONS
                else if (scheme.scheme.name.includes('Electricity')) {
                    if (userData.annual_electricity_consumption) {
                        const dutyRate = 0.15; // Assume 15% duty rate
                        const years = userData.block_category.toLowerCase() === 'd' ? 12 : 
                                    userData.block_category.toLowerCase() === 'c' ? 10 : 7;
                        schemeValue = userData.annual_electricity_consumption * dutyRate * years;
                        benefitDescription = `100% exemption for ${years} years`;
                    } else {
                        schemeValue = 2000000; // Default 20L
                        benefitDescription = "100% exemption for 7-12 years";
                    }
                }
                // STAMP DUTY CALCULATIONS
                else if (scheme.scheme.name.includes('Stamp Duty')) {
                    if (userData.land_investment) {
                        const stampDutyRate = 0.06; // Assume 6% stamp duty
                        const refundRate = userData.block_category.toLowerCase() === 'd' ? 1.0 : 
                                         userData.block_category.toLowerCase() === 'c' ? 0.75 : 0.60;
                        schemeValue = userData.land_investment * stampDutyRate * refundRate * 10000000; // Convert Cr to Rs
                        benefitDescription = `${refundRate * 100}% refund of stamp duty`;
                    } else {
                        schemeValue = 1500000; // Default 15L
                        benefitDescription = "50-100% refund based on block";
                    }
                }
                // TECHNOLOGY ACQUISITION CALCULATIONS
                else if (scheme.scheme.name.includes('Technology Acquisition')) {
                    if (userData.technology_equipment_cost) {
                        // Values are already in rupees
                        const techCost = userData.technology_equipment_cost;
                        schemeValue = Math.min(techCost * 0.75, 5000000); // 75% subsidy, max 50L
                        benefitDescription = `75% subsidy on ₹${(techCost/100000).toFixed(2)}L technology cost`;
                    } else {
                        schemeValue = 5000000; // Default 50L
                        benefitDescription = "75% of the cost for adopting/acquiring technology";
                    }
                }
                // TESTING EQUIPMENT CALCULATIONS
                else if (scheme.scheme.name.includes('Testing Equipment')) {
                    if (userData.testing_equipment_cost) {
                        // Values are already in rupees
                        const equipmentCost = userData.testing_equipment_cost;
                        schemeValue = Math.min(equipmentCost * 0.5, 1000000); // 50% subsidy, max 10L
                        benefitDescription = `50% subsidy on ₹${(equipmentCost/100000).toFixed(2)}L testing equipment`;
                    } else {
                        schemeValue = 1000000; // Default 10L
                        benefitDescription = "50% subsidy on testing equipment";
                    }
                }
                // QUALITY CERTIFICATION CALCULATIONS
                else if (scheme.scheme.name.includes('Quality Certification')) {
                    if (userData.quality_certification_cost) {
                        // Values are already in rupees
                        const certCost = userData.quality_certification_cost;
                        schemeValue = Math.min(certCost * 0.75, 500000); // 75% reimbursement, max 5L
                        benefitDescription = `75% reimbursement of ₹${(certCost/100000).toFixed(2)}L certification cost`;
                    } else {
                        schemeValue = 500000; // Default 5L
                        benefitDescription = "75% reimbursement of certification costs";
                    }
                }
                // NATIONAL SCHEME ESTIMATES
                else if (scheme.scheme.name.includes('PMEGP')) {
                    schemeValue = 3500000; // 35L for PMEGP
                    benefitDescription = "25-35% subsidy + 5-10% margin money";
                } else if (scheme.scheme.name.includes('PMMY')) {
                    schemeValue = 500000; // 5L for Mudra loans
                    benefitDescription = "Collateral-free loans up to 20L";
                } else if (scheme.scheme.name.includes('CGTMSE')) {
                    schemeValue = 1000000; // 10L for credit guarantee
                    benefitDescription = "75-90% guarantee cover up to 2 Cr";
                } else if (scheme.scheme.name.includes('CLCSS')) {
                    schemeValue = 1500000; // 15L for technology upgradation
                    benefitDescription = "15% capital subsidy on institutional credit";
                } else if (scheme.scheme.name.includes('MSE-CDP')) {
                    schemeValue = 10000000; // 1 Cr for cluster development
                    benefitDescription = "60-90% GoI grant for cluster infrastructure";
                } else if (scheme.scheme.name.includes('Innovative')) {
                    schemeValue = 4000000; // 40L for innovation schemes
                    benefitDescription = "Support for incubation, design, and IPR";
                } else if (scheme.scheme.name.includes('ZED')) {
                    schemeValue = 50000; // 50K for ZED certification
                    benefitDescription = "50-80% subsidy on certification cost";
                }
                // OTHER HARYANA SCHEME ESTIMATES
                else if (scheme.scheme.name.includes('Training')) {
                    schemeValue = 500000; // 5L for training
                    benefitDescription = "Reimbursement of training expenses";
                } else if (scheme.scheme.name.includes('ICT')) {
                    schemeValue = 300000; // 3L for ICT
                    benefitDescription = "Reimbursement of cloud ERP subscription";
                } else if (scheme.scheme.name.includes('Renewable')) {
                    schemeValue = 1000000; // 10L for renewable energy
                    benefitDescription = "Interest subsidy on renewable energy technology";
                } else if (scheme.scheme.name.includes('Basic')) {
                    schemeValue = 100000; // 1L for basic support
                    benefitDescription = "Basic support and guidance";
                } else if (scheme.scheme.name.includes('Patent Cost')) {
                    schemeValue = 2500000; // 25L for patent reimbursement
                    benefitDescription = "100% reimbursement of patent registration costs";
                } else if (scheme.scheme.name.includes('Environment Compliance')) {
                    schemeValue = 10000000; // 1 Cr for environment compliance
                    benefitDescription = "50-75% subsidy for ETP/ZLD systems";
                } else if (scheme.scheme.name.includes('Energy Conservation')) {
                    schemeValue = 2000000; // 20L for energy conservation
                    benefitDescription = "75% reimbursement for audits, 20-50% subsidy for equipment";
                } else if (scheme.scheme.name.includes('Water Conservation')) {
                    schemeValue = 2000000; // 20L for water conservation
                    benefitDescription = "75% reimbursement for audits, 50% subsidy for equipment";
                } else if (scheme.scheme.name.includes('HSJUY')) {
                    schemeValue = 10000000; // 1 Cr for HSJUY
                    benefitDescription = "Financial assistance up to ₹1 Cr for SC/ST/Women";
                } else if (scheme.scheme.name.includes('HSIIDC Loans')) {
                    schemeValue = 200000000; // 20 Cr for HSIIDC loans
                    benefitDescription = "Loan assistance for new units, expansion, modernization";
                } else if (scheme.scheme.name.includes('Gramin Udyogik')) {
                    schemeValue = 2500000; // 25L for rural development
                    benefitDescription = "Maximum assistance for rural industrial development";
                } else if (scheme.scheme.name.includes('State Mini Cluster')) {
                    schemeValue = 50000000; // 5 Cr for state mini cluster
                    benefitDescription = "90% from state, 10% from SPVs for cluster development";
                } else if (scheme.scheme.name.includes('Startup Policy')) {
                    schemeValue = 3000000; // 30L for startup benefits
                    benefitDescription = "8% interest subsidy, lease rental, seed grant, SGST reimbursement";
                }
            }

            // Apply reasonable caps to prevent unrealistic benefits
            const maxSchemeValue = 100000000; // 10 Cr maximum per scheme
            schemeValue = Math.min(schemeValue, maxSchemeValue);
            
            // Additional validation for unrealistic input values
            if (schemeValue > 1000000000) { // If somehow we get more than 100 Cr
                console.warn(`Unrealistic scheme value for ${scheme.scheme.name}: ${schemeValue}`);
                schemeValue = 100000000; // Cap at 10 Cr
            }
            
            benefits.push({
                scheme_name: scheme.scheme.name,
                benefit_description: benefitDescription,
                estimated_value: schemeValue
            });

            totalValue += schemeValue;
        });

        return {
            total_value: totalValue,
            benefits_breakdown: benefits
        };
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EligibilityEngine;
} 