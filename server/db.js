const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH || path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_name TEXT,
      customer_phone TEXT,
      customer_address TEXT,
      location_link TEXT,
      items JSON,
      total_amount INTEGER,
      utr_number TEXT,
      status TEXT DEFAULT 'PENDING VERIFICATION',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS admin (
      username TEXT PRIMARY KEY,
      password TEXT
    )
  `);

  // Insert default admin (password: admin123)
  db.get("SELECT * FROM admin WHERE username = 'admin'", (err, row) => {
    if (!row) {
      db.run("INSERT INTO admin (username, password) VALUES ('admin', 'admin123')");
    }
  });
});

module.exports = db;
