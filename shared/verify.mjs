// Deterministic checks for the Safety Assistant: links, phone numbers and scam wording.
// Pure JS with no Node-only imports, so the same code runs in the browser (instant verdict) and on the server (adds the network checks).
// Nothing here ever claims certainty: the strongest good result is "looks safe", and absence of evidence is "can't tell".
import { getDomain, getPublicSuffix, getHostname, parse } from 'tldts';
import { ALL_NUMBERS } from './emergency-hotlines.mjs';

// ---- Lists (edit freely) -------------------------------------------------------------------------------------------
export const OFFICIAL_DOMAINS = [
  'google.com', 'facebook.com', 'youtube.com', 'tiktok.com', 'm.me', 'whatsapp.com', 'wa.me', 'wikipedia.org',
  'bcel.com.la', 'ldb.la', 'unicef.org', 'iom.int', 'who.int', 'ilo.org', 'un.org', 'laowu.org.la', 'villagefocus.org', 'pfha.org',
  'gov.la', 'laotiantimes.com',
];
// Domains where any subdomain belongs to the same owner (the registrable domain is what we compare).
export const SHORTENERS = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'is.gd', 'cutt.ly', 'rb.gy', 'ow.ly', 's.id', 'shorturl.at', 'tiny.cc', 'rebrand.ly', 'lnkd.in', 'bl.ink'];
export const RISKY_TLDS = ['xyz', 'top', 'ru', 'click', 'work', 'cc', 'tk', 'ml', 'ga', 'cf', 'gq', 'icu', 'buzz', 'rest', 'link', 'monster', 'cyou', 'sbs'];
export const BAIT_WORDS = ['login', 'log-in', 'signin', 'verify', 'verification', 'gift', 'bonus', 'free', 'prize', 'claim', 'secure', 'account', 'update', 'wallet', 'reward', 'support', 'help', 'official'];
const KNOWN_SHORT = new Set([...ALL_NUMBERS.map(l => l.tel.replace(/\D/g, '')), '1533', '1191', '1195', '1190', '1361']);

const T = (en, lo) => ({ detail_en: en, detail_lo: lo });
const sig = (check, result, en, lo, extra = {}) => ({ check, result, ...T(en, lo), ...extra });

// ---- Extraction ----------------------------------------------------------------------------------------------------
const URL_RE = /\b(?:https?:\/\/|www\.)[^\s<>"'“”]+|\b[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+(?:\/[^\s<>"'“”]*)?/giu;
const trimEnd = s => s.replace(/[)\].,;:!?»”’]+$/u, '');
export function extractUrls(text) {
  const out = [];
  for (const m of text.matchAll(URL_RE)) {
    const raw = trimEnd(m[0]);
    if (/^\d+(\.\d+)*$/.test(raw)) continue;                      // numbers like 1.5 or 20.000
    const host = getHostname(/^https?:/i.test(raw) ? raw : 'https://' + raw);
    if (!host) continue;
    const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(':');
    // Without a scheme, only accept real top-level endings (so "file.txt" and "e.g" are not links).
    if (!isIp && !(raw.includes('://') || raw.toLowerCase().startsWith('www.')) && !(parse(host).isIcann && parse(host).domain)) continue;
    if (!out.includes(raw)) out.push(raw);
  }
  return out;
}
export function extractPhones(text) {
  const out = [];
  for (const m of text.matchAll(/(?<![\w./@-])\+?\d[\d\s().-]{2,14}\d(?![\w@])/gu)) {
    const digits = m[0].replace(/\D/g, '');
    if (digits.length < 3 || /^\d{4}$/.test(digits) && Number(digits) > 1900 && Number(digits) < 2100) continue; // a year
    if (digits.length < 7 && !KNOWN_SHORT.has(digits)) continue;
    if (!out.some(p => p.digits === digits)) out.push({ raw: m[0].trim(), digits, plus: m[0].trim().startsWith('+') });
  }
  return out;
}

