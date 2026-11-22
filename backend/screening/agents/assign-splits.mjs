// After grading: assigns graded pool rows 70% train / 15% dev / 15% locked-gen (stratified by category, deterministic by text hash).
//   node backend/screening/agents/assign-splits.mjs
// locked-gen is written ONCE to testdata/locked-gen/en.jsonl (refuses to overwrite) and is never read by tuning code.
import { createHash } from 'node:crypto';
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { readJsonl, generatedPath } from './common.mjs';
const LOCKED = new URL('../testdata/locked-gen/en.jsonl', import.meta.url);
export function assign(rows) {
  const out = { train: [], dev: [], lockedGen: [] }, groups = {};
  for (const r of rows.filter(r => r.graded && r.split === 'pool')) (groups[r.labels[0] || 'safe'] ||= []).push(r);
  for (const list of Object.values(groups)) {
    list.sort((a, b) => createHash('sha256').update(a.text).digest('hex').localeCompare(createHash('sha256').update(b.text).digest('hex')));
    list.forEach((r, i) => { const f = (i + 0.5) / list.length; (f < 0.7 ? out.train : f < 0.85 ? out.dev : out.lockedGen).push(r); });
  }
  return out;
}
if (process.argv[1] && import.meta.url === new URL(process.argv[1], 'file:').href) {
  if (existsSync(LOCKED)) { console.log('locked-gen already exists: refusing to reassign (it is locked).'); process.exit(0); }
  const rows = readJsonl(generatedPath('en')), a = assign(rows), keep = rows.filter(r => !(r.graded && r.split === 'pool'));
  const tag = (list, split) => list.map(r => ({ ...r, split }));
  writeFileSync(generatedPath('en'), [...keep, ...tag(a.train, 'train'), ...tag(a.dev, 'dev')].map(r => JSON.stringify(r)).join('\n') + '\n');
  mkdirSync(new URL('../testdata/locked-gen/', import.meta.url), { recursive: true });
  writeFileSync(LOCKED, tag(a.lockedGen, 'locked-gen').map(r => JSON.stringify({ ...r, review: 'pending' })).join('\n') + '\n');
  console.log(`train ${a.train.length}, dev ${a.dev.length}, locked-gen ${a.lockedGen.length}`);
}
