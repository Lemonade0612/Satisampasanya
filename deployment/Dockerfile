FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:all

FROM nginx:stable-alpine AS frontend
COPY --from=build /app/dist /usr/share/nginx/html
COPY deployment/nginx.conf /etc/nginx/conf.d/default.conf

FROM nginx:stable-alpine AS admin
COPY --from=build /app/admin/dist /usr/share/nginx/html
COPY deployment/nginx.conf /etc/nginx/conf.d/default.conf

FROM node:24-bookworm-slim AS backend
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY backend ./backend
COPY shared ./shared
COPY scripts/mongo-backup.mjs ./scripts/mongo-backup.mjs
ENV API_HOST=0.0.0.0 API_PORT=3001 DATABASE_PATH=/data/sati.sqlite
EXPOSE 3001
CMD ["node", "backend/server.mjs"]
