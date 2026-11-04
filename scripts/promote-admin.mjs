// One-time bootstrap: make an existing, already-registered account an active administrator.
// Register the account in the app first (so you have proven you hold the password), then run:
//   node scripts/promote-admin.mjs you@example.com
//   docker compose -f deployment/compose.yaml exec backend node scripts/promote-admin.mjs you@example.com
// Further staff should be managed from the admin workspace, not with this script.
import {resolve} from 'node:path';
import {openStore} from '../backend/store.mjs';
import {promoteAdmin} from '../backend/access.mjs';
try{process.loadEnvFile('.env.local');}catch(error){if(error.code!=='ENOENT')throw error;}
const email=process.argv[2];
if(!email){console.error('Usage: node scripts/promote-admin.mjs <registered-email>');process.exit(1);}
const db=openStore(process.env.DATABASE_PATH||resolve('backend/data/sati.sqlite'),false);
try{promoteAdmin(db,email);console.log(`${email.trim().toLowerCase()} is now an active administrator.`);}
catch(error){console.error(error.message);process.exitCode=1;}
finally{db.close();}
