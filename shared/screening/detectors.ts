import badLo from "./data/badwords.lo.json";
import badEn from "./data/badwords.en.json";
import animals from "./data/animal_insults.json";
import lures from "./data/lures.json";
import political from "./data/political.json";
import trusted from "./data/trusted_domains.json";
import hotlines from "./data/hotlines.json";
import privacy from "./data/privacy_patterns.json";
import tuning from "./data/tuning.json";
import risk from "./data/content_risk.json";
import { buildNegation, findEntries, findRegex, type Hit, type NegationWords } from "./match";
import { canon, contentLength, formMatches, latinTokens, makeDoc, removeWords, stripTones, type Doc } from "./normalize";
import type { FlagHit, FlagId, ScreenMeta } from "./types";

const NEG = buildNegation(tuning.negation_en, tuning.negation_lo);
const NO_NEG: NegationWords = { en: /(?!)/, lo: [] };
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const uniq = (a: string[]) => [...new Set(a)];

const LO_EXCEPTIONS = [...badLo.exceptions, ...tuning.lo_extra_exceptions];
const INSULT_ONLY = new Set(tuning.en_medium_insult_only.map((w) => w.toLowerCase()));
const IGNORE = new Set(tuning.en_ignore);
const EN_PROFANE = uniq([...badEn.high, ...badEn.medium]).filter((w) => !INSULT_ONLY.has(w) && !IGNORE.has(w) && !w.includes(" "));
const THAI = badEn.thai_crossover.filter((w) => !tuning.thai_pronouns_low.includes(w));

const hit = (id: FlagId, matches: string[]): FlagHit | null => (matches.length ? { id, count: matches.length, matches: uniq(matches).length === matches.length ? matches : matches } : null);
const live = (hits: Hit[]) => hits.filter((h) => !h.negated);
const texts = (hits: Hit[]) => hits.map((h) => h.text);

// ───────── Links

export interface LinkInfo { url: string; host: string; kind: "trusted" | "suspicious" | "neutral"; why?: string }

export function extractLinks(clean: string): LinkInfo[] {
  const noEmail = clean.replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, " ");
  const tlds = tuning.bare_domain_tlds.join("|");
  const re = new RegExp(`(?:https?:\\/\\/|www\\.)[^\\s<>"'\\]\\u0E80-\\u0EFF]+|(?<![\\w@.-])(?:[a-z0-9][a-z0-9-]*\\.)+(?:${tlds})(?![a-z0-9-])(?:\\/[^\\s<>"'\\u0E80-\\u0EFF]*)?`, "gi");
  const out: LinkInfo[] = [];
  for (const m of noEmail.matchAll(re)) {
    const url = m[0].replace(/[.,!?;:)\]]+$/, "");
    const http = /^http:\/\//i.test(url);
    const host = url.replace(/^[a-z]+:\/\//i, "").replace(/^[^@/]*@/, "").split(/[/?#:]/)[0].toLowerCase().replace(/^www\./, "");
    if (!host.includes(".")) continue;
    const isHost = (d: string) => host === d || host.endsWith("." + d);
    let kind: LinkInfo["kind"] = "neutral";
    let why: string | undefined;
    const tokens = host.split(/[.-]/);
    if (trusted.shorteners.some(isHost)) { kind = "suspicious"; why = "shortener"; }
    else if (http) { kind = "suspicious"; why = "http"; }
    else if (/(?:^|\.)xn--/.test(host) || /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) { kind = "suspicious"; why = "ip_or_punycode"; }
    else if (trusted.trusted.some(isHost)) kind = "trusted";
    else if (trusted.trusted.some((d) => host.includes(d) || host.includes(d.replace(/\./g, "-")))) { kind = "suspicious"; why = "lookalike"; }
    else if (trusted.suspicious_words_in_domain.some((w) => (w.endsWith("-") ? host.startsWith(w) || host.includes("." + w) : w.includes("-") ? host.includes(w) : tokens.includes(w)))) { kind = "suspicious"; why = "word"; }
    else if (tuning.suspicious_tlds.includes(host.split(".").pop()!)) { kind = "suspicious"; why = "tld"; }
    out.push({ url, host, kind, why });
  }
  return out;
}

// ───────── Privacy

