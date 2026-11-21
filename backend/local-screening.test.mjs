import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { normalize } from './screening/normalize.mjs';
import { screenText, screenWithAI } from './screening/screen.mjs';
import { localFirstCheck, laoShare } from './screening/local-check.mjs';
import { checkPost } from './safety/post-check.mjs';
import { CATEGORIES } from './screening/categories.mjs';

const rows = readFileSync(new URL('./screening/testdata/en.jsonl', import.meta.url), 'utf8').trim().split('\n').map(l => JSON.parse(l));

test('B3: normalizer undoes leet, spacing, zero-width, homoglyphs, emoji and stretching', () => {
  assert.equal(normalize('S3nd m0n3y n0w'), 'send money now');
  assert.equal(normalize('s e n d  y o u r  o t p'), 'send your otp');
  assert.equal(normalize('send​ money'), 'send money');
  assert.equal(normalize('Fuсk'), 'fuck'); // Cyrillic с
  assert.equal(normalize('You are a 🐷'), 'you are a pig');
  assert.equal(normalize('freeeee job'), 'free job');
  assert.equal(normalize('Pay $500 in 2025'), 'pay $500 in 2025'); // numbers stay numbers
});
test('B4/B6: output shape, strictness and context', () => {
  const bad = screenText('Send a deposit of 500000 kip first to secure your visa');
  assert.equal(bad.status, 'red'); assert.ok(bad.categories.includes('money_ask')); assert.ok(bad.reasons.length && bad.score >= 0.8);
  assert.deepEqual(Object.keys(bad).sort().slice(0, 4), ['categories', 'reasons', 'safeContext', 'score']);
  assert.equal(screenText('Warning: never share your OTP with anyone, not even the bank').status, 'green');
  assert.equal(screenText('Police arrested five suspects running a fake job scam, officials said').status, 'green');
  assert.equal(screenText('We are hiring a cashier. Apply by email with your CV and visit our office.').status, 'green');
  assert.ok(screenText('DM me').scores.private_contact >= 0);
});
test('B6: the AI is asked for green and yellow but never for red, and the stricter verdict wins; AI errors never throw', async () => {
  let calls = 0; const llm = verdict => async () => { calls++; return { verdict, labels: [], summary: 's' }; };
  const green = await screenWithAI('Good morning everyone', { llm: llm('needs_expert') }); assert.equal(green.finalStatus, 'red'); assert.equal(calls, 1);
  const red = await screenWithAI('Send a deposit of 500000 kip first to secure your visa', { llm: llm('approved') }); assert.equal(red.finalStatus, 'red'); assert.equal(calls, 1);
  const yellowText = rows.map(r => r.text).find(t => screenText(t).status === 'yellow'); assert.ok(yellowText, 'dataset has a yellow example');
  const upgraded = await screenWithAI(yellowText, { llm: llm('needs_expert') }); assert.equal(upgraded.finalStatus, 'red'); assert.equal(calls, 2);
  const kept = await screenWithAI(yellowText, { llm: llm('approved') }); assert.equal(kept.finalStatus, 'yellow'); assert.equal(calls, 3);
  const broken = await screenWithAI(yellowText, { llm: async () => { throw new Error('down'); } }); assert.equal(broken.finalStatus, 'yellow'); assert.equal(broken.ai.error, true);
});
test('B7: dev holdout meets the targets (recall per category >= 95%, false positives <= 10%)', () => {
  const hold = rows.filter(r => r.split === 'holdout'), out = hold.map(r => [r, screenText(r.text)]);
  for (const cat of CATEGORIES) {
    const pos = out.filter(([r]) => r.labels.includes(cat)), tp = pos.filter(([, o]) => o.status !== 'green' && o.categories.includes(cat)).length;
    assert.ok(tp / pos.length >= 0.95, `${cat} recall ${tp}/${pos.length}`);
  }
  const safe = out.filter(([r]) => !r.labels.length), fp = safe.filter(([, o]) => o.status !== 'green').length;
  assert.ok(fp / safe.length <= 0.1, `false positives ${fp}/${safe.length}`);
});
test('B5: the classifier loads from model.json, fits the training split, and never saw the holdout', async () => {
  const { classify, loadModel } = await import('./screening/classifier.mjs');
  assert.equal(Object.keys(loadModel().categories).length, CATEGORIES.length);
  const train = rows.filter(r => r.split === 'train' && r.labels.length), hit = train.filter(r => classify(r.text)[r.labels[0]] >= 0.5).length;
  assert.ok(hit / train.length >= 0.9, `train recall ${hit}/${train.length}`);
  // Honest limit: on held-out templates the classifier alone is weak (see RELEASE_REPORT.md); the rules carry generalisation.
});
test('B6: works with AI_PROVIDER=mock through the real post-check path', async () => {
  const old = process.env.AI_PROVIDER; process.env.AI_PROVIDER = 'mock';
  try {
    const harmful = { content: 'Send a deposit of 500000 kip first to secure your visa job in Cambodia', tags: [] }; await checkPost(harmful);
    assert.equal(harmful.check.verdict, 'needs_expert'); assert.equal(harmful.state, 'flagged'); assert.equal(harmful.frozen, true);
    const fine = { content: 'Good morning everyone, remember to check official sources before applying for a scholarship', tags: [] }; await checkPost(fine);
    assert.equal(fine.check.verdict, 'approved'); assert.equal(fine.state, 'clean');
  } finally { old === undefined ? delete process.env.AI_PROVIDER : process.env.AI_PROVIDER = old; }
});
test('B8: Lao text keeps the old AI-only path, unchanged', async () => {
  const lao = 'ຮັບສະໝັກພະນັກງານໄປເຮັດວຽກໄທ ເງິນເດືອນສູງ ບໍ່ຕ້ອງມີປະສົບການ ທັກມາເລີຍ';
  assert.ok(laoShare(lao) > 0.9);
  const seen = []; const stub = { verdict: 'caution', risk: 'medium', labels: ['scam_risk'], on_topic: true, reasons: [], suggested_edit: 'x', summary: 's', language: 'lo', checkedAt: 1 };
  const result = await localFirstCheck(lao, { llm: async (t) => { seen.push(t); return stub; } });
  assert.deepEqual(seen, [lao]); assert.equal(result, stub);
  // Even text that looks harmless is never auto-approved locally: Lao always reaches the AI.
  const calm = 'ສະບາຍດີທຸກຄົນ ມື້ນີ້ອາກາດດີຫຼາຍ'; seen.length = 0;
  assert.equal(await localFirstCheck(calm, { llm: async (t) => { seen.push(t); return stub; } }), stub); assert.deepEqual(seen, [calm]);
  // Lao failures still throw, as before.
  await assert.rejects(localFirstCheck(lao, { llm: async () => { throw Object.assign(new Error('down'), { status: 503 }); } }), /down/);
  // checkPost with an injected checker behaves exactly as before for Lao and English.
  const calls = []; const post = { content: 'English', contentLo: lao, contentLanguage: 'lo', tags: [] };
  await checkPost(post, { check: async t => { calls.push(t); return stub; } }); assert.ok(calls.includes(lao)); assert.equal(post.check, stub);
});

