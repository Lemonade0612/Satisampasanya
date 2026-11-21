import test from 'node:test';
import assert from 'node:assert/strict';
import { start } from './test-helpers.mjs';

const burst = async (f, headers, n = 25) => { let last; for (let i = 0; i < n; i++) last = await f.call('/api/auth/login', { method: 'POST', body: { email: `x${i}@example.com`, password: 'wrong-password' }, headers }); return last.status; };

test('A3: forwarded headers are ignored by default, so spoofing cannot dodge the rate limit', async () => {
  const f = await start(); try {
    let status; for (let i = 0; i < 25; i++) status = (await f.call('/api/auth/login', { method: 'POST', body: { email: 'a@example.com', password: 'wrong-password' }, headers: { 'CF-Connecting-IP': `9.9.9.${i}`, 'X-Forwarded-For': `8.8.8.${i}`, 'X-Real-IP': `7.7.7.${i}` } })).status;
    assert.equal(status, 429);
  } finally { await f.close(); }
});
test('A3: CF-Connecting-IP is used only with TRUST_CLOUDFLARE', async () => {
  const f = await start({ trustCloudflare: true }); try {
    let status; for (let i = 0; i < 25; i++) status = (await f.call('/api/auth/login', { method: 'POST', body: { email: `c${i}@example.com`, password: 'wrong-password' }, headers: { 'CF-Connecting-IP': `9.9.9.${i}` } })).status;
    assert.notEqual(status, 429);
    assert.equal(await burst(f, { 'CF-Connecting-IP': '1.1.1.1' }), 429);
  } finally { await f.close(); }
});
test('A3: X-Forwarded-For needs TRUST_PROXY', async () => {
  const f = await start({ trustProxy: true }); try {
    let status; for (let i = 0; i < 25; i++) status = (await f.call('/api/auth/login', { method: 'POST', body: { email: `d${i}@example.com`, password: 'wrong-password' }, headers: { 'X-Forwarded-For': `6.6.6.6, 5.5.5.${i}` } })).status;
    assert.notEqual(status, 429);
  } finally { await f.close(); }
});
test('A4: default CORS allows production, previews and mobile; rejects others', async () => {
  const f = await start(); try {
    for (const origin of ['https://sati-coral.vercel.app', 'https://sati-git-feat-x-satii.vercel.app', 'https://sati-preview.netlify.app', 'capacitor://localhost', 'http://localhost:5173']) {
      const r = await f.call('/api/health', { headers: { Origin: origin } });
      assert.equal(r.status, 200, origin); assert.equal(r.headers.get('access-control-allow-origin'), origin);
    }
    for (const origin of ['https://evil.example.com', 'https://notsati.vercel.app', 'https://sati-x.vercel.app.evil.com']) assert.equal((await f.call('/api/health', { headers: { Origin: origin } })).status, 403, origin);
  } finally { await f.close(); }
});
test('A4: env origins add to the defaults', async () => {
  const f = await start({ origins: ['https://app.example.org'] }); try {
    assert.equal((await f.call('/api/health', { headers: { Origin: 'https://app.example.org' } })).status, 200);
  } finally { await f.close(); }
});
test('A5: /health and /api/health report DB status', async () => {
  const f = await start(); try {
    for (const path of ['/health', '/api/health']) { const r = await f.call(path); assert.equal(r.status, 200); assert.equal(r.value.ok, true); assert.equal(r.value.db, 'ok'); }
    f.db.close();
    assert.equal((await f.call('/health')).status, 503);
  } finally { f.server.closeAllConnections(); await new Promise(r => f.server.close(r)); }
});