const HOTLINE_RE = new RegExp(`(?<!\\d)(?:${hotlines.allowed_numbers.join("|")})(?!\\d)`, "g");
const PRIVACY: Record<string, string[]> = { ...privacy, ...tuning.privacy_patterns_override } as never;
delete (PRIVACY as Record<string, unknown>)["_note"];

const WORD_DIGITS: Record<string, string> = { ...Object.fromEntries(["ສູນ", "ໜຶ່ງ", "ສອງ", "ສາມ", "ສີ່", "ຫ້າ", "ຫົກ", "ເຈັດ", "ແປດ", "ເກົ້າ"].map((w, i) => [stripTones(canon(w)), String(i)])), ...Object.fromEntries(["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"].map((w, i) => [w, String(i)])) };

/** "ສູນ ສອງ ສູນ ຫ້າ ..." and "zero two zero five ..." read as digits: 7 or more in a row is a number being spelled out. */
function spokenDigits(doc: Doc): string {
  const out: string[] = [];
  let run = "";
  for (const w of doc.S.split(/[\s,.-]+/)) {
    if (WORD_DIGITS[w] !== undefined) run += WORD_DIGITS[w];
    else { if (run.length >= 7) out.push(run); run = ""; }
  }
  if (run.length >= 7) out.push(run);
  return out.join(" ");
}

/** "noy [at] gmail [dot] com" and "noy @ gmail.com" are still email addresses. */
const deobfuscate = (t: string) => t.replace(/\s*[\[(]\s*at\s*[\])]\s*/gi, "@").replace(/\s*[\[(]\s*dot\s*[\])]\s*/gi, ".").replace(/(\w)\s+@\s*(\w)/g, "$1@$2").replace(/(\w)\s*@\s+(\w)/g, "$1@$2");

function privacyFlags(doc: Doc): FlagHit[] {
  const text = (deobfuscate(doc.clean) + " " + spokenDigits(doc)).replace(HOTLINE_RE, " ");
  const out: FlagHit[] = [];
  for (const [id, patterns] of Object.entries(PRIVACY)) {
    const ms: string[] = [];
    for (const p of patterns) {
      const flags = p.startsWith("\\b[A-Z]") ? "gu" : "giu";
      for (const m of text.matchAll(new RegExp(canon(p), flags))) if (m[0]) ms.push(m[0].trim());
    }
    const h = hit(id as FlagId, uniq(ms));
    if (h) out.push(h);
  }
  return out;
}

// ───────── Content

function profanity(doc: Doc, docExc: Doc): Hit[] {
  const hits: Hit[] = [];
  hits.push(...findEntries([...badLo.high, ...badLo.medium], docExc, NO_NEG));
  hits.push(...findEntries(THAI, doc, NO_NEG));
  for (const tok of latinTokens(doc.clean)) {
    const bad = EN_PROFANE.find((w) => tok.forms.some((f) => formMatches(f, w)));
    const sub = !bad && tok.forms.find((f) => tuning.en_substring_ok.some((w) => f.includes(w) && f.length > w.length));
    if (bad || sub) hits.push({ entry: bad ?? String(sub), text: tok.original, start: 0, end: 0, negated: false });
  }
  return hits;
}

function animalInsults(docExc: Doc): string[] {
  const lo = (list: string[], strip: boolean) => [...list].map((w) => (strip ? stripTones(canon(w)) : canon(w))).sort((a, b) => b.length - a.length).map(esc).join("|");
  const out: string[] = [];
  for (const strip of [false, true]) {
    const re = new RegExp(`(?:${lo(animals.insult_prefixes_lo, strip)})(?:ໂຕ)?(?:${lo(animals.lo, strip)})`, "g");
    for (const m of (strip ? docExc.S : docExc.K).matchAll(re)) out.push(m[0]);
  }
  const en = new RegExp(`(?<![a-z])(?:${animals.insult_prefixes_en.map(esc).sort((a, b) => b.length - a.length).join("|")})\\s+(?:(?:a|an|the|such|big|fat|stupid|dirty|ugly|little|filthy|damn)\\s+){0,3}(?:${animals.en.join("|")})s?(?![a-z])`, "gi");
  for (const m of docExc.K.matchAll(en)) out.push(m[0]);
  return out;
}

