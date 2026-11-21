// Undo the tricks people use to dodge word lists: case, zero-width characters, look-alike letters, leet, spaced-out letters, emoji.
const ZERO_WIDTH = /[​-‏⁠﻿­͏]/g;
const HOMOGLYPH = { а: 'a', е: 'e', о: 'o', р: 'p', с: 'c', у: 'y', х: 'x', і: 'i', ј: 'j', ѕ: 's', ԁ: 'd', ɡ: 'g', ո: 'n', ν: 'v', ο: 'o', α: 'a', ε: 'e', ι: 'i', κ: 'k', ρ: 'p', τ: 't', υ: 'u', ℓ: 'l', ⅼ: 'l', Ι: 'i', Ο: 'o', Α: 'a', Β: 'b', Ε: 'e', Κ: 'k', Μ: 'm', Ν: 'n', Ρ: 'p', Τ: 't', Χ: 'x', Υ: 'y' };
const LEET = { 0: 'o', 1: 'i', 3: 'e', 4: 'a', 5: 's', 7: 't', 8: 'b', '@': 'a', $: 's', '€': 'e', '¡': 'i' };
const EMOJI_WORDS = [[/🖕/gu, ' fuck you '], [/🍆|🍑/gu, ' sex '], [/🔞/gu, ' adult '], [/💰|💵|💸/gu, ' money '], [/🔫|💣|🔪/gu, ' weapon '], [/🐕|🐶/gu, ' dog '], [/🐷|🐖/gu, ' pig '], [/🐒/gu, ' monkey '], [/🐃|🐂/gu, ' buffalo ']];
const EMOJI = /[\p{Extended_Pictographic}️⃣]/gu;

// Letters spaced out one by one ("s e n d   m o n e y", "p.a.s.s.w.o.r.d") are joined; double spaces mark word breaks.
export function joinSpaced(text) {
  return text.replace(/(?:^|(?<=\s))((?:[a-z0-9][ .\-_*]){2,}[a-z0-9])(?=$|\s|[.,!?])/g, m => m.replace(/[ .\-_*]/g, ''));
}
function base(input) {
  let t = String(input ?? '').normalize('NFKC').replace(ZERO_WIDTH, '');
  for (const [rx, word] of EMOJI_WORDS) t = t.replace(rx, word);
  t = t.replace(EMOJI, ' ');
  t = [...t].map(ch => HOMOGLYPH[ch] ?? ch).join('').toLowerCase();
  return t.replace(/(?<=[a-z0-9])[!|](?=[a-z])/g, 'i');
}
const finish = t => joinSpaced(t).replace(/([a-z])\1{2,}/g, '$1$1').replace(/\s+/g, ' ').trim();
// Leet is undone only inside words that mix letters with digits or symbols, so "2025", "$500" and "020 555 5555" stay numbers.
const unleet = t => t.replace(/[a-z0-9@$€¡]{3,}/g, word => (/[a-z]/.test(word) && /[0-9@$€¡]/.test(word)) ? word.replace(/[0-9@$€¡]/g, c => LEET[c] ?? c) : word);
export const normalize = input => finish(unleet(base(input)));
// Two views, because leet repair can damage honest words ("5g", "3rd"): rules and the classifier see both.
export const views = input => { const b = base(input), plain = finish(b), leeted = finish(unleet(b)); const all = plain === leeted ? [leeted] : [leeted, plain]; return [...new Set([...all, ...all.map(repair)])]; };
// Short tokens for the classifier: words and word pairs, with long numbers and links folded into placeholders.
export function tokens(text) {
  const t = normalize(text)
    .replace(/https?:\/\/\S+|\b(?:bit\.ly|tinyurl\.com|t\.me|wa\.me|cutt\.ly)\/\S+/g, ' urltoken ')
    .replace(/\+?\d[\d ()-]{7,}\d/g, ' phonetoken ')
    .replace(/(?<![a-z])@[a-z0-9_]{3,}/g, ' handletoken ')
    .replace(/\d+/g, ' numtoken ');
  const words = t.match(/[a-z]+(?:'[a-z]+)?|[຀-໿]+|[*]/g) || [];
  const out = [...words];
  for (let i = 0; i < words.length - 1; i++) out.push(words[i] + '_' + words[i + 1]);
  return out;
}

// ---- Typo, mask and stretch repair against a vocabulary ("noody" -> "nobody", "m*ney" -> "money", "weekkk" -> "week") ----
// The vocabulary is the words of the rules plus the words of the TRAINING split (see vocab.mjs), never the holdout.
const deletions = new Map();
let vocab = new Set();
export function setVocabulary(words) {
  vocab = new Set(words); deletions.clear();
  for (const w of vocab) if (w.length >= 5) for (let i = 0; i < w.length; i++) { const d = w.slice(0, i) + w.slice(i + 1); if (!deletions.has(d)) deletions.set(d, w); }
}
const swapped = w => { for (let i = 0; i < w.length - 1; i++) { const t = w.slice(0, i) + w[i + 1] + w[i] + w.slice(i + 2); if (vocab.has(t)) return t; } return null; };
export function repairWord(w) {
  if (!vocab.size || w.length < 4 || vocab.has(w) || /\d/.test(w)) return w;
  if (w.includes('*')) { for (const v of 'aeiouy') { const t = w.replace(/\*/, v); if (vocab.has(t)) return t; } return w; }
  const single = w.replace(/([a-z])\1/g, '$1'); if (vocab.has(single)) return single;
  for (let i = 0; i < w.length; i++) { const t = w.slice(0, i) + w.slice(i + 1); if (vocab.has(t)) return t; } // stretched or doubled letter
  return deletions.get(w) ?? swapped(w) ?? w;
}
export const repair = text => text.replace(/[a-z*]{4,}/g, repairWord);
