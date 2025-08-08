const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database connection
const dbPath = path.join(__dirname, 'schemes.db');
const db = new sqlite3.Database(dbPath);

// Helper function to run SQL queries
function runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                console.error('Error executing query:', err);
                reject(err);
            } else {
                resolve(this);
            }
        });
    });
}

// Helper function to get last inserted ID
function getLastInsertId() {
    return new Promise((resolve, reject) => {
        db.get("SELECT last_insert_rowid() as id", (err, row) => {
            if (err) reject(err);
            else resolve(row.id);
        });
    });
}

// Scheme data
const schemes = [
    {
        scheme_id: 'ict-promotion-scheme',
        scheme_name: 'Promotion of Information & Communication Technology (ICT) Scheme',
        objective: 'Support for adoption of cloud-based ERP solutions by MSMEs in Haryana to enhance digital transformation and operational efficiency.',
        quantum_of_assistance: 'Financial support for ERP subscription costs and implementation.',
        commencement_and_applicability: 'Effective under Haryana MSME Policy 2019. Applicable to all MSMEs in Haryana.',
        eligibility_criteria: JSON.stringify([
            'Must be registered as Micro, Small, or Medium enterprise under MSME Act',
            'Unit must be located in any district of Haryana',
            'Must have valid Udyam Registration Number',
            'Must have valid Haryana Udhyam Memorandum (HUM) Number',
            'Must have subscribed to cloud-based ERP solution',
            'Must be in commercial production'
        ]),
        application_procedure: 'Submit Annexure-I application form with required documents. Processing time: 3-6 months.',
        competent_authority: 'Directorate of Industries, Haryana',
        penal_action: 'False submissions may result in rejection and legal action.',
        scheme_type: 'Haryana State',
        max_benefit_amount: null,
        benefit_percentage: null
    },
    {
        scheme_id: 'sme-exchange-equity',
        scheme_name: 'SME Exchange Equity Scheme',
        objective: 'To facilitate SMEs in raising capital via SME exchanges (NSE/BSE Emerge) for business expansion and growth.',
        quantum_of_assistance: 'Support for listing on SME exchanges and capital market access.',
        commencement_and_applicability: 'Effective under Haryana MSME Policy 2019. Applicable to all MSMEs in Haryana.',
        eligibility_criteria: JSON.stringify([
            'Must be registered as Micro, Small, or Medium enterprise under MSME Act',
            'Unit must be located in any district of Haryana',
            'Must have valid Udyam Registration Number',
            'Must have valid Haryana Udhyam Memorandum (HUM) Number',
            'Must be seeking listing on SME exchanges (NSE/BSE Emerge)',
            'Must have commenced commercial production',
            'Must have valid GST registration'
        ]),
        application_procedure: 'Submit Annexure-I application form with required documents. Processing time: 6-12 months.',
        competent_authority: 'Directorate of Industries, Haryana',
        penal_action: 'False submissions may result in rejection and legal action.',
        scheme_type: 'Haryana State',
        max_benefit_amount: null,
        benefit_percentage: null
    },
    {
        scheme_id: 'lean-manufacturing-competitiveness',
        scheme_name: 'State Mini Lean Manufacturing Competitiveness Scheme',
        objective: 'To implement lean manufacturing practices in MSME mini-clusters for cost and quality improvements.',
        quantum_of_assistance: 'Support for lean manufacturing implementation and cluster development.',
        commencement_and_applicability: 'Effective under Haryana MSME Policy 2019. Applicable to MSME mini-clusters in Haryana.',
        eligibility_criteria: JSON.stringify([
            'Must be registered as Micro or Small enterprise under MSME Act',
            'Unit must be located in any district of Haryana',
            'Must have valid Udyam Registration Number',
            'Must have valid Haryana Udhyam Memorandum (HUM) Number',
            'Must be part of a mini-cluster (up to 12 members)',
            'Must be willing to implement lean manufacturing practices',
            'Must be in commercial production'
        ]),
        application_procedure: 'Submit preliminary application with MoU and diagnostic study reports. Processing time: 4-8 months.',
        competent_authority: 'Directorate of Industries, Haryana',
        penal_action: 'False submissions may result in rejection and legal action.',
        scheme_type: 'Haryana State',
        max_benefit_amount: null,
        benefit_percentage: null
    },
    {
        scheme_id: 'mini-sfurti',
        scheme_name: 'State Mini Revamped Scheme Fund for Regeneration of Traditional Industries (Mini-SFURTI)',
        objective: 'Cluster development and common facility center establishment for rural/traditional sectors.',
        quantum_of_assistance: 'Support for cluster development and common facility centers.',
        commencement_and_applicability: 'Effective under Haryana MSME Policy 2019. Applicable to traditional industry clusters in Haryana.',
        eligibility_criteria: JSON.stringify([
            'Must be part of a traditional industry cluster',
            'Cluster must be located in Haryana',
            'Must be registered as Micro, Small, or Medium enterprise under MSME Act',
            'Must have valid Udyam Registration Number',
            'Must be part of SPV/Association',
            'Cluster must have minimum number of units/artisans',
            'Must be in traditional craft/industry sector'
        ]),
        application_procedure: 'Submit preliminary application with DSR and DPR. Processing time: 6-12 months.',
        competent_authority: 'Directorate of Industries, Haryana',
        penal_action: 'False submissions may result in rejection and legal action.',
        scheme_type: 'Haryana State',
        max_benefit_amount: null,
        benefit_percentage: null
    },
    {
        scheme_id: 'electricity-duty-reimbursement',
        scheme_name: 'Reimbursement of Electricity Duty',
        objective: 'To reduce initial financial burden on new MSMEs by reimbursing electricity duty for 7 years.',
        quantum_of_assistance: '100% reimbursement of electricity duty for 7 years from the date of commercial production.',
        commencement_and_applicability: 'Effective under Haryana MSME Policy 2019. Applicable to all MSMEs in Haryana.',
        eligibility_criteria: JSON.stringify([
            'Must be registered as Micro, Small, or Medium enterprise under MSME Act',
            'Unit must be located in any district of Haryana',
            'Must have valid Udyam Registration Number',
            'Must have valid Haryana Udhyam Memorandum (HUM) Number',
            'Must have started commercial production after policy implementation',
            'Must have valid electricity connection and be paying electricity duty',
            'Must not be in restrictive/negative list'
        ]),
        application_procedure: 'Submit Annexure-I application form with required documents. Processing time: 3-6 months.',
        competent_authority: 'Directorate of Industries, Haryana',
        penal_action: 'False submissions may result in rejection and legal action.',
        scheme_type: 'Haryana State',
        max_benefit_amount: null,
        benefit_percentage: 100.00
    },
    {
        scheme_id: 'stamp-duty-refund',
        scheme_name: 'Refund of Stamp Duty',
        objective: 'Refund of eligible stamp duty on purchase/leasing of land for new MSEs.',
        quantum_of_assistance: 'Refund of stamp duty paid on land purchase/leasing based on block category classification.',
        commencement_and_applicability: 'Effective under Haryana MSME Policy 2019. Applicable to new MSEs in Haryana.',
        eligibility_criteria: JSON.stringify([
            'Must be registered as Micro, Small, or Medium enterprise under MSME Act',
            'Unit must be located in any district of Haryana',
            'Must have valid Udyam Registration Number',
            'Must have valid Haryana Udhyam Memorandum (HUM) Number',
            'Must be a new MSE (Micro and Small Enterprise)',
            'Must have purchased/leased land for industrial purpose',
            'Must have paid stamp duty on land transaction',
            'Must have valid sale deed/lease deed and mutation'
        ]),
        application_procedure: 'Submit application form with required documents. Processing time: 3-6 months.',
        competent_authority: 'Directorate of Industries, Haryana',
        penal_action: 'False submissions may result in rejection and legal action.',
        scheme_type: 'Haryana State',
        max_benefit_amount: null,
        benefit_percentage: null
    },
    {
        scheme_id: 'promoting-green-sustainable-production',
        scheme_name: 'Promoting Green and Sustainable Production Scheme',
        objective: 'To implement the concept of "Promoting Green & Sustainable Production" by providing financial assistance for setting up Effluent Treatment Plant (ETP), Zero Liquid Discharge (ZLD) and installation of solar rooftops for new and existing Textile Micro, Small and Medium Enterprises of Haryana.',
        quantum_of_assistance: JSON.stringify([
            'ETP Support: 70% in C category blocks and 75% in D category blocks, max INR 1 Crore',
            'ZLD Support: 40% in A category, 50% in B category, 60% in C category, 75% in D category blocks, max INR 10 Crore',
            'Solar Rooftop: 30% max INR 20 lakh in A/B blocks, 50% max INR 40 lakh in C blocks, 50% max INR 50 lakh in D blocks'
        ]),
        commencement_and_applicability: 'Scheme commenced from 19.12.2022 and remains in operation for 3 years. Assistance admissible on equipment purchased and installed between 19.12.2022 and 18.12.2025.',
        eligibility_criteria: JSON.stringify([
            'Must have filed Udhyam Registration Certificate (URC) and Haryana Udhyam Memorandum (HUM)',
            'Must have obtained NOC/CLU from competent Authority, if applicable',
            'Must be in commercial production (subsidy not released to closed units)',
            'Must be a textile manufacturing unit engaged in value chain activities',
            'Enterprises availing incentives under this policy will not be eligible for similar incentives under HEEP 2020',
            'Must be Micro, Small, or Medium enterprise as per MSMED Act, 2006'
        ]),
        application_procedure: 'Submit application on prescribed Form (Annexure-1) with listed documents to Director General, Directorate of MSME within 4 months of installation or from date of notification, whichever is later. Processing time: 3-6 months.',
        competent_authority: 'State Level Steering Committee for Textile under Administrative Secretary, Industries & Commerce Department, Haryana',
        penal_action: 'If false information is found, applicant shall refund assistance with compound interest @ 12% per annum, face legal action, and be debarred from future incentives. Amount shall be recovered as arrear of land revenue.',
        scheme_type: 'Haryana State',
        max_benefit_amount: 100000000.00,
        benefit_percentage: 75.00
    }
];

