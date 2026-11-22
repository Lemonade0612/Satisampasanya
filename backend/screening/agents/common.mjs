// Shared helpers for the test-data agents. Everything here is offline-safe: `ask` is injectable so tests never call a model.
import { readFileSync, existsSync, appendFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { cachedReply } from './ai.mjs';
import { aiAvailable } from '../local-check.mjs';

export const DATA = new URL('../testdata/', import.meta.url);
export const generatedPath = lang => new URL(`./generated/${lang}.jsonl`, DATA);
export const rejectedPath = lang => new URL(`./generated/${lang}.rejected.jsonl`, DATA);
export const key = t => String(t).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
export const readJsonl = url => existsSync(url) ? readFileSync(url, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l)) : [];
export function appendJsonl(url, rows) { if (!rows.length) return; mkdirSync(dirname(url.pathname), { recursive: true }); appendFileSync(url, rows.map(r => JSON.stringify(r)).join('\n') + '\n'); }
export const argOf = (n, d) => (process.argv.find(a => a.startsWith(`--${n}=`)) || '').split('=').slice(1).join('=') || d;

// Seeded RNG so prompt styles are reproducible.
export function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// Keys of everything the screener has ever been given for training/tuning, plus the locked set: generated posts must not duplicate any.
export function knownKeys() {
  const keys = new Set();
  for (const f of ['en.jsonl', 'dev2.jsonl', 'generated/en.jsonl', 'generated/lo.jsonl', 'locked/en.jsonl', 'lo/stub.jsonl']) for (const r of readJsonl(new URL(f, DATA))) keys.add(key(r.text));
  return keys;
}
export class NoProviderError extends Error { constructor() { super('No AI provider configured. Set AI_PROVIDER=anthropic|openai|openrouter and the key in the environment (never in a file that is committed). The mock provider is not allowed for data generation.'); } }

// ask(system, userObject, schema) -> parsed JSON. Real provider only; the mock would return canned check results, not data.
export async function realAsk(system, user, schema) {
  if (!aiAvailable()) throw new NoProviderError();
  return cachedReply(system, { text: JSON.stringify(user) }, { schema, maxTokens: 3000 });
}
