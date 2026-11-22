// Generates realistic English (or --lang=lo) posts per category plus hard safe posts with the configured AI.
//   node backend/screening/agents/generator.mjs --split=train|dev --per=20 --seed=1 [--lang=en|lo] [--out=generated]
// Writes testdata/generated/<lang>.jsonl, deduped against all known data. NEVER writes to locked/ (refused).
import { CATEGORIES } from '../categories.mjs';
import { DEFINITIONS, SAFE_KINDS, STYLES } from './spec.mjs';
import { argOf, rng, key, knownKeys, appendJsonl, generatedPath, realAsk } from './common.mjs';

const SCHEMA = { type: 'object', additionalProperties: false, required: ['posts'], properties: { posts: { type: 'array', items: { type: 'string' } } } };
export const PROMPT_VERSION = 'gen-v2';
const PERSONAS = ['a high-school student', 'a university student', 'a factory worker', 'a market seller', 'a worried parent', 'a stranger on Facebook', 'a fake recruiter', 'a school friend', 'a news page admin', 'a bank customer']; // locked-set authoring used different wording and hand-written items; this prompt is for train/dev only.

export function buildPrompt({ category, kind, styles, n, lang, persona = '' }) {
  const language = lang === 'lo' ? 'Lao (with occasional English words as young Lao people write online)' : 'English';
  const system = `You write test posts for a content-safety classifier used by a youth anti-scam platform in Laos. Posts are in ${language}, 1 to 4 sentences, the way real teens and young adults type on Facebook/WhatsApp. Never include real people, real phone numbers or real bank accounts. Return JSON only.`;
  const task = category
    ? `Write ${n} different posts that clearly belong to the category "${category}": ${DEFINITIONS[category]}. Vary the scenario, wording and length. Apply these styles across the posts: ${styles.join('; ')}. Write as different people, for example ${persona}.`
    : `Write ${n} different SAFE posts that must NOT be flagged. Kind: ${kind}. Hard cases are welcome: they should mention scams, banks, jobs or police in a harmless way. Apply these styles across the posts: ${styles.join('; ')}. Write as different people, for example ${persona}.`;
  return { system, user: { task, count: n } };
}
export async function generate({ split, per = 20, seed = 1, lang = 'en', ask = realAsk, batch = 12, log = () => {} }) {
  if (/locked/.test(split)) throw new Error('The generator never writes to a locked test set. Use split=pool; assign-splits.mjs separates locked-gen after grading.');
  if (!['train', 'dev', 'pool'].includes(split)) throw new Error('--split must be pool, train or dev');
  const rnd = rng(seed), known = knownKeys(), out = [];
  const targets = [...CATEGORIES.map(c => ({ category: c })), ...SAFE_KINDS.map(k => ({ kind: k }))];
  for (const t of targets) {
    const want = t.category ? per : Math.max(4, Math.round(per * CATEGORIES.length / SAFE_KINDS.length / 2));
    for (let have = 0, guard = 0; have < want && guard < 6; guard++) {
      const styles = [...STYLES].sort(() => rnd() - 0.5).slice(0, 3);
      const persona = [...PERSONAS].sort(() => rnd() - 0.5).slice(0, 3).join(', '), { system, user } = buildPrompt({ ...t, styles, persona, n: Math.min(batch, want - have), lang });
      let res; try { res = await ask(system, user, SCHEMA); } catch (e) { if (e.name === 'NoProviderError' || /No AI provider/.test(e.message)) throw e; log(`skip batch: ${e.message}`); continue; }
      for (const text of (Array.isArray(res?.posts) ? res.posts : [])) {
        const k = key(text); if (typeof text !== 'string' || text.length < 8 || text.length > 600 || known.has(k)) continue;
        known.add(k); have++;
        out.push({ id: `gen-${lang}-${split}-${seed}-${out.length + 1}`, text: text.trim(), labels: t.category ? [t.category] : [], split, lang, source: 'generator', promptVersion: PROMPT_VERSION, seed, safeKind: t.kind, graded: false });
      }
    }
    log(`${t.category || t.kind}: total ${out.length}`);
  }
  return out;
}
if (process.argv[1] && import.meta.url === new URL(process.argv[1], 'file:').href) {
  const rows = await generate({ split: argOf('split', 'train'), per: Number(argOf('per', 20)), seed: Number(argOf('seed', 1)), lang: argOf('lang', 'en'), log: m => console.error(m) });
  appendJsonl(generatedPath(argOf('lang', 'en')), rows);
  console.log(`generated ${rows.length} ungraded rows. Run grader.mjs next: ungraded rows are ignored by training.`);
}
