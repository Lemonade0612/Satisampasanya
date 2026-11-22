// Cached, throttled model calls for the data agents and the evals. Same signature as modelReply().
// Results are cached on disk (testdata/.ai-cache, git-ignored) so reruns spend no quota. Only successful, parsed answers are cached.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { modelReply, readSafetyConfig } from '../../safety/model.mjs';

const DIR = new URL('../testdata/.ai-cache/', import.meta.url);
export const cacheStats = { hits: 0, calls: 0, failures: 0 };
let last = 0;
const minInterval = () => Number(process.env.AI_MIN_INTERVAL_MS) || 3000;
const pause = ms => new Promise(r => setTimeout(r, ms));
export async function cachedReply(instructions, input, options = {}) {
  const cfg = readSafetyConfig();
  const id = createHash('sha256').update(JSON.stringify([cfg.provider, cfg.model, instructions, input, options.schema ?? null])).digest('hex');
  const file = new URL(id + '.json', DIR);
  if (existsSync(file)) { cacheStats.hits++; return JSON.parse(readFileSync(file, 'utf8')); }
  const wait = last + minInterval() - Date.now(); if (wait > 0) await pause(wait); last = Date.now();
  cacheStats.calls++;
  try {
    const out = await modelReply(instructions, input, options);
    mkdirSync(DIR, { recursive: true }); writeFileSync(file, JSON.stringify(out));
    return out;
  } catch (e) { cacheStats.failures++; throw e; }
}
