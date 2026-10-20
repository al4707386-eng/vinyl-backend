const express = require('express');
const db = require('../db/init');
const router = express.Router();

router.get('/:userId', async (req, res) => {
  const result = await db.query('SELECT "recordId" FROM favorites WHERE "userId" = $1', [req.params.userId]);
  res.json(result.rows.map(r => r.recordId));
});
router.post('/', async (req, res) => {
  const { userId, recordId } = req.body;
  await db.query('INSERT INTO favorites ("userId", "recordId") VALUES ($1, $2) ON CONFLICT DO NOTHING', [userId, recordId]);
  res.status(201).json({ success: true });
});
router.delete('/:userId/:recordId', async (req, res) => {
  await db.query('DELETE FROM favorites WHERE "userId" = $1 AND "recordId" = $2', [req.params.userId, req.params.recordId]);
  res.json({ success: true });
});
module.exports = router;