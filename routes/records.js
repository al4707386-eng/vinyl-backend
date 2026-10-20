const express = require('express');
const db = require('../db/init');
const checkAdmin = require('../middleware/checkAdmin');

const router = express.Router();

function parseRecord(row) {
  return {
    ...row,
    inStock: Boolean(row.inStock),
    images: JSON.parse(row.images || '[]'),
    tracks: JSON.parse(row.tracks || '[]'),
  };
}

router.get('/', (req, res) => {
  const records = db.prepare('SELECT * FROM records').all();
  res.json(records.map(parseRecord));
});

router.get('/:id', (req, res) => {
  const record = db.prepare('SELECT * FROM records WHERE id = ?').get(req.params.id);

  if (!record) {
    return res.status(404).json({ error: 'Пластинка не найдена' });
  }

  res.json(parseRecord(record));
});

router.post('/', checkAdmin, (req, res) => {
  try {
    const {
      id, title, artist, year, genre, label, country,
      price, color, cover, images, inStock, description, tracks,
    } = req.body;

    if (!id || !title || !artist || price == null) {
      return res.status(400).json({ error: 'Заполните id, title, artist и price' });
    }

    const existing = db.prepare('SELECT id FROM records WHERE id = ?').get(id);
    if (existing) {
      return res.status(400).json({ error: 'Пластинка с таким id уже существует' });
    }

    db.prepare(`
      INSERT INTO records
        (id, title, artist, year, genre, label, country, price, color, cover, images, inStock, description, tracks)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      title,
      artist,
      year || null,
      genre || null,
      label || null,
      country || null,
      price,
      color || null,
      cover || null,
      JSON.stringify(images || []),
      inStock ? 1 : 0,
      description || null,
      JSON.stringify(tracks || [])
    );

    res.status(201).json({ success: true, id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера при создании' });
  }
});

router.patch('/:id', checkAdmin, (req, res) => {
  const record = db.prepare('SELECT * FROM records WHERE id = ?').get(req.params.id);
  if (!record) {
    return res.status(404).json({ error: 'Пластинка не найдена' });
  }

  const { title, artist, year, genre, label, country, price, color, cover, images, inStock, description, tracks } = req.body;

  db.prepare(`
    UPDATE records SET
      title = ?, artist = ?, year = ?, genre = ?, label = ?, country = ?,
      price = ?, color = ?, cover = ?, images = ?, inStock = ?, description = ?, tracks = ?
    WHERE id = ?
  `).run(
    title ?? record.title,
    artist ?? record.artist,
    year ?? record.year,
    genre ?? record.genre,
    label ?? record.label,
    country ?? record.country,
    price ?? record.price,
    color ?? record.color,
    cover ?? record.cover,
    images ? JSON.stringify(images) : record.images,
    inStock != null ? (inStock ? 1 : 0) : record.inStock,
    description ?? record.description,
    tracks ? JSON.stringify(tracks) : record.tracks,
    req.params.id
  );

  res.json({ success: true });
});

router.delete('/:id', checkAdmin, (req, res) => {
  const result = db.prepare('DELETE FROM records WHERE id = ?').run(req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Пластинка не найдена' });
  }

  res.json({ success: true });
});

module.exports = router;