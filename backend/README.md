# Sati Backend

Node 24 HTTP API at http://127.0.0.1:3001/api.
Run `npm run dev` here, or use **Sati: Backend only** with F5.
SQLite records live in `data/sati.sqlite`; preserve this directory.
Settings are read from the root `.env.local`. ADMIN_EMAILS authorizes existing
registered users to access admin routes. `npm test` runs integration checks.
Dependencies are installed at the repository root.
