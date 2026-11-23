import test from 'node:test';
import assert from 'node:assert/strict';
import { moderate, moderateWithAI, isTrustedSource, trustedSources } from '../shared/moderation.mjs';
import { CURATED_POSTS, isExpired, sortFeed } from '../shared/curated-posts.mjs';

const post = (text, extra = {}) => ({ title_en: text.slice(0, 40), summary_en: text, ...extra });

test('a job post always goes to human review', () => {
  const r = moderate(post('Now hiring: waiters for our restaurant in Vientiane. Salary 5,000,000 kip a month. Call 020 5555 5555.', { type: 'job' }));
  assert.equal(r.decision, 'review');
  assert.ok(r.flags.includes('category_job'));
});

test('job red flags are listed: free visa, WhatsApp-only, minors, upfront fee, passport holding, huge pay', () => {
  const r = moderate(post('Hiring abroad! Free visa and free flights, ages 16-25, earn $5000 a month. Pay a deposit first and we keep your passport. Contact on WhatsApp only.', { type: 'job' }));
  assert.equal(r.decision, 'review');
  for (const f of ['free_visa_flight_fees', 'targets_minors', 'unrealistic_pay', 'upfront_fee', 'passport_holding', 'whatsapp_telegram_only', 'no_company_address']) assert.ok(r.flags.includes(f), f);
});

test('political satire about a public figure is rejected', () => {
  const r = moderate(post('Haha our minister is such a clown, what a joke of a government scam 🤡'));
  assert.equal(r.decision, 'reject');
  assert.ok(r.flags.includes('political_satire'));
});

test('a neutral official scam advisory is not treated as political', () => {
  assert.equal(moderate(post('The Ministry of Public Security warns the public about online fraud and phishing links.', { type: 'news', source_name: 'KPL' })).decision, 'approve');
});

test('a travel ad is rejected', () => {
  const r = moderate(post('Book your dream holiday in Luang Prabang! Hotel and tour package, 30% off this month.'));
  assert.equal(r.decision, 'reject');
  assert.ok(r.flags.includes('travel_promo'));
});

test('a shopping ad, gambling and a crypto get-rich post are rejected', () => {
  assert.ok(moderate(post('Flash sale! Buy now, free shipping on all phones.')).flags.includes('shopping_ad'));
  assert.ok(moderate(post('Join our online casino, big jackpot every day. Scam free!')).flags.includes('gambling'));
  assert.ok(moderate(post('Bitcoin guaranteed profit, double your money, get rich quick. Beware of scams? no, join us.')).flags.includes('crypto_get_rich'));
});

test('a scam-awareness post is approved', () => {
  const r = moderate(post('Beware of fake job offers abroad that ask for a deposit or your passport. Real employers never charge you. Report scams to 1533.', { type: 'awareness' }));
  assert.equal(r.decision, 'approve');
  const untyped = moderate(post('Warning: scammers pretend to be a bank and ask for your OTP. Never share your OTP or password.'));
  assert.equal(untyped.decision, 'approve');
});

test('a bad word is rejected, in English and in Lao', () => {
  assert.equal(moderate(post('This scam warning is fucking useless')).decision, 'reject');
  assert.equal(moderate(post('ລະວັງການສໍ້ໂກງ ໄອ້ສັດ')).decision, 'reject');
  assert.ok(moderate(post('This fraud warning is stupid')).flags.includes('profanity'));
});

test('off-topic posts are rejected', () => {
  assert.ok(moderate(post('My cat learned a new trick today and it was so cute.')).flags.includes('off_topic'));
});

test('anything involving children needs review, official hotlines excepted', () => {
  assert.equal(moderate(post('Child exploitation is a form of trafficking. Learn the signs.', { type: 'awareness' })).decision, 'review');
  assert.equal(moderate(post('Photo of the event', { type: 'awareness', shows_minors: true, tags: ['trafficking'] })).decision, 'review');
  const hotline = { type: 'hotline', source_name: "Lao Women's Union", summary_en: 'Hotline 1362 takes reports of violence against women and children and trafficking.' };
  assert.equal(moderate(hotline).decision, 'approve');
  assert.equal(moderate({ ...hotline, source_name: 'Some random page' }).decision, 'review');
});

test('only trusted sources earn the verified badge', () => {
  assert.ok(trustedSources.length >= 9);
  assert.ok(isTrustedSource({ source_name: 'Laotian Times' }));
  assert.ok(isTrustedSource({ source_name: 'x', source_url: 'https://www.laotiantimes.com/a' }));
  assert.ok(isTrustedSource({ source_name: "Lao Women's Union" }));
  assert.ok(!isTrustedSource({ source_name: 'Laotian Times', source_url: 'https://laotiantimes.com.evil.example/a' }));
  assert.ok(!isTrustedSource({ source_name: 'Sunshine Study Centre' }));
  assert.ok(!isTrustedSource({ source_name: 'Skilled Labor Daily' })); // "ilo" must not match inside other words
});

