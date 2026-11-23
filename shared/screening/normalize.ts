// Pure text normalisation for the screening engine. No React, no DOM, no network.

const ZERO_WIDTH = /[​-‍⁠﻿­]/g;
const LAO_TONES = /[່-໋]/g; // ່ ້ ໊ ໋
const LAO_DIGITS = "໐໑໒໓໔໕໖໗໘໙";

/** Canonical Lao spelling: one form for ໜ/ໝ, ຳ, ຫຼ and Lao digits. Used on text, list entries and regex sources alike. */
export function canon(s: string): string {
  let t = s.normalize("NFC").replace(ZERO_WIDTH, "");
  t = t
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[！-～]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)) // full-width ASCII
    .replace(/ຫນ/g, "ໜ")
    .replace(/ຫມ/g, "ໝ")
    .replace(/ຫລ/g, "ຫຼ")
    .replace(/ໍາ/g, "ຳ") // ໍ + າ  ->  ຳ
    .replace(/[໐-໙]/g, (d) => String(LAO_DIGITS.indexOf(d)));
  return t;
}

/** Tone-less key used to match list entries that carry no tone mark. */
export function stripTones(s: string): string {
  return s.replace(LAO_TONES, "").replace(/ໃ/g, "ໄ");
}

export const hasLao = (s: string) => /[຀-໿]/.test(s);
export const hasTone = (s: string) => /[່-໋]/.test(s);
export const isAscii = (s: string) => /^[\x00-\x7f]+$/.test(s);

export interface Doc {
  /** Canonical text, original case (privacy regexes, display). */
  clean: string;
  /** Canonical + lowercase. */
  K: string;
  /** K with Lao tone marks removed (matches tone-less entries). */
  S: string;
  /** For each index in S, the matching index in K (lets negation be judged on the toned text). Absent after removeWords. */
  map?: number[];
}

export function makeDoc(raw: string): Doc {
  const clean = canon(raw);
  const K = clean.toLowerCase();
  let S = "";
  const map: number[] = [];
  for (let i = 0; i < K.length; i++) {
    if (/[\u0EC8-\u0ECB]/.test(K[i])) continue;
    S += K[i] === "ໃ" ? "ໄ" : K[i];
    map.push(i);
  }
  return { clean, K, S, map };
}

/** Replace every occurrence of the given Lao words with a space so that no list entry can match inside them. */
export function removeWords(doc: Doc, words: string[]): Doc {
  if (!words.length) return doc;
  const sorted = [...new Set(words.map((w) => canon(w).toLowerCase()))].sort((a, b) => b.length - a.length);
  const sortedS = sorted.map(stripTones);
  let K = doc.K;
  let S = doc.S;
  for (const w of sorted) if (w) K = K.split(w).join(" ");
  for (const w of sortedS) if (w) S = S.split(w).join(" ");
  return { clean: doc.clean, K, S };
}

// ───────── Latin obfuscation: leetspeak, masks (f*ck), spaced letters (f u c k), stretched letters (fuuuck)

const LEET: Record<string, string> = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "8": "b", "@": "a", "$": "s", "!": "i", "|": "i" };
const MASK = /[*#%_\-.+?]/;

export interface LatinToken {
  /** What the user actually typed (for display and masking). */
  original: string;
  /** Candidate spellings to compare against the word lists. "?" matches any single letter. */
  forms: string[];
}

function collapse(s: string, keep: number): string {
  return s.replace(/([a-z])\1{2,}/g, (_, c) => c.repeat(keep));
}

function formsOf(tok: string): string[] {
  const lower = tok.toLowerCase();
  const forms = new Set<string>([lower]);
  // leet digits / symbols and mask characters, interior only
  let leet = "";
  for (let i = 0; i < lower.length; i++) {
    const c = lower[i];
    const interior = i > 0 && i < lower.length - 1;
    if (interior && MASK.test(c)) leet += "?";
    else if (LEET[c] && (interior || /\d/.test(c))) leet += LEET[c];
    else leet += c;
  }
  forms.add(leet);
  for (const f of [...forms]) {
    forms.add(collapse(f, 1));
    forms.add(collapse(f, 2));
    const all = f.replace(/([a-z])\1+/g, "$1");
    if (all.length >= 4) forms.add(all);
  }
  return [...forms];
}

/** Split Latin text into candidate words, merging runs of 3+ single letters ("f u c k"). */
export function latinTokens(clean: string): LatinToken[] {
  const raw = clean.split(/\s+/).filter(Boolean);
  const stripEdge = (t: string) => t.replace(/^[^a-z0-9@$*#]+|[^a-z0-9*#]+$/gi, "");
  const toks = raw.map(stripEdge).filter((t) => /[a-z]/i.test(t));
  const out: LatinToken[] = [];
  for (let i = 0; i < toks.length; ) {
    let j = i;
    while (j < toks.length && /^[a-z0-9]$/i.test(toks[j])) j++;
    if (j - i >= 3) {
      const merged = toks.slice(i, j).join("");
      out.push({ original: toks.slice(i, j).join(" "), forms: formsOf(merged) });
      i = j;
    } else {
      out.push({ original: toks[i], forms: formsOf(toks[i]) });
      i++;
    }
  }
  return out;
}

/** True if candidate form `f` equals `word`, where "?" in `f` stands for any letter. */
export function formMatches(f: string, word: string): boolean {
  if (f === word) return true;
  if (f.length !== word.length || !f.includes("?")) return false;
  for (let i = 0; i < f.length; i++) if (f[i] !== "?" && f[i] !== word[i]) return false;
  return true;
}

/** Count Latin/Lao letters, marks and digits; used for the "very short" rule. */
export function contentLength(clean: string): number {
  return (clean.match(/[\p{L}\p{M}\p{N}]/gu) ?? []).length;
}
