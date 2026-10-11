import {accessFor,managedUsers} from './access.mjs';
import { postView } from './store.mjs';

export function adminSnapshot(db,user,adminEmails=[]) {
  const posts = db.prepare('SELECT * FROM posts ORDER BY created DESC').all().map(row => postView(db,row));
  const access=accessFor(db,user,adminEmails);
  const users = access.role==='admin'?managedUsers(db,adminEmails):[];
  return { posts, users, permissions:{role:access.role,canManageUsers:access.role==='admin',canReview:['admin','reviewer'].includes(access.role)}, totals: {
    posts: posts.length, users: db.prepare('SELECT COUNT(*) n FROM users').get().n,
    comments: db.prepare('SELECT COUNT(*) n FROM comments').get().n,
    reactions: db.prepare('SELECT COUNT(*) n FROM reactions').get().n,
  }, updatedAt: Date.now() };
}

export function reviewPost(db,id,state,note,user) {
  const row = db.prepare('SELECT * FROM posts WHERE id=?').get(id);
  if (!row) return null;
  const post = JSON.parse(row.data);
  post.state = state;
  post.correction = note;
  post.screeningStage = 'completed';
  post.screeningLogs = [...(post.screeningLogs || []), {
    stage: 'completed', timestamp: Date.now(), message: `${user.name}: ${state}. ${note}`,
  }];
  post.review = {state,note,reviewedAt:Date.now(),reviewerId:user.id,reviewerName:user.name};
  db.prepare('UPDATE posts SET data=? WHERE id=?').run(JSON.stringify(post),id);
  return postView(db,db.prepare('SELECT * FROM posts WHERE id=?').get(id),user.id);
}