// Required documents for each scheme
const requiredDocuments = {
    'ict-promotion-scheme': [
        { document_name: 'HUM and Udyam Registration Certificate', description: 'Haryana Udhyam Memorandum and Udyam Registration Certificate', mandatory: 1, category: 'Registration' },
        { document_name: 'Declaration by the applicant (Annexure II)', description: 'Signed declaration form as per Annexure II', mandatory: 1, category: 'Legal' },
        { document_name: 'Certificate of Incorporation/Partnership deed', description: 'Legal constitution document of the enterprise', mandatory: 1, category: 'Legal' },
        { document_name: 'Board resolution/POA', description: 'Board resolution or Power of Attorney for authorized person', mandatory: 1, category: 'Legal' },
        { document_name: 'Change of Land Use/NOC (if applicable)', description: 'CLU certificate or NOC if applicable', mandatory: 0, category: 'Legal' },
        { document_name: 'CA Certificate on expenses (Annexure III)', description: 'Chartered Accountant certificate for ERP expenses', mandatory: 1, category: 'Financial' },
        { document_name: 'Audited balance sheet (if applicable)', description: 'Audited financial statements if applicable', mandatory: 0, category: 'Financial' },
        { document_name: 'ERP subscription agreement copy', description: 'Copy of ERP service provider agreement', mandatory: 1, category: 'Technical' },
        { document_name: 'Invoices and payment receipts for ERP solution', description: 'All invoices and payment receipts for ERP subscription', mandatory: 1, category: 'Financial' }
    ],
    'sme-exchange-equity': [
        { document_name: 'Certificate of Incorporation/Partnership deed', description: 'Legal constitution document of the enterprise', mandatory: 1, category: 'Legal' },
        { document_name: 'Board resolution/Power of attorney', description: 'Board resolution or Power of Attorney for authorized person', mandatory: 1, category: 'Legal' },
        { document_name: 'HUM and Udyam Registration Certificate', description: 'Haryana Udhyam Memorandum and Udyam Registration Certificate', mandatory: 1, category: 'Registration' },
        { document_name: 'CLU/NOC (if applicable)', description: 'Change of Land Use certificate or NOC if applicable', mandatory: 0, category: 'Legal' },
        { document_name: 'Statement of Expenditure (with vouchers/bills)', description: 'Detailed statement of listing expenses with supporting documents', mandatory: 1, category: 'Financial' },
        { document_name: 'SME Exchange Registration copy', description: 'Copy of registration with SME exchange', mandatory: 1, category: 'Legal' },
        { document_name: 'Application Form for Equity Capital issue', description: 'Application form submitted to SME exchange', mandatory: 1, category: 'Legal' },
        { document_name: 'Public issue brochure', description: 'Brochure for public issue of equity', mandatory: 1, category: 'Legal' },
        { document_name: 'CA Certificate for listing expenses', description: 'Chartered Accountant certificate for listing expenses', mandatory: 1, category: 'Financial' },
        { document_name: 'Recent sale bill, bank details, PAN', description: 'Recent sale bill, bank account details, and PAN card', mandatory: 1, category: 'Financial' },
        { document_name: 'Audited balance sheet', description: 'Audited financial statements', mandatory: 1, category: 'Financial' },
        { document_name: 'Declaration form', description: 'Signed declaration form', mandatory: 1, category: 'Legal' }
    ],
    'lean-manufacturing-competitiveness': [
        { document_name: 'MoU between units for SPV formation', description: 'Memorandum of Understanding between cluster units for SPV formation', mandatory: 1, category: 'Legal' },
        { document_name: 'Power of attorney for nodal officer', description: 'Power of Attorney for the designated nodal officer', mandatory: 1, category: 'Legal' },
        { document_name: 'HUM and Udyam Registration Certificate', description: 'Haryana Udhyam Memorandum and Udyam Registration Certificate', mandatory: 1, category: 'Registration' },
        { document_name: 'Diagnostic Study Reports', description: 'Reports from diagnostic study of the mini-cluster', mandatory: 1, category: 'Technical' },
        { document_name: 'Milestone Reports', description: 'Progress reports on implementation milestones', mandatory: 1, category: 'Technical' },
        { document_name: 'Cluster Member Details', description: 'Complete details of all cluster members (up to 12)', mandatory: 1, category: 'Registration' }
    ],
    'mini-sfurti': [
        { document_name: 'List of SPV members', description: 'Complete list of Special Purpose Vehicle members', mandatory: 1, category: 'Legal' },
        { document_name: 'Artisan/weaver registration', description: 'Registration details of artisans/weavers in the cluster', mandatory: 1, category: 'Registration' },
        { document_name: 'HUM and URC details', description: 'Haryana Udhyam Memorandum and Udyam Registration Certificate details', mandatory: 1, category: 'Registration' },
        { document_name: 'Detailed Project Report (DPR)', description: 'Comprehensive project report for cluster development', mandatory: 1, category: 'Technical' },
        { document_name: 'Diagnostic Study Report (DSR)', description: 'Diagnostic study report of the traditional cluster', mandatory: 1, category: 'Technical' },
        { document_name: 'Land identification documents', description: 'Documents related to land identification and availability', mandatory: 1, category: 'Legal' }
    ],
    'electricity-duty-reimbursement': [
        { document_name: 'HUM & Udyam Certificate', description: 'Haryana Udhyam Memorandum and Udyam Registration Certificate', mandatory: 1, category: 'Registration' },
        { document_name: 'CA Certificate for plant/machinery investment', description: 'Chartered Accountant certificate for plant and machinery investment', mandatory: 1, category: 'Financial' },
        { document_name: 'First sale bill', description: 'First sale bill after commencement of commercial production', mandatory: 1, category: 'Financial' },
        { document_name: 'Declaration', description: 'Signed declaration form', mandatory: 1, category: 'Legal' },
        { document_name: 'Electricity connection details', description: 'Details of electricity connection and bills', mandatory: 1, category: 'Technical' },
        { document_name: 'Commercial Production Certificate', description: 'Certificate from competent authority for commercial production', mandatory: 1, category: 'Legal' },
        { document_name: 'Bank Statement', description: 'Last 6 months bank statements', mandatory: 1, category: 'Financial' },
        { document_name: 'GST Registration Certificate', description: 'GST registration certificate', mandatory: 1, category: 'Registration' }
    ],
    'stamp-duty-refund': [
        { document_name: 'HUM and URC', description: 'Haryana Udhyam Memorandum and Udyam Registration Certificate', mandatory: 1, category: 'Registration' },
        { document_name: 'Sale deed/lease deed; mutation; land map', description: 'Original sale deed or lease deed with mutation and land map', mandatory: 1, category: 'Legal' },
        { document_name: 'First sale bill', description: 'First sale bill after commencement of commercial production', mandatory: 1, category: 'Financial' },
        { document_name: 'NOC/CLU', description: 'No Objection Certificate or Change of Land Use certificate', mandatory: 1, category: 'Legal' },
        { document_name: 'Partnership deed, PoA if any', description: 'Partnership deed or Power of Attorney if applicable', mandatory: 0, category: 'Legal' },
        { document_name: 'Signed declaration/undertaking', description: 'Signed declaration and undertaking form', mandatory: 1, category: 'Legal' }
    ],
    'promoting-green-sustainable-production': [
        { document_name: 'Udhyam Registration Certificate (URC) and Haryana Udhyam Memorandum (HUM)', description: 'Latest URC and HUM certificates', mandatory: 1, category: 'Registration' },
        { document_name: 'Certificate of Incorporation/Registered Partnership deed', description: 'Legal constitution documents of the organization', mandatory: 1, category: 'Legal' },
        { document_name: 'Board resolution/Power of attorney', description: 'Board resolution or Power of Attorney for authorized person', mandatory: 1, category: 'Legal' },
        { document_name: 'CA certificate of details of Expenditure incurred', description: 'Chartered Accountant certificate for expenditure details (in original)', mandatory: 1, category: 'Financial' },
        { document_name: 'Copy of invoices', description: 'All invoices for equipment and installation', mandatory: 1, category: 'Financial' },
        { document_name: 'Installation/completion certificate from empanelled vendor', description: 'Certificate from MNRE/HAREDA empanelled vendor or equivalent competent agency for solar rooftop', mandatory: 1, category: 'Technical' },
        { document_name: 'Certificate from Regional Officer of Haryana Pollution Control Board', description: 'Certificate for ETP/ZLD from Haryana State Pollution Control Board (Annexure-5)', mandatory: 1, category: 'Technical' },
        { document_name: 'Change of Land Use (CLU)/NOC from competent authority', description: 'CLU certificate or NOC if applicable', mandatory: 0, category: 'Legal' },
        { document_name: 'Copy of GST return/Audited Balance Sheet', description: 'GST return or audited balance sheet for last financial year', mandatory: 1, category: 'Financial' },
        { document_name: 'Declaration form', description: 'Declaration that organization has not obtained/applied for grant/subsidy from any other Ministry/Department for same purpose', mandatory: 1, category: 'Legal' },
        { document_name: 'Detailed Project Report (DPR) - for ZLD only', description: 'Detailed Project Report for Zero Liquid Discharge projects', mandatory: 0, category: 'Technical' },
        { document_name: 'Memorandum and Articles of Association and Bye laws', description: 'Memorandum and Articles of Association and Bye laws of the society (If applicable)', mandatory: 0, category: 'Legal' },
        { document_name: 'Land title documents', description: 'Sale deed or registered lease deed for at least 10 years period', mandatory: 0, category: 'Legal' },
        { document_name: 'CA certificate regarding proposed project cost and means of finance', description: 'Chartered Accountant certificate for project cost and financing', mandatory: 0, category: 'Financial' },
        { document_name: 'Designs and implementation scheme of ZLD approved from competent authority', description: 'ZLD designs and implementation scheme approval', mandatory: 0, category: 'Technical' },
        { document_name: 'Quotations from suppliers/vendors', description: 'Quotations from suppliers/vendors of plant & machinery and equipments', mandatory: 0, category: 'Technical' }
    ]
};

