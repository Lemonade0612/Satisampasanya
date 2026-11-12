// Vercel serverless storage: each function instance keeps SQLite in /tmp and syncs whole-file
// snapshots with MongoDB Atlas GridFS (same bucket as snapshot.mjs).
// Before a request: if Atlas holds a newer snapshot than the one this instance loaded, reload it.
// After a request that changed data: upload a fresh snapshot before the function freezes.
// Limit: two instances writing at the same moment are last-writer-wins. Fine for demo traffic.
import {MongoClient,GridFSBucket} from 'mongodb';
import {createReadStream,createWriteStream,rmSync,renameSync,mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
import {pipeline} from 'node:stream/promises';
import {snapshotsEnabled} from './snapshot.mjs';

const BUCKET='sati_snapshots',KEEP=5;
let clientPromise=null;
async function bucket(env=process.env){
 clientPromise??=new MongoClient(env.MONGODB_URI,{serverSelectionTimeoutMS:10000,maxPoolSize:5}).connect().catch(error=>{clientPromise=null;throw error;});
 return new GridFSBucket((await clientPromise).db(env.MONGODB_DATABASE||'sati'),{bucketName:BUCKET});
}
export async function latestSnapshot(){const [latest]=await (await bucket()).find({},{sort:{uploadDate:-1},limit:1,projection:{_id:1}}).toArray();return latest?String(latest._id):null;}
export async function downloadSnapshot(id,path){
 const b=await bucket(),[file]=await b.find({},{sort:{uploadDate:-1},limit:1}).toArray();
 if(!file)return null;
 mkdirSync(dirname(path),{recursive:true});
 for(const suffix of ['','-wal','-shm'])rmSync(path+suffix,{force:true});
 await pipeline(b.openDownloadStream(file._id),createWriteStream(`${path}.download`));
 renameSync(`${path}.download`,path);
 return String(file._id);
}
export async function uploadSnapshot(db,path){
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
export {snapshotsEnabled};
