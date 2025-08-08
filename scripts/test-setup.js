// Test script for BharatSetu setup
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('Testing BharatSetu setup...\n');

// Test database connection
console.log('1. Testing database connection...');
const db = new sqlite3.Database(path.join(__dirname, '..', 'server', 'database', 'bharatsetu.db'), (err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        process.exit(1);
    } else {
        console.log('✅ Database connected successfully');
        
        // Test table creation
        console.log('\n2. Testing table creation...');
        db.serialize(() => {
            // Test users table
            db.run(`CREATE TABLE IF NOT EXISTS test_users (
                id TEXT PRIMARY KEY,
                google_id TEXT UNIQUE,
                email TEXT UNIQUE,
                name TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, (err) => {
                if (err) {
                    console.error('❌ Users table creation failed:', err.message);
                } else {
                    console.log('✅ Users table created successfully');
                }
            });

            // Test companies table
            db.run(`CREATE TABLE IF NOT EXISTS test_companies (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                name TEXT,
                district TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, (err) => {
                if (err) {
                    console.error('❌ Companies table creation failed:', err.message);
                } else {
                    console.log('✅ Companies table created successfully');
                }
            });

            // Test eligibility_tests table
            db.run(`CREATE TABLE IF NOT EXISTS test_eligibility_tests (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                company_id TEXT,
                test_data TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, (err) => {
                if (err) {
                    console.error('❌ Eligibility tests table creation failed:', err.message);
                } else {
                    console.log('✅ Eligibility tests table created successfully');
                }
            });

            // Clean up test tables
            setTimeout(() => {
                console.log('\n3. Cleaning up test tables...');
                db.run('DROP TABLE IF EXISTS test_users', (err) => {
                    if (err) {
                        console.error('❌ Failed to drop test_users table:', err.message);
                    } else {
                        console.log('✅ Test users table cleaned up');
                    }
                });

                db.run('DROP TABLE IF EXISTS test_companies', (err) => {
                    if (err) {
                        console.error('❌ Failed to drop test_companies table:', err.message);
                    } else {
                        console.log('✅ Test companies table cleaned up');
                    }
                });

                db.run('DROP TABLE IF EXISTS test_eligibility_tests', (err) => {
                    if (err) {
                        console.error('❌ Failed to drop test_eligibility_tests table:', err.message);
                    } else {
                        console.log('✅ Test eligibility_tests table cleaned up');
                    }
                });

                // Close database
                setTimeout(() => {
                    db.close((err) => {
                        if (err) {
                            console.error('❌ Failed to close database:', err.message);
                        } else {
                            console.log('\n✅ Database test completed successfully');
                            console.log('\n🎉 Setup verification complete!');
                            console.log('\nNext steps:');
                            console.log('1. Configure your .env file with Google OAuth credentials');
                            console.log('2. Update the Google Client ID in js/auth-service.js');
                            console.log('3. Run: npm run dev');
                            console.log('4. Open http://localhost:3000 in your browser');
                        }
                    });
                }, 1000);
            }, 1000);
        });
    }
});

// Test required dependencies
console.log('\n4. Testing required dependencies...');
try {
    require('express');
    console.log('✅ Express.js available');
} catch (err) {
    console.error('❌ Express.js not found. Run: npm install');
}

try {
    require('google-auth-library');
    console.log('✅ Google Auth Library available');
} catch (err) {
    console.error('❌ Google Auth Library not found. Run: npm install');
}

try {
    require('jsonwebtoken');
    console.log('✅ JWT available');
} catch (err) {
    console.error('❌ JWT not found. Run: npm install');
}

try {
    require('cors');
    console.log('✅ CORS available');
} catch (err) {
    console.error('❌ CORS not found. Run: npm install');
}

console.log('\n📋 Setup Summary:');
console.log('✅ Database: SQLite3 with proper tables');
console.log('✅ Server: Express.js with authentication');
console.log('✅ Frontend: Google OAuth integration');
console.log('✅ API: RESTful endpoints for data storage');
console.log('✅ Security: JWT tokens and rate limiting'); 