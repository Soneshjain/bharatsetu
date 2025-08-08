const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, '..', 'server', 'database', 'schemes.db'));

console.log('Checking database for new scheme...');

db.all('SELECT scheme_id, scheme_name FROM schemes WHERE scheme_id = "promoting-green-sustainable-production"', (err, rows) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('New scheme found:', rows);
    }
    db.close();
}); 