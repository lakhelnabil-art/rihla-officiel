# syntax=docker/dockerfile:1

FROM node:20-alpine AS client
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html vite.config.js tailwind.config.js postcss.config.js ./
COPY public ./public
COPY src ./src
RUN npm run build

FROM node:20-alpine AS server
WORKDIR /app/server
RUN apk add --no-cache python3 make g++
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev
COPY server/ ./
COPY --from=client /app/dist /app/dist

ENV NODE_ENV=production
ENV PORT=3001
ENV DATABASE_PATH=/data/rihla.db
ENV STATIC_DIR=/app/dist

RUN mkdir -p /data
VOLUME /data
EXPOSE 3001

# Au démarrage : crée le compte de démo si la base est vide (sans risque si déjà présent), puis lance le serveur
CMD ["sh", "-c", "node src/scripts/seed-demo-essaouira.js || true; node src/index.js"]
