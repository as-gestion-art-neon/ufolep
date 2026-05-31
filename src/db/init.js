const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcrypt');
const fs = require('fs');

const DB_PATH = path.join(process.env.DB_DIR || __dirname, 'ufolep.db');

let db;

function getDb() {
  if (!db) {
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initTables();
  }
  return db;
}

function initTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sport TEXT NOT NULL,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      alt TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

function seedAdmin() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      password TEXT NOT NULL
    );
  `);
  const existing = db.prepare('SELECT id FROM admin LIMIT 1').get();
  if (!existing) {
    const password = process.env.ADMIN_PASSWORD || 'Ufolep2025!';
    const hashed = bcrypt.hashSync(password, 10);
    db.prepare('INSERT INTO admin (password) VALUES (?)').run(hashed);
  }
}

const _init = getDb();
seedAdmin();

module.exports = { getDb, bcrypt };
