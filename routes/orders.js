const express = require('express');
const db = require('../db/init');
const checkAdmin = require('../middleware/checkAdmin');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { userId, items, total } = req.body;
    const result = await db.query('INSERT INTO orders ("userId", items, total) VALUES ($1, $2, $3) RETURNING id', [userId, JSON.stringify(items), total]);
    res.status(201).json({ id: result.rows[0].id });
  } catch (error) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

router.get('/', async (req, res) => {
  const result = await db.query(`SELECT o.id, o."userId", u.name AS "userName", u.email AS "userEmail", o.items, o.total, o.status, o."createdAt" FROM orders o LEFT JOIN users u ON u.id = o."userId" ORDER BY o."createdAt" DESC`);
  const orders = result.rows.map(o => ({ ...o, items: JSON.parse(o.items) }));
  res.json(orders);
});

router.get('/user/:userId', async (req, res) => {
  const result = await db.query('SELECT * FROM orders WHERE "userId" = $1 ORDER BY "createdAt" DESC', [req.params.userId]);
  res.json(result.rows.map(o => ({ ...o, items: JSON.parse(o.items) })));
});

router.get('/:id', async (req, res) => {
  const result = await db.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
  if (result.rows.length === 0) return res.status(404).json({ error: 'Не найден' });
  const order = result.rows[0];
  order.items = JSON.parse(order.items);
  res.json(order);
});

router.patch('/:id', checkAdmin, async (req, res) => {
  await db.query('UPDATE orders SET status = $1 WHERE id = $2', [req.body.status, req.params.id]);
  res.json({ success: true });
});

router.delete('/:id', checkAdmin, async (req, res) => {
  await db.query('DELETE FROM orders WHERE id = $1', [req.params.id]);
  res.json({ success: true });
});
module.exports = router;