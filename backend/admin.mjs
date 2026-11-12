import {randomUUID} from 'node:crypto';
import {accessFor,managedUsers} from './access.mjs';
import { postView } from './store.mjs';
import { logModeration } from './scenarios.mjs';

export function adminSnapshot(db,user) {
  const posts = db.prepare("SELECT * FROM posts WHERE COALESCE(json_extract(data,'$.seedArchived'),0)=0 ORDER BY created DESC").all().map(row => postView(db,row,undefined,0,{staff:true}));
  const access=accessFor(db,user);
  const users = access.role==='admin'?managedUsers(db):[];
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
  post.state = state;post.frozen=state==='rejected';
  post.correction = note;
  post.screeningStage = 'completed';
  post.screeningLogs = [...(post.screeningLogs || []), {
    stage: 'completed', timestamp: Date.now(), message: `${user.name}: ${state}. ${note}`,
  }];
  post.review = {state,note,reviewedAt:Date.now(),reviewerId:user.id,reviewerName:user.name};
  db.prepare('UPDATE posts SET data=? WHERE id=?').run(JSON.stringify(post),id);
  logModeration(db,{kind:'post',targetId:id,action:state,actor:user,note,detail:{verdict:post.check?.verdict||null}});
  if(row.user_id)db.prepare('INSERT INTO notifications(id,user_id,actor_name,kind,post_id,created,review_state) VALUES (?,?,?,?,?,?,?)').run(randomUUID(),row.user_id,'Safety review','review',id,Date.now(),state);
  alertNews(db,db.prepare('SELECT * FROM posts WHERE id=?').get(id));
  return postView(db,db.prepare('SELECT * FROM posts WHERE id=?').get(id),user.id,0,{staff:true});
}

// A news post alerts every user (in-app and APNs) once, and only when it is approved: immediately for a
// staff author whose post passed screening, otherwise when a reviewer marks it clean or confirmed.
export function alertNews(db,row){
  const post=JSON.parse(row.data);
  if(!post.isNews||post.newsAlerted||!row.user_id||!['clean','confirmed'].includes(post.state))return false;
  const author=db.prepare('SELECT name FROM users WHERE id=?').get(row.user_id);
  const insert=db.prepare('INSERT INTO notifications(id,user_id,actor_name,kind,post_id,created) VALUES (?,?,?,?,?,?)');
  for(const recipient of db.prepare('SELECT id FROM users WHERE id<>?').all(row.user_id))insert.run(randomUUID(),recipient.id,author.name,'news',row.id,Date.now());
  post.newsAlerted=true;db.prepare('UPDATE posts SET data=? WHERE id=?').run(JSON.stringify(post),row.id);
  return true;
}
