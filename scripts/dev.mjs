import {existsSync} from 'node:fs';
import {spawn} from 'node:child_process';
import {networkInterfaces} from 'node:os';
try {process.loadEnvFile('.env.local');} catch(error) {if(error.code!=='ENOENT')throw error;}
const network=Object.values(networkInterfaces()).flat().filter(i=>i?.family==='IPv4').map(i=>`http://${i.address}:5173`);
const children=[];
const stop=()=>{for(const child of children)child.kill('SIGTERM');};
const launch=(args,env)=>{
 const child=spawn(process.execPath,args,{stdio:'inherit',env:{...process.env,...env}});children.push(child);
 child.on('error',error=>{console.error(error.message);stop();process.exitCode=1;});
 child.on('exit',code=>{stop();if(code)process.exitCode=code;});
};
const running=async url=>{try{return(await fetch(url,{signal:AbortSignal.timeout(1000)})).ok;}catch{return false;}};
const args=process.argv.slice(2),admin=args.includes('--admin');
if(process.env.NLLB_URL&&existsSync('translation/.venv/bin/python')&&!(await running(process.env.NLLB_URL+'/health'))){
 const ai=spawn(process.execPath,['scripts/start-ai.mjs'],{stdio:'inherit',env:process.env});children.push(ai);
 ai.on('error',error=>console.error('Local AI could not start: '+error.message));
 ai.on('exit',code=>{if(code)console.error('Local AI stopped; posts retain labelled keyword screening.');});
}
const backendURL=`http://127.0.0.1:${process.env.API_PORT||3001}/api/health`;
if(await running(backendURL))console.log('Reusing the running Sati backend.');
else launch(['backend/server.mjs'],{ALLOWED_ORIGINS:[process.env.ALLOWED_ORIGINS,...network].filter(Boolean).join(',')});
if(await running('http://127.0.0.1:5173/@vite/client')){
 console.log('Reusing the running user frontend at http://127.0.0.1:5173.');
 if(args.includes('--open')&&!admin&&process.platform==='darwin')spawn('open',['http://127.0.0.1:5173'],{stdio:'ignore'});
}else launch(['node_modules/vite/bin/vite.js',...args.filter(arg=>arg!=='--admin')]);
if(admin){
 if(await running('http://127.0.0.1:5174/@vite/client')){
  console.log('Reusing the running Sati admin at http://127.0.0.1:5174.');
  if(process.platform==='darwin')spawn('open',['http://127.0.0.1:5174'],{stdio:'ignore'});
 }else launch(['node_modules/vite/bin/vite.js','--config','admin/vite.config.ts','--open']);
}
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,stop);
