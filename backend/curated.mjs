import { CURATED_POSTS, STATUSES, isExpired, sortFeed } from '../shared/curated-posts.mjs';
import { moderate } from '../shared/moderation.mjs';

const overrides = db => new Map(db.prepare('SELECT * FROM curated_reviews').all().map(r => [r.id, r]));
const withStatus = (post, row) => ({ ...post, status: row?.status ?? post.status, needs_human_review: (row?.status ?? post.status) === 'approved' ? false : post.needs_human_review });

// Public feed: approved posts (ended events stay, marked expired and sorted last), hotlines pinned first. Staff-only fields never leave the server here.
export function publicCurated(db, now = Date.now()) {
  const rows = overrides(db);
  return sortFeed(CURATED_POSTS.map(p => withStatus(p, rows.get(p.id))).filter(p => p.status === 'approved'))
    .map(({ review_note, ...p }) => ({ ...p, expired: isExpired(p, now) }));
}

// Admin list: every post with its effective status, the rule result, whether it has expired and who decided.
export function staffCurated(db, now = Date.now()) {
  const rows = overrides(db);
  return CURATED_POSTS.map(p => {
    const row = rows.get(p.id);
    return { ...withStatus(p, row), moderation: moderate(p), expired: isExpired(p, now), review: row ? { note: row.note, reviewerName: row.reviewer_name, reviewedAt: row.reviewed_at } : null };
  });
}

export function reviewCurated(db, id, status, note, user) {
  const post = CURATED_POSTS.find(p => p.id === id);
  if (!post) return null;
  if (!STATUSES.includes(status)) throw Object.assign(new Error('Choose approve or reject.'), { status: 400 });
  // The rules can hold a post back for a person, but a post they reject outright can never be approved.
  if (status === 'approved' && moderate(post).decision === 'reject') throw Object.assign(new Error('The moderation rules reject this post, so it cannot be approved.'), { status: 409 });
  db.prepare('INSERT INTO curated_reviews(id,status,note,reviewer_id,reviewer_name,reviewed_at) VALUES (?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET status=excluded.status,note=excluded.note,reviewer_id=excluded.reviewer_id,reviewer_name=excluded.reviewer_name,reviewed_at=excluded.reviewed_at')
    .run(id, status, note || '', user.id, user.name, Date.now());
  return staffCurated(db).find(p => p.id === id);
}
