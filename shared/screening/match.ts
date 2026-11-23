import { canon, hasLao, hasTone, isAscii, stripTones, type Doc } from "./normalize";

export interface Hit {
  /** Entry from the word list. */
  entry: string;
  /** Text as it appears in the post. */
  text: string;
  start: number;
  end: number;
  /** Preceded by a negation within the same clause ("never pay a deposit"). */
  negated: boolean;
  /** Which text the offsets belong to: K (toned) or S (tone-stripped). */
  space?: "K" | "S";
}

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export interface NegationWords { en: RegExp; lo: string[] }

export function buildNegation(en: string[], lo: string[]): NegationWords {
  const alt = [...en].sort((a, b) => b.length - a.length).map((w) => esc(w).replace(/ /g, "\\s+")).join("|");
  return { en: new RegExp(`(?<![a-z'])(?:${alt})(?![a-z])`, "i"), lo: lo.map((w) => canon(w)) };
}

/** Is the match at `start` preceded by a negation inside the same clause? */
export function isNegated(space: string, start: number, neg: NegationWords): boolean {
  const before = space.slice(Math.max(0, start - 90), start);
  // clause break: sentence punctuation, line break, slash, or an emoji/bullet
  const cut = Math.max(before.lastIndexOf("."), before.lastIndexOf(","), before.lastIndexOf(";"), before.lastIndexOf("!"), before.lastIndexOf("?"), before.lastIndexOf("\n"), before.lastIndexOf(" / "), before.lastIndexOf(":") >= 0 && before.lastIndexOf(":") > before.length - 3 ? before.lastIndexOf(":") : -1);
  const clause = before.slice(cut + 1);
  // "don't miss" / "never miss" are urgency, not a negation of what follows
  const words = clause.replace(/\b(?:never|don't|dont|do not|can't|cannot)\s+miss\b/gi, " ").trim().split(/\s+/).slice(-10).join(" ");
  if (neg.en.test(words)) return true;
  // Lao has no spaces inside a phrase: look at the last Lao phrase only
  const loPhrase = (clause.split(/\s+/).pop() ?? "").slice(-16);
  return loPhrase.length > 0 && neg.lo.some((n) => loPhrase.includes(n));
}

function occurrences(hay: string, needle: string, entry: string, neg: NegationWords, space: "K" | "S", doc: Doc): Hit[] {
  const out: Hit[] = [];
  if (!needle) return out;
  for (let i = hay.indexOf(needle); i !== -1; i = hay.indexOf(needle, i + 1)) {
    out.push({ entry, text: needle, start: i, end: i + needle.length, negated: space === "S" && doc.map ? isNegated(doc.K, doc.map[i], neg) : isNegated(hay, i, neg), space });
  }
  return out;
}

/**
 * Find every entry in the document.
 *  - ASCII entries match whole words/phrases (so "ass" is not inside "class").
 *  - Lao entries carrying a tone mark match the toned text; tone-less Lao entries match the tone-stripped text.
 *  - Other scripts (Thai, Chinese) match as substrings.
 * Overlaps are resolved leftmost-longest so "free robux" does not also count "free".
 */
export function findEntries(entries: string[], doc: Doc, neg: NegationWords): Hit[] {
  const hits: Hit[] = [];
  const seen = new Set<string>();
  for (const entry of entries) {
    if (seen.has(entry)) continue;
    seen.add(entry);
    const key = canon(entry).toLowerCase().trim();
    if (!key) continue;
    if (isAscii(key)) {
      const re = new RegExp(`(?<![a-z0-9])${esc(key).replace(/ /g, "\\s+")}(?![a-z0-9])`.replace(/\(\?!\[a-z0-9\]\)$/, key.endsWith("s") ? "(?![a-z0-9])" : "s?(?![a-z0-9])"), "gi");
      for (const m of doc.K.matchAll(re)) hits.push({ entry, text: m[0], start: m.index!, end: m.index! + m[0].length, negated: isNegated(doc.K, m.index!, neg), space: "K" });
    } else if (hasLao(key)) {
      hits.push(...(hasTone(key) ? occurrences(doc.K, key, entry, neg, "K", doc) : occurrences(doc.S, stripTones(key), entry, neg, "S", doc)));
    } else {
      hits.push(...occurrences(doc.K, key, entry, neg, "K", doc));
    }
  }
  // leftmost-longest, separately per text space (K and S have different offsets)
  hits.sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start));
  const kept: Hit[] = [];
  const lastEnd = { K: -1, S: -1 };
  for (const h of hits) {
    const sp = h.space ?? "K";
    if (h.start >= lastEnd[sp]) { kept.push(h); lastEnd[sp] = h.end; }
  }
  return kept;
}

export function findRegex(patterns: string[], text: string, flags: string, neg?: NegationWords): Hit[] {
  const out: Hit[] = [];
  for (const p of patterns) {
    const re = new RegExp(canon(p), flags.includes("g") ? flags : flags + "g");
    for (const m of text.matchAll(re)) {
      if (!m[0]) continue;
      out.push({ entry: p, text: m[0], start: m.index!, end: m.index! + m[0].length, negated: neg ? isNegated(text, m.index!, neg) : false });
    }
  }
  return out;
}
