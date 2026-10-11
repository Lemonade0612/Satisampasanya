import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, openSync, closeSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';

const args=process.argv.slice(2);
if(args.includes('--help')) {
  console.log('Usage: npm run ios:live [-- --target DEVICE_ID --url http://127.0.0.1:5173]\n       npm run ios:run [-- --target DEVICE_ID]\nUses xcodebuild and simctl directly with Device Hub.');
  process.exit(0);
}
const live=args.includes('--live');
let target, url='http://127.0.0.1:5173';
for(let i=0;i<args.length;i++) {
  if(args[i]==='--live')continue;
  if(['--target','--url'].includes(args[i])&&args[i+1]) {
    if(args[i]==='--target')target=args[++i];else url=args[++i];
  } else {console.error(`Unknown or incomplete option: ${args[i]}. Use --help.`);process.exit(1);}
}
const run=(command,argv,options={})=>execFileSync(command,argv,{stdio:'inherit',...options});
let original, configPath;
try {
  if(process.platform!=='darwin')throw new Error('The iPhone build requires macOS with Xcode installed.');
  if(live) {
    const parsed=new URL(url);
    if(!['http:','https:'].includes(parsed.protocol))throw new Error('Use an HTTP or HTTPS live-preview URL.');
    try {const response=await fetch(parsed,{signal:AbortSignal.timeout(4000)});if(!response.ok)throw new Error();}
    catch {throw new Error(`Start npm run dev in another terminal first. Cannot reach ${url}.`);}
  }
  const {devices}=JSON.parse(run('xcrun',['simctl','list','devices','available','--json'],{encoding:'utf8',stdio:'pipe'}));
  const available=Object.values(devices).flat().filter(d=>d.isAvailable);
  const booted=available.filter(d=>d.state==='Booted');
  let device=target?available.find(d=>d.udid===target):booted.length===1?booted[0]:undefined;
  if(!target&&booted.length>1)throw new Error('Multiple simulators are running. Select one with --target DEVICE_ID.');
  if(!device&&!target)device=available.find(d=>d.name==='iPhone 18 Pro')||available.find(d=>d.name.startsWith('iPhone'));
  if(!device)throw new Error('Simulator not found. Start your iPhone in Device Hub, or pass --target DEVICE_ID.');
  if(device.state!=='Booted')run('xcrun',['simctl','boot',device.udid]);
  run('xcrun',['simctl','bootstatus',device.udid,'-b']);
  run('npm',['run','ios:sync']);
  configPath='ios/App/App/capacitor.config.json';
  original=readFileSync(configPath,'utf8');
  const config=JSON.parse(original);
  if(live) {config.server={...config.server,url,cleartext:new URL(url).protocol==='http:'};writeFileSync(configPath,JSON.stringify(config,null,2)+'\n');}
  const suffix=createHash('sha256').update(process.cwd()).digest('hex').slice(0,10);
  const derived=join(tmpdir(),`sati-ios-${suffix}`), log=join(tmpdir(),`sati-ios-${suffix}.log`);
  const fd=openSync(log,'w');
  console.log(`Building Sati Dev for ${device.name}. Build log: ${log}`);
  try {
    run('xcodebuild',['-project','ios/App/App.xcodeproj','-scheme','App','-configuration','Debug','-sdk','iphonesimulator','-destination',`id=${device.udid}`,'-derivedDataPath',derived,'CODE_SIGNING_ALLOWED=NO','build'],{stdio:['ignore',fd,fd]});
  } catch {
    console.error(readFileSync(log,'utf8').split('\n').slice(-40).join('\n'));
    throw new Error(`Native build failed. Full log: ${log}`);
  } finally {closeSync(fd);}
  const app=join(derived,'Build/Products/Debug-iphonesimulator/App.app');
  try {run('xcrun',['simctl','terminate',device.udid,config.appId],{stdio:'pipe'});}catch{/* The app may not yet be running. */}
  run('xcrun',['simctl','install',device.udid,app]);
  run('xcrun',['simctl','launch',device.udid,config.appId]);
  console.log(live?`Sati Dev is running with live updates from ${url}. Keep npm run dev running.`:'Sati Dev is installed with bundled web assets.');
} catch(error) {console.error(error.message);process.exitCode=1;}
finally {if(original!==undefined&&configPath)writeFileSync(configPath,original);}