const TARGET = /\b(?:she|he|her|him|they|them|you|ur|u|your|everyone|this guy|this girl)\b/i;

function bullying(doc: Doc): string[] {
  const out: string[] = [];
  out.push(...texts(findEntries([...risk.bullying.en, ...risk.bullying.lo], doc, NO_NEG)));
  out.push(...texts(findRegex(risk.bullying.en_patterns, doc.K, "i")));
  // insult word aimed at a person
  for (const h of findEntries([...INSULT_ONLY], doc, NO_NEG)) {
    const clause = doc.K.slice(Math.max(0, h.start - 40), h.end + 20);
    if (TARGET.test(clause)) out.push(h.text);
  }
  return out;
}

function political_(doc: Doc, trustedLink: boolean): string[] {
  const d = removeWords(doc, tuning.political_exceptions);
  const terms = texts(findEntries([...political.lo, ...political.en], d, NO_NEG));
  if (!terms.length) return [];
  const sarcasm = texts(findEntries(political.sarcasm_markers, d, NO_NEG));
  if (trustedLink && !sarcasm.length) return [];
  return [...terms, ...sarcasm];
}

// ───────── Lures

const JOB_WEAK = new Set(tuning.job_abroad_weak.map((w) => w.toLowerCase()));
const includesAny = (doc: Doc, list: string[]) => list.some((w) => { const k = canon(w).toLowerCase(); return doc.K.includes(k) || doc.S.includes(stripTones(k)); });

function lureList(key: keyof typeof lures): string[] {
  return [...(lures[key] as string[]), ...(((tuning.lure_extras as Record<string, string[]>)[key]) ?? [])];
}

export interface Detection { flags: FlagHit[]; adviceContext: boolean }

