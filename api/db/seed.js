// ============================================================
//  db/seed.js — Crée le compte admin par défaut si absent
//  Mot de passe défini via variables d'env ADMIN_USER / ADMIN_PASSWORD
// ============================================================
const bcrypt = require('bcryptjs');
const db = require('./database');

function seedAdmin() {
  const username = process.env.ADMIN_USER || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'ufolep86-changeme';

  const existing = db.prepare('SELECT id FROM admin_users WHERE username = ?').get(username);

  if (!existing) {
    const hash = bcrypt.hashSync(password, 10);
    db.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)').run(username, hash);
    console.log(`✅ Compte admin créé : ${username}`);
  } else {
    // Toujours resynchroniser le mot de passe avec la variable d'env au démarrage
    // (pratique pour changer le mdp via Portainer sans toucher à la DB)
    const hash = bcrypt.hashSync(password, 10);
    db.prepare('UPDATE admin_users SET password_hash = ? WHERE username = ?').run(hash, username);
    console.log(`🔄 Mot de passe admin resynchronisé : ${username}`);
  }
}

// Quelques actualités de démo si la table est vide
function seedActualites() {
  const count = db.prepare('SELECT COUNT(*) as c FROM actualites').get().c;
  if (count > 0) return;

  const insert = db.prepare(`
    INSERT INTO actualites (titre, extrait, contenu, tag, date_evenement, publie, ordre)
    VALUES (@titre, @extrait, @contenu, @tag, @date_evenement, 1, @ordre)
  `);

  const demo = [
    {
      titre: 'Assemblée Générale Annuelle',
      extrait: "Rejoignez-nous pour faire le bilan de la saison et préparer l'avenir de l'association.",
      contenu: "Rejoignez-nous pour faire le bilan de la saison et préparer l'avenir de l'association. Ouvert à tous les membres.",
      tag: 'À venir',
      date_evenement: 'Été 2025',
      ordre: 1,
    },
    {
      titre: 'Ouverture des inscriptions',
      extrait: 'Les clubs affiliés UFOLEP 86 ouvrent leurs portes pour la nouvelle saison sportive.',
      contenu: 'Les clubs affiliés UFOLEP 86 ouvrent leurs portes pour la nouvelle saison sportive. Trouvez votre club !',
      tag: 'Inscription',
      date_evenement: 'Rentrée 2025',
      ordre: 2,
    },
    {
      titre: 'Palmarès départemental',
      extrait: 'Retrouvez les résultats et classements de toutes les compétitions organisées dans la Vienne.',
      contenu: 'Retrouvez les résultats et classements de toutes les compétitions organisées dans la Vienne cette saison.',
      tag: 'Résultats',
      date_evenement: 'Saison 2024–2025',
      ordre: 3,
    },
  ];

  const tx = db.transaction((items) => {
    for (const it of items) insert.run(it);
  });
  tx(demo);
  console.log('✅ Actualités de démonstration insérées');
}

seedAdmin();
seedActualites();

module.exports = { seedAdmin, seedActualites };
