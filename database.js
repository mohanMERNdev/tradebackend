const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./trading.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS buy_pending_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    price INTEGER,
    quantity INTEGER,
    type TEXT DEFAULT 'buy'
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS sell_pending_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    price INTEGER,
    quantity INTEGER,
    type TEXT DEFAULT 'sell'
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS completed_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    price INTEGER,
    quantity INTEGER,
    type TEXT
  )`);

  db.run(`INSERT INTO buy_pending_orders (price, quantity) VALUES (84, 10)`);
  db.run(`INSERT INTO buy_pending_orders (price, quantity) VALUES (83, 20)`);
  db.run(`INSERT INTO buy_pending_orders (price, quantity) VALUES (82, 15)`);
  db.run(`INSERT INTO buy_pending_orders (price, quantity) VALUES (81, 40)`);
  db.run(`INSERT INTO buy_pending_orders (price, quantity) VALUES (80, 30)`);
  

  // Insert Dummy Data for Sell Pending Orders
  db.run(`INSERT INTO sell_pending_orders (price, quantity) VALUES (86, 10)`);
  db.run(`INSERT INTO sell_pending_orders (price, quantity) VALUES (87, 20)`);
  db.run(`INSERT INTO sell_pending_orders (price, quantity) VALUES (88, 40)`);
  db.run(`INSERT INTO sell_pending_orders (price, quantity) VALUES (89, 30)`);
  db.run(`INSERT INTO sell_pending_orders (price, quantity) VALUES (90, 25)`);

  db.run(`INSERT INTO completed_orders (price, quantity, type) VALUES (85, 30, 'buy')`);
  db.run(`INSERT INTO completed_orders (price, quantity, type) VALUES (86, 25, 'sell')`);

  console.log("Database setup complete and dummy data inserted.");
});

module.exports = db;
