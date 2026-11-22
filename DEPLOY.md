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

## OpenRouter (prototype AI, no Anthropic key)
Set `AI_PROVIDER=openrouter`, `OPENROUTER_API_KEY` and `OPENROUTER_MODEL` in `.env.local` (never commit them). The default in `.env.example` is `baidu/ernie-5.5-flash-preview:free`.
- **Why this model:** free, returned valid strict JSON with sensible confidence in a live test. Several other free models (the Gemma and Ling families) were rate-limited upstream when tested; `OPENROUTER_FALLBACK_MODELS` can list alternatives. `nvidia/nemotron-3.5-super-vl:free` also answered but spent its token budget on reasoning.
- **Limits:** free models are rate-limited (and a free-tier account has a small daily request cap), so the backend retries 429s, 5xx and timeouts with backoff (honouring Retry-After), and retries bad JSON once. If the AI still fails, the local verdict stands and the result is marked `unverified`; an AI error never turns a post green (a local green is held as caution).
- **Privacy:** free models may log prompts and run on third-party providers. Real user posts are scrubbed (phone numbers, emails, @handles, titled names) before they are sent. Do not send anything sensitive; move to a paid model or the Anthropic provider before real launch.
- **Evals:** `npm run screen:eval -- --set=locked --mode=all` caches every AI answer in `backend/screening/testdata/.ai-cache/` (git-ignored) and throttles requests (`AI_MIN_INTERVAL_MS`), so reruns cost nothing.

## Environment variables (names only)

`AI_PROVIDER` `ANTHROPIC_API_KEY` `ANTHROPIC_MODEL` `OPENAI_API_KEY` `OPENROUTER_API_KEY` `OPENROUTER_MODEL` `OPENROUTER_FALLBACK_MODELS` `AI_MIN_INTERVAL_MS` `ALLOWED_ORIGINS` `CORS_REPLACE_DEFAULTS`
`TRUST_CLOUDFLARE` `TRUST_PROXY` `MAIL_TRANSPORT` `SMTP_URL` `MAIL_FROM` `APP_URL` `LOCAL_SCREEN` (`off` disables local-first screening)
`DATABASE_PATH` `PORT` `API_HOST` `API_PORT` `MONGODB_URI` `CLOUDFLARE_TUNNEL_TOKEN`. See `.env.example`.
