// Lists suspected Thai-isms in every Lao string into docs/lao-thaiisms.md. Lists only; replaces nothing.
//   node scripts/scan-thaiisms.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const files = execSync(`git ls-files -co --exclude-standard frontend/src shared backend admin/src | grep -E '\\.(ts|tsx|mjs|json)$' | grep -v test`).toString().trim().split('\n')
  .filter(f => { try { readFileSync(f); return true; } catch { return false; } });

const NATIVE = 'native speaker decides';
const REPLACE = 'suggest replace';
const REVIEW = 'review';
// [regex, suggested, why, status]
const RULES = [
  [/ແຊຣ໌|ແຊຣ/g, 'ແບ່ງປັນ', 'Thai แชร์ (ຣ + ໌)', REPLACE],
  [/(?<!ເ)ພີ່(?!ນ້ອງ)/g, 'ອ້າຍ / ເອື້ອຍ', 'Thai พี่ used as "I/you"', REPLACE],
  [/ຮີບ/g, 'ຟ້າວ', 'Thai รีบ', REPLACE],
  [/ຄອມເມັ້ນ|ຄອມເມັນ/g, 'ຄຳເຫັນ', 'Thai-English คอมเมนต์', REPLACE],
  [/ແຄັບ/g, 'ຖ່າຍຮູບໜ້າຈໍ', 'Thai แคป', REPLACE],
  [/ຊົມຣົມ/g, 'ຊົມລົມ / ສະໂມສອນ', 'Thai ชมรม', REPLACE],
  [/ຣີເຊັດ/g, 'ຕັ້ງ…ໃໝ່', 'Thai-English รีเซ็ต', REPLACE],
  [/ເຊີໄພຣສ໌|ເຊີໄພຣສ/g, 'ຂອງຂວັນລັບ / ເຊີໄພສ', 'Thai spelling (ຣ + ໌)', REPLACE],
  [/ໂປຣໄຟລ໌?/g, 'ໂປໄຟລ໌ / ຂໍ້ມູນສ່ວນຕົວ', 'Thai spelling โปรไฟล์', REVIEW],
  [/ຄຣິສໂຕ|ຄຣີບໂຕ|ຄຣິບໂຕ/g, 'one spelling (ຄຣິບໂຕ?)', 'three spellings in use', REVIEW],
  [/ເທຣດ/g, 'ຊື້ຂາຍ', 'Thai-English เทรด', REPLACE],
  [/ໂອເຄ/g, 'ໄດ້ / ຕົກລົງ', 'Thai-English โอเค', NATIVE],
  [/ມິດສາຊີບ|ມິດສະຊີບ/g, 'ຄົນຫຼອກລວງ', 'Thai มิจฉาชีพ (also seen in Lao media)', NATIVE],
  [/ຈິງ/g, 'ແທ້', 'Thai จริง (Lao also has ຄວາມຈິງ, ຕົວຈິງ)', NATIVE],
  [/ຟຣີ/g, 'keep, or ບໍ່ເສຍເງິນ', 'common in Lao, Thai-style ຣ', NATIVE],
  [/ດາຣາ/g, 'ດາລາ', 'ຣ in a character name', REVIEW],
  [/ໂປຣໂມ/g, 'ໂປໂມຊັ່ນ', 'Thai โปรโมชั่น', REVIEW],
  [/ຕົ້ມຕຸ໋ນ/g, 'ຫຼອກລວງ', 'Thai ต้มตุ๋น', REPLACE],
  [/ມາກ(?!ວດ|ຫາ|ເອົາ|ຢູ່|ເບິ່ງ)/g, 'ຫຼາຍ', 'Thai มาก', REVIEW],
  [/ໄຫນ|ໄໜ/g, 'ໃສ / ໃດ', 'Thai ไหน', REPLACE],
  [/ອະໄຣ/g, 'ຫຍັງ', 'Thai อะไร', REPLACE],
  [/ທຳງານ/g, 'ເຮັດວຽກ', 'Thai ทำงาน', REPLACE],
  [/ໂຮງພະຍາບານ/g, 'ໂຮງໝໍ', 'Thai โรงพยาบาล', REPLACE],
  [/ຣ/g, 'ລ, or drop', 'other ຣ spelling (Thai-style cluster)', REVIEW],
  [/[฀-๿]+/g, 'Lao script', 'THAI SCRIPT', REPLACE],
];

const rows = [];
for (const f of files) {
  readFileSync(f, 'utf8').split('\n').forEach((ln, i) => {
    if (!/[຀-໿฀-๿]/.test(ln)) return;
    const taken = new Set(); // one row per position: specific rules win over the generic ຣ rule
    for (const [re, sug, why, status] of RULES) for (const m of ln.matchAll(re)) {
      const span = [...Array(m[0].length)].map((_, k) => m.index + k);
      if (span.some(p => taken.has(p))) continue;
      span.forEach(p => taken.add(p));
      // Context: the Lao word run around the hit.
      let a = m.index, b = m.index + m[0].length;
      while (a > 0 && /[຀-໿฀-๿ ]/.test(ln[a - 1]) && m.index - a < 24) a--;
      while (b < ln.length && /[຀-໿฀-๿ ]/.test(ln[b]) && b - m.index < 30) b++;
      rows.push({ f, line: i + 1, hit: m[0], ctx: ln.slice(a, b).trim(), sug, why, status });
    }
  });
}

const esc = s => s.replace(/\|/g, '\\|');
const link = r => `[${r.f}:${r.line}](../${r.f}#L${r.line})`;
const byWord = {};
for (const r of rows) (byWord[r.hit] ??= []).push(r);
const summary = Object.entries(byWord).sort((a, b) => b[1].length - a[1].length);

let md = `# Suspected Thai-isms in Lao strings

Generated ${new Date().toISOString().slice(0, 10)} by scanning every Lao string in \`frontend/src\`, \`shared\`, \`backend\` and \`admin/src\`.
**Nothing has been replaced.** This list is for review with a native Lao speaker. When a change is agreed, edit the string, mark it \`// REVIEW-LO\`, and tick it here.

Status:
- **suggest replace**: a clear Thai word or Thai spelling where a common Lao word exists.
- **review**: probably Thai-influenced, but Lao usage varies.
- **native speaker decides**: common in spoken or written Lao. Keep or replace by your call.

The rules for new copy are in [lao-style.md](lao-style.md).

## Summary

| Current | Suggested | Why | Status | Hits |
|---|---|---|---|---|
${summary.map(([w, rs]) => `| ${w} | ${esc(rs[0].sug)} | ${esc(rs[0].why)} | ${rs[0].status} | ${rs.length} |`).join('\n')}

No Thai script (U+0E00–U+0E7F) was found${rows.some(r => r.why === 'THAI SCRIPT') ? ' — EXCEPT the THAI SCRIPT rows below' : ''}.

Not listed: Lao words that only look like a hit (ເພີ່ມ, ບັງຄັບ, ມາກວດ), and ດ່ວນ, which is shared Lao/Thai vocabulary.

## Every hit

| ✓ | File | Current | In context | Suggested | Status |
|---|---|---|---|---|---|
${rows.sort((a, b) => a.status.localeCompare(b.status) || a.f.localeCompare(b.f) || a.line - b.line)
  .map(r => `| ☐ | ${link(r)} | ${r.hit} | ${esc(r.ctx)} | ${esc(r.sug)} | ${r.status} |`).join('\n')}
`;
writeFileSync('docs/lao-thaiisms.md', md);
console.log(rows.length, 'rows;', summary.map(([w, r]) => `${w}:${r.length}`).join(' '));
