# UFOLEP 86 – Site Web + Administration

Site de présentation de l'UFOLEP 86 (Vienne – Nouvelle-Aquitaine), avec espace
d'administration pour gérer les **actualités** et la **galerie photos** sans toucher au code.

---

## 🏗️ Architecture

Le projet est composé de **deux conteneurs** :

| Service | Rôle | Techno |
|---|---|---|
| `ufolep86-web` | Site statique (HTML/CSS/JS) + reverse proxy vers l'API | Nginx |
| `ufolep86-api` | API REST : actualités, galerie, authentification admin | Node.js, Express, SQLite |

Le frontend appelle l'API via des chemins relatifs (`/api/...`, `/uploads/...`),
proxifiés par Nginx vers le conteneur API — pas de CORS à gérer, pas de port API exposé publiquement.

```
ufolep86-website/
├── src/                        ← Frontend statique
│   ├── index.html              ← Page d'accueil (hero, activités, carte, galerie, actus, contact)
│   ├── rapport-activites.html
│   ├── insertion-sport.html
│   ├── mission-locale.html
│   ├── pjj-milieu-carceral.html
│   ├── esport.html
│   ├── admin/                  ← Interface d'administration (/admin)
│   │   ├── index.html
│   │   ├── css/admin.css
│   │   └── js/admin.js
│   ├── css/style.css
│   ├── js/
│   │   ├── config.js           ← URL de l'API
│   │   ├── layout.js           ← Header/footer communs
│   │   ├── main.js             ← Animations, formulaire contact
│   │   ├── map.js              ← Carte Leaflet (lieux d'intervention)
│   │   ├── news-rail.js        ← Bandeau actualités vertical sticky
│   │   └── galerie.js          ← Galerie photos + lightbox
│   └── images/
├── api/                        ← Backend API
│   ├── server.js
│   ├── db/
│   │   ├── database.js         ← Schéma SQLite
│   │   └── seed.js             ← Création du compte admin au démarrage
│   ├── routes/
│   │   ├── auth.js             ← POST /api/auth/login
│   │   ├── actualites.js       ← CRUD actualités
│   │   └── galerie.js          ← CRUD galerie + génération miniatures
│   ├── middleware/
│   │   ├── auth.js             ← Vérification JWT
│   │   └── upload.js           ← Upload Multer
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
├── nginx/
│   └── default.conf            ← Proxy /api et /uploads vers le conteneur API
├── Dockerfile                  ← Frontend (Nginx)
├── docker-compose.yml          ← Stack complète (2 services + volumes)
├── .env.example
└── README.md
```

---

## 🚀 Déploiement via Portainer (Stack depuis GitHub)

### 1. Pousser le repo sur GitHub

```bash
git init
git add .
git commit -m "Initial commit – Site UFOLEP 86 + admin"
git remote add origin https://github.com/<votre-org>/ufolep86-website.git
git push -u origin main
```

### 2. Créer la Stack dans Portainer

1. **Portainer** → **Stacks** → **+ Add stack**
2. Choisir **Repository**
3. Renseigner :
   - **Repository URL** : `https://github.com/<votre-org>/ufolep86-website`
   - **Repository reference** : `refs/heads/main`
   - **Compose path** : `docker-compose.yml`
4. Dans **Environment variables**, ajouter (voir `.env.example`) :
   - `PORT` = `9430` (ou autre port libre)
   - `ADMIN_USER` = identifiant souhaité
   - `ADMIN_PASSWORD` = **mot de passe fort**
   - `JWT_SECRET` = chaîne aléatoire longue (ex: générée via `openssl rand -hex 32`)
5. (Optionnel) Activer **GitOps updates** pour un redéploiement automatique à chaque push
6. Cliquer **Deploy the stack**

### 3. Accès

- **Site public** : `http://<ip-serveur>:9430`
- **Administration** : `http://<ip-serveur>:9430/admin/`

### ⚠️ Mise à jour de la stack : forcer le rebuild des images

Le bouton **"Update the stack"** de Portainer **ne reconstruit pas** les images si
elles existent déjà sous le même tag — il réutilise le cache, et vos modifications
(HTML, config Nginx, code API…) ne sont pas prises en compte.

**Deux méthodes fiables :**

**Méthode A (recommandée) — versionner les tags :** à chaque modification, incrémentez
le tag d'image dans `docker-compose.yml` (`ufolep86-web:v2` → `v3`, etc.) avant de
pousser sur GitHub. Docker est alors obligé de reconstruire puisque le tag n'existe pas.

