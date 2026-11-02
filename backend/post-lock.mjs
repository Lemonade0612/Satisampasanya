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