// ---- Look-alike detection ------------------------------------------------------------------------------------------
export function levenshtein(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0]; row[0] = i;
    for (let j = 1; j <= b.length; j++) { const tmp = row[j]; row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = tmp; }
  }
  return row[b.length];
}
// Digits and symbols that scammers swap for letters: g00gle, faceb00k, paypa1.
const SWAPS = { 0: 'o', 1: 'l', 3: 'e', 4: 'a', 5: 's', 7: 't', 8: 'b', '@': 'a', $: 's' };
export const deswap = s => s.replace(/[013457 8@$]/g, c => SWAPS[c] ?? c).replace(/rn/g, 'm').replace(/vv/g, 'w');
const nameOf = domain => { const suffix = getPublicSuffix(domain); return suffix ? domain.slice(0, domain.length - suffix.length - 1) : domain; };

// Returns {kind, brand} when `domain` imitates an official one, otherwise null.
export function lookalike(domain, official = OFFICIAL_DOMAINS) {
  if (official.includes(domain)) return null;
  const name = nameOf(domain), flat = deswap(name), tokens = flat.split(/[-.]/).filter(Boolean);
  for (const real of official) {
    const brand = nameOf(real).split('.')[0];
    if (brand.length < 3) continue;
    const swapped = flat !== name;
    if (tokens.includes(brand) || (brand.length >= 5 && flat.includes(brand))) return { kind: swapped ? 'digit-swap' : 'extra-words', brand: real };
    if (brand.length >= 5 && tokens.some(t => t.length >= 4 && levenshtein(t, brand) <= (brand.length >= 7 ? 2 : 1) && t !== brand)) return { kind: 'typo', brand: real };
    if (domain.length >= 7 && levenshtein(domain, real) <= 2) return { kind: 'typo', brand: real };
  }
  return null;
}

