import {createServer,request as proxyRequest} from 'node:http';
import {readFileSync,existsSync,statSync} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
import {spawn} from 'node:child_process';
try{process.loadEnvFile('.env.local');}catch(error){if(error.code!=='ENOENT')throw error;}
const mode=process.argv[2];
if(mode==='backend'){
 const {createApp}=await import('../backend/server.mjs');const app=createApp({database:process.env.DATABASE_PATH||resolve('backend/data/sati.sqlite'),adminEmails:(process.env.ADMIN_EMAILS||'').split(',').filter(Boolean),seed:process.env.SEED_DEMO!=='false',origins:(process.env.ALLOWED_ORIGINS||'').split(',').filter(Boolean)});
 app.server.on('error',error=>{console.error(error.code==='EADDRINUSE'?'Backend is already running.':error.message);app.db.close();process.exitCode=1;});
 app.server.listen(Number(process.env.API_PORT||3001),process.env.API_HOST||'127.0.0.1',()=>console.log('Sati backend is ready. Keep this window open; closing it stops the service.'));
 for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>app.close().then(()=>process.exit(0)));
}else if(['frontend','admin'].includes(mode)){
 const root=resolve(mode==='admin'?'admin/dist':'dist'),port=mode==='admin'?5174:5173;
 if(!existsSync(resolve(root,'index.html'))){console.error('Built app is missing. Run the preparation launcher once.');process.exit(1);}
 const server=createServer((req,res)=>{
  if(req.url?.startsWith('/api/')){
   const proxy=proxyRequest({hostname:'127.0.0.1',port:Number(process.env.API_PORT||3001),path:req.url,method:req.method,headers:{...req.headers,host:`127.0.0.1:${process.env.API_PORT||3001}`}},upstream=>{res.writeHead(upstream.statusCode||502,upstream.headers);upstream.pipe(res);});
   proxy.on('error',()=>{if(!res.headersSent)res.writeHead(502,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Backend is offline. Double-click Start Backend, then retry.'}));});req.pipe(proxy);return;
  }
  try{
   const path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
   if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end();return;}
   const file=existsSync(path)&&statSync(path).isFile()?path:resolve(root,'index.html');
   const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.json':'application/json'};
   res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'no-cache'});res.end(readFileSync(file));
  }catch{res.writeHead(400);res.end('Invalid request.');}
 });
 const open=()=>{if(process.platform==='darwin')spawn('open',[`http://127.0.0.1:${port}`],{stdio:'ignore'});};
 server.on('error',error=>{if(error.code==='EADDRINUSE'){console.log('App is already running; opening it.');open();}else{console.error(error.message);process.exitCode=1;}});
 server.listen(port,'127.0.0.1',()=>{console.log(`Sati ${mode} ready at http://127.0.0.1:${port}. Keep this window open.`);open();});
 for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>process.exit(0)));
}else{console.error('Choose frontend, admin, or backend.');process.exitCode=1;}
