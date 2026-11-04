import {readFileSync} from 'node:fs';
import {openStore} from '../backend/store.mjs';
import {guardVerdict} from '../backend/safety/checker.mjs';
import {checkPost} from '../backend/safety/post-check.mjs';
import {modelConfigured} from '../backend/safety/model.mjs';
import {notifyReviewers} from '../backend/review-queue.mjs';
try{process.loadEnvFile('.env.local');}catch(error){if(error.code!=='ENOENT')throw error;}
const training=process.argv.includes('--training');
if(!training&&!modelConfigured())throw new Error('Configure your screening provider before adding review posts.');
const db=openStore(process.env.DATABASE_PATH||'backend/data/sati.sqlite');
const entries=JSON.parse(readFileSync(new URL('./demo/review-posts.json',import.meta.url),'utf8'));
try{
 for(const entry of entries){
  const id='sati-review-'+entry.id;
  const existing=db.prepare('SELECT data FROM posts WHERE id=?').get(id);
  if(existing&&(!process.argv.includes('--recheck')||JSON.parse(existing.data).review)){console.log(`${id}: already exists; unchanged`);continue;}
  const draft={id,content:entry.text,contentLanguage:'en',tags:entry.tags,seed:true,
   author:{id:'safety-examples',name:'Safety examples',handle:'@safety_examples',initials:'SE',color:'#7c3aed',points:0},
   likes:0,comments:0,reposts:0,warnedMe:0};
  const post=await checkPost(draft,training?{check:async()=>({...guardVerdict(entry.assessment,entry.text),source:'training'})}:undefined);
  if(training)post.screening.mode='rules';
  if(!post.tags.length)post.tags=['OffTopic'];
  db.prepare('INSERT INTO posts VALUES (?,NULL,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data').run(id,JSON.stringify(post),Date.now());
  console.log(`${id}: ${post.check.verdict} · ${post.check.labels.join(', ')}`);
 }
 notifyReviewers(db);
}finally{db.close();}
