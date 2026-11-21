# syntax=docker/dockerfile:1.7
# Sati backend. Build from the repo root:  docker build -f backend/Dockerfile -t sati-backend .
# Node 24, not 20: the backend uses the built-in node:sqlite module, which Node 20 does not have.
FROM node:24-alpine AS deps
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
# BuildKit cache: npm's download cache is reused between builds.
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev --no-audit --no-fund

FROM node:24-alpine
ENV NODE_ENV=production DATABASE_PATH=/data/sati.sqlite PORT=3001 API_HOST=0.0.0.0
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY shared ./shared
COPY rules ./rules
COPY backend ./backend
COPY scripts/promote-admin.mjs ./scripts/promote-admin.mjs
# Tests are not shipped. backend/screening/testdata/en.jsonl stays: the typo-repair vocabulary is built from it at start-up.
RUN rm -f backend/*.test.mjs backend/test-helpers.mjs && mkdir -p /data && chown -R node:node /data
USER node
# SQLite lives in the /data volume, so the database survives container rebuilds.
VOLUME /data
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 CMD wget -qO- "http://127.0.0.1:${PORT}/health" || exit 1
# Run node directly (not npm) so SIGTERM reaches the server and the final backup runs.
CMD ["node", "backend/server.mjs"]
