import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import { mixPage } from '../lib/feedMix';
import type { Post } from '../types';

type Tab = 'foryou' | 'following';
export const POLL_MS = 60_000;
const memory = new Map<string, Post[]>();
const cacheKey = (k: string) => `sati-feed:${k}`;
// The last page is kept in memory and localStorage so the feed shows at once, then revalidates. Storage can be full or blocked.
const readCache = (k: string): Post[] => {
  if (memory.has(k)) return memory.get(k)!;
  try { const v = JSON.parse(localStorage.getItem(cacheKey(k)) || '[]'); return Array.isArray(v) ? v : []; } catch { return []; }
};
const writeCache = (k: string, posts: Post[]) => {
  memory.set(k, posts);
  try { localStorage.setItem(cacheKey(k), JSON.stringify(posts.filter(p => !p.image || p.image.length < 20000))); } catch { /* quota */ }
};

// Cursor-paged home feed: first page (cached, then revalidated), infinite scroll, and a 60 s "new posts" check
// that pauses while the tab is hidden.
export function useFeedPages(tab: Tab, band: string, enabled: boolean, userId?: string) {
  const key = `${tab}:${band}:${userId ?? 'guest'}`;
  const [items, setItems] = useState<Post[]>(() => (enabled ? readCache(key) : []));
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>(items.length ? 'ok' : 'loading');
  const [error, setError] = useState('');
  const [cursor, setCursor] = useState<string | null>(null);
  const [pending, setPending] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const newest = useRef<string | null>(null), gen = useRef(0), busy = useRef(false), cur = useRef<string | null>(null), shown = useRef<Post[]>([]);
  shown.current = items; cur.current = cursor;

  const revalidate = useCallback(async (manual = false) => {
    const g = ++gen.current;
    if (manual) setRefreshing(true);
    try {
      const r = await api.feed({ tab });
      if (g !== gen.current) return;
      setItems(r.posts); setCursor(r.nextCursor); newest.current = r.newestId; setPending([]); setStatus('ok'); setError('');
      writeCache(key, r.posts);
    } catch (e) {
      if (g !== gen.current) return;
      setError((e as Error).message); setStatus(s => (shown.current.length ? 'ok' : 'error'));
    } finally { if (g === gen.current) setRefreshing(false); }
  }, [tab, key]);

  useEffect(() => {
    if (!enabled) return;
    const cached = readCache(key);
    setItems(cached); setCursor(null); setPending([]); newest.current = cached.find(p => !p.pinned)?.id ?? null;
    setStatus(cached.length ? 'ok' : 'loading'); setError('');
    void revalidate();
  }, [key, enabled, revalidate]);

  // Poll for newer posts every 60 s while the tab is visible.
  useEffect(() => {
    if (!enabled) return;
    const check = async () => {
      if (document.visibilityState !== 'visible' || !newest.current || busy.current) return;
      try {
        const r = await api.feed({ tab, since: newest.current });
        const have = new Set(shown.current.map(p => p.id));
        const fresh = r.posts.filter(p => !have.has(p.id));
        if (fresh.length) setPending(prev => { const ids = new Set(prev.map(p => p.id)); return [...fresh.filter(p => !ids.has(p.id)), ...prev]; });
      } catch { /* the next tick tries again */ }
    };
    let timer: ReturnType<typeof setInterval> | undefined;
    const start = () => { if (!timer) timer = setInterval(check, POLL_MS); };
    const stop = () => { if (timer) { clearInterval(timer); timer = undefined; } };
    const onVis = () => { if (document.visibilityState === 'visible') { start(); void check(); } else stop(); };
    document.addEventListener('visibilitychange', onVis);
    if (document.visibilityState === 'visible') start();
    return () => { document.removeEventListener('visibilitychange', onVis); stop(); };
  }, [tab, enabled]);

  const loadMore = useCallback(async () => {
    if (!cur.current || busy.current) return;
    busy.current = true; setLoadingMore(true);
    try {
      const r = await api.feed({ tab, cursor: cur.current });
      const have = new Set(shown.current.map(p => p.id));
      const page = mixPage(r.posts.filter(p => !have.has(p.id)), shown.current);
      setItems(prev => [...prev, ...page]); setCursor(r.nextCursor);
    } catch (e) { setError((e as Error).message); }
    finally { busy.current = false; setLoadingMore(false); }
  }, [tab]);

  // Shows the waiting posts at the top. Returns how many were added.
  const showPending = useCallback(() => {
    const add = pending; if (!add.length) return 0;
    setItems(prev => { const pins = prev.findIndex(p => !p.pinned); const at = pins < 0 ? prev.length : pins; const next = [...prev.slice(0, at), ...add, ...prev.slice(at)]; writeCache(key, next.slice(0, 10)); return next; }); // pinned posts stay first
    newest.current = [...add].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))[0].id;
    setPending([]); return add.length;
  }, [pending, key]);

  return { items, status, error, hasMore: !!cursor, loadingMore, loadMore, refreshing, refresh: () => revalidate(true), retry: () => { setStatus(items.length ? 'ok' : 'loading'); void revalidate(true); }, pending: pending.length, showPending };
}
