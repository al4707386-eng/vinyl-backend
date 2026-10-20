const express = require('express');
const db = require('../db/init');
const checkAdmin = require('../middleware/checkAdmin');
const router = express.Router();

router.get('/', async (req, res) => {
  const result = await db.query('SELECT * FROM records');
  const records = result.rows.map(r => ({ ...r, inStock: Boolean(r.inStock), images: JSON.parse(r.images), tracks: JSON.parse(r.tracks) }));
  res.json(records);
});

router.get('/:id', async (req, res) => {
  const result = await db.query('SELECT * FROM records WHERE id = $1', [req.params.id]);
  if (result.rows.length === 0) return res.status(404).json({ error: 'Не найдено' });
  const r = result.rows[0];
  res.json({ ...r, inStock: Boolean(r.inStock), images: JSON.parse(r.images), tracks: JSON.parse(r.tracks) });
});

router.post('/', checkAdmin, async (req, res) => {
  try {
    const { id, title, artist, year, genre, label, country, price, color, cover, images, inStock, description, tracks } = req.body;
    await db.query(`INSERT INTO records (id, title, artist, year, genre, label, country, price, color, cover, images, "inStock", description, tracks) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`, [id, title, artist, year, genre, label, country, price, color, cover, JSON.stringify(images || []), inStock ? 1 : 0, description, JSON.stringify(tracks || [])]);
    res.status(201).json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

router.patch('/:id', checkAdmin, async (req, res) => {
  const { title, artist, year, genre, label, country, price, color, cover, images, inStock, description, tracks } = req.body;
  await db.query(`UPDATE records SET title=$1, artist=$2, year=$3, genre=$4, label=$5, country=$6, price=$7, color=$8, cover=$9, images=$10, "inStock"=$11, description=$12, tracks=$13 WHERE id=$14`, [title, artist, year, genre, label, country, price, color, cover, JSON.stringify(images || []), inStock ? 1 : 0, description, JSON.stringify(tracks || []), req.params.id]);
  res.json({ success: true });
});

router.delete('/:id', checkAdmin, async (req, res) => {
  await db.query('DELETE FROM records WHERE id = $1', [req.params.id]);
  res.json({ success: true });
});
module.exports = router;