test('the AI layer can tighten a result but never loosen it', async () => {
  const ok = post('Warning: scammers ask for your OTP.', { type: 'awareness' });
  assert.equal((await moderateWithAI(ok, async () => ({ verdict: 'approved', on_topic: true, labels: [] }))).decision, 'approve');
  assert.equal((await moderateWithAI(ok, async () => ({ verdict: 'caution', on_topic: true, labels: [], summary: 'Check.' }))).decision, 'review');
  assert.equal((await moderateWithAI(ok, async () => ({ verdict: 'approved', on_topic: false, labels: ['off_topic'] }))).decision, 'reject');
  const job = post('Now hiring cooks.', { type: 'job' });
  assert.equal((await moderateWithAI(job, async () => ({ verdict: 'approved', on_topic: true, labels: [] }))).decision, 'review');
  const down = await moderateWithAI(ok, async () => { throw new Error('offline'); });
  assert.equal(down.decision, 'approve'); assert.ok(down.flags.includes('ai_unavailable'));
});

test('seed posts: statuses agree with the rules', () => {
  const ids = new Set();
  for (const p of CURATED_POSTS) {
    assert.ok(!ids.has(p.id), 'duplicate id ' + p.id); ids.add(p.id);
    for (const k of ['title_lo', 'title_en', 'summary_lo', 'summary_en', 'source_name']) assert.ok(p[k]?.trim(), `${p.id}.${k}`);
    const r = moderate(p);
    assert.notEqual(r.decision, 'reject', `${p.id} is rejected by the rules`);
    assert.equal(p.verified, isTrustedSource(p), `${p.id} verified badge`);
    if (p.owner_override) { assert.equal(p.status, 'approved'); assert.ok(p.owner_override.trim()); assert.equal(r.decision, 'review', 'override only needed while rules want review'); if (p.type === 'video') assert.ok(p.content_warning, 'the video keeps its content warning'); if (r.flags.some(f => ['free_visa_flight_fees','whatsapp_telegram_only'].includes(f))) assert.ok(p.warning_en, 'red-flag posts keep a visible warning'); }
    else if (p.status === 'approved') { assert.equal(r.decision, 'approve', `${p.id} approved but rules want review`); assert.equal(p.needs_human_review, false); }
    else assert.equal(p.needs_human_review, true, `${p.id} pending needs_human_review`);
    if (['job', 'study'].includes(p.type) && !p.owner_override) assert.equal(p.status, 'pending', `${p.id} job/study must be pending`);
  }
  assert.equal(CURATED_POSTS.length, 24);
  for (const p of CURATED_POSTS.filter(x => x.video)) assert.ok(p.credit?.name && p.credit?.url, `${p.id} video needs a credit with a link`);
});

test('feed helpers: expired events drop out, hotlines are pinned first', () => {
  const wii = CURATED_POSTS.find(p => p.id === 'wii-fair');
  assert.ok(isExpired(wii));
  assert.ok(!isExpired(CURATED_POSTS.find(p => p.id === 'kazora-hiring')));
  assert.ok(isExpired({ expires: '2020-01-01' }) && !isExpired({ expires: '2999-01-01' }));
  const sorted = sortFeed(CURATED_POSTS.filter(p => p.status === 'approved'));
  assert.deepEqual(sorted.slice(0, 2).map(p => p.type), ['hotline', 'hotline']);
});

import { openStore } from './store.mjs';
import { publicCurated, staffCurated, reviewCurated } from './curated.mjs';
test('curated posts: public feed shows only approved, admin approval persists, rule-rejected posts cannot be approved', () => {
  const db = openStore(':memory:', false);
  try {
    const admin = { id: 'a', name: 'Admin' };
    const before = publicCurated(db);
    assert.ok(before.every(p => p.status === 'approved'));
    assert.equal(before.length, 24);
    assert.ok(before.find(p => p.id === 'wii-fair').expired);
    assert.equal(before.at(-1).id, 'wii-fair', 'ended events sort last');
    assert.deepEqual(before.slice(0, 2).map(p => p.type), ['hotline', 'hotline']);
    assert.ok(before.every(p => !('review_note' in p)));
    reviewCurated(db, 'kazora-hiring', 'approved', 'Checked address and phone.', admin);
    assert.ok(publicCurated(db).some(p => p.id === 'kazora-hiring'));
    reviewCurated(db, 'kazora-hiring', 'rejected', 'Could not verify.', admin);
    assert.ok(!publicCurated(db).some(p => p.id === 'kazora-hiring'));
    assert.equal(staffCurated(db).find(p => p.id === 'kazora-hiring').review.reviewerName, 'Admin');
    reviewCurated(db, 'wii-fair', 'rejected', 'ended', admin);
    assert.ok(!publicCurated(db).some(p => p.id === 'wii-fair'), 'admin can still reject');
    assert.equal(reviewCurated(db, 'nope', 'approved', '', admin), null);
    assert.throws(() => reviewCurated(db, 'kazora-hiring', 'bogus', '', admin));
  } finally { db.close(); }
});
