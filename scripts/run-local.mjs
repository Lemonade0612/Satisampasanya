import {spawn} from 'node:child_process';
import {existsSync} from 'node:fs';
try{process.loadEnvFile('.env.local');}catch(error){if(error.code!=='ENOENT')throw error;}
const children=[],alive=async url=>{try{return(await fetch(url,{signal:AbortSignal.timeout(1000)})).ok;}catch{return false;}};
const start=(file,args=[])=>{const child=spawn(process.execPath,[file,...args],{stdio:'inherit',env:process.env});children.push(child);child.on('error',e=>console.error(e.message));return child;};
if(existsSync('translation/.venv/bin/python')&&!(await alive('http://127.0.0.1:3002/health')))start('scripts/start-ai.mjs');
if(!(await alive(`http://127.0.0.1:${process.env.API_PORT||3001}/api/health`)))start('scripts/start-service.mjs',['backend']);
start('scripts/start-service.mjs',['frontend']);start('scripts/start-service.mjs',['admin']);
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{for(const child of children)child.kill(signal);});
