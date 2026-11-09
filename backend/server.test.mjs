import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { createApp } from './server.mjs';
import {checkPost} from './safety/post-check.mjs';
import {guardVerdict} from './safety/checker.mjs';
import { digest } from './auth.mjs';
import { promoteAdmin } from './access.mjs';

async function fixture(options={}) {
  const result=text=>guardVerdict({verdict:'approved',risk:'low',labels:[],on_topic:true,reasons:[],suggested_edit:'',summary:/[຀-໿]/.test(text)?'ກວດຂໍ້ຄວາມແລ້ວ.':'The message has been checked.'},text);
  const app=createApp({database:':memory:',seed:false,hostedTranslation:async()=>{throw Object.assign(new Error('Translation unavailable'),{status:503});},check:post=>checkPost(post,{check:async text=>result(text)}),assistantServices:{check:async text=>result(text),classify:async()=> 'check'},...options});
  await new Promise(r=>app.server.listen(0,'127.0.0.1',r));
  const base=`http://127.0.0.1:${app.server.address().port}/api`;
  const call=async(path,method='GET',data,token,extra={})=>{const response=await fetch(base+path,{method,headers:{...(data?{'Content-Type':'application/json'}:{}),...(token?{Authorization:`Bearer ${token}`} : {}),...extra},body:data?JSON.stringify(data):undefined});return {status:response.status,value:await response.json()};};
  const register=async(email='alice@example.com')=>(await call('/auth/register','POST',{name:email.split('@')[0],email,password:'correct-password'})).value;
  const admin=async email=>{const account=await register(email);promoteAdmin(app.db,email);return account;};
  return {...app,base,call,register,admin};
}
const draft={content:'English safety advice',contentLo:'ຄຳແນະນຳຄວາມປອດໄພ',tags:['DigitalSafety']};

test('registration, password verification, hashed sessions, logout and protected writes',async()=>{
 const f=await fixture();try{
  assert.equal((await f.call('/posts','POST',draft)).status,401);
  const user=await f.register();assert.ok(user.token);assert.ok(user.user.id);
  const row=f.db.prepare('SELECT * FROM users').get();assert.notEqual(row.password,'correct-password');assert.equal(row.password.length,128);
  assert.notEqual(f.db.prepare('SELECT token FROM sessions').get().token,user.token);
  assert.equal((await f.call('/auth/login','POST',{email:'alice@example.com',password:'wrong-password'})).status,401);
  assert.equal((await f.call('/auth/login','POST',{email:'ALICE@example.com',password:'correct-password'})).status,200);
  assert.equal((await f.call('/auth/me','GET',undefined,user.token)).value.password,undefined);
  assert.equal((await f.call('/auth/register','POST',{name:'Other',email:'alice@example.com',password:'correct-password'})).status,409);
  await f.call('/auth/logout','POST',{},user.token);
  assert.equal((await f.call('/auth/me','GET',undefined,user.token)).status,401);
 }finally{await f.close();}
});

test('bilingual posts and compressed images persist; server owns identity and verification',async()=>{
 const f=await fixture();try{
  const user=await f.register();
  const posted=await f.call('/posts','POST',{...draft,image:'data:image/jpeg;base64,/9j/2Q==',state:'confirmed',points:999,author:{name:'Fake'}},user.token);
  assert.equal(posted.status,201);assert.equal(posted.value.contentLo,draft.contentLo);assert.equal(posted.value.author.id,user.user.id);assert.equal(posted.value.state,'clean');assert.equal(posted.value.points,undefined);
  assert.equal((await f.call('/posts')).value[0].image,'data:image/jpeg;base64,/9j/2Q==');
  const lao=await f.call('/posts','POST',{content:'',contentLo:draft.contentLo,tags:draft.tags},user.token);
  assert.equal(lao.value.contentLanguage,'lo');assert.equal(lao.value.content,draft.contentLo);
 }finally{await f.close();}
});

test('real comments, idempotent likes, toggling, reposts, and notifications',async()=>{
 const f=await fixture();try{
  const alice=await f.register(),bob=await f.register('bob@example.com');
  const post=(await f.call('/posts','POST',draft,alice.token)).value;
  const reaction={kind:'like',active:true};
  await f.call(`/posts/${post.id}/reactions`,'POST',reaction,bob.token);
  await f.call(`/posts/${post.id}/reactions`,'POST',reaction,bob.token);
  let rows=(await f.call('/posts','GET',undefined,bob.token)).value;
  assert.equal(rows[0].likes,1);assert.equal(rows[0].liked,true);
  assert.equal((await f.call('/posts','GET',undefined,alice.token)).value[0].liked,false);
  await f.call(`/posts/${post.id}/reactions`,'POST',{kind:'like',active:false},bob.token);
  assert.equal((await f.call('/posts')).value[0].likes,0);
  await f.call(`/posts/${post.id}/comments`,'POST',{text:'ຂອບໃຈ'},bob.token);
  const comments=(await f.call(`/posts/${post.id}/comments`)).value;assert.equal(comments.length,1);assert.equal(comments[0].author.id,bob.user.id);
  await f.call(`/posts/${post.id}/reposts`,'POST',{text:'ແບ່ງປັນ',lang:'lo'},bob.token);
  rows=(await f.call('/posts')).value;assert.equal(rows.find(p=>p.id===post.id).reposts,1);assert.equal(rows[0].contentLo,'ແບ່ງປັນ');
  const alerts=(await f.call('/alerts','GET',undefined,alice.token)).value;assert.equal(alerts.length,3);assert.ok(alerts.every(a=>a.read===0));
  await f.call('/alerts/read','POST',{id:alerts[0].id},bob.token);assert.equal((await f.call('/alerts','GET',undefined,alice.token)).value[0].read,0);
  await f.call('/alerts/read','POST',{},alice.token);assert.ok((await f.call('/alerts','GET',undefined,alice.token)).value.every(a=>a.read===1));
 }finally{await f.close();}
});

test('profile updates persist and cannot change another user',async()=>{
 const f=await fixture();try{
  const alice=await f.register(),bob=await f.register('bob@example.com');
  await f.call('/posts','POST',draft,alice.token);
  const update=await f.call('/profile','PATCH',{id:bob.user.id,name:'Alice Updated',bio:'New bio',following:[bob.user.id],followed:['DigitalSafety'],avatar:'data:image/jpeg;base64,/9j/2Q=='},alice.token);
  assert.equal(update.value.id,alice.user.id);assert.equal(update.value.bio,'New bio');assert.deepEqual(update.value.following,[bob.user.id]);
  assert.equal((await f.call('/auth/me','GET',undefined,bob.token)).value.name,'bob');
  assert.equal((await f.call('/posts')).value[0].author.name,'Alice Updated');
 }finally{await f.close();}
});

test('source validation, attachment limits, origins and actual posting quotas',async()=>{
 const f=await fixture();try{
  const user=await f.register();
  for(const invalid of [{...draft,link:'javascript:alert(1)'},{...draft,tags:['bad tag!']},{...draft,image:'data:image/svg+xml;base64,PHN2Zz4='},{...draft,isNews:true,link:''},{...draft,content:'x'.repeat(2001)}])assert.equal((await f.call('/posts','POST',invalid,user.token)).status,400);
  assert.equal((await f.call('/posts','GET',undefined,undefined,{Origin:'https://untrusted.example'})).status,403);
  const post=(await f.call('/posts','POST',draft,user.token)).value;for(let i=1;i<5;i++)assert.equal((await f.call('/posts','POST',draft,user.token)).status,201);
  assert.equal((await f.call('/posts','POST',draft,user.token)).status,429);
  for(let i=0;i<5;i++)assert.equal((await f.call(`/posts/${post.id}/comments`,'POST',{text:`Reply ${i}`},user.token)).status,200);
  assert.equal((await f.call(`/posts/${post.id}/comments`,'POST',{text:'Over quota'},user.token)).status,429);
 }finally{await f.close();}
});

