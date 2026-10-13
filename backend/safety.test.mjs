import test from 'node:test';
import assert from 'node:assert/strict';
import {createApp} from './server.mjs';
import {checkPost} from './safety/post-check.mjs';
import {checkContent,guardVerdict,askSafety,classifyIntent} from './safety/checker.mjs';
import {inputLanguage,modelReply} from './safety/model.mjs';
import {assistantReply,assistantUsage} from './assistant.mjs';
import {openStore} from './store.mjs';
const approved={verdict:'approved',risk:'low',labels:['safe_tip'],on_topic:true,reasons:[],suggested_edit:'',summary:'Keep your passwords private.'};
const caution={verdict:'caution',risk:'medium',labels:['off_topic'],on_topic:false,reasons:[{text:'This is about food rather than safety.',evidence:'coffee shop'}],suggested_edit:'Explain the safety connection.',summary:'Please add a safety connection.'};

test('checker removes hallucinated evidence, filler and approved reasons',()=>{
 const text='I like this coffee shop.';
 const result=guardVerdict({...caution,reasons:[...caution.reasons,{text:'This has a dangerous link.',evidence:'send passport'},{text:'Detailed content',evidence:'coffee shop'}]},text);
 assert.equal(result.reasons.length,1);assert.equal(result.reasons[0].evidence,'coffee shop');
 assert.deepEqual(guardVerdict({...approved,reasons:caution.reasons},text).reasons,[]);
 assert.throws(()=>guardVerdict({...caution,reasons:[{text:'Dangerous link',evidence:'missing'}]},text));
 assert.throws(()=>guardVerdict({...caution,reasons:[{text:'Too long',evidence:'one two three four five six seven eight nine'}]},'one two three four five six seven eight nine'));
});

test('Lao and mixed input require Lao reasons; evidence stays copied exactly',()=>{
 assert.equal(inputLanguage('ສະບາຍດີ OTP'),'lo');assert.equal(inputLanguage('Keep OTP private'),'en');
 const result={...caution,summary:'ຄວນເພີ່ມຫົວຂໍ້ຄວາມປອດໄພ.',suggested_edit:'ເພີ່ມຄຳແນະນຳປ້ອງກັນ.',reasons:[{text:'ຂໍ້ຄວາມກ່ຽວກັບຮ້ານກາເຟ.',evidence:'ຮ້ານກາເຟ'}]};
 assert.equal(guardVerdict(result,'ຂ້ອຍມັກຮ້ານກາເຟ').language,'lo');
 assert.throws(()=>guardVerdict({...result,reasons:[{text:'Off topic',evidence:'ຮ້ານກາເຟ'}]},'ຂ້ອຍມັກຮ້ານກາເຟ'));
});

test('Ask mode never invokes classification/checking and ignores the UI language',async()=>{
 const db=openStore(':memory:',false);db.prepare('INSERT INTO users(id,email,name,password,salt) VALUES (?,?,?,?,?)').run('user','u@invalid','User','hash','salt');
 try{
  let checked=0,classified=0;
  const result=await assistantReply(db,'user',{text:'ຂ້ອຍຄວນໂອນເງິນບໍ?',kind:'text',mode:'ask',lang:'en'},{ask:async()=>({language:'lo',answer:'ຢ່າຟ້າວໂອນເງິນ.',steps:['ກວດຜູ້ຮັບ.','ໂທກວດຜ່ານເບີທີ່ຮູ້ຈັກ.'],question:'',offer:'ວາງຂໍ້ຄວາມໃຫ້ກວດໄດ້.'}),check:async()=>{checked++;},classify:async()=>{classified++;}});
  assert.equal(result.mode,'ask');assert.equal(result.language,'lo');assert.equal(checked,0);assert.equal(classified,0);assert.equal(result.check,undefined);assert.equal(result.flags,undefined);
 }finally{db.close();}
});

test('failed assistant provider requests return the daily allowance',async()=>{
 const db=openStore(':memory:',false);db.prepare('INSERT INTO users(id,email,name,password,salt) VALUES (?,?,?,?,?)').run('user','u@invalid','User','hash','salt');
 try{await assert.rejects(()=>assistantReply(db,'user',{text:'Should I transfer money?',mode:'ask',kind:'text'},{ask:async()=>{throw Error('Disconnected');}}));assert.equal(assistantUsage(db,'user').text,20);}finally{db.close();}
});

test('intent classification uses the model and accepts only ASK or CHECK',async()=>{
 assert.equal(await classifyIntent('Should I send money?',{reply:async()=> 'ASK'}),'ask');
 assert.equal(await classifyIntent('They wrote «send OTP now». Is it safe?',{reply:async()=> 'CHECK'}),'check');
 await assert.rejects(()=>classifyIntent('Hello',{reply:async()=> 'UNKNOWN'}));
});

