import { useSyncExternalStore } from 'react';
import { BANDS as SHARED_BANDS, MAX_INTENSITY, postVisibleToBand } from '../../../shared/bands.mjs';
import type { Band, Post } from '../types';

// One age band for the whole app: Sati Daily, the feed and the assistant all read it from here.
// Only the band id is kept: on this device for guests, and on the account when signed in.
// No birth date or exact age is ever stored or sent. The rules themselves live in shared/bands.mjs,
// which the API uses too, so the server enforces exactly what the app shows.
export type { Band };
export { MAX_INTENSITY };
export const BANDS: Band[] = SHARED_BANDS;
export const DEFAULT_BAND: Band = 'youth';

const KEY = 'sati-age-tier';
const LARGE_KEY = 'sati-large-text';

function readBand(): Band | null {
  try {
    const raw = localStorage.getItem(KEY);
    const v = raw ? JSON.parse(raw) : null;
    if (v === 'kid') return 'kids'; // value saved by the earlier picker
    return BANDS.includes(v) ? v : null;
  } catch { return null; }
}
function readLarge(): boolean | null {
  try { const raw = localStorage.getItem(LARGE_KEY); return raw === null ? null : raw === 'true'; } catch { return null; }
}

// Kept in memory too, so the app still switches bands instantly when storage is blocked.
let band: Band | null = readBand();
let large: boolean | null = readLarge();
const subs = new Set<() => void>();
const emit = () => subs.forEach(fn => fn());
const subscribe = (fn: () => void) => { subs.add(fn); return () => { subs.delete(fn); }; };

export const getBand = (): Band => band ?? DEFAULT_BAND;
export const hasBand = () => band !== null;
export function setBand(next: Band) {
  band = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage unavailable: memory only */ }
  emit();
}
export const useBand = () => useSyncExternalStore(subscribe, getBand);

// Signed in, a band change is saved to the account first (the server may refuse, e.g. leaving Kids without
// the password) and only then applied here. Guests change it on this device only.
type Saver = (next: Band, password?: string) => Promise<void>;
let saver: Saver | null = null;
export const setBandSaver = (fn: Saver | null) => { saver = fn; emit(); };
export const bandSavesToAccount = () => saver !== null;
export const useBandSavesToAccount = () => useSyncExternalStore(subscribe, bandSavesToAccount);
// Leaving Kids on an account needs a parent or guardian to enter the account password.
export const leavingKidsNeedsPassword = (next: Band) => saver !== null && getBand() === 'kids' && next !== 'kids';
export async function changeBand(next: Band, password?: string) {
  if (saver) await saver(next, password);
  setBand(next);
}
export const useHasBand = () => useSyncExternalStore(subscribe, hasBand);

// Larger text is offered to Elders and on by default for them.
export const getLargeText = () => getBand() === 'elder' && (large ?? true);
export function setLargeText(on: boolean) {
  large = on;
  try { localStorage.setItem(LARGE_KEY, String(on)); } catch { /* memory only */ }
  emit();
}
export const useLargeText = () => useSyncExternalStore(subscribe, getLargeText);

// Content tagging. `bands` lists who an item is for; no `bands` means everyone (older content keeps working).
// `essential` marks safety basics (hotlines, how to report, core red flags) that every band sees.
// `intensity` (1–3) is checked against the band's limit whenever an item states it, essential or not.
export type BandTagged = { bands?: Band[]; essential?: boolean; intensity?: 1 | 2 | 3 };
export const fitsBand = (item: BandTagged, b: Band = getBand()) =>
  (!item.intensity || item.intensity <= MAX_INTENSITY[b]) && (!!item.essential || !item.bands || item.bands.includes(b));
export const filterByBand = <T extends BandTagged>(items: T[], b: Band = getBand()) => items.filter(i => fitsBand(i, b));

// Intensity. An item may carry a `gentle` override (same field names) that Kids get instead of the full text.
export function forBand<T extends { gentle?: Partial<T> }>(item: T, b: Band = getBand()): T {
  return b === 'kids' && item.gentle ? { ...item, ...item.gentle } : item;
}

// Feed. The server already filters by band; this repeats the same shared rule so a band switch updates at once.
// Kids: reviewed, intensity-1 posts only, read-only. Elders: up to intensity 2. Youth and adults: everything.
export const postFitsBand = (p: Post, b: Band = getBand()) => postVisibleToBand(p, b);
export const postsForBand = (posts: Post[], b: Band = getBand()) => posts.filter(p => postFitsBand(p, b));
export const postText = (p: Post, lang: 'en' | 'lo', b: Band = getBand()) => {
  if (b === 'kids' && (p.contentKids || p.contentKidsLo)) return lang === 'lo' ? p.contentKidsLo || p.contentKids! : p.contentKids || p.contentKidsLo!;
  return null;
};
// Kids cannot post, comment, repost or message.
export const canInteract = (b: Band = getBand()) => b !== 'kids';
