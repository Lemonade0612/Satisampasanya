// Age bands: one set of rules for the app (frontend) and the API (backend), so the two cannot drift.
// Only the band is ever stored. A birth year is used on the device to work out the band and then dropped.

export const BANDS = ['kids', 'youth', 'adult', 'elder'];
export const isBand = value => BANDS.includes(value);

// Highest content intensity each band may see.
// 1 spot the fake message, basic online safety, no frightening detail
// 2 money loss, fraud consequences
// 3 trafficking, forced criminality, detailed real-case patterns
export const MAX_INTENSITY = { kids: 1, youth: 3, adult: 3, elder: 2 };

// Intensity implied by a post's topic tags, used when a post does not state its own.
export const TOPIC_INTENSITY = {
  PhishingAlert: 1, OnlineScam: 1, DigitalSafety: 1, SocialMedia: 1, DataPrivacy: 1,
  JobScam: 2, CryptoScam: 2, RomanceScam: 2,
  Trafficking: 3, BorderSafety: 3,
};
const UNKNOWN_TOPIC = 2; // custom hashtags: not shown to Kids until someone tags the post

export function bandForAge(age) {
  if (!Number.isFinite(age) || age < 0 || age > 120) return null;
  return age <= 14 ? 'kids' : age <= 24 ? 'youth' : age <= 59 ? 'adult' : 'elder';
}
// Only the year is asked, so the age can be one year high before this year's birthday. That is fine for a band.
export const bandForBirthYear = (year, now = new Date()) => Number.isInteger(year) ? bandForAge(now.getFullYear() - year) : null;

export function postIntensity(post) {
  if ([1, 2, 3].includes(post.intensity)) return post.intensity;
  const levels = (post.tags || []).map(tag => TOPIC_INTENSITY[tag]).filter(Boolean);
  return levels.length ? Math.max(...levels) : UNKNOWN_TOPIC;
}

// Kids read only posts a reviewer has checked: confirmed scam warnings, or approved after a review.
const reviewedSafe = post => post.state === 'confirmed' || (post.state === 'clean' && !!post.review);

export function postVisibleToBand(post, band) {
  if (!isBand(band)) return true;
  if (postIntensity(post) > MAX_INTENSITY[band]) return false;
  if (Array.isArray(post.bands) && post.bands.length && !post.bands.includes(band) && !post.essential) return false;
  if (band === 'kids' && !reviewedSafe(post)) return false;
  return true;
}

// Kids can read and play, but not post, comment or repost.
export const canPostAsBand = band => band !== 'kids';
