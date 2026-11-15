import { useSyncExternalStore } from 'react';

// Which profile is open. It lives in the URL hash (#/org/<slug>, #/u/<handle>) so a profile is a real page you can link to,
// and the same state drives the layer that opens over the feed when you tap an author on a post.
export type ProfileTarget = { kind: 'org'; slug: string } | { kind: 'user'; handle: string };
const parse = (hash: string): ProfileTarget | null => {
  const org = /^#\/org\/([a-z0-9-]+)/.exec(hash); if (org) return { kind: 'org', slug: org[1] };
  const u = /^#\/u\/(@?[^/?#]+)/.exec(hash); if (u) return { kind: 'user', handle: decodeURIComponent(u[1]).replace(/^@/, '') };
  return null;
};
let current: ProfileTarget | null = typeof location !== 'undefined' ? parse(location.hash) : null;
const subs = new Set<() => void>();
const set = (t: ProfileTarget | null) => { if (JSON.stringify(t) === JSON.stringify(current)) return; current = t; subs.forEach(f => f()); };
if (typeof window !== 'undefined') window.addEventListener('hashchange', () => set(parse(location.hash)));

export const profileHref = (t: ProfileTarget) => (t.kind === 'org' ? `#/org/${t.slug}` : `#/u/${encodeURIComponent(t.handle.replace(/^@/, ''))}`);
export const openProfile = (t: ProfileTarget) => { location.hash = profileHref(t); set(t); };
export const closeProfile = () => { if (parse(location.hash)) history.length > 1 ? history.back() : (location.hash = ''); set(null); };
export const useProfileTarget = () => useSyncExternalStore(f => { subs.add(f); return () => { subs.delete(f); }; }, () => current);
