// Vercel entry point: every /api/* request runs the existing node:http handler from backend/server.mjs.
import {createApp} from '../backend/server.mjs';
import {snapshotsEnabled,latestSnapshot,downloadSnapshot,uploadSnapshot} from '../backend/serverless.mjs';

const DATABASE='/tmp/sati/sati.sqlite';
const origins=()=>(process.env.ALLOWED_ORIGINS||'').split(',').map(s=>s.trim()).filter(Boolean);
let app=null,loadedId=null,ready=null;

async function sync(){
 if(!snapshotsEnabled()){app??=createApp({database:DATABASE,seed:true,trustProxy:true,origins:origins()});return;}
 const latest=await latestSnapshot();
 if(app&&latest===loadedId)return;
 if(app){app.db.close();app=null;}
 const id=latest?await downloadSnapshot(latest,DATABASE):null;
 app=createApp({database:DATABASE,seed:!id,trustProxy:true,origins:origins()});
 loadedId=id;
 if(!id)loadedId=await uploadSnapshot(app.db,DATABASE);
}
const changes=()=>app.db.prepare('SELECT total_changes() n').get().n;

export default async function handler(req,res){
 // Long-lived SSE cannot run on serverless: 204 tells EventSource to stop, and the app polls instead.
 if(req.url.split('?')[0]==='/api/events'){res.statusCode=204;res.setHeader('Cache-Control','no-store');return res.end();}
 try{ready=(ready||Promise.resolve()).then(sync,sync);await ready;}
 catch(error){console.error('storage sync failed:',error.message);res.statusCode=503;res.setHeader('Content-Type','application/json');return res.end(JSON.stringify({error:'Storage is unavailable. Please try again.'}));}
 const current=app,before=changes();
 const finished=new Promise(resolve=>{res.on('finish',resolve);res.on('close',resolve);});
 current.server.emit('request',req,res);
 await finished;
 if(current===app&&snapshotsEnabled()&&changes()!==before){
  try{loadedId=await uploadSnapshot(current.db,DATABASE);}catch(error){console.error('snapshot upload failed:',error.message);}
 }
 await current.deliver().catch(()=>{});
}
