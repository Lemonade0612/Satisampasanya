import type { Lang } from '../types';

// Device text-to-speech, for ENGLISH ONLY. Lao is never spoken by the device: most phones have no Lao voice,
// and a Thai voice reads Lao script wrongly. Lao read-aloud plays recordings instead (lib/useSpeak.ts).
function voiceFor(lang: Lang) {
  if (lang !== 'en') return null;
  try {
    const all = speechSynthesis.getVoices().filter(v => v.lang.toLowerCase().startsWith('en-us'));
    return all.find(v => v.default) ?? all.find(v => /samantha|google|natural/i.test(v.name)) ?? all[0] ?? null;
  } catch { return null; }
}

// Voices load async in Chrome; warm the list so the first call finds them.
try { speechSynthesis.getVoices(); speechSynthesis.addEventListener?.('voiceschanged', () => speechSynthesis.getVoices()); } catch { /* not supported */ }

export const hasVoice = (lang: Lang) => !!voiceFor(lang);

export function stopSpeaking() {
  try { speechSynthesis.cancel(); } catch { /* not supported */ }
}

// Speaks `text` and calls onEnd once it has finished (or straight away if it cannot be spoken),
// so callers can wait for the full sentence instead of cutting it off on a timer.
export function speak(text: string, lang: Lang, onEnd?: () => void, rate = 0.95) {
  const voice = voiceFor(lang);
  if (!voice) { onEnd?.(); return; }
  let done = false;
  const finish = () => { if (!done) { done = true; onEnd?.(); } };
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.voice = voice; u.lang = voice.lang; u.rate = rate;
    u.onend = finish; u.onerror = finish;
    speechSynthesis.speak(u);
    // Some browsers drop onend for long utterances; never leave the game stuck.
    setTimeout(finish, 2500 + text.length * 120);
  } catch { finish(); }
}

// Plays a pre-recorded clip; onEnd runs when it finishes, onFail if the file is missing or cannot play.
// Returns a stop function for cleanup.
export function playClip(url: string, onEnd: () => void, onFail: () => void) {
  const a = new Audio(url);
  let settled = false;
  const once = (fn: () => void) => () => { if (!settled) { settled = true; fn(); } };
  a.onended = once(onEnd);
  a.onerror = once(onFail);
  a.play().catch(once(onFail));
  return () => { settled = true; a.pause(); };
}
