// Curated Posts / ຂ່າວສານ seed data. The data itself is in shared/curated-posts.mjs so the backend serves the same posts.
// This bundled copy is the offline fallback: only posts the curator already approved (ended events are kept and marked expired).
import { CURATED_POSTS, isExpired, sortFeed } from "../../../shared/curated-posts.mjs";
import type { CuratedPost } from "../../../shared/curated-posts.mjs";
export { CURATED_POSTS, isExpired, sortFeed };
export type { CuratedPost, CuratedType, CuratedStatus, CuratedVideo } from "../../../shared/curated-posts.mjs";

export const bundledApprovedPosts = (now = Date.now()): CuratedPost[] =>
  sortFeed(CURATED_POSTS.filter(p => p.status === "approved").map(({ review_note, ...p }) => ({ ...p, expired: isExpired(p, now) }) as CuratedPost));