test('routing: green asks the AI when a provider is configured; stricter wins', async () => {
  const text = 'Good morning everyone, remember to check official sources before applying for a scholarship';
  let calls = 0; const stub = v => async () => { calls++; return { verdict: v, risk: v === 'approved' ? 'low' : 'high', labels: ['scam_risk'], on_topic: true, reasons: [], suggested_edit: '', summary: 'ai', language: 'en', checkedAt: 1 }; };
  const up = await localFirstCheck(text, { llm: stub('needs_expert'), ai: true }); assert.equal(calls, 1); assert.equal(up.verdict, 'needs_expert');
  const same = await localFirstCheck(text, { llm: stub('approved'), ai: true }); assert.equal(calls, 2); assert.equal(same.verdict, 'approved'); assert.ok(!same.unverified);
});
test('routing: local red goes to experts with no AI call', async () => {
  let calls = 0; const r = await localFirstCheck('Send a deposit of 500000 kip first to secure your visa job in Cambodia', { llm: async () => { calls++; return { verdict: 'approved', risk: 'low' }; }, ai: true });
  assert.equal(r.verdict, 'needs_expert'); assert.equal(calls, 0);
});
test('routing: no provider keeps the local result and marks green as unverified', async () => {
  let calls = 0; const llm = async () => { calls++; throw new Error('must not be called'); };
  const g = await localFirstCheck('Good morning everyone, have a nice day', { llm, ai: false }); assert.equal(g.verdict, 'approved'); assert.equal(g.unverified, true); assert.equal(calls, 0);
  const y = rows.map(r => r.text).find(t => screenText(t).status === 'yellow');
  const yr = await localFirstCheck(y, { llm, ai: false }); assert.equal(yr.verdict, 'caution'); assert.ok(!yr.unverified);
});
test('routing: an AI failure falls back to the local result, green stays unverified', async () => {
  const boom = async () => { throw new Error('down'); };
  const g = await localFirstCheck('Good morning everyone, have a nice day', { llm: boom, ai: true }); assert.equal(g.verdict, 'approved'); assert.equal(g.unverified, true);
});
test('routing: mock provider counts as no provider', async () => {
  const old = process.env.AI_PROVIDER; process.env.AI_PROVIDER = 'mock';
  try { const { aiAvailable } = await import('./screening/local-check.mjs'); assert.equal(aiAvailable(), false); } finally { old === undefined ? delete process.env.AI_PROVIDER : process.env.AI_PROVIDER = old; }
});
