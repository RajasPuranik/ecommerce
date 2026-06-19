const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const generateOrderId = () => 'ORD_' + Math.random().toString(36).substr(2, 9).toUpperCase();

// 1. Submit Order with UTR
app.post('/api/create-order', (req, res) => {
  const { name, phone, address, locationLink, items, totalAmount, utr } = req.body;
  
  if (!utr || utr.length < 8) {
    return res.status(400).json({ success: false, message: 'Valid UTR Number is required.' });
  }

  const finalAddress = address || 'Location Pinned on Map';
  const orderId = generateOrderId();

  db.run(
    `INSERT INTO orders (id, customer_name, customer_phone, customer_address, location_link, items, total_amount, utr_number, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING VERIFICATION')`,
    [orderId, name, phone, finalAddress, locationLink, JSON.stringify(items), totalAmount, utr],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        success: true,
        orderId
      });
    }
  );
});

// 2. Admin Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM admin WHERE username = ? AND password = ?`, [username, password], (err, row) => {
    if (row) {
      res.json({ success: true, token: "mock-admin-token-123" });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  });
});

// 3. Get All Orders
app.get('/api/admin/orders', (req, res) => {
  if (req.headers.authorization !== "Bearer mock-admin-token-123") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  db.all(`SELECT * FROM orders ORDER BY created_at DESC`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const formattedRows = rows.map(r => ({ ...r, items: JSON.parse(r.items) }));
    res.json(formattedRows);
  });
});

// 4. Approve or Reject Order
app.post('/api/admin/update-status', (req, res) => {
  if (req.headers.authorization !== "Bearer mock-admin-token-123") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { orderId, status } = req.body; // status: 'SUCCESS' or 'REJECTED'
  
  db.run(`UPDATE orders SET status = ? WHERE id = ?`, [status, orderId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend server running on http://localhost:${PORT}`));
