const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/buy_pending_orders', (req, res) => {
  db.all('SELECT * FROM buy_pending_orders', [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/sell_pending_orders', (req, res) => {
  db.all('SELECT * FROM sell_pending_orders', [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/completed_orders', (req, res) => {
  db.all('SELECT * FROM completed_orders', [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/buy', (req, res) => {
  const { price, quantity } = req.body;

  db.get('SELECT * FROM sell_pending_orders WHERE price = ?', [price], (err, matchingSellOrder) => {
      if (matchingSellOrder) {
          if (matchingSellOrder.quantity > quantity) {
              db.run('UPDATE sell_pending_orders SET quantity = quantity - ? WHERE id = ?', [quantity, matchingSellOrder.id]);
              db.run('INSERT INTO completed_orders (price, quantity, type) VALUES (?, ?, "buy")', [price, quantity]);
          } else if (matchingSellOrder.quantity < quantity) {
              db.run('UPDATE buy_pending_orders SET quantity = quantity - ? WHERE price = ?', [matchingSellOrder.quantity, price]);
              db.run('INSERT INTO completed_orders (price, quantity, type) VALUES (?, ?, "buy")', [price, matchingSellOrder.quantity]);
              db.run('DELETE FROM sell_pending_orders WHERE id = ?', [matchingSellOrder.id]);
          } else {
              db.run('INSERT INTO completed_orders (price, quantity, type) VALUES (?, ?, "buy")', [price, quantity]);
              db.run('DELETE FROM sell_pending_orders WHERE id = ?', [matchingSellOrder.id]);
          }
          res.send('Buy order matched and processed successfully');
      } else {
          db.run('INSERT INTO buy_pending_orders (price, quantity) VALUES (?, ?)', [price, quantity], (err) => {
              if (err) return res.status(400).json({ error: err.message });
              res.send('Buy order placed successfully');
          });
      }
  });
});

app.post('/sell', (req, res) => {
  const { price, quantity } = req.body;

  db.get('SELECT * FROM buy_pending_orders WHERE price = ?', [price], (err, matchingBuyOrder) => {
      if (matchingBuyOrder) {
          if (matchingBuyOrder.quantity > quantity) {
              db.run('UPDATE buy_pending_orders SET quantity = quantity - ? WHERE id = ?', [quantity, matchingBuyOrder.id]);
              db.run('INSERT INTO completed_orders (price, quantity, type) VALUES (?, ?, "sell")', [price, quantity]);
          } else if (matchingBuyOrder.quantity < quantity) {
              db.run('UPDATE sell_pending_orders SET quantity = quantity - ? WHERE price = ?', [matchingBuyOrder.quantity, price]);
              db.run('INSERT INTO completed_orders (price, quantity, type) VALUES (?, ?, "sell")', [price, matchingBuyOrder.quantity]);
              db.run('DELETE FROM buy_pending_orders WHERE id = ?', [matchingBuyOrder.id]);
          } else {
              db.run('INSERT INTO completed_orders (price, quantity, type) VALUES (?, ?, "sell")', [price, quantity]);
              db.run('DELETE FROM buy_pending_orders WHERE id = ?', [matchingBuyOrder.id]);
          }
          res.send('Sell order matched and processed successfully');
      } else {
          // No match found: Insert a new sell order
          db.run('INSERT INTO sell_pending_orders (price, quantity) VALUES (?, ?)', [price, quantity], (err) => {
              if (err) return res.status(400).json({ error: err.message });
              res.send('Sell order placed successfully');
          });
      }
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("http://localhost:5000")
});
