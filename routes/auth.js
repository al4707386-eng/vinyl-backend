const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db/init');
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Заполните все поля' });
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) return res.status(400).json({ error: 'Email уже используется' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id', [name, email, hashedPassword]);
    res.status(201).json({ id: result.rows[0].id, name, email });
  } catch (error) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ error: 'Неверный email или пароль' });
    res.json({ id: user.id, name: user.name, email: user.email });
  } catch (error) { res.status(500).json({ error: 'Ошибка сервера' }); }
});
module.exports = router;