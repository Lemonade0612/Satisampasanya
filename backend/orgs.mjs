import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { cleanMedia, feedFields, pageFeed, POST_TYPES } from './feed.mjs';
import { accessFor } from './access.mjs';
import { curatedOrgRows } from './curated.mjs';

export const ORG_TYPES = ['gov', 'ngo', 'intl', 'media'];
export const GAMES = ['story', 'flags', 'realorscam', 'links', 'dash', 'detective', 'call'];
const slugOk = v => typeof v === 'string' && /^[a-z0-9][a-z0-9-]{1,40}$/.test(v);
const urlOk = v => { try { return ['https:', 'http:'].includes(new URL(v).protocol) && v.length <= 500; } catch { return false; } };
const pathOrUrl = v => typeof v === 'string' && v.length <= 500 && (v.startsWith('/') || urlOk(v));
const str = (v, max, name, required = false) => {
  if (v === undefined || v === null || v === '') { if (required) throw Object.assign(new Error(`${name} is required.`), { status: 400 }); return ''; }
  if (typeof v !== 'string' || v.length > max) throw Object.assign(new Error(`${name} must be text up to ${max} characters.`), { status: 400 });
  return v.trim();
};
const bad = (m, status = 400) => Object.assign(new Error(m), { status });

// Public view of an organisation. `verified` is the only source for the verified badge.
export const orgView = (row, extra = {}) => ({ id: row.id, slug: row.slug, nameLo: row.name_lo, nameEn: row.name_en, type: row.type, verified: !!row.verified, logoUrl: row.logo_url, bannerUrl: row.banner_url, bioLo: row.bio_lo, bioEn: row.bio_en, website: row.website, facebookUrl: row.facebook_url, ...extra });

// Adds the live organisation (name, verified badge, logo) to posts that belong to one.
export function withOrg(db, post) {
  if (!post.orgId) return post;
  const o = db.prepare('SELECT * FROM organisations WHERE id=?').get(post.orgId);
  return o ? { ...post, org: { slug: o.slug, nameLo: o.name_lo, nameEn: o.name_en, type: o.type, verified: !!o.verified, logoUrl: o.logo_url } } : post;
}

export function followedSets(db, userId) {
  const sets = { orgs: new Set(), users: new Set() };
  if (!userId) return sets;
  for (const r of db.prepare('SELECT target_kind k,target_id id FROM follows WHERE user_id=?').all(userId)) (r.k === 'org' ? sets.orgs : sets.users).add(r.id);
  try { for (const id of JSON.parse(db.prepare('SELECT profile FROM users WHERE id=?').get(userId)?.profile || '{}').following || []) sets.users.add(id); } catch { /* ignore */ }
  return sets;
}

// Seeds the three launch organisations and their first posts. Safe to run repeatedly.
export function seedOrgs(db) {
  const seed = JSON.parse(readFileSync(new URL('./seed-orgs.json', import.meta.url), 'utf8'));
  const has = db.prepare('SELECT id FROM organisations WHERE slug=?');
  const add = db.prepare('INSERT INTO organisations(id,slug,name_lo,name_en,type,verified,logo_url,banner_url,bio_lo,bio_en,website,facebook_url,created) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)');
  const post = db.prepare('INSERT INTO posts VALUES (?,NULL,?,?)'), findPost = db.prepare('SELECT id FROM posts WHERE id=?');
  db.exec('BEGIN');
  try {
    // Existing databases: fill in a logo or banner that was missing when the organisation was first created.
    const fill = db.prepare('UPDATE organisations SET logo_url=COALESCE(logo_url,?), banner_url=COALESCE(banner_url,?) WHERE slug=?');
    for (const o of seed.organisations) if (has.get(o.slug) && (o.logoUrl || o.bannerUrl)) fill.run(o.logoUrl ?? null, o.bannerUrl ?? null, o.slug);
    for (const o of seed.organisations) if (!has.get(o.slug)) add.run(`org-${o.slug}`, o.slug, o.nameLo, o.nameEn, o.type, o.verified ? 1 : 0, o.logoUrl, o.bannerUrl, o.bioLo, o.bioEn, o.website ?? null, o.facebookUrl ?? null, Date.now());
    seed.posts.forEach((p, i) => { if (!findPost.get(p.id)) post.run(p.id, JSON.stringify({ ...p, orgId: `org-${p.org}`, org: undefined, isDemo: true }), Date.now() - (i + 1) * 60000); });
    db.exec('COMMIT');
  } catch (e) { db.exec('ROLLBACK'); throw e; }
}

