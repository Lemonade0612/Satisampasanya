import {randomUUID} from 'node:crypto';
import {accessFor} from './access.mjs';
export function notifyReviewers(db,adminEmails=[],now=Date.now()){
 const reviewers=db.prepare('SELECT id,email FROM users').all().filter(user=>{const access=accessFor(db,user,adminEmails);return access.status==='active'&&['admin','reviewer'].includes(access.role);});
 let changed=false;
 for(const row of db.prepare("SELECT * FROM posts WHERE json_extract(data,'$.frozen')=1 AND COALESCE(json_extract(data,'$.seedArchived'),0)=0").all()){
  const post=JSON.parse(row.data);if(post.review)continue;const deadline=post.expertReviewDeadline||row.created+48*3600000;
  const phase=now>=deadline?'overdue':'requested';
  const sent=post.reviewerNotifications||{};
  for(const user of reviewers){const key=user.id+':'+phase;if(sent[key])continue;
   db.prepare('INSERT INTO notifications(id,user_id,actor_name,kind,post_id,created) VALUES (?,?,?,?,?,?)').run(randomUUID(),user.id,'Safety review',phase==='overdue'?'review_overdue':'review_requested',row.id,now);sent[key]=now;changed=true;
  }
  post.expertReviewDeadline=deadline;post.reviewerNotifications=sent;
  db.prepare('UPDATE posts SET data=? WHERE id=?').run(JSON.stringify(post),row.id);
 }
 return changed;
}