test('SSE broadcasts a change when another device posts',async()=>{
 const f=await fixture();const abort=new AbortController();try{
  const user=await f.register();const response=await fetch(f.base+'/events',{signal:abort.signal});assert.equal(response.headers.get('content-type'),'text/event-stream');
  const reader=response.body.getReader();assert.match(new TextDecoder().decode((await reader.read()).value),/event: change/);
  await f.call('/posts','POST',draft,user.token);
  assert.match(new TextDecoder().decode((await reader.read()).value),/event: change/);
  await reader.cancel();
 }finally{abort.abort();await f.close();}
});

test('database and session survive backend restart',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'sati-test-')),database=join(dir,'sati.sqlite');let f=await fixture({database});
 try{const user=await f.register();await f.call('/posts','POST',draft,user.token);await f.close();f=await fixture({database});assert.equal((await f.call('/posts')).value.length,1);assert.equal((await f.call('/auth/me','GET',undefined,user.token)).value.id,user.user.id);}
 finally{await f.close();rmSync(dir,{recursive:true,force:true});}
});

test('password reset expires, invalidates sessions and is single use',async()=>{
 const f=await fixture();try{
  const user=await f.register(),token=randomBytes(32).toString('hex');f.db.prepare('INSERT INTO resets VALUES (?,?,?)').run(digest(token),user.user.id,Date.now()+60000);
  assert.equal((await f.call('/auth/reset','POST',{token,password:'new-password'})).status,200);
  assert.equal((await f.call('/auth/me','GET',undefined,user.token)).status,401);
  assert.equal((await f.call('/auth/reset','POST',{token,password:'new-password'})).status,400);
  assert.equal((await f.call('/auth/login','POST',{email:'alice@example.com',password:'new-password'})).status,200);
 }finally{await f.close();}
});

test('custom English and Lao hashtags persist and AI screening runs',async()=>{
 const f=await fixture();try{
  const user=await f.register();
  const posted=await f.call('/posts','POST',{...draft,tags:['MyCommunity','ຄວາມປອດໄພ','mycommunity']},user.token);
  assert.equal(posted.status,201);assert.equal(posted.value.tags.length,2);
  assert.equal(posted.value.screening.mode,'ai');assert.ok(posted.value.screening.checkedAt);assert.equal(posted.value.screeningStage,'completed');
  assert.equal((await f.call('/profile','PATCH',{followed:['MyCommunity','ຄວາມປອດໄພ']},user.token)).status,200);
  const missing=await f.call('/translate','POST',{text:'Hello',target:'lo'},user.token);assert.equal(missing.status,503);
 }finally{await f.close();}
});

test('AI enrichment translates either direction, preserves manual text and falls back on failure',async()=>{
 const {enrichPost}=await import('./intelligence.mjs');
 const analyze=async()=>({english:'English warning',lao:'ຄຳເຕືອນ',severity:'low',flags:[],note:'Checked',noteLo:'ກວດແລ້ວ'});
 let post=await enrichPost({...draft,contentLo:undefined,contentLanguage:'en',state:'clean'},{enabled:true,analyze});
 assert.equal(post.contentLo,'ຄຳເຕືອນ');assert.equal(post.screening.mode,'ai');assert.equal(post.translationStatus,'generated');
 post=await enrichPost({...draft,content:draft.contentLo,contentLanguage:'lo',state:'clean'},{enabled:true,analyze});assert.equal(post.content,'English warning');
 post=await enrichPost({...draft,contentLanguage:'en',state:'clean'},{enabled:true,analyze});assert.equal(post.content,draft.content);assert.equal(post.contentLo,draft.contentLo);
 post=await enrichPost({...draft,contentLo:undefined,contentLanguage:'en',state:'clean'},{enabled:true,analyze:async()=>{throw Error('Offline');}});assert.equal(post.screening.mode,'rules-fallback');assert.equal(post.translationStatus,'failed');
});

