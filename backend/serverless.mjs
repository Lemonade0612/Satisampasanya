// Vercel serverless storage: each function instance keeps SQLite in /tmp and syncs whole-file
// snapshots with MongoDB Atlas GridFS (same bucket as snapshot.mjs).
// Before a request: if Atlas holds a newer snapshot than the one this instance loaded, reload it.
// After a request that changed data: upload a fresh snapshot before the function freezes.
// Limit: two instances writing at the same moment are last-writer-wins. Fine for demo traffic.
import {MongoClient,GridFSBucket} from 'mongodb';
import {createReadStream,createWriteStream,rmSync,renameSync,mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
import {pipeline} from 'node:stream/promises';
import {snapshotsEnabled as mongoEnabled} from './snapshot.mjs';
import {put,list,get,del} from '@vercel/blob';
import {Readable} from 'node:stream';

const BUCKET='sati_snapshots',KEEP=5;
let clientPromise=null;
async function bucket(env=process.env){
 clientPromise??=new MongoClient(env.MONGODB_URI,{serverSelectionTimeoutMS:10000,maxPoolSize:5}).connect().catch(error=>{clientPromise=null;throw error;});
 return new GridFSBucket((await clientPromise).db(env.MONGODB_DATABASE||'sati'),{bucketName:BUCKET});
}
// Vercel Blob (private store, free on Hobby) is used when BLOB_READ_WRITE_TOKEN or BLOB_STORE_ID (OIDC) is set; MongoDB otherwise.
const BLOB_DIR='sati/',isSnap=n=>/\/\d{15}\.sqlite$/.test(n);
const blobOn=(env=process.env)=>!!(env.BLOB_READ_WRITE_TOKEN||env.BLOB_STORE_ID);
export const snapshotsEnabled=(env=process.env)=>blobOn(env)||mongoEnabled(env);
// Every snapshot gets its own file name (a CDN may serve an overwritten name stale); the newest name wins.
async function blobLatest(){
 const all=[];let cursor;
 do{const page=await list({prefix:BLOB_DIR,cursor});all.push(...page.blobs);cursor=page.hasMore?page.cursor:undefined;}while(cursor);
 return all.map(b=>b.pathname).filter(isSnap).sort().pop()||null;
}
async function blobDownload(path,id){
 const result=await get(id,{access:'private'});
 if(!result||result.statusCode!==200)return null;
 mkdirSync(dirname(path),{recursive:true});
 for(const suffix of ['','-wal','-shm'])rmSync(path+suffix,{force:true});
 await pipeline(Readable.fromWeb(result.stream),createWriteStream(`${path}.download`));
 renameSync(`${path}.download`,path);
 return id;
}
async function blobUpload(db,path){
 const temp=`${path}.snapshot`;rmSync(temp,{force:true});
 db.exec(`VACUUM INTO '${temp.replaceAll("'","''")}'`);
 try{
  const name=`${BLOB_DIR}${String(Date.now()).padStart(15,'0')}.sqlite`;
  const result=await put(name,createReadStream(temp),{access:'private',addRandomSuffix:false,contentType:'application/x-sqlite3'});
  const old=(await list({prefix:BLOB_DIR})).blobs.map(b=>b.pathname).filter(isSnap).sort().slice(0,-KEEP);
  if(old.length)await del(old).catch(()=>{});
  return result.pathname;
 }finally{rmSync(temp,{force:true});}
}
export async function latestSnapshot(){if(blobOn())return blobLatest();const [latest]=await (await bucket()).find({},{sort:{uploadDate:-1},limit:1,projection:{_id:1}}).toArray();return latest?String(latest._id):null;}
export async function downloadSnapshot(id,path){
 if(blobOn())return blobDownload(path,id);
 const b=await bucket(),[file]=await b.find({},{sort:{uploadDate:-1},limit:1}).toArray();
 if(!file)return null;
 mkdirSync(dirname(path),{recursive:true});
 for(const suffix of ['','-wal','-shm'])rmSync(path+suffix,{force:true});
 await pipeline(b.openDownloadStream(file._id),createWriteStream(`${path}.download`));
 renameSync(`${path}.download`,path);
 return String(file._id);
}
export async function uploadSnapshot(db,path){
 if(blobOn())return blobUpload(db,path);
 const temp=`${path}.snapshot`;rmSync(temp,{force:true});
 db.exec(`VACUUM INTO '${temp.replaceAll("'","''")}'`);
 try{
  const b=await bucket(),stream=b.openUploadStream(`sati-${new Date().toISOString()}.sqlite`);
  await pipeline(createReadStream(temp),stream);
  const old=await b.find({},{sort:{uploadDate:-1},skip:KEEP,projection:{_id:1}}).toArray();
  for(const file of old)await b.delete(file._id).catch(()=>{});
  return String(stream.id);
 }finally{rmSync(temp,{force:true});}
}
