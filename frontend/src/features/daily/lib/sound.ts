import { useEffect, useSyncExternalStore } from 'react';
import { load, save } from './storage';

// Game music and sound effects, synthesised live with Web Audio: no audio files to download, works offline,
// and the tempo can speed up as the pressure rises (timer running low, faster laps).
//   useMusic('chase' | 'tense' | 'mystery' | 'suspense' | null)  background loop for the current screen
//   sfx('right' | 'wrong' | ...)                                   one-shot effects
//   setUrgent(true)                                                 timer is low: faster, busier, ticking
// One "sound" switch (TopBar / SoundToggle) covers music and effects; the Scam Call voice has its own switch.

export type Track = 'chase' | 'tense' | 'mystery' | 'suspense';
export type Sfx = 'right' | 'wrong' | 'tick' | 'coin' | 'hurt' | 'jump' | 'whoosh' | 'win' | 'lose' | 'hangup' | 'tap';

const KEY = 'sati-sound';
let on = load<boolean>(KEY, true) !== false;
const subs = new Set<() => void>();

let ctx: AudioContext | null = null;
let master: GainNode, music: GainNode, fx: GainNode, noise: AudioBuffer;
let current: Track | null = null, step = 0, next = 0, timer = 0;
let urgent = false, intensity = 0, ducked = false;
let drone: { stop: () => void } | null = null;
let ring: number | null = null;

const MUSIC_GAIN = 0.34, FX_GAIN = 0.55;
const hz = (m: number) => 440 * 2 ** ((m - 69) / 12);

function audio() {
  if (ctx) return ctx;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain(); master.gain.value = on ? 1 : 0;
  const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
  master.connect(comp).connect(ctx.destination);
  music = ctx.createGain(); music.gain.value = MUSIC_GAIN; music.connect(master);
  fx = ctx.createGain(); fx.gain.value = FX_GAIN; fx.connect(master);
  noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return ctx;
}

// Browsers only allow sound after a tap: unlock on the first one, pause when the app is hidden.
if (typeof window !== 'undefined') {
  const unlock = () => { const c = audio(); if (c && c.state !== 'running' && on) c.resume().catch(() => {}); };
  window.addEventListener('pointerdown', unlock, { capture: true });
  window.addEventListener('keydown', unlock, { capture: true });
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend().catch(() => {}); else if (on) ctx.resume().catch(() => {});
  });
}

// ---------- instruments ----------
function envGain(t: number, peak: number, attack: number, decay: number, dest: AudioNode) {
  const g = ctx!.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  g.connect(dest);
  return g;
}
function tone(t: number, freq: number, dur: number, peak: number, type: OscillatorType, dest: AudioNode, cutoff = 0, glideTo = 0) {
  const o = ctx!.createOscillator(); o.type = type; o.frequency.setValueAtTime(freq, t);
  if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, t + dur);
  const g = envGain(t, peak, 0.005, dur, dest);
  if (cutoff) { const f = ctx!.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = cutoff; o.connect(f).connect(g); } else o.connect(g);
  o.start(t); o.stop(t + dur + 0.05);
}
function burst(t: number, dur: number, peak: number, type: BiquadFilterType, freq: number, dest: AudioNode, q = 0.7) {
  const s = ctx!.createBufferSource(); s.buffer = noise;
  const f = ctx!.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
  s.connect(f).connect(envGain(t, peak, 0.002, dur, dest));
  s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
}
const kick = (t: number, g = 0.9, low = 48) => tone(t, 150, 0.22, g, 'sine', music, 0, low);
const snare = (t: number, g = 0.35) => { burst(t, 0.14, g, 'highpass', 1600, music); tone(t, 190, 0.08, g * 0.6, 'triangle', music); };
const hat = (t: number, g = 0.12, len = 0.035) => burst(t, len, g, 'highpass', 7500, music);
const bass = (t: number, m: number, len: number, g = 0.28) => tone(t, hz(m), len, g, 'sawtooth', music, 520 + intensity * 900 + (urgent ? 500 : 0));
const pluck = (t: number, m: number, len: number, g = 0.08, type: OscillatorType = 'square') => tone(t, hz(m), len, g, type, music, 2400);
const stab = (t: number, ms: number[], len: number, g = 0.07) => ms.forEach(m => tone(t, hz(m), len, g, 'sawtooth', music, 1500));

