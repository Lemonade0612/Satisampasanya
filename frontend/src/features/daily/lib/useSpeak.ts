import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import { audioKey, audioPath } from '../../../../../shared/audio-key.mjs';
import { speak as speakEnglish, stopSpeaking } from './speech';
import type { Lang } from '../types';
import type { Band } from '../../../lib/band';

// Read-aloud for the whole app. Lao is never spoken by the device (phones rarely have a Lao voice and a Thai
// voice cannot read Lao script): it plays the recordings made by scripts/gen-audio.mjs, listed in
// /audio/lo/manifest.json. A line with no recording yet is reported as unavailable, never read by another voice.
// English uses the device's en-US voice.
// Pass parts as built by lib/spoken.ts so each part matches a recording.

type Manifest = Record<string, 1 | 2>;
let manifest: Manifest | null = null;
let manifestLoad: Promise<void> | null = null;
let rate = readRate();
let playing = 0; // id of the sequence now playing, 0 = silent
let seq = 0;
const audio = typeof Audio === 'undefined' ? null : new Audio();
const subs = new Set<() => void>();
const emit = () => subs.forEach(fn => fn());

function loadManifest() {
  manifestLoad ??= fetch('/audio/lo/manifest.json')
    .then(r => (r.ok ? r.json() : {}))
    .catch(() => ({}))
    .then((m: Manifest) => { manifest = m; emit(); });
  return manifestLoad;
}

const RATE_KEY = 'sati-speech-rate';
function readRate(): number | null {
  try { const v = Number(localStorage.getItem(RATE_KEY)); return v === 0.85 || v === 1 ? v : null; } catch { return null; }
}
export function setSpeechRate(v: 0.85 | 1) {
  rate = v;
  try { localStorage.setItem(RATE_KEY, String(v)); } catch { /* storage unavailable: this session only */ }
  if (audio) audio.playbackRate = v;
  emit();
}
// Elders start slower; anyone can switch.
export const speechRate = (band?: Band) => rate ?? (band === 'elder' ? 0.85 : 1);

const partsOf = (parts: string[]) => parts.map(p => p.trim()).filter(Boolean);
export const loaUrl = (text: string) => {
  const key = audioKey(text);
  const kind = manifest?.[key];
  return kind ? audioPath(key, kind) : null;
};

export function stopAll() {
  playing = 0;
  if (audio) { audio.onended = audio.onerror = null; audio.pause(); }
  stopSpeaking();
  emit();
}

function playSequence(lang: Lang, parts: string[], speed: number, onEnd?: () => void) {
  stopAll();
  const id = ++seq;
  playing = id; emit();
  const done = () => { if (playing === id) { playing = 0; emit(); onEnd?.(); } };
  if (lang === 'en') { speakEnglish(parts.join(' '), 'en', done, 0.95 * speed); return; }
  const urls = parts.map(loaUrl);
  if (!audio || urls.some(u => !u)) { done(); return; }
  let i = 0;
  const next = () => {
    if (playing !== id) return;
    if (i >= urls.length) return done();
    audio.src = urls[i++]!;
    audio.playbackRate = speed;
    audio.preservesPitch = true;
    audio.onended = next;
    audio.onerror = done;
    audio.play().catch(done);
  };
  next();
}

const subscribe = (fn: () => void) => { subs.add(fn); return () => { subs.delete(fn); }; };
const snapshot = () => `${playing}|${manifest ? 1 : 0}|${rate}`;

export type Speaker = {
  /** 'ready' can play; 'coming' = a Lao recording is not made yet; 'loading' = still reading the manifest. */
  status: 'ready' | 'coming' | 'loading';
  speaking: boolean;
  rate: number;
  play: (onEnd?: () => void) => void;
  stop: () => void;
};

// Hook for one block of text. Stops this block's audio when the component unmounts.
export function useSpeak(parts: string[], lang: Lang, band?: Band): Speaker {
  useSyncExternalStore(subscribe, snapshot, snapshot);
  useEffect(() => { if (lang === 'lo') void loadManifest(); }, [lang]);
  const clean = partsOf(parts);
  const mine = useRef(0);
  const status: Speaker['status'] = lang === 'en' || !clean.length ? 'ready' : !manifest ? 'loading' : clean.every(p => loaUrl(p)) ? 'ready' : 'coming';
  const speed = speechRate(band);
  const key = clean.join('\u0001');
  const play = useCallback((onEnd?: () => void) => {
    // Claim the next sequence id before it starts, so the first re-render already shows this block as speaking.
    const start = () => { mine.current = seq + 1; playSequence(lang, clean, speechRate(band), onEnd); };
    if (lang === 'lo' && !manifest) void loadManifest().then(start); else start();
  }, [key, lang, band]); // eslint-disable-line react-hooks/exhaustive-deps
  const stop = useCallback(() => { if (playing && playing === mine.current) stopAll(); }, []);
  useEffect(() => () => { if (playing && playing === mine.current) stopAll(); }, [key]);
  return { status, speaking: !!playing && playing === mine.current, rate: speed, play, stop };
}

// For games that speak one-off lines from code (ScamDetective). Missing Lao lines are skipped silently
// here, because the game shows its own voice toggle state.
export function speakParts(parts: string[], lang: Lang, band?: Band, onEnd?: () => void) {
  const clean = partsOf(parts);
  const go = () => {
    if (lang === 'lo' && !clean.every(p => loaUrl(p))) { onEnd?.(); return; }
    playSequence(lang, clean, speechRate(band), onEnd);
  };
  if (lang === 'lo' && !manifest) void loadManifest().then(go); else go();
}
export const preloadSpeech = () => void loadManifest();
export const hasLaoAudio = (parts: string[]) => !!manifest && partsOf(parts).every(p => loaUrl(p));
