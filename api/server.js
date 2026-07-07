// ============================================================
//  server.js — Serveur API UFOLEP 86 (Express)
// ============================================================
require('dotenv').config();
require('./db/seed'); // initialise admin + données démo

const express = require('express');
const cors = require('cors');
const path = require('path');
const { UPLOAD_DIR } = require('./middleware/upload');

const authRoutes = require('./routes/auth');
const actualitesRoutes = require('./routes/actualites');
const galerieRoutes = require('./routes/galerie');

const app = express();
const PORT = process.env.API_PORT || 4000;

// ---- Middlewares ----
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers uploadés
app.use('/uploads', express.static(UPLOAD_DIR));

// ---- Routes ----
app.use('/api/auth', authRoutes);
app.use('/api/actualites', actualitesRoutes);
app.use('/api/galerie', galerieRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'ufolep86-api', timestamp: new Date().toISOString() });
});

// ---- Gestion erreurs Multer / globale ----
app.use((err, req, res, next) => {
  if (err) {
    console.error('Erreur API:', err.message);
    return res.status(400).json({ error: err.message || 'Erreur serveur' });
  }
  next();
});

app.listen(PORT, () => {
  console.log(`🚀 API UFOLEP 86 démarrée sur le port ${PORT}`);
});
