// ============================================================
//  routes/galerie.js — CRUD de la galerie photos
// ============================================================
const express = require('express');
const fs = require('fs');
const path = require('path');
const db = require('../db/database');
const { requireAuth } = require('../middleware/auth');
const { upload, UPLOAD_DIR } = require('../middleware/upload');

const router = express.Router();
const THUMB_DIR = path.join(UPLOAD_DIR, 'thumbs');
if (!fs.existsSync(THUMB_DIR)) fs.mkdirSync(THUMB_DIR, { recursive: true });

// NB : pas de redimensionnement serveur (pas de dépendance native type "sharp",
// pour simplifier le build Docker). On copie le fichier original comme "miniature" ;
// le navigateur affiche déjà l'image en taille réduite côté CSS (object-fit: cover).
// Pour un vrai redimensionnement serveur, ajouter "sharp" aux dépendances et
// remplacer la fonction ci-dessous.
function makeThumb(filename) {
  const srcPath = path.join(UPLOAD_DIR, filename);
  const thumbName = `thumb-${filename}`;
  const thumbPath = path.join(THUMB_DIR, thumbName);
  try {
    fs.copyFileSync(srcPath, thumbPath);
    return `/uploads/thumbs/${thumbName}`;
  } catch (err) {
    console.error('Erreur génération miniature:', err.message);
    return `/uploads/${filename}`; // fallback : image originale
  }
}

// ---- PUBLIC : liste des photos publiées ----
// GET /api/galerie
router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT id, titre, description, image_path, thumb_path, categorie, created_at
    FROM galerie
    WHERE publie = 1
    ORDER BY ordre ASC, created_at DESC
  `).all();
  res.json(rows);
});

// ---- ADMIN : liste complète ----
router.get('/admin/all', requireAuth, (req, res) => {
  const rows = db.prepare(`SELECT * FROM galerie ORDER BY ordre ASC, created_at DESC`).all();
  res.json(rows);
});

// ---- ADMIN : upload d'une ou plusieurs photos ----
// POST /api/galerie  (multipart/form-data, champ "images" multiple)
router.post('/', requireAuth, upload.array('images', 20), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'Aucune image envoyée' });
  }

  const { titre, description, categorie } = req.body;

  const insert = db.prepare(`
    INSERT INTO galerie (titre, description, image_path, thumb_path, categorie, publie, ordre)
    VALUES (?, ?, ?, ?, ?, 1, 0)
  `);

  const created = [];
  for (const file of req.files) {
    const thumb_path = makeThumb(file.filename);
    const image_path = `/uploads/${file.filename}`;
    const result = insert.run(
      titre || file.originalname,
      description || '',
      image_path,
      thumb_path,
      categorie || 'Général'
    );
    created.push(db.prepare('SELECT * FROM galerie WHERE id = ?').get(result.lastInsertRowid));
  }

  res.status(201).json(created);
});

// ---- ADMIN : mettre à jour les métadonnées d'une photo ----
router.put('/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM galerie WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Photo introuvable' });

  const { titre, description, categorie, publie, ordre } = req.body;

  db.prepare(`
    UPDATE galerie SET titre = ?, description = ?, categorie = ?, publie = ?, ordre = ?
    WHERE id = ?
  `).run(
    titre ?? existing.titre,
    description ?? existing.description,
    categorie ?? existing.categorie,
    publie === undefined ? existing.publie : Number(publie),
    ordre === undefined ? existing.ordre : Number(ordre),
    id
  );

  res.json(db.prepare('SELECT * FROM galerie WHERE id = ?').get(id));
});

// ---- ADMIN : supprimer une photo ----
router.delete('/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM galerie WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Photo introuvable' });

  const file = path.join(UPLOAD_DIR, path.basename(existing.image_path));
  if (fs.existsSync(file)) fs.unlinkSync(file);

  if (existing.thumb_path) {
    const thumbFile = path.join(UPLOAD_DIR, 'thumbs', path.basename(existing.thumb_path));
    if (fs.existsSync(thumbFile)) fs.unlinkSync(thumbFile);
  }

  db.prepare('DELETE FROM galerie WHERE id = ?').run(id);
  res.json({ success: true });
});

module.exports = router;
