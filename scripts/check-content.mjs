// Checks every file in content/ before it can ship: required fields, known ids, no Thai script, sane call days.
//   node scripts/check-content.mjs        (runs before every web build: see "prebuild" in package.json)
// Exit 1 lists every problem with its file and path, so a content editor can fix the JSON without reading code.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { BANDS } from '../shared/bands.mjs';

const ROOT = 'content';
const THAI = /[\u0E00-\u0E7F]/;
const FLAGS = ['urgency', 'upfront_fee', 'too_good', 'unverified_identity', 'personal_data', 'off_platform', 'suspicious_link'];
const SIGNS = ['mask', 'clock', 'hush', 'scare', 'code', 'pay', 'gift', 'private', 'switch', 'debt', 'docs', 'match', 'nothing', 'known'];
const ROOMS = ['kid', 'student', 'parent', 'elder', 'worker'];
const problems = [];
const bad = (file, path, msg) => problems.push(`${file} ${path}: ${msg}`);

const isL10n = v => v && typeof v === 'object' && typeof v.en === 'string' && typeof v.lo === 'string' && v.en.trim() && v.lo.trim();
function needL10n(file, path, v) { if (!isL10n(v)) bad(file, path, 'needs { "en": "...", "lo": "..." } with both filled in'); }

// No Thai script anywhere in content (Lao must be Lao script).
function scanThai(file, node, path = '') {
  if (typeof node === 'string') { if (THAI.test(node)) bad(file, path, `Thai script: "${node.match(/.{0,12}[\u0E00-\u0E7F]+.{0,12}/)[0]}"`); return; }
  if (Array.isArray(node)) return node.forEach((v, i) => scanThai(file, v, `${path}[${i}]`));
  if (node && typeof node === 'object') for (const [k, v] of Object.entries(node)) scanThai(file, v, path ? `${path}.${k}` : k);
}

function checkCalls(file, data, band) {
  if (!Array.isArray(data.days)) return bad(file, 'days', 'must be a list');
  const ids = new Set();
  data.days.forEach((d, di) => {
    const at = `days[${di}]`;
    if (!d.id) bad(file, at, 'missing id');
    if (!Array.isArray(d.bands) || !d.bands.length || d.bands.some(b => !BANDS.includes(b))) bad(file, `${at}.bands`, `use any of ${BANDS.join(', ')}`);
    else if (!d.bands.includes(band)) bad(file, `${at}.bands`, `a day in ${band}.json must include "${band}"`);
    if (!ROOMS.includes(d.room)) bad(file, `${at}.room`, `use one of ${ROOMS.join(', ')}`);
    if (!d.hero || !isL10n(d.hero.name) || !Number.isFinite(d.hero.age) || !d.hero.avatar) bad(file, `${at}.hero`, 'needs name, age and avatar');
    needL10n(file, `${at}.who`, d.who);
    needL10n(file, `${at}.intro`, d.intro);
    if (isL10n(d.intro) && !(d.intro.en.includes('{n}') && d.intro.lo.includes('{n}'))) bad(file, `${at}.intro`, 'both languages need {n} (the number of calls)');
    if (!Number.isFinite(d.balance)) bad(file, `${at}.balance`, 'must be a number');
    if (!Array.isArray(d.calls) || d.calls.length < 4) return bad(file, `${at}.calls`, 'needs at least 4 calls');
    d.calls.forEach((c, ci) => {
      const cat = `${at}.calls[${ci}] (${c.id ?? '?'})`;
      if (!c.id) bad(file, cat, 'missing id');
      else if (ids.has(c.id)) bad(file, cat, 'duplicate id'); else ids.add(c.id);
      if (typeof c.real !== 'boolean') bad(file, `${cat}.real`, 'true or false');
      if (!c.voice || !['man', 'woman'].includes(c.voice.who)) bad(file, `${cat}.voice.who`, '"man" or "woman"');
      if (!/^\d\d:\d\d$/.test(c.time ?? '')) bad(file, `${cat}.time`, 'HH:MM');
      for (const k of ['place', 'note', 'caller', 'remember']) needL10n(file, `${cat}.${k}`, c[k]);
      if (!Array.isArray(c.lines) || c.lines.length < 2 || c.lines.length > 4) bad(file, `${cat}.lines`, '2 to 4 lines');
      else c.lines.forEach((x, i) => needL10n(file, `${cat}.lines[${i}]`, x));
      for (const m of ['trust', 'check', 'hangup']) { needL10n(file, `${cat}.moves.${m}`, c.moves?.[m]); needL10n(file, `${cat}.outcome.${m}`, c.outcome?.[m]); }
      (c.signs ?? []).forEach(s => SIGNS.includes(s) || bad(file, `${cat}.signs`, `unknown sign "${s}" (use ${SIGNS.join(', ')})`));
      (c.flags ?? []).forEach(f => FLAGS.includes(f) || bad(file, `${cat}.flags`, `unknown flag "${f}"`));
      if (!c.real && !(c.flags ?? []).length) bad(file, `${cat}.flags`, 'a scam call needs at least one red flag');
      if (typeof c.number !== 'string' || !c.number.includes('••')) bad(file, `${cat}.number`, 'mask the number, e.g. "+856 20 55•• 1902" (never a real full number)');
    });
    const real = d.calls.filter(c => c.real).length;
    if (!real || real === d.calls.length) bad(file, at, 'mix real and scam calls');
    if (new Set(d.calls.map(c => c.time)).size < 4) bad(file, at, 'needs at least 4 different times (one call is played per time)');
  });
}

const CHECKS = { call: checkCalls };
const files = dir => existsSync(dir) ? readdirSync(dir, { withFileTypes: true }).flatMap(d => d.isDirectory() ? files(join(dir, d.name)) : d.name.endsWith('.json') ? [join(dir, d.name)] : []) : [];
let n = 0;
for (const path of files(ROOT)) {
  const file = relative(ROOT, path);
  let data;
  try { data = JSON.parse(readFileSync(path, 'utf8')); } catch (e) { bad(file, '', `not valid JSON: ${e.message}`); continue; }
  n++;
  scanThai(file, data);
  const [game, name] = file.split(/[\\/]/);
  const band = name?.replace(/\.json$/, '');
  if (CHECKS[game] && BANDS.includes(band)) CHECKS[game](file, data, band);
}
if (problems.length) {
  console.error(`content/: ${problems.length} problem${problems.length > 1 ? 's' : ''}\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
console.log(`content/: ${n} files OK`);
