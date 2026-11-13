import { useSyncExternalStore } from 'react';
import { getBand, useBand } from './band';
import { hasSession, request } from './api';

// Easy mode: the elder app (Home, Check, Learn) instead of the full app shell.
// On by default for the Elder band; anyone can switch it on or off in Profile.
// Saved per account (and per guest) on this phone, and on the account's profile so it follows the person.
const KEY = 'sati-easy-mode';
const OLD_KEY = 'sati-simple-mode'; // renamed; old values are moved over on first read
let account: string | null = null;
const key = () => (account ? `${KEY}:${account}` : KEY);
function read(): boolean | null {
  try {
    let v = localStorage.getItem(key());
    if (v === null) { const old = localStorage.getItem(account ? `${OLD_KEY}:${account}` : OLD_KEY); if (old !== null) { v = old; localStorage.setItem(key(), old); } }
    return v === null ? null : v === 'true';
  } catch { return memory.get(key()) ?? null; }
}
const memory = new Map<string, boolean>();
const subs = new Set<() => void>();
const notify = () => subs.forEach(fn => fn());
const subscribe = (fn: () => void) => { subs.add(fn); return () => { subs.delete(fn); }; };
const store = (on: boolean) => { memory.set(key(), on); try { localStorage.setItem(key(), String(on)); } catch { /* memory only */ } };

/** Called on every sign-in/out. A value saved on the profile wins over this phone's copy. */
export function setEasyModeAccount(id: string | null, fromProfile?: boolean) {
  account = id;
  if (id && typeof fromProfile === 'boolean') store(fromProfile);
  notify();
}
export function setEasyMode(on: boolean) {
  store(on);
  notify();
  if (account && hasSession()) request('/profile', 'PATCH', { easyMode: on }).catch(() => { /* kept on this phone; synced next time */ });
}
const choice = () => read() ?? memory.get(key()) ?? null;
export const getEasyMode = () => choice() ?? getBand() === 'elder';
export function useEasyMode() {
  const band = useBand();
  const c = useSyncExternalStore(subscribe, choice);
  return c ?? band === 'elder';
}

// The family number a Result screen calls. Optional, kept on this phone only; without it the dialler opens empty.
const PHONE_KEY = 'sati-family-phone';
export const getFamilyPhone = () => { try { return localStorage.getItem(PHONE_KEY) || ''; } catch { return ''; } };
export const telLink = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;
