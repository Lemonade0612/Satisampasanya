# Satisampasanya

React + Vite website and Capacitor iPhone app, with a small Node + SQLite backend.
Requires Node 24+; the native app also requires Xcode and an installed iOS runtime.

## Independent applications

- `frontend/`: user app and iOS web assets, port 5173, build output `dist/`.
- `admin/`: standalone admin application, port 5174, build output `admin/dist/`.
- `backend/`: Node API and SQLite database, port 3001.
- `shared/`: common types and the preserved screening policy engine.

The existing database was moved to `backend/data/sati.sqlite` with its records intact.
The admin has its own browser session and does not share user-app login storage.
Environment settings stay in the root `.env.local`.

Use **Sati: Admin + backend** in Run and Debug and press F5 to start all three
services and open the admin. **Sati: iPhone + backend (Device Hub)** starts the
user app and backend for the simulator. When those are already running, use
**Sati: Admin only** to open the separate dashboard without competing for ports.
**Sati: Backend only** starts just the API. The user-app `/admin` address redirects
to the standalone admin during development.

You can also run services independently with `npm run dev:web`,
`npm run dev:admin`, and `npm run backend`. `npm run dev:all` starts all three.
Build both applications with `npm run build:all`.

Admin includes a sidebar, dark/light theme, activity chart, topic donut,
month calendar, real review workload and searchable records. Queue deadlines
use a 48-hour review target; expert assignments are not fabricated. The user
app continues to open in white. Saved review decisions are shared through the API.

## Start the app

```sh
npm ci
npm run dev
```

This starts Vite at `http://127.0.0.1:5173` and the API at
`http://127.0.0.1:3001`. Register a new account in the app. Sign-in now checks
saved passwords; the old demo login accepting any password is gone.
Accounts, sessions, posts, replies, reactions, followed topics, profile text,
and compressed photos are saved in `backend/data/sati.sqlite`. This folder is
ignored by Git. Keep it when you want to preserve your data; do not share it
as part of the source archive. No external database server is needed.

The first start includes clearly labelled sample safety posts. Set
`SEED_DEMO=false` before creating a new database to start with an empty feed.
The backend never automatically grants verification or expert points.

## Run with F5 (VS Code / Cursor)

Open this folder in VS Code or Cursor. In **Run and Debug**, choose
**Sati: App + backend** and press **F5**. Both servers start and the app opens
in your browser. Stop debugging to stop the servers. Choose
**Sati: Admin + backend** to open the dashboard instead. These use the built-in
JavaScript debugger and need no additional extension.

For Device Hub, choose **Sati: iPhone + backend (Device Hub)** and press **F5**.
This waits for the backend and live frontend, then builds and opens the iPhone app.
It is the first F5 option. Both servers can also be reused if already running.
Saving a React widget updates the live app. Node 24+, Xcode, and an installed
iOS simulator are still prerequisites. Run `npm ci` once if dependencies are missing.
The combined launcher reuses development services when they are already running.
Stop and restart the backend after editing `.env.local` so configuration changes apply.

## Admin dashboard

The independent dashboard is at `http://127.0.0.1:5174`. It uses your saved backend
records, refreshes every 15 seconds, and includes overview charts, a review
queue, searchable posts and searchable registered accounts. Sample posts stay
labelled. Expert workloads are omitted because assignment data is not tracked.
Topic counts include every tag, so a post can appear in multiple topics.

Register your account in the user app first. In `.env.local`, authorize its email:

```env
ADMIN_EMAILS=your-existing-account@example.com
```

Restart the backend (or restart F5), then sign in at `http://127.0.0.1:5174` using that account.
Multiple admins can be separated with commas. With an empty allowlist,
no accounts can access admin data. The dashboard never exposes passwords or
session tokens. Review a flagged post, select confirmed scam or false alarm,
and add an evidence note. Decisions and reviewer history are saved to SQLite
and appear in the user feed. A review does not delete the post.

The user app opens in a white theme; users can switch themes during the session.
The supplied `frontend/public/images/Satisampasanya_Logo_app.png` is used for the splash,
sign-in, feed, shared brand widget, remaining screen headers, dashboard, browser icon, and native app icon.
Unconfigured social sign-in buttons were removed.

## Live updates in Device Hub

Keep `npm run dev` running in one terminal. In a second terminal run:

```sh
npm run ios:live
```

The runner uses the booted simulator, or starts an available iPhone. To select
a specific device, use `npm run ios:live -- --target DEVICE_ID`. It builds and
installs through `xcodebuild` and `simctl`, supporting Device Hub without the
legacy Simulator.app path. Build output stays in the macOS temporary folder.
After the initial native build/install, saving React,
CSS, or widget files updates the installed Sati Dev app through Vite live reload.
Posts, comments, reactions, and notifications also synchronize between open
clients through server-sent events, with a polling fallback.

Native icons, permissions, and Swift changes still require a native rebuild.
`ios:run` and `ios:live` now automatically regenerate the native icon when the supplied logo is
newer, while preserving direct PNG edits when that file is newer.
After editing `frontend/public/images/Satisampasanya_Logo_app.png`, run:

```sh
npm run ios:icon
npm run ios:live
```

The icon command resizes the supplied logo to the opaque PNG required by Xcode. If you edit the PNG
directly in Xcode's AppIcon asset, skip `ios:icon` so your PNG is preserved.

For a bundled app that opens without Vite:

```sh
npm run ios:run
```

Its backend still needs to run for sign-in and data. `npm run backend` starts
just the API. `npm run ios:open` opens the native project in Xcode.

## Posting in English and Lao

