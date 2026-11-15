import test from 'node:test';
import assert from 'node:assert/strict';
import { interleave, pageFeed, feedFields, cleanMedia, decodeCursor } from './feed.mjs';
import { createApp } from './server.mjs';

const row = (i, extra = {}) => ({ id: `p${String(i).padStart(3, '0')}`, created: 1000 + i, data: JSON.stringify({ content: 'x', ...extra }) });
const view = r => ({ id: r.id, ...feedFields(JSON.parse(r.data)) });

test('feedFields types old posts from their image or link', () => {
  assert.equal(feedFields({}).type, 'text');
  assert.equal(feedFields({ image: 'data:image/png;base64,AA' }).type, 'poster');
  assert.equal(feedFields({ link: 'https://a.la' }).type, 'link');
  assert.equal(feedFields({ media: [{ kind: 'video', url: 'https://a.la/v.mp4' }] }).type, 'video');
  assert.equal(feedFields({ type: 'video', media: [] }).type, 'video');
});

test('interleave never puts more than 2 of one type in a row when others exist', () => {
  const items = ['text', 'text', 'text', 'text', 'video', 'poster', 'text', 'link'].map((type, i) => ({ id: i, type }));
  const out = interleave(items);
  assert.equal(out.length, items.length);
  for (let i = 2; i < out.length; i++) assert.ok(!(out[i].type === out[i - 1].type && out[i].type === out[i - 2].type), out.map(o => o.type).join());
  assert.deepEqual(interleave([{ type: 'text' }, { type: 'text' }, { type: 'text' }]).length, 3); // nothing to mix: keep all
});

test('pageFeed pages by cursor with no gaps or repeats, pins first, and since returns only newer posts', () => {
  const rows = [];
  for (let i = 25; i >= 1; i--) rows.push(row(i, i % 3 === 0 ? { image: 'https://a.la/i.png' } : {}));
  rows.push(row(0, { pinned: true, type: 'link', sourceUrl: 'https://mtc.gov.la' }));
  rows.sort((a, b) => b.created - a.created);
  const p1 = pageFeed(rows, { limit: 10, view });
  assert.equal(p1.posts[0].id, 'p000'); assert.equal(p1.posts[0].pinned, true);
  assert.equal(p1.posts.length, 11);
  assert.equal(p1.newestId, 'p025');
  const p2 = pageFeed(rows, { cursor: p1.nextCursor, limit: 10, view });
  const p3 = pageFeed(rows, { cursor: p2.nextCursor, limit: 10, view });
  assert.equal(p3.nextCursor, null);
  const ids = [...p1.posts, ...p2.posts, ...p3.posts].map(p => p.id);
  assert.equal(new Set(ids).size, 26); assert.equal(ids.length, 26);
  const fresh = [row(30), row(29), ...rows];
  assert.deepEqual(pageFeed(fresh, { since: 'p025', view }).posts.map(p => p.id).sort(), ['p029', 'p030']);
  assert.deepEqual(pageFeed(fresh, { since: 'nope', view }).posts, []);
  assert.throws(() => pageFeed(rows, { cursor: 'bad', view }), /cursor/);
  assert.deepEqual(decodeCursor('1_a'), { created: 1, id: 'a' }); assert.equal(decodeCursor('x'), null);
});

test('cleanMedia validates kind, url and count', () => {
  assert.equal(cleanMedia([{ kind: 'image', url: 'https://a.la/i.png', caption_lo: 'ຄຳອະທິບາຍ' }])[0].caption_lo, 'ຄຳອະທິບາຍ');
  assert.throws(() => cleanMedia([{ kind: 'image', url: 'javascript:alert(1)' }]));
  assert.throws(() => cleanMedia([{ kind: 'gif', url: 'https://a.la/x' }]));
  assert.throws(() => cleanMedia(Array.from({ length: 11 }, () => ({ kind: 'image', url: 'https://a.la/i.png' }))));
});

async function api() {
  const app = createApp({ database: ':memory:', seed: false });
  await new Promise(r => app.server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${app.server.address().port}/api`;
  return { ...app, get: async p => { const r = await fetch(base + p); return { status: r.status, body: await r.json() }; } };
}
const insert = (db, id, created, data) => db.prepare('INSERT INTO posts VALUES (?,NULL,?,?)').run(id, JSON.stringify({ content: id, state: 'clean', ...data }), created);

test('GET /api/feed returns { posts, nextCursor, newestId }, pinned first, validates input', async () => {
  const f = await api();
  try {
    const now = Date.now();
    for (let i = 0; i < 14; i++) insert(f.db, `a${String(i).padStart(2, '0')}`, now - i * 1000, i % 2 ? { image: 'https://a.la/i.png' } : {});
    insert(f.db, 'pin', now - 99999, { pinned: true, type: 'link', sourceUrl: 'https://mtc.gov.la', bands: undefined });
    const a = await f.get('/feed?limit=10');
    assert.equal(a.status, 200);
    assert.equal(a.body.posts[0].id, 'pin');
    assert.equal(a.body.newestId, 'a00');
    assert.ok(a.body.nextCursor);
    assert.equal(a.body.posts.find(p => p.id === 'a01').type, 'poster');
    const b = await f.get(`/feed?cursor=${encodeURIComponent(a.body.nextCursor)}&limit=10`);
    assert.equal(b.body.nextCursor, null);
    assert.equal(new Set([...a.body.posts, ...b.body.posts].map(p => p.id)).size, 15);
    assert.equal((await f.get('/feed?cursor=zzz')).status, 400);
    assert.equal((await f.get('/feed?tab=nope')).status, 400);
    assert.deepEqual((await f.get('/feed?tab=following')).body.posts, []);
    insert(f.db, 'newer', now + 5000, {});
    assert.deepEqual((await f.get('/feed?since=a00')).body.posts.map(p => p.id), ['newer']);
    assert.equal(JSON.stringify(a.body).includes('"password"'), false);
  } finally { await f.close(); }
});
