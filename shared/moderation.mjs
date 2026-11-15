// Rule-based moderation for curated posts (Posts / ຂ່າວສານ feed). Same rules run in the backend, the admin app and the tests.
// Output: { decision: 'approve' | 'review' | 'reject', reasons: string[], flags: string[] }.
// Layering: simple keyword/regex rules first (moderate), then an optional AI check that can only make the result stricter (moderateWithAI).
// Docs: docs/MODERATION.md. REVIEW-LO: the Lao keyword lists below need a native-speaker pass.
import WORDS from './moderation-words.json' with { type: 'json' };

export const CORE_TOPICS = ['scam', 'online_fraud', 'trafficking', 'safe_migration', 'child_protection', 'safe_jobs', 'safe_study_abroad', 'financial_safety', 'digital_safety', 'mental_health_online', 'official_hotline_event'];
export const SENSITIVE_TYPES = ['job', 'study'];

// Only sources on this list earn the "Verified source" badge. A name alone counts only when no URL is given.
export const trustedSources = [
  { id: 'lao-gov', names: ['ministry of', 'ກະຊວງ'], domains: ['gov.la'] },
  { id: 'lwu', names: ["lao women's union", 'lao womens union', 'ສະຫະພັນແມ່ຍິງລາວ'], domains: [] },
  { id: 'laotian-times', names: ['laotian times'], domains: ['laotiantimes.com'] },
  { id: 'kpl', names: ['kpl', 'khaosan pathet lao', 'ຂ່າວສານປະເທດລາວ'], domains: ['kpl.gov.la'] },
  { id: 'vientiane-times', names: ['vientiane times'], domains: ['vientianetimes.org.la'] },
  { id: 'unicef-laos', names: ['unicef laos', 'unicef lao'], domains: [] },
  { id: 'iom-laos', names: ['iom laos', 'iom lao pdr', 'iom un migration'], domains: ['laopdr.iom.int'] },
  { id: 'village-focus', names: ['village focus'], domains: ['villagefocus.org'] },
  { id: 'pfha', names: ['pfha', 'promotion of family health association'], domains: [] },
  { id: 'ilo', names: ['ilo', 'international labour organization', 'international labour organisation'], domains: ['ilo.org'] },
];

function hostOf(url) { try { return new URL(url).hostname.toLowerCase().replace(/^www\./, ''); } catch { return ''; } }
export function trustedSourceId({ source_name = '', source_url = '' } = {}) {
  const host = hostOf(source_url);
  if (host) return trustedSources.find(s => s.domains.some(d => host === d || host.endsWith('.' + d)))?.id || null;
  const name = source_name.toLowerCase();
  return trustedSources.find(s => s.names.some(n => (n.length <= 4 ? new RegExp(`\\b${n}\\b`, 'i').test(name) : name.includes(n))))?.id || null;
}
export const isTrustedSource = post => trustedSourceId(post) !== null;

