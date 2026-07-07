# ── API UFOLEP 86 (Node.js + Express + SQLite)
FROM node:20-alpine

# Dépendances système pour la compilation de better-sqlite3 (si pas de prebuild dispo)
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY . .

# Dossiers persistants (montés en volume via docker-compose)
RUN mkdir -p /app/data /app/uploads/thumbs

EXPOSE 4000

CMD ["node", "server.js"]
