const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db/init');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Заполните все поля' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ error: 'Email уже используется' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insert = db.prepare(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)'
    );
    const result = insert.run(name, email, hashedPassword);

    res.status(201).json({
      id: result.lastInsertRowid,
      name,
      email,
    });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера при регистрации' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Заполните все поля' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    res.json({ id: user.id, name: user.name, email: user.email });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера при входе' });
  }
});

module.exports = router;