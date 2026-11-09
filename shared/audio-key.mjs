// One name per spoken line, shared by scripts/gen-audio.mjs (which records it) and the app (which plays it).
// The name is a hash of the voice and the exact text, so changing a line's text gives it a new file and the
// old recording can never play against new words. A human recording of a line uses the same name under human/.

export const VOICES = ['woman', 'man'];
export const DEFAULT_VOICE = 'woman';

// Same text however it was typed: Unicode NFC, trimmed, inner whitespace collapsed.
export const normalizeSpoken = text => String(text).normalize('NFC').replace(/\s+/g, ' ').trim();

// cyrb53: small, fast, no crypto API needed in the browser, 53-bit so collisions across a few thousand lines are negligible.
function cyrb53(str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

export const audioKey = (text, voice = DEFAULT_VOICE) =>
  cyrb53(`${voice}\u0001${normalizeSpoken(text)}`).toString(16).padStart(14, '0');

// Manifest values: 1 = generated voice at audio/lo/<key>.mp3, 2 = human recording at audio/lo/human/<key>.mp3.
export const audioPath = (key, kind) => (kind === 2 ? `/audio/lo/human/${key}.mp3` : `/audio/lo/${key}.mp3`);