// ---- One link ------------------------------------------------------------------------------------------------------
export function checkUrl(raw) {
  const signals = [];
  let parsed; const hadScheme = /^https?:\/\//i.test(raw);
  try { parsed = new URL(hadScheme ? raw : 'https://' + raw.replace(/^www\./i, 'www.')); } catch { return { url: raw, domain: '', signals: [sig('link', 'warn', 'This link is not written in a valid way.', 'ລິ້ງນີ້ຂຽນບໍ່ຖືກຮູບແບບ.', { weak: true })] }; }
  const host = parsed.hostname.toLowerCase();
  const domain = getDomain(host) || host;
  const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(':');
  const tld = getPublicSuffix(host)?.split('.').pop() || '';
  const official = OFFICIAL_DOMAINS.includes(domain);
  let fake = false;

  if (isIp) { signals.push(sig('ip-address', 'fail', 'The link uses a number (IP address) instead of a website name.', 'ລິ້ງໃຊ້ຕົວເລກ (IP) ແທນຊື່ເວັບໄຊ.', { strong: true })); fake = true; }
  if (host.includes('xn--')) { signals.push(sig('punycode', 'fail', 'The name uses hidden special characters (xn--) that can imitate a real site.', 'ຊື່ໃຊ້ຕົວອັກສອນພິເສດທີ່ເຊື່ອງໄວ້ (xn--) ເຊິ່ງອາດລອກເລີຍເວັບແທ້.', { strong: true })); fake = true; }
  if (SHORTENERS.includes(domain)) signals.push(sig('shortener', 'warn', `${domain} is a link shortener, so we can't see where it really goes.`, `${domain} ເປັນລິ້ງສັ້ນ ເຮົາຈຶ່ງເບິ່ງບໍ່ເຫັນວ່າມັນໄປຫາໃສແທ້.`, { weak: true }));
  else if (!isIp) {
    // "facebook.com.secure-login.ru": an official name used only as a subdomain of another site.
    const trick = OFFICIAL_DOMAINS.find(real => host !== real && !official && (host.includes(real + '.') || host.endsWith('.' + real + '.' + domain)));
    if (trick && !official) { signals.push(sig('subdomain-trick', 'fail', `The real domain is ${domain}. "${trick}" only appears in front of it as a trick.`, `ໂດເມນຈິງແມ່ນ ${domain}. “${trick}” ເປັນພຽງຊື່ທີ່ຖືກໃສ່ໄວ້ໜ້າເພື່ອຫຼອກ.`, { strong: true })); fake = true; }
    const like = !fake && lookalike(domain);
    if (like) { signals.push(sig('lookalike', 'fail', `${domain} imitates ${like.brand} (${like.kind === 'digit-swap' ? 'letters swapped for digits' : like.kind === 'typo' ? 'almost the same spelling' : 'official name plus extra words'}), but it is a different site.`, `${domain} ລອກຊື່ ${like.brand} (${like.kind === 'digit-swap' ? 'ປ່ຽນຕົວອັກສອນເປັນຕົວເລກ' : like.kind === 'typo' ? 'ສະກົດເກືອບຄືກັນ' : 'ຊື່ແທ້ບວກຄຳເພີ່ມ'}) ແຕ່ເປັນເວັບອື່ນ.`, { strong: true })); fake = true; }
    if (official) signals.push(sig('official-domain', 'pass', `The domain is ${domain}, which matches an official site on our list.`, `ໂດເມນແມ່ນ ${domain} ກົງກັບເວັບທາງການໃນລາຍການຂອງເຮົາ.`, { positive: 'official' }));
    else if (!fake) signals.push(sig('official-domain', 'skip', `${domain} is not on our list of official sites, so we can't confirm who owns it.`, `${domain} ບໍ່ຢູ່ໃນລາຍການເວັບທາງການຂອງເຮົາ ຈຶ່ງຢືນຢັນເຈົ້າຂອງບໍ່ໄດ້.`));
    const bait = !official && BAIT_WORDS.filter(w => host.split(/[.-]/).includes(w) || nameOf(domain).includes(w));
    if (bait?.length && !fake) signals.push(sig('bait-words', 'warn', `The name contains bait words (${bait.slice(0, 3).join(', ')}).`, `ຊື່ມີຄຳລໍ້ລວງ (${bait.slice(0, 3).join(', ')}).`));
    if (RISKY_TLDS.includes(tld) && !official) signals.push(sig('risky-ending', 'warn', `The ending .${tld} is often used by scam sites.`, `ຕົວຈົບ .${tld} ມັກຖືກໃຊ້ໂດຍເວັບຫຼອກລວງ.`, { weak: fake }));
  }
  if (parsed.protocol === 'http:') signals.push(sig('https', 'warn', 'The link uses http, not https, so the connection is not encrypted.', 'ລິ້ງໃຊ້ http ບໍ່ແມ່ນ https ການເຊື່ອມຕໍ່ຈຶ່ງບໍ່ຖືກເຂົ້າລະຫັດ.', { weak: official }));
  else if (official) signals.push(sig('https', 'pass', 'The link uses https. This only means the connection is private, not that the site is honest.', 'ລິ້ງໃຊ້ https. ນີ້ໝາຍເຖິງການເຊື່ອມຕໍ່ເປັນສ່ວນຕົວເທົ່ານັ້ນ ບໍ່ໄດ້ໝາຍຄວາມວ່າເວັບນັ້ນຊື່ສັດ.'));
  return { url: raw, host, domain, official, signals };
}

