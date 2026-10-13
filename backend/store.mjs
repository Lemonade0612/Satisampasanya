import {communityRanking} from './ranking.mjs';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export function openStore(filename, seed = false) {
  if (filename !== ':memory:') mkdirSync(dirname(filename), { recursive: true });
  const db = new DatabaseSync(filename);
  db.exec(readFileSync(new URL('./schema.sql', import.meta.url), 'utf8'));
  if(!db.prepare('PRAGMA table_info(notifications)').all().some(column=>column.name==='review_state'))db.exec('ALTER TABLE notifications ADD COLUMN review_state TEXT');
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
  return { ...profile, id: row.id, name: row.name, email: row.email, handle: JSON.parse(row.profile||'{}').handle || `@sati_${row.id.slice(0, 8)}` };
}
export function authorView(row) {
  const handle=JSON.parse(row.profile||'{}').handle || `@sati_${row.id.slice(0,8)}`;
  const hue=[...handle].reduce((value,char)=>(value*31+char.charCodeAt(0))%360,0);
  return { id: row.id, name: row.name, handle, initials: row.name.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase(), color: `hsl(${hue} 62% 42%)`, points: 0 };
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
  const trustedEngagement=db.prepare('SELECT kind,COUNT(*) n FROM reactions WHERE post_id=? AND user_id<>? GROUP BY kind').all(row.id,row.user_id||'');
  const n=kind=>trustedEngagement.find(r=>r.kind===kind)?.n||0;
  const commenters=db.prepare('SELECT COUNT(DISTINCT user_id) n FROM comments WHERE post_id=? AND user_id<>?').get(row.id,row.user_id||'').n;
  const reposters=db.prepare("SELECT COUNT(DISTINCT user_id) n FROM posts WHERE json_extract(data,'$.repostOf')=? AND user_id<>? AND COALESCE(json_extract(data,'$.frozen'),0)=0").get(row.id,row.user_id||'').n;
  post.communityRanking=communityRanking(post,{likes:n('like'),helpful:n('warned'),commenters,reposters,createdAt:row.created});
  delete post.reviewerNotifications;
  delete post._expect;
  const hours=Math.floor((Date.now()-row.created)/3600000);post.timestamp=hours<1?'Just now':hours<24?`${hours}h`:`${Math.floor(hours/24)}d`;
  return { ...post, id: row.id, createdAt: row.created, liked: mine.includes('like'), warned: mine.includes('warned') };
}