// Form fields for application forms
const formFields = {
    'ict-promotion-scheme': [
        { field_name: 'applicant_name', field_type: 'text', field_label: 'Name of the applicant (Authorized person)', required: 1, description: 'Name of the authorized person', field_order: 1, field_group: 'basic_info' },
        { field_name: 'enterprise_name_address', field_type: 'textarea', field_label: 'Name & address of the enterprise (phone/email)', required: 1, description: 'Complete enterprise details with contact information', field_order: 2, field_group: 'basic_info' },
        { field_name: 'registered_office_address', field_type: 'textarea', field_label: 'Registered Office address', required: 1, description: 'Registered office address of the enterprise', field_order: 3, field_group: 'basic_info' },
        { field_name: 'block_name_category', field_type: 'select', field_label: 'Block name and block category (A/B/C/D)', required: 1, description: 'Block name and category classification', field_order: 4, field_group: 'basic_info', options: JSON.stringify(['A', 'B', 'C', 'D']) },
        { field_name: 'unit_category', field_type: 'select', field_label: 'Category of the unit (Micro/Small/Medium)', required: 1, description: 'MSME unit category classification', field_order: 5, field_group: 'basic_info', options: JSON.stringify(['Micro', 'Small', 'Medium']) },
        { field_name: 'udyam_registration_number', field_type: 'text', field_label: 'Udyam Registration Number & date', required: 1, description: 'Udyam registration number and date', field_order: 6, field_group: 'registration_info' },
        { field_name: 'hum_number_date', field_type: 'text', field_label: 'Haryana Udhyam Memorandum (HUM) No. & date', required: 1, description: 'HUM number and date', field_order: 7, field_group: 'registration_info' },
        { field_name: 'erp_subscription_start_date', field_type: 'date', field_label: 'Date of ERP subscription start', required: 1, description: 'Date when ERP subscription started', field_order: 8, field_group: 'technical_info' },
        { field_name: 'manufacturing_item', field_type: 'text', field_label: 'Item of manufacture/processing', required: 1, description: 'Primary item of manufacture or processing', field_order: 9, field_group: 'business_info' },
        { field_name: 'erp_service_provider', field_type: 'text', field_label: 'ERP service provider name', required: 1, description: 'Name of the ERP service provider', field_order: 10, field_group: 'technical_info' },
        { field_name: 'erp_modules_services', field_type: 'textarea', field_label: 'ERP modules/services covered', required: 1, description: 'List of ERP modules and services covered', field_order: 11, field_group: 'technical_info' },
        { field_name: 'annual_subscription_fee', field_type: 'number', field_label: 'Total annual subscription fee paid', required: 1, description: 'Total annual subscription fee amount', field_order: 12, field_group: 'financial_info' },
        { field_name: 'first_payment_date', field_type: 'date', field_label: 'Date of first subscription payment', required: 1, description: 'Date of first subscription payment', field_order: 13, field_group: 'financial_info' },
        { field_name: 'bank_account_details', field_type: 'textarea', field_label: 'Bank account details (name, number, IFSC, address)', required: 1, description: 'Complete bank account details', field_order: 14, field_group: 'financial_info' },
        { field_name: 'subsidy_claimed', field_type: 'number', field_label: 'Quantum of subsidy claimed', required: 1, description: 'Amount of subsidy being claimed', field_order: 15, field_group: 'financial_info' }
    ],
    'sme-exchange-equity': [
        { field_name: 'applicant_name', field_type: 'text', field_label: 'Name of applicant (Authorized person)', required: 1, description: 'Name of the authorized person', field_order: 1, field_group: 'basic_info' },
        { field_name: 'enterprise_name_address', field_type: 'textarea', field_label: 'Name & address of enterprise (phone/email)', required: 1, description: 'Complete enterprise details with contact information', field_order: 2, field_group: 'basic_info' },
        { field_name: 'registered_office_address', field_type: 'textarea', field_label: 'Registered office address', required: 1, description: 'Registered office address of the enterprise', field_order: 3, field_group: 'basic_info' },
        { field_name: 'enterprise_type', field_type: 'select', field_label: 'Type of enterprise', required: 1, description: 'Type of enterprise constitution', field_order: 4, field_group: 'basic_info', options: JSON.stringify(['Proprietorship', 'Partnership', 'Private Limited', 'Public Limited', 'LLP']) },
        { field_name: 'udyam_registration_number', field_type: 'text', field_label: 'Udyam Registration Number & date', required: 1, description: 'Udyam registration number and date', field_order: 5, field_group: 'registration_info' },
        { field_name: 'hum_number_date', field_type: 'text', field_label: 'Haryana Udhyam Memorandum (HUM) No. & date', required: 1, description: 'HUM number and date', field_order: 6, field_group: 'registration_info' },
        { field_name: 'commercial_production_date', field_type: 'date', field_label: 'Date of commercial production (as per first sale bill)', required: 1, description: 'Date of commencement of commercial production', field_order: 7, field_group: 'business_info' },
        { field_name: 'production_proof', field_type: 'file', field_label: 'Proof for commencement of production (recent sale bill)', required: 1, description: 'Recent sale bill as proof of production', field_order: 8, field_group: 'business_info' },
        { field_name: 'production_item', field_type: 'text', field_label: 'Item of production', required: 1, description: 'Primary item of production', field_order: 9, field_group: 'business_info' },
        { field_name: 'sme_exchange_name', field_type: 'text', field_label: 'Name of SME Exchange', required: 1, description: 'Name of the SME exchange (NSE/BSE Emerge)', field_order: 10, field_group: 'exchange_info' },
        { field_name: 'exchange_registration', field_type: 'file', field_label: 'SME Exchange Registration/Permission copy', required: 1, description: 'Copy of SME exchange registration or permission', field_order: 11, field_group: 'exchange_info' },
        { field_name: 'registrar_banker_details', field_type: 'textarea', field_label: 'Registrar and Banker of Capital Issue details', required: 1, description: 'Details of registrar and banker for capital issue', field_order: 12, field_group: 'exchange_info' },
        { field_name: 'total_project_cost', field_type: 'number', field_label: 'Total project/listing cost', required: 1, description: 'Total cost of the project or listing', field_order: 13, field_group: 'financial_info' },
        { field_name: 'means_of_finance', field_type: 'textarea', field_label: 'Means of finance', required: 1, description: 'Details of means of finance', field_order: 14, field_group: 'financial_info' },
        { field_name: 'capital_issue_date', field_type: 'date', field_label: 'Date of capital issue published', required: 1, description: 'Date when capital issue was published', field_order: 15, field_group: 'exchange_info' },
        { field_name: 'equity_capital_arranged', field_type: 'number', field_label: 'Amount of equity capital arranged', required: 1, description: 'Amount of equity capital arranged', field_order: 16, field_group: 'financial_info' }
    ],
    'lean-manufacturing-competitiveness': [
        { field_name: 'unit_name_owner', field_type: 'text', field_label: 'Unit\'s Name and Owner', required: 1, description: 'Name of the unit and owner', field_order: 1, field_group: 'basic_info' },
        { field_name: 'unit_category', field_type: 'select', field_label: 'Category of Unit (Micro/Small)', required: 1, description: 'MSME unit category classification', field_order: 2, field_group: 'basic_info', options: JSON.stringify(['Micro', 'Small']) },
        { field_name: 'establishment_year', field_type: 'number', field_label: 'Year of Establishment', required: 1, description: 'Year when the unit was established', field_order: 3, field_group: 'basic_info' },
        { field_name: 'unit_address', field_type: 'textarea', field_label: 'Address of Unit', required: 1, description: 'Complete address of the unit', field_order: 4, field_group: 'basic_info' },
        { field_name: 'turnover', field_type: 'number', field_label: 'Turnover', required: 0, description: 'Annual turnover of the unit', field_order: 5, field_group: 'financial_info' },
        { field_name: 'contact_details_email', field_type: 'text', field_label: 'Contact Details & Email', required: 1, description: 'Contact details and email address', field_order: 6, field_group: 'basic_info' },
        { field_name: 'business_activity', field_type: 'text', field_label: 'Business Activity', required: 1, description: 'Primary business activity', field_order: 7, field_group: 'business_info' },
        { field_name: 'entrepreneur_category', field_type: 'select', field_label: 'Category of Entrepreneur', required: 0, description: 'Category of entrepreneur', field_order: 8, field_group: 'basic_info', options: JSON.stringify(['General', 'SC', 'ST', 'OBC', 'Women', 'Differently Abled']) },
        { field_name: 'udyam_registration_number', field_type: 'text', field_label: 'Udyam Registration Number & date', required: 1, description: 'Udyam registration number and date', field_order: 9, field_group: 'registration_info' },
        { field_name: 'hum_number_date', field_type: 'text', field_label: 'Haryana Udhyam Memorandum (HUM) No. & date', required: 1, description: 'HUM number and date', field_order: 10, field_group: 'registration_info' },
        { field_name: 'number_of_employees', field_type: 'number', field_label: 'Number of Employees', required: 0, description: 'Number of employees in the unit', field_order: 11, field_group: 'business_info' }
    ],
    'mini-sfurti': [
        { field_name: 'cluster_name', field_type: 'text', field_label: 'Name of Cluster', required: 1, description: 'Name of the traditional industry cluster', field_order: 1, field_group: 'basic_info' },
        { field_name: 'cluster_location', field_type: 'text', field_label: 'Location (village/block)', required: 1, description: 'Location of the cluster (village and block)', field_order: 2, field_group: 'basic_info' },
        { field_name: 'cluster_category', field_type: 'select', field_label: 'Category (Heritage/Major/Mini)', required: 1, description: 'Category of the cluster', field_order: 3, field_group: 'basic_info', options: JSON.stringify(['Heritage', 'Major', 'Mini']) },
        { field_name: 'sector_type', field_type: 'select', field_label: 'Sector (Craft/Industry)', required: 1, description: 'Sector type of the cluster', field_order: 4, field_group: 'basic_info', options: JSON.stringify(['Craft', 'Industry']) },
        { field_name: 'cluster_products', field_type: 'textarea', field_label: 'Cluster Products', required: 1, description: 'Products manufactured by the cluster', field_order: 5, field_group: 'business_info' },
        { field_name: 'number_of_units', field_type: 'number', field_label: 'Number of Units/Artisans', required: 1, description: 'Number of units or artisans in the cluster', field_order: 6, field_group: 'business_info' },
        { field_name: 'women_sc_st_units', field_type: 'number', field_label: 'Women/SC/ST owned units', required: 0, description: 'Number of women/SC/ST owned units', field_order: 7, field_group: 'business_info' },
        { field_name: 'spv_association_details', field_type: 'textarea', field_label: 'SPV/Association details', required: 1, description: 'Details of Special Purpose Vehicle or Association', field_order: 8, field_group: 'legal_info' },
        { field_name: 'proposed_interventions', field_type: 'textarea', field_label: 'Proposed Interventions', required: 1, description: 'Proposed interventions for cluster development', field_order: 9, field_group: 'project_info' },
        { field_name: 'estimated_project_cost', field_type: 'number', field_label: 'Estimated Project Cost', required: 1, description: 'Estimated cost of the project', field_order: 10, field_group: 'financial_info' },
        { field_name: 'land_identified', field_type: 'text', field_label: 'Land identified/available', required: 1, description: 'Land identification and availability details', field_order: 11, field_group: 'project_info' },
        { field_name: 'expected_outcomes', field_type: 'textarea', field_label: 'Expected Outcomes', required: 1, description: 'Expected outcomes from the project', field_order: 12, field_group: 'project_info' }
    ],
    'electricity-duty-reimbursement': [
        { field_name: 'applicant_name_address', field_type: 'textarea', field_label: 'Name and address of applicant/unit', required: 1, description: 'Name and complete address of the applicant/unit', field_order: 1, field_group: 'basic_info' },
        { field_name: 'unit_constitution', field_type: 'select', field_label: 'Constitution of unit', required: 1, description: 'Constitution of the unit', field_order: 2, field_group: 'basic_info', options: JSON.stringify(['Proprietorship', 'Partnership', 'Private Limited', 'Public Limited', 'LLP', 'Cooperative Society']) },
        { field_name: 'block_category', field_type: 'select', field_label: 'Block and category', required: 1, description: 'Block name and category classification', field_order: 3, field_group: 'basic_info', options: JSON.stringify(['A', 'B', 'C', 'D']) },
        { field_name: 'unit_category', field_type: 'select', field_label: 'Unit category (Micro/Small/Medium)', required: 1, description: 'MSME unit category classification', field_order: 4, field_group: 'basic_info', options: JSON.stringify(['Micro', 'Small', 'Medium']) },
        { field_name: 'udyam_registration_number', field_type: 'text', field_label: 'Udyam Registration Number & date', required: 1, description: 'Udyam registration number and date', field_order: 5, field_group: 'registration_info' },
        { field_name: 'hum_number_date', field_type: 'text', field_label: 'HUM No. & date', required: 1, description: 'HUM number and date', field_order: 6, field_group: 'registration_info' },
        { field_name: 'commercial_production_date', field_type: 'date', field_label: 'Date of commercial production', required: 1, description: 'Date of commencement of commercial production', field_order: 7, field_group: 'business_info' },
        { field_name: 'manufacturing_item', field_type: 'text', field_label: 'Item of manufacture/processing', required: 1, description: 'Primary item of manufacture or processing', field_order: 8, field_group: 'business_info' },
        { field_name: 'fixed_capital_investment', field_type: 'number', field_label: 'Fixed capital investment breakdown', required: 1, description: 'Breakdown of fixed capital investment', field_order: 9, field_group: 'financial_info' },
        { field_name: 'electricity_connection_date', field_type: 'date', field_label: 'Date of electricity connection release', required: 1, description: 'Date when electricity connection was released', field_order: 10, field_group: 'technical_info' },
        { field_name: 'connected_load', field_type: 'number', field_label: 'Connected load', required: 1, description: 'Connected load in KW', field_order: 11, field_group: 'technical_info' },
        { field_name: 'restrictive_list_status', field_type: 'checkbox', field_label: 'Restrictive/Negative List status', required: 1, description: 'Whether unit is in restrictive/negative list', field_order: 12, field_group: 'business_info' },
        { field_name: 'reimbursement_period', field_type: 'number', field_label: 'Period for reimbursement', required: 1, description: 'Period for which reimbursement is claimed (in years)', field_order: 13, field_group: 'financial_info' }
    ],
    'stamp-duty-refund': [
        { field_name: 'applicant_name', field_type: 'text', field_label: 'Name of applicant', required: 1, description: 'Name of the applicant', field_order: 1, field_group: 'basic_info' },
        { field_name: 'udyam_registration_number', field_type: 'text', field_label: 'Udyam Registration No. & date', required: 1, description: 'Udyam registration number and date', field_order: 2, field_group: 'registration_info' },
        { field_name: 'hum_number_date', field_type: 'text', field_label: 'HUM No. & date', required: 1, description: 'HUM number and date', field_order: 3, field_group: 'registration_info' },
        { field_name: 'unit_details_address', field_type: 'textarea', field_label: 'Unit details and address', required: 1, description: 'Complete unit details and address', field_order: 4, field_group: 'basic_info' },
        { field_name: 'land_khasra_details', field_type: 'textarea', field_label: 'Land and khasra details', required: 1, description: 'Land details and khasra number', field_order: 5, field_group: 'land_info' },
        { field_name: 'registration_date', field_type: 'date', field_label: 'Date of registration/sale deed, mutation', required: 1, description: 'Date of registration, sale deed, or mutation', field_order: 6, field_group: 'legal_info' },
        { field_name: 'stamp_duty_amount', field_type: 'number', field_label: 'Stamp duty amount paid', required: 1, description: 'Amount of stamp duty paid', field_order: 7, field_group: 'financial_info' },
        { field_name: 'bank_account_details', field_type: 'textarea', field_label: 'Bank and account details', required: 1, description: 'Complete bank and account details', field_order: 8, field_group: 'financial_info' },
        { field_name: 'aadhaar_number', field_type: 'text', field_label: 'Aadhaar of owners/directors', required: 1, description: 'Aadhaar number of owners or directors', field_order: 9, field_group: 'basic_info' }
    ],
    'promoting-green-sustainable-production': [
        { field_name: 'applicant_name', field_type: 'text', field_label: 'Name of the applicant (Authorized person of the unit)', required: 1, description: 'Name of the authorized person', field_order: 1, field_group: 'basic_info' },
        { field_name: 'unit_name_address', field_type: 'textarea', field_label: 'Name & Address of the unit with telephone No. and e-mail', required: 1, description: 'Complete unit details with contact information', field_order: 2, field_group: 'basic_info' },
        { field_name: 'registered_office_address', field_type: 'textarea', field_label: 'Registered office address', required: 1, description: 'Registered office address of the unit', field_order: 3, field_group: 'basic_info' },
        { field_name: 'block_name_category', field_type: 'select', field_label: 'Name of the block in which unit is located and category of block i.e., A, B, C, D', required: 1, description: 'Block name and category classification', field_order: 4, field_group: 'basic_info', options: JSON.stringify(['A', 'B', 'C', 'D']) },
        { field_name: 'udyam_registration_number', field_type: 'text', field_label: 'Udhyam Registration Certificate (URC) and Haryana Udhyam Memorandum (HUM) No. with date', required: 1, description: 'URC and HUM numbers with dates', field_order: 5, field_group: 'registration_info' },
        { field_name: 'manufacturing_item', field_type: 'text', field_label: 'Item of manufacture/processing', required: 1, description: 'Primary item of manufacture or processing', field_order: 6, field_group: 'business_info' },
        { field_name: 'unit_category', field_type: 'select', field_label: 'Category of the unit (Micro/Small/Medium)', required: 1, description: 'MSME unit category classification', field_order: 7, field_group: 'basic_info', options: JSON.stringify(['Micro', 'Small', 'Medium']) },
        { field_name: 'etp_equipment_cost', field_type: 'number', field_label: 'Cost of ETP equipment(s)', required: 0, description: 'Cost of new Effluent Treatment Plant equipment', field_order: 8, field_group: 'etp_info' },
        { field_name: 'etp_civil_works_cost', field_type: 'number', field_label: 'Cost of Civil Works for ETP', required: 0, description: 'Cost of civil works for ETP', field_order: 9, field_group: 'etp_info' },
        { field_name: 'zld_equipment_cost', field_type: 'number', field_label: 'Proposed cost of ZLD equipment(s)', required: 0, description: 'Proposed cost of Zero Liquid Discharge equipment', field_order: 10, field_group: 'zld_info' },
        { field_name: 'zld_civil_work_cost', field_type: 'number', field_label: 'Proposed cost of Civil Work for ZLD', required: 0, description: 'Proposed cost of civil work for ZLD', field_order: 11, field_group: 'zld_info' },
        { field_name: 'solar_equipment_cost', field_type: 'number', field_label: 'Cost of Solar rooftop equipment(s)', required: 0, description: 'Cost of solar rooftop equipment', field_order: 12, field_group: 'solar_info' },
        { field_name: 'solar_civil_work_cost', field_type: 'number', field_label: 'Cost of Civil Work for Solar', required: 0, description: 'Cost of civil work for solar rooftop', field_order: 13, field_group: 'solar_info' },
        { field_name: 'total_project_cost', field_type: 'number', field_label: 'Total project cost', required: 1, description: 'Total cost of the project', field_order: 14, field_group: 'financial_info' },
        { field_name: 'assistance_claimed', field_type: 'number', field_label: 'Assistance claimed', required: 1, description: 'Amount of assistance being claimed', field_order: 15, field_group: 'financial_info' },
        { field_name: 'bank_account_details', field_type: 'textarea', field_label: 'Bank account details (name, number, IFSC, address)', required: 1, description: 'Complete bank account details', field_order: 16, field_group: 'financial_info' },
        { field_name: 'installation_date', field_type: 'date', field_label: 'Date of installation/completion', required: 1, description: 'Date of installation or completion of the project', field_order: 17, field_group: 'project_info' },
        { field_name: 'commercial_production_date', field_type: 'date', field_label: 'Date of commercial production', required: 1, description: 'Date of commencement of commercial production', field_order: 18, field_group: 'business_info' },
        { field_name: 'project_type', field_type: 'select', field_label: 'Type of project (ETP/ZLD/Solar Rooftop)', required: 1, description: 'Type of green project being implemented', field_order: 19, field_group: 'project_info', options: JSON.stringify(['ETP', 'ZLD', 'Solar Rooftop', 'Combination']) }
    ]
};

