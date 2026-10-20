const express = require('express');
const db = require('../db/init');

const router = express.Router();

router.get('/:userId', (req, res) => {
  const favorites = db.prepare(
    'SELECT recordId FROM favorites WHERE userId = ?'
  ).all(req.params.userId);

  res.json(favorites.map((item) => item.recordId));
});

router.post('/', (req, res) => {
  try {
    const { userId, recordId } = req.body;

    if (!userId || !recordId) {
      return res.status(400).json({ error: 'Заполните userId и recordId' });
    }

    const insert = db.prepare(
      'INSERT OR IGNORE INTO favorites (userId, recordId) VALUES (?, ?)'
    );
    insert.run(userId, recordId);

    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.delete('/:userId/:recordId', (req, res) => {
  db.prepare(
    'DELETE FROM favorites WHERE userId = ? AND recordId = ?'
  ).run(req.params.userId, req.params.recordId);

  res.json({ success: true });
});

module.exports = router;