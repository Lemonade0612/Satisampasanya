import test from 'node:test';
import assert from 'node:assert/strict';
import { start } from './test-helpers.mjs';

const draft = { content: 'Beware of fake job offers abroad.', contentLo: 'ລະວັງວຽກປອມຕ່າງປະເທດ', tags: ['JobScam'] };
test('A7: check-status is owner-only and reports done after screening', async () => {
  const f = await start({ check: async post => { post.check = { verdict: 'approved', risk: 'low', labels: [], on_topic: true, reasons: [], summary: 'ok' }; post.state = 'clean'; post.screeningStage = 'completed'; return post; } }); try {
    const author = await f.register('author@example.com', { ageBand: 'youth' }), other = await f.register('other@example.com', { ageBand: 'youth' });
    const post = await f.call('/api/posts', { method: 'POST', body: draft, token: author.token }); assert.equal(post.status, 201);
    const mine = await f.call(`/api/posts/${post.value.id}/check-status`, { token: author.token });
    assert.equal(mine.status, 200); assert.equal(mine.value.status, 'done'); assert.equal(mine.value.progress, 100); assert.equal(mine.value.verdict, 'approved');
    assert.equal((await f.call(`/api/posts/${post.value.id}/check-status`, { token: other.token })).status, 404);
    assert.equal((await f.call(`/api/posts/${post.value.id}/check-status`)).status, 401);
    assert.equal((await f.call('/api/posts/nope/check-status', { token: author.token })).status, 404);
    // A post that has not been screened yet is queued.
    f.db.prepare('UPDATE posts SET data=? WHERE id=?').run(JSON.stringify({ ...JSON.parse(f.db.prepare('SELECT data FROM posts WHERE id=?').get(post.value.id).data), check: undefined, review: undefined }), post.value.id);
    const q = await f.call(`/api/posts/${post.value.id}/check-status`, { token: author.token });
    assert.equal(q.value.status, 'queued'); assert.equal(q.value.progress, 0);
  } finally { await f.close(); }
});
