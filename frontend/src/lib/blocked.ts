import { useSyncExternalStore } from 'react';
// People this device has blocked. Kept on the phone only: their posts disappear from the feed and their profile shows as blocked.
const KEY = 'sati-blocked';
const read = (): string[] => { try { const v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v.filter(x => typeof x === 'string') : []; } catch { return []; } };
let list = read(); const subs = new Set<() => void>();
export const isBlocked = (id?: string) => !!id && list.includes(id);
export function setBlocked(id: string, on: boolean) {
  list = on ? [...new Set([...list, id])] : list.filter(x => x !== id);
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* storage blocked */ }
  subs.forEach(f => f());
}
export const useBlocked = () => useSyncExternalStore(f => { subs.add(f); return () => { subs.delete(f); }; }, () => list);