test('AI adapter uses structured responses and rejects malformed provider output',async()=>{
 const {aiAnalyze}=await import('./intelligence.mjs');const previous=process.env.OPENAI_API_KEY;process.env.OPENAI_API_KEY='mock-test-key';
 try {
  const value={english:'Hello',lao:'ສະບາຍດີ',severity:'none',flags:[],note:'Checked',noteLo:'ກວດແລ້ວ'};
  const result=await aiAnalyze('Hello','',async(url,options)=>{assert.equal(url,'https://api.openai.com/v1/responses');const request=JSON.parse(options.body);assert.equal(request.store,false);assert.equal(request.text.format.type,'json_schema');return {ok:true,json:async()=>({output:[{content:[{type:'output_text',text:JSON.stringify(value)}]}]})};});
  assert.equal(result.lao,value.lao);
  await assert.rejects(()=>aiAnalyze('Hello','',async()=>({ok:true,json:async()=>({output:[]})})),/usable translation/);
  await assert.rejects(()=>aiAnalyze('Hello','',async()=>({ok:false})),/unavailable/);
 }finally{if(previous===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=previous;}
});

test('admin access is restricted and review decisions persist in the public feed',async()=>{
 const f=await fixture();try{
  assert.equal((await f.call('/admin/dashboard')).status,401);
  const regular=await f.register();
  assert.equal((await f.call('/admin/dashboard','GET',undefined,regular.token)).status,403);
  const admin=await f.admin('admin@example.com');
  const posted=await f.call('/posts','POST',draft,regular.token);
  const snapshot=await f.call('/admin/dashboard','GET',undefined,admin.token);
  assert.equal(snapshot.status,200);assert.equal(snapshot.value.totals.users,2);
  assert.equal(snapshot.value.users[0].password,undefined);
  assert.equal((await f.call(`/admin/posts/${posted.value.id}/review`,'PATCH',{state:'confirmed',note:'Evidence checked'},regular.token)).status,403);
  assert.equal((await f.call(`/admin/posts/${posted.value.id}/review`,'PATCH',{state:'invalid',note:'Evidence checked'},admin.token)).status,400);
  assert.equal((await f.call(`/admin/posts/${posted.value.id}/review`,'PATCH',{state:'confirmed',note:'  '},admin.token)).status,400);
  const reviewed=await f.call(`/admin/posts/${posted.value.id}/review`,'PATCH',{state:'confirmed',note:'Evidence checked'},admin.token);
  assert.equal(reviewed.status,200);assert.equal(reviewed.value.review.reviewerId,admin.user.id);
  const feed=(await f.call('/posts')).value;
  assert.equal(feed[0].state,'confirmed');assert.equal(feed[0].screeningStage,'completed');
  const staffView=(await f.call('/admin/dashboard','GET',undefined,admin.token)).value.posts[0];
  assert.equal(staffView.correction,'Evidence checked');assert.equal(staffView.review.note,'Evidence checked');
  const cleared=await f.call(`/admin/posts/${posted.value.id}/review`,'PATCH',{state:'false',note:'Source disproves the claim'},admin.token);
  assert.equal(cleared.value.state,'false');assert.equal(cleared.value.screeningLogs.length,2);
 }finally{await f.close();}
});

test('every admin endpoint rejects signed-out users and members, even ones who claim a role',async()=>{
 const f=await fixture();try{
  const admin=await f.admin('admin@example.com');
  const posted=await f.call('/posts','POST',draft,admin.token);
  // A member cannot grant themselves a role at sign-up or through their profile.
  const member=(await f.call('/auth/register','POST',{name:'Mallory',email:'mallory@example.com',password:'correct-password',role:'admin'})).value;
  assert.equal((await f.call('/profile','PATCH',{role:'admin',access:{role:'admin'}},member.token)).status,200);
  const routes=[
   ['/admin/dashboard','GET'],
   ['/admin/users','GET'],
   ['/admin/users','POST',{name:'Sneaky',email:'sneaky@example.com',password:'correct-password',role:'admin'}],
   [`/admin/users/${member.user.id}`,'PATCH',{role:'admin'}],
   [`/admin/posts/${posted.value.id}/review`,'PATCH',{state:'confirmed',note:'Self-approved'}],
   ['/admin/anything-new','GET'],
  ];
  for(const [path,method,data] of routes){
   assert.equal((await f.call(path,method,data)).status,401,`${method} ${path} signed out`);
   assert.equal((await f.call(path,method,data,member.token)).status,403,`${method} ${path} as member`);
  }
  assert.equal((await f.call('/admin/auth/login','POST',{email:'mallory@example.com',password:'correct-password'})).status,403);
  assert.equal((await f.call('/admin/dashboard','GET',undefined,admin.token)).value.users.find(u=>u.email==='mallory@example.com').role,'member');
  assert.equal(f.db.prepare("SELECT COUNT(*) n FROM users WHERE email='sneaky@example.com'").get().n,0);
  assert.equal((await f.call('/posts')).value.find(p=>p.id===posted.value.id).review,undefined);
 }finally{await f.close();}
});

test('admins manage accounts; viewers cannot review or manage; deactivation revokes sessions',async()=>{
 const f=await fixture();try{
  const admin=await f.admin('admin@example.com');
  const create=await f.call('/admin/users','POST',{name:'Insights Analyst',email:'viewer@example.com',password:'correct-password',role:'viewer',unit:'Safety',status:'active'},admin.token);
  assert.equal(create.status,201);assert.equal(create.value.role,'viewer');assert.equal(create.value.password,undefined);
  const viewer=(await f.call('/auth/login','POST',{email:'viewer@example.com',password:'correct-password'})).value;
  const insights=await f.call('/admin/dashboard','GET',undefined,viewer.token);
  assert.equal(insights.status,200);assert.equal(insights.value.permissions.canReview,false);assert.deepEqual(insights.value.users,[]);
  assert.equal((await f.call('/admin/users','POST',{name:'No'},viewer.token)).status,403);
  const posted=await f.call('/posts','POST',draft,admin.token);
  assert.equal((await f.call(`/admin/posts/${posted.value.id}/review`,'PATCH',{state:'confirmed',note:'No permission'},viewer.token)).status,403);
  const promote=await f.call(`/admin/users/${create.value.id}`,'PATCH',{role:'reviewer'},admin.token);
  assert.equal(promote.status,200);assert.equal((await f.call('/auth/me','GET',undefined,viewer.token)).status,401);
  const reviewer=(await f.call('/auth/login','POST',{email:'viewer@example.com',password:'correct-password'})).value;
  assert.equal((await f.call(`/admin/posts/${posted.value.id}/review`,'PATCH',{state:'false',note:'Checked the source'},reviewer.token)).status,200);
  assert.equal((await f.call(`/admin/users/${create.value.id}`,'PATCH',{status:'inactive'},admin.token)).status,200);
  assert.equal((await f.call('/auth/me','GET',undefined,reviewer.token)).status,401);
  assert.equal((await f.call('/auth/login','POST',{email:'viewer@example.com',password:'correct-password'})).status,403);
  assert.equal((await f.call(`/admin/users/${admin.user.id}`,'PATCH',{role:'viewer'},admin.token)).status,400);
  assert.equal((await f.call('/admin/users','POST',{name:'Duplicate',email:'viewer@example.com',password:'correct-password'},admin.token)).status,409);
  assert.equal(f.db.prepare("SELECT COUNT(*) n FROM access_audit WHERE action<>'bootstrap-admin'").get().n,3);
 }finally{await f.close();}
});

test('MongoDB backup payload restores accounts, roles and posts without restoring sessions',async()=>{
 const {collectBackup,restoreBackup}=await import('./mongo-backup.mjs');
 const {openStore}=await import('./store.mjs');
 const f=await fixture();const restored=openStore(':memory:',false);
 try{
  const admin=await f.admin('admin@example.com');
  const account=await f.call('/admin/users','POST',{name:'Reader',email:'reader@example.com',password:'correct-password',role:'viewer',unit:'Insights'},admin.token);
  await f.call('/posts','POST',draft,admin.token);
  const snapshot=collectBackup(f.db);assert.equal(snapshot.sessions,undefined);assert.equal(snapshot.resets,undefined);
  restoreBackup(restored,snapshot);
  assert.equal(restored.prepare('SELECT COUNT(*) n FROM posts').get().n,1);
  assert.equal(restored.prepare('SELECT role,unit FROM user_access WHERE user_id=?').get(account.value.id).role,'viewer');
  assert.equal(restored.prepare('SELECT COUNT(*) n FROM sessions').get().n,0);
  assert.throws(()=>restoreBackup(restored,snapshot),/empty database/);
 }finally{restored.close();await f.close();}
});

test('NLLB translation is independent of screening and supplied bilingual text is preserved',async()=>{
 const {enrichPost}=await import('./intelligence.mjs');
 const english={content:'Safety guidance',contentLanguage:'en',tags:['DigitalSafety'],state:'clean'};
 let translations=0,screens=0;
 await enrichPost(english,{enabled:false,nllb:true,translate:async(text,source,target)=>{translations++;assert.equal(source,'en');assert.equal(target,'lo');return 'ຄຳແນະນຳ';},screen:async()=>{screens++;return {severity:'none',flags:[],note:'Model checked',noteLo:'ກວດແລ້ວ'};}});
 assert.equal(english.translationProvider,'NLLB-200');assert.equal(english.screening.mode,'ai');assert.equal(translations,1);assert.equal(screens,1);
 const bilingual={content:'Safety guidance',contentLo:'ຄຳແນະນຳ',contentLanguage:'en',tags:['DigitalSafety'],state:'clean'};
 await enrichPost(bilingual,{enabled:false,nllb:true,translate:async()=>{throw new Error('Must not replace manual text');},screen:async()=>({severity:'none',flags:[],note:'Checked',noteLo:'ກວດແລ້ວ'})});
 assert.equal(bilingual.translationStatus,'manual');assert.equal(bilingual.contentLo,'ຄຳແນະນຳ');
 const offline={content:'Safety guidance',contentLanguage:'en',tags:['DigitalSafety'],state:'clean'};
 await enrichPost(offline,{enabled:false,nllb:true,translate:async()=>{throw new Error('Offline');},screen:async()=>{throw new Error('Offline');}});
 assert.equal(offline.content,'Safety guidance');assert.equal(offline.translationStatus,'failed');assert.equal(offline.screening.mode,'rules-fallback');
});

test('moderation avoids substring insults and safety tags cannot bypass off-topic checks',async()=>{
 const {enrichPost}=await import('./intelligence.mjs');
 for(const content of ['A shell protects the equipment. Verify the official safety source.','Scam operators target people; stop and verify the investment.','The government should explain service fees clearly. Citizens deserve transparent information.']){
  const post=await enrichPost({...draft,content,contentLo:undefined,state:'clean'},{enabled:false,nllb:false});
  assert.ok(!post.screening.flags.some(f=>/Profanity detected|Animal insults detected/.test(f)),content);
 }
 const lao=await enrichPost({...draft,content:'',contentLo:'ສະບາຍດີ ຂ້ອຍມີຄວາມໝັ້ນໃຈໃນຕົນເອງ ແລະ ກວດສອບຄວາມປອດໄພ.',state:'clean'},{enabled:false,nllb:false});
 assert.ok(!lao.screening.flags.some(f=>/Profanity detected|Animal insults detected/.test(f)));

});

test('assistant quotas are independent per user and kind, persisted and reset by Laos day',async()=>{
 const f=await fixture();try{
  const alice=await f.register(),bob=await f.register('bob@example.com');
  assert.equal((await f.call('/assistant','POST',{text:'Check my OTP safety',kind:'text',lang:'en'})).status,401);
  for(let i=0;i<20;i++)assert.equal((await f.call('/assistant','POST',{text:'Keep OTP private',kind:'text',lang:'en'},alice.token)).status,200);
  assert.equal((await f.call('/assistant','POST',{text:'OTP',kind:'text',lang:'en'},alice.token)).status,429);
  for(let i=0;i<10;i++)assert.equal((await f.call('/assistant','POST',{text:'Verify official safety sources',kind:'post',lang:'en'},alice.token)).status,200);
  assert.equal((await f.call('/assistant','POST',{text:'OTP',kind:'post',lang:'en'},alice.token)).status,429);
  assert.deepEqual((await f.call('/assistant/usage','GET',undefined,bob.token)).value,{text:20,post:10});
  f.db.prepare("UPDATE assistant_usage SET day='2000-01-01' WHERE user_id=?").run(alice.user.id);
  assert.deepEqual((await f.call('/assistant/usage','GET',undefined,alice.token)).value,{text:20,post:10});
 }finally{await f.close();}
});

test('approval and news notifications reach the intended users',async()=>{
 const f=await fixture();try{
  const author=await f.register(),viewer=await f.register('viewer@example.com'),admin=await f.admin('admin@example.com');
  const post=(await f.call('/posts','POST',{...draft,isNews:true,link:'https://example.com/source'},author.token)).value;
  assert.equal((await f.call('/alerts','GET',undefined,viewer.token)).value.length,0);
  assert.equal((await f.call('/alerts','GET',undefined,author.token)).value.length,0);
  assert.equal((await f.call(`/admin/posts/${post.id}/review`,'PATCH',{state:'clean',note:'Approved after source review'},admin.token)).status,200);
  assert.equal((await f.call('/alerts','GET',undefined,viewer.token)).value[0].kind,'news');
  const notification=(await f.call('/alerts','GET',undefined,author.token)).value[0];
  assert.equal(notification.kind,'review');assert.equal(notification.review_state,'clean');assert.equal(notification.post_id,post.id);
 }finally{await f.close();}
});

test('English assistant screening does not wait for an unnecessary Lao translation',async()=>{
 const {enrichPost}=await import('./intelligence.mjs');
 const post=await enrichPost({...draft,contentLo:undefined,contentLanguage:'en',state:'clean'},{enabled:false,nllb:true,translateMissing:false,translate:async()=>{throw Error('Should not translate');},screen:async()=>({severity:'none',flags:[],note:'Screened',noteLo:'ກວດແລ້ວ'})});
 assert.equal(post.screening.mode,'ai');assert.equal(post.translationStatus,'unavailable');assert.equal(post.contentLo,undefined);
});

test('AI-approved safety warnings are not escalated solely for scam-related keywords',async()=>{
 const {enrichPost}=await import('./intelligence.mjs');
 const screen=async()=>({severity:'none',flags:[],note:'Screened',noteLo:'ກວດແລ້ວ'});
 const warning=await enrichPost({...draft,content:'Keep your OTP private. Verify the official bank app.',state:'clean'},{enabled:false,nllb:true,screen});
 assert.equal(warning.screening.severity,'none');assert.equal(warning.state,'clean');
 const abuse=await enrichPost({...draft,content:'You are a fucking idiot.',state:'clean'},{enabled:false,nllb:true,screen});
 assert.equal(abuse.state,'flagged');assert.ok(abuse.screening.flags.some(flag=>flag.includes('Profanity detected')));
});

test('daily repost cap, cached plain reposts, source attribution and unique completed shares',async()=>{
 let checked=0;
 const f=await fixture({check:async post=>{checked++;post.check={verdict:'approved',risk:'low',labels:['safe_tip'],on_topic:true,reasons:[],suggested_edit:'',summary:'Keep your OTP private.',language:'en'};post.state='clean';post.frozen=false;return post;}});
 try{
  const author=await f.register('author@example.com'),reader=await f.register('reader@example.com');
  const original=(await f.call('/posts','POST',draft,author.token)).value;
  await f.call(`/posts/${original.id}/reposts`,'POST',{text:''},reader.token);
  assert.equal(checked,1);
  await f.call(`/posts/${original.id}/reposts`,'POST',{text:''},reader.token);
  assert.equal(f.db.prepare("SELECT COUNT(*) n FROM posts WHERE json_extract(data,'$.repostOf')=?").get(original.id).n,1);
  const feed=(await f.call('/posts')).value;
  assert.equal(feed.find(p=>p.repostOf)?.originalPost.author.id,author.user.id);
  for(let i=1;i<10;i++)assert.equal((await f.call(`/posts/${original.id}/reposts`,'POST',{text:'Stay safe '+i},reader.token)).status,200);
  assert.equal((await f.call(`/posts/${original.id}/reposts`,'POST',{text:'Over cap'},reader.token)).status,429);
  await f.call(`/posts/${original.id}/share`,'POST',{},reader.token);
  assert.equal(f.db.prepare('SELECT COUNT(*) n FROM shares').get().n,0);
  await f.call(`/posts/${original.id}/share`,'POST',{completed:true},reader.token);
  await f.call(`/posts/${original.id}/share`,'POST',{completed:true},reader.token);
  assert.equal(f.db.prepare('SELECT COUNT(*) n FROM shares').get().n,1);
  const updated=(await f.call('/posts')).value.find(p=>p.id===original.id);
  assert.ok(updated.communityRanking.parts.engagement>0);
 }finally{await f.close();}
});

test('public person profiles and activity show the actual actors without private account fields',async()=>{
 const f=await fixture();try{
  const author=await f.register('author@example.com'),reader=await f.register('reader@example.com');
  f.db.prepare('UPDATE users SET profile=? WHERE id=?').run(JSON.stringify({handle:'@reader'}),reader.user.id);
  const post=(await f.call('/posts','POST',draft,author.token)).value;
  await f.call(`/posts/${post.id}/reactions`,'POST',{kind:'like',active:true},reader.token);
  await f.call(`/posts/${post.id}/share`,'POST',{completed:true},reader.token);
  await f.call(`/posts/${post.id}/comments`,'POST',{text:'Thank you for this reminder.'},reader.token);
  const activity=(await f.call(`/posts/${post.id}/activity`)).value;
  assert.equal(activity.likes[0].id,reader.user.id);assert.equal(activity.shares[0].handle,'@reader');
  assert.deepEqual(activity.helpful,[]);
  const profile=(await f.call(`/people/${author.user.id}`)).value;
  assert.equal(profile.posts[0].id,post.id);assert.equal(profile.person.id,author.user.id);
  assert.equal(profile.person.email,undefined);assert.equal(profile.person.password,undefined);
  const comments=(await f.call(`/posts/${post.id}/comments`)).value;
  assert.equal(comments[0].author.handle,'@reader');
 }finally{await f.close();}
});

test('admin sign-in rejects members without creating sessions and supports managed staff',async()=>{
 const f=await fixture();try{
  const owner=await f.admin('owner@example.com');
  const alice=await f.register('alice@example.com');
  const bob=await f.register('bob@example.com');
  const before=f.db.prepare('SELECT COUNT(*) n FROM sessions').get().n;
  assert.equal((await f.call('/admin/auth/login','POST',{email:'alice@example.com',password:'correct-password'})).status,403);
  assert.equal(f.db.prepare('SELECT COUNT(*) n FROM sessions').get().n,before);
  const staff=await f.call('/admin/auth/login','POST',{email:' OWNER@example.com ',password:'correct-password'});
  assert.equal(staff.status,200);
  assert.equal((await f.call('/admin/dashboard','GET',undefined,staff.value.token)).status,200);
  assert.equal((await f.call('/admin/dashboard','GET',undefined,alice.token)).status,403);
  await f.call('/auth/logout','POST',{},alice.token);
  assert.equal((await f.call('/auth/me','GET',undefined,alice.token)).status,401);
  assert.equal((await f.call('/auth/me','GET',undefined,bob.token)).value.id,bob.user.id);
  assert.equal((await f.call('/auth/me','GET',undefined,owner.token)).status,200);
 }finally{await f.close();}
});


test('sign-in preserves intentional whitespace in passwords',async()=>{
 const f=await fixture();try{
  const data={name:'Whitespace account',email:'spaces@example.com',password:'  correct-password  '};
  assert.equal((await f.call('/auth/register','POST',data)).status,200);
  assert.equal((await f.call('/auth/login','POST',data)).status,200);
  assert.equal((await f.call('/auth/login','POST',{...data,password:data.password.trim()})).status,401);
 }finally{await f.close();}
});

test('API home redirects browsers to the separate admin workspace',async()=>{
 const f=await fixture();try{
  const response=await fetch(f.base.replace(/\/api$/,''),{redirect:'manual'});
  assert.equal(response.status,302);
  assert.equal(response.headers.get('location'),process.env.ADMIN_URL||'http://127.0.0.1:5174');
  assert.equal((await f.call('/admin/dashboard')).status,401);
 }finally{await f.close();}
});

test('device tokens receive APNs pushes with the unread badge, once per alert',async()=>{
 const sent=[];
 const f=await fixture({push:async(token,payload)=>{sent.push({token,payload});return {status:token.startsWith('dead')?410:200,reason:''};}});try{
  const alice=await f.register(),bob=await f.register('bob@example.com');
  const token='a'.repeat(64),dead='dead'+'0'.repeat(60);
  assert.equal((await f.call('/devices','POST',{token},undefined)).status,401);
  assert.equal((await f.call('/devices','POST',{token:'not hex!'},alice.token)).status,400);
  assert.equal((await f.call('/devices','POST',{token,lang:'lo'},alice.token)).status,200);
  await f.call('/devices','POST',{token:dead},alice.token);
  const post=(await f.call('/posts','POST',draft,alice.token)).value;
  await f.call(`/posts/${post.id}/reactions`,'POST',{kind:'like',active:true},bob.token);
  await f.deliver();
  assert.equal(sent.length,2);
  const push=sent.find(s=>s.token===token).payload;
  assert.equal(push.aps.badge,1);assert.equal(push.postId,post.id);assert.equal(push.kind,'like');assert.match(push.aps.alert.body,/^bob ມັກໂພສຂອງທ່ານ$/);
  assert.equal(f.db.prepare('SELECT COUNT(*) n FROM device_tokens WHERE token=?').get(dead).n,0,'expired tokens are dropped');
  await f.deliver();assert.equal(sent.length,2,'each alert is pushed only once');
  await f.call('/devices/remove','POST',{token},alice.token);
  assert.equal(f.db.prepare('SELECT COUNT(*) n FROM device_tokens').get().n,0);
 }finally{await f.close();}
});

test('registering an email listed in ADMIN_EMAILS grants no staff access; only a managed promotion does',async()=>{
 // Regression: accessFor used to grant admin to any account whose email matched ADMIN_EMAILS,
 // so whoever registered that address first (without proving ownership) became an administrator.
 const f=await fixture({adminEmails:['director@example.com']});try{
  const squatter=await f.register('director@example.com');
  assert.equal((await f.call('/admin/dashboard','GET',undefined,squatter.token)).status,403);
  assert.equal((await f.call('/admin/users','POST',{name:'X',email:'x@example.com',password:'correct-password',role:'admin'},squatter.token)).status,403);
  assert.equal((await f.call('/admin/auth/login','POST',{email:'director@example.com',password:'correct-password'})).status,403);
    assert.throws(()=>promoteAdmin(f.db,'nobody@example.com'),/No account/);
  const owner=await f.register('owner@example.com');
  promoteAdmin(f.db,'OWNER@example.com');
  assert.equal((await f.call('/admin/dashboard','GET',undefined,owner.token)).status,200);
  assert.equal(f.db.prepare("SELECT action FROM access_audit WHERE target_id=?").get(owner.user.id).action,'bootstrap-admin');
 }finally{await f.close();}
});

test('flagged, rejected and false-alarm posts are hidden from everyone but their author and staff',async()=>{
 // Regression: moderation only locked interactions. Held posts, with their links and images, stayed in
 // the public feed, on profiles, and behind comments/activity, even after a reviewer rejected them.
 const flagged=text=>guardVerdict({verdict:'needs_expert',risk:'high',labels:['trafficking_recruitment'],on_topic:true,reasons:[{text:'Unsolicited job contact over WhatsApp is a recruitment signal.',evidence:'message WhatsApp now'}],suggested_edit:'',summary:'This job offer needs expert review.'},text);
 const approve=text=>guardVerdict({verdict:'approved',risk:'low',labels:[],on_topic:true,reasons:[],suggested_edit:'',summary:/[຀-໿]/.test(text)?'ກວດຂໍ້ຄວາມແລ້ວ.':'The message has been checked.'},text);
 const f=await fixture({check:post=>checkPost(post,{check:async text=>text.includes('WhatsApp')?flagged(text):approve(text)})});try{
  const author=await f.register(),other=await f.register('bob@example.com'),admin=await f.admin('admin@example.com');
  const held=(await f.call('/posts','POST',{content:'Job in Thailand, message WhatsApp now',tags:['JobScam'],link:'https://evil.invalid/apply'},author.token)).value;
  const fine=(await f.call('/posts','POST',draft,author.token)).value;
  assert.equal(held.state,'flagged');
  const ids=async token=>(await f.call('/posts','GET',undefined,token)).value.map(p=>p.id);
  const profileIds=async token=>(await f.call(`/people/${author.user.id}`,'GET',undefined,token)).value.posts.map(p=>p.id);
  for(const token of [undefined,other.token]){
   assert.ok(!(await ids(token)).includes(held.id));assert.ok((await ids(token)).includes(fine.id));
   assert.ok(!(await profileIds(token)).includes(held.id));
   assert.equal((await f.call(`/posts/${held.id}/comments`,'GET',undefined,token)).status,404);
   assert.equal((await f.call(`/posts/${held.id}/activity`,'GET',undefined,token)).status,404);
  }
  assert.equal((await f.call(`/posts/${held.id}/reactions`,'POST',{kind:'like',active:true},other.token)).status,404);
  assert.equal((await f.call(`/posts/${held.id}/translate`,'POST',{},other.token)).status,404);
  const own=(await f.call('/posts','GET',undefined,author.token)).value.find(p=>p.id===held.id);
  assert.equal(own.link,'https://evil.invalid/apply');assert.ok((await profileIds(author.token)).includes(held.id));
  assert.equal((await f.call(`/posts/${held.id}/comments`,'GET',undefined,author.token)).status,200);
  // A reviewer rejection keeps it hidden; staff still see everything.
  await f.call(`/admin/posts/${held.id}/review`,'PATCH',{state:'rejected',note:'Recruitment post'},admin.token);
  assert.ok(!(await ids(other.token)).includes(held.id));
  assert.ok((await f.call('/admin/dashboard','GET',undefined,admin.token)).value.posts.some(p=>p.id===held.id));
  // A plain repost made while the original was clean disappears once the original is marked a false alarm.
  const repost=await f.call(`/posts/${fine.id}/reposts`,'POST',{text:''},other.token);assert.equal(repost.status,200);
  const repostId=f.db.prepare("SELECT id FROM posts WHERE json_extract(data,'$.repostOf')=?").get(fine.id).id;
  assert.ok((await ids(undefined)).includes(repostId));
  await f.call(`/admin/posts/${fine.id}/review`,'PATCH',{state:'false',note:'Claim disproved'},admin.token);
  assert.ok(!(await ids(undefined)).includes(fine.id));assert.ok(!(await ids(undefined)).includes(repostId));
  assert.ok(!(await ids(other.token)).includes(repostId));
 }finally{await f.close();}
});

test('news alerts to every user need a staff author or a reviewer approval, and fire once',async()=>{
 // Regression: any account could set isNews and every user got an in-app alert and APNs push
 // ("<display name> published a news update"), even when screening had flagged the post.
 const hold=text=>guardVerdict({verdict:'needs_expert',risk:'high',labels:['trafficking_recruitment'],on_topic:true,reasons:[{text:'Unsolicited job contact over WhatsApp is a recruitment signal.',evidence:'message WhatsApp now'}],suggested_edit:'',summary:'This job offer needs expert review.'},text);
 const approve=text=>guardVerdict({verdict:'approved',risk:'low',labels:[],on_topic:true,reasons:[],suggested_edit:'',summary:/[຀-໿]/.test(text)?'ກວດຂໍ້ຄວາມແລ້ວ.':'The message has been checked.'},text);
 const f=await fixture({check:post=>checkPost(post,{check:async text=>text.includes('WhatsApp')?hold(text):approve(text)})});try{
  const member=await f.register(),viewer=await f.register('viewer@example.com'),admin=await f.admin('admin@example.com');
  const news=async(token,content)=>(await f.call('/posts','POST',{content,tags:['DigitalSafety'],isNews:true,link:'https://news.invalid/a'},token)).value;
  const newsAlerts=async()=>f.db.prepare("SELECT post_id FROM notifications WHERE kind='news' AND user_id=?").all(viewer.user.id).map(r=>r.post_id);
  const flagged=await news(member.token,'Job in Thailand, message WhatsApp now');
  const clean=await news(member.token,'Police warn about fake bank SMS.');
  assert.deepEqual(await newsAlerts(),[]);
  await f.call(`/admin/posts/${flagged.id}/review`,'PATCH',{state:'rejected',note:'Recruitment'},admin.token);
  assert.deepEqual(await newsAlerts(),[]);
  await f.call(`/admin/posts/${clean.id}/review`,'PATCH',{state:'clean',note:'Source checked'},admin.token);
  await f.call(`/admin/posts/${clean.id}/review`,'PATCH',{state:'confirmed',note:'Source checked again'},admin.token);
  assert.deepEqual(await newsAlerts(),[clean.id]);
  const staffHeld=await news(admin.token,'Agency says message WhatsApp now for visas');
  const staffClean=await news(admin.token,'Ministry confirms new hotline.');
  assert.deepEqual((await newsAlerts()).sort(),[clean.id,staffClean.id].sort());
  assert.ok(!(await newsAlerts()).includes(staffHeld.id));
 }finally{await f.close();}
});

test('display names impersonating Sati or officials are reserved for members',async()=>{
 const f=await fixture();try{
  const register=(name,email)=>f.call('/auth/register','POST',{name,email,password:'correct-password'});
  for(const [i,name] of ['Sati Official','sati','S.A.T.I','S a t i Team','Ѕati Support','Satisampasanya','The 0fficial Page','ສະຕິ ລາວ','ທາງການ'].entries())
   assert.equal((await register(name,`r${i}@example.com`)).status,400,name);
  assert.equal((await register('Satit Phommachanh','satit@example.com')).status,200);
  const user=await f.register();
  assert.equal((await f.call('/profile','PATCH',{name:'Official Sati'},user.token)).status,400);
  assert.equal((await f.call('/profile','PATCH',{name:'Alice Safety'},user.token)).status,200);
  const admin=await f.admin('admin@example.com');
  assert.equal((await f.call('/admin/users','POST',{name:'Sati Moderation Team',email:'mod@example.com',password:'correct-password',role:'reviewer'},admin.token)).status,201);
 }finally{await f.close();}
});

test('rate limits key on the proxy-supplied client IP, which clients cannot spoof without a trusted proxy',async()=>{
 // Regression: limits keyed on the socket address, so behind nginx every user shared one bucket and
 // one client could exhaust the 20/min auth allowance for everyone.
 let n=0;const login=(f,ip)=>f.call('/auth/login','POST',{email:`nobody${n++}@example.com`,password:'wrong-password'},undefined,{'X-Real-IP':ip});
 let f=await fixture({trustProxy:true});try{
  for(let i=0;i<20;i++)assert.notEqual((await login(f,'203.0.113.1')).status,429);
  assert.equal((await login(f,'203.0.113.1')).status,429);
  assert.notEqual((await login(f,'203.0.113.2')).status,429);
 }finally{await f.close();}
 f=await fixture();try{
  for(let i=0;i<20;i++)await login(f,`198.51.100.${i}`);
  assert.equal((await login(f,'198.51.100.99')).status,429);
 }finally{await f.close();}
});

test('repeated failed sign-ins lock that account only, and a reset clears the lock',async()=>{
 const f=await fixture({trustProxy:true});try{
  await f.register();await f.register('bob@example.com');
  const attempt=(email,password,i)=>f.call('/auth/login','POST',{email,password},undefined,{'X-Real-IP':`192.0.2.${i}`});
  for(let i=0;i<10;i++)assert.equal((await attempt('alice@example.com','wrong-password',i)).status,401);
  assert.equal((await attempt('alice@example.com','correct-password',50)).status,429);
  assert.equal((await f.call('/admin/auth/login','POST',{email:'alice@example.com',password:'correct-password'},undefined,{'X-Real-IP':'192.0.2.51'})).status,429);
  assert.equal((await attempt('bob@example.com','correct-password',52)).status,200);
  const token=randomBytes(32).toString('hex');
  const id=f.db.prepare('SELECT id FROM users WHERE email=?').get('alice@example.com').id;
  f.db.prepare('INSERT INTO resets VALUES (?,?,?)').run(digest(token),id,Date.now()+60000);
  assert.equal((await f.call('/auth/reset','POST',{token,password:'new-password-1'},undefined,{'X-Real-IP':'192.0.2.53'})).status,200);
  assert.equal((await attempt('alice@example.com','new-password-1',54)).status,200);
 }finally{await f.close();}
});

test('reviewer identity and notes stay inside the moderation workspace',async()=>{
 // Regression: reviewerName, reviewerId, the internal note (also copied to correction) and screeningLogs
 // ("<reviewer>: state. note") were public, and the author's alert and push named the reviewer.
 const f=await fixture();try{
  const author=await f.register(),reader=await f.register('bob@example.com'),admin=await f.admin('admin@example.com');
  const post=(await f.call('/posts','POST',draft,author.token)).value;
  await f.call(`/admin/posts/${post.id}/review`,'PATCH',{state:'confirmed',note:'Matches a case reported to police'},admin.token);
  for(const token of [undefined,reader.token,author.token]){
   const view=(await f.call('/posts','GET',undefined,token)).value.find(p=>p.id===post.id);
   assert.deepEqual(Object.keys(view.review).sort(),['reviewedAt','state']);
   assert.equal(view.correction,undefined);assert.equal(view.screeningLogs,undefined);
   assert.ok(!JSON.stringify(view).includes('admin'),'reviewer name leaked');
   assert.ok(!JSON.stringify(view).includes('police'),'review note leaked');
   const profile=(await f.call(`/people/${author.user.id}`,'GET',undefined,token)).value.posts.find(p=>p.id===post.id);
   assert.equal(profile.review.reviewerName,undefined);
  }
  const alert=(await f.call('/alerts','GET',undefined,author.token)).value.find(a=>a.kind==='review');
  assert.equal(alert.actor_name,'Safety review');
  const staff=(await f.call('/admin/dashboard','GET',undefined,admin.token)).value.posts.find(p=>p.id===post.id);
  assert.equal(staff.review.reviewerName,'admin');assert.equal(staff.review.note,'Matches a case reported to police');assert.ok(staff.screeningLogs.length);
 }finally{await f.close();}
});

test('assistant passes the age band to Ask without storing it, and rejects unknown bands to youth',async()=>{
 const bands=[];
 const f=await fixture({assistantServices:{classify:async()=> 'ask',check:async()=>{throw Error('unused');},ask:async(text,{band})=>{bands.push(band);return {language:'en',answer:'Tell a trusted adult.',steps:['Stop.','Tell someone.'],question:'',offer:'Paste it here.'};}}});
 try{
  const alice=await f.register();
  for(const band of ['kids','elder','nonsense',undefined])assert.equal((await f.call('/assistant','POST',{text:'Is this safe?',kind:'text',band},alice.token)).status,200);
  assert.deepEqual(bands,['kids','elder','youth','youth']);
  // The band sent with a question is never written; only a band the account chose itself is stored.
  assert.equal(f.db.prepare('SELECT age_band FROM users WHERE id=?').get(alice.user.id).age_band,null);
  const stored=JSON.stringify([f.db.prepare('SELECT * FROM users').all(),f.db.prepare('SELECT * FROM assistant_usage').all()]);
  assert.ok(!/kids|elder/.test(stored));
  // An account's own band wins over whatever the request says.
  const kid=(await f.call('/auth/register','POST',{name:'Kid',email:'kid@example.com',password:'correct-password',ageBand:'kids'})).value;
  bands.length=0;
  assert.equal((await f.call('/assistant','POST',{text:'Is this safe?',kind:'text',band:'adult'},kid.token)).status,200);
  assert.deepEqual(bands,['kids']);
 }finally{await f.close();}
});

const scenarioDrafts=JSON.parse((await import('node:fs')).readFileSync(new URL('./scenario-drafts.json',import.meta.url),'utf8'));
const kidsScenario=()=>structuredClone(scenarioDrafts.find(s=>s.bands.includes('kids')));
const staff=async(f,role)=>{const admin=await f.admin(`boss-${role}@example.com`);const email=`${role}@example.com`;
 assert.equal((await f.call('/admin/users','POST',{name:`A ${role}`,email,password:'correct-password',role,status:'active'},admin.token)).status,201);
 return {admin,member:(await f.call('/auth/login','POST',{email,password:'correct-password'})).value};};

test('scenario and moderation endpoints reject signed-out users and members; viewers read but cannot decide',async()=>{
 const f=await fixture();try{
  const {admin,member:viewer}=await staff(f,'viewer');
  const created=await f.call('/admin/scenarios','POST',kidsScenario(),admin.token);assert.equal(created.status,201);
  const member=await f.register('member@example.com');
  const routes=[['/admin/scenarios','GET'],['/admin/moderation','GET'],['/admin/scenarios','POST',{...kidsScenario(),id:'sneaky-01'}],[`/admin/scenarios/${created.value.id}/review`,'PATCH',{status:'approved',note:'Self-approved'}]];
  for(const [path,method,data] of routes){
   assert.equal((await f.call(path,method,data)).status,401,`${method} ${path} signed out`);
   assert.equal((await f.call(path,method,data,member.token)).status,403,`${method} ${path} as member`);
  }
  assert.equal((await f.call('/admin/scenarios','GET',undefined,viewer.token)).status,200);
  assert.equal((await f.call('/admin/moderation','GET',undefined,viewer.token)).status,200);
  assert.equal((await f.call('/admin/scenarios','POST',{...kidsScenario(),id:'viewer-01'},viewer.token)).status,403);
  assert.equal((await f.call(`/admin/scenarios/${created.value.id}/review`,'PATCH',{status:'approved',note:'Viewer'},viewer.token)).status,403);
  assert.equal(f.db.prepare("SELECT COUNT(*) n FROM scenarios").get().n,1);
  assert.equal(f.db.prepare("SELECT status FROM scenarios").get().status,'draft');
 }finally{await f.close();}
});

test('the public scenario endpoint only ever returns live scenarios for the requested band, without reviewer details',async()=>{
 const f=await fixture();try{
  const {member:reviewer}=await staff(f,'reviewer');
  const pub=async band=>(await f.call(`/scenarios?band=${band}`)).value.scenarios;
  // A submission cannot set its own status, reviewer or extra fields.
  const created=await f.call('/admin/scenarios','POST',{...kidsScenario(),status:'live',verifiedBy:'Me',reviewed_by:reviewer.user.id,secret:'x'},reviewer.token);
  assert.equal(created.status,201);assert.equal(created.value.status,'draft');assert.equal(created.value.scenario.secret,undefined);assert.equal(created.value.scenario.status,undefined);
  const id=created.value.id;
  assert.deepEqual(await pub('kids'),[]);
  const review=(status,note='Checked with a native speaker')=>f.call(`/admin/scenarios/${id}/review`,'PATCH',{status,note},reviewer.token);
  assert.equal((await review('live')).status,409,'a draft cannot skip approval');
  assert.equal((await review('approved','  ')).status,400,'a decision needs a note');
  assert.equal((await review('approved')).status,200);
  assert.deepEqual(await pub('kids'),[],'approved is not yet live');
  assert.equal((await review('live')).status,200);
  const live=await pub('kids');
  assert.equal(live.length,1);assert.equal(live[0].id,id);assert.equal(live[0].status,'verified');assert.equal(live[0].title.lo,kidsScenario().title.lo);
  assert.doesNotMatch(JSON.stringify(live),/Checked with a native speaker|reviewer@example|A reviewer|reviewNote|reviewed_by/);
  assert.deepEqual(await pub('youth'),[],'other bands do not get it');
  assert.equal((await review('rejected','Pulled after a report')).status,200);
  assert.deepEqual(await pub('kids'),[]);
  for(const band of ['kids','youth','adult','elder'])assert.ok((await pub(band)).every(s=>s.status==='verified'));
  assert.equal((await f.call('/scenarios')).status,400);
  assert.equal((await f.call('/scenarios?band=everyone')).status,400);
  // Intensity limits per band are enforced on submission.
  assert.equal((await f.call('/admin/scenarios','POST',{...kidsScenario(),id:'too-intense-01',intensity:2},reviewer.token)).status,400);
  assert.equal((await f.call('/admin/scenarios','POST',{...kidsScenario(),id:'elder-trafficking-01',bands:['elder'],intensity:3},reviewer.token)).status,400);
  assert.equal((await f.call('/admin/scenarios','POST',{...kidsScenario(),id:'no-lao-01',title:{en:'English only'}},reviewer.token)).status,400);
  assert.equal((await f.call('/admin/scenarios','POST',kidsScenario(),reviewer.token)).status,409);
 }finally{await f.close();}
});

test('moderation log records who decided what and when, plus what the AI flagged and why',async()=>{
 const flagged=post=>{if(/fee/.test(post.content)){post.check={verdict:'needs_expert',risk:'high',labels:[],reasons:[{text:'Upfront fee',evidence:'fee'}],summary:'Asks for an upfront fee.'};post.state='flagged';post.frozen=true;}};
 const f=await fixture({check:flagged});try{
  const {admin,member:reviewer}=await staff(f,'reviewer');
  const before=Date.now();
  const created=await f.call('/admin/scenarios','POST',kidsScenario(),reviewer.token);
  await f.call(`/admin/scenarios/${created.value.id}/review`,'PATCH',{status:'approved',note:'Looks right'},reviewer.token);
  const member=await f.register('poster@example.com');
  const post=await f.call('/posts','POST',{content:'Pay the agency fee today',tags:['JobScam']},member.token);
  await f.call(`/admin/posts/${post.value.id}/review`,'PATCH',{state:'confirmed',note:'Known agency scam'},admin.token);
  const log=(await f.call('/admin/moderation','GET',undefined,reviewer.token)).value;
  const find=action=>log.find(e=>e.action===action);
  assert.equal(find('submitted').actor.id,reviewer.user.id);
  const approved=find('approved');
  assert.equal(approved.actor.id,reviewer.user.id);assert.equal(approved.note,'Looks right');assert.equal(approved.detail.from,'draft');assert.ok(approved.createdAt>=before);
  const ai=find('ai_needs_expert');
  assert.equal(ai.actor,null);assert.equal(ai.actorName,'AI screening');assert.equal(ai.targetId,post.value.id);assert.equal(ai.note,'Asks for an upfront fee.');assert.equal(ai.detail.risk,'high');
  const human=find('confirmed');assert.equal(human.actor.id,admin.user.id);assert.equal(human.note,'Known agency scam');
  assert.equal(log.length,4);
 }finally{await f.close();}
});

test('reviewers retire and restore built-in scenarios; the public list carries the retired ids and the log records it',async()=>{
 const f=await fixture();try{
  const {admin,member:reviewer}=await staff(f,'reviewer');
  const member=await f.register('member@example.com');
  const retire=(token,retired=true,note='Outdated phone number in the story',id='bank-sms-01')=>f.call(`/admin/scenarios/retired/${id}`,'PATCH',{retired,note},token);
  assert.equal((await retire()).status,401);
  assert.equal((await retire(member.token)).status,403);
  assert.equal((await f.call('/admin/scenarios/retired','GET',undefined,member.token)).status,403);
  assert.equal((await retire(reviewer.token,true,'  ')).status,400,'a decision needs a note');
  assert.equal((await retire(reviewer.token,true,'x','Not An Id!')).status,400);
  assert.equal((await retire(reviewer.token)).status,200);
  assert.equal((await retire(reviewer.token)).status,409,'already retired');
  const pub=(await f.call('/scenarios?band=adult')).value;
  assert.deepEqual(pub.retired,['bank-sms-01']);assert.deepEqual(pub.scenarios,[]);
  assert.doesNotMatch(JSON.stringify(pub),/Outdated phone number|reviewer@example/);
  const staffView=(await f.call('/admin/scenarios/retired','GET',undefined,admin.token)).value;
  assert.equal(staffView[0].retiredBy.id,reviewer.user.id);assert.equal(staffView[0].note,'Outdated phone number in the story');
  // A server-managed scenario is taken offline through its own status, not retirement.
  const created=await f.call('/admin/scenarios','POST',kidsScenario(),reviewer.token);
  assert.equal((await retire(reviewer.token,true,'No',created.value.id)).status,409);
  assert.equal((await retire(admin.token,false,'Number fixed in the new app release')).status,200);
  assert.deepEqual((await f.call('/scenarios?band=adult')).value.retired,[]);
  const log=(await f.call('/admin/moderation','GET',undefined,admin.token)).value.filter(e=>e.targetId==='bank-sms-01');
  assert.deepEqual(log.map(e=>[e.action,e.actor.id,e.note]),[['restored',admin.user.id,'Number fixed in the new app release'],['retired',reviewer.user.id,'Outdated phone number in the story']]);
 }finally{await f.close();}
});

test('age band: only the band is stored, kids cannot post, comment or repost, and leaving Kids needs the password',async()=>{
 const f=await fixture();try{
  const reg=(email,extra)=>f.call('/auth/register','POST',{name:email.split('@')[0],email,password:'correct-password',...extra});
  assert.equal((await reg('bad@example.com',{ageBand:'toddler'})).status,400);
  const kid=(await reg('kid@example.com',{ageBand:'kids',birthYear:2015,birthDate:'2015-03-02'})).value;
  assert.equal(kid.user.ageBand,'kids');
  // Data minimisation: nothing but the band is kept, even if a client sends more.
  assert.doesNotMatch(JSON.stringify(f.db.prepare("SELECT * FROM users WHERE email='kid@example.com'").get()),/2015|birth/);
  const adult=(await reg('adult@example.com',{ageBand:'adult'})).value;
  const post=await f.call('/posts','POST',draft,adult.token);assert.equal(post.status,201);
  assert.equal((await f.call('/posts','POST',draft,kid.token)).status,403);
  assert.equal((await f.call(`/posts/${post.value.id}/comments`,'POST',{text:'hi'},kid.token)).status,403);
  assert.equal((await f.call(`/posts/${post.value.id}/reposts`,'POST',{text:''},kid.token)).status,403);
  assert.equal((await f.call(`/posts/${post.value.id}/reactions`,'POST',{kind:'like',active:true},kid.token)).status,200,'reading and liking are fine');
  // Moving into Kids needs nothing; leaving Kids needs the account password.
  assert.equal((await f.call('/profile','PATCH',{ageBand:'adult'},kid.token)).status,403);
  assert.equal((await f.call('/profile','PATCH',{ageBand:'adult',password:'wrong-password'},kid.token)).status,403);
  assert.equal((await f.call('/posts','POST',draft,kid.token)).status,403,'still kids after failed attempts');
  const left=await f.call('/profile','PATCH',{ageBand:'youth',password:'correct-password'},kid.token);
  assert.equal(left.status,200);assert.equal(left.value.ageBand,'youth');
  assert.equal((await f.call('/posts','POST',draft,kid.token)).status,201);
  assert.equal((await f.call('/profile','PATCH',{ageBand:'kids'},adult.token)).value.ageBand,'kids');
  assert.equal((await f.call('/profile','PATCH',{ageBand:'everyone'},kid.token)).status,400);
 }finally{await f.close();}
});

test('the feed is filtered by band on the server: intensity limits, and Kids see only reviewed posts',async()=>{
 const f=await fixture();try{
  const admin=await f.admin('admin@example.com');
  await f.call('/profile','PATCH',{ageBand:'adult'},admin.token);
  const make=async(tags,state)=>{const p=(await f.call('/posts','POST',{content:`About ${tags.join(' ')}`,tags},admin.token)).value;if(state)await f.call(`/admin/posts/${p.id}/review`,'PATCH',{state,note:'Checked'},admin.token);return p.id;};
  const safetyUnreviewed=await make(['DigitalSafety']);
  const safetyReviewed=await make(['DigitalSafety'],'clean');
  const fraud=await make(['CryptoScam'],'confirmed');
  const trafficking=await make(['Trafficking'],'confirmed');
  const custom=await make(['ຂ່າວ'],'clean');
  const ids=async(token,band)=>(await f.call(`/posts${band?`?band=${band}`:''}`,'GET',undefined,token)).value.map(p=>p.id).sort();
  const sorted=a=>[...a].sort();
  const kid=(await f.call('/auth/register','POST',{name:'Kid',email:'kid@example.com',password:'correct-password',ageBand:'kids'})).value;
  const elder=(await f.call('/auth/register','POST',{name:'Grandma',email:'gran@example.com',password:'correct-password',ageBand:'elder'})).value;
  assert.deepEqual(await ids(kid.token),[safetyReviewed]);
  assert.deepEqual(await ids(kid.token,'adult'),[safetyReviewed],'a stored band cannot be overridden by the request');
  assert.deepEqual(await ids(elder.token),sorted([safetyUnreviewed,safetyReviewed,fraud,custom]));
  assert.deepEqual(await ids(undefined,'kids'),[safetyReviewed],'guests are filtered by the band they choose');
  assert.deepEqual(await ids(undefined,'youth'),sorted([safetyUnreviewed,safetyReviewed,fraud,trafficking,custom]));
  assert.equal((await ids(admin.token)).length,5,'authors always see their own posts');
  // The public profile page applies the same filter.
  const page=(await f.call(`/people/${admin.user.id}`,'GET',undefined,kid.token)).value.posts.map(p=>p.id);
  assert.deepEqual(page,[safetyReviewed]);
  // Scenarios follow the stored band too.
  assert.equal((await f.call('/scenarios?band=adult','GET',undefined,kid.token)).status,200);
 }finally{await f.close();}
});