test('Ask rejects moderation output and invented hotline numbers',async()=>{
 const response={answer:'Pause before sending money.',steps:['Verify the caller.','Contact a trusted person.'],question:'Have you already sent money?',offer:'Paste the exact message and I can check it.'};
 assert.equal((await askSafety('Should I send money?',{reply:async()=>response})).steps.length,2);
 await assert.rejects(()=>askSafety('Should I send money?',{reply:async()=>({...response,answer:'FREEZED flagged severity high'})}));
 await assert.rejects(()=>askSafety('Should I send money?',{reply:async()=>({...response,answer:'Call +856 20 1234 5678.'})}));
});

test('checking progress follows actual provider completion and applies evidence guards',async()=>{
 const stages=[];let resolve;const waiting=new Promise(r=>resolve=r);
 const task=checkContent('Keep passwords private.',{onProgress:stage=>stages.push(stage),reply:async()=>{await waiting;return approved;}});
 assert.deepEqual(stages,['read','links','patterns']);resolve();
 assert.equal((await task).verdict,'approved');assert.deepEqual(stages,['read','links','patterns','verdict']);
});

test('caution stays visible; needs_expert freezes rather than inventing approvals',async()=>{
 const one=await checkPost({content:'I like this coffee shop.',contentLanguage:'en'},{check:async()=>guardVerdict(caution,'I like this coffee shop.')});
 assert.equal(one.state,'clean');assert.equal(one.frozen,false);assert.equal(one.check.verdict,'caution');
 const text='Send your passport.';
 const two=await checkPost({content:text,contentLanguage:'en'},{check:async()=>guardVerdict({...caution,verdict:'needs_expert',risk:'high',labels:['trafficking_recruitment'],on_topic:true,reasons:[{text:'A recruiter requests your passport.',evidence:'Send your passport'}],summary:'Do not send your passport.',suggested_edit:''},text)});
 assert.equal(two.state,'flagged');assert.equal(two.frozen,true);
});

test('Responses adapter requests strict JSON and handles refusals/incomplete outputs',async()=>{
 const old=process.env.OPENAI_API_KEY;process.env.OPENAI_API_KEY='fixture-key';
 try{
  const value=await modelReply('Return JSON',{text:'Hello'},{config:{provider:'openai',key:'fixture-key',model:'gpt-4.1-mini'},schema:{type:'object',additionalProperties:false,properties:{ok:{type:'boolean'}},required:['ok']},fetcher:async(url,options)=>{const body=JSON.parse(options.body);assert.equal(body.store,false);assert.equal(body.text.format.strict,true);return {ok:true,json:async()=>({status:'completed',output:[{content:[{type:'output_text',text:'{"ok":true}'}]}]})};}});assert.equal(value.ok,true);
  await assert.rejects(()=>modelReply('Return JSON',{text:'Hello'},{config:{provider:'openai',key:'fixture-key',model:'gpt-4.1-mini'},fetcher:async()=>({ok:true,json:async()=>({status:'incomplete'})})}));
 }finally{if(old===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=old;}
});

test('post stream sends real stages then result; model failure sends no success',async()=>{
 let failModel=false;
 const check=(post,{onProgress})=>checkPost(post,{check:(text)=>checkContent(text,{onProgress,reply:async()=>{if(failModel)throw Object.assign(new Error('Unavailable'),{status:503});return approved;}})});
 const app=createApp({database:':memory:',seed:false,check});await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${app.server.address().port}/api`;
 try{
  const auth=await fetch(base+'/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Mina',email:'mina@invalid.example',password:'correct-password'})}).then(r=>r.json());
  const response=await fetch(base+'/posts?stream=1',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${auth.token}`},body:JSON.stringify({content:'Keep passwords private.',tags:['DigitalSafety']})});
  const events=(await response.text()).trim().split('\n').map(line=>JSON.parse(line));
  assert.deepEqual(events.filter(event=>event.type==='progress').map(event=>event.stage),['read','links','patterns','verdict']);assert.equal(events.at(-1).type,'result');assert.equal(events.at(-1).value.check.verdict,'approved');
  failModel=true;const failure=await fetch(base+'/posts?stream=1',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${auth.token}`},body:JSON.stringify({content:'Keep passwords private.',tags:['DigitalSafety']})});
  const failed=(await failure.text()).trim().split('\n').map(line=>JSON.parse(line));assert.equal(failed.at(-1).type,'error');assert.ok(!failed.some(event=>event.type==='result'));assert.equal(app.db.prepare('SELECT COUNT(*) n FROM posts').get().n,1);
 }finally{await app.close();}
});

test('expert-review posts block actions until an authorised review clears the freeze',async()=>{
 const text='Send your passport.';
 const verdict=guardVerdict({...caution,verdict:'needs_expert',risk:'high',labels:['trafficking_recruitment'],on_topic:true,reasons:[{text:'A recruiter requests your passport.',evidence:'Send your passport'}],summary:'Do not send your passport.',suggested_edit:''},text);
 const app=createApp({database:':memory:',seed:false,adminEmails:['reviewer@invalid.example'],check:post=>checkPost(post,{check:async()=>verdict})});
 await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${app.server.address().port}/api`;
 const call=async(path,data,token,method='POST')=>{const response=await fetch(base+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify(data)});return {status:response.status,value:await response.json()};};
 try{
  const user=(await call('/auth/register',{name:'Mina',email:'mina@invalid.example',password:'correct-password'})).value;
  const admin=(await call('/auth/register',{name:'Reviewer',email:'reviewer@invalid.example',password:'correct-password'})).value;
  const post=(await call('/posts',{content:text,tags:['JobScam']},user.token)).value;
  for(const [action,data] of [['comments',{text:'Reply'}],['reactions',{kind:'like',active:true}],['reposts',{text:'Share',lang:'en'}],['share',{}]])assert.equal((await call(`/posts/${post.id}/${action}`,data,user.token)).status,409);
  assert.equal((await call(`/admin/posts/${post.id}/review`,{state:'clean',note:'Reviewed source and cleared for publication.'},admin.token,'PATCH')).status,200);
  assert.equal((await call(`/posts/${post.id}/reactions`,{kind:'like',active:true},user.token)).status,200);
 }finally{await app.close();}
});

