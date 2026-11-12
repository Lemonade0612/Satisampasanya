import { useSyncExternalStore } from 'react';
import { getLargeText } from './band';

// App-wide text size, for every age group: 1× / 1.15× / 1.3× of the root font size. Saved on this phone.
export type TextSize = 'normal' | 'large' | 'xlarge';
export const TEXT_SCALE: Record<TextSize, number> = { normal: 1, large: 1.15, xlarge: 1.3 };
const KEY = 'sati-text-size';

function read(): TextSize | null {
  try { const v = localStorage.getItem(KEY); return v === 'normal' || v === 'large' || v === 'xlarge' ? v : null; } catch { return null; }
}
let size: TextSize | null = read();
const subs = new Set<() => void>();
const subscribe = (fn: () => void) => { subs.add(fn); return () => { subs.delete(fn); }; };

// Nothing chosen yet: Elders keep their earlier larger-text default.
export const getTextSize = (): TextSize => size ?? (getLargeText() ? 'large' : 'normal');
export function setTextSize(next: TextSize) {
  size = next;
  try { localStorage.setItem(KEY, next); } catch { /* memory only */ }
  subs.forEach(fn => fn());
}
export const useTextSize = () => useSyncExternalStore(subscribe, getTextSize);
