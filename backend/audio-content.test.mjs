// Read-aloud file names, Lao number reading and the content/ checker.
// If audioKey changes, every recording silently stops matching its line, so its output is pinned here.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, cpSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { audioKey, audioPath, normalizeSpoken } from '../shared/audio-key.mjs';
import { laoNumber, spoken } from '../scripts/lib/lao-speech.mjs';
import { SHOW_EXPERT_PANEL } from '../shared/flags.mjs';

test('audio key is stable, voice-specific and ignores whitespace differences', () => {
  assert.equal(audioKey('ສະບາຍດີ'), audioKey('  ສະບາຍດີ '));
  assert.equal(audioKey('ສະບາຍດີ  ທ່ານ'), audioKey('ສະບາຍດີ ທ່ານ'));
  assert.notEqual(audioKey('ສະບາຍດີ', 'woman'), audioKey('ສະບາຍດີ', 'man'));
  assert.notEqual(audioKey('ສະບາຍດີ'), audioKey('ສະບາຍດີ!'));
  assert.match(audioKey('ສະບາຍດີ'), /^[0-9a-f]{14}$/);
  // Pinned: changing the hash renames every recording. If this must change, re-run npm run audio -- --force.
  assert.equal(audioKey('ສະບາຍດີ'), '026f6c02d87cb3');
  assert.equal(normalizeSpoken('a\n b'), 'a b');
});

test('audio paths: generated vs human recording', () => {
  assert.equal(audioPath('abc', 1), '/audio/lo/abc.mp3');
  assert.equal(audioPath('abc', 2), '/audio/lo/human/abc.mp3');
});

test('Lao numbers and abbreviations are spoken as words', () => {
  assert.equal(laoNumber(1_500_000), 'ໜຶ່ງລ້ານຫ້າແສນ');
  assert.equal(laoNumber(21), 'ຊາວເອັດ');
  assert.equal(laoNumber(15), 'ສິບຫ້າ');
  assert.equal(spoken('ໂອນ 500,000 ກີບ', 'lo'), 'ໂອນ ຫ້າແສນ ກີບ');
  assert.equal(spoken('OTP', 'lo'), 'ໂອທີພີ');
  assert.equal(spoken('9:30', 'lo'), 'ເກົ້າໂມງ ສາມສິບນາທີ');
});

test('expert panel stays hidden until verifiers are named', () => {
  assert.equal(SHOW_EXPERT_PANEL, false);
});

test('content check passes the shipped content and rejects bad files', () => {
  const root = resolve(import.meta.dirname, '..');
  const checker = join(root, 'scripts/check-content.mjs');
  // The real content/ folder must pass.
  execFileSync(process.execPath, [checker], { cwd: root, stdio: 'pipe' });

  // A copy with one broken call and Thai script must fail and name both problems.
  const dir = mkdtempSync(join(tmpdir(), 'sati-content-'));
  try {
    mkdirSync(join(dir, 'scripts'), { recursive: true });
    cpSync(join(root, 'shared'), join(dir, 'shared'), { recursive: true });
    cpSync(checker, join(dir, 'scripts/check-content.mjs'));
    mkdirSync(join(dir, 'content/call'), { recursive: true });
    const L = (en, lo) => ({ en, lo });
    const call = (id, real, time) => ({
      id, real, time, voice: { who: 'man', rate: 0, pitch: 0 }, place: L('a', 'ກ'), note: L('a', 'ກ'), caller: L('a', 'ກ'), remember: L('a', 'ກ'),
      number: '+856 20 55•• 1902', saved: false, stake: 0, lines: [L('a', 'ກ'), L('b', 'ຂ')],
      moves: { trust: L('a', 'ກ'), check: L('a', 'ກ'), hangup: L('a', 'ກ') }, outcome: { trust: L('a', 'ກ'), check: L('a', 'ກ'), hangup: L('a', 'ກ') },
      signs: ['known'], flags: real ? [] : ['urgency'],
    });
    const day = { id: 'd', bands: ['kids'], room: 'kid', hero: { name: L('A', 'ກ'), age: 9, avatar: {} }, who: L('a', 'ກ'), intro: L('{n} calls', '{n} ສາຍ'), balance: 0,
      calls: [call('c1', true, '09:00'), call('c2', false, '10:00'), call('c3', true, '11:00'), { ...call('c4', false, '12:00'), flags: [] }] };
    day.calls[0].lines[0] = L('hi', 'สวัสดี');
    writeFileSync(join(dir, 'content/call/kids.json'), JSON.stringify({ days: [day] }));
    assert.throws(() => execFileSync(process.execPath, ['scripts/check-content.mjs'], { cwd: dir, stdio: 'pipe' }), e => {
      const out = String(e.stderr);
      return /Thai script/.test(out) && /c4.*needs at least one red flag/.test(out);
    });
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