// ---- Phone numbers -------------------------------------------------------------------------------------------------
export function checkPhone(p, text = '') {
  const d = p.digits, jobWords = /\b(job|work|hiring|vacancy|recruit|salary|apply|scholarship)\b|ວຽກ|ສະໝັກ|ເງິນເດືອນ|ຮັບສະໝັກ|ທຶນຮຽນ/iu.test(text);
  const hotline = ALL_NUMBERS.find(l => l.tel.replace(/\D/g, '') === d) || (KNOWN_SHORT.has(d) ? { name: { en: 'a known hotline', lo: 'ສາຍດ່ວນທີ່ຮູ້ຈັກ' } } : null);
  if (hotline) return [sig('phone', 'pass', `${p.raw} matches ${hotline.name.en}, a hotline on Sati's list.`, `${p.raw} ກົງກັບ ${hotline.name.lo} ເຊິ່ງຢູ່ໃນລາຍການສາຍດ່ວນຂອງ Sati.`, { positive: 'hotline' })];
  const local = d.replace(/^856/, '').replace(/^0/, '');
  const lao = /^(20\d{8}|30\d{7}|21\d{6})$/.test(local) && (p.plus ? d.startsWith('856') : d.startsWith('0') || d.startsWith('856'));
  if (lao) return [sig('phone', 'skip', `${p.raw} has a valid Lao number format (+856 / 020 / 030), but a valid format does not show who owns it.`, `${p.raw} ມີຮູບແບບເບີລາວທີ່ຖືກຕ້ອງ (+856 / 020 / 030) ແຕ່ຮູບແບບທີ່ຖືກຕ້ອງບໍ່ໄດ້ບອກວ່າໃຜເປັນເຈົ້າຂອງ.`)];
  if (p.plus || d.length >= 10) return [sig('phone', jobWords ? 'warn' : 'skip', jobWords ? `${p.raw} is a foreign number in a job message. Local employers usually use Lao numbers.` : `${p.raw} is not a Lao number.`, jobWords ? `${p.raw} ເປັນເບີຕ່າງປະເທດໃນຂໍ້ຄວາມຮັບສະໝັກວຽກ. ນາຍຈ້າງໃນລາວມັກໃຊ້ເບີລາວ.` : `${p.raw} ບໍ່ແມ່ນເບີລາວ.`)];
  return [sig('phone', 'skip', `We could not recognise ${p.raw} as a Lao number.`, `ເຮົາບໍ່ຮູ້ຈັກ ${p.raw} ວ່າເປັນເບີລາວ.`)];
}

// ---- Wording -------------------------------------------------------------------------------------------------------
// Same scoring as backend/riskScore.mjs, but takes the rules as an argument so the browser can use it too.
export function makeScorer(RULES) {
  const compile = list => (list || []).map(s => new RegExp(s, 'iu'));
  const compiled = new Map(RULES.rules.map(r => [r.id, { patterns: compile(r.patterns), unless: compile(r.unless) }]));
  const aware = compile(RULES.awareness_markers);
  return text => {
    const warning = aware.some(p => p.test(text)), hits = []; let score = 0, hardRed = false;
    for (const rule of RULES.rules) {
      const { patterns, unless } = compiled.get(rule.id);
      if (rule.requires_rule && !hits.some(h => h.rule === rule.id || h.rule === rule.requires_rule)) continue;
      if (!patterns.some(p => p.test(text)) || unless.some(p => p.test(text))) continue;
      const soften = warning && rule.category === 'scam';
      hits.push({ rule: rule.id, en: rule.reason.en, lo: rule.reason.lo, strong: rule.hard_red && !soften });
      if (rule.hard_red && !soften) hardRed = true;
      score += soften ? Math.floor(rule.weight * 0.4) : rule.weight;
    }
    return { score, hardRed, hits, level: hardRed || score >= RULES.thresholds.red ? 'red' : score >= RULES.thresholds.yellow ? 'yellow' : 'green' };
  };
}
const TRAFFICKING_RULES = new Set(['passport_holding', 'minors_no_guardian', 'overseas_no_license', 'casino_sez_cs', 'free_bundle']);
const TRAFFICKING_WORDS = /\btraffick|smuggl|forced labou?r|held against|can'?t leave|passport (was )?taken|ຄ້າມະນຸດ|ຖືກບັງຄັບ|ຖືກກັກ|ຍຶດໜັງສືຜ່ານແດນ/iu;
// Small additions for what people paste into the assistant (not whole posts): "free visa" next to a job offer.
const FREE_VISA_JOB = [/free\s+visa/iu, /ວີຊາ\s*ຟຣີ/iu], JOB = /\b(job|work|hiring|vacancy|salary|apply|abroad|overseas)\b|ວຽກ|ເງິນເດືອນ|ຕ່າງປະເທດ|ສະໝັກ/iu;