function startDrone(ms: number[], g: number) {
  const c = ctx!, out = c.createGain(); out.gain.setValueAtTime(0.0001, c.currentTime); out.gain.exponentialRampToValueAtTime(g, c.currentTime + 1.5);
  const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 420; f.connect(out).connect(music);
  const lfo = c.createOscillator(), depth = c.createGain(); lfo.frequency.value = 0.12; depth.gain.value = 160; lfo.connect(depth).connect(f.frequency); lfo.start();
  const oscs = ms.flatMap(m => [-6, 6].map(cents => { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = hz(m); o.detune.value = cents; o.connect(f); o.start(); return o; }));
  return { stop: () => { const t = c.currentTime; out.gain.cancelScheduledValues(t); out.gain.setValueAtTime(out.gain.value, t); out.gain.exponentialRampToValueAtTime(0.0001, t + 0.6); [...oscs, lfo].forEach(o => o.stop(t + 0.7)); } };
}

// ---------- tracks: 16 steps per bar, chord changes per bar ----------
type Def = { bpm: number; bars: number; drone?: [number[], number]; play: (i: number, bar: number, t: number, len: number) => void };

const CHASE_CHORDS = [[0, 3, 7], [-4, 0, 3], [-2, 2, 5], [-5, -1, 2]]; // Am F G E, around A
const CHASE_BASS = [0, null, 0, 12, null, 0, 12, null, 0, null, 0, 12, null, 12, 10, 7];
const ARP = [0, 1, 2, 3, 2, 1, 0, 1];
const MYSTERY_CHORDS = [[0, 3, 7], [-2, 2, 5], [-4, 0, 3], [-5, -1, 2]]; // Dm C Bb A, around D

const TRACKS: Record<Track, Def> = {
  // Scam Dash run: driving four-on-the-floor with a bright arpeggio.
  chase: { bpm: 148, bars: 4, play(i, bar, t, len) {
    const c = CHASE_CHORDS[bar], b = CHASE_BASS[i];
    if (i % 4 === 0) kick(t);
    if (i === 4 || i === 12) snare(t);
    if (i % 2 === 1 || urgent || intensity > 0.6) hat(t, i % 2 ? 0.12 : 0.06);
    if (b !== null) bass(t, 45 + c[0] + b, len * 1.6);
    if (i % 2 === 0) { const tones = [c[0], c[1], c[2], c[0] + 12]; pluck(t, 69 + tones[ARP[(i / 2) % 8]], len * 1.8, 0.06); }
    if (intensity > 0.3 && i === 14) snare(t, 0.2);
  } },
  // Timed quiz: ticking clock, pulsing low note, an uneasy half-step chord.
  tense: { bpm: 118, bars: 4, play(i, bar, t, len) {
    const root = 45 + [0, 0, 1, -1][bar];
    if (i === 0 || i === 10) kick(t, 0.8);
    if (i % 2 === 0) hat(t, i % 4 ? 0.07 : 0.11, 0.025);
    if (i % 2 === 0) bass(t, root, len * 1.4, i % 4 ? 0.18 : 0.28);
    if (i === 0 && bar % 2 === 0) stab(t, [root + 12, root + 13, root + 19], len * 6);
    if ((urgent || intensity > 0.5) && i % 2 === 1) pluck(t, root + (i % 4 === 1 ? 31 : 32), len, 0.045);
    if (urgent && (i === 12 || i === 14 || i === 15)) snare(t, 0.22);
  } },
  // Detective / story: Andalusian cadence, soft pluck arpeggio, light shaker.
  mystery: { bpm: 96, bars: 4, play(i, bar, t, len) {
    const c = MYSTERY_CHORDS[bar];
    if (i === 0 || i === 8) { kick(t, 0.45); bass(t, 50 + c[0], len * 7, 0.2); }
    if (i % 4 === 2) hat(t, 0.06, 0.05);
    if (i % 2 === 0) { const tones = [c[0], c[1], c[2], c[1] + 12]; pluck(t, 62 + tones[ARP[(i / 2) % 8]], len * 2.2, 0.07, 'triangle'); }
    if (urgent && i % 4 === 0) hat(t, 0.1);
  } },
  // Under a phone call: slow heartbeat over a dark drone, so the voice stays clear.
  suspense: { bpm: 66, bars: 2, drone: [[45, 52], 0.05], play(i, bar, t, len) {
    if (i === 0) kick(t, 0.55, 40);
    if (i === 2) kick(t, 0.35, 40);
    if (i === 8 && bar === 1) tone(t, hz(81), len * 8, 0.025, 'sine', music);
    if (urgent && i % 4 === 0) hat(t, 0.06);
  } },
};

function schedule() {
  if (!ctx || !current || ctx.state !== 'running') return;
  const def = TRACKS[current];
  const len = 60 / (def.bpm * (urgent ? 1.16 : 1) * (1 + intensity * 0.12)) / 4;
  if (next < ctx.currentTime) next = ctx.currentTime + 0.05;
  while (next < ctx.currentTime + 0.12) {
    def.play(step % 16, Math.floor(step / 16) % def.bars, next, len);
    next += len; step = (step + 1) % (16 * def.bars);
  }
}

