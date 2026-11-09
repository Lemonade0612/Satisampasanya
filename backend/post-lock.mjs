export function postLocked(db,row){
 const seen=new Set();
 while(row){
  if(seen.has(row.id))return true;seen.add(row.id);
  const post=JSON.parse(row.data);if(post.frozen || (!post.review && ['caution','needs_expert'].includes(post.check?.verdict)))return true;
  if(!post.repostOf)return false;
  row=db.prepare('SELECT id,data FROM posts WHERE id=?').get(post.repostOf);
 }
 return true;
}
// Posts held by moderation, rejected, or marked false are visible only to their author (and to staff,
// who read through the admin snapshot instead). A repost is visible only while every post it repeats is.
const HIDDEN=['flagged','rejected','false'];
export function visibleTo(db,row,viewerId){
 const seen=new Set();
 while(row){
  if(seen.has(row.id))return false;seen.add(row.id);
  const post=JSON.parse(row.data);
  if(HIDDEN.includes(post.state)&&!(viewerId&&row.user_id===viewerId))return false;
  if(!post.repostOf)return true;
  row=db.prepare('SELECT id,user_id,data FROM posts WHERE id=?').get(post.repostOf);
 }
 return true;
}