export function checkText(text, score) {
  const signals = []; let trafficking = TRAFFICKING_WORDS.test(text);
  if (score) {
    const r = score(text);
    for (const h of r.hits) { signals.push(sig('message-wording', h.strong ? 'fail' : 'warn', h.en, h.lo, { strong: h.strong })); if (TRAFFICKING_RULES.has(h.rule)) trafficking = true; }
    if (!r.hits.length && r.level === 'yellow') signals.push(sig('message-wording', 'warn', 'The wording has several features common in scam messages.', 'ຂໍ້ຄວາມມີລັກສະນະຫຼາຍຢ່າງທີ່ພົບໃນຂໍ້ຄວາມຫຼອກລວງ.'));
  }
  if (FREE_VISA_JOB.some(p => p.test(text)) && JOB.test(text) && !signals.some(s => s.check === 'message-wording' && s.result === 'fail')) {
    signals.push(sig('message-wording', 'fail', 'A job offer with a "free visa" is a classic scam sign. Real visas are not free.', 'ການສະເໜີວຽກທີ່ມີ “ວີຊາຟຣີ” ເປັນສັນຍານຫຼອກລວງທີ່ພົບເລື້ອຍ. ວີຊາແທ້ບໍ່ແມ່ນຟຣີ.', { strong: true })); trafficking = true;
  }
  return { signals, trafficking };
}

// ---- Putting it together -------------------------------------------------------------------------------------------
const ACTIONS = {
  red: { en: ['Do not click, pay, reply or share any personal details.', 'Do not send OTP codes, ID or passport photos.', 'Show it to a trusted adult or call a hotline below before doing anything.'], lo: ['ຢ່າກົດລິ້ງ, ຈ່າຍເງິນ, ຕອບກັບ ຫຼື ສົ່ງຂໍ້ມູນສ່ວນຕົວ.', 'ຢ່າສົ່ງລະຫັດ OTP, ຮູບບັດປະຈຳຕົວ ຫຼື ໜັງສືຜ່ານແດນ.', 'ໃຫ້ຄົນທີ່ໄວ້ໃຈເບິ່ງ ຫຼື ໂທສາຍດ່ວນລຸ່ມນີ້ກ່ອນເຮັດຫຍັງ.'] },
  yellow: { en: ['Pause before you click or pay anything.', "Find the organisation's official website or phone number yourself and contact them there.", 'Ask a trusted adult to look at it with you.'], lo: ['ຢຸດຄິດກ່ອນກົດ ຫຼື ຈ່າຍເງິນ.', 'ຊອກຫາເວັບໄຊ ຫຼື ເບີໂທທາງການຂອງອົງການນັ້ນເອງ ແລ້ວຕິດຕໍ່ຜ່ານບ່ອນນັ້ນ.', 'ໃຫ້ຜູ້ໃຫຍ່ທີ່ໄວ້ໃຈເບິ່ງນຳ.'] },
  green: { en: ['Still type the address yourself or use the official app when you share personal details.', 'Never share OTP codes, even on a real site.'], lo: ['ເມື່ອຕ້ອງໃສ່ຂໍ້ມູນສ່ວນຕົວ ໃຫ້ພິມທີ່ຢູ່ເອງ ຫຼື ໃຊ້ແອັບທາງການ.', 'ຢ່າບອກລະຫັດ OTP ເຖິງແມ່ນຢູ່ໃນເວັບແທ້.'] },
  unknown: { en: ['Do not click or pay until you know who is behind it.', "Search for the organisation's official page and compare.", 'Ask a trusted adult, or ask Sati about the exact words.'], lo: ['ຢ່າກົດ ຫຼື ຈ່າຍເງິນ ຈົນກວ່າຈະຮູ້ວ່າໃຜຢູ່ເບື້ອງຫຼັງ.', 'ຄົ້ນຫາໜ້າທາງການຂອງອົງການນັ້ນ ແລ້ວປຽບທຽບ.', 'ຖາມຜູ້ໃຫຍ່ທີ່ໄວ້ໃຈ ຫຼື ຖາມ Sati ກ່ຽວກັບຂໍ້ຄວາມຕົວຈິງ.'] },
};
const CONF_REASON = {
  high_red: ['At least one strong warning sign was found.', 'ພົບສັນຍານເຕືອນທີ່ຊັດເຈນຢ່າງໜ້ອຍໜຶ່ງຢ່າງ.'],
  high_green: ['The address matches an official site on our list.', 'ທີ່ຢູ່ກົງກັບເວັບທາງການໃນລາຍການຂອງເຮົາ.'],
  medium: ['Some warning signs were found, but they are not conclusive.', 'ພົບສັນຍານເຕືອນບາງຢ່າງ ແຕ່ຍັງບໍ່ແນ່ນອນ.'],
  low_yellow: ["We can't see everything about this, so treat it with care.", 'ເຮົາເຫັນຂໍ້ມູນບໍ່ຄົບ ຈຶ່ງຄວນລະວັງ.'],
  low_unknown: ['Nothing we can check either way.', 'ບໍ່ມີຫຍັງທີ່ເຮົາກວດໄດ້ທັງສອງທາງ.'],
  medium_green: ['It matches a known hotline, but we only compared the number.', 'ກົງກັບສາຍດ່ວນທີ່ຮູ້ຈັກ ແຕ່ເຮົາປຽບທຽບແຕ່ເບີເທົ່ານັ້ນ.'],
};

