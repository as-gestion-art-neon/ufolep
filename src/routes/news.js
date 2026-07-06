const express = require('express');
const { getDb } = require('../db/init');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  const db = getDb();
  const news = db.prepare('SELECT id, title, content, created_at FROM news ORDER BY created_at DESC, id DESC').all();
  res.json(news);
});

router.post('/', requireAuth, (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Titre et contenu requis' });
  }
  const db = getDb();
  const result = db.prepare('INSERT INTO news (title, content) VALUES (?, ?)').run(title.trim(), content.trim());
  res.json({ ok: true, id: result.lastInsertRowid });
});

router.delete('/:id', requireAuth, (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM news WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Actualité non trouvée' });
  }
  res.json({ ok: true });
});

module.exports = router;
