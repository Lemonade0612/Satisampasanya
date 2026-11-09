import {readFileSync} from 'node:fs';
import {openStore} from '../backend/store.mjs';
import {createScenario} from '../backend/scenarios.mjs';
// Adds the demo AI drafts to the scenario review queue. They arrive as drafts: nobody plays them until a
// reviewer approves them and makes them live in the admin app. Safe to rerun; existing ids are skipped.
try{process.loadEnvFile('.env.local');}catch(error){if(error.code!=='ENOENT')throw error;}
const db=openStore(process.env.DATABASE_PATH||'backend/data/sati.sqlite');
try{
 for(const draft of JSON.parse(readFileSync(new URL('../backend/scenario-drafts.json',import.meta.url),'utf8'))){
  if(db.prepare('SELECT id FROM scenarios WHERE id=?').get(draft.id)){console.log(`${draft.id}: already exists; unchanged`);continue;}
  createScenario(db,draft,null,'ai_draft');console.log(`${draft.id}: added as draft`);
 }
}finally{db.close();}
