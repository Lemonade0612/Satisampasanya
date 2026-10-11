import { DatabaseSync } from 'node:sqlite';
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export function openStore(filename, seed = true) {
  if (filename !== ':memory:') mkdirSync(dirname(filename), { recursive: true });
  const db = new DatabaseSync(filename);
  db.exec(readFileSync(new URL('./schema.sql', import.meta.url), 'utf8'));
  if(!db.prepare('PRAGMA table_info(user_access)').all().some(column=>column.name==='managed'))db.exec('ALTER TABLE user_access ADD COLUMN managed INTEGER NOT NULL DEFAULT 0');
  if (seed && !db.prepare('SELECT COUNT(*) n FROM posts').get().n) {
    const posts = JSON.parse(readFileSync(new URL('./seed.json', import.meta.url), 'utf8'));
    const insert = db.prepare('INSERT INTO posts VALUES (?,NULL,?,?)');
    db.exec('BEGIN');
    try {
      posts.forEach((post, index) => insert.run(post.id, JSON.stringify({ ...post, isDemo: true }), Date.now() - (index + 1) * 3600000));
      db.exec('COMMIT');
    } catch (error) { db.exec('ROLLBACK'); throw error; }
  }
  return db;
}

export function userView(row) {
  const profile = JSON.parse(row.profile);
  return { ...profile, id: row.id, name: row.name, email: row.email, handle: `@sati_${row.id.slice(0, 8)}` };
}
export function authorView(row) {
  return { id: row.id, name: row.name, handle: `@sati_${row.id.slice(0, 8)}`, initials: row.name.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase(), color: '#5B21D1', points: 0 };
}
export function postView(db, row, userId) {
  const post = JSON.parse(row.data);
  if (row.user_id) post.author = authorView(db.prepare('SELECT * FROM users WHERE id=?').get(row.user_id));
  const reactions = db.prepare('SELECT kind,COUNT(*) n FROM reactions WHERE post_id=? GROUP BY kind').all(row.id);
  post.likes = (post.likes || 0) + (reactions.find(r => r.kind === 'like')?.n || 0);
  post.warnedMe = (post.warnedMe || 0) + (reactions.find(r => r.kind === 'warned')?.n || 0);
  post.comments = db.prepare('SELECT COUNT(*) n FROM comments WHERE post_id=?').get(row.id).n;
  post.reposts = (post.reposts || 0) + db.prepare("SELECT COUNT(*) n FROM posts WHERE json_extract(data,'$.repostOf')=?").get(row.id).n;
  const mine = userId ? db.prepare('SELECT kind FROM reactions WHERE post_id=? AND user_id=?').all(row.id, userId).map(r => r.kind) : [];
  return { ...post, id: row.id, createdAt: row.created, liked: mine.includes('like'), warned: mine.includes('warned') };
}
