import type { Post } from '../types';
import { typeOf } from '../components/feed/PostMedia';

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
