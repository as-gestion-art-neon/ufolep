// ============================================================
//  config.js — Configuration globale du frontend
// ============================================================

// L'API tourne dans un conteneur séparé (voir docker-compose.yml).
// En production, Nginx proxy /api/* et /uploads/* vers le conteneur API
// (voir nginx/default.conf), donc on utilise des chemins relatifs.
window.UFOLEP_CONFIG = {
  API_BASE: '/api',
  UPLOADS_BASE: '', // les chemins renvoyés par l'API sont déjà préfixés par /uploads/...
};