function startLoop() {
  const c = audio();
  if (!c || !current || !on) return;
  drone?.stop(); drone = null;
  const d = TRACKS[current].drone;
  if (d) drone = startDrone(d[0], d[1]);
  step = 0; next = 0;
  if (!timer) timer = window.setInterval(schedule, 25);
}
function stopLoop() {
  clearInterval(timer); timer = 0;
  drone?.stop(); drone = null;
}

export function playMusic(t: Track | null) {
  if (t === current) return;
  current = t; urgent = false;
  if (!t) intensity = 0;
  if (t) startLoop(); else stopLoop();
}
export const stopMusic = () => playMusic(null);
export function setUrgent(v: boolean) { urgent = v; }
export function setIntensity(v: number) { intensity = Math.max(0, Math.min(1, v)); }
// Lower the music while a voice clip is playing.
export function duck(v: boolean) {
  if (ducked === v || !ctx) { ducked = v; return; }
  ducked = v;
  const t = ctx.currentTime;
  music.gain.cancelScheduledValues(t); music.gain.setValueAtTime(music.gain.value, t);
  music.gain.linearRampToValueAtTime(v ? MUSIC_GAIN * 0.35 : MUSIC_GAIN, t + 0.3);
}

// Background music for as long as the calling screen shows `track`; stops when it unmounts.
export function useMusic(track: Track | null) {
  useEffect(() => { playMusic(track); }, [track]);
  useEffect(() => () => { stopMusic(); stopRing(); duck(false); }, []);
}

// ---------- one-shot effects ----------
export function sfx(kind: Sfx) {
  const c = audio();
  if (!c || !on || c.state !== 'running') return;
  const t = c.currentTime + 0.01;
  switch (kind) {
    case 'right': [76, 83, 88].forEach((m, i) => tone(t + i * 0.07, hz(m), 0.18, 0.22, 'triangle', fx)); break;
    case 'wrong': tone(t, 220, 0.32, 0.25, 'sawtooth', fx, 900, 98); tone(t + 0.02, 233, 0.3, 0.15, 'square', fx, 700, 104); break;
    case 'tick': tone(t, 1760, 0.04, 0.18, 'square', fx, 4000); break;
    case 'coin': tone(t, hz(83), 0.06, 0.18, 'square', fx, 5000); tone(t + 0.06, hz(88), 0.22, 0.18, 'square', fx, 5000); break;
    case 'hurt': burst(t, 0.18, 0.4, 'lowpass', 900, fx); tone(t, 180, 0.25, 0.3, 'sawtooth', fx, 600, 60); break;
    case 'jump': tone(t, 320, 0.13, 0.12, 'square', fx, 2500, 760); break;
    case 'whoosh': burst(t, 0.35, 0.25, 'bandpass', 1200, fx, 2); break;
    case 'tap': tone(t, 900, 0.03, 0.08, 'sine', fx); break;
    case 'win': [72, 76, 79, 84].forEach((m, i) => tone(t + i * 0.11, hz(m), i === 3 ? 0.5 : 0.16, 0.2, 'triangle', fx)); break;
    case 'lose': [67, 63, 60].forEach((m, i) => tone(t + i * 0.18, hz(m), 0.3, 0.18, 'triangle', fx)); break;
    case 'hangup': [0, 1, 2].forEach(i => tone(t + i * 0.32, 425, 0.18, 0.15, 'sine', fx)); break;
  }
}

// A mobile ringtone loop: two quick trills, then a pause. Stops on answer.
export function startRing() {
  stopRing();
  const once = () => {
    const c = audio();
    if (!c || !on || c.state !== 'running') return;
    const t = c.currentTime + 0.02;
    for (let k = 0; k < 2; k++) for (let i = 0; i < 8; i++) tone(t + k * 0.55 + i * 0.05, hz(i % 2 ? 84 : 88), 0.05, 0.11, 'square', fx, 3500);
  };
  once();
  ring = window.setInterval(once, 2000);
}
export function stopRing() { if (ring !== null) { clearInterval(ring); ring = null; } }

// ---------- the on/off switch ----------
export const isSoundOn = () => on;
export function setSoundOn(v: boolean) {
  on = v; save(KEY, v);
  const c = audio();
  if (c) {
    master.gain.setTargetAtTime(v ? 1 : 0, c.currentTime, 0.05);
    if (v) { c.resume().catch(() => {}); if (current) startLoop(); } else { stopLoop(); stopRing(); }
  }
  subs.forEach(f => f());
}
export function useSoundOn() {
  return useSyncExternalStore(f => { subs.add(f); return () => { subs.delete(f); }; }, isSoundOn);
}
