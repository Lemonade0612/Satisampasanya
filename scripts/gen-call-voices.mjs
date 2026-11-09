// Pre-records the Scam Call voice-over (Lao and English) so it plays on any phone, even without a Lao system voice.
// Uses Microsoft neural voices through edge-tts (pip install edge-tts), then ffmpeg (brew install ffmpeg) runs each
// clip through a phone-line filter so it sounds like a real call instead of a clean robot voice.
//   node scripts/gen-call-voices.mjs            only lines whose text or voice changed
//   node scripts/gen-call-voices.mjs --force    regenerate everything
// Set EDGE_TTS / FFMPEG to the binaries if they are not on PATH.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { spoken } from './lib/lao-speech.mjs';

const VOICES = {
  lo: { man: 'lo-LA-ChanthavongNeural', woman: 'lo-LA-KeomanyNeural' },
  en: { man: 'en-US-AndrewNeural', woman: 'en-US-AvaNeural' },
};
const tts = process.env.EDGE_TTS || 'edge-tts';
const ffmpeg = process.env.FFMPEG || 'ffmpeg';
const force = process.argv.includes('--force');
const out = resolve('frontend/public/audio/calls');
const cache = resolve('node_modules/.cache/sati-call-voices');
mkdirSync(cache, { recursive: true });
const manifestFile = join(cache, 'manifest.json');
const manifest = existsSync(manifestFile) && !force ? JSON.parse(readFileSync(manifestFile, 'utf8')) : {};

// Load the call data straight from the TypeScript source.
// Written inside node_modules so the bundle can still resolve lucide-react.
const tmp = resolve(`node_modules/.cache/sati-calls-${process.pid}.mjs`);
await build({ entryPoints: ['frontend/src/features/daily/data/scamCalls.ts'], bundle: true, format: 'esm', platform: 'node', outfile: tmp, external: ['lucide-react'], logLevel: 'error' });
const { ALL_CALLS } = await import(pathToFileURL(tmp).href);
rmSync(tmp);


// Extreme rate/pitch shifts are what make neural voices sound synthetic; keep the caller's character but cap it.
// A small per-line wobble keeps a three-line call from sounding like one flat recording.
const clamp = (n, a) => Math.max(-a, Math.min(a, n));
const signed = (n, unit) => `${n >= 0 ? '+' : ''}${n}${unit}`;
const WOBBLE = [0, -3, 2];

// Phone line: narrow the band like a mobile call, compress a little, add a faint line hiss and a breath of
// silence at the start (real calls never start on the first syllable).
const PHONE = [
  '[0:a]aresample=24000,adelay=180:all=1,highpass=f=280,lowpass=f=3500,',
  'equalizer=f=1600:t=q:w=1.2:g=4,acompressor=threshold=-20dB:ratio=3:attack=5:release=90:makeup=2,apad=pad_dur=0.25[v];',
  'anoisesrc=color=pink:amplitude=0.006:sample_rate=24000,highpass=f=300,lowpass=f=3200[n];',
  '[v][n]amix=inputs=2:duration=first:dropout_transition=0:normalize=0,alimiter=limit=0.95[o]',
].join('');

function run(bin, args) {
  // The voice service sometimes drops a request; retry a few times before giving up.
  for (let tries = 1; ; tries++) {
    try { return execFileSync(bin, args, { stdio: 'pipe', timeout: 30000 }); }
    catch (e) { if (tries >= 6) throw e; execFileSync('sleep', [String(tries * 4)]); }
  }
}

let made = 0, kept = 0;
const failed = [];
for (const call of ALL_CALLS) {
  for (const lang of ['lo', 'en']) {
    mkdirSync(join(out, lang), { recursive: true });
    call.lines.forEach((line, i) => {
      const name = `${call.id}-${i}.mp3`, file = join(out, lang, name);
      const text = spoken(line[lang], lang);
      const rate = clamp(call.voice.rate, 12) + WOBBLE[i % WOBBLE.length];
      const pitch = clamp(call.voice.pitch, 6);
      const args = ['--voice', VOICES[lang][call.voice.who], `--rate=${signed(rate, '%')}`, `--pitch=${signed(pitch, 'Hz')}`, '--text', text];
      const key = createHash('sha1').update(JSON.stringify([args, PHONE])).digest('hex');
      // A failed request can leave an empty file; treat it as missing.
      if (manifest[`${lang}/${name}`] === key && existsSync(file) && statSync(file).size > 0) { kept++; return; }
      const raw = join(cache, `${key}.mp3`);
      // If the service keeps refusing one line, keep its old clip and move on; a re-run picks it up.
      try { if (!existsSync(raw) || statSync(raw).size === 0) run(tts, [...args, '--write-media', raw]); }
      catch { rmSync(raw, { force: true }); failed.push(`${lang}/${name}`); return; }
      run(ffmpeg, ['-y', '-loglevel', 'error', '-i', raw, '-filter_complex', PHONE, '-map', '[o]', '-ac', '1', '-c:a', 'libmp3lame', '-b:a', '48k', file]);
      manifest[`${lang}/${name}`] = key;
      writeFileSync(manifestFile, JSON.stringify(manifest, null, 1));
      made++;
      process.stdout.write(`\r${made} recorded`);
    });
  }
}
console.log(`\nDone: ${made} recorded, ${kept} unchanged → ${out}`);
if (failed.length) { console.log(`${failed.length} failed (old clip kept), re-run to retry:\n  ${failed.join('\n  ')}`); process.exitCode = 1; }
