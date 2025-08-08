const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Import scheme API routes
const schemeApi = require('./routes/scheme-api');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://accounts.google.com",
        "https://www.gstatic.com",
        "https://unpkg.com"
      ],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://cdnjs.cloudflare.com",
        "https://accounts.google.com",
        "https://fonts.googleapis.com",
        "https://unpkg.com"
      ],
      fontSrc: [
        "'self'",
        "https://cdnjs.cloudflare.com",
        "https://fonts.gstatic.com",
        "data:"
      ],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://accounts.google.com"],
      frameSrc: ["'self'", "https://accounts.google.com"],
    },
  },
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
// Trust proxy to detect protocol behind load balancers
app.set('trust proxy', 1);

// Mount scheme API routes
app.use('/api/schemes', schemeApi);

// Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Database setup (main app DB)
const db = new sqlite3.Database(path.join(__dirname, 'database', 'bharatsetu.db'), (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      google_id TEXT UNIQUE,
      email TEXT UNIQUE,
      name TEXT,
      picture TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Companies table
    db.run(`CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      name TEXT,
      registration_number TEXT,
      enterprise_type TEXT,
      sector TEXT,
      district TEXT,
      block TEXT,
      block_category TEXT,
      commercial_production_date TEXT,
      electricity_connection_date TEXT,
      project_type TEXT,
      land_investment REAL,
      machinery_investment REAL,
      total_project_cost REAL,
      land_purchase_years INTEGER,
      has_term_loan BOOLEAN,
      term_loan_amount REAL,
      interest_rate REAL,
      requires_listing BOOLEAN,
      annual_turnover REAL,
      export_turnover REAL,
      connected_load REAL,
      annual_electricity_consumption INTEGER,
      technology_equipment_cost REAL,
      marketing_export_expenses REAL,
      testing_equipment_cost REAL,
      quality_certification_cost REAL,
      total_employees INTEGER,
      sc_st_employees INTEGER,
      women_employees INTEGER,
      promoter_category TEXT,
      is_startup_registered BOOLEAN,
      dpiit_recognition BOOLEAN,
      cluster_location TEXT,
      rural_area BOOLEAN,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Eligibility tests table
    db.run(`CREATE TABLE IF NOT EXISTS eligibility_tests (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      company_id TEXT,
      test_data TEXT,
      eligible_schemes_count INTEGER,
      total_benefits REAL,
      benefits_breakdown TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (company_id) REFERENCES companies (id)
    )`);

    // Scheme applications table
    db.run(`CREATE TABLE IF NOT EXISTS scheme_applications (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      company_id TEXT,
      scheme_id TEXT,
      scheme_name TEXT,
      application_status TEXT DEFAULT 'pending',
      application_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      documents_submitted TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (company_id) REFERENCES companies (id)
    )`);
  });
}

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

// Google OAuth verification
async function verifyGoogleToken(token) {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    return ticket.getPayload();
  } catch (error) {
    throw new Error('Invalid Google token');
  }
}

// Routes

// Google OAuth login
app.post('/api/auth/google', async (req, res) => {
  try {
    const { token } = req.body;
    const payload = await verifyGoogleToken(token);
    
    const { sub: googleId, email, name, picture } = payload;
    
    // Check if user exists
    db.get('SELECT * FROM users WHERE google_id = ?', [googleId], (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (user) {
        // User exists, generate JWT token
        const jwtToken = jwt.sign(
          { id: user.id, email: user.email },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '7d' }
        );
        
        return res.json({
          token: jwtToken,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            picture: user.picture
          }
        });
      } else {
        // Create new user
        const userId = uuidv4();
        db.run(
          'INSERT INTO users (id, google_id, email, name, picture) VALUES (?, ?, ?, ?, ?)',
          [userId, googleId, email, name, picture],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to create user' });
            }
            
            const jwtToken = jwt.sign(
              { id: userId, email },
              process.env.JWT_SECRET || 'your-secret-key',
              { expiresIn: '7d' }
            );
            
            return res.json({
              token: jwtToken,
              user: {
                id: userId,
                email,
                name,
                picture
              }
            });
          }
        );
      }
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
});

// Get user profile
app.get('/api/user/profile', authenticateToken, (req, res) => {
  db.get('SELECT * FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  });
});

// Get user's companies
app.get('/api/companies', authenticateToken, (req, res) => {
  db.all('SELECT * FROM companies WHERE user_id = ? ORDER BY created_at DESC', [req.user.id], (err, companies) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ companies });
  });
});

// Create new company
app.post('/api/companies', authenticateToken, (req, res) => {
  const companyData = req.body;
  const companyId = uuidv4();
  
  const fields = [
    'name', 'registration_number', 'enterprise_type', 'sector', 'district', 'block',
    'block_category', 'commercial_production_date', 'electricity_connection_date',
    'project_type', 'land_investment', 'machinery_investment', 'total_project_cost',
    'land_purchase_years', 'has_term_loan', 'term_loan_amount', 'interest_rate',
    'requires_listing', 'annual_turnover', 'export_turnover', 'connected_load',
    'annual_electricity_consumption', 'technology_equipment_cost', 'marketing_export_expenses',
    'testing_equipment_cost', 'quality_certification_cost', 'total_employees',
    'sc_st_employees', 'women_employees', 'promoter_category', 'is_startup_registered',
    'dpiit_recognition', 'cluster_location', 'rural_area'
  ];
  
  const values = [companyId, req.user.id, ...fields.map(field => companyData[field] || null)];
  const placeholders = fields.map(() => '?').join(', ');
  
  const query = `INSERT INTO companies (id, user_id, ${fields.join(', ')}) VALUES (?, ?, ${placeholders})`;
  
  db.run(query, values, function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to create company' });
    }
    
    res.json({ 
      message: 'Company created successfully',
      companyId: companyId
    });
  });
});

// Store eligibility test result
app.post('/api/eligibility-tests', authenticateToken, (req, res) => {
  const { companyId, testData, results } = req.body;
  const testId = uuidv4();
  
  db.run(
    `INSERT INTO eligibility_tests (id, user_id, company_id, test_data, eligible_schemes_count, total_benefits, benefits_breakdown) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      testId,
      req.user.id,
      companyId,
      JSON.stringify(testData),
      results.total_eligible,
      results.total_value,
      JSON.stringify(results.benefits_breakdown)
    ],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to store test result' });
      }
      
      res.json({ 
        message: 'Test result stored successfully',
        testId: testId
      });
    }
  );
});

