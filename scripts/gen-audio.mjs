// Pre-records every Lao line the app reads aloud, so read-aloud works on any phone and offline.
// Browsers and phones rarely ship a Lao voice, and a Thai voice cannot read Lao script, so the app never
// uses runtime speech for Lao: it plays these files.
//
//   node scripts/gen-audio.mjs              record missing lines with edge-tts (no key needed)
//   node scripts/gen-audio.mjs --azure      record with Azure Speech (AZURE_SPEECH_KEY + AZURE_SPEECH_REGION)
//   node scripts/gen-audio.mjs --force      re-record everything
//   node scripts/gen-audio.mjs --check      record nothing; list missing lines (exit 1 if any)
//   node scripts/gen-audio.mjs --prune      also delete recordings no line uses any more
//   --kbps=32                               bitrate for the MP3 (default 48, mono)
//
// What gets recorded: everything spokenCatalog() returns (frontend/src/features/daily/lib/spoken.ts), plus every
// { "lo": "...", "speak": true } object in content/**/*.json (optional "voice": "man" | "woman").
// Each line is saved as frontend/public/audio/lo/<key>.mp3, where the key comes from shared/audio-key.mjs.
// A human recording dropped in frontend/public/audio/lo/human/<key>.mp3 always wins over the generated one.
// The keys are never shipped to the client: they are read here, from the environment, and nowhere else.
import { execFile } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import { build } from 'esbuild';
import { audioKey, DEFAULT_VOICE } from '../shared/audio-key.mjs';
import { BANDS } from '../shared/bands.mjs';
import { spoken } from './lib/lao-speech.mjs';

const run = promisify(execFile);
const args = process.argv.slice(2);
const has = f => args.includes(f);
const azure = has('--azure'), force = has('--force'), check = has('--check'), prune = has('--prune');
const kbps = Number((args.find(a => a.startsWith('--kbps=')) || '--kbps=48').split('=')[1]);
const VOICE_NAME = { woman: 'lo-LA-KeomanyNeural', man: 'lo-LA-ChanthavongNeural' };
const OUT = resolve('frontend/public/audio/lo');
const HUMAN = join(OUT, 'human');
const CACHE = resolve('node_modules/.cache/sati-audio');
mkdirSync(OUT, { recursive: true }); mkdirSync(HUMAN, { recursive: true }); mkdirSync(CACHE, { recursive: true });

// ---------- 1. Collect the lines ----------
const tmp = join(CACHE, `spoken-${process.pid}.mjs`);
await build({ entryPoints: ['frontend/src/features/daily/lib/spoken.ts'], bundle: true, format: 'esm', platform: 'node', outfile: tmp, external: ['lucide-react', 'react'], logLevel: 'error' });
const { spokenCatalog } = await import(pathToFileURL(tmp).href);
rmSync(tmp);

const lines = new Map(); // key -> { text, voice, bands:Set, from }
const addLine = (text, voice, bands, from) => {
  const key = audioKey(text, voice);
  const line = lines.get(key) ?? { text, voice, bands: new Set(), from };
  bands.forEach(b => line.bands.add(b));
  lines.set(key, line);
};
for (const item of spokenCatalog()) addLine(item.text, DEFAULT_VOICE, item.bands, 'app');

const walkFiles = dir => existsSync(dir) ? readdirSync(dir, { withFileTypes: true }).flatMap(d => d.isDirectory() ? walkFiles(join(dir, d.name)) : d.name.endsWith('.json') ? [join(dir, d.name)] : []) : [];
for (const file of walkFiles(resolve('content'))) {
  const rel = relative(resolve('content'), file);
  const fileBands = rel.split(sep).map(p => p.replace(/\.json$/, '')).filter(p => BANDS.includes(p));
  const visit = (node, bands) => {
    if (Array.isArray(node)) return node.forEach(n => visit(n, bands));
    if (!node || typeof node !== 'object') return;
    const here = Array.isArray(node.bands) ? node.bands.filter(b => BANDS.includes(b)) : bands;
    if (node.speak === true && typeof node.lo === 'string' && node.lo.trim()) addLine(node.lo, node.voice === 'man' ? 'man' : DEFAULT_VOICE, here.length ? here : BANDS, rel);
    for (const v of Object.values(node)) visit(v, here);
  };
  try { visit(JSON.parse(readFileSync(file, 'utf8')), fileBands); } catch (e) { console.error(`! ${rel}: ${e.message}`); process.exitCode = 1; }
}

// ---------- 2. Record what is missing ----------
const fileFor = key => join(OUT, `${key}.mp3`);
const ok = f => existsSync(f) && statSync(f).size > 0;
const todo = [...lines].filter(([key]) => force || !ok(fileFor(key)));

