import { INFORM_KEY, NAME_KEY, PHONE_KEY, SEEN_KEY, appendInform, makeInformRecord } from '../../../../shared/family-tell.mjs';

// The family contact lives on this phone only (localStorage). Reads and writes never throw: private mode or a full disk
// just means the number is not remembered.
const get = (k: string) => { try { return localStorage.getItem(k) || ''; } catch { return ''; } };
const set = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* not remembered */ } };

export const getFamilyName = () => get(NAME_KEY);
export const setupSeen = () => get(SEEN_KEY) === '1';
export const markSetupSeen = () => set(SEEN_KEY, '1');
export function saveFamily(name: string, phone: string) { set(PHONE_KEY, phone); set(NAME_KEY, name); markSetupSeen(); }

/** Demo mode: open the app with ?demo (same switch the feed uses) or set sati-demo=1 on the phone. */
export function isDemoMode() {
  try { return new URLSearchParams(location.search).has('demo') || localStorage.getItem('sati-demo') === '1'; } catch { return false; }
}

export function saveInform(category: string, verdict: string) {
  try { appendInform(localStorage, makeInformRecord({ category, verdict })); } catch { /* not saved */ }
}
export const informLogKey = INFORM_KEY;
