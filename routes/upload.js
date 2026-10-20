const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db/init');
const checkAdmin = require('../middleware/checkAdmin');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });


router.post('/', checkAdmin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не передан' });
    }

    const filePath = `/uploads/${req.file.filename}`;

    const insert = db.prepare(
      'INSERT INTO images (filename, path) VALUES (?, ?)'
    );
    const result = insert.run(req.file.originalname, filePath);

    res.status(201).json({
      id: result.lastInsertRowid,
      filename: req.file.originalname,
      path: filePath,
    });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера при загрузке' });
  }
});

router.get('/', checkAdmin, (req, res) => {
  const images = db.prepare('SELECT * FROM images ORDER BY createdAt DESC').all();
  res.json(images);
});

router.delete('/:id', checkAdmin, async (req, res) => {
  try {
    const image = db.prepare('SELECT * FROM images WHERE id = ?').get(req.params.id);

    if (!image) {
      return res.status(404).json({ error: 'Изображение не найдено' });
    }

    const filePath = path.join(__dirname, '..', 'uploads', path.basename(image.path));
    try {
      await fs.promises.unlink(filePath);
    } catch (unlinkError) {
    }

    db.prepare('DELETE FROM images WHERE id = ?').run(req.params.id);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера при удалении' });
  }
});

module.exports = router;