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
import {put,head,get} from '@vercel/blob';
import {Readable} from 'node:stream';

const BUCKET='sati_snapshots',KEEP=5;
let clientPromise=null;
async function bucket(env=process.env){
 clientPromise??=new MongoClient(env.MONGODB_URI,{serverSelectionTimeoutMS:10000,maxPoolSize:5}).connect().catch(error=>{clientPromise=null;throw error;});
 return new GridFSBucket((await clientPromise).db(env.MONGODB_DATABASE||'sati'),{bucketName:BUCKET});
}
// Vercel Blob (private store, free on Hobby) is used when BLOB_READ_WRITE_TOKEN or BLOB_STORE_ID (OIDC) is set; MongoDB otherwise.
const BLOB_PATH='sati/sati.sqlite';
const blobOn=(env=process.env)=>!!(env.BLOB_READ_WRITE_TOKEN||env.BLOB_STORE_ID);
export const snapshotsEnabled=(env=process.env)=>blobOn(env)||mongoEnabled(env);
async function blobLatest(){try{return (await head(BLOB_PATH)).etag;}catch(e){if(e?.name==='BlobNotFoundError'||/not.?found/i.test(e?.message||''))return null;throw e;}}
async function blobDownload(path){
 const result=await get(BLOB_PATH,{access:'private'});
 if(!result||result.statusCode!==200)return null;
 mkdirSync(dirname(path),{recursive:true});
 for(const suffix of ['','-wal','-shm'])rmSync(path+suffix,{force:true});
 await pipeline(Readable.fromWeb(result.stream),createWriteStream(`${path}.download`));
 renameSync(`${path}.download`,path);
 return result.blob.etag;
}
async function blobUpload(db,path){
 const temp=`${path}.snapshot`;rmSync(temp,{force:true});
 db.exec(`VACUUM INTO '${temp.replaceAll("'","''")}'`);
 try{const result=await put(BLOB_PATH,createReadStream(temp),{access:'private',addRandomSuffix:false,allowOverwrite:true,contentType:'application/x-sqlite3'});return (await head(result.pathname)).etag;}
 finally{rmSync(temp,{force:true});}
}
export async function latestSnapshot(){if(blobOn())return blobLatest();const [latest]=await (await bucket()).find({},{sort:{uploadDate:-1},limit:1,projection:{_id:1}}).toArray();return latest?String(latest._id):null;}
export async function downloadSnapshot(id,path){
 if(blobOn())return blobDownload(path);
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
