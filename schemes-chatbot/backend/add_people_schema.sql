-- Additional People/Applications schema (idempotent)
-- Users
CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200),
    email VARCHAR(200),
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MSMEs (companies)
CREATE TABLE IF NOT EXISTS msmes (
    msme_id VARCHAR(50) PRIMARY KEY,
    legal_name VARCHAR(300) NOT NULL,
    udyam_number VARCHAR(50),
    pan VARCHAR(20),
    state VARCHAR(100),
    sector VARCHAR(100),
    size VARCHAR(20), -- micro/small/medium
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User ↔ MSME roles (many-to-many)
CREATE TABLE IF NOT EXISTS user_msme_roles (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(user_id) ON DELETE CASCADE,
    msme_id VARCHAR(50) REFERENCES msmes(msme_id) ON DELETE CASCADE,
    role VARCHAR(50) -- owner/director/admin
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_msme_role ON user_msme_roles(user_id, msme_id, role);

-- Applications
CREATE TABLE IF NOT EXISTS applications (
    app_id VARCHAR(50) PRIMARY KEY,
    msme_id VARCHAR(50) REFERENCES msmes(msme_id) ON DELETE CASCADE,
    scheme_id VARCHAR(50) REFERENCES schemes(scheme_id) ON DELETE CASCADE,
    status VARCHAR(30) DEFAULT 'draft', -- draft/submitted/approved/rejected
    submitted_at TIMESTAMP,
    approved_at TIMESTAMP,
    rejected_at TIMESTAMP,
    amount_claimed DECIMAL(15,2),
    amount_sanctioned DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_apps_msme ON applications(msme_id);
CREATE INDEX IF NOT EXISTS idx_apps_scheme ON applications(scheme_id);
CREATE INDEX IF NOT EXISTS idx_apps_status ON applications(status);

-- Application events (audit trail)
CREATE TABLE IF NOT EXISTS application_events (
    event_id VARCHAR(50) PRIMARY KEY,
    app_id VARCHAR(50) REFERENCES applications(app_id) ON DELETE CASCADE,
    event_type VARCHAR(50),
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_app_events_app ON application_events(app_id);

-- Documents for applications
CREATE TABLE IF NOT EXISTS documents (
    doc_id VARCHAR(50) PRIMARY KEY,
    app_id VARCHAR(50) REFERENCES applications(app_id) ON DELETE CASCADE,
    kind VARCHAR(50), -- e.g., invoice, certificate
    filename VARCHAR(300),
    storage_url VARCHAR(1000),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_docs_app ON documents(app_id);


