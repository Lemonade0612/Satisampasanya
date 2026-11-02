// Pre-records the Scam Call voice-over (Lao and English) so it plays on any phone, even without a Lao system voice.
// Uses Microsoft neural voices through edge-tts (pip install edge-tts). Re-run after editing lines or `voice` in scamCalls.ts.
//   node scripts/gen-call-voices.mjs            only missing files
//   node scripts/gen-call-voices.mjs --force    regenerate everything
// Set EDGE_TTS to the edge-tts binary if it is not on PATH.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const VOICES = {
  lo: { man: 'lo-LA-ChanthavongNeural', woman: 'lo-LA-KeomanyNeural' },
  en: { man: 'en-US-AndrewNeural', woman: 'en-US-AvaNeural' },
};
const bin = process.env.EDGE_TTS || 'edge-tts';
const force = process.argv.includes('--force');
const out = resolve('frontend/public/audio/calls');

// Load the call data straight from the TypeScript source.
// Written inside node_modules so the bundle can still resolve lucide-react.
const tmp = resolve(`node_modules/.cache/sati-calls-${process.pid}.mjs`);
await build({ entryPoints: ['frontend/src/features/daily/data/scamCalls.ts'], bundle: true, format: 'esm', platform: 'node', outfile: tmp, external: ['lucide-react'], logLevel: 'error' });
const { SLOTS } = await import(pathToFileURL(tmp).href);
rmSync(tmp);

const signed = (n, unit) => `${n >= 0 ? '+' : ''}${n}${unit}`;
let made = 0, kept = 0;
for (const call of SLOTS.flat()) {
  for (const lang of ['lo', 'en']) {
    mkdirSync(join(out, lang), { recursive: true });
    call.lines.forEach((line, i) => {
      const name = `${call.id}-${i}.mp3`, file = join(out, lang, name);
      // A failed request can leave an empty file; treat it as missing.
      if (existsSync(file) && statSync(file).size > 0 && !force) { kept++; return; }
      const args = ['--voice', VOICES[lang][call.voice.who], `--rate=${signed(call.voice.rate, '%')}`, `--pitch=${signed(call.voice.pitch, 'Hz')}`, '--text', line[lang], '--write-media', file];
      // The voice service sometimes drops a request; retry a few times before giving up.
      for (let tries = 1; ; tries++) {
        try { execFileSync(bin, args, { stdio: 'pipe' }); break; }
        catch (e) { if (tries >= 4) throw e; execFileSync('sleep', [String(tries * 2)]); }
      }
      made++;
      process.stdout.write(`\r${made} recorded`);
    });
  }
}
console.log(`\nDone: ${made} recorded, ${kept} already there → ${out}`);
