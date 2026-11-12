// Offline support for the web build (the iOS/Android apps already ship every file inside the app).
// - Pages: network first, falling back to the cached app shell, so the games open with no connection.
// - Built assets (/assets/*, content-hashed) and audio (/audio/*, content-addressed): cache first.
// - On install it also downloads every Lao read-aloud clip listed in /audio/lo/manifest.json.
// - /api is never cached.
const SHELL = 'sati-shell-v1';
const AUDIO = 'sati-audio-v1'; // file names change when the words change, so this cache never goes stale

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const shell = await caches.open(SHELL);
    await shell.addAll(['/', '/index.html']).catch(() => {});
    // Audio is a bonus: a failure here must not stop the worker from installing.
    try {
      const res = await fetch('/audio/lo/manifest.json', { cache: 'no-cache' });
      if (res.ok) {
        const audio = await caches.open(AUDIO);
        await audio.put('/audio/lo/manifest.json', res.clone());
        const manifest = await res.json();
        const urls = Object.entries(manifest).map(([key, kind]) => (kind === 2 ? `/audio/lo/human/${key}.mp3` : `/audio/lo/${key}.mp3`));
        const have = new Set((await audio.keys()).map(r => new URL(r.url).pathname));
        const todo = urls.filter(u => !have.has(u));
        for (let i = 0; i < todo.length; i += 8) await Promise.allSettled(todo.slice(i, i + 8).map(u => audio.add(u)));
      }
    } catch { /* offline during install: clips are cached as they are played */ }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) if (name !== SHELL && name !== AUDIO) await caches.delete(name);
    await self.clients.claim();
  })());
});

async function cacheFirst(cacheName, request) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok && res.status === 200) cache.put(request, res.clone());
  return res;
}
async function networkFirst(cacheName, request, fallback) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(request);
    if (res.ok) cache.put(fallback || request, res.clone());
    return res;
  } catch {
    return (await cache.match(fallback || request)) || (fallback && (await cache.match('/'))) || Response.error();
  }
}

async function rangeFromCache(request, path) {
  const cache = await caches.open(AUDIO);
  let whole = await cache.match(path);
  if (!whole) {
    try {
      const res = await fetch(path);
      if (!res.ok) return res;
      await cache.put(path, res.clone());
      whole = res;
    } catch { return fetch(request); }
  }
  const buf = await whole.arrayBuffer();
  const m = /bytes=(\d*)-(\d*)/.exec(request.headers.get('range') || '');
  const start = m && m[1] ? Number(m[1]) : 0;
  const end = m && m[2] ? Math.min(Number(m[2]), buf.byteLength - 1) : buf.byteLength - 1;
  return new Response(buf.slice(start, end + 1), {
    status: 206,
    headers: { 'Content-Type': whole.headers.get('Content-Type') || 'audio/mpeg', 'Content-Length': String(end - start + 1), 'Content-Range': `bytes ${start}-${end}/${buf.byteLength}`, 'Accept-Ranges': 'bytes' },
  });
}

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api')) return;
  // <audio> asks for byte ranges; answer them from the cached whole file so clips play offline too.
  if (request.headers.has('range')) {
    if (url.pathname.startsWith('/audio/')) event.respondWith(rangeFromCache(request, url.pathname));
    return;
  }
  if (request.mode === 'navigate') return event.respondWith(networkFirst(SHELL, request, '/index.html'));
  if (url.pathname === '/audio/lo/manifest.json') return event.respondWith(networkFirst(AUDIO, request));
  if (url.pathname.startsWith('/audio/')) return event.respondWith(cacheFirst(AUDIO, request));
  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/fonts/') || url.pathname.startsWith('/images/')) return event.respondWith(cacheFirst(SHELL, request));
});
