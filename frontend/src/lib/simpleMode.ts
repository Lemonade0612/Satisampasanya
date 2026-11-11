import { useSyncExternalStore } from 'react';
import { getBand, useBand } from './band';

// Simple mode: the two-screen elder app (home + check result) instead of the full app shell.
// On by default for the Elder band; anyone can switch it on or off in Profile. Stored on this device only.
const KEY = 'sati-simple-mode';
function read(): boolean | null {
  try { const v = localStorage.getItem(KEY); return v === null ? null : v === 'true'; } catch { return null; }
}
let choice: boolean | null = read();
const subs = new Set<() => void>();
const subscribe = (fn: () => void) => { subs.add(fn); return () => { subs.delete(fn); }; };

export function setSimpleMode(on: boolean) {
  choice = on;
  try { localStorage.setItem(KEY, String(on)); } catch { /* memory only */ }
  subs.forEach(fn => fn());
}
export const getSimpleMode = () => choice ?? getBand() === 'elder';
export function useSimpleMode() {
  const band = useBand();
  const c = useSyncExternalStore(subscribe, () => choice);
  return c ?? band === 'elder';
}

// The family member Simple mode calls before any money is sent. Kept on this device only.
const PHONE_KEY = 'sati-family-phone';
const ASKED_KEY = 'sati-family-phone-asked';
export const getFamilyPhone = () => { try { return localStorage.getItem(PHONE_KEY) || ''; } catch { return ''; } };
export const familyPhoneAsked = () => { try { return localStorage.getItem(ASKED_KEY) === '1'; } catch { return false; } };
export function saveFamilyPhone(phone: string) {
  try { localStorage.setItem(ASKED_KEY, '1'); if (phone) localStorage.setItem(PHONE_KEY, phone); } catch { /* memory only */ }
}
export const telLink = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;
