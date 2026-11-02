import {mkdirSync} from 'node:fs';
import {backup} from 'node:sqlite';
import {createHash} from 'node:crypto';
import {openStore,postView} from '../backend/store.mjs';
import {postLocked} from '../backend/post-lock.mjs';
try{process.loadEnvFile('.env.local');}catch(error){if(error.code!=='ENOENT')throw error;}
const db=openStore(process.env.DATABASE_PATH||'backend/data/sati.sqlite',false);
const stable=(...parts)=>'sati-engagement-'+createHash('sha256').update(parts.join(':')).digest('hex').slice(0,24);
try{
 mkdirSync('deployment/backups',{recursive:true});await backup(db,`deployment/backups/before-interactions-${Date.now()}.sqlite`);
 const users=db.prepare("SELECT u.* FROM users u LEFT JOIN user_access a ON a.user_id=u.id WHERE json_extract(u.profile,'$.seed')=1 AND COALESCE(a.status,'active')='active' ORDER BY u.id").all();
 if(users.length<3)throw new Error('Prepare the community accounts first.');
 const rows=db.prepare("SELECT * FROM posts WHERE id LIKE 'sati-community-%' AND json_extract(data,'$.seed')=1 AND COALESCE(json_extract(data,'$.seedArchived'),0)=0 ORDER BY created DESC").all();
 let populated=0,locked=0;const now=Date.now();
 db.exec('BEGIN');
 try{
  for(let index=0;index<rows.length;index++){
   const row=rows[index],post=JSON.parse(row.data);
   if(postLocked(db,row)||!post.check||post.review?.state==='rejected'){locked++;continue;}
   const actors=users.filter(u=>u.id!==row.user_id);const rotate=index%actors.length;
   const ordered=[...actors.slice(rotate),...actors.slice(0,rotate)];
   for(const user of ordered.slice(0,3+index%6))db.prepare('INSERT OR IGNORE INTO reactions VALUES (?,?,?)').run(row.id,user.id,'like');
   for(const user of ordered.slice(3,5+index%4))db.prepare('INSERT OR IGNORE INTO reactions VALUES (?,?,?)').run(row.id,user.id,'warned');
   for(const user of ordered.slice(6,7+index%3))db.prepare('INSERT OR IGNORE INTO shares VALUES (?,?,?)').run(row.id,user.id,now);
   const commentActors=ordered.slice(8).concat(ordered.slice(0,8));
   db.prepare('DELETE FROM comments WHERE post_id=? AND id LIKE ?').run(row.id,'sati-engagement-%');
   const lo=post.contentLanguage==='lo';
   const comments=post.check.verdict==='approved'?(lo?['ຂອບໃຈທີ່ແຊຣ໌. ຂ້ອຍຈະກວດສອບແຫຼ່ງຂໍ້ມູນກ່ອນແຊຣ໌ຕໍ່.','ການຢຸດຄິດກ່ອນໂອນເງິນສຳຄັນຫຼາຍ.','ຂ້ອຍຈະບອກຄອບຄົວໃຫ້ລະວັງ ແລະກວດສອບດ້ວຍຕົນເອງ.']:['Thanks for sharing. I will check the source before passing this on.','A useful reminder to pause and verify before sending money.','I will discuss this with my family and check the details independently.']):(lo?['ຊ່ວຍອະທິບາຍວ່າເລື່ອງນີ້ກ່ຽວກັບຄວາມປອດໄພແນວໃດໄດ້ບໍ?','ມີແຫຼ່ງຂໍ້ມູນໃຫ້ກວດສອບຕື່ມບໍ?','ຂໍໃຫ້ສົນທະນາກັນຢ່າງສຸພາບ.']:['Could you explain the connection to community safety?','Is there a source we can check for more context?','Let us keep the discussion respectful.']);
   for(let i=0;i<1+index%3;i++)db.prepare('INSERT OR IGNORE INTO comments VALUES (?,?,?,?,?)').run(stable('comment',row.id,commentActors[i].id),row.id,commentActors[i].id,comments[i],now-(i+1)*60000);
   const repostActors=ordered.slice(10).concat(ordered.slice(0,10)).slice(0,1+index%2);
   const intended=new Set(repostActors.map(user=>stable('repost',row.id,user.id)));
   for(const old of db.prepare("SELECT id FROM posts WHERE json_extract(data,'$.seedInteraction')=1 AND json_extract(data,'$.repostOf')=?").all(row.id)){
    if(intended.has(old.id))continue;
    const used=['comments','reactions','shares','notifications'].some(table=>db.prepare(`SELECT COUNT(*) n FROM ${table} WHERE post_id=?`).get(old.id).n>0)||db.prepare("SELECT COUNT(*) n FROM posts WHERE json_extract(data,'$.repostOf')=?").get(old.id).n>0;
    if(!used)db.prepare('DELETE FROM posts WHERE id=?').run(old.id);
   }
   for(const user of repostActors){
    const id=stable('repost',row.id,user.id);
    const repost={id,content:post.content,contentLo:post.contentLo,contentLanguage:post.contentLanguage,tags:post.tags,state:post.state,frozen:false,check:post.check,screening:post.screening,review:post.review,seed:true,seedInteraction:true,repostOf:row.id,repostText:'',likes:0,warnedMe:0};
    db.prepare('INSERT OR IGNORE INTO posts VALUES (?,?,?,?)').run(id,user.id,JSON.stringify(repost),now-index*60000);
   }
   populated++;
  }
  db.exec('COMMIT');
 }catch(error){db.exec('ROLLBACK');throw error;}
 const result=rows.map(row=>postView(db,db.prepare('SELECT * FROM posts WHERE id=?').get(row.id)));
 console.log(JSON.stringify({populatedPosts:populated,lockedPostsUnchanged:locked,totals:result.reduce((a,p)=>{for(const k of ['likes','comments','reposts','shares','warnedMe'])a[k]=(a[k]||0)+(p[k]||0);return a;},{})}));
}finally{db.close();}
