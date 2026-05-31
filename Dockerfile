FROM node:22-bookworm
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN mkdir -p /app/data && chown -R node:node /app
USER node
CMD ["node", "src/app.js"]
