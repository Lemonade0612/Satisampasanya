import {notifyReviewers} from './review-queue.mjs';
import {assistantUsage,assistantReply} from './assistant.mjs';
import {translationEnabled,translateText} from './translation.mjs';
import {accessFor,manageUser} from './access.mjs';
import { adminSnapshot, reviewPost } from './admin.mjs';
import {checkPost} from './safety/post-check.mjs';
import {modelConfigured} from './safety/model.mjs';
import {hostedTranslate} from './safety/translate.mjs';
import { createServer } from 'node:http';
import { randomUUID, randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { openStore, userView, authorView, postView } from './store.mjs';
import { passwordHash, passwordMatches, digest, session, currentUser } from './auth.mjs';

const validTag = tag => typeof tag === 'string' && /^[\p{L}\p{M}\p{N}_]{1,40}$/u.test(tag);
const cleanTags = values => [...new Map(values.map(tag => [tag.toLocaleLowerCase(),tag])).values()];
const topics = ['OnlineScam','Trafficking','DigitalSafety','JobScam','CryptoScam','BorderSafety','SocialMedia','PhishingAlert','RomanceScam','DataPrivacy'];
const fail = (message, status = 400) => { throw Object.assign(new Error(message), { status }); };
const text = (value, max, required = false) => {
  if (value !== undefined && typeof value !== 'string') fail('Invalid text.');
  const result = (value || '').trim();
  if ((required && !result) || result.length > max) fail(`Text must contain ${required ? '1' : '0'}–${max} characters.`);
  return result;
};
const password = value => { if (typeof value !== 'string' || value.length < 8 || value.length > 128) fail('Password must contain 8–128 characters.'); return value; };
const image = value => {
  if (!value) return undefined;
  if (typeof value !== 'string' || value.length > 1600000 || !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(value)) fail('Choose an image smaller than 1 MB.');
  return value;
};
const link = value => { const s = text(value, 2000); if (s) { try { if (!['https:','http:'].includes(new URL(s).protocol)) fail('Use an http or https source link.'); } catch { fail('Enter a valid source URL.'); } } return s; };
async function body(req) {
  let size = 0; const chunks = [];
  for await (const chunk of req) { size += chunk.length; if (size > 3500000) fail('Request is too large.', 413); chunks.push(chunk); }
  try { const data = JSON.parse(Buffer.concat(chunks).toString() || '{}'); if (!data || Array.isArray(data) || typeof data !== 'object') fail('Invalid JSON.'); return data; } catch { fail('Invalid JSON.'); }
}

export function createApp({ database = resolve('backend/data/sati.sqlite'), seed = false, origins = [], adminEmails = [], check = checkPost, hostedTranslation = hostedTranslate, assistantServices = {} } = {}) {
  const db = openStore(database, seed), clients = new Set(), rate = new Map();
  const allowed = new Set([
  // User frontend
  'http://localhost:5173',
  'http://127.0.0.1:5173',

  // Admin frontend (original)
  'http://localhost:5174',
  'http://127.0.0.1:5174',

  // Admin frontend (new)
  'http://localhost:5175',
  'http://127.0.0.1:5175',

  // Mobile application
  'capacitor://localhost',
  'http://localhost',

  // Additional configured origins
  ...origins,
]);
  const broadcast = () => {for(const client of clients)client.write('event: change\ndata: {}\n\n');};
  const send = (res, status, value) => { if(res.getHeader('Content-Type')==='application/x-ndjson'){res.end(JSON.stringify({type:'result',status,value})+'\n');return;} res.writeHead(status, { 'Content-Type':'application/json', 'Cache-Control':'no-store' }); res.end(JSON.stringify(value)); };
  const sweep=()=>{if(notifyReviewers(db,adminEmails))broadcast();};
  sweep();
  const reviewTimer=setInterval(sweep,60000);reviewTimer.unref();
  const interactionChecks=new Map();
  const server = createServer(async (req, res) => {
    try {
      if (req.headers.origin && !allowed.has(req.headers.origin)) fail('Origin is not allowed.', 403);
      if (req.headers.origin) { res.setHeader('Access-Control-Allow-Origin', req.headers.origin); res.setHeader('Vary', 'Origin'); }
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
      res.setHeader('X-Content-Type-Options','nosniff');
      if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
      const url = new URL(req.url, 'http://localhost'), path = url.pathname;
      if (req.method !== 'GET') {
        const key = `${req.socket.remoteAddress}:${path.startsWith('/api/auth') || path.endsWith('/translate') ? 'auth' : 'write'}`;
        const now = Date.now(); const entry = rate.get(key) || { count: 0, until: now + 60000 };
        if (entry.until < now) { entry.count = 0; entry.until = now + 60000; }
        entry.count++; rate.set(key, entry);
        if (entry.count > (path.startsWith('/api/auth') || path.endsWith('/translate') ? 20 : 120)) fail('Too many requests. Try again shortly.', 429);
        if (rate.size > 1000) for (const [k,v] of rate) if (v.until < now) rate.delete(k);
      }
      const user = currentUser(db, req);
      if (path.startsWith('/api/admin/')) {
        if (!user) fail('Please sign in.',401);
        const access=accessFor(db,user,adminEmails);
        if(access.status!=='active'||!['viewer','reviewer','admin'].includes(access.role))fail('Administrator or insight access is required.',403);
        if(path==='/api/admin/users'||/^\/api\/admin\/users\/[^/]+$/.test(path)){
          if(access.role!=='admin')fail('Only administrators can manage users.',403);
          const id=path.split('/')[4];
          if((req.method==='POST'&&!id)||(req.method==='PATCH'&&id)){
            const value=await manageUser(db,user,await body(req),id,adminEmails);broadcast();return send(res,id?200:201,value);
          }
        }
        if (req.method === 'GET' && path === '/api/admin/dashboard') return send(res,200,adminSnapshot(db,user,adminEmails));
        const review = /^\/api\/admin\/posts\/([^/]+)\/review$/.exec(path);
        if (req.method === 'PATCH' && review) {
          if(!['reviewer','admin'].includes(access.role))fail('Review permission is required.',403);
          const data = await body(req);
          if (!['clean','confirmed','false','rejected'].includes(data.state)) fail('Choose approved post, confirmed scam, false alarm or reject.');
          const note = text(data.note,1000,true);
          const post = reviewPost(db,review[1],data.state,note,user);
          if (!post) fail('Post not found.',404);
          broadcast(); return send(res,200,post);
        }
        fail('Route not found.',404);
      }
      if (req.method === 'GET' && path === '/api/features') return send(res,200,{automaticTranslation:translationEnabled()||modelConfigured(),translationProvider:translationEnabled()?'NLLB-200':modelConfigured()?'OpenAI':'none',screening:modelConfigured()?'ai':'unavailable',assistant:modelConfigured()});
      if (req.method === 'GET' && path === '/api/health') return send(res, 200, { ok:true });
      if (req.method === 'GET' && path === '/api/events') {
        res.writeHead(200, { 'Content-Type':'text/event-stream', 'Cache-Control':'no-cache', Connection:'keep-alive' });
        res.write('event: change\ndata: {}\n\n'); clients.add(res);
        const interval = setInterval(() => res.write(': keepalive\n\n'), 25000);
        res.on('close', () => { clearInterval(interval); clients.delete(res); }); return;
      }
      if (req.method === 'GET' && path === '/api/posts') return send(res, 200, db.prepare("SELECT * FROM posts WHERE COALESCE(json_extract(data,'$.seedArchived'),0)=0 ORDER BY created DESC LIMIT 200").all().map(p => postView(db,p,user?.id)));
      if (req.method === 'POST' && ['/api/auth/register','/api/auth/login'].includes(path)) {
        const data = await body(req), email = text(data.email,254,true).toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail('Enter a valid email address.');
        const pw = password(data.password);
        let row = db.prepare('SELECT * FROM users WHERE email=?').get(email);
        if (path.endsWith('register')) {
          if (row) fail('An account already uses this email.',409);
          const name = text(data.name,80,true), id = randomUUID(), salt = randomBytes(16).toString('hex');
          const hash = await passwordHash(pw,salt);
          try { db.prepare('INSERT INTO users(id,email,name,password,salt) VALUES (?,?,?,?,?)').run(id,email,name,hash,salt); } catch (e) { if (e.message.includes('UNIQUE')) fail('An account already uses this email.',409); throw e; }
          db.prepare('INSERT INTO user_access(user_id,created) VALUES (?,?)').run(id,Date.now());
          row = db.prepare('SELECT * FROM users WHERE id=?').get(id);
        } else if (!row || !await passwordMatches(pw,row)) fail('Incorrect email or password.',401);
        if(accessFor(db,row,adminEmails).status!=='active')fail('This account is inactive. Contact an administrator.',403);
        db.prepare('INSERT INTO user_access(user_id,last_login) VALUES (?,?) ON CONFLICT(user_id) DO UPDATE SET last_login=excluded.last_login').run(row.id,Date.now());
        return send(res,200,{user:userView(row),token:session(db,row.id)});
      }
      if (req.method === 'POST' && path === '/api/auth/forgot') {
        const {email} = await body(req), row = db.prepare('SELECT * FROM users WHERE email=?').get(text(email,254,true).toLowerCase());
        if (row) { const token = randomBytes(32).toString('hex'); db.prepare('DELETE FROM resets WHERE user_id=? OR expires<?').run(row.id,Date.now()); db.prepare('INSERT INTO resets VALUES (?,?,?)').run(digest(token),row.id,Date.now()+900000); console.log(`Local password reset link: http://localhost:5173/?reset=${token}`); }
        return send(res,202,{message:'If the account exists, a reset link was printed in the local backend terminal. Email delivery is not configured.'});
      }
      if (req.method === 'POST' && path === '/api/auth/reset') {
        const data = await body(req); const token = text(data.token,64,true), pw = password(data.password);
        const row = db.prepare('SELECT * FROM resets WHERE token=? AND expires>?').get(digest(token),Date.now());
        if (!row) fail('Reset link is invalid or expired.');
        const salt = randomBytes(16).toString('hex'), hash = await passwordHash(pw,salt);
        db.exec('BEGIN');
        try { if (!db.prepare('DELETE FROM resets WHERE token=?').run(digest(token)).changes) fail('Reset link was already used.'); db.prepare('UPDATE users SET password=?,salt=? WHERE id=?').run(hash,salt,row.user_id); db.prepare('DELETE FROM sessions WHERE user_id=?').run(row.user_id); db.exec('COMMIT'); } catch(e) { db.exec('ROLLBACK'); throw e; }
        return send(res,200,{ok:true});
      }
      const match = /^\/api\/posts\/([^/]+)(?:\/(comments|reactions|reposts|translate|share))?$/.exec(path);
      if (req.method === 'GET' && match?.[2] === 'comments') {
        if (!db.prepare('SELECT id FROM posts WHERE id=?').get(match[1])) fail('Post not found.',404);
        return send(res,200,db.prepare('SELECT comments.*,users.name FROM comments JOIN users ON users.id=comments.user_id WHERE post_id=? ORDER BY created').all(match[1]).map(r=>({id:r.id,text:r.text,createdAt:r.created,author:authorView({...r,id:r.user_id})})));
      }
      if (!user) fail('Please sign in.',401);
      if (req.method === 'GET' && path === '/api/assistant/usage') return send(res,200,assistantUsage(db,user.id));
      if (req.method === 'POST' && path === '/api/assistant') {
        const data=await body(req);
        if(!['text','post'].includes(data.kind)||!['auto','ask','check'].includes(data.mode||'auto'))fail('Choose a valid check type and mode.');
        return send(res,200,await assistantReply(db,user.id,{text:text(data.text,2000,true),kind:data.kind,mode:data.mode||'auto'},assistantServices));
      }
      if (req.method === 'POST' && path === '/api/translate') {
        const data=await body(req),value=text(data.text,2000,true);
        if(!['en','lo'].includes(data.target))fail('Choose English or Lao.');
        if(translationEnabled())return send(res,200,{text:await translateText(value,data.target==='lo'?'en':'lo',data.target)});
        return send(res,200,{text:await hostedTranslation(value,data.target)});
      }
      if (req.method === 'GET' && path === '/api/alerts') return send(res,200,db.prepare('SELECT * FROM notifications WHERE user_id=? ORDER BY created DESC LIMIT 100').all(user.id));
      if (req.method === 'POST' && path === '/api/alerts/read') {
        const data=await body(req);
        if(data.id) db.prepare('UPDATE notifications SET read=1 WHERE user_id=? AND id=?').run(user.id,text(data.id,100,true));
        else db.prepare('UPDATE notifications SET read=1 WHERE user_id=?').run(user.id);
        broadcast();return send(res,200,{ok:true});
      }
      if (req.method === 'GET' && path === '/api/auth/me') return send(res,200,userView(user));
      if (req.method === 'POST' && path === '/api/auth/logout') { db.prepare('DELETE FROM sessions WHERE token=?').run(digest(req.headers.authorization.slice(7))); return send(res,200,{ok:true}); }
      if (req.method === 'PATCH' && path === '/api/profile') {
        const data = await body(req), profile = JSON.parse(user.profile);
        const name = text(data.name ?? user.name,80,true);
        if (data.bio !== undefined) profile.bio = text(data.bio,500);
        if (data.followed !== undefined) { if (!Array.isArray(data.followed) || data.followed.length>10 || data.followed.some(t=>!validTag(t))) fail('Invalid topics.'); profile.followed=cleanTags(data.followed); }
        if(data.following!==undefined){if(!Array.isArray(data.following)||data.following.length>200||data.following.some(id=>typeof id!=='string'||id===user.id||!db.prepare('SELECT id FROM users WHERE id=?').get(id)))fail('Choose valid community accounts to follow.');profile.following=[...new Set(data.following)];}
        for (const k of ['avatar','banner']) if (data[k] !== undefined) profile[k]=image(data[k]) || null;
        db.prepare('UPDATE users SET name=?,profile=? WHERE id=?').run(name,JSON.stringify(profile),user.id); broadcast();
        return send(res,200,userView(db.prepare('SELECT * FROM users WHERE id=?').get(user.id)));
      }
      if (req.method === 'POST' && path === '/api/posts') {
        const data = await body(req), content = text(data.content,2000), contentLo = text(data.contentLo,2000);
        if (!content && !contentLo) fail('Write your post in English or Lao.');
        if (!Array.isArray(data.tags) || data.tags.length>10 || data.tags.some(t=>!validTag(t))) fail('Use up to 10 hashtags: letters, Lao characters, numbers or underscores, up to 40 characters each.');
        const source = link(data.link); if (data.isNews && !source) fail('News posts need a source URL.');
        const since = Date.now()-86400000;
        if (db.prepare("SELECT COUNT(*) n FROM posts WHERE user_id=? AND created>? AND json_extract(data,'$.repostOf') IS NULL").get(user.id,since).n >= 10) fail('Limit reached: 10 posts per 24 hours.',429);
        const post = {id:randomUUID(),content:content||contentLo,contentLo:contentLo||undefined,contentLanguage:data.contentLanguage==='lo'&&contentLo?'lo':content?'en':'lo',tags:cleanTags(data.tags),link:source||undefined,image:image(data.image),isNews:!!data.isNews,state:'clean',likes:0,comments:0,reposts:0,warnedMe:0,timestamp:'Just now'};
        const onProgress=stage=>{if(url.searchParams.get('stream')==='1'){if(!res.headersSent)res.writeHead(200,{'Content-Type':'application/x-ndjson','Cache-Control':'no-store','X-Accel-Buffering':'no'});res.write(JSON.stringify({type:'progress',stage,done:false})+'\n');}};
        await check(post,{onProgress});
        if(!post.tags.length)post.tags=post.check?.on_topic?['DigitalSafety']:['OffTopic'];
        if (db.prepare("SELECT COUNT(*) n FROM posts WHERE user_id=? AND created>? AND json_extract(data,'$.repostOf') IS NULL").get(user.id,since).n>=10)fail('Limit reached: 10 posts per 24 hours.',429);
        db.prepare('INSERT INTO posts VALUES (?,?,?,?)').run(post.id,user.id,JSON.stringify(post),Date.now());
        if(post.state==='flagged')db.prepare('INSERT INTO notifications(id,user_id,actor_name,kind,post_id,created) VALUES (?,?,?,?,?,?)').run(randomUUID(),user.id,'Safety review','safety',post.id,Date.now());
        if(post.isNews)for(const recipient of db.prepare('SELECT id FROM users WHERE id<>?').all(user.id))db.prepare('INSERT INTO notifications(id,user_id,actor_name,kind,post_id,created) VALUES (?,?,?,?,?,?)').run(randomUUID(),recipient.id,user.name,'news',post.id,Date.now());
        sweep();broadcast();
        return send(res,201,postView(db,db.prepare('SELECT * FROM posts WHERE id=?').get(post.id),user.id));
      }
      if (req.method === 'POST' && match) {
        const row = db.prepare('SELECT * FROM posts WHERE id=?').get(match[1]); if (!row) fail('Post not found.',404);
        if(match[2]!=='translate'){
          const current=JSON.parse(row.data);
          if(!current.check&&!current.review){
            let pending=interactionChecks.get(row.id);
            if(!pending){pending=(async()=>{await check(current);db.prepare('UPDATE posts SET data=? WHERE id=?').run(JSON.stringify(current),row.id);sweep();broadcast();})();interactionChecks.set(row.id,pending);}
            try{await pending;}finally{interactionChecks.delete(row.id);}
            row.data=db.prepare('SELECT data FROM posts WHERE id=?').get(row.id).data;
          }
        }
        if(JSON.parse(row.data).frozen&&match[2]!=='translate')fail('This post is under expert review. Sharing and reactions are paused.',409);
        const data = await body(req);
        const notify=(kind)=>{if(row.user_id && row.user_id!==user.id)db.prepare('INSERT INTO notifications(id,user_id,actor_name,kind,post_id,created) VALUES (?,?,?,?,?,?)').run(randomUUID(),row.user_id,user.name,kind,row.id,Date.now());};
        if (match[2] === 'translate') {
          const post=JSON.parse(row.data);
          if(post.contentLanguage==='lo' || !post.contentLo) {
            if(translationEnabled()){if(post.contentLanguage==='lo'){post.translationText=await translateText(post.contentLo||post.content,'lo','en');}else post.contentLo=await translateText(post.content,'en','lo');post.translationProvider='NLLB-200';}
            else{if(post.contentLanguage==='lo'){post.translationText=await hostedTranslation(post.contentLo||post.content,'en');}else post.contentLo=await hostedTranslation(post.content,'lo');}
            post.translationStatus='generated';db.prepare('UPDATE posts SET data=? WHERE id=?').run(JSON.stringify(post),row.id);
          }
          broadcast();return send(res,200,postView(db,db.prepare('SELECT * FROM posts WHERE id=?').get(row.id),user.id));
        }
        if (match[2] === 'share') return send(res,200,postView(db,row,user.id));
        if (match[2] === 'comments') {
          const value = text(data.text,1000,true);
          if (db.prepare('SELECT COUNT(*) n FROM comments WHERE user_id=? AND created>?').get(user.id,Date.now()-86400000).n>=5) fail('Limit reached: 5 comments per 24 hours.',429);
          db.prepare('INSERT INTO comments VALUES (?,?,?,?,?)').run(randomUUID(),row.id,user.id,value,Date.now()); notify('comment');
        } else if (match[2] === 'reactions') {
          if (!['like','warned'].includes(data.kind) || typeof data.active!=='boolean') fail('Invalid reaction.');
          if (data.active) {const changed=db.prepare('INSERT OR IGNORE INTO reactions VALUES (?,?,?)').run(row.id,user.id,data.kind).changes;if(changed)notify(data.kind);}
          else db.prepare('DELETE FROM reactions WHERE post_id=? AND user_id=? AND kind=?').run(row.id,user.id,data.kind);
        } else if (match[2] === 'reposts') {
          const value = text(data.text,150), original = JSON.parse(row.data);
          if (db.prepare("SELECT COUNT(*) n FROM posts WHERE user_id=? AND created>? AND json_extract(data,'$.repostOf') IS NOT NULL").get(user.id,Date.now()-86400000).n>=20) fail('Repost limit reached.',429);
          const post={id:randomUUID(),content:value||original.content,contentLo:value?undefined:original.contentLo,contentLanguage:value?(data.lang==='lo'?'lo':'en'):original.contentLanguage,tags:original.tags,state:'clean',likes:0,comments:0,reposts:0,warnedMe:0,repostOf:row.id,repostText:value,timestamp:'Just now'};
          if (value && data.lang==='lo') post.contentLo=value;
          await check(post);
          db.prepare('INSERT INTO posts VALUES (?,?,?,?)').run(post.id,user.id,JSON.stringify(post),Date.now()); notify('repost');
        } else fail('Route not found.',404);
        broadcast(); return send(res,200,postView(db,row,user.id));
      }
      fail('Route not found.',404);
    } catch(error) { if (!res.headersSent) send(res,error.status||500,{error:error.status?error.message:'Backend error. Please try again.'}); else {if(res.getHeader('Content-Type')==='application/x-ndjson')res.write(JSON.stringify({type:'error',status:error.status||500,message:error.status?error.message:'Unable to finish checking. Please retry.'})+'\n');res.end();} if (!error.status) console.error(error); }
  });
  return {server,db,close:async()=>{clearInterval(reviewTimer);for(const client of clients) client.end();server.closeAllConnections(); await new Promise(r=>server.close(r));db.close();}};
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const app=createApp({database:process.env.DATABASE_PATH||resolve('backend/data/sati.sqlite'),seed:false,adminEmails:(process.env.ADMIN_EMAILS||'').split(',').filter(Boolean),origins:(process.env.ALLOWED_ORIGINS||'').split(',').filter(Boolean)});
  app.server.listen(Number(process.env.API_PORT||3001),process.env.API_HOST||'127.0.0.1',()=>console.log(`Sati backend: http://${process.env.API_HOST||'127.0.0.1'}:${process.env.API_PORT||3001}`));
  for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>app.close().then(()=>process.exit(0)));
}
