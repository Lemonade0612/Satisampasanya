# Open without terminal commands

Double-click **Prepare Apps.command** once after installing Node 24 or later.
It installs dependencies and builds both apps. After changing code, open it
again to refresh the built apps. Normal launches do not invoke npm. Double-click **Start Sati.command** to open
the user app and admin together with the backend and local AI. To run parts
separately:

- **Start Backend.command** starts only the API.
- **Start Frontend.command** opens the built user app.
- **Start Admin.command** opens the built admin dashboard.
- **Start iPhone.command** opens the live iPhone simulator (Xcode required).
- **Backup to MongoDB.command** saves an optional Atlas snapshot.

Each part runs separately. Keep its window open; closing it stops that service.
The frontend/admin can open without the backend, but login and records need it.
Node is still a runtime prerequisite on this Mac; these are local launchers,
not standalone binaries. The iPhone live launcher rebuilds via the development
tools. A hosted website needs none of these local prerequisites for visitors.

Existing .env.local settings are read automatically. You do not have to type
commands or re-enter environment values each time. MongoDB credentials are only
needed for Atlas backups, and no secrets are included in these launchers.

## Local AI and deployment

- **Prepare AI.command** installs the Python packages and downloads NLLB-200 and
  the screening model once. The first download is large; wait for it to finish.
- **Start AI.command** keeps English/Lao translation and text screening running.
  Start this before the backend when using the local model configuration. The
  first translation or screening request loads the CPU models and can take
  several minutes; the window prints model readiness. Retry after it is ready. Keyword screening remains available while AI is preparing.
- **Create Demo Users.command** fills the community to ten users and adds labelled
  sample posts with photos. Existing accounts and posts are preserved; repeated
  runs do not duplicate posts. Login details stay in `backend/data/demo-accounts.json`.
- **Deploy Locally.command** opens Docker Desktop, builds the services and opens
  the admin at port 8081. The user app runs at port 8080. The first empty Docker
  database receives a consistent copy of your current SQLite records; later
  runs preserve its database. Docker runs the services without open terminals.

The native iPhone icon comes from `assets/app-icon.svg`. The in-app logo remains
`frontend/public/images/Satisampasanya_Logo_app.png`.

The iPhone launcher now installs bundled app screens and starts the local backend (plus AI when configured). You do not need to start the frontend separately. Keep the launcher window open for local backend access. A hosted backend is still needed to use online accounts/posts when this Mac is off.
