const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getDb } = require('../db/init');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, '../../public/images/uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(UPLOAD_DIR, req.body.sport);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9àâçéèêëîïôùûüÿæœ\s-]/g, '')
      .replace(/\s+/g, '-');
    const name = `${basename}-${Date.now()}${ext}`;
    cb(null, name);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format de fichier non supporté'));
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier reçu' });
  }
  const { sport, alt } = req.body;
  if (!sport) {
    return res.status(400).json({ error: 'Sport requis' });
  }

  const db = getDb();
  const result = db.prepare(
    'INSERT INTO images (sport, filename, original_name, alt) VALUES (?, ?, ?, ?)'
  ).run(sport, req.file.filename, req.file.originalname, alt || '');

  res.json({ ok: true, id: result.lastInsertRowid, filename: req.file.filename });
});

router.delete('/:id', requireAuth, (req, res) => {
  const db = getDb();
  const image = db.prepare('SELECT * FROM images WHERE id = ?').get(req.params.id);
  if (!image) {
    return res.status(404).json({ error: 'Image non trouvée' });
  }

  const filePath = path.join(UPLOAD_DIR, image.sport, image.filename);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // file might already be gone
  }

  db.prepare('DELETE FROM images WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

router.get('/', (req, res) => {
  const db = getDb();
  const images = db.prepare('SELECT id, sport, filename, original_name, alt, created_at FROM images ORDER BY created_at DESC').all();
  res.json(images);
});

router.post('/contact', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }
  const db = getDb();
  db.prepare('INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)').run(name, email, message);
  res.json({ ok: true });
});

module.exports = router;
