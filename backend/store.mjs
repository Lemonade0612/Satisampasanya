import {postLocked,visibleTo} from './post-lock.mjs';
import {communityRanking} from './ranking.mjs';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { seedScenarioDrafts } from './scenarios.mjs';

export function openStore(filename, seed = false) {
  if (filename !== ':memory:') mkdirSync(dirname(filename), { recursive: true });
  const db = new DatabaseSync(filename);
  db.exec(readFileSync(new URL('./schema.sql', import.meta.url), 'utf8'));
  if(!db.prepare('PRAGMA table_info(notifications)').all().some(column=>column.name==='review_state'))db.exec('ALTER TABLE notifications ADD COLUMN review_state TEXT');
  // pushed IS NULL marks alerts not yet sent to devices; alerts from before push support count as sent.
  if(!db.prepare('PRAGMA table_info(notifications)').all().some(column=>column.name==='pushed')){db.exec('ALTER TABLE notifications ADD COLUMN pushed INTEGER');db.exec('UPDATE notifications SET pushed=1');}
  // Review alerts used to carry the reviewer's display name; they are attributed to the team instead.
  db.exec("UPDATE notifications SET actor_name='Safety review' WHERE kind='review' AND actor_name<>'Safety review'");
  // Age band only (never a birth date): drives what the account sees and whether it may post.
  if(!db.prepare('PRAGMA table_info(users)').all().some(column=>column.name==='age_band'))db.exec("ALTER TABLE users ADD COLUMN age_band TEXT CHECK(age_band IS NULL OR age_band IN ('kids','youth','adult','elder'))");
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
  // Existing databases: new seed posts are added and seed bands kept in step with seed.json (one band per post,
  // at most two). Counters and review state on existing rows are left alone; user posts are never touched.
  if (seed) {
    const posts = JSON.parse(readFileSync(new URL('./seed.json', import.meta.url), 'utf8'));
    const find = db.prepare('SELECT * FROM posts WHERE id=?'), add = db.prepare('INSERT INTO posts VALUES (?,NULL,?,?)'), set = db.prepare('UPDATE posts SET data=? WHERE id=?');
    db.exec('BEGIN');
    try {
      for (const post of posts) {
        const row = find.get(post.id);
        if (!row) { add.run(post.id, JSON.stringify({ ...post, isDemo: true }), Date.now()); continue; }
        if (row.user_id) continue;
        const data = JSON.parse(row.data);
        if (JSON.stringify(data.bands) !== JSON.stringify(post.bands) || !!data.essential !== !!post.essential) set.run(JSON.stringify({ ...data, bands: post.bands, essential: post.essential }), post.id);
      }
      db.exec('COMMIT');
    } catch (error) { db.exec('ROLLBACK'); throw error; }
  }
  if (seed) seedScenarioDrafts(db, JSON.parse(readFileSync(new URL('./scenario-drafts.json', import.meta.url), 'utf8')));
  return db;
}

export function userView(row) {
  const profile = JSON.parse(row.profile);
  return { ...profile, id: row.id, name: row.name, email: row.email, ageBand: row.age_band ?? null, handle: JSON.parse(row.profile||'{}').handle || `@sati_${row.id.slice(0, 8)}` };
}
export function authorView(row) {
  const handle=JSON.parse(row.profile||'{}').handle || `@sati_${row.id.slice(0,8)}`;
  const hue=[...handle].reduce((value,char)=>(value*31+char.charCodeAt(0))%360,0);
  return { id: row.id, name: row.name, handle, initials: row.name.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase(), color: `hsl(${hue} 62% 42%)`, points: 0 };
}
export function postView(db, row, userId, depth=0, {staff=false}={}) {
  const post = JSON.parse(row.data);
  if (row.user_id) post.author = authorView(db.prepare('SELECT * FROM users WHERE id=?').get(row.user_id));
  if(post.repostOf&&depth===0){const original=db.prepare('SELECT * FROM posts WHERE id=?').get(post.repostOf);if(original&&(staff||visibleTo(db,original,userId)))post.originalPost=postView(db,original,userId,1,{staff});}
  post.frozen=postLocked(db,row);
  const reactions = db.prepare('SELECT kind,COUNT(*) n FROM reactions WHERE post_id=? GROUP BY kind').all(row.id);
  post.likes = (post.likes || 0) + (reactions.find(r => r.kind === 'like')?.n || 0);
  post.warnedMe = (post.warnedMe || 0) + (reactions.find(r => r.kind === 'warned')?.n || 0);
  post.comments = db.prepare('SELECT COUNT(*) n FROM comments WHERE post_id=?').get(row.id).n;
  post.reposts = (post.reposts || 0) + db.prepare("SELECT COUNT(*) n FROM posts WHERE json_extract(data,'$.repostOf')=?").get(row.id).n;
  post.interactionPeople=db.prepare('SELECT DISTINCT u.id,u.name,u.profile FROM users u JOIN reactions r ON r.user_id=u.id WHERE r.post_id=? ORDER BY u.name LIMIT 3').all(row.id).map(authorView);
  const mine = userId ? db.prepare('SELECT kind FROM reactions WHERE post_id=? AND user_id=?').all(row.id, userId).map(r => r.kind) : [];
  const trustedEngagement=db.prepare('SELECT kind,COUNT(*) n FROM reactions WHERE post_id=? AND user_id<>? GROUP BY kind').all(row.id,row.user_id||'');
  const n=kind=>trustedEngagement.find(r=>r.kind===kind)?.n||0;
  const commenters=db.prepare('SELECT COUNT(DISTINCT user_id) n FROM comments WHERE post_id=? AND user_id<>?').get(row.id,row.user_id||'').n;
  post.shares=db.prepare('SELECT COUNT(*) n FROM shares WHERE post_id=?').get(row.id).n;
  const sharers=db.prepare("SELECT COUNT(*) n FROM (SELECT user_id FROM shares WHERE post_id=? AND user_id<>? UNION SELECT user_id FROM posts WHERE json_extract(data,'$.repostOf')=? AND user_id<>? AND COALESCE(json_extract(data,'$.frozen'),0)=0)").get(row.id,row.user_id||'',row.id,row.user_id||'').n;
  post.communityRanking=communityRanking(post,{likes:n('like'),helpful:n('warned'),commenters,reposters:sharers,createdAt:row.created});
  delete post.reviewerNotifications;
  // Who reviewed a post and their working notes stay in the moderation workspace: moderators of
  // trafficking reports must not be identifiable, and notes can reference police or victims.
  if(!staff){
    if(post.review)post.review={state:post.review.state,reviewedAt:post.review.reviewedAt};
    delete post.correction;delete post.correctionLo;delete post.screeningLogs;
  }
  delete post._expect;
  const hours=Math.floor((Date.now()-row.created)/3600000);post.timestamp=hours<1?'Just now':hours<24?`${hours}h`:`${Math.floor(hours/24)}d`;
  return { ...post, id: row.id, createdAt: row.created, liked: mine.includes('like'), warned: mine.includes('warned') };
}
