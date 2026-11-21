import test from 'node:test';
import assert from 'node:assert/strict';
import { start } from './test-helpers.mjs';

test('A6: website feedback validates, stores and is listed for admins only', async () => {
  const f = await start(); try {
    const ok = await f.call('/api/feedback', { method: 'POST', body: { name: 'Mali', email: 'mali@example.com', message: 'Great site, please add more Lao tips.', page: '/about', lang: 'en' }, headers: { Origin: 'https://sati-coral.vercel.app' } });
    assert.equal(ok.status, 201); assert.ok(ok.value.id);
    assert.equal((await f.call('/api/feedback', { method: 'POST', body: { message: 'hi' } })).status, 400);
    assert.equal((await f.call('/api/feedback', { method: 'POST', body: { message: 'long enough message', email: 'not-an-email' } })).status, 400);
    assert.equal((await f.call('/api/feedback', { method: 'POST', body: { message: 'x'.repeat(2001) } })).status, 400);
    assert.equal((await f.call('/api/feedback', { method: 'POST', body: { message: 'spam spam spam', website: 'http://bot' } })).status, 202);
    assert.equal(f.db.prepare('SELECT COUNT(*) n FROM feedback').get().n, 1);
    assert.equal((await f.call('/api/admin/feedback')).status, 401);
    const user = await f.register('plain@example.com');
    assert.equal((await f.call('/api/admin/feedback', { token: user.token })).status, 403);
    const admin = await f.admin();
    const list = await f.call('/api/admin/feedback', { token: admin.token });
    assert.equal(list.status, 200); assert.equal(list.value[0].message, 'Great site, please add more Lao tips.');
    // 5 per hour per client: 1 stored + 3 invalid-but-counted + honeypot = 5, the next is refused.
    assert.equal((await f.call('/api/feedback', { method: 'POST', body: { message: 'sixth message here' } })).status, 429);
  } finally { await f.close(); }
});
