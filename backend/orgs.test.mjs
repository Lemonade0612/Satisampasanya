import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from './server.mjs';
import { promoteAdmin } from './access.mjs';

async function fixture() {
  const app = createApp({ database: ':memory:', seed: true });
  await new Promise(r => app.server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${app.server.address().port}/api`;
  const call = async (path, method = 'GET', data, token) => { const r = await fetch(base + path, { method, headers: { ...(data ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: data ? JSON.stringify(data) : undefined }); return { status: r.status, value: await r.json().catch(() => null) }; };
  const register = async (email, extra = {}) => (await call('/auth/register', 'POST', { name: email.split('@')[0], email, password: 'correct-password', ...extra })).value;
  return { ...app, call, register };
}

test('seeded organisations, profile page data and paged org posts', async () => {
  const f = await fixture();
  try {
    const o = (await f.call('/orgs/mtc-laos')).value;
    assert.equal(o.verified, true); assert.equal(o.nameEn, 'Ministry of Technology and Communications'); assert.ok(o.posts >= 1); assert.equal(o.following, false);
    assert.equal((await f.call('/orgs/nope')).status, 404);
    const posts = (await f.call('/orgs/mtc-laos/posts?limit=5')).value;
    assert.ok(posts.posts.length >= 1); assert.equal(posts.posts[0].org.slug, 'mtc-laos'); assert.equal(posts.posts[0].org.verified, true);
    for (const slug of ['unicef-laos', 'lao-womens-union']) assert.equal((await f.call(`/orgs/${slug}`)).status, 200);
  } finally { await f.close(); }
});

test('only an administrator can create, verify or post as an organisation; new ones start unverified', async () => {
  const f = await fixture();
  try {
    const user = await f.register('member@example.com'), admin = await f.register('boss@example.com'); promoteAdmin(f.db, 'boss@example.com');
    const body = { slug: 'test-ngo', nameLo: 'ທົດສອບ', nameEn: 'Test NGO', type: 'ngo' };
    assert.equal((await f.call('/orgs', 'POST', body)).status, 401);
    assert.equal((await f.call('/orgs', 'POST', body, user.token)).status, 403);
    assert.equal((await f.call('/orgs', 'POST', { ...body, type: 'cult' }, admin.token)).status, 400);
    const made = await f.call('/orgs', 'POST', body, admin.token);
    assert.equal(made.status, 201); assert.equal(made.value.verified, false);
    assert.equal((await f.call('/orgs/test-ngo/verify', 'POST', { verified: true }, user.token)).status, 403);
    assert.equal((await f.call('/orgs/test-ngo/verify', 'POST', { verified: true }, admin.token)).value.verified, true);
    assert.equal((await f.call('/orgs/test-ngo/posts', 'POST', { content: 'Hello', type: 'poster' }, admin.token)).status, 400);
    const p = await f.call('/orgs/test-ngo/posts', 'POST', { content: 'Hello', pinned: true }, admin.token);
    assert.equal(p.status, 201); assert.equal(p.value.org.verified, true);
    assert.equal((await f.call('/orgs/test-ngo/posts', 'POST', { content: 'Hi' }, user.token)).status, 403);
  } finally { await f.close(); }
});

test('follow and unfollow organisations and people; Following feed; Kids and self are refused', async () => {
  const f = await fixture();
  try {
    const a = await f.register('a@example.com', { ageBand: 'adult' }), b = await f.register('b@example.com', { ageBand: 'adult' }), kid = await f.register('kid@example.com', { ageBand: 'kids' });
    assert.equal((await f.call('/follow', 'POST', { kind: 'org', id: 'mtc-laos', follow: true })).status, 401);
    assert.equal((await f.call('/follow', 'POST', { kind: 'org', id: 'mtc-laos' }, a.token)).status, 400);
    const r = await f.call('/follow', 'POST', { kind: 'org', id: 'mtc-laos', follow: true }, a.token);
    assert.deepEqual(r.value, { following: true, followers: 1 });
    assert.equal((await f.call('/follow', 'POST', { kind: 'org', id: 'mtc-laos', follow: true }, a.token)).value.followers, 1); // idempotent
    assert.equal((await f.call('/orgs/mtc-laos', 'GET', undefined, a.token)).value.following, true);
    const feed = (await f.call('/feed?tab=following&band=adult', 'GET', undefined, a.token)).value;
    assert.ok(feed.posts.length >= 1 && feed.posts.every(p => p.org?.slug === 'mtc-laos'));
    assert.equal((await f.call('/follow', 'POST', { kind: 'user', id: a.user.id, follow: true }, a.token)).status, 400);
    assert.equal((await f.call('/follow', 'POST', { kind: 'user', id: kid.user.id, follow: true }, a.token)).status, 404);
    assert.equal((await f.call('/follow', 'POST', { kind: 'user', id: b.user.id, follow: true }, a.token)).value.followers, 1);
    assert.equal((await f.call('/follow', 'POST', { kind: 'org', id: 'mtc-laos', follow: false }, a.token)).value.followers, 0);
  } finally { await f.close(); }
});

test('public user profile exposes public fields only and hides Kids accounts', async () => {
  const f = await fixture();
  try {
    const u = await f.register('pat@example.com', { ageBand: 'adult' }), kid = await f.register('kid@example.com', { ageBand: 'kids' });
    const handle = u.user.handle.replace('@', '');
    const r = await f.call(`/users/${handle}`);
    assert.equal(r.status, 200);
    assert.equal(r.value.user.name, 'pat'); assert.equal(r.value.user.ageBand, 'adult');
    const text = JSON.stringify(r.value);
    for (const secret of ['pat@example.com', 'password', 'salt', 'email']) assert.equal(text.includes(secret), false, secret);
    assert.deepEqual(Object.keys(r.value.stats).sort(), ['followers', 'helpful', 'posts']);
    assert.equal((await f.call(`/users/@${handle}/posts`)).status, 200);
    assert.equal((await f.call(`/users/${kid.user.handle.replace('@', '')}`)).status, 404);
    assert.equal((await f.call('/users/nobody')).status, 404);
  } finally { await f.close(); }
});

test('game progress keeps best score, adds XP, validates and requires sign-in; feedback validates', async () => {
  const f = await fixture();
  try {
    const u = await f.register('gamer@example.com');
    assert.equal((await f.call('/game-progress', 'POST', { game: 'links', score: 5, xp: 10 })).status, 401);
    assert.equal((await f.call('/game-progress', 'POST', { game: 'nope', score: 5 }, u.token)).status, 400);
    assert.equal((await f.call('/game-progress', 'POST', { game: 'links', score: -1 }, u.token)).status, 400);
    assert.equal((await f.call('/game-progress', 'POST', { game: 'links', score: 300, xp: 50 }, u.token)).value.bestScore, 300);
    const second = (await f.call('/game-progress', 'POST', { game: 'links', score: 100, xp: 20 }, u.token)).value;
    assert.deepEqual(second, { game: 'links', bestScore: 300, xp: 70, plays: 2 });
    assert.equal((await f.call('/game-progress', 'GET', undefined, u.token)).value.length, 1);
    assert.equal((await f.call('/sati-feedback', 'POST', { vote: 'maybe' })).status, 400);
    assert.equal((await f.call('/sati-feedback', 'POST', { vote: 'up', topic: 'how-sati', note: 'clear' })).status, 201);
    assert.equal(f.db.prepare('SELECT COUNT(*) n FROM sati_feedback').get().n, 1);
  } finally { await f.close(); }
});
