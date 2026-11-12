# Backend-only image for Render (free tier, no disk). Small and fast to cold-start.
# The only runtime dependency is the MongoDB driver (snapshots); SQLite is built into Node 24.
FROM node:24-alpine AS deps
WORKDIR /app
RUN echo '{"name":"sati-backend","private":true,"type":"module"}' > package.json \
 && npm install --omit=dev --no-package-lock --no-audit --no-fund mongodb@7.7.0 \
 && npm cache clean --force

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production DATABASE_PATH=/app/data/sati.sqlite
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY shared ./shared
COPY backend ./backend
COPY scripts/promote-admin.mjs ./scripts/promote-admin.mjs
RUN rm -f backend/*.test.mjs && mkdir -p /app/data && chown -R node:node /app/data
USER node
EXPOSE 10000
# Run node directly (not npm) so SIGTERM reaches the server and the final backup runs.
CMD ["node", "backend/server.mjs"]
