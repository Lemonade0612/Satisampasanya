import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {openStore} from '../backend/store.mjs';
import {collectBackup,uploadBackup,downloadBackup,restoreBackup} from '../backend/mongo-backup.mjs';
try{process.loadEnvFile('.env.local');}catch(error){if(error.code!=='ENOENT')throw error;}
let db;
try{
 const [command,backupId,output]=process.argv.slice(2);
 if(command==='backup'){
  const path=process.env.DATABASE_PATH||'backend/data/sati.sqlite';if(!existsSync(path))throw new Error('Local database was not found.');
  db=openStore(path,false);const tables=collectBackup(db);db.close();db=null;const result=await uploadBackup(tables);console.log(`Atlas backup saved: ${result.backupId}`);
 }else if(command==='restore'&&backupId&&output){
  const target=resolve(output);if(existsSync(target))throw new Error('Choose a new output file; existing databases are never overwritten.');
  const tables=await downloadBackup(backupId);db=openStore(target,false);restoreBackup(db,tables);console.log('Backup restored to the requested new database. Sessions were not restored.');
 }else throw new Error('Usage: node scripts/mongo-backup.mjs backup | restore BACKUP_ID NEW_OUTPUT_FILE');
}catch(error){console.error(error.message);process.exitCode=1;}finally{db?.close();}
