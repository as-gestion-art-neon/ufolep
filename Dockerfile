FROM node:18-bookworm
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN mkdir -p /app/data && chown -R node:node /app
USER node
CMD ["node", "src/app.js"]
