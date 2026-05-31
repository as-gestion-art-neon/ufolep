const express = require('express');
const { getDb, bcrypt } = require('../db/init');

const router = express.Router();

router.post('/login', (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: 'Mot de passe requis' });
  }

  const db = getDb();
  const admin = db.prepare('SELECT * FROM admin LIMIT 1').get();

  if (admin && bcrypt.compareSync(password, admin.password)) {
    req.session.authenticated = true;
    return res.json({ ok: true });
  }
  return res.status(401).json({ error: 'Mot de passe incorrect' });
});

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ ok: true });
});

router.post('/password', (req, res) => {
  if (!req.session || !req.session.authenticated) {
    return res.status(401).json({ error: 'Non authentifié' });
  }
  const { currentPassword, newPassword } = req.body;
  const db = getDb();
  const admin = db.prepare('SELECT * FROM admin LIMIT 1').get();

  if (!bcrypt.compareSync(currentPassword, admin.password)) {
    return res.status(403).json({ error: 'Mot de passe actuel incorrect' });
  }
  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json({ error: 'Nouveau mot de passe trop court' });
  }

  const hashed = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE admin SET password = ?').run(hashed);
  res.json({ ok: true });
});

router.get('/session', (req, res) => {
  res.json({ authenticated: !!(req.session && req.session.authenticated) });
});

module.exports = router;
