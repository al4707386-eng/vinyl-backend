const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'database.sqlite'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password TEXT NOT NULL, createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER NOT NULL, items TEXT NOT NULL, total REAL NOT NULL, status TEXT NOT NULL DEFAULT 'новый', createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT, filename TEXT NOT NULL, path TEXT NOT NULL, createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS records (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, artist TEXT NOT NULL, year INTEGER, genre TEXT, label TEXT, country TEXT, price REAL NOT NULL, color TEXT, cover TEXT, images TEXT NOT NULL DEFAULT '[]', inStock INTEGER NOT NULL DEFAULT 1, description TEXT, tracks TEXT NOT NULL DEFAULT '[]'
  )
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER NOT NULL, recordId TEXT NOT NULL, createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(userId, recordId)
  )
`);

module.exports = db;