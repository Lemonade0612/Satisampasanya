// Loads the Scam Call data (DAYS, ALL_CALLS) straight from the TypeScript source, for the voice scripts.
import { rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

export async function loadCalls() {
  // Written inside node_modules so the bundle can still resolve lucide-react.
  const tmp = resolve(`node_modules/.cache/sati-calls-${process.pid}-${Date.now()}.mjs`);
  await build({ entryPoints: ['frontend/src/features/daily/data/scamCalls.ts'], bundle: true, format: 'esm', platform: 'node', outfile: tmp, external: ['lucide-react'], logLevel: 'error' });
  try { return await import(pathToFileURL(tmp).href); } finally { rmSync(tmp, { force: true }); }
}

// Your own recordings live here, one file per line: voice/recordings/<lang>/<call id>-<line>.<webm|m4a|mp3|wav>
export const RECORDINGS = resolve('voice/recordings');
export const TAKE_EXT = ['webm', 'm4a', 'mp4', 'mp3', 'wav', 'ogg'];
