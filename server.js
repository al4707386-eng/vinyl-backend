require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
require('./db/init');

const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const ordersRouter = require('./routes/orders');
const uploadRouter = require('./routes/upload');
const recordsRouter = require('./routes/records');
const favoritesRouter = require('./routes/favorites');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));

app.get('/api/ping', (req, res) => res.json({ message: 'Сервер VinylRoom работает' }));

app.use('/api', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/records', recordsRouter);
app.use('/api/favorites', favoritesRouter);

app.use((req, res) => res.status(404).json({ error: 'Маршрут не найден' }));
app.use((err, req, res, next) => { console.error(err); res.status(500).json({ error: 'Внутренняя ошибка' }); });

module.exports = app;
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Сервер: http://localhost:${PORT}`));
}