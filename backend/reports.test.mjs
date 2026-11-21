import test from 'node:test';
import assert from 'node:assert/strict';
import { start } from './test-helpers.mjs';
import { validateReport, trend } from './reports.mjs';

const ok = { category: 'fake_job', verdict: 'red', band: 'youth' };
test('A10: report validation rejects free text, bad enums and far dates', () => {
  assert.equal(validateReport(ok).category, 'fake_job');
  for (const bad of [{ ...ok, message: 'my phone is 020 555 5555' }, { ...ok, category: 'x' }, { ...ok, verdict: 'blue' }, { ...ok, band: 'toddler' }, { ...ok, createdAt: 'soon' }, null, []]) assert.throws(() => validateReport(bad), e => e.status === 400);
  const now = Date.now(); assert.equal(validateReport({ ...ok, createdAt: now - 3 * 86400000 }, now).created, now, 'far dates are replaced by server time');
});
test('A10: POST /api/reports stores no PII; trend and admin stats count by category', async () => {
  const f = await start(); try {
    for (let i = 0; i < 4; i++) assert.equal((await f.call('/api/reports', { method: 'POST', body: { ...ok, createdAt: new Date().toISOString() } })).status, 201);
    for (let i = 0; i < 2; i++) await f.call('/api/reports', { method: 'POST', body: { category: 'romance', verdict: 'yellow', band: 'youth' } });
    await f.call('/api/reports', { method: 'POST', body: { category: 'loan', verdict: 'green', band: 'adult' } });
    assert.equal((await f.call('/api/reports', { method: 'POST', body: { ...ok, message: 'hi' } })).status, 400);
    const cols = f.db.prepare('PRAGMA table_info(scam_reports)').all().map(c => c.name); assert.deepEqual(cols, ['id', 'category', 'verdict', 'band', 'created']);
    const t = await f.call('/api/reports/trend?band=youth'); assert.equal(t.status, 200);
    assert.equal(t.value.total, 6); assert.deepEqual(t.value.top, [{ category: 'fake_job', count: 4 }], 'categories under 3 reports stay hidden');
    assert.equal(t.value.daily.length, 7); assert.equal(t.value.daily.reduce((n, d) => n + d.count, 0), 6);
    assert.equal((await f.call('/api/reports/trend?band=bad')).status, 400);
    assert.equal((await f.call('/api/reports/trend?days=99')).status, 400);
    assert.equal((await f.call('/api/admin/reports/stats')).status, 401);
    assert.equal((await f.call('/api/admin/reports/stats', { token: (await f.register('u@example.com')).token })).status, 403);
    const s = await f.call('/api/admin/reports/stats', { token: (await f.admin()).token });
    assert.equal(s.value.total, 7); assert.deepEqual(s.value.byCategory[0], { category: 'fake_job', count: 4 }); assert.equal(s.value.byBand.find(b => b.band === 'adult').count, 1);
  } finally { await f.close(); }
});
test('A10: reports are rate limited per client', async () => {
  const f = await start(); try {
    let last; for (let i = 0; i < 31; i++) last = (await f.call('/api/reports', { method: 'POST', body: ok })).status;
    assert.equal(last, 429);
  } finally { await f.close(); }
});
