import test from 'node:test';
import assert from 'node:assert/strict';
import {checkPost, applyLocal} from './safety/post-check.mjs';

const approved = {verdict:'approved',risk:'low',labels:['safe_tip'],on_topic:true,reasons:[],suggested_edit:'',summary:'A genuine educational offer.',language:'en',checkedAt:1};
const flyer = '📢 Free Chinese Language Course! Join our free language classes today. Limited seats available! Phone / WhatsApp: 020 5555 5555. Scan the QR code on the poster! #FreeChineseClass';

test('a policy promotion is held even when the AI approves it', async () => {
  const travel = 'Book your dream holiday in Luang Prabang! Hotel and tour package, 30% off this month.';
  const post = await checkPost({content: travel, contentLanguage: 'en'}, {check: async () => approved, local: async () => null});
  assert.equal(post.check.verdict, 'caution');
  assert.equal(post.frozen, true);
  assert.equal(post.state, 'flagged');
});

test('an off-topic flyer the AI calls off_topic is held, and the AI verdict is kept', async () => {
  const offTopic = {...approved, verdict: 'caution', risk: 'low', labels: ['off_topic'], on_topic: false, suggested_edit: 'Share a safety tip instead.', summary: 'A course advert, not a safety post.'};
  const post = await checkPost({content: flyer, contentLanguage: 'en'}, {check: async () => offTopic, local: async () => null});
  assert.equal(post.check.verdict, 'caution');
  assert.ok(post.check.labels.includes('off_topic'));
  assert.equal(post.frozen, true);
});

test('a genuine safety post the AI approves stays approved', async () => {
  const safety = 'The Ministry of Public Security warns the public about online fraud and phishing links. Never share your OTP.';
  const post = await checkPost({content: safety, contentLanguage: 'en'}, {check: async () => approved, local: async () => null});
  assert.equal(post.check.verdict, 'approved');
  assert.equal(post.frozen, false);
  assert.equal(post.state, 'clean');
});

test('the AI can never loosen a flagged result', async () => {
  const flagged = {...approved, verdict: 'needs_expert', risk: 'high', labels: ['scam_risk'], summary: 'Fake prize.', reasons: [{text: 'Prize asks for money', evidence: 'send money'}]};
  const post = await checkPost({content: safetyText(), contentLanguage: 'en'}, {check: async () => flagged, local: async () => null});
  assert.equal(post.check.verdict, 'needs_expert');
  assert.equal(post.check.risk, 'high');
});

test('a local screen flag raises an approved result to expert review', () => {
  const result = applyLocal(approved, {severity: 'high', flags: ['a scam promotion asking for money or credentials']});
  assert.equal(result.verdict, 'needs_expert');
  assert.ok(result.labels.includes('scam_risk'));
});

test('local screen with no flags leaves the result unchanged', () => {
  assert.deepEqual(applyLocal(approved, {severity: 'none', flags: []}), approved);
  assert.deepEqual(applyLocal(approved, null), approved);
});

function safetyText() {
  return 'Someone offers a prize and asks you to send money to claim it.';
}