export function detect(text: string, link?: string, meta: ScreenMeta = {}): Detection {
  const full = link ? `${text}\n${link}` : text;
  const doc = makeDoc(full);
  const docExc = removeWords(doc, LO_EXCEPTIONS);
  const flags: FlagHit[] = [];
  const add = (h: FlagHit | null) => { if (h) flags.push(h); };

  // privacy
  const priv = privacyFlags(doc);
  flags.push(...priv);

  // links
  const links = extractLinks(doc.clean);
  const bad = links.filter((l) => l.kind === "suspicious");
  const good = links.filter((l) => l.kind === "trusted");
  add(hit("suspicious_link", bad.map((l) => l.url)));
  const trustedLink = good.length > 0 && bad.length === 0;
  if (trustedLink) add(hit("source_link_provided", good.map((l) => l.url)));

  // content
  add(hit("profanity", texts(profanity(doc, docExc))));
  add(hit("animal_insults", animalInsults(docExc)));
  add(hit("bullying", bullying(doc)));
  add(hit("hate_speech", [...texts(findEntries([...risk.hate_speech.en, ...risk.hate_speech.lo], doc, NO_NEG)), ...texts(findRegex(risk.hate_speech.en_patterns, doc.K, "i"))]));
  add(hit("political_claims", political_(doc, trustedLink)));
  add(hit("dangerous_content", texts(live(findEntries([...risk.dangerous.en, ...risk.dangerous.lo], doc, NEG)))));
  add(hit("sexual_content", texts(findEntries([...risk.sexual.en, ...risk.sexual.lo], doc, NO_NEG))));
  add(hit("misinformation", texts(findEntries([...risk.misinformation.en, ...risk.misinformation.lo], doc, NO_NEG))));

  const noUrls = links.reduce((t, l) => t.replace(l.url, " "), doc.clean);
  const short = contentLength(noUrls) < 15;
  if (short) flags.push({ id: "very_short_content", count: 1, matches: [text.trim()] });
  else if (includesAny(doc, tuning.off_topic_keywords) && !includesAny(doc, tuning.safety_topic_keywords)) {
    add(hit("off_topic", texts(findEntries(tuning.off_topic_keywords, doc, NO_NEG))));
  }

  // lures (negated matches do not count)
  const L: Record<string, Hit[]> = {};
  for (const k of ["free_offer", "urgency", "private_contact", "qr_only", "authority_name", "job_abroad", "money_ask", "emotional_manipulation", "romance_scam"] as const) {
    L[k] = live(findEntries(lureList(k), doc, NEG));
  }
  L.money_ask.push(...live(findRegex(tuning.money_patterns, doc.K, "i", NEG)));
  const cred = live(findRegex(tuning.credential_patterns, doc.K, "i", NEG));
  const traff = live(findEntries([...risk.trafficking_signs.en, ...risk.trafficking_signs.lo], doc, NEG));
  const caps = [...doc.clean.matchAll(/\b[A-Z]{3,}(?:\s+[A-Z]{3,})*\s*!{2,}/g)].map((m) => m[0]);
  const emo = [...texts(L.emotional_manipulation), ...caps];

  // job abroad: a country/zone phrase needs a second signal; weak phrases need two
  const jobStrongHits = L.job_abroad.filter((h) => !JOB_WEAK.has(h.entry.toLowerCase()));
  const jobWeakHits = L.job_abroad.filter((h) => JOB_WEAK.has(h.entry.toLowerCase()));
  const jobPat = live(findRegex(tuning.job_abroad_patterns, doc.K, "i", NEG));
  const salary = findRegex(tuning.salary_patterns, doc.K, "i").length > 0;
  const recruit = includesAny(doc, tuning.recruit_markers);
  const strong = jobStrongHits.length + jobPat.length;
  const co = recruit || salary || jobWeakHits.length > 0 || L.free_offer.length > 0 || L.urgency.length > 0 || L.private_contact.length > 0 || L.money_ask.length > 0 || traff.length > 0 || cred.length > 0;
  const jobFires = (strong > 0 && co) || jobWeakHits.length >= 2;

  // a job or earning pitch with a salary or a private chat: one signal on its own, a second lure when combined with contact
  const earn = findRegex(tuning.earn_patterns, doc.K, "i").length > 0;
  const offer = (recruit || earn || jobWeakHits.length > 0) && (salary || earn || L.private_contact.length > 0);

  // advice/warning posts mention lure words as guidance; they must not ask the reader to contact anyone
  const adviceText = removeWords(doc, ["ຢ່າພາດ"]);
  const advice = includesAny({ ...adviceText, K: adviceText.K.replace(/\b(?:don't|never)\s+miss\b/g, " ") }, tuning.advice_markers)
    && L.private_contact.length === 0 && L.qr_only.length === 0 && cred.length === 0 && !recruit && bad.length === 0 && priv.length === 0;

  const lure = (id: FlagId, hits: Hit[]) => { if (!advice || id === "private_contact" || id === "qr_only") add(hit(id, texts(hits))); };
  lure("free_offer", L.free_offer);
  lure("urgency", L.urgency);
  lure("private_contact", L.private_contact);
  if (!trustedLink) lure("qr_only", L.qr_only);
  if (!trustedLink) lure("authority_name", L.authority_name);
  lure("money_ask", L.money_ask);
  lure("credential_request", cred);
  lure("romance_scam", L.romance_scam);
  lure("trafficking_signs", traff);
  if (offer && !jobFires && !advice) add(hit("job_offer", ["job offer"]));
  if (jobFires) lure("job_abroad", [...jobStrongHits, ...jobPat, ...jobWeakHits]);
  add(hit("emotional_manipulation", emo));

  // positive evidence
  const hot = hotlines.allowed_numbers.filter((n) => new RegExp(`(?<!\\d)${n}(?!\\d)`).test(doc.clean));
  add(hit("hotline_present", uniq(hot)));
  const loLetters = (doc.clean.match(/[\u0E81-\u0EDF]/g) ?? []).length;
  const enLetters = (doc.clean.replace(/https?:\/\/\S+/g, "").match(/[a-z]/gi) ?? []).length;
  if (meta.contentLo || (loLetters >= 12 && enLetters >= 20)) add({ id: "bilingual_content", count: 1, matches: [] });
  if (meta.hasImage) add({ id: "visual_evidence", count: 1, matches: [] });
  const tag = (meta.tags ?? []).find((t) => t && doc.K.includes(t.toLowerCase().replace(/^#/, "")));
  if (tag) add({ id: "tag_relevance", count: 1, matches: [tag] });

  return { flags, adviceContext: advice };
}
