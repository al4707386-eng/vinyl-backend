const express = require('express');
const db = require('../db/init');
const checkAdmin = require('../middleware/checkAdmin');

const router = express.Router();

router.post('/', (req, res) => {
  try {
    const { userId, items, total } = req.body;

    if (!userId || !items || total == null) {
      return res.status(400).json({ error: 'Заполните userId, items и total' });
    }

    const insert = db.prepare(
      'INSERT INTO orders (userId, items, total) VALUES (?, ?, ?)'
    );
    const result = insert.run(userId, JSON.stringify(items), total);

    res.status(201).json({ id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера при создании заказа' });
  }
});

router.get('/', (req, res) => {
  const orders = db.prepare(`
    SELECT orders.id, orders.userId,
           users.name AS userName, users.email AS userEmail,
           orders.items, orders.total, orders.status, orders.createdAt
    FROM orders
    LEFT JOIN users ON users.id = orders.userId
    ORDER BY orders.createdAt DESC
  `).all();

  const parsed = orders.map((order) => ({
    ...order,
    items: JSON.parse(order.items),
  }));

  res.json(parsed);
});

router.get('/user/:userId', (req, res) => {
  const orders = db.prepare(
    'SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC'
  ).all(req.params.userId);

  const parsed = orders.map((order) => ({
    ...order,
    items: JSON.parse(order.items),
  }));

  res.json(parsed);
});

router.get('/:id', (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);

  if (!order) {
    return res.status(404).json({ error: 'Заказ не найден' });
  }

  order.items = JSON.parse(order.items);
  res.json(order);
});

router.patch('/:id', checkAdmin, (req, res) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Укажите статус' });
  }

  const result = db.prepare('UPDATE orders SET status = ? WHERE id = ?')
    .run(status, req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Заказ не найден' });
  }

  res.json({ success: true });
});

router.delete('/:id', checkAdmin, (req, res) => {
  const result = db.prepare('DELETE FROM orders WHERE id = ?').run(req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Заказ не найден' });
  }

  res.json({ success: true });
});

module.exports = router;