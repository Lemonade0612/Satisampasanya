import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeLaoWhatsApp, validateFamily, formatPhone, tellText, waLink, smsLink, planTell, makeInformRecord, appendInform } from '../shared/family-tell.mjs';

test('setup validation: Lao 020 numbers in the ways people type them, nothing else', () => {
  for (const ok of ['020 5555 1234', '02055551234', '0205555 1234', '020-5555-1234', '+856 20 5555 1234', '8562055551234', '20 5555 1234', '໐໒໐ ໕໕໕໕ ໑໒໓໔'])
    assert.equal(normalizeLaoWhatsApp(ok), '02055551234', ok);
  for (const bad of ['', '   ', '020 5555 123', '020 5555 12345', '030 5555 1234', '021 5555 1234', '12345678901', 'abc', '+66 81 234 5678', null, undefined])
    assert.equal(normalizeLaoWhatsApp(bad), null, String(bad));
  assert.equal(formatPhone('02055551234'), '020 5555 1234');
  const good = validateFamily({ name: '  Noy  ', phone: '020 5555 1234' });
  assert.deepEqual(good, { ok: true, name: 'Noy', phone: '02055551234', errors: {} });
  assert.equal(validateFamily({ name: 'Noy', phone: '020 55' }).ok, false);
  assert.equal(validateFamily({ name: 'Noy', phone: '020 55' }).errors.phone, 'format');
  assert.equal(validateFamily({ name: '', phone: '020 5555 1234' }).ok, true, 'the name is optional');
  assert.equal(validateFamily({ name: 'x'.repeat(40), phone: '020 5555 1234' }).name.length, 30, 'long names are cut');
});

test('the message to the family: Lao wording, message cut to 150 characters', () => {
  const t = tellText({ message: 'Send your OTP code now', verdictWord: 'ຫຼອກລວງ' });
  assert.equal(t, 'ແມ່/ພໍ່ ໄດ້ຮັບຂໍ້ຄວາມນີ້: "Send your OTP code now" · ສະຕິ: ຫຼອກລວງ. ໂທຫາແມ່/ພໍ່ແດ່.');
  const long = tellText({ message: 'a'.repeat(400), verdictWord: 'ລະວັງ' });
  assert.match(long, /"a{149}…"/); assert.ok(!/a{150}/.test(long));
  assert.match(tellText({ message: ' line one\n\n  line   two ', verdictWord: 'x' }), /"line one line two"/, 'whitespace is collapsed');
});

test('share URL format: wa.me with 856, no leading 0, encoded text; sms as the last resort', () => {
  const text = 'ແມ່/ພໍ່ ໄດ້ຮັບ "x" & y';
  const wa = waLink('02055551234', text);
  assert.ok(wa.startsWith('https://wa.me/8562055551234?text='));
  assert.equal(decodeURIComponent(wa.split('?text=')[1]), text);
  assert.ok(!/[ "&]/.test(wa.split('?text=')[1]), 'fully encoded');
  assert.ok(smsLink('02055551234', text).startsWith('sms:02055551234?body='));
});

test('no number saved: the button sends the person to setup, nothing is shared', () => {
  assert.deepEqual(planTell({ phone: '', canShare: true, demo: false }), { action: 'setup' });
  assert.deepEqual(planTell({ phone: null, canShare: false, demo: true }), { action: 'setup' }, 'even in demo mode');
});

test('demo mode: a preview first, the real send only from the preview', () => {
  assert.deepEqual(planTell({ phone: '02055551234', canShare: true, demo: true }), { action: 'preview' });
  assert.deepEqual(planTell({ phone: '02055551234', canShare: true, demo: false }), { action: 'share', fallbacks: ['whatsapp', 'sms'] });
  assert.deepEqual(planTell({ phone: '02055551234', canShare: false, demo: false }), { action: 'whatsapp', fallbacks: ['sms'] });
});

test('Inform keeps only category, verdict and time: no name, no phone, no message', () => {
  const r = makeInformRecord({ category: 'otp', verdict: 'scam', now: 1700000000000, name: 'Noy', phone: '02055551234', message: 'secret' });
  assert.deepEqual(r, { category: 'otp', verdict: 'scam', createdAt: 1700000000000 });
  const mem = new Map(); const store = { getItem: k => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v) };
  appendInform(store, r); appendInform(store, { ...r, category: 'link' });
  const saved = JSON.parse(mem.get('sati-inform-log'));
  assert.equal(saved.length, 2); assert.ok(!/Noy|0205555|secret/.test(mem.get('sati-inform-log')));
  for (let i = 0; i < 150; i++) appendInform(store, r);
  assert.equal(JSON.parse(mem.get('sati-inform-log')).length, 100, 'capped');
  assert.deepEqual(makeInformRecord({ category: 'bad<script>', verdict: 'nonsense', now: 1 }), { category: 'other', verdict: 'caution', createdAt: 1 }, 'unknown values are replaced');
});
