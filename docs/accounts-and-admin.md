# Accounts and the admin workspace

Start all services with `npm run dev:all`:

- User app: http://127.0.0.1:5173
- Admin workspace: http://127.0.0.1:5174
- API: http://127.0.0.1:3001/api

The user home has no administration entry point. The admin site is built independently
into `admin/dist`; the app is built into `dist`. Admin login checks workspace permissions
before issuing a session. Members cannot open the admin API, even with a valid app session.

## Test accounts

Run `npm run seed:users` to create four local accounts: `admin@sati.test`,
`reviewer@sati.test`, `alice@sati.test`, and `bob@sati.test`. Each has a different,
randomly generated password. Credentials are saved in `backend/data/test-accounts.json`,
which is ignored by Git. Existing accounts and passwords are never overwritten.

Use separate new tabs to sign in as Alice and Bob simultaneously; use the admin address
for the administrator or reviewer. Sessions are scoped to each tab, survive reloads,
and end when that tab is closed. Duplicating a signed-in tab can copy its initial session;
open a fresh tab to test another account. Old sessions from localStorage are no longer used,
so sign in again after this update.

Administrators can create users, assign roles, deactivate accounts, and reset passwords
in People & access. Reviewers can review posts; viewers have read-only workspace access.
Deactivation and password/role changes revoke existing sessions.

## Data persistence

SQLite is the live database, stored at `backend/data/sati.sqlite` unless DATABASE_PATH
is configured. Users, hashed passwords, sessions, profiles, posts, comments, and access
roles persist across backend restarts. Preserve this file and its directory. MongoDB
remains an optional backup destination; it is not the live database.

## Separate public domains

The existing deployment compose file exposes the app on 8080 and admin on 8081.
Point your app and admin domains to those independent services. Both nginx services
proxy `/api` to the backend. Set ALLOWED_ORIGINS to both complete HTTPS origins.
Set VITE_APP_URL to the user app URL when building the admin so its return links use
your actual domain. For a separate API host, set VITE_API_URL in each frontend build.
DNS and HTTPS configuration must be completed with your hosting provider.

## Verification

`npm run typecheck`, `npm test`, and `npm run build:all` validate both applications
and the backend. Integration tests cover independent account sessions, logout, storage
across restarts, admin authorization, role management, and moderation access.

## Moderation and review examples

Both yellow (`caution`) and red (`needs_expert`) posts remain visible but lock likes,
comments, reposts, and sharing until an authorized moderator reviews them. Existing
yellow posts follow the same rule, including reposts of those posts. The review center
shows content categories and exact evidence for profanity, bullying, political sarcasm,
and other risks. Review requests and 48-hour reminders are persisted for active staff.
Political viewpoints alone are not treated as harassment or misinformation.

`npm run seed:reviews` adds nine posts using the configured live checker. If the provider
is unavailable, `npm run seed:reviews -- --training` adds six red and three yellow
training examples with clearly labeled preset assessments. It does not claim these were
checked by AI. Reruns preserve existing posts and reviewer decisions. Once the provider
works, `npm run seed:reviews -- --recheck` replaces unreviewed preset assessments with
live checks. These examples are posted by Safety examples (`@safety_examples`).

Opening the API root on port 3001 redirects to the admin workspace; `/api/*` stays
protected as before. Set ADMIN_URL for a hosted admin address. Restart the backend after
updating server code. The launch screen shows both Satisampasanya and ສະຕິຊໍາປະຊັນຍະ.