The composer accepts either language, or both. Provide an English version and
Lao version to make the language switch show each translation. When only one
version is supplied, the original text is shown with a fallback notice. Automatic translation is optional; see AI setup below.

Choose at least one hashtag. You can create English or Lao hashtags using
letters, numbers, or underscores (up to 40 characters; at most 10 tags). News posts require an HTTP/HTTPS source; ordinary
posts can omit it. One photo can be attached; it is resized and compressed
before saving. The server enforces 2 original posts and 5 comments per user
per rolling 24 hours. Reposts are limited to 20 per 24 hours.

## Physical phones

`npm run dev:devices` exposes the development website on your Mac's local
network. Open its Network URL on a phone using the same Wi-Fi.
For a bundled native app on a physical phone, copy `.env.example` to
`.env.local`, set `VITE_API_URL=http://YOUR_MAC_IP:3001/api` and
`API_HOST=0.0.0.0`, then rebuild. Permit your frontend origin using
`ALLOWED_ORIGINS` if needed. Simulator defaults use `127.0.0.1`.
Development HTTP is enabled in the iOS wrapper; for a deployed app use an
HTTPS backend and remove `NSAllowsArbitraryLoadsInWebContent` from Info.plist.

## Checks and limitations

```sh
npm run build
npm run typecheck
npm test
```

The integration tests cover authentication, persistence after restart,
bilingual posts, attachments, replies, reactions, notifications, quotas,
origin checks, live events, and password resets. Type checking validates all
sources; unused-code diagnostics are disabled for the retained AI module.

Local password reset links are printed in the backend terminal, expire after
15 minutes, and can be used once. Email delivery and social sign-in are not
configured. The retained keyword screening engine now runs on every new post and repost.

## Source layout

- `frontend/src/App.tsx`: app state and navigation.
- `frontend/src/screens/`: authentication, feed, explore, profile, splash, and alerts.
- `frontend/src/components/`: shared widgets, feed cards, and dialogs.
- `frontend/src/hooks/`: live-data and phone-viewport hooks.
- `frontend/src/lib/api.ts`: API client and session handling.
- `frontend/src/types/`: shared types.
- `backend/`: HTTP routes, authentication, SQLite schema, sample data, and tests.
- `ios/`: native app source; generated builds are ignored.
- `frontend/public/images/Satisampasanya_Logo_app.png`: shared brand and native icon source.

Exclude `node_modules/`, `dist/`, and native build output when sharing source.

## Optional AI and automatic translation

The backend always runs the preserved local keyword checks on new posts and
reposts. Their results are labelled "Local screening", not AI or expert
verification. Local checks can flag legitimate reports, so they do not
silently delete posts or grant verified points.

To enable real AI screening and English ↔ Lao translation, add these values
privately to `.env.local` and restart `npm run dev`:

```env
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4.1-mini
```

Never use a `VITE_` prefix for the API key. With a key, new posts automatically
receive a missing translation and AI screening. Supplied translations are
preserved. The composer also offers translation buttons, and readers can
translate older single-language posts using the feed's translation button.
Generated translations should be reviewed for accuracy. Provider failures
fall back to labelled local screening; translation failures remain visible.
Without a key, both languages can still be entered manually.

AI requests send post text to OpenAI and use your API account's billing.
They do not validate source URLs or prove that a claim is true. Photo contents
are not analysed; this integration screens post text only.

## Account management and insight access

In the admin dashboard, open **People & access**. Administrators can create and
edit users, assign a business unit/team, change roles and activate/deactivate
accounts. Search by name/email/ID, filter by role/team/status, and export the
filtered list to CSV. Passwords are hashed; existing passwords are never shown.

- Member: user app only.
- Viewer: read insights and posts; cannot save reviews or manage accounts.
- Reviewer: read insights and save review decisions.
- Admin: manage users, insights and reviews.

ADMIN_EMAILS bootstraps administrator access for existing accounts. An explicitly
managed account's saved role takes precedence. Access/password changes revoke
its sessions. Inactive accounts cannot sign in. Administrators cannot deactivate
or demote themselves; the last active administrator is protected. Access changes
are logged in SQLite. Historic registration/login dates appear as unknown when
no timestamp was saved, rather than inventing dates.

## Double-click launchers and hosting

Open `Launchers/` and double-click **Prepare Apps.command** once, then launch
Backend, Frontend and Admin independently using their Start files. Normal built
web launches use Node directly, without npm commands. Node 24 remains a Mac
runtime prerequisite. See `Launchers/README.md` for details.

`deployment/` contains Docker targets, Compose, Nginx proxies and private-setting
examples for three hosted services. Publishing has not been done; follow
`deployment/README.md` when your hosting server and HTTPS domains are available.
Hosted visitors need no npm, Node installation or local environment files.

## Optional MongoDB Atlas backups

SQLite remains the live database. The optional official MongoDB driver saves
versioned cloud snapshots and can restore them to a new SQLite file. This is
backup/restore, not live dual-database synchronization or a MongoDB primary store.
Add a complete MONGODB_URI and MONGODB_DATABASE privately to `.env.local` after
rotating the password shared in chat. The URI must contain the actual username.
Never put the credential into source files or a VITE_ variable.

Double-click **Backup to MongoDB.command** or run `npm run mongo:backup`.
To restore: `node scripts/mongo-backup.mjs restore BACKUP_ID NEW_OUTPUT_FILE`.
Sessions/reset tokens are excluded; password hashes are included. The connection
has not been verified until valid private credentials and Atlas network access
are configured. Existing files cannot be overwritten by the restore command.
