import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { verifyLocal, verifyDeep, safeBrowsing, domainAge } from './link-verify.mjs';
import { sanitizeClaims, extractUrls, extractPhones, lookalike } from '../shared/verify.mjs';
import { assistantStream, scrubNumbers } from './assistant.mjs';
import { modelStream } from './safety/model.mjs';

const text = r => JSON.stringify(r);
const NOW = Date.parse('2026-11-15T00:00:00Z');
const json = (value, ok = true) => async () => ({ ok, status: ok ? 200 : 500, json: async () => value });

test('google.com is green with high confidence and matches the allowlist', () => {
  const r = verifyLocal('google.com');
  assert.equal(r.level, 'green'); assert.equal(r.confidence, 'high');
  assert.ok(r.signals.some(s => s.check === 'official-domain' && s.result === 'pass' && /google\.com/.test(s.detail_en)));
  assert.equal(verifyLocal('https://www.google.com/search?q=hi').level, 'green');
});

test('g00gle-login.xyz is red: look-alike plus a risky ending', () => {
  const r = verifyLocal('g00gle-login.xyz');
  assert.equal(r.level, 'red');
  assert.ok(r.signals.some(s => s.check === 'lookalike' && s.result === 'fail'));
  assert.ok(r.signals.some(s => s.check === 'risky-ending'));
});

test('look-alike tricks: digit swaps, extra words, subdomain trick, punycode, IP address', () => {
  for (const url of ['faceb00k-login.com', 'bcel-verify.net', 'https://www.facebook.com.secure-login.ru/', 'xn--googl-fsa.com', 'http://192.168.1.1/login', 'gooogle.com', 'youtube-gift.xyz'])
    assert.equal(verifyLocal(url).level, 'red', url);
  assert.equal(lookalike('google.com'), null);
  assert.equal(lookalike('example.com'), null);
});

