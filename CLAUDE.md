# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project brief

Site web responsive pour l'association UFOLEP Beaulieu-sur-Layon, présentant ses activités sportives par rubrique, avec les logos fournis. Section administration (login par mot de passe) permettant d'uploader des images dans les sections sportives correspondantes. Déployable via un repository GitHub sur une infrastructure Portainer (Docker).

All site content, UI text, and API error messages are in **French**.

## Commands

```bash
npm install            # install dependencies (better-sqlite3 and bcrypt compile natively)
npm start              # run the server (node src/app.js), listens on PORT (default 3000)
docker compose up --build   # full stack: Node app + nginx, exposed on HTTP_PORT (default 8042)
```

Configuration comes from `.env` (copy `.env.example`): `ADMIN_PASSWORD`, `SESSION_SECRET`, `PORT`. There are no tests and no linter configured.

## Architecture

Two-tier app: an Express server (`src/app.js`) and a vanilla-JS single-page frontend served from `public/`.

### Backend (`src/`)

- `src/app.js` — Express setup: session middleware (`express-session`, cookie-based, 24h), static serving of `public/`, mounts `/api/auth`, `/api/uploads` and `/api/news`, `/api/health` healthcheck, and a catch-all that returns `public/index.html` so client-side routes work on refresh.
- `src/db/init.js` — SQLite via `better-sqlite3`, singleton connection. **Requiring this module has side effects**: it creates the DB file (at `$DB_DIR/ufolep.db`, defaulting to `src/db/`), creates tables (`images`, `news`, `contacts`, `admin`), and seeds the single admin row with a bcrypt hash of `ADMIN_PASSWORD` (default `Ufolep2025!`) if none exists. Changing `ADMIN_PASSWORD` later has no effect on an existing DB — the password is then managed via `POST /api/auth/password`.
- `src/routes/auth.js` — single-admin, password-only auth (no username). Login sets `req.session.authenticated`; `src/middleware/auth.js` (`requireAuth`) guards protected routes.
- `src/routes/news.js` — actualités CRUD: public `GET /api/news`, auth-protected `POST` and `DELETE /:id`. Displayed on the home page and managed from the admin page.
- `src/routes/uploads.js` — multer image uploads (jpeg/png/webp/gif, 10 MB max) stored on disk at `public/images/uploads/<sport>/`, with metadata in the `images` table. Upload and delete require auth; listing (`GET /api/uploads`) is public. Also hosts the public `POST /api/uploads/contact` endpoint (writes to `contacts` table).

### Frontend (`public/`)

No framework, no build step. `index.html` is the shell (nav + footer); `js/main.js` is a hand-rolled SPA router that renders pages into `#mainContent` via `innerHTML`: home, `/contact`, `/admin` (login form, then upload/delete/password-change UI), and `/sport/<slug>` detail pages. `js/data.js` defines `SPORTS_DATA` (slug → name, PDF link, content HTML) and is loaded before `main.js`.

**Adding or renaming a sport requires touching three places**: the `sports` array in `renderHome()` in `main.js`, `SPORTS_DATA` in `data.js`, and the footer list in `index.html`. Sport slugs are also used as upload subdirectory names and as the `sport` column in the DB.

### Docker deployment

`docker-compose.yml` runs two services on an internal network:

- `app` — the Node server (root `Dockerfile`), not exposed directly. Serves everything from `public/`: the site, uploaded images and PDFs (`public/pdf/`).
- `nginx` (`nginx/`) — the only exposed service (`HTTP_PORT`, default 8042), a pure reverse proxy to `app:3000`.

**No persistent storage** (deliberate choice): there are no volumes. The SQLite DB, uploaded images and news live inside the `app` container and are lost when the container is rebuilt or recreated. Content baked into the image at build time (`public/`, including `public/pdf/`) survives rebuilds.

## Assets and reference docs

- Logos and photos at the repo root (`logo ufolep.png`, `logo_ufolep_bannière.jpg`, etc.) with copies used by the site under `public/images/`.
- `sports ufolep.md` and `ESPORT.md` — source content describing the association's sports sections.
