const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

async function initDb() {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password TEXT NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
    await pool.query(`CREATE TABLE IF NOT EXISTS orders (id SERIAL PRIMARY KEY, "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, items TEXT NOT NULL, total REAL NOT NULL, status TEXT NOT NULL DEFAULT 'новый', "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
    await pool.query(`CREATE TABLE IF NOT EXISTS images (id SERIAL PRIMARY KEY, filename TEXT NOT NULL, path TEXT NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
    await pool.query(`CREATE TABLE IF NOT EXISTS records (id TEXT PRIMARY KEY, title TEXT NOT NULL, artist TEXT NOT NULL, year INTEGER, genre TEXT, label TEXT, country TEXT, price REAL NOT NULL, color TEXT, cover TEXT, images TEXT NOT NULL DEFAULT '[]', "inStock" INTEGER NOT NULL DEFAULT 1, description TEXT, tracks TEXT NOT NULL DEFAULT '[]')`);
    await pool.query(`CREATE TABLE IF NOT EXISTS favorites (id SERIAL PRIMARY KEY, "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, "recordId" TEXT NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE("userId", "recordId"))`);
    console.log('База данных инициализирована');
  } catch (err) {
    console.error('Ошибка инициализации БД:', err);
  }
}
initDb();
module.exports = { query: (text, params) => pool.query(text, params) };