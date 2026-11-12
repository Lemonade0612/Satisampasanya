import {randomUUID,randomBytes,createHash} from 'node:crypto';
import {readFileSync,writeFileSync,mkdtempSync,rmSync,mkdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {backup} from 'node:sqlite';
import {openStore} from '../backend/store.mjs';
import {passwordHash} from '../backend/auth.mjs';
import {checkPost} from '../backend/safety/post-check.mjs';
import {modelConfigured,readSafetyConfig} from '../backend/safety/model.mjs';
import {CHECK_PROMPT} from '../backend/safety/prompts.mjs';
try{process.loadEnvFile('.env.local');}catch(error){if(error.code!=='ENOENT')throw error;}
const prepare=process.argv.includes('--prepare');
if(!prepare&&!modelConfigured()){console.error('Add the selected provider API key privately to .env.local, then run this launcher again. No verdicts were fabricated.');process.exit(1);}
const db=openStore(process.env.DATABASE_PATH||'backend/data/sati.sqlite',false);
const rows=[...JSON.parse(readFileSync(new URL('./demo/community-posts.json',import.meta.url),'utf8')),...JSON.parse(readFileSync(new URL('./demo/additional-posts.json',import.meta.url),'utf8'))];
// One age band per community post, so Youth, Adults and Elders each get their own feed.
const DEMO_BANDS={1:'youth',2:'youth',3:'adult',4:'elder',5:'adult',6:'elder',7:'adult',8:'youth',9:'youth',10:'adult',11:'adult',12:'youth',13:'youth',14:'elder',15:'adult',16:'adult',17:'elder',18:'youth',19:'adult',20:'youth',21:'elder',22:'youth',23:'adult',24:'elder',25:'youth',26:'youth',27:'youth',28:'adult'};
// Band example posts from backend/seed.json (ids ex-*). Marked as examples in the app.
const examples=JSON.parse(readFileSync(new URL('../backend/seed.json',import.meta.url),'utf8')).filter(post=>post.id.startsWith('ex-'));
const directory=mkdtempSync(join(tmpdir(),'sati-community-')),report=[];
let credentials=[];try{credentials=JSON.parse(readFileSync('backend/data/demo-accounts.json','utf8'));}catch{}
try{
 mkdirSync('deployment/backups',{recursive:true});await backup(db,`deployment/backups/before-community-${Date.now()}.sqlite`);
 const usedImages=new Set(),usedUsers=new Set();
 // Preserve original records and their discussions in the database, outside the current feed.
 for(const row of db.prepare('SELECT id,data FROM posts').all()){
  const post=JSON.parse(row.data);
  if((post.isDemo||post.seed)&&!post.seedInteraction&&!row.id.startsWith('sati-community-')&&!row.id.startsWith('sati-example-')){
   post.seedArchived=true;post.seed=true;delete post.image;delete post.isDemo;
   db.prepare('UPDATE posts SET data=? WHERE id=?').run(JSON.stringify(post),row.id);
  }else if(!post.seedArchived){
   if(post.imageKey)usedImages.add(post.imageKey);
   if(post.image?.startsWith('/images/'))usedImages.add(post.image.slice(8));
  }
 }
 const available=db.prepare("SELECT * FROM users WHERE json_extract(profile,'$.isDemo')=1 OR json_extract(profile,'$.seed')=1 ORDER BY id").all();
 for(let i=0;i<rows.length;i++){
  const entry=rows[i],id=`sati-community-${entry.id}`;
  const existingRow=db.prepare('SELECT data,user_id FROM posts WHERE id=?').get(id);
  let user=entry.id>13?available.find(row=>JSON.parse(row.profile).handle===entry.handle):existingRow?.user_id?db.prepare('SELECT * FROM users WHERE id=?').get(existingRow.user_id):available.find(row=>!usedUsers.has(row.id));
  if(!user){
   const userId=randomUUID(),email=`community.${entry.id}@sati.invalid`,password=randomBytes(18).toString('base64url'),salt=randomBytes(16).toString('hex');
   db.prepare('INSERT INTO users(id,email,name,password,salt,profile) VALUES (?,?,?,?,?,?)').run(userId,email,entry.name,await passwordHash(password,salt),salt,JSON.stringify({seed:true,handle:entry.handle}));
   db.prepare('INSERT INTO user_access(user_id,created) VALUES (?,?)').run(userId,Date.now());credentials.push({email,password});
   user=db.prepare('SELECT * FROM users WHERE id=?').get(userId);
  }else if(entry.id<=13){
   const profile=JSON.parse(user.profile);delete profile.isDemo;delete profile.bio;profile.seed=true;profile.handle=entry.handle;
   const email=`community.${entry.id}@sati.invalid`;
   const login=credentials.find(account=>account.email===user.email);if(login)login.email=email;
   db.prepare('UPDATE users SET name=?,email=?,profile=? WHERE id=?').run(entry.name,email,JSON.stringify(profile),user.id);
  }
  usedUsers.add(user.id);
  const existing=existingRow;
  const cached=existing&&JSON.parse(existing.data);
  const fingerprint=createHash('sha256').update(CHECK_PROMPT+entry.text+(entry.link||'')+readSafetyConfig().provider+'/'+readSafetyConfig().model).digest('hex');
  let post={id,bands:DEMO_BANDS[entry.id]?[DEMO_BANDS[entry.id]]:undefined,content:entry.text,contentLo:entry.lang==='lo'?entry.text:undefined,contentLanguage:entry.lang,link:entry.link,tags:entry.tags.length?entry.tags:['OffTopic'],seed:true,state:'flagged',frozen:true,checkPending:true,likes:0,comments:0,reposts:0,warnedMe:0};
  if(entry.image&&(!usedImages.has(entry.image)||cached?.imageKey===entry.image)){
   usedImages.add(entry.image);const path=join(directory,`${entry.id}.jpg`);
   execFileSync('sips',['-Z','800','-s','format','jpeg','frontend/public/images/'+entry.image,'--out',path],{stdio:'pipe'});
   post.image='data:image/jpeg;base64,'+readFileSync(path).toString('base64');post.imageKey=entry.image;
  }
  if(cached?.check&&(cached.checkFingerprint===fingerprint||prepare)&&!process.argv.includes('--recheck')){post={...post,check:cached.check,screening:cached.screening,state:cached.state,frozen:cached.frozen,checkPending:false,checkFingerprint:prepare?cached.checkFingerprint:fingerprint};}
  else if(!prepare){
   post=await checkPost(post);post.checkPending=false;post.checkFingerprint=fingerprint;
  }
  if(cached?.review){post.review=cached.review;post.correction=cached.correction;post.state=cached.state;post.frozen=cached.frozen;}
  if(post.check&&entry._expect)report.push({id:entry.id,expected:entry._expect,actual:{verdict:post.check.verdict,labels:post.check.labels},verdictMatch:post.check.verdict===entry._expect.verdict,evidenceValid:post.check.reasons.every(reason=>entry.text.includes(reason.evidence)),languageValid:post.check.language===entry.lang});
  db.prepare('INSERT INTO posts VALUES (?,?,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data,user_id=excluded.user_id').run(id,user.id,JSON.stringify(post),Date.now()-i*3600000);
 }
 // Example posts: upserted by id, never touching posts people wrote. The AI check runs like any post and its
 // verdict is shown; the post stays visible because it is a labelled teaching example, not a live claim.
 for(let i=0;i<examples.length;i++){
  const entry=examples[i],id=`sati-example-${entry.id}`,existing=db.prepare('SELECT data,user_id FROM posts WHERE id=?').get(id);
  let user=existing?.user_id&&db.prepare('SELECT * FROM users WHERE id=?').get(existing.user_id);
  if(!user){
   const userId=randomUUID(),email=`example.${entry.id}@sati.invalid`,salt=randomBytes(16).toString('hex');
   db.prepare('INSERT OR IGNORE INTO users(id,email,name,password,salt,profile) VALUES (?,?,?,?,?,?)').run(userId,email,entry.author.name,await passwordHash(randomBytes(18).toString('base64url'),salt),salt,JSON.stringify({seed:true,handle:entry.author.handle}));
   db.prepare('INSERT OR IGNORE INTO user_access(user_id,created) VALUES (?,?)').run(userId,Date.now());
   user=db.prepare('SELECT * FROM users WHERE email=?').get(email);
  }
  const cached=existing&&JSON.parse(existing.data);
  const {author,timestamp,reviewLo,...fields}=entry;
  const fingerprint=createHash('sha256').update(CHECK_PROMPT+entry.content+readSafetyConfig().provider+'/'+readSafetyConfig().model).digest('hex');
  let post={...fields,id,seed:true,checkPending:!prepare};
  if(cached?.check&&cached.checkFingerprint===fingerprint&&!process.argv.includes('--recheck'))post={...post,check:cached.check,screening:cached.screening,checkFingerprint:fingerprint,checkPending:false};
  else if(!prepare){post=await checkPost(post);post.checkFingerprint=fingerprint;post.checkPending=false;}
  post.state='clean';post.frozen=false;
  db.prepare('INSERT INTO posts VALUES (?,?,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data,user_id=excluded.user_id').run(id,user.id,JSON.stringify(post),Date.now()-i*2700000);
 }
 writeFileSync('backend/data/demo-accounts.json',JSON.stringify(credentials,null,2)+'\n',{mode:0o600});
 writeFileSync('backend/data/checker-acceptance.json',JSON.stringify(report,null,2)+'\n',{mode:0o600});
 console.log(`Example posts: ${examples.length} (one band each).`);
 console.log(prepare?`Prepared ${rows.length} community posts with unique photos. Unchecked posts await the AI connection.`:`Checked ${rows.length} posts: ${report.filter(row=>row.verdictMatch).length}/13 verdict matches. Evidence and language results saved privately.`);
}finally{db.close();rmSync(directory,{recursive:true,force:true});}
