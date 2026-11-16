import type { Post } from '../types';
import { typeOf } from '../components/feed/PostMedia';
import { statusOf, type Status } from '../components/feed/colorCode';

export const MAX_RUN = 2;
// Client fallback for the server's type mixing: reorders a freshly appended page so that, together with the posts
// already on screen, no post type appears more than MAX_RUN times in a row. Newest-first is kept as far as possible.
export function mixPage(page: Post[], shown: Post[]): Post[] {
  const left = [...page], out: Post[] = [], tail = shown.slice(-MAX_RUN).map(typeOf);
  const run = (t: string) => { let n = 0; for (let i = tail.length - 1; i >= 0 && tail[i] === t; i--) n++; return n; };
  while (left.length) {
    let at = left.findIndex(p => run(typeOf(p)) < MAX_RUN);
    if (at < 0) at = 0;
    const [p] = left.splice(at, 1);
    out.push(p); tail.push(typeOf(p));
  }
  return out;
}

// A post never appears twice in the list (same id), whichever page or refresh brought it in.
export function dedupe(posts: Post[]): Post[] { const seen = new Set<string>(); return posts.filter(p => !seen.has(p.id) && !!seen.add(p.id)); }

// Members' posts lead the feed, and picture posts lead among them: the first 10 slots are members' posts, alternating a picture post with a text
// post (pictures first). After that organisation posts take turns (two from members, one from an organisation).
// Each group keeps its own order; whatever is left of the longer group follows at the end.
export const MEMBER_FIRST = 10;
const hasPicture = (p: Post) => typeOf(p) !== "text";
// Spreads red, yellow, green and pending posts so no colour repeats back to back. Each colour keeps its own order.
const COLOUR_ORDER: Status[] = ["warn", "check", "safe", "pending"];
export function mixColours(posts: Post[]): Post[] {
  const groups = COLOUR_ORDER.map(k => posts.filter(p => statusOf(p) === k));
  const out: Post[] = [];
  while (groups.some(g => g.length)) for (const g of groups) if (g.length) out.push(g.shift()!);
  return out;
}

export function mixOrgs(posts: Post[]): Post[] {
  const orgs = posts.filter(p => p.org), members = posts.filter(p => !p.org);
  const pics = mixColours(members.filter(hasPicture)), texts = mixColours(members.filter(p => !hasPicture(p))), others: Post[] = [];
  while (pics.length || texts.length) { if (pics.length) others.push(pics.shift()!); if (texts.length) others.push(texts.shift()!); }
  const out: Post[] = others.splice(0, MEMBER_FIRST);
  while (orgs.length && others.length) { for (let k = 0; k < 2 && others.length; k++) out.push(others.shift()!); out.push(orgs.shift()!); }
  return [...out, ...others, ...orgs];
}
