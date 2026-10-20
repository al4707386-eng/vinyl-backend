const express = require('express');
const db = require('../db/init');
const checkAdmin = require('../middleware/checkAdmin');
const router = express.Router();

router.get('/', checkAdmin, (req, res) => {
  const users = db.prepare('SELECT id, name, email, createdAt FROM users').all();
  res.json(users);
});

router.delete('/:id', checkAdmin, (req, res) => {
  const result = db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Не найден' });
  res.json({ success: true });
});

router.patch('/:id', (req, res) => {
  const { name } = req.body;
  db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name, req.params.id);
  res.json({ success: true });
});
module.exports = router;