async function edge(text, voice, raw) {
  const bin = process.env.EDGE_TTS || 'edge-tts';
  for (let tries = 1; ; tries++) {
    try { await run(bin, ['--voice', VOICE_NAME[voice], '--text', text, '--write-media', raw], { timeout: 45000 }); return; }
    catch (e) { if (e.code === 'ENOENT' || tries >= 5) throw e; await new Promise(r => setTimeout(r, tries * 3000)); }
  }
}
const xml = s => s.replace(/[<>&'"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));
async function azureTts(text, voice, raw) {
  const { AZURE_SPEECH_KEY: key, AZURE_SPEECH_REGION: region } = process.env;
  const ssml = `<speak version="1.0" xml:lang="lo-LA"><voice name="${VOICE_NAME[voice]}">${xml(text)}</voice></speak>`;
  for (let tries = 1; ; tries++) {
    const res = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: 'POST', body: ssml,
      headers: { 'Ocp-Apim-Subscription-Key': key, 'Content-Type': 'application/ssml+xml', 'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3', 'User-Agent': 'sati-gen-audio' },
    });
    if (res.ok) { writeFileSync(raw, Buffer.from(await res.arrayBuffer())); return; }
    if (tries >= 5 || (res.status < 500 && res.status !== 429)) throw new Error(`Azure ${res.status}: ${await res.text()}`);
    await new Promise(r => setTimeout(r, tries * 3000));
  }
}
// Both providers return 24 kHz, 48 kbps mono MP3. Copy it as-is at 48 kbps; re-encode only to go smaller.
async function encode(raw, file) {
  if (kbps >= 48) return copyFileSync(raw, file);
  await run(process.env.FFMPEG || 'ffmpeg', ['-y', '-loglevel', 'error', '-i', raw, '-ac', '1', '-ar', '24000', '-c:a', 'libmp3lame', '-b:a', `${kbps}k`, file]);
}

let skipReason = '';
if (check) skipReason = '--check';
else if (azure) {
  if (!process.env.AZURE_SPEECH_KEY || !process.env.AZURE_SPEECH_REGION) skipReason = 'AZURE_SPEECH_KEY / AZURE_SPEECH_REGION not set';
  else {
    // Confirm both Lao voices exist before recording hundreds of lines.
    const res = await fetch(`https://${process.env.AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/voices/list`, { headers: { 'Ocp-Apim-Subscription-Key': process.env.AZURE_SPEECH_KEY } }).catch(e => ({ ok: false, statusText: e.message }));
    const names = res.ok ? (await res.json()).map(v => v.ShortName) : [];
    const absent = Object.values(VOICE_NAME).filter(v => !names.includes(v));
    if (!res.ok) skipReason = `Azure voice list failed: ${res.status ?? ''} ${res.statusText}`;
    else if (absent.length) skipReason = `Azure has no ${absent.join(', ')}`;
  }
}

const failed = [];
let made = 0;
if (!skipReason && todo.length) {
  const queue = [...todo];
  const worker = async () => {
    for (let item; (item = queue.shift());) {
      const [key, { text, voice }] = item;
      const raw = join(CACHE, `${key}.${azure ? 'az' : 'edge'}.mp3`);
      try {
        if (force || !ok(raw)) await (azure ? azureTts : edge)(spoken(text, 'lo'), voice, raw);
        await encode(raw, fileFor(key));
        made++; process.stdout.write(`\r${made}/${todo.length} recorded`);
      } catch (e) {
        rmSync(raw, { force: true });
        if (e.code === 'ENOENT') { skipReason = 'edge-tts not found (pip install edge-tts, or set EDGE_TTS)'; queue.length = 0; }
        else failed.push(key);
      }
    }
  };
  await Promise.all(Array.from({ length: azure ? 4 : 3 }, worker));
  if (made) process.stdout.write('\n');
}

// ---------- 3. Manifest, prune, report ----------
const manifest = {};
for (const key of [...lines.keys()].sort()) {
  if (ok(join(HUMAN, `${key}.mp3`))) manifest[key] = 2;
  else if (ok(fileFor(key))) manifest[key] = 1;
}
writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest) + '\n');

const orphans = readdirSync(OUT).filter(f => f.endsWith('.mp3') && !lines.has(f.slice(0, -4)));
if (prune) orphans.forEach(f => rmSync(join(OUT, f)));

const missing = [...lines].filter(([key]) => !manifest[key]);
const size = key => manifest[key] === 2 ? statSync(join(HUMAN, `${key}.mp3`)).size : manifest[key] ? statSync(fileFor(key)).size : 0;
const mb = n => `${(n / 1048576).toFixed(1)} MB`;
const perBand = Object.fromEntries(BANDS.map(b => [b, { n: 0, bytes: 0 }]));
let total = 0;
for (const [key, line] of lines) { const s = size(key); total += s; for (const b of line.bands) { perBand[b].n++; perBand[b].bytes += s; } }

console.log(`\nLao read-aloud: ${lines.size} lines, ${Object.keys(manifest).length} with audio (${Object.values(manifest).filter(v => v === 2).length} human), ${made} recorded now, ${mb(total)} total`);
for (const b of BANDS) console.log(`  ${b.padEnd(6)} ${String(perBand[b].n).padStart(4)} lines  ${mb(perBand[b].bytes)}`);
if (orphans.length) console.log(`${orphans.length} unused recordings ${prune ? 'deleted' : 'kept (run with --prune to delete)'}`);
if (skipReason) console.log(`Recording skipped: ${skipReason}. Existing files kept.`);
if (missing.length) {
  const list = join(CACHE, 'missing.txt');
  writeFileSync(list, missing.map(([key, l]) => `${key}\t${l.voice}\t${[...l.bands].join(',')}\t${l.text}`).join('\n') + '\n');
  console.log(`${missing.length} lines have no audio yet (the app shows "ສຽງກຳລັງມາ" for them). List: ${relative(process.cwd(), list)}`);
  if (failed.length) console.log(`${failed.length} failed this run; run again to retry.`);
  if (check || failed.length) process.exitCode = 1;
}