const RX = {
  adult: /\b(porn\w*|xxx|nudes?|escort service|onlyfans|sex\s*(video|chat|tape))\b|ໜັງໂປ|ຮູບເປືອຍ|ວິດີໂອເຊັກ/iu,
  gambling: /\b(casino|gambl\w*|sports ?betting|bet(ting)? (site|app)|slot machines?|online slots?|jackpot|baccarat|lottery)\b|ຄາຊິໂນ|ພະນັນ|ບາຄາຣາ|ຫວຍ|ເກມໄພ່/iu,
  cryptoRich: /\b(crypto\w*|bitcoin|usdt|forex|nft)\b[^.!?\n]{0,60}\b(get rich|guaranteed|double your|passive income|\d{3,}% (profit|return)|easy money|profit)\b|\b(get rich quick|guaranteed (returns?|profit))\b|ຄຣິບໂຕ|ບິດຄອຍ|ຟໍເຣັກ/iu,
  tourism: /\b(tour package|travel deal|holiday (package|deal)|book (your )?(a )?(dream )?(hotel|trip|holiday|vacation|tour)|honeymoon|sightseeing|resort|vacation|visit (beautiful|amazing|lovely))\b|ແພັກເກັດທົວ|ໂຮງແຮມ|ທ່ອງທ່ຽວ/iu,
  shopping: /\b(buy now|shop now|order now|add to cart|flash sale|\d{1,2}% off|promo code|free shipping|limited stock|new arrivals?)\b|ຊື້ດຽວນີ້|ສັ່ງຊື້|ຫຼຸດລາຄາ|ໂປຣໂມຊັນ/iu,
  publicFigure: /\b(prime minister|president|minister|politician|government|party|regime|premier|senator|mp|congress)\b|ນາຍົກ|ລັດຖະບານ|ລັດຖະມົນຕີ|ນັກການເມືອງ|ປະທານປະເທດ/iu,
  mockery: /\b(satire|parody|sarcas\w*|mock(ing|ery)?|roast|lol|lmao|haha+|clown|puppet|joke|useless)\b|🤡|ຕະຫຼົກ|ເຍາະເຍ້ຍ|ຫົວເລາະ/iu,
  partisan: /\b(vote for|campaign for|down with|overthrow|opposition party|support the party|election campaign)\b|ເລືອກຕັ້ງ|ລົ້ມລ້າງ/iu,
  // Categories that always need a person, even when the text reads innocently.
  job: /\b(hiring|now hiring|vacanc(y|ies)|job (offer|opening|vacanc\w+)|recruit(ing|ment)?|apply now|salary|walk-in interview|work abroad)\b|ຮັບສະໝັກ|ຮັບພະນັກງານ|ເງິນເດືອນ|ວຽກຕ່າງປະເທດ/iu,
  study: /\b(study abroad|scholarship|winter camp|summer camp|exchange programme|exchange program|enrol(l)?ment|university admission)\b|ທຶນການສຶກສາ|ຮຽນຕໍ່ຕ່າງປະເທດ|ຮຽນຕໍ່ປະເທດ/iu,
  volunteer: /\b(volunteers?|volunteering)\b|ອາສາສະໝັກ/iu,
  finance: /\b(loan|invest(ment|ing)?|interest rate|high returns?|remittance|money transfer|savings plan)\b|ເງິນກູ້|ລົງທຶນ|ດອກເບ້ຍ|ໂອນເງິນ/iu,
  children: /\b(child|children|kids?|minors?|teen(ager)?s?|under\s?18|school ?students?|students aged)\b|ເດັກ|ນັກຮຽນ|ເຍົາວະຊົນ/iu,
  // Warning / news framing: describes a scam instead of offering something.
  warning: /\b(beware|warning|warns?|scam|scammers?|fraud|fake|phishing|crackdown|trafficking|stay safe|red flags?|don'?t (pay|send|share|trust))\b|ລະວັງ|ຫຼອກລວງ|ສໍ້ໂກງ|ເຕືອນ|ປອມ|ຄ້າມະນຸດ/iu,
  offerCta: /\b(now hiring|we are (hiring|recruiting)|apply (now|today)|contact us|dm us|inbox us|limited seats|register now)\b|ຮັບສະໝັກ|ສົນໃຈຕິດຕໍ່|ສະໝັກດ່ວນ|ລົງທະບຽນ/iu,
};
const CORE_RX = /\b(scams?|scammers?|fraud\w*|phishing|fake|trafficking|trafficked|migrants?|migration|abroad|overseas|exploitation|child (protection|abuse|labour|labor)|hotline|helpline|1362|1533|volunteer|scholarship|study abroad|hiring|vacanc\w+|recruit\w*|salary|job|loan|invest\w*|otp|password|cyber\w*|online safety|digital safety|mental health|harassment|passport|visa|remittance|census|safe (job|migration|study))\b|ສໍ້ໂກງ|ຫຼອກລວງ|ຄ້າມະນຸດ|ຜູ້ເຄື່ອນຍ້າຍ|ແຮງງານ|ຕ່າງປະເທດ|ເດັກ|ສາຍດ່ວນ|ສຸຂະພາບຈິດ|ອາສາສະໝັກ|ທຶນການສຶກສາ|ວຽກ|ເງິນກູ້|ລົງທຶນ|ໜັງສືຜ່ານແດນ|ວີຊ່າ|ອອນລາຍ|ປ້ອງກັນ|ປອດໄພ/iu;

const RED_FLAGS = [
  ['free_visa_flight_fees', /\bfree\s+(visa|flights?|air\s?fares?|tickets?|fees?|tuition|accommodation|insurance)\b|(ຟຣີ|ບໍ່ເສຍຄ່າ)\s*(?:ຄ່າ)?\s*(ວີຊ່າ|ປີ້ຍົນ|ຮຽນ|ທີ່ພັກ|ປະກັນໄພ|ຄ່າຮຽນ)/iu],
  ['upfront_fee', /\b(deposit|registration fee|processing fee|admin fee|pay (first|upfront|in advance)|advance (payment|fee))\b|ມັດຈຳ|ຄ່າລົງທະບຽນ|ຈ່າຍກ່ອນ|ຄ່າທຳນຽມ/iu],
  ['passport_holding', /\b(hold|keep|surrender|hand over|deposit|submit)\b[^.!?\n]{0,25}\bpassports?\b|\bpassports?\b[^.!?\n]{0,25}\b(held|kept|deposit|retained)\b|(ຍຶດ|ເກັບ|ຝາກ)[^\n]{0,15}ໜັງສືຜ່ານແດນ/iu],
  ['whatsapp_telegram_only', null], // computed from contact channels
  ['no_company_address', null],     // computed
  ['unrealistic_pay', null],        // computed
  ['targets_minors', null],         // computed
];
const REDFLAG_NAMES = RED_FLAGS.map(([n]) => n);
export { REDFLAG_NAMES };

const norm = s => String(s ?? '').normalize('NFC');
export const postText = post => norm([post.title_lo, post.title_en, post.summary_lo, post.summary_en, post.title, post.summary, post.text, post.content, post.contentLo, ...(post.tags || [])].filter(Boolean).join('\n'));

function badWords(text) {
  const hits = [];
  for (const w of WORDS.en) if (new RegExp(`(^|[^a-z])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z]|$)`, 'i').test(text)) hits.push(w);
  for (const w of WORDS.lo) if (text.includes(norm(w))) hits.push(w);
  return hits;
}

// Monthly pay in kip above ~30M, or USD above ~2000, is treated as unrealistic for entry-level offers.
function unrealisticPay(text) {
  const clean = text.replace(/(\d)[,.\s](?=\d{3}\b)/g, '$1');
  for (const m of clean.matchAll(/(\d{6,})\s*(?:kip|ກີບ|ກິບ|lak)/giu)) if (Number(m[1]) >= 30_000_000) return true;
  for (const m of clean.matchAll(/(?:\$|usd\s*)\s?(\d{4,})|(\d{4,})\s*(?:usd|\$|dollars)/giu)) if (Number(m[1] || m[2]) >= 2000) return true;
  return /\b(earn|make)\b[^.!?\n]{0,25}\b(fast|quick|easy money|per day)\b|\beasy money\b|ເງິນດີ\s*ງ່າຍ|ລວຍໄວ/iu.test(text);
}
function hasAddress(text) {
  return /\b(address|street|road|branch|village|district|province|located|bokeo|vientiane|luang prabang|savannakhet|pakse)\b|ສະຖານທີ່|ສາຂາ|ບ້ານ|ເມືອງ|ແຂວງ|ນະຄອນ|ຖະໜົນ|ຫ້ອງການ|ສູນ(?:ຝຶກ|ກາງ)|ໂຮງຮຽນ/iu.test(text);
}
function contactIsMessagingOnly(text) {
  const messaging = /\b(whatsapp|telegram|wechat|line id|viber)\b|ວັອດແອັບ|ເທເລແກຣມ/iu.test(text);
  const proper = /@[a-z0-9.-]+\.[a-z]{2,}|\bwww\.|https?:\/\/|\b[\w-]+\.(org|com|gov|int|la)\b|\bphone\b|\btel\b|\bcall\b|ໂທ/iu.test(text);
  return messaging && !proper;
}
function minorAgeTarget(text) {
  for (const m of text.matchAll(/(?:\bages?d?\b|ອາຍຸ)\s*:?\s*(\d{1,2})\s*(?:[-–—~]|to|ຫາ)\s*(\d{1,2})/giu)) if (Number(m[1]) < 18) return true;
  return /\b(under\s?18|minors? (welcome|wanted)|teens? (wanted|needed))\b/i.test(text);
}

function categoriesOf(post, text) {
  const cats = new Set();
  if (post.type === 'job' || RX.job.test(text)) cats.add('job');
  if (post.type === 'study' || RX.study.test(text)) cats.add('study');
  if (RX.volunteer.test(text)) cats.add('volunteer');
  if (RX.finance.test(text)) cats.add('finance');
  return cats;
}

/**
 * @param {object} post  { type?, title_lo, title_en, summary_lo, summary_en, tags?, source_name?, source_url?, shows_minors? } (or title/summary/text)
 * @returns {{decision:'approve'|'review'|'reject', reasons:string[], flags:string[]}}
 */
export function moderate(post) {
  const text = postText(post);
  const reasons = [], flags = [];
  const reject = (flag, reason) => { flags.push(flag); reasons.push(reason); };

  // ---- Hard rejects: harmful or off-topic however the source looks ----
  const bad = badWords(text);
  if (bad.length) reject('profanity', 'Contains insulting or profane language.');
  if (RX.adult.test(text)) reject('adult_content', 'Adult content is not allowed.');
  if (RX.gambling.test(text)) reject('gambling', 'Gambling or casino content is not allowed.');
  if (RX.cryptoRich.test(text)) reject('crypto_get_rich', 'Crypto or get-rich-quick promotion is not allowed.');
  if (RX.publicFigure.test(text) && RX.mockery.test(text)) reject('political_satire', 'Satire or mockery of public figures is not allowed.');
  if (RX.partisan.test(text)) reject('partisan', 'Partisan political content is not allowed.');

  // ---- Soft rejects: promos and off-topic. A core topic alongside them (e.g. a study offer that mentions a trip) goes to review instead. ----
  const core = CORE_RX.test(text);
  if (RX.tourism.test(text)) { if (core) flags.push('tourism_bundled'); else reject('travel_promo', 'Travel and tourism promotion is not allowed.'); }
  if (RX.shopping.test(text)) { if (core) flags.push('shopping_language'); else reject('shopping_ad', 'Shopping or product ads are not allowed.'); }
  if (!core && !reasons.length) reject('off_topic', 'Not related to scams, fraud, trafficking, safe migration, child protection, safe jobs or study, financial or digital safety, online mental health, or official hotlines and events.');
  if (reasons.length) return { decision: 'reject', reasons, flags };

  // ---- Human review ----
  const trusted = isTrustedSource(post);
  if (!trusted) flags.push('unverified_source');
  const cats = categoriesOf(post, text);
  const typed = SENSITIVE_TYPES.includes(post.type);
  // A warning post ("beware of fake job offers") talks about jobs without offering any; an explicit job/study type or an offer call-to-action never gets this exemption.
  const awareness = !typed && ['awareness', 'news', 'event', 'hotline', 'video'].includes(post.type) ? true : (!typed && RX.warning.test(text) && !RX.offerCta.test(text));
  const review = [];
  if (cats.size && !awareness) {
    for (const c of cats) flags.push(`category_${c}`);
    review.push(`Hiring, job, study-abroad, volunteer and finance posts are approved by a person first (${[...cats].join(', ')}).`);
  }
  if (!awareness || typed) {
    const offer = cats.size > 0 || typed;
    if (offer) {
      for (const [name, rx] of RED_FLAGS) if (rx && rx.test(text)) flags.push(name);
      if (unrealisticPay(text)) flags.push('unrealistic_pay');
      if (!hasAddress(text)) flags.push('no_company_address');
      if (contactIsMessagingOnly(text)) flags.push('whatsapp_telegram_only');
      if (minorAgeTarget(text)) flags.push('targets_minors');
    }
  }
  const redFlags = flags.filter(f => REDFLAG_NAMES.includes(f));
  if (redFlags.length) review.push(`Red flags found: ${redFlags.join(', ')}.`);
  // Children: text about them, or an image that shows real minors. Official hotlines from trusted sources are exempt (they identify nobody).
  const hotlineExempt = trusted && post.type === 'hotline';
  if ((RX.children.test(text) || post.shows_minors) && !hotlineExempt) {
    flags.push('involves_children');
    review.push(post.shows_minors ? 'The image shows real minors: check consent and that no child can be identified.' : 'Involves children: a person must review before it is shown.');
  }
  if (post.needs_human_review) review.push('Marked for human review by the curator.');

  const uniqueFlags = [...new Set(flags)];
  if (review.length) return { decision: 'review', reasons: review, flags: uniqueFlags };
  return { decision: 'approve', reasons: [trusted ? 'On-topic post from a trusted source.' : 'On-topic and no rule triggered.'], flags: uniqueFlags };
}

const REJECT_LABELS = ['political_sarcasm', 'satire', 'off_topic'];
/**
 * Layers an AI check on top of moderate(). `check` is async (text) => AI result like backend/safety/checker.mjs checkContent():
 * { verdict: 'approved'|'caution'|'needs_expert', on_topic, labels[], summary }.
 * The AI can only make the outcome stricter, never approve something the rules held back. If it throws, the rule result stands.
 * TODO: wire `check` to checkContent() in backend/safety/checker.mjs once curated posts are screened server-side.
 */
export async function moderateWithAI(post, check) {
  const base = moderate(post);
  if (!check || base.decision === 'reject') return base;
  let ai;
  try { ai = await check(postText(post)); } catch { return { ...base, flags: [...base.flags, 'ai_unavailable'] }; }
  if (!ai) return base;
  const labels = ai.labels || [];
  if (ai.on_topic === false || labels.some(l => REJECT_LABELS.includes(l))) return { decision: 'reject', reasons: [...base.reasons, ai.summary || 'AI check: off-topic or political content.'], flags: [...base.flags, 'ai_reject'] };
  if (ai.verdict && ai.verdict !== 'approved' && base.decision === 'approve') return { decision: 'review', reasons: [...base.reasons, ai.summary || 'AI check asked for a person to review.'], flags: [...base.flags, 'ai_review'] };
  return base;
}
