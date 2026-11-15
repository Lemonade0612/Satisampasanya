// Adds the traffic-light example posts (green / yellow / red). Safe to re-run: existing ids are left alone.
// The levels come from backend/riskScore.mjs; the script stops if a post does not score the level it is meant to teach.
import {readFileSync} from 'node:fs';
import {openStore} from '../backend/store.mjs';
import {applyRisk,overrideRisk} from '../backend/riskScore.mjs';
try{process.loadEnvFile('.env.local');}catch(error){if(error.code!=='ENOENT')throw error;}
const db=openStore(process.env.DATABASE_PATH||'backend/data/sati.sqlite');
const entries=JSON.parse(readFileSync(new URL('./demo/risk-seed-posts.json',import.meta.url),'utf8'));
const color=['#16A34A','#2563EB','#7C3AED','#0891B2'];
try{
 entries.forEach((entry,index)=>{
  const id='sati-risk-'+entry.id;
  if(db.prepare('SELECT 1 FROM posts WHERE id=?').get(id)){console.log(`${id}: already exists; unchanged`);return;}
  const post={id,content:entry.en,contentLo:entry.lo,contentLanguage:'en',tags:entry.tags,seed:true,state:'clean',isNews:!!entry.isNews,
   sourceId:entry.sourceId,example:entry.example||undefined,
   author:{id:'sati-risk-'+entry.id,name:entry.author,handle:'@'+entry.id.replace(/-/g,'_'),initials:entry.author.split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase(),color:color[index%color.length],points:0},
   likes:0,comments:0,reposts:0,warnedMe:0};
  applyRisk(post);
  if(post.risk_level!==entry.expect)throw new Error(`${id} scored ${post.risk_level}, expected ${entry.expect}: ${JSON.stringify(post.risk_reasons)}`);
  if(entry.example)post.exampleStatus=entry.expect;
  if(entry.warningExample)overrideRisk(post,{level:'red',warningExample:true,note:'Published as a teaching example'},{id:'system',name:'Sati seed'});
  db.prepare('INSERT INTO posts VALUES (?,NULL,?,?)').run(id,JSON.stringify(post),Date.now()-index*60000);
  console.log(`${id}: ${post.risk_level}`);
 });
}finally{db.close();}
