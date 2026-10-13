import {spawn} from 'node:child_process';
import {existsSync} from 'node:fs';
const python='translation/.venv/bin/python';
if(!existsSync(python)){console.error('Open Prepare AI.command once before starting local AI.');process.exit(1);}
const child=spawn(python,['translation/service.py',...process.argv.slice(2)],{stdio:'inherit'});
child.on('error',error=>{console.error(error.message);process.exitCode=1;});
child.on('exit',code=>{process.exitCode=code||0;});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
