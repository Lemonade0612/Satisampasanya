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
