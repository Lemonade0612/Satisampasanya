import test from 'node:test';
import assert from 'node:assert/strict';
import { start } from './test-helpers.mjs';
import { consoleTransport, createMailer, resetMail } from './mailer.mjs';

test('A9: console transport hides the body in production', async () => {
  const lines = []; await consoleTransport({ log: l => lines.push(l), production: true }).send({ to: 'mali@example.com', subject: 'Reset', text: 'http://x/?reset=SECRET' });
  assert.ok(!lines.join().includes('SECRET')); assert.ok(!lines.join().includes('mali@'));
  const dev = []; await consoleTransport({ log: l => dev.push(l), production: false }).send({ to: 'a@b.co', subject: 'Reset', text: 'LINK' });
  assert.ok(dev.join().includes('LINK'));
});
test('A9: smtp without config or nodemailer falls back to console', async () => {
  const logs = []; const m = await createMailer({ MAIL_TRANSPORT: 'smtp' }, { log: l => logs.push(l) });
  assert.equal(m.name, 'console'); assert.match(logs[0], /SMTP unavailable/);
});
test('A9: reset mail is bilingual and links to APP_URL', () => {
  assert.match(resetMail('tok', 'en', 'https://app.test/').text, /https:\/\/app\.test\/\?reset=tok/);
  assert.match(resetMail('tok', 'lo').subject, /[຀-໿]/u);
});
test('A9: /auth/forgot sends through the injected mailer and never leaks whether the account exists', async () => {
  const sent = []; const f = await start({ mailer: { name: 'test', send: async m => { sent.push(m); return {}; } } }); try {
    await f.register('mali@example.com');
    const known = await f.call('/api/auth/forgot', { method: 'POST', body: { email: 'mali@example.com' } });
    const unknown = await f.call('/api/auth/forgot', { method: 'POST', body: { email: 'nobody@example.com' } });
    assert.equal(known.status, 202); assert.equal(unknown.status, 202); assert.deepEqual(known.value, unknown.value);
    assert.equal(sent.length, 1); assert.equal(sent[0].to, 'mali@example.com'); assert.match(sent[0].text, /\?reset=[0-9a-f]{64}/);
  } finally { await f.close(); }
});
