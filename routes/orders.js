const express = require('express');
const db = require('../db/init');
const checkAdmin = require('../middleware/checkAdmin');
const router = express.Router();

router.post('/', (req, res) => {
  const { userId, items, total } = req.body;
  const result = db.prepare('INSERT INTO orders (userId, items, total) VALUES (?, ?, ?)').run(userId, JSON.stringify(items), total);
  res.status(201).json({ id: result.lastInsertRowid });
});
router.get('/', (req, res) => {
  const orders = db.prepare(`SELECT o.*, u.name AS userName FROM orders o LEFT JOIN users u ON u.id = o.userId ORDER BY o.createdAt DESC`).all();
  res.json(orders.map(o => ({ ...o, items: JSON.parse(o.items) })));
});
// ... остальные методы по аналогии
module.exports = router;