// Main seeding function
async function seedDatabase() {
    try {
        console.log('Starting database seeding...');

        // Insert schemes
        for (const scheme of schemes) {
            await runQuery(`
                INSERT INTO schemes (
                    scheme_id, scheme_name, objective, quantum_of_assistance,
                    commencement_and_applicability, eligibility_criteria, application_procedure,
                    competent_authority, penal_action, scheme_type, max_benefit_amount, benefit_percentage
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                scheme.scheme_id, scheme.scheme_name, scheme.objective, scheme.quantum_of_assistance,
                scheme.commencement_and_applicability, scheme.eligibility_criteria, scheme.application_procedure,
                scheme.competent_authority, scheme.penal_action, scheme.scheme_type, scheme.max_benefit_amount, scheme.benefit_percentage
            ]);
            console.log(`Inserted scheme: ${scheme.scheme_name}`);

            // Insert required documents for this scheme
            const documents = requiredDocuments[scheme.scheme_id] || [];
            for (const doc of documents) {
                await runQuery(`
                    INSERT INTO required_documents (
                        document_id, scheme_id, document_name, description, mandatory, document_category
                    ) VALUES (?, ?, ?, ?, ?, ?)
                `, [
                    `${scheme.scheme_id}_${doc.document_name.replace(/\s+/g, '_').toLowerCase()}`,
                    scheme.scheme_id, doc.document_name, doc.description, doc.mandatory, doc.category
                ]);
            }

            // Insert form for this scheme
            await runQuery(`
                INSERT INTO forms (form_id, scheme_id, form_name, description, form_type)
                VALUES (?, ?, ?, ?, ?)
            `, [
                `${scheme.scheme_id}_application_form`,
                scheme.scheme_id,
                'Application Form',
                `Application form for ${scheme.scheme_name}`,
                'application'
            ]);

            // Insert form fields for this scheme
            const fields = formFields[scheme.scheme_id] || [];
            for (const field of fields) {
                const fieldLabel = field.field_label || field.field_name;
                await runQuery(`
                    INSERT INTO form_fields (
                        field_id, form_id, field_name, field_type, field_label, required, description, field_order, field_group, options
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    `${scheme.scheme_id}_${field.field_name.replace(/\s+/g, '_').toLowerCase()}`,
                    `${scheme.scheme_id}_application_form`,
                    field.field_name, field.field_type, fieldLabel, field.required, field.description,
                    field.field_order, field.field_group, field.options || null
                ]);
            }

            // Map scheme to categories
            if (scheme.scheme_type === 'Haryana State') {
                await runQuery(`
                    INSERT INTO scheme_category_mapping (scheme_id, category_id)
                    VALUES (?, ?)
                `, [scheme.scheme_id, 'haryana_state']);
            } else {
                await runQuery(`
                    INSERT INTO scheme_category_mapping (scheme_id, category_id)
                    VALUES (?, ?)
                `, [scheme.scheme_id, 'national_msme']);
            }
        }

        console.log('Database seeding completed successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        db.close();
    }
}

// Run the seeding
seedDatabase(); 