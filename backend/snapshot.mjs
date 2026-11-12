// Durable storage for hosts without a persistent disk (Render free tier).
// The live database stays a local SQLite file; MongoDB Atlas (GridFS) holds whole-file snapshots.
// Boot: restore the newest snapshot before opening the store. Running: upload a fresh snapshot
// within a few seconds of any change. Shutdown: upload once more before exiting.
import {MongoClient,GridFSBucket} from 'mongodb';
import {createReadStream,createWriteStream,rmSync,renameSync,statSync,mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
import {pipeline} from 'node:stream/promises';

const BUCKET='sati_snapshots',KEEP=5;
const validUri=uri=>!!uri&&!/[<>]/.test(uri)&&/^mongodb(?:\+srv)?:\/\//.test(uri);
export const snapshotsEnabled=(env=process.env)=>validUri(env.MONGODB_URI);

async function connect(env){
 const client=new MongoClient(env.MONGODB_URI,{serverSelectionTimeoutMS:15000});
 await client.connect();
 return {client,bucket:new GridFSBucket(client.db(env.MONGODB_DATABASE||'sati'),{bucketName:BUCKET})};
}

// Returns true when a snapshot was written to `path`; false when Mongo has none (fresh install).
export async function restoreSnapshot(path,env=process.env){
 const {client,bucket}=await connect(env);
 try{
  const [latest]=await bucket.find({},{sort:{uploadDate:-1},limit:1}).toArray();
  if(!latest){console.log('No snapshot in MongoDB yet: starting a new database.');return false;}
  mkdirSync(dirname(path),{recursive:true});
  for(const suffix of ['','-wal','-shm'])rmSync(path+suffix,{force:true});
  const temp=`${path}.download`;
  await pipeline(bucket.openDownloadStream(latest._id),createWriteStream(temp));
  renameSync(temp,path);
  console.log(`restored snapshot ${latest.uploadDate.toISOString()} (${latest.length} bytes)`);
  return true;
 }finally{await client.close();}
}

// Polls SQLite's change counter; uploads at most once per `interval` ms and only after changes.
// `restored`: the file already matches Mongo, so skip uploading until something changes.
export function startSnapshots(db,path,{env=process.env,interval=5000,restored=false}={}){
 const changes=()=>db.prepare('SELECT total_changes() n').get().n;
 let conn=null,running=Promise.resolve(),saved=restored?changes():-1;
 const upload=async()=>{
  const now=changes();if(now===saved)return;
  const temp=`${path}.snapshot`;rmSync(temp,{force:true});
  db.exec(`VACUUM INTO '${temp.replaceAll("'","''")}'`);
  try{
   conn??=await connect(env);
   const name=`sati-${new Date().toISOString()}.sqlite`;
   await pipeline(createReadStream(temp),conn.bucket.openUploadStream(name));
   saved=now;console.log(`backup ok ${statSync(temp).size} bytes`);
   const old=await conn.bucket.find({},{sort:{uploadDate:-1},skip:KEEP,projection:{_id:1}}).toArray();
   for(const file of old)await conn.bucket.delete(file._id);
  }catch(error){console.error('backup failed:',error.message);await conn?.client.close().catch(()=>{});conn=null;}
  finally{rmSync(temp,{force:true});}
 };
 const run=()=>(running=running.then(upload,upload));
 const timer=setInterval(run,interval);timer.unref();
 return {flush:async()=>{clearInterval(timer);await run();await conn?.client.close().catch(()=>{});conn=null;}};
}
