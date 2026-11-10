// One-time bootstrap: make an existing, already-registered account an active administrator.
// Register the account in the app first (so you have proven you hold the password), then run:
//   node scripts/promote-admin.mjs you@example.com
//   docker compose -f deployment/compose.yaml exec backend node scripts/promote-admin.mjs you@example.com
// Hosted without a shell (Render free): promote inside the newest MongoDB snapshot, then restart the service:
//   MONGODB_URI=... node scripts/promote-admin.mjs you@example.com --mongo
// Further staff should be managed from the admin workspace, not with this script.
import {resolve} from 'node:path';
import {openStore} from '../backend/store.mjs';
import {promoteAdmin} from '../backend/access.mjs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {restoreSnapshot,startSnapshots} from '../backend/snapshot.mjs';
try{process.loadEnvFile('.env.local');}catch(error){if(error.code!=='ENOENT')throw error;}
const mongo=process.argv.includes('--mongo'),email=process.argv.slice(2).find(arg=>arg!=='--mongo');
if(!email){console.error('Usage: node scripts/promote-admin.mjs <registered-email>');process.exit(1);}
const path=mongo?join(tmpdir(),`sati-promote-${process.pid}.sqlite`):process.env.DATABASE_PATH||resolve('backend/data/sati.sqlite');
if(mongo&&!await restoreSnapshot(path)){console.error('No snapshot in MongoDB: start the hosted backend and register first.');process.exit(1);}
const db=openStore(path,false);
try{
 const snapshots=mongo?startSnapshots(db,path,{restored:true}):null;
 promoteAdmin(db,email);
 await snapshots?.flush();
 console.log(`${email.trim().toLowerCase()} is now an active administrator.${mongo?' Restart the hosted service so it loads this snapshot.':''}`);
}
catch(error){console.error(error.message);process.exitCode=1;}
finally{db.close();}
