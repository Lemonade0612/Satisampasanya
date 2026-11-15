import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { REAL_OR_SCAM_SECONDS, ANSWER_PAUSE_MS, LINK_HUNT_ROUNDS, pickLinkRounds, realDomain } from '../shared/game-config.mjs';
import { ALWAYS_SHOWN, ALL_NUMBERS, FEATURED_ROTATION, FEED_GAP, hotlineSlots, featuredAt } from '../shared/emergency-hotlines.mjs';

const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const links = read('../frontend/src/features/daily/data/link-hunt.json').links;
const quick = read('../frontend/src/features/daily/data/minigames.json').quickfire;
// Small deterministic random generator, so a failure can be reproduced.
const seeded = seed => () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;

test('Real or Scam timer comes from config and is 20-30% longer than the old 6 s / 8 s', () => {
  assert.ok(REAL_OR_SCAM_SECONDS.youth > 6 && REAL_OR_SCAM_SECONDS.youth <= 6 * 1.3);
  assert.ok(REAL_OR_SCAM_SECONDS.adult > 8 && REAL_OR_SCAM_SECONDS.adult <= 8 * 1.3);
  assert.ok(ANSWER_PAUSE_MS >= 1000 && ANSWER_PAUSE_MS <= 2000);
  const age = readFileSync(new URL('../frontend/src/features/daily/lib/age.ts', import.meta.url), 'utf8');
  assert.match(age, /quickSec: REAL_OR_SCAM_SECONDS\.youth/);
  assert.match(age, /quickSec: REAL_OR_SCAM_SECONDS\.adult/);
});

test('Link Hunt data is about half real, and every link teaches in both languages', () => {
  const real = links.filter(l => l.isReal).length;
  assert.ok(Math.abs(real / links.length - 0.5) <= 0.1, `${real} real of ${links.length}`);
  for (const l of links) {
    assert.ok(l.url && l.explanation_lo?.trim() && l.explanation_en?.trim(), `missing text for ${l.url}`);
    assert.ok(/[຀-໿]/.test(l.explanation_lo), `Lao text expected for ${l.url}`);
    assert.equal(typeof l.isReal, 'boolean');
    if (!l.isReal) assert.ok(l.url.includes(l.redFlagPart) && l.redFlagPart, `red flag must appear in ${l.url}`);
  }
  for (const url of ['https://www.google.com', 'https://www.facebook.com', 'https://www.youtube.com', 'https://www.bcel.com.la', 'https://laopdr.iom.int', 'https://www.unicef.org/laos', 'https://www.tiktok.com'])
    assert.ok(links.some(l => l.isReal && l.url === url), `${url} should be a real link`);
});

test('every game picks a 50/50 mix in a fresh order', () => {
  const orders = new Set();
  for (let seed = 1; seed <= 40; seed++) {
    const round = pickLinkRounds(links, LINK_HUNT_ROUNDS, seeded(seed));
    assert.equal(round.length, LINK_HUNT_ROUNDS);
    assert.equal(round.filter(l => l.isReal).length, LINK_HUNT_ROUNDS / 2);
    orders.add(round.map(l => l.url).join());
  }
  assert.ok(orders.size > 30, 'order should be shuffled each game');
  assert.equal(pickLinkRounds(links, 6, seeded(7)).filter(l => l.isReal).length, 3);
});

test('the real domain is the part before the first single slash, not the subdomain trick', () => {
  assert.equal(realDomain('https://www.facebook.com.secure-login.ru/'), 'www.facebook.com.secure-login.ru');
  assert.ok(realDomain('https://www.facebook.com.secure-login.ru/').endsWith('secure-login.ru'));
  assert.equal(realDomain('https://www.unicef.org/laos'), 'www.unicef.org');
});

test('the feed inserts a hotline card after every 10 to 20 posts', () => {
  for (let seed = 1; seed <= 50; seed++) {
    const slots = hotlineSlots(300, seeded(seed));
    assert.ok(slots.length >= 14 && slots.length <= 30);
    let prev = -1;
    for (const at of slots) { const gap = at - prev; assert.ok(gap >= FEED_GAP.min && gap <= FEED_GAP.max, `gap ${gap}`); prev = at; }
  }
  assert.deepEqual(hotlineSlots(9, seeded(1)), []);
});

test('hotline card: 1362 always shown, every number tap-to-call, featured line rotates', () => {
  assert.equal(ALWAYS_SHOWN.number, '1362');
  const numbers = ALL_NUMBERS.map(l => l.number).join(' ');
  for (const n of ['1362', '+856 20 97631319', '1191', '1195', '1190', '021 312519']) assert.ok(numbers.includes(n), n);
  for (const l of ALL_NUMBERS) assert.match(l.tel, /^\+?\d+$/);
  const seen = new Set(FEATURED_ROTATION.map((_, n) => featuredAt(n).id));
  assert.equal(seen.size, FEATURED_ROTATION.length);
  assert.notEqual(featuredAt(0).id, featuredAt(1).id);
});

test('every scam card in Real or Scam names its red flag, inside the message', () => {
  for (const c of quick.filter(c => c.isScam)) {
    assert.ok(c.redFlag, `${c.id} needs redFlag`);
    for (const lang of ['en', 'lo']) assert.ok(c.text[lang].includes(c.redFlag[lang]), `${c.id} ${lang}`);
  }
});
