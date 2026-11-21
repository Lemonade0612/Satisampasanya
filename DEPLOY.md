# Sati: run and deploy

## Dev stack (Docker)

```sh
cp .env.example .env        # optional: AI keys, ALLOWED_ORIGINS. Never commit .env.
docker compose up           # backend on :3001 (API_PORT to change), Vite dev server on :5173
```

- `backend` builds `backend/Dockerfile` (Node 24 alpine, non-root, SQLite in the `sati-data` volume, healthcheck on `/health`).
- `frontend-dev` runs Vite with hot reload; `node_modules` lives in a named volume, so installs are cached and match Linux.
- `AI_PROVIDER` defaults to `mock` here, so the stack works without any API key. Set `AI_PROVIDER=anthropic` and `ANTHROPIC_API_KEY` in `.env` for real answers.

Check it:

```sh
curl localhost:3001/health                                # from the host
docker compose exec backend wget -qO- http://127.0.0.1:3001/health   # inside the container
```

Logs, stop, update:

```sh
docker compose logs -f backend
docker compose down                 # keeps the database volume
docker compose down -v              # also deletes the database: only for throw-away stacks
git pull && docker compose up -d --build backend
```

## Public tunnel (Cloudflare, off by default)

```sh
# Named tunnel with a stable hostname: create it once in the Cloudflare dashboard (Zero Trust > Networks > Tunnels),
# point its public hostname at http://backend:3001, then put the token in .env:
#   CLOUDFLARE_TUNNEL_TOKEN=...
#   TRUST_CLOUDFLARE=true          # so the rate limiter sees the real client IP (CF-Connecting-IP)
docker compose --profile tunnel up -d

# Quick test, no account: prints a temporary https://*.trycloudflare.com address
docker run --rm --network host cloudflare/cloudflared:latest tunnel --no-autoupdate --url http://localhost:3001
```

Then set `VITE_API_URL=https://<tunnel-host>/api` in the Vercel project env and add the site origin to `ALLOWED_ORIGINS` (the Vercel sites and their previews are allowed by default).
Restart the tunnel: `docker compose restart cloudflared`.

## Mobile simulators (run on the host, not in Docker)

The iOS Simulator needs macOS and Xcode; the Android emulator needs the Android SDK. Both talk to the backend container on the published port.

```sh
npm run sim:ios        # build web, cap sync, iPhone 15 simulator (falls back to the first iPhone)
npm run sim:android    # build web, cap sync, AVD Pixel_7 (create it first, see the error message)
npm run dev:mobile     # live reload on the iOS Simulator through the Mac's LAN IP
```

iOS reaches the backend at `http://localhost:3001`, Android at `http://10.0.2.2:3001` (set at build time through `VITE_API_URL`).
For `dev:mobile` start the backend with `API_HOST=0.0.0.0 npm run backend` (or use the container).

## Environment variables (names only)

`AI_PROVIDER` `ANTHROPIC_API_KEY` `ANTHROPIC_MODEL` `OPENAI_API_KEY` `OPENROUTER_API_KEY` `ALLOWED_ORIGINS` `CORS_REPLACE_DEFAULTS`
`TRUST_CLOUDFLARE` `TRUST_PROXY` `MAIL_TRANSPORT` `SMTP_URL` `MAIL_FROM` `APP_URL` `LOCAL_SCREEN` (`off` disables local-first screening)
`DATABASE_PATH` `PORT` `API_HOST` `API_PORT` `MONGODB_URI` `CLOUDFLARE_TUNNEL_TOKEN`. See `.env.example`.
