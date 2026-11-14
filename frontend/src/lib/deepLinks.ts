import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

export type DeepLink =
  | { kind: 'post'; id: string }
  | { kind: 'play' }
  | { kind: 'explore' };

/**
 * Accepts both forms:  sati://post/42  and  https://<site>/post/42  (also /open/post/42).
 * For the custom scheme, URL() puts the first segment in the host, so it is joined back onto the path.
 */
export function parseDeepLink(raw: string): DeepLink | null {
  let url: URL;
  try { url = new URL(raw); } catch { return null; }
  const joined = url.protocol === 'sati:' ? `${url.host}${url.pathname}` : url.pathname;
  const [first, second] = joined.replace(/^\/+/, '').replace(/^open\//, '').split('/').filter(Boolean);
  if (first === 'post' && second && /^[A-Za-z0-9_-]+$/.test(second)) return { kind: 'post', id: second };
  if (first === 'play') return { kind: 'play' };
  if (first === 'explore') return { kind: 'explore' };
  return null;
}

/** Native only. Calls onLink for the link the app was launched with and for every later one. Returns a cleanup. */
export async function listenForDeepLinks(onLink: (link: DeepLink) => void): Promise<() => void> {
  if (!Capacitor.isNativePlatform()) return () => {};
  let last = '';
  const handle = (raw: string) => {
    const link = parseDeepLink(raw);
    if (!link) return;
    const key = JSON.stringify(link);
    // The launch URL can be reported twice (getLaunchUrl and appUrlOpen).
    if (key === last) return;
    last = key; setTimeout(() => { if (last === key) last = ''; }, 1500);
    onLink(link);
  };
  const sub = await App.addListener('appUrlOpen', ({ url }) => handle(url));
  try { const launch = await App.getLaunchUrl(); if (launch?.url) handle(launch.url); } catch { /* none */ }
  return () => { void sub.remove(); };
}
