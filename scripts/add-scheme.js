const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, '..', 'server', 'database', 'schemes.db'));

console.log('Adding new scheme to database...');

// Add the new scheme
const newScheme = {
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
};

// Insert the scheme
db.run(`
    INSERT INTO schemes (
        scheme_id, scheme_name, objective, quantum_of_assistance,
        commencement_and_applicability, eligibility_criteria, application_procedure,
        competent_authority, penal_action, scheme_type, max_benefit_amount, benefit_percentage
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`, [
    newScheme.scheme_id, newScheme.scheme_name, newScheme.objective, newScheme.quantum_of_assistance,
    newScheme.commencement_and_applicability, newScheme.eligibility_criteria, newScheme.application_procedure,
    newScheme.competent_authority, newScheme.penal_action, newScheme.scheme_type, newScheme.max_benefit_amount, newScheme.benefit_percentage
], function(err) {
    if (err) {
        console.error('Error inserting scheme:', err);
    } else {
        console.log('Scheme inserted successfully with ID:', this.lastID);
        
        // Add required documents
        const documents = [
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
        ];

        documents.forEach((doc, index) => {
            db.run(`
                INSERT INTO required_documents (
                    document_id, scheme_id, document_name, description, mandatory, document_category
                ) VALUES (?, ?, ?, ?, ?, ?)
            `, [
                `${newScheme.scheme_id}_${doc.document_name.replace(/\s+/g, '_').toLowerCase()}`,
                newScheme.scheme_id, doc.document_name, doc.description, doc.mandatory, doc.category
            ], function(err) {
                if (err) {
                    console.error('Error inserting document:', err);
                } else {
                    console.log(`Document ${index + 1} inserted successfully`);
                }
            });
        });

        // Add form
        db.run(`
            INSERT INTO forms (form_id, scheme_id, form_name, description, form_type)
            VALUES (?, ?, ?, ?, ?)
        `, [
            `${newScheme.scheme_id}_application_form`,
            newScheme.scheme_id,
            'Application Form',
            `Application form for ${newScheme.scheme_name}`,
            'application'
        ], function(err) {
            if (err) {
                console.error('Error inserting form:', err);
            } else {
                console.log('Form inserted successfully');
                
                // Add form fields
                const fields = [
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
                ];

                fields.forEach((field, index) => {
                    const fieldLabel = field.field_label || field.field_name;
                    db.run(`
                        INSERT INTO form_fields (
                            field_id, form_id, field_name, field_type, field_label, required, description, field_order, field_group, options
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                        `${newScheme.scheme_id}_${field.field_name}`,
                        `${newScheme.scheme_id}_application_form`,
                        field.field_name,
                        field.field_type,
                        fieldLabel,
                        field.required,
                        field.description,
                        field.field_order,
                        field.field_group,
                        field.options || null
                    ], function(err) {
                        if (err) {
                            console.error('Error inserting field:', err);
                        } else {
                            console.log(`Field ${index + 1} inserted successfully`);
                        }
                    });
                });
            }
        });
    }
});

// Close database after a delay to allow all operations to complete
setTimeout(() => {
    db.close();
    console.log('Database operations completed');
}, 2000); 