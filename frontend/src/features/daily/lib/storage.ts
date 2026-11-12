// Every read and write is guarded: private mode or blocked storage must never break the game.
export function load<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
}
export function save(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable, keep playing */ }
}

// Days follow Vientiane time (UTC+7, no daylight saving), so streaks and the daily pick change at local midnight.
const LAO_OFFSET = 7 * 3600000;
export const laoDay = (offsetDays = 0, now = Date.now()) => new Date(now + LAO_OFFSET + offsetDays * 86400000).toISOString().slice(0, 10);
export const today = () => laoDay();
// Whole days since 1970 in Vientiane time, for "one pick per day" rotations.
export const laoDayNumber = (now = Date.now()) => Math.floor((now + LAO_OFFSET) / 86400000);

// Personal progress belongs to whoever is playing. Signed in: kept per account (still only on this phone).
// Guest: kept per phone, under the plain key. Device settings (sound, voice, speed) are not scoped.
let account: string | null = null;
const CLAIMED = 'sati-daily-claimed';
export function setDailyAccount(id: string | null) {
  account = id;
  // One-time move: progress saved before accounts were separated goes to the first account that signs in here,
  // so an existing player keeps their streak. Later accounts on the same phone start fresh.
  if (id && !load<boolean>(CLAIMED, false)) {
    for (const key of SCOPED) {
      const legacy = load<unknown>(key, null);
      if (legacy !== null && load<unknown>(`${key}:${id}`, null) === null) save(`${key}:${id}`, legacy);
    }
    save(CLAIMED, true);
  }
}
export const PROGRESS_KEY = 'sati-daily-progress', EVENTS_KEY = 'sati-daily-events', LIKES_KEY = 'sati-daily-likes', NUDGE_KEY = 'sati-daily-nudge';
const SCOPED = [PROGRESS_KEY, EVENTS_KEY, LIKES_KEY, NUDGE_KEY];
export const scoped = (key: string) => (account ? `${key}:${account}` : key);
