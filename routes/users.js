const express = require('express');
const db = require('../db/init');
const checkAdmin = require('../middleware/checkAdmin');
const router = express.Router();

router.get('/', checkAdmin, async (req, res) => {
  const result = await db.query('SELECT id, name, email, "createdAt" FROM users');
  res.json(result.rows);
});

router.delete('/:id', checkAdmin, async (req, res) => {
  const result = await db.query('DELETE FROM users WHERE id = $1', [req.params.id]);
  if (result.rowCount === 0) return res.status(404).json({ error: 'Не найден' });
  res.json({ success: true });
});

router.patch('/:id', async (req, res) => {
  const { name } = req.body;
  await db.query('UPDATE users SET name = $1 WHERE id = $2', [name, req.params.id]);
  res.json({ success: true });
});
module.exports = router;