const initials = name => name.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();

// Routes for organisations, public profiles, follows, game progress and "help Sati learn" feedback.
// Returns true when the request was handled.
export async function socialRoutes(c) {
  const { req, res, path, url, db, user, send, body, view, visible, rows } = c;
  const method = req.method;
  const page = (list, view2) => pageFeed(list, { cursor: url.searchParams.get('cursor') || undefined, limit: url.searchParams.get('limit') || 10, view: view2 });
  const asPage = (r, extra) => ({ ...r, ...extra });
  const wrap = fn => { try { return fn(); } catch (e) { if (e.status) throw e; throw bad(e.message); } };

  // ---- organisations
  let m = /^\/api\/orgs\/([a-z0-9-]+)$/.exec(path);
  if (method === 'GET' && m) {
    const o = db.prepare('SELECT * FROM organisations WHERE slug=?').get(m[1]); if (!o) throw bad('Organisation not found.', 404);
    const followers = db.prepare("SELECT COUNT(*) n FROM follows WHERE target_kind='org' AND target_id=?").get(o.id).n;
    const posts = rows().filter(r => JSON.parse(r.data).orgId === o.id && visible(r)).length + curatedOrgRows(db, o.id).length;
    send(res, 200, orgView(o, { followers, posts, following: !!user && followedSets(db, user.id).orgs.has(o.id) })); return true;
  }
  m = /^\/api\/orgs\/([a-z0-9-]+)\/posts$/.exec(path);
  if (method === 'GET' && m) {
    const o = db.prepare('SELECT * FROM organisations WHERE slug=?').get(m[1]); if (!o) throw bad('Organisation not found.', 404);
    send(res, 200, wrap(() => page([...rows().filter(r => JSON.parse(r.data).orgId === o.id && visible(r)), ...curatedOrgRows(db, o.id)].sort((a, b) => b.created - a.created), view))); return true;
  }
  const isAdmin = () => user && accessFor(db, user).role === 'admin' && accessFor(db, user).status === 'active';
  // Admin only: create an organisation (unverified), verify it, post as it.
  if (method === 'POST' && path === '/api/orgs') {
    if (!user) throw bad('Please sign in.', 401); if (!isAdmin()) throw bad('Only administrators can create organisations.', 403);
    const d = await body(req);
    if (!slugOk(d.slug)) throw bad('Slug: 2-41 characters, lowercase letters, numbers and dashes.');
    if (!ORG_TYPES.includes(d.type)) throw bad(`Type must be one of ${ORG_TYPES.join(', ')}.`);
    if (db.prepare('SELECT 1 FROM organisations WHERE slug=?').get(d.slug)) throw bad('That slug is taken.', 409);
    for (const k of ['logoUrl', 'bannerUrl']) if (d[k] && !pathOrUrl(d[k])) throw bad(`${k} must be a link.`);
    for (const k of ['website', 'facebookUrl']) if (d[k] && !urlOk(d[k])) throw bad(`${k} must be an http(s) link.`);
    const id = `org-${d.slug}`;
    db.prepare('INSERT INTO organisations(id,slug,name_lo,name_en,type,verified,logo_url,banner_url,bio_lo,bio_en,website,facebook_url,created) VALUES (?,?,?,?,?,0,?,?,?,?,?,?,?)')
      .run(id, d.slug, str(d.nameLo, 120, 'nameLo', true), str(d.nameEn, 120, 'nameEn', true), d.type, d.logoUrl || null, d.bannerUrl || null, str(d.bioLo, 1000, 'bioLo'), str(d.bioEn, 1000, 'bioEn'), d.website || null, d.facebookUrl || null, Date.now());
    send(res, 201, orgView(db.prepare('SELECT * FROM organisations WHERE id=?').get(id))); return true;
  }
  m = /^\/api\/orgs\/([a-z0-9-]+)\/verify$/.exec(path);
  if (method === 'POST' && m) {
    if (!user) throw bad('Please sign in.', 401); if (!isAdmin()) throw bad('Only administrators can verify organisations.', 403);
    const o = db.prepare('SELECT * FROM organisations WHERE slug=?').get(m[1]); if (!o) throw bad('Organisation not found.', 404);
    const d = await body(req); if (typeof d.verified !== 'boolean') throw bad('verified must be true or false.');
    db.prepare('UPDATE organisations SET verified=? WHERE id=?').run(d.verified ? 1 : 0, o.id);
    send(res, 200, orgView(db.prepare('SELECT * FROM organisations WHERE id=?').get(o.id))); return true;
  }
  m = /^\/api\/orgs\/([a-z0-9-]+)\/posts$/.exec(path);
  if (method === 'POST' && m) {
    if (!user) throw bad('Please sign in.', 401); if (!isAdmin()) throw bad('Only administrators can post as an organisation.', 403);
    const o = db.prepare('SELECT * FROM organisations WHERE slug=?').get(m[1]); if (!o) throw bad('Organisation not found.', 404);
    const d = await body(req);
    const content = str(d.content, 2000, 'content'), contentLo = str(d.contentLo, 2000, 'contentLo');
    if (!content && !contentLo) throw bad('Write the post in English or Lao.');
    if (d.type !== undefined && !POST_TYPES.includes(d.type)) throw bad('Unknown post type.');
    const media = wrap(() => cleanMedia(d.media)); if (['poster', 'video'].includes(d.type) && !media.length) throw bad('Posters and videos need at least one attachment.');
    if (d.sourceUrl && !urlOk(d.sourceUrl)) throw bad('sourceUrl must be an http(s) link.');
    const id = randomUUID();
    const data = { id, orgId: o.id, type: d.type, media: media.length ? media : undefined, sourceUrl: d.sourceUrl || undefined, pinned: d.pinned === true, content: content || contentLo, contentLo: contentLo || undefined, contentLanguage: contentLo && !content ? 'lo' : 'en',
      tags: ['OnlineScam'], author: { name: o.name_en, handle: `@${o.slug}`, initials: initials(o.name_en), color: '#5B21D1', points: 0 }, risk_level: 'green', state: 'clean', likes: 0, comments: 0, reposts: 0, warnedMe: 0, timestamp: 'Just now' };
    db.prepare('INSERT INTO posts VALUES (?,NULL,?,?)').run(id, JSON.stringify(data), Date.now());
    send(res, 201, view(db.prepare('SELECT * FROM posts WHERE id=?').get(id))); return true;
  }

  // ---- public user profiles (public fields only; Kids accounts are never public)
  const userByHandle = handle => {
    const h = decodeURIComponent(handle).replace(/^@/, '').toLowerCase();
    return db.prepare('SELECT * FROM users').all().find(u => { const p = JSON.parse(u.profile || '{}'); return (p.handle || `@sati_${u.id.slice(0, 8)}`).replace(/^@/, '').toLowerCase() === h; });
  };
  const publicUser = u => {
    const p = JSON.parse(u.profile || '{}'), handle = p.handle || `@sati_${u.id.slice(0, 8)}`;
    return { id: u.id, name: u.name, handle, initials: initials(u.name), bio: typeof p.bio === 'string' ? p.bio.slice(0, 300) : '', avatar: p.avatar ?? null, banner: p.banner ?? null, ageBand: u.age_band ?? null };
  };
  m = /^\/api\/users\/(@?[^/]+)(\/posts)?$/.exec(path);
  if (method === 'GET' && m) {
    const u = userByHandle(m[1]); if (!u || u.age_band === 'kids') throw bad('Person not found.', 404);
    const mine = rows().filter(r => r.user_id === u.id && visible(r));
    if (m[2]) { send(res, 200, wrap(() => page(mine, view))); return true; }
    const followers = db.prepare("SELECT COUNT(*) n FROM follows WHERE target_kind='user' AND target_id=?").get(u.id).n;
    const helpful = db.prepare("SELECT COUNT(*) n FROM reactions r JOIN posts p ON p.id=r.post_id WHERE p.user_id=? AND r.kind='warned'").get(u.id).n;
    send(res, 200, { user: publicUser(u), stats: { followers, posts: mine.length, helpful }, following: !!user && followedSets(db, user.id).users.has(u.id), posts: wrap(() => page(mine, view)) }); return true;
  }

  // ---- follow / unfollow
  if (method === 'POST' && path === '/api/follow') {
    if (!user) throw bad('Please sign in.', 401);
    const d = await body(req);
    if (!['org', 'user'].includes(d.kind) || typeof d.id !== 'string' || typeof d.follow !== 'boolean') throw bad('Send kind (org or user), id and follow (true or false).');
    let target;
    if (d.kind === 'org') { target = db.prepare('SELECT id FROM organisations WHERE id=? OR slug=?').get(d.id, d.id); }
    else { target = db.prepare('SELECT id,age_band FROM users WHERE id=?').get(d.id); if (target?.age_band === 'kids') target = null; if (target?.id === user.id) throw bad('You cannot follow yourself.'); }
    if (!target) throw bad('Not found.', 404);
    if (d.follow) db.prepare('INSERT OR IGNORE INTO follows VALUES (?,?,?,?)').run(user.id, d.kind, target.id, Date.now());
    else db.prepare('DELETE FROM follows WHERE user_id=? AND target_kind=? AND target_id=?').run(user.id, d.kind, target.id);
    const followers = db.prepare('SELECT COUNT(*) n FROM follows WHERE target_kind=? AND target_id=?').get(d.kind, target.id).n;
    send(res, 200, { following: d.follow, followers }); return true;
  }

  // ---- game progress (best score and XP per game)
  if (method === 'POST' && path === '/api/game-progress') {
    if (!user) throw bad('Please sign in.', 401);
    const d = await body(req);
    if (!GAMES.includes(d.game)) throw bad('Unknown game.');
    const int = (v, max, n) => { if (!Number.isInteger(v) || v < 0 || v > max) throw bad(`${n} must be a whole number from 0 to ${max}.`); return v; };
    const score = int(d.score, 100000, 'score'), xp = int(d.xp ?? 0, 1000, 'xp');
    db.prepare('INSERT INTO game_progress(user_id,game,best_score,xp,plays,updated) VALUES (?,?,?,?,1,?) ON CONFLICT(user_id,game) DO UPDATE SET best_score=MAX(best_score,excluded.best_score), xp=xp+excluded.xp, plays=plays+1, updated=excluded.updated')
      .run(user.id, d.game, score, xp, Date.now());
    const row = db.prepare('SELECT game,best_score bestScore,xp,plays FROM game_progress WHERE user_id=? AND game=?').get(user.id, d.game);
    send(res, 200, row); return true;
  }
  if (method === 'GET' && path === '/api/game-progress') {
    if (!user) throw bad('Please sign in.', 401);
    send(res, 200, db.prepare('SELECT game,best_score bestScore,xp,plays FROM game_progress WHERE user_id=? ORDER BY game').all(user.id)); return true;
  }

  // ---- "Help Sati learn" thumbs up / down (signed-in or anonymous; the global write rate limit applies)
  if (method === 'POST' && path === '/api/sati-feedback') {
    const d = await body(req);
    if (!['up', 'down'].includes(d.vote)) throw bad('vote must be up or down.');
    const topic = str(d.topic, 60, 'topic'), note = str(d.note, 500, 'note');
    db.prepare('INSERT INTO sati_feedback VALUES (?,?,?,?,?,?,?)').run(randomUUID(), user?.id ?? null, d.vote, topic, note, d.lang === 'en' ? 'en' : 'lo', Date.now());
    send(res, 201, { ok: true }); return true;
  }
  return false;
}
