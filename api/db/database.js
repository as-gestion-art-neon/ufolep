// ============================================================
//  db/database.js — Initialisation SQLite (better-sqlite3)
// ============================================================
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const DB_PATH = path.join(DB_DIR, 'ufolep86.sqlite');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');

// ---- Schéma ----
db.exec(`
  CREATE TABLE IF NOT EXISTS actualites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titre TEXT NOT NULL,
    extrait TEXT,
    contenu TEXT,
    tag TEXT DEFAULT 'Info',
    date_evenement TEXT,
    image_path TEXT,
    publie INTEGER DEFAULT 1,
    ordre INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS galerie (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titre TEXT,
    description TEXT,
    image_path TEXT NOT NULL,
    thumb_path TEXT,
    categorie TEXT DEFAULT 'Général',
    publie INTEGER DEFAULT 1,
    ordre INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

module.exports = db;
