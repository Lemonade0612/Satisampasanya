// Vercel entry point: every /api/* request runs the existing node:http handler from backend/server.mjs.
import {createApp} from '../backend/server.mjs';
import {manageUser} from '../backend/access.mjs';
import {snapshotsEnabled,latestSnapshot,downloadSnapshot,uploadSnapshot} from '../backend/serverless.mjs';

const DATABASE='/tmp/sati/sati.sqlite';
// Sati's own public sites are always allowed; ALLOWED_ORIGINS adds more (e.g. preview URLs).
const SITES=['https://sati-coral.vercel.app','https://sati-admin-xi.vercel.app'];
const origins=()=>[...SITES,...(process.env.ALLOWED_ORIGINS||'').split(',').map(s=>s.trim()).filter(Boolean)];
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
// ADMIN_EMAIL + ADMIN_PASSWORD (Vercel env, never in the repo) guarantee one admin login exists,
// even on a fresh demo database. An existing account with that email is left unchanged.
async function ensureAdmin(){
 // The admin form maps a bare username like "admin" to admin@sati.app.
 const email=(process.env.ADMIN_EMAIL||'admin@sati.app').trim().toLowerCase(),password=process.env.ADMIN_PASSWORD;
 if(!email||!password||app.db.prepare('SELECT id FROM users WHERE lower(email)=?').get(email))return;
 await manageUser(app.db,{id:'vercel-env-bootstrap'},{name:'Sati Administrator',email,password,role:'admin',status:'active'},null,[]);
}
const changes=()=>app.db.prepare('SELECT total_changes() n').get().n;

export default async function handler(req,res){
 // vercel.json rewrites /api/* here. Restore the original path if the runtime reports the rewritten one.
 {const u=new URL(req.url,'http://x'),p=u.searchParams.get('__path');u.searchParams.delete('__path');
  if(p!==null&&/^\/api(\/index)?$/.test(u.pathname))u.pathname='/api/'+p;
  req.url=u.pathname+u.search;}
 // Long-lived SSE cannot run on serverless: 204 tells EventSource to stop, and the app polls instead.
 if(req.url.split('?')[0]==='/api/events'){res.statusCode=204;res.setHeader('Cache-Control','no-store');return res.end();}
 try{const step=async()=>{await sync();await ensureAdmin();};ready=(ready||Promise.resolve()).then(step,step);await ready;}
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