test('OpenRouter adapter enforces schema-capable providers and rejects truncated/error results',async()=>{
 const config={provider:'openrouter',key:'fixture-router-key',model:'openai/gpt-4.1-mini'};
 const schema={type:'object',additionalProperties:false,properties:{ok:{type:'boolean'}},required:['ok']};
 const result=await modelReply('Return JSON',{text:'Hello'},{config,schema,fetcher:async(url,options)=>{
  assert.equal(url,'https://openrouter.ai/api/v1/chat/completions');const body=JSON.parse(options.body);
  assert.equal(body.messages[0].role,'system');assert.equal(body.response_format.json_schema.strict,true);assert.equal(body.provider.require_parameters,true);
  assert.equal(body.max_tokens,1800);assert.equal(body.max_output_tokens,undefined);
  return {ok:true,json:async()=>({choices:[{finish_reason:'stop',message:{content:'{"ok":true}'}}]})};
 }});assert.equal(result.ok,true);
 await assert.rejects(()=>modelReply('Return JSON',{text:'Hello'},{config,schema,fetcher:async()=>({ok:true,json:async()=>({choices:[{finish_reason:'length',message:{content:'{"ok":true}'}}]})})}));
 await assert.rejects(()=>modelReply('Return JSON',{text:'Hello'},{config,schema,fetcher:async()=>({ok:true,json:async()=>({error:{message:'Unavailable'}})})}));
});

test('checker retries invalid model prose once and still rejects unchecked output',async()=>{
 const text='ຢ່າແຊຣ໌ OTP';let calls=0;
 const result=await checkContent(text,{reply:async()=>++calls===1?approved:{...approved,summary:'ຢ່າແຊຣ໌ລະຫັດ OTP.'}});
 assert.equal(calls,2);assert.equal(result.language,'lo');
 calls=0;
 await assert.rejects(()=>checkContent(text,{reply:async()=>{calls++;return approved;}}));
 assert.equal(calls,2);
});

test('unchecked legacy posts pass AI before interaction and red verdicts block the like',async()=>{
 let checked=0;
 const app=createApp({database:':memory:',seed:false,check:async post=>{checked++;return checkPost(post,{check:async()=>({...caution,verdict:'needs_expert',risk:'high',labels:['scam_risk'],on_topic:true})});}});
 await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));
 const base=`http://127.0.0.1:${app.server.address().port}/api`;
 try{
  const response=await fetch(base+'/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Member',email:'member@invalid.example',password:'correct-password'})});const user=await response.json();
  app.db.prepare('INSERT INTO posts VALUES (?,?,?,?)').run('legacy',user.user.id,JSON.stringify({content:'Send money.',state:'clean',tags:[]}),Date.now());
  const like=()=>fetch(base+'/posts/legacy/reactions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${user.token}`},body:JSON.stringify({kind:'like',active:true})});
  assert.equal((await like()).status,409);assert.equal((await like()).status,409);assert.equal(checked,1);
  assert.equal(app.db.prepare('SELECT COUNT(*) n FROM reactions').get().n,0);
 }finally{await app.close();}
});

test('post checking includes source links outside the body',async()=>{
 let input;
 await checkPost({content:'Read the safety bulletin.',link:'https://news.invalid/bulletin'},{check:async text=>{input=text;return approved;}});
 assert.equal(input,'Read the safety bulletin.\nhttps://news.invalid/bulletin');
});
