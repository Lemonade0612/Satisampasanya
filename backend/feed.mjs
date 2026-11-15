// Home feed paging. Posts are a JSON document store, so post type, media, source URL and pinned live in
// post.data (type, media[], sourceUrl, pinned). Rows written before these fields existed are typed on read.
export const POST_TYPES = ['text', 'poster', 'video', 'link'];
export const MAX_MEDIA = 10;
export const MAX_RUN = 2;

const httpsUrl = value => { try { const u = new URL(value); return ['https:', 'http:'].includes(u.protocol) && value.length <= 2000; } catch { return false; } };
const dataImage = value => typeof value === 'string' && value.length <= 1600000 && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(value);

// Validates user-supplied media. Throws Error(message) on bad input; returns the cleaned array.
export function cleanMedia(list) {
  if (list === undefined) return [];
  if (!Array.isArray(list) || list.length > MAX_MEDIA) throw new Error(`Attach up to ${MAX_MEDIA} images or videos.`);
  const num = (v, max) => (Number.isFinite(v) && v >= 0 && v <= max ? Math.round(v) : undefined);
  const cap = v => (typeof v === 'string' && v.length <= 300 ? v.trim() || undefined : undefined);
  return list.map(m => {
    if (!m || typeof m !== 'object' || !['image', 'video'].includes(m.kind)) throw new Error('Each attachment must be an image or a video.');
    const ok = m.kind === 'image' ? httpsUrl(m.url) || dataImage(m.url) : httpsUrl(m.url);
    if (!ok) throw new Error('Attachment links must be http(s) URLs.');
    if (m.thumb_url !== undefined && !httpsUrl(m.thumb_url) && !dataImage(m.thumb_url)) throw new Error('Invalid thumbnail link.');
    return { kind: m.kind, url: m.url, thumb_url: m.thumb_url, width: num(m.width, 10000), height: num(m.height, 10000), duration: num(m.duration, 36000), caption_lo: cap(m.caption_lo), caption_en: cap(m.caption_en) };
  });
}

// Type and media for a stored post, including posts saved before these fields existed.
export function feedFields(post) {
  const media = Array.isArray(post.media) && post.media.length ? post.media : post.image ? [{ kind: 'image', url: post.image }] : [];
  const sourceUrl = post.sourceUrl || post.link || undefined;
  const type = POST_TYPES.includes(post.type) ? post.type : media.some(m => m.kind === 'video') ? 'video' : media.length ? 'poster' : sourceUrl ? 'link' : 'text';
  return { type, media, sourceUrl, pinned: !!post.pinned };
}

// Reorders one page so no type appears more than MAX_RUN times in a row, keeping newest-first as far as possible.
// `lead` is the types already on screen just before this page.
export function interleave(items, typeOf = p => p.type, lead = []) {
  const left = [...items], out = [], tail = [...lead];
  const run = t => { let n = 0; for (let i = tail.length - 1; i >= 0 && tail[i] === t; i--) n++; return n; };
  while (left.length) {
    let at = left.findIndex(p => run(typeOf(p)) < MAX_RUN);
    if (at < 0) at = 0;
    const [p] = left.splice(at, 1);
    out.push(p); tail.push(typeOf(p));
  }
  return out;
}

export const encodeCursor = row => `${row.created}_${row.id}`;
export function decodeCursor(value) {
  const m = /^(\d{1,16})_([\w-]{1,80})$/.exec(value || '');
  return m ? { created: Number(m[1]), id: m[2] } : null;
}

// rows are newest-first (created DESC, id DESC) and already visible to the viewer.
// Returns { posts, nextCursor, newestId }. `since` is a post id: only newer posts come back.
export function pageFeed(rows, { cursor, since, limit = 10, view }) {
  const lim = Math.min(Math.max(Number.parseInt(limit, 10) || 10, 1), 30);
  const after = (a, b) => a.created > b.created || (a.created === b.created && a.id > b.id);
  const pinned = rows.filter(r => feedFields(JSON.parse(r.data)).pinned);
  const normal = rows.filter(r => !pinned.includes(r));
  const newest = normal[0];
  const newestId = newest?.id ?? null;
  const first = !cursor && !since;
  let slice = normal;
  if (since) {
    const mark = rows.find(r => r.id === since);
    slice = mark ? normal.filter(r => after(r, mark)) : [];
    return { posts: interleave(slice.map(view)), nextCursor: null, newestId };
  }
  const c = decodeCursor(cursor);
  if (cursor && !c) throw Object.assign(new Error('Invalid cursor.'), { status: 400 });
  if (c) slice = normal.filter(r => after(c, r));
  const pageRows = slice.slice(0, lim);
  const nextCursor = slice.length > lim ? encodeCursor(pageRows[pageRows.length - 1]) : null;
  const posts = interleave(pageRows.map(view));
  return { posts: first ? [...pinned.map(view), ...posts] : posts, nextCursor, newestId };
}
