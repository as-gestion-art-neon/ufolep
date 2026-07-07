// ============================================================
//  routes/actualites.js — CRUD des actualités
// ============================================================
const express = require('express');
const fs = require('fs');
const path = require('path');
const db = require('../db/database');
const { requireAuth } = require('../middleware/auth');
const { upload, UPLOAD_DIR } = require('../middleware/upload');

const router = express.Router();

// ---- PUBLIC : liste des actualités publiées ----
// GET /api/actualites
router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT id, titre, extrait, contenu, tag, date_evenement, image_path, created_at
    FROM actualites
    WHERE publie = 1
    ORDER BY ordre ASC, created_at DESC
  `).all();
  res.json(rows);
});

// ---- ADMIN : liste complète (y compris non publiées) ----
// GET /api/actualites/admin/all
router.get('/admin/all', requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM actualites ORDER BY ordre ASC, created_at DESC
  `).all();
  res.json(rows);
});

// ---- ADMIN : créer une actualité ----
// POST /api/actualites  (multipart/form-data avec champ "image")
router.post('/', requireAuth, upload.single('image'), (req, res) => {
  const { titre, extrait, contenu, tag, date_evenement, publie, ordre } = req.body;

  if (!titre) {
    return res.status(400).json({ error: 'Le titre est requis' });
  }

  const image_path = req.file ? `/uploads/${req.file.filename}` : null;

  const result = db.prepare(`
    INSERT INTO actualites (titre, extrait, contenu, tag, date_evenement, image_path, publie, ordre)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    titre,
    extrait || '',
    contenu || '',
    tag || 'Info',
    date_evenement || '',
    image_path,
    publie === undefined ? 1 : Number(publie),
    ordre ? Number(ordre) : 0
  );

  const created = db.prepare('SELECT * FROM actualites WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(created);
});

// ---- ADMIN : mettre à jour une actualité ----
// PUT /api/actualites/:id
router.put('/:id', requireAuth, upload.single('image'), (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM actualites WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Actualité introuvable' });

  const { titre, extrait, contenu, tag, date_evenement, publie, ordre } = req.body;

  let image_path = existing.image_path;
  if (req.file) {
    // Supprimer l'ancienne image si elle existe
    if (existing.image_path) {
      const oldFile = path.join(UPLOAD_DIR, path.basename(existing.image_path));
      if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
    }
    image_path = `/uploads/${req.file.filename}`;
  }

  db.prepare(`
    UPDATE actualites SET
      titre = ?, extrait = ?, contenu = ?, tag = ?, date_evenement = ?,
      image_path = ?, publie = ?, ordre = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(
    titre ?? existing.titre,
    extrait ?? existing.extrait,
    contenu ?? existing.contenu,
    tag ?? existing.tag,
    date_evenement ?? existing.date_evenement,
    image_path,
    publie === undefined ? existing.publie : Number(publie),
    ordre === undefined ? existing.ordre : Number(ordre),
    id
  );

  const updated = db.prepare('SELECT * FROM actualites WHERE id = ?').get(id);
  res.json(updated);
});

// ---- ADMIN : supprimer une actualité ----
// DELETE /api/actualites/:id
router.delete('/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM actualites WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Actualité introuvable' });

  if (existing.image_path) {
    const file = path.join(UPLOAD_DIR, path.basename(existing.image_path));
    if (fs.existsSync(file)) fs.unlinkSync(file);
  }

  db.prepare('DELETE FROM actualites WHERE id = ?').run(id);
  res.json({ success: true });
});

module.exports = router;