// Get user's eligibility test history
app.get('/api/eligibility-tests', authenticateToken, (req, res) => {
  db.all(
    `SELECT et.*, c.name as company_name 
     FROM eligibility_tests et 
     LEFT JOIN companies c ON et.company_id = c.id 
     WHERE et.user_id = ? 
     ORDER BY et.created_at DESC`,
    [req.user.id],
    (err, tests) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Parse JSON fields
      tests.forEach(test => {
        test.test_data = JSON.parse(test.test_data);
        test.benefits_breakdown = JSON.parse(test.benefits_breakdown);
      });
      
      res.json({ tests });
    }
  );
});

// Create scheme application
app.post('/api/applications', authenticateToken, (req, res) => {
  const { companyId, schemeId, schemeName, documents } = req.body;
  const applicationId = uuidv4();
  
  db.run(
    `INSERT INTO scheme_applications (id, user_id, company_id, scheme_id, scheme_name, documents_submitted) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [applicationId, req.user.id, companyId, schemeId, schemeName, JSON.stringify(documents)],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to create application' });
      }
      
      res.json({ 
        message: 'Application created successfully',
        applicationId: applicationId
      });
    }
  );
});

// Get user's applications
app.get('/api/applications', authenticateToken, (req, res) => {
  db.all(
    `SELECT sa.*, c.name as company_name 
     FROM scheme_applications sa 
     LEFT JOIN companies c ON sa.company_id = c.id 
     WHERE sa.user_id = ? 
     ORDER BY sa.created_at DESC`,
    [req.user.id],
    (err, applications) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Parse JSON fields
      applications.forEach(app => {
        app.documents_submitted = JSON.parse(app.documents_submitted);
      });
      
      res.json({ applications });
    }
  );
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'html', 'index.html'));
});

// Dynamic sitemap.xml that uses request origin and current public HTML files
app.get('/sitemap.xml', async (req, res) => {
  try {
    const publicDir = path.join(__dirname, '..', 'public', 'html');
    const origin = `${(req.headers['x-forwarded-proto'] || req.protocol)}://${req.get('host')}`;

    function walkForHtmlFiles(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      const files = [];
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          files.push(...walkForHtmlFiles(full));
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
          files.push(full);
        }
      }
      return files;
    }

    const htmlFiles = walkForHtmlFiles(publicDir);
    function extractSitemapMeta(absPath) {
      try {
        const html = fs.readFileSync(absPath, 'utf8');
        const prMatch = html.match(/<meta\s+name=["']sitemap:priority["']\s+content=["']([^"']+)["'][^>]*>/i);
        const cfMatch = html.match(/<meta\s+name=["']sitemap:changefreq["']\s+content=["']([^"']+)["'][^>]*>/i);
        if (!prMatch && !cfMatch) {
          return { found: false };
        }
        const priority = prMatch ? parseFloat(prMatch[1]) : undefined;
        const changefreq = cfMatch ? cfMatch[1] : undefined;
        return { found: true, priority: isFinite(priority) ? priority : undefined, changefreq };
      } catch (_) {
        return { found: false };
      }
    }

    const { pageMap, defaultRules } = require('./sitemap-config');

    const urls = htmlFiles.map((absPath) => {
      const rel = absPath.replace(publicDir, ''); // e.g., /index.html or /schemes/... .html
      const locPath = rel === '/index.html' ? '/' : rel;
      const stats = fs.statSync(absPath);
      const lastmod = stats.mtime.toISOString();
      let { found, priority, changefreq } = extractSitemapMeta(absPath);
      if (!found) {
        // Use explicit pageMap first
        if (pageMap && pageMap[locPath]) {
          priority = pageMap[locPath].priority;
          changefreq = pageMap[locPath].changefreq;
        } else if (defaultRules && defaultRules.length) {
          const rule = defaultRules.find(r => r.pattern.test(locPath));
          if (rule) { priority = rule.priority; changefreq = rule.changefreq; }
        }
        if (priority === undefined) priority = 0.5;
        if (!changefreq) changefreq = 'monthly';
      } else {
        // Fill missing fields with sane defaults
        if (priority === undefined) priority = 0.5;
        if (!changefreq) changefreq = 'monthly';
      }
      return { loc: `${origin}${locPath}`, lastmod, priority, changefreq };
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls.map(u => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority.toFixed(1)}</priority>\n  </url>`).join('\n') +
      `\n</urlset>`;

    res.type('application/xml').send(xml);
  } catch (err) {
    console.error('Failed to build sitemap:', err);
    res.status(500).send('');
  }
});

// Serve static assets from correct subfolders
app.use('/css', express.static(path.join(__dirname, '..', 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, '..', 'public', 'js')));
app.use('/assets', express.static(path.join(__dirname, '..', 'public', 'assets')));
// Serve manifest and robots from public root
app.get('/site.webmanifest', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'site.webmanifest'));
});
app.get('/robots.txt', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'robots.txt'));
});
// Mount HTML pages at root
app.use('/', express.static(path.join(__dirname, '..', 'public', 'html')));

// Start server
app.listen(PORT, () => {
  console.log(`BharatSetu server running on port ${PORT}`);
}); 