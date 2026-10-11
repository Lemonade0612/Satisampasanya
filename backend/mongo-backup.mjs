import {MongoClient} from 'mongodb';
import {randomUUID} from 'node:crypto';
export const backupTables=['users','user_access','posts','comments','reactions','notifications','access_audit'];
export function collectBackup(db){
 db.exec('BEGIN');
 try{const tables=Object.fromEntries(backupTables.map(table=>[table,db.prepare(`SELECT * FROM ${table}`).all().map(row=>({...row}))]));db.exec('COMMIT');return tables;}
 catch(error){db.exec('ROLLBACK');throw error;}
}
export function restoreBackup(db,tables){
 if(backupTables.some(table=>!Array.isArray(tables[table])))throw new Error('Backup is incomplete.');
 if(db.prepare('SELECT COUNT(*) n FROM users').get().n||db.prepare('SELECT COUNT(*) n FROM posts').get().n)throw new Error('Restore requires an empty database.');
 db.exec('BEGIN');
 try{
  for(const table of backupTables){const columns=db.prepare(`PRAGMA table_info(${table})`).all().map(column=>column.name);for(const row of tables[table]){const keys=Object.keys(row);if(keys.some(key=>!columns.includes(key)))throw new Error('Backup contains unexpected columns.');db.prepare(`INSERT INTO ${table} (${keys.join(',')}) VALUES (${keys.map(()=>'?').join(',')})`).run(...keys.map(key=>row[key]));}}
  db.exec('COMMIT');
 }catch(error){db.exec('ROLLBACK');throw error;}
}
async function withMongo(action){
 const uri=process.env.MONGODB_URI;
 if(!uri||/[<>]/.test(uri)||!/^mongodb(?:\+srv)?:\/\//.test(uri))throw new Error('Set a complete MONGODB_URI privately before using Atlas backups.');
 let client;
 try{client=new MongoClient(uri,{serverSelectionTimeoutMS:10000});await client.connect();return await action(client.db(process.env.MONGODB_DATABASE||'sati'));}
 catch(error){if(error.message.startsWith('Backup '))throw error;throw new Error('MongoDB backup operation failed. Check private credentials, Atlas network access, and database permissions.');}
 finally{await client?.close();}
}
export async function uploadBackup(tables){return withMongo(async db=>{
 const backupId=randomUUID(),records=db.collection('sati_backup_records'),manifests=db.collection('sati_backup_manifests');
 await records.createIndex({backupId:1,table:1});
 const manifest={backupId,createdAt:Date.now(),version:1,status:'pending',counts:Object.fromEntries(backupTables.map(table=>[table,tables[table].length]))};
 await manifests.insertOne(manifest);
 for(const table of backupTables){const rows=tables[table].map(payload=>({backupId,table,payload}));for(let i=0;i<rows.length;i+=100)await records.insertMany(rows.slice(i,i+100));}
 await manifests.updateOne({backupId},{$set:{status:'complete'}});return {backupId,counts:manifest.counts};
});}
export async function downloadBackup(backupId){return withMongo(async db=>{
 const manifest=await db.collection('sati_backup_manifests').findOne({backupId,status:'complete',version:1});
 if(!manifest)throw new Error('Backup was not found or is incomplete.');
 const tables={};for(const table of backupTables){tables[table]=(await db.collection('sati_backup_records').find({backupId,table}).toArray()).map(row=>row.payload);if(tables[table].length!==manifest.counts[table])throw new Error('Backup record counts do not match.');}return tables;
});}
