import test from 'node:test';
import assert from 'node:assert/strict';
import { start } from './test-helpers.mjs';
import { dailyPick } from './daily.mjs';

const pool = Array.from({ length: 12 }, (_, i) => ({ id: `s${String(i).padStart(2, '0')}` }));
test('A8: dailyPick is deterministic per band and date, and differs across days and bands', () => {
  const ids = (band, date) => dailyPick(pool, band, date).map(s => s.id).join();
  assert.equal(ids('youth', '2026-11-22'), ids('youth', '2026-11-22'));
  assert.equal(dailyPick([...pool].reverse(), 'youth', '2026-11-22').map(s => s.id).join(), ids('youth', '2026-11-22'), 'input order must not matter');
  const days = new Set(Array.from({ length: 10 }, (_, i) => ids('youth', `2026-11-${10 + i}`)));
  assert.ok(days.size > 5, 'picks rotate day to day');
  assert.notEqual(ids('youth', '2026-11-22') + ids('adult', '2026-11-23'), ids('adult', '2026-11-22') + ids('youth', '2026-11-23'));
  assert.equal(dailyPick(pool, 'youth', '2026-11-22', 50).length, 12);
});
test('A8: GET /api/scenarios/daily serves live scenarios for one band only', async () => {
  const f = await start(); try {
    const live = f.db.prepare("SELECT COUNT(*) n FROM scenarios").get().n;
    f.db.prepare("UPDATE scenarios SET status='live'").run();
    const a = await f.call('/api/scenarios/daily?band=youth&date=2026-11-22&count=2'), b = await f.call('/api/scenarios/daily?band=youth&date=2026-11-22&count=2');
    assert.equal(a.status, 200); assert.deepEqual(a.value, b.value); assert.equal(a.value.date, '2026-11-22');
    if (live) assert.ok(a.value.scenarios.length >= 1 && a.value.scenarios.length <= 2);
    assert.ok(a.value.scenarios.every(s => s.bands.includes('youth')));
    const kids = await f.call('/api/scenarios/daily?band=kids&date=2026-11-22&count=10');
    assert.ok(kids.value.scenarios.every(s => s.bands.includes('kids') && s.intensity <= 1), 'Kids never get intense scenarios');
    assert.equal((await f.call('/api/scenarios/daily')).status, 400);
    assert.equal((await f.call('/api/scenarios/daily?band=youth&date=bad')).status, 400);
    assert.equal((await f.call('/api/scenarios/daily?band=youth&count=99')).status, 400);
  } finally { await f.close(); }
});
