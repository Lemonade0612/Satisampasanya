import { useSyncExternalStore } from 'react';
import { getBand, useBand } from './band';
import { hasSession, request } from './api';

// Simple mode: the elder app (Home, Check, Learn) instead of the full app shell.
// On by default for the Elder band; anyone can switch it on or off in Profile.
// Saved per account (and per guest) on this phone, and on the account's profile so it follows the person.
const KEY = 'sati-simple-mode';
let account: string | null = null;
const key = () => (account ? `${KEY}:${account}` : KEY);
function read(): boolean | null {
  try { const v = localStorage.getItem(key()); return v === null ? null : v === 'true'; } catch { return memory.get(key()) ?? null; }
}
const memory = new Map<string, boolean>();
const subs = new Set<() => void>();
const notify = () => subs.forEach(fn => fn());
const subscribe = (fn: () => void) => { subs.add(fn); return () => { subs.delete(fn); }; };
const store = (on: boolean) => { memory.set(key(), on); try { localStorage.setItem(key(), String(on)); } catch { /* memory only */ } };

/** Called on every sign-in/out. A value saved on the profile wins over this phone's copy. */
export function setSimpleModeAccount(id: string | null, fromProfile?: boolean) {
  account = id;
  if (id && typeof fromProfile === 'boolean') store(fromProfile);
  notify();
}
export function setSimpleMode(on: boolean) {
  store(on);
  notify();
  if (account && hasSession()) request('/profile', 'PATCH', { simpleMode: on }).catch(() => { /* kept on this phone; synced next time */ });
}
const choice = () => read() ?? memory.get(key()) ?? null;
export const getSimpleMode = () => choice() ?? getBand() === 'elder';
export function useSimpleMode() {
  const band = useBand();
  const c = useSyncExternalStore(subscribe, choice);
  return c ?? band === 'elder';
}

// The family number a Result screen calls. Optional, kept on this phone only; without it the dialler opens empty.
const PHONE_KEY = 'sati-family-phone';
export const getFamilyPhone = () => { try { return localStorage.getItem(PHONE_KEY) || ''; } catch { return ''; } };
export const telLink = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;
