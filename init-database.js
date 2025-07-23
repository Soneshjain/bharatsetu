const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

console.log('🚀 Initializing BharatSetu Database...');

// Database paths
const schemesDbPath = path.join(__dirname, 'database', 'schemes.db');
const mainDbPath = path.join(__dirname, 'bharatsetu.db');

// Create database directory if it doesn't exist
const dbDir = path.dirname(schemesDbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize schemes database
function initSchemesDatabase() {
    return new Promise((resolve, reject) => {
        console.log('📊 Creating schemes database...');
        
        const db = new sqlite3.Database(schemesDbPath, (err) => {
            if (err) {
                console.error('❌ Error creating schemes database:', err);
                reject(err);
                return;
            }
            
            console.log('✅ Connected to schemes database');
            
            // Create the schema directly
            const schema = `
-- BharatSetu MSME Schemes Database
-- Schema for storing all government scheme information, documents, and forms

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- 1. Scheme Table
CREATE TABLE IF NOT EXISTS schemes (
    scheme_id TEXT PRIMARY KEY,
    scheme_name TEXT NOT NULL,
    objective TEXT NOT NULL,
    quantum_of_assistance TEXT NOT NULL,
    commencement_and_applicability TEXT NOT NULL,
    eligibility_criteria TEXT NOT NULL,
    application_procedure TEXT NOT NULL,
    competent_authority TEXT NOT NULL,
    penal_action TEXT,
    scheme_type TEXT NOT NULL, -- 'Haryana State' or 'National'
    max_benefit_amount DECIMAL(15,2),
    benefit_percentage DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Required Documents Table
CREATE TABLE IF NOT EXISTS required_documents (
    document_id TEXT PRIMARY KEY,
    scheme_id TEXT NOT NULL,
    document_name TEXT NOT NULL,
    description TEXT NOT NULL,
    mandatory BOOLEAN NOT NULL DEFAULT 1,
    document_category TEXT, -- 'Registration', 'Financial', 'Legal', 'Technical', etc.
    FOREIGN KEY (scheme_id) REFERENCES schemes(scheme_id) ON DELETE CASCADE
);

-- 3. Forms Table
CREATE TABLE IF NOT EXISTS forms (
    form_id TEXT PRIMARY KEY,
    scheme_id TEXT NOT NULL,
    form_name TEXT NOT NULL,
    description TEXT NOT NULL,
    form_type TEXT DEFAULT 'application', -- 'application', 'annexure', 'declaration'
    FOREIGN KEY (scheme_id) REFERENCES schemes(scheme_id) ON DELETE CASCADE
);

-- 4. Form Fields Table
CREATE TABLE IF NOT EXISTS form_fields (
    field_id TEXT PRIMARY KEY,
    form_id TEXT NOT NULL,
    field_name TEXT NOT NULL,
    field_type TEXT NOT NULL, -- 'text', 'textarea', 'number', 'date', 'select', 'file', 'checkbox', 'radio'
    field_label TEXT NOT NULL,
    required BOOLEAN NOT NULL DEFAULT 0,
    description TEXT,
    field_order INTEGER DEFAULT 0,
    field_group TEXT, -- 'basic_info', 'financial_info', 'technical_info', etc.
    validation_rules TEXT, -- JSON string for validation rules
    options TEXT, -- JSON string for select/radio options
    FOREIGN KEY (form_id) REFERENCES forms(form_id) ON DELETE CASCADE
);

-- 5. Scheme Categories Table (for better organization)
CREATE TABLE IF NOT EXISTS scheme_categories (
    category_id TEXT PRIMARY KEY,
    category_name TEXT NOT NULL,
    description TEXT,
    parent_category_id TEXT,
    FOREIGN KEY (parent_category_id) REFERENCES scheme_categories(category_id)
);

-- 6. Scheme-Category Mapping Table
CREATE TABLE IF NOT EXISTS scheme_category_mapping (
    scheme_id TEXT NOT NULL,
    category_id TEXT NOT NULL,
    PRIMARY KEY (scheme_id, category_id),
    FOREIGN KEY (scheme_id) REFERENCES schemes(scheme_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES scheme_categories(category_id) ON DELETE CASCADE
);

-- 7. Application Status Table
CREATE TABLE IF NOT EXISTS application_status (
    status_id TEXT PRIMARY KEY,
    status_name TEXT NOT NULL,
    description TEXT,
    color_code TEXT DEFAULT '#666666',
    is_active BOOLEAN DEFAULT 1
);

-- 8. User Applications Table
CREATE TABLE IF NOT EXISTS user_applications (
    application_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    scheme_id TEXT NOT NULL,
    company_id TEXT NOT NULL,
    status_id TEXT NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    application_data TEXT, -- JSON string containing form data
    FOREIGN KEY (scheme_id) REFERENCES schemes(scheme_id),
    FOREIGN KEY (status_id) REFERENCES application_status(status_id)
);

-- 9. Application Documents Table
CREATE TABLE IF NOT EXISTS application_documents (
    document_id TEXT PRIMARY KEY,
    application_id TEXT NOT NULL,
    required_document_id TEXT NOT NULL,
    file_path TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_verified BOOLEAN DEFAULT 0,
    verification_notes TEXT,
    FOREIGN KEY (application_id) REFERENCES user_applications(application_id) ON DELETE CASCADE,
    FOREIGN KEY (required_document_id) REFERENCES required_documents(document_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_schemes_type ON schemes(scheme_type);
CREATE INDEX IF NOT EXISTS idx_schemes_authority ON schemes(competent_authority);
CREATE INDEX IF NOT EXISTS idx_documents_scheme ON required_documents(scheme_id);
CREATE INDEX IF NOT EXISTS idx_forms_scheme ON forms(scheme_id);
CREATE INDEX IF NOT EXISTS idx_fields_form ON form_fields(form_id);
CREATE INDEX IF NOT EXISTS idx_applications_user ON user_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_scheme ON user_applications(scheme_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON user_applications(status_id);

-- Insert default application statuses
INSERT OR IGNORE INTO application_status (status_id, status_name, description, color_code) VALUES
('draft', 'Draft', 'Application is in draft mode', '#666666'),
('submitted', 'Submitted', 'Application has been submitted', '#3b82f6'),
('under_review', 'Under Review', 'Application is being reviewed', '#f59e0b'),
('approved', 'Approved', 'Application has been approved', '#10b981'),
('rejected', 'Rejected', 'Application has been rejected', '#ef4444'),
('pending_docs', 'Pending Documents', 'Additional documents required', '#8b5cf6'),
('disbursed', 'Disbursed', 'Benefits have been disbursed', '#059669');

-- Insert scheme categories
INSERT OR IGNORE INTO scheme_categories (category_id, category_name, description) VALUES
('haryana_state', 'Haryana State Schemes', 'Schemes specific to Haryana state'),
('national_msme', 'National MSME Schemes', 'Schemes applicable across India'),
('financial_support', 'Financial Support', 'Schemes providing financial assistance'),
('technology_upgradation', 'Technology Upgradation', 'Schemes for technology adoption'),
('quality_certification', 'Quality Certification', 'Schemes for quality improvements'),
('infrastructure', 'Infrastructure', 'Schemes for infrastructure development'),
('innovation', 'Innovation & R&D', 'Schemes for innovation and research');

-- Insert sub-categories
INSERT OR IGNORE INTO scheme_categories (category_id, category_name, description, parent_category_id) VALUES
('electricity_subsidy', 'Electricity & Power', 'Electricity and power-related subsidies', 'haryana_state'),
('land_acquisition', 'Land Acquisition', 'Land purchase and development support', 'haryana_state'),
('startup_support', 'Startup Support', 'Support for startup enterprises', 'haryana_state'),
('equipment_support', 'Equipment Support', 'Support for equipment and machinery', 'national_msme'),
('certification_support', 'Certification Support', 'Support for various certifications', 'national_msme'),
('productivity_improvement', 'Productivity Improvement', 'Support for productivity enhancement', 'national_msme'),
('digital_transformation', 'Digital Transformation', 'Support for digital initiatives', 'national_msme'),
('intellectual_property', 'Intellectual Property', 'Support for IP protection', 'national_msme'),
('market_expansion', 'Market Expansion', 'Support for market expansion activities', 'national_msme');
            `;
            
            db.exec(schema, (err) => {
                if (err) {
                    console.error('❌ Error executing schema:', err);
                    reject(err);
                    return;
                }
                
                console.log('✅ Database schema created successfully');
                db.close();
                resolve();
            });
        });
    });
}

// Seed the database with scheme data
function seedDatabase() {
    return new Promise((resolve, reject) => {
        console.log('🌱 Seeding database with scheme data...');
        
        try {
            // Check if seeding script exists
            const seedScriptPath = path.join(__dirname, 'database', 'seed-schemes.js');
            if (fs.existsSync(seedScriptPath)) {
                // Run the seeding script
                require('./database/seed-schemes.js');
                console.log('✅ Database seeded successfully');
            } else {
                console.log('⚠️ Seeding script not found, skipping data seeding');
            }
            resolve();
        } catch (error) {
            console.error('❌ Error seeding database:', error);
            // Don't reject, just log the error and continue
            console.log('⚠️ Continuing without seeding data');
            resolve();
        }
    });
}

// Main initialization function
async function initializeDatabase() {
    try {
        // Initialize schemes database
        await initSchemesDatabase();
        
        // Seed with data
        await seedDatabase();
        
        console.log('🎉 Database initialization completed successfully!');
        console.log('');
        console.log('📋 Available API Endpoints:');
        console.log('  GET  /api/schemes                    - Get all schemes');
        console.log('  GET  /api/schemes/:id                - Get scheme by ID');
        console.log('  GET  /api/schemes/type/:type         - Get schemes by type');
        console.log('  GET  /api/schemes/category/:catId    - Get schemes by category');
        console.log('  GET  /api/schemes/search/:query      - Search schemes');
        console.log('  GET  /api/categories                 - Get all categories');
        console.log('  GET  /api/application-statuses       - Get application statuses');
        console.log('  POST /api/applications               - Create application');
        console.log('  GET  /api/applications/user/:userId  - Get user applications');
        console.log('  PUT  /api/applications/:id/status    - Update application status');
        console.log('');
        console.log('🚀 You can now start the server with: npm start');
        
    } catch (error) {
        console.error('💥 Database initialization failed:', error);
        process.exit(1);
    }
}

// Run initialization
initializeDatabase(); 