test('a bit.ly link is yellow: the destination cannot be seen', () => {
  const r = verifyLocal('https://bit.ly/win-prize');
  assert.equal(r.level, 'yellow');
  assert.ok(r.signals.some(s => s.check === 'shortener' && /can't see where it really goes/.test(s.detail_en)));
});

test('an unknown site is "can\'t tell", never green', () => {
  const r = verifyLocal('https://some-small-shop.la/about');
  assert.equal(r.level, 'unknown'); assert.equal(r.confidence, 'low');
  assert.equal(verifyLocal('Hello, how are you? e.g. file.txt and 1.5 million').level, 'unknown');
});

test('no link, but a "free visa job" message is red through the risk rules', () => {
  const r = verifyLocal('Job in Thailand! Free visa, free flights, free housing. Pay a deposit first.');
  assert.equal(r.level, 'red'); assert.equal(r.detected.urls.length, 0);
  assert.ok(r.showHotlines && r.trafficking);
  assert.equal(verifyLocal('free visa job').level, 'red');
});

test('phones: Lao format, hotline match, foreign number in a job message', () => {
  assert.equal(verifyLocal('call 1362').level, 'green');
  assert.equal(verifyLocal('+856 20 97631319').level, 'green');
  assert.equal(verifyLocal('020 5512 3456').level, 'unknown');
  const foreign = verifyLocal('Job in Bangkok, WhatsApp +66 81 234 5678 now');
  assert.equal(foreign.level === 'yellow' || foreign.level === 'red', true);
  assert.ok(foreign.signals.some(s => s.check === 'phone' && s.result === 'warn'));
  assert.deepEqual(extractPhones('call 020 5512 3456 in 2026').map(p => p.digits), ['02055123456']);
});

test('extraction skips things that are not links', () => {
  assert.deepEqual(extractUrls('see e.g. file.txt, version 1.5 and 3.14'), []);
  assert.deepEqual(extractUrls('Open bcel-verify.net/login now.'), ['bcel-verify.net/login']);
});

test('nothing in any result says 100% or definitely', () => {
  const inputs = ['google.com', 'g00gle-login.xyz', 'https://bit.ly/x', 'hello', 'call 1362', 'free visa job', 'https://laopdr.iom.int', 'https://www.unicef.org/laos', 'ຟຣີວີຊາ ວຽກຕ່າງປະເທດ'];
  for (const input of inputs) assert.doesNotMatch(text(verifyLocal(input)), /100\s*%|definitely|guaranteed|100 percent/i, input);
  assert.equal(sanitizeClaims('This is 100% safe and definitely real. Also 100% sure.'), 'This is looks safe and likely real. Also looks sure.');
  assert.doesNotMatch(sanitizeClaims('It is 100% ປອດໄພ and fully 100%'), /100\s*%/);
});

test('Google Safe Browsing: a hit makes it red; a missing key is skipped quietly', async () => {
  const hit = await safeBrowsing(['https://x.example'], { key: 'k', fetcher: json({ matches: [{ threatType: 'SOCIAL_ENGINEERING' }] }) });
  assert.equal(hit[0].result, 'fail');
  const clean = await safeBrowsing(['https://x.example'], { key: 'k', fetcher: json({}) });
  assert.equal(clean[0].result, 'pass'); assert.match(clean[0].detail_en, /does not prove/);
  const none = await safeBrowsing(['https://x.example'], { key: '' });
  assert.equal(none[0].result, 'skip');
  const broken = await safeBrowsing(['https://x.example'], { key: 'k', fetcher: async () => { throw new Error('offline'); } });
  assert.equal(broken[0].result, 'skip');
  const deep = await verifyDeep('https://x-unknown.example', { key: 'k', fetcher: async url => String(url).includes('safebrowsing') ? { ok: true, json: async () => ({ matches: [{}] }) } : { ok: false } });
  assert.equal(deep.level, 'red'); assert.equal(deep.confidence, 'high');
});

test('domain age: under 90 days is flagged, older passes, failure is skipped', async () => {
  const young = await domainAge('new-site.example', { now: NOW, fetcher: json({ events: [{ eventAction: 'registration', eventDate: '2026-10-20T00:00:00Z' }] }) });
  assert.equal(young[0].result, 'warn'); assert.match(young[0].detail_en, /26 days/);
  const old = await domainAge('old-site.example', { now: NOW, fetcher: json({ events: [{ eventAction: 'registration', eventDate: '2015-01-01T00:00:00Z' }] }) });
  assert.equal(old[0].result, 'pass');
  assert.equal((await domainAge('x.example', { now: NOW, fetcher: json({}, false) }))[0].result, 'skip');
  const deep = await verifyDeep('https://new-site.example', { key: '', now: NOW, fetcher: json({ events: [{ eventAction: 'registration', eventDate: '2026-11-01T00:00:00Z' }] }) });
  assert.equal(deep.level, 'yellow'); assert.ok(deep.signals.some(s => s.check === 'domain-age' && s.result === 'warn'));
});

function db() { const d = new DatabaseSync(':memory:'); d.exec('CREATE TABLE assistant_usage(user_id TEXT,day TEXT,kind TEXT,count INTEGER,PRIMARY KEY(user_id,day,kind))'); return d; }

test('the answer streams: verdict card first, then tokens, then the cleaned final text', async () => {
  const events = [];
  await assistantStream(db(), 'u1', { text: 'Is g00gle-login.xyz real?', lang: 'en' }, e => events.push(e), {
    verify: async t => verifyLocal(t),
    stream: async (_p, input, onToken) => { assert.equal(input.checks.level, 'red'); for (const piece of ['This looks ', 'like a fake, ', '100% sure. Call 1362 or +856 20 111 2222.']) onToken(piece); return 'This looks like a fake, 100% sure. Call 1362 or +856 20 111 2222.'; },
  });
  assert.equal(events[0].type, 'checks'); assert.equal(events[0].checks.level, 'red');
  assert.deepEqual(events.slice(1, -1).map(e => e.type), ['token', 'token', 'token']);
  const done = events.at(-1);
  assert.equal(done.type, 'done'); assert.doesNotMatch(done.text, /100\s*%/); assert.match(done.text, /1362/); assert.doesNotMatch(done.text, /111 2222/);
});

test('a plain question gets text only, and an AI failure still returns the card with a fallback', async () => {
  const plain = []; await assistantStream(db(), 'u1', { text: 'How do I stay safe on TikTok?' }, e => plain.push(e), { stream: async (_p, _i, on) => { on('Use a strong password.'); return 'Use a strong password.'; } });
  assert.ok(!plain.some(e => e.type === 'checks'));
  const failed = []; await assistantStream(db(), 'u1', { text: 'check bit.ly/abc', lang: 'en' }, e => failed.push(e), { stream: async () => { throw new Error('down'); }, verify: async t => verifyLocal(t) });
  assert.equal(failed[0].type, 'checks'); assert.equal(failed.at(-1).fallback, true); assert.match(failed.at(-1).text, /shortener/);
});

test('the daily allowance is counted once and given back if the stream fails before an answer', async () => {
  const d = db();
  await assert.rejects(() => assistantStream(d, 'u2', { text: 'x', mode: 'check' }, () => {}, { verify: async () => { throw Object.assign(new Error('boom'), { status: 500 }); } }));
  assert.equal(d.prepare('SELECT count FROM assistant_usage').get().count, 0);
});

test('modelStream reads server-sent events token by token (OpenRouter and OpenAI formats)', async () => {
  const sse = lines => ({ ok: true, body: (async function* () { for (const l of lines) yield new TextEncoder().encode(l); })() });
  const router = await (async () => { const got = []; const full = await modelStream('sys', { language: 'en', text: 'hi' }, p => got.push(p), { config: { provider: 'openrouter', key: 'k', model: 'm' }, fetcher: async () => sse(['data: {"choices":[{"delta":{"content":"Hel"}}]}\n\n', 'data: {"choices":[{"delta":{"content":"lo"}}]}\n\ndata: [DONE]\n\n']) }); return { got, full }; })();
  assert.deepEqual(router.got, ['Hel', 'lo']); assert.equal(router.full, 'Hello');
  const got = []; const full = await modelStream('sys', { language: 'en', text: 'hi' }, p => got.push(p), { config: { provider: 'openai', key: 'k', model: 'm' }, fetcher: async () => sse(['data: {"type":"response.output_text.delta","delta":"Hi"}\n\n', 'data: {"type":"response.completed"}\n\n']) });
  assert.deepEqual(got, ['Hi']); assert.equal(full, 'Hi');
});

test('numbers the model invents are removed; hotline numbers stay', () => {
  assert.equal(scrubNumbers('Call 1362 or +856 20 97631319 now.').includes('97631319'), true);
  assert.equal(scrubNumbers('Call +856 20 555 1234 now.').includes('555'), false);
});
