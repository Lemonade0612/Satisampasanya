// Network checks that need a server: Google Safe Browsing and domain age (RDAP). Both fail soft: a failed or missing check
// becomes a "could not check" line, never an error and never a reason to call something safe.
import { readFileSync } from 'node:fs';
import { combine, verify, makeScorer, OFFICIAL_DOMAINS, SHORTENERS, checkText } from '../shared/verify.mjs';
import { getDomain } from 'tldts';
import { readSafetyConfig } from './safety/model.mjs';

export const RULES = JSON.parse(readFileSync(new URL('../rules/risk-rules.json', import.meta.url), 'utf8'));
export const score = makeScorer(RULES);
export const verifyLocal = text => verify(text, { score });

const sig = (check, result, en, lo, extra = {}) => ({ check, result, detail_en: en, detail_lo: lo, ...extra });
const withTimeout = ms => AbortSignal.timeout(ms);

export async function safeBrowsing(urls, { fetcher = fetch, key = readSafetyConfig().safeBrowsingKey } = {}) {
  if (!urls.length) return [];
  const skip = why => [sig('safe-browsing', 'skip', `Could not check Google Safe Browsing (${why}).`, `ກວດກັບ Google Safe Browsing ບໍ່ໄດ້ (${why}).`)];
  if (!key) return skip('not set up');
  try {
    const response = await fetcher(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${encodeURIComponent(key)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: withTimeout(4000),
      body: JSON.stringify({ client: { clientId: 'sati', clientVersion: '1.0' }, threatInfo: { threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'], platformTypes: ['ANY_PLATFORM'], threatEntryTypes: ['URL'], threatEntries: urls.map(url => ({ url: /^https?:/i.test(url) ? url : 'https://' + url })) } }),
    });
    if (!response.ok) return skip('service unavailable');
    const data = await response.json();
    if (data.matches?.length) return [sig('safe-browsing', 'fail', 'Google Safe Browsing lists this link as dangerous (phishing or malware).', 'Google Safe Browsing ລະບຸວ່າລິ້ງນີ້ອັນຕະລາຍ (ຫຼອກລວງ ຫຼື ມັລແວ).', { strong: true })];
    return [sig('safe-browsing', 'pass', 'Not on the Google Safe Browsing blocklist. This does not prove it is safe, because new scam sites are not listed yet.', 'ບໍ່ຢູ່ໃນບັນຊີດຳຂອງ Google Safe Browsing. ນີ້ບໍ່ໄດ້ພິສູດວ່າປອດໄພ ເພາະເວັບຫຼອກລວງໃໝ່ອາດຍັງບໍ່ຖືກບັນທຶກ.')];
  } catch { return skip('no answer'); }
}

export async function domainAge(domain, { fetcher = fetch, now = Date.now() } = {}) {
  const skip = [sig('domain-age', 'skip', 'Could not check how old the domain is.', 'ກວດອາຍຸຂອງໂດເມນບໍ່ໄດ້.', { subject: domain })];
  try {
    const response = await fetcher(`https://rdap.org/domain/${encodeURIComponent(domain)}`, { signal: withTimeout(3500), headers: { Accept: 'application/rdap+json' } });
    if (!response.ok) return skip;
    const data = await response.json();
    const registered = data.events?.find(e => e.eventAction === 'registration')?.eventDate;
    const time = Date.parse(registered);
    if (!registered || Number.isNaN(time)) return skip;
    const days = Math.floor((now - time) / 864e5);
    if (days < 90) return [sig('domain-age', 'warn', `The domain ${domain} was registered only ${Math.max(days, 0)} days ago. Scam sites are often brand new.`, `ໂດເມນ ${domain} ຈົດທະບຽນໄດ້ພຽງ ${Math.max(days, 0)} ມື້. ເວັບຫຼອກລວງມັກເປັນເວັບໃໝ່.`, { subject: domain })];
    const years = days >= 730 ? `${Math.floor(days / 365)} years` : `${days} days`;
    return [sig('domain-age', 'pass', `The domain ${domain} was registered ${years} ago. Age alone does not prove it is honest.`, `ໂດເມນ ${domain} ຈົດທະບຽນມາແລ້ວ ${days >= 730 ? Math.floor(days / 365) + ' ປີ' : days + ' ມື້'}. ອາຍຸພຽງຢ່າງດຽວບໍ່ໄດ້ພິສູດວ່າຊື່ສັດ.`, { subject: domain })];
  } catch { return skip; }
}

// Local checks plus the network ones, merged and re-scored.
export async function verifyDeep(text, { fetcher = fetch, key, now } = {}) {
  const base = verifyLocal(text);
  if (!base.detected.urls.length) return base;
  const domains = [...new Set(base.detected.urls.map(u => getDomain(u.replace(/^https?:\/\//i, '').split('/')[0]) || '').filter(Boolean))]
    .filter(d => !OFFICIAL_DOMAINS.includes(d) && !SHORTENERS.includes(d)).slice(0, 3);
  const [safe, ...ages] = await Promise.all([safeBrowsing(base.detected.urls.slice(0, 5), { fetcher, key: key ?? readSafetyConfig().safeBrowsingKey }), ...domains.map(d => domainAge(d, { fetcher, now }))]);
  const signals = [...base.signals, ...safe, ...ages.flat()];
  return { ...combine(signals, { trafficking: base.trafficking }), detected: base.detected, hasEvidence: true };
}
