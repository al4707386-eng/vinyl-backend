const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../db/init');
const checkAdmin = require('../middleware/checkAdmin');

const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

router.post('/', checkAdmin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Файл не передан' });
    const filePath = `/uploads/${req.file.filename}`;
    db.prepare('INSERT INTO images (filename, path) VALUES (?, ?)').run(req.file.originalname, filePath);
    res.status(201).json({ path: filePath });
  } catch (error) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

router.get('/', checkAdmin, (req, res) => {
  res.json(db.prepare('SELECT * FROM images ORDER BY createdAt DESC').all());
});

router.delete('/:id', checkAdmin, (req, res) => {
  db.prepare('DELETE FROM images WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});
module.exports = router;