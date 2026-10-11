# Open without terminal commands

Double-click **Prepare Apps.command** once after installing Node 24 or later.
It installs dependencies and builds both apps. After changing code, open it
again to refresh the built apps. Normal launches do not invoke npm:

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