// Level and confidence from a flat list of signals. Used again after the network checks add theirs.
export function combine(signals, { trafficking = false } = {}) {
  const fails = signals.filter(s => s.result === 'fail'), warns = signals.filter(s => s.result === 'warn');
  let level, confidence, key;
  if (fails.length) { level = 'red'; confidence = fails.some(s => s.strong) ? 'high' : 'medium'; key = confidence === 'high' ? 'high_red' : 'medium'; }
  else if (warns.length) { level = 'yellow'; confidence = warns.every(s => s.weak) ? 'low' : 'medium'; key = confidence === 'low' ? 'low_yellow' : 'medium'; }
  else if (signals.some(s => s.positive === 'official')) { level = 'green'; confidence = 'high'; key = 'high_green'; }
  else if (signals.some(s => s.positive === 'hotline')) { level = 'green'; confidence = 'medium'; key = 'medium_green'; }
  else { level = 'unknown'; confidence = 'low'; key = 'low_unknown'; }
  return {
    level, confidence, confidenceReason: { en: CONF_REASON[key][0], lo: CONF_REASON[key][1] }, signals,
    actions: ACTIONS[level], showHotlines: level === 'yellow' || level === 'red' || trafficking, trafficking,
  };
}

// What is in the message at all? Decides whether the answer is a verdict card or just a chat reply.
export function detect(text) { return { urls: extractUrls(text), phones: extractPhones(text) }; }

export function verify(text, { score } = {}) {
  const found = detect(text), signals = [];
  for (const raw of found.urls) { const r = checkUrl(raw); signals.push(...r.signals.map(s => ({ ...s, subject: r.domain || raw }))); }
  for (const p of found.phones) signals.push(...checkPhone(p, text));
  const words = checkText(text, score); signals.push(...words.signals);
  const result = combine(signals, { trafficking: words.trafficking });
  return { ...result, detected: { urls: found.urls, phones: found.phones.map(p => p.raw) }, hasEvidence: signals.length > 0 || found.urls.length > 0 };
}

// Replaces over-confident wording in AI text. The card never uses these phrases; this guards the streamed explanation.
export function sanitizeClaims(text) {
  return text
    .replace(/\b100\s*%\s*(safe|sure|certain|real|legit(imate)?|genuine|secure)\b/giu, 'looks $1')
    .replace(/\b(definitely|certainly|absolutely|guaranteed)\s+(safe|real|genuine|legit(imate)?|secure|true)\b/giu, 'likely $2')
    .replace(/100\s*%\s*(ປອດໄພ|ແທ້|ຖືກຕ້ອງ|ໝັ້ນໃຈ)/gu, 'ເບິ່ງຄືວ່າ$1')
    .replace(/\b100\s*%/gu, 'fully');
}