**Méthode B — purger manuellement :** dans Portainer :
1. **Stacks** → votre stack → **Stop** puis **Delete** (⚠️ les volumes `ufolep86-data`
   et `ufolep86-uploads` ne sont PAS supprimés, vos données sont conservées)
2. **Images** → supprimer `ufolep86-web` et `ufolep86-api`
3. Recréer la stack depuis le repository

En ligne de commande sur le serveur : `docker compose build --no-cache && docker compose up -d`

---

## 🔐 Espace d'administration

Accessible via `/admin/`, protégé par identifiant + mot de passe (définis via les
variables d'environnement `ADMIN_USER` / `ADMIN_PASSWORD`).

**Fonctionnalités :**
- **Actualités** : créer, modifier, publier/dépublier, réordonner, supprimer — avec image optionnelle. S'affichent automatiquement dans le bandeau vertical sticky et la section "Actualités" de la page d'accueil.
- **Galerie photos** : upload multiple par glisser-déposer ou sélection, génération automatique de miniatures, catégorisation, publication/dépublication, suppression.

Le mot de passe admin est **resynchronisé à chaque démarrage du conteneur** avec la
variable d'environnement `ADMIN_PASSWORD` — pour le changer, il suffit de modifier
la variable dans Portainer et de redéployer la stack (pas besoin de toucher à la base de données).

⚠️ **Changez impérativement `ADMIN_PASSWORD` et `JWT_SECRET` avant la mise en production.**

---

## 🔧 Développement local

### Avec Docker (recommandé — identique à la prod)

```bash
docker compose up --build
# Site : http://localhost:9430
# Admin : http://localhost:9430/admin/
```

### Sans Docker

```bash
# Terminal 1 — API
cd api
npm install
cp .env.example .env   # adapter si besoin
npm start               # démarre sur http://localhost:4000

# Terminal 2 — Frontend (nécessite un proxy /api manuel, ou servir directement)
cd src
python3 -m http.server 8000
# ⚠️ en local sans Nginx, adapter js/config.js avec API_BASE: 'http://localhost:4000/api'
```

---

## 💾 Persistance des données

Deux volumes Docker nommés assurent la persistance entre redéploiements :

| Volume | Contenu |
|---|---|
| `ufolep86-data` | Base SQLite (`ufolep86.sqlite`) : actualités, galerie (métadonnées), compte admin |
| `ufolep86-uploads` | Fichiers images uploadés (actualités, galerie originale + miniatures) |

Ces volumes survivent aux mises à jour de la stack (`git push` + redeploy). Pour une
sauvegarde, exportez ces volumes via Portainer ou `docker run --rm -v ufolep86-data:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz /data`.

> ℹ️ **Miniatures galerie** : pour garder l'image Docker légère et le build fiable
> partout, les "miniatures" sont actuellement une copie du fichier original
> (le redimensionnement visuel se fait côté CSS). Pour un vrai redimensionnement
> serveur (fichiers plus légers), ajoutez la dépendance `sharp` dans
> `api/package.json` et adaptez `api/routes/galerie.js` (voir commentaire dans le fichier).

---

## ✏️ Personnalisation du contenu statique

| Fichier | Contenu |
|---|---|
| `src/index.html` | Page d'accueil : hero, à propos, activités, carte, galerie, contact |
| `src/rapport-activites.html` etc. | Pages "Missions" — blocs `<!-- ✏️ REMPLACER -->` à compléter |
| `src/css/style.css` | Couleurs, typographie, mise en page |
| `src/js/map.js` | Coordonnées des communes sur la carte Leaflet |
| `src/images/` | Logos et photos statiques |

### Couleurs principales (variables CSS dans `style.css`)

```css
--green-dark:  #1a3a2a   /* Fond, boutons principaux */
--green-mid:   #2d6a4f   /* Accents, liens */
--green-light: #52b788   /* Highlights */
--pink:        #e63b6f   /* Gradient titre héro */
--yellow:      #f5c842   /* Gradient titre héro */
--cream:       #f7f4ee   /* Fond général */
```

---

## 🌐 Reverse proxy externe (Traefik / autre)

Pour exposer le site avec un nom de domaine et HTTPS via Traefik, ajoutez des labels
sur le service `ufolep86-web` dans `docker-compose.yml` :

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.ufolep86.rule=Host(`ufolep86.votre-domaine.fr`)"
  - "traefik.http.routers.ufolep86.entrypoints=websecure"
  - "traefik.http.routers.ufolep86.tls.certresolver=letsencrypt"
```

Le conteneur `ufolep86-api` n'a pas besoin d'être exposé : il n'est joignable que
depuis `ufolep86-web` via le réseau interne `ufolep86-network`.
