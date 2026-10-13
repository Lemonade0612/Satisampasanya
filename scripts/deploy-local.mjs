import {execFileSync,spawn} from 'node:child_process';
import {existsSync,writeFileSync,mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {DatabaseSync,backup} from 'node:sqlite';
try{process.loadEnvFile('.env.local');}catch(error){if(error.code!=='ENOENT')throw error;}
const run=(args,options={})=>execFileSync('docker',args,{stdio:'inherit',...options});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
try{
 try{run(['info','--format','{{.ServerVersion}}'],{stdio:'pipe'});}catch{
  if(process.platform==='darwin')spawn('open',['-a','Docker'],{stdio:'ignore'});
  console.log('Waiting for Docker Desktop…');let ready=false;
  for(let i=0;i<45;i++){await wait(1000);try{run(['info'],{stdio:'pipe'});ready=true;break;}catch{}}
  if(!ready)throw new Error('Docker Desktop did not start. Open Docker Desktop, finish its setup, then retry.');
 }
 if(!process.env.ADMIN_EMAILS?.trim())throw new Error('Set your existing admin account in ADMIN_EMAILS before deployment.');
 const envPath='deployment/local.env';
 writeFileSync(envPath,`ADMIN_EMAILS=${process.env.ADMIN_EMAILS.replace(/[\r\n]/g,'')}\nALLOWED_ORIGINS=http://127.0.0.1:8080,http://127.0.0.1:8081,http://localhost:8080,http://localhost:8081\n`,{mode:0o600});
 const compose=['compose','--project-name','sati-local','--env-file',envPath,'-f','deployment/compose.yaml'];
 run([...compose,'build','frontend','admin','backend']);
 const path=process.env.DATABASE_PATH||'backend/data/sati.sqlite';
 if(existsSync(path)){
  const directory=mkdtempSync(join(tmpdir(),'sati-deploy-')),snapshot=join(directory,'sati.sqlite'),db=new DatabaseSync(path,{readOnly:true});
  try{
   await backup(db,snapshot);db.close();
   try{run([...compose,'run','--rm','-T','--no-deps','--entrypoint','sh','backend','-c','if [ -s /data/sati.sqlite ]; then exit 3; fi; cat > /data/sati.sqlite'],{stdio:['pipe','inherit','inherit'],input:readFileSync(snapshot)});console.log('Copied your existing accounts and posts to the empty deployment database.');}
   catch(error){if(error.status===3)console.log('Keeping the existing deployment database.');else throw error;}
  }finally{try{db.close();}catch{}rmSync(directory,{recursive:true,force:true});}
 }
 run([...compose,'up','-d','frontend','admin','backend']);
 console.log('Frontend and admin are running. Preparing the optional AI service…');
 try{
  run([...compose,'build','translation']);
  if(existsSync('translation/cache/hub')){
   let cached=false;try{run([...compose,'run','--rm','-T','--no-deps','--entrypoint','sh','translation','-c','test -f /models/.sati-cache-ready'],{stdio:'pipe'});cached=true;}catch{}
   if(!cached){
    console.log('Copying cached models into Docker storage…');
    const target=spawn('docker',[...compose,'run','--rm','-T','--no-deps','--entrypoint','sh','translation','-c','tar -xf - -C /models && touch /models/.sati-cache-ready'],{stdio:['pipe','inherit','inherit']});
    const source=spawn('tar',['-C','translation/cache','--exclude=*.incomplete','-cf','-','hub'],{stdio:['ignore','pipe','inherit'],env:{...process.env,COPYFILE_DISABLE:'1'}});
    source.stdout.pipe(target.stdin);target.stdin.on('error',()=>source.kill());
    const codes=await Promise.all([source,target].map(child=>new Promise((resolve,reject)=>{child.on('error',reject);child.on('exit',resolve);})));
    if(codes.some(code=>code!==0))throw new Error('Model cache copy did not finish.');
   }
  }
  run([...compose,'up','-d','translation']);
 }catch(error){console.error('AI setup did not finish; keyword screening remains active. Retry this launcher to finish AI setup.');}

 console.log('User app: http://127.0.0.1:8080\nAdmin: http://127.0.0.1:8081\nAI models load on first translation/screening request. Docker keeps these services running.');
 if(process.platform==='darwin'){spawn('open',['http://127.0.0.1:8081'],{stdio:'ignore'});}
}catch(error){console.error(error.message);process.exitCode=1;}
