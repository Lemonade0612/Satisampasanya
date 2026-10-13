# Hosted frontend, backend and admin

The three Docker targets are independent. Frontend and admin are built static
websites served by Nginx; the API runs in Node 24 with a persistent SQLite volume.
No user needs npm or a local .env file to visit the hosted websites.

These files prepare deployment; no hosting account, domain or live server has
been provisioned. Docker and HTTPS routing are required on the hosting server.
Copy `hosting.env.example` to `hosting.env` and set your administrator email and
both HTTPS origins privately. Keep the backend reachable only inside Docker.
Configure your host's HTTPS reverse proxy to route the app domain to
127.0.0.1:8080 and the admin domain to 127.0.0.1:8081.

From the repository root:

```sh
docker compose --env-file deployment/hosting.env -f deployment/compose.yaml build
docker compose --env-file deployment/hosting.env -f deployment/compose.yaml up -d
```

The `sati-data` volume preserves database records across restarts and rebuilds.
A new volume is empty. To keep local records, stop the local backend and copy
its `backend/data/sati.sqlite` plus any matching WAL file into the volume before
exposing either website. Keep a separate backup and verify the records after
migration. Do not delete the volume when updating the application.
For a new deployment, register the ADMIN_EMAILS account before opening public
registration. User roles after bootstrap are managed in People & access.

The optional MongoDB feature is backup/restore, not a replacement for SQLite.
After setting a complete MONGODB_URI privately, an operator can execute:

```sh
docker compose --env-file deployment/hosting.env -f deployment/compose.yaml exec backend node scripts/mongo-backup.mjs backup
```

This saves snapshots in `sati_backup_records` and `sati_backup_manifests`.
The backup includes password hashes, so Atlas access should be restricted.
Sessions and reset tokens are excluded. Restore only to a new database file;
existing databases are never overwritten by the restore command.

## One-click deployment on this Mac

Double-click `Launchers/Deploy Locally.command`. This starts Docker Desktop,
builds all services, copies the current SQLite database into an empty deployment
volume and opens admin at http://127.0.0.1:8081. The user app is at
http://127.0.0.1:8080. Later launches preserve the deployment database rather than
overwriting it. The generated `local.env` is private and ignored by Git. When local models are
already cached, they are copied once into Docker’s model volume to avoid another model download
and improve model loading performance.
This is deployment on your Mac, not a public internet website.

The translation container runs NLLB-200 and a separate text-screening model.
Download time and memory usage must be allowed for the first startup. NLLB's
noncommercial/research license must be considered before a commercial rollout.
