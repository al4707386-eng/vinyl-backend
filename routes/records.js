const express = require('express');
const db = require('../db/init');
const checkAdmin = require('../middleware/checkAdmin');
const router = express.Router();

router.get('/', (req, res) => {
  const records = db.prepare('SELECT * FROM records').all();
  res.json(records.map(r => ({ ...r, inStock: Boolean(r.inStock), images: JSON.parse(r.images), tracks: JSON.parse(r.tracks) })));
});
router.get('/:id', (req, res) => {
  const r = db.prepare('SELECT * FROM records WHERE id = ?').get(req.params.id);
  if (!r) return res.status(404).json({ error: 'Не найдено' });
  res.json({ ...r, inStock: Boolean(r.inStock), images: JSON.parse(r.images), tracks: JSON.parse(r.tracks) });
});
router.post('/', checkAdmin, (req, res) => {
  try {
    const { id, title, artist, year, genre, label, country, price, color, cover, images, inStock, description, tracks } = req.body;
    db.prepare(`INSERT INTO records (id, title, artist, year, genre, label, country, price, color, cover, images, inStock, description, tracks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(id, title, artist, year, genre, label, country, price, color, cover, JSON.stringify(images || []), inStock ? 1 : 0, description, JSON.stringify(tracks || []));
    res.status(201).json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});
router.patch('/:id', checkAdmin, (req, res) => {
  const { title, artist, year, genre, label, country, price, color, cover, images, inStock, description, tracks } = req.body;
  db.prepare(`UPDATE records SET title=?, artist=?, year=?, genre=?, label=?, country=?, price=?, color=?, cover=?, images=?, inStock=?, description=?, tracks=? WHERE id=?`).run(title, artist, year, genre, label, country, price, color, cover, JSON.stringify(images || []), inStock ? 1 : 0, description, JSON.stringify(tracks || []), req.params.id);
  res.json({ success: true });
});
router.delete('/:id', checkAdmin, (req, res) => {
  db.prepare('DELETE FROM records WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});
module.exports = router;