const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/schemes.db');

console.log('Checking database for new scheme...');

db.all('SELECT scheme_id, scheme_name FROM schemes WHERE scheme_id = "promoting-green-sustainable-production"', (err, rows) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('New scheme found:', rows);
    }
    db.close();
}); 