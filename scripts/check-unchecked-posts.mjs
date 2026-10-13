import {mkdirSync} from 'node:fs';
import {backup} from 'node:sqlite';
import {openStore} from '../backend/store.mjs';
import {checkPost} from '../backend/safety/post-check.mjs';
import {modelConfigured} from '../backend/safety/model.mjs';
try{process.loadEnvFile('.env.local');}catch(error){if(error.code!=='ENOENT')throw error;}
if(!modelConfigured())throw new Error('Configure the private AI provider key first.');
const db=openStore(process.env.DATABASE_PATH||'backend/data/sati.sqlite',false);
try{
 mkdirSync('deployment/backups',{recursive:true});await backup(db,`deployment/backups/before-legacy-check-${Date.now()}.sqlite`);
 let checked=0;
 for(const row of db.prepare('SELECT * FROM posts').all()){
  const post=JSON.parse(row.data);if(post.seedArchived||post.check||post.review)continue;
  await checkPost(post);post.checkPending=false;
  const current=db.prepare('SELECT data FROM posts WHERE id=?').get(row.id);
  if(current?.data!==row.data)continue;
  db.prepare('UPDATE posts SET data=? WHERE id=?').run(JSON.stringify(post),row.id);checked++;
 }
 console.log(`Checked ${checked} previously unchecked posts with real AI results.`);
}finally{db.close();}
