PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL, password TEXT NOT NULL, salt TEXT NOT NULL, profile TEXT NOT NULL DEFAULT '{}');
CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS posts (id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id), data TEXT NOT NULL, created INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS comments (id TEXT PRIMARY KEY, post_id TEXT NOT NULL REFERENCES posts(id), user_id TEXT NOT NULL REFERENCES users(id), text TEXT NOT NULL, created INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS reactions (post_id TEXT NOT NULL REFERENCES posts(id), user_id TEXT NOT NULL REFERENCES users(id), kind TEXT NOT NULL CHECK(kind IN ('like','warned')), PRIMARY KEY(post_id,user_id,kind));
CREATE TABLE IF NOT EXISTS resets (token TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), expires INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS comments_post ON comments(post_id,created);
CREATE INDEX IF NOT EXISTS posts_user ON posts(user_id,created);
CREATE TABLE IF NOT EXISTS notifications (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), actor_name TEXT NOT NULL, kind TEXT NOT NULL, post_id TEXT NOT NULL REFERENCES posts(id), created INTEGER NOT NULL, read INTEGER NOT NULL DEFAULT 0, review_state TEXT);
CREATE INDEX IF NOT EXISTS notifications_user ON notifications(user_id,created);
CREATE TABLE IF NOT EXISTS user_access (user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, role TEXT NOT NULL DEFAULT 'member' CHECK(role IN ('member','viewer','reviewer','admin')), status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','inactive')), unit TEXT NOT NULL DEFAULT '', managed INTEGER NOT NULL DEFAULT 0, created INTEGER, last_login INTEGER);
CREATE TABLE IF NOT EXISTS access_audit (id TEXT PRIMARY KEY, actor_id TEXT NOT NULL, target_id TEXT NOT NULL, action TEXT NOT NULL, detail TEXT NOT NULL, created INTEGER NOT NULL);

CREATE TABLE IF NOT EXISTS assistant_usage (user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, day TEXT NOT NULL, kind TEXT NOT NULL CHECK(kind IN ('text','post')), count INTEGER NOT NULL DEFAULT 0, PRIMARY KEY(user_id,day,kind));
CREATE TABLE IF NOT EXISTS shares (post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, created INTEGER NOT NULL, PRIMARY KEY(post_id,user_id));
CREATE TABLE IF NOT EXISTS device_tokens (token TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, platform TEXT NOT NULL, lang TEXT NOT NULL DEFAULT 'en', created INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS device_tokens_user ON device_tokens(user_id);

-- Daily scenarios managed through review. Bundled scenarios ship with the app as the offline baseline;
-- rows here add to or replace them by id. Only 'live' rows are ever served to players.
-- data holds the full bilingual scenario (validated by backend/scenarios.mjs); the columns are for filtering and the admin list.
CREATE TABLE IF NOT EXISTS scenarios (id TEXT PRIMARY KEY, status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','approved','live','rejected')), bands TEXT NOT NULL, intensity INTEGER NOT NULL CHECK(intensity BETWEEN 1 AND 3), topic TEXT NOT NULL, title_en TEXT NOT NULL, title_lo TEXT NOT NULL, data TEXT NOT NULL, source TEXT NOT NULL DEFAULT 'expert' CHECK(source IN ('ai_draft','expert')), created_by TEXT, created INTEGER NOT NULL, updated INTEGER NOT NULL, reviewed_by TEXT, reviewed_at INTEGER, review_note TEXT);
CREATE INDEX IF NOT EXISTS scenarios_status ON scenarios(status,updated);
-- Append-only record of moderation decisions: staff reviews of posts and scenarios, and AI screening flags (actor_id NULL).
CREATE TABLE IF NOT EXISTS moderation_log (id TEXT PRIMARY KEY, kind TEXT NOT NULL CHECK(kind IN ('post','scenario')), target_id TEXT NOT NULL, action TEXT NOT NULL, actor_id TEXT, actor_name TEXT NOT NULL, note TEXT NOT NULL DEFAULT '', detail TEXT NOT NULL DEFAULT '{}', created INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS moderation_log_created ON moderation_log(created);
-- Built-in (bundled) scenarios that reviewers have retired. The app hides these ids from its bundled set.
CREATE TABLE IF NOT EXISTS scenario_retirements (id TEXT PRIMARY KEY, note TEXT NOT NULL, retired_by TEXT NOT NULL, retired_at INTEGER NOT NULL);
