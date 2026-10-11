import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { createApp } from './server.mjs';
import { digest } from './auth.mjs';

async function fixture(options={}) {
  const app=createApp({database:':memory:',seed:false,...options});
  await new Promise(r=>app.server.listen(0,'127.0.0.1',r));
  const base=`http://127.0.0.1:${app.server.address().port}/api`;
  const call=async(path,method='GET',data,token,extra={})=>{const response=await fetch(base+path,{method,headers:{...(data?{'Content-Type':'application/json'}:{}),...(token?{Authorization:`Bearer ${token}`} : {}),...extra},body:data?JSON.stringify(data):undefined});return {status:response.status,value:await response.json()};};
  const register=async(email='alice@example.com')=>(await call('/auth/register','POST',{name:email.split('@')[0],email,password:'correct-password'})).value;
  return {...app,base,call,register};
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
  const update=await f.call('/profile','PATCH',{id:bob.user.id,name:'Alice Updated',bio:'New bio',followed:['DigitalSafety'],avatar:'data:image/jpeg;base64,/9j/2Q=='},alice.token);
  assert.equal(update.value.id,alice.user.id);assert.equal(update.value.bio,'New bio');
  assert.equal((await f.call('/auth/me','GET',undefined,bob.token)).value.name,'bob');
  assert.equal((await f.call('/posts')).value[0].author.name,'Alice Updated');
 }finally{await f.close();}
});

test('source validation, attachment limits, origins and actual posting quotas',async()=>{
 const f=await fixture();try{
  const user=await f.register();
  for(const invalid of [{...draft,link:'javascript:alert(1)'},{...draft,tags:['bad tag!']},{...draft,image:'data:image/svg+xml;base64,PHN2Zz4='},{...draft,isNews:true,link:''},{...draft,content:'x'.repeat(2001)}])assert.equal((await f.call('/posts','POST',invalid,user.token)).status,400);
  assert.equal((await f.call('/posts','GET',undefined,undefined,{Origin:'https://untrusted.example'})).status,403);
  const post=(await f.call('/posts','POST',draft,user.token)).value;await f.call('/posts','POST',draft,user.token);
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

test('custom English and Lao hashtags persist and keyword screening runs',async()=>{
 const f=await fixture();try{
  const user=await f.register();
  const posted=await f.call('/posts','POST',{...draft,tags:['MyCommunity','ຄວາມປອດໄພ','mycommunity']},user.token);
  assert.equal(posted.status,201);assert.equal(posted.value.tags.length,2);
  assert.equal(posted.value.screening.mode,'rules');assert.ok(posted.value.screening.checkedAt);assert.equal(posted.value.screeningStage,'completed');
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
 const f=await fixture({adminEmails:['admin@example.com']});try{
  assert.equal((await f.call('/admin/dashboard')).status,401);
  const regular=await f.register();
  assert.equal((await f.call('/admin/dashboard','GET',undefined,regular.token)).status,403);
  const admin=await f.register('admin@example.com');
  const posted=await f.call('/posts','POST',draft,regular.token);
  const snapshot=await f.call('/admin/dashboard','GET',undefined,admin.token);
  assert.equal(snapshot.status,200);assert.equal(snapshot.value.totals.users,2);
  assert.equal(snapshot.value.users[0].password,undefined);
  assert.equal((await f.call(`/admin/posts/${posted.value.id}/review`,'PATCH',{state:'confirmed',note:'Evidence checked'},regular.token)).status,403);
  assert.equal((await f.call(`/admin/posts/${posted.value.id}/review`,'PATCH',{state:'clean',note:'Evidence checked'},admin.token)).status,400);
  assert.equal((await f.call(`/admin/posts/${posted.value.id}/review`,'PATCH',{state:'confirmed',note:'  '},admin.token)).status,400);
  const reviewed=await f.call(`/admin/posts/${posted.value.id}/review`,'PATCH',{state:'confirmed',note:'Evidence checked'},admin.token);
  assert.equal(reviewed.status,200);assert.equal(reviewed.value.review.reviewerId,admin.user.id);
  const feed=(await f.call('/posts')).value;
  assert.equal(feed[0].state,'confirmed');assert.equal(feed[0].correction,'Evidence checked');
  assert.equal(feed[0].review.note,'Evidence checked');assert.equal(feed[0].screeningStage,'completed');
  const cleared=await f.call(`/admin/posts/${posted.value.id}/review`,'PATCH',{state:'false',note:'Source disproves the claim'},admin.token);
  assert.equal(cleared.value.state,'false');assert.equal(cleared.value.screeningLogs.length,2);
 }finally{await f.close();}
});

test('admins manage accounts; viewers cannot review or manage; deactivation revokes sessions',async()=>{
 const f=await fixture({adminEmails:['admin@example.com']});try{
  const admin=await f.register('admin@example.com');
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
  assert.equal(f.db.prepare('SELECT COUNT(*) n FROM access_audit').get().n,3);
 }finally{await f.close();}
});

test('MongoDB backup payload restores accounts, roles and posts without restoring sessions',async()=>{
 const {collectBackup,restoreBackup}=await import('./mongo-backup.mjs');
 const {openStore}=await import('./store.mjs');
 const f=await fixture({adminEmails:['admin@example.com']});const restored=openStore(':memory:',false);
 try{
  const admin=await f.register('admin@example.com');
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
