import {postLocked,visibleTo} from './post-lock.mjs';
import {notifyReviewers} from './review-queue.mjs';
import {assistantUsage,assistantReply} from './assistant.mjs';
import {translationEnabled,translateText} from './translation.mjs';
import {accessFor,manageUser} from './access.mjs';
import { adminSnapshot, reviewPost, alertNews } from './admin.mjs';
import {reservedName} from './names.mjs';
import {isBand,postVisibleToBand,canPostAsBand} from '../shared/bands.mjs';
import {createScenario,reviewScenario,staffScenarios,publicScenarios,moderationLog,logScreening,setBundledRetired,staffRetired} from './scenarios.mjs';
import { apnsSender, dispatchPushes } from './push.mjs';
import { snapshotsEnabled, restoreSnapshot, startSnapshots } from './snapshot.mjs';
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
// A repost without its own band follows the original's band, so a repost never leaks a post into another band's feed.
const bandView = (db, row) => {
  const post = JSON.parse(row.data);
  if (!post.repostOf || post.bands?.length) return post;
  const original = db.prepare('SELECT data FROM posts WHERE id=?').get(post.repostOf);
  const source = original ? JSON.parse(original.data) : null;
  return source ? { ...post, bands: source.bands, intensity: post.intensity ?? source.intensity, tags: [...(post.tags || []), ...(source.tags || [])] } : post;
};
const QUICK_CHARS = 'abcdefghjkmnpqrstuvwxyz23456789', QUICK_CODE = /^sati-[a-z0-9]{6}$/;
const quickEmail = code => `${code}@quick.sati`;
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

export function createApp({ database = resolve('backend/data/sati.sqlite'), seed = false, origins = [], trustProxy = false, check = checkPost, hostedTranslation = hostedTranslate, assistantServices = {}, push = apnsSender() } = {}) {
  const db = openStore(database, seed), clients = new Set(), rate = new Map(), loginFailures = new Map();
  // Behind nginx every socket is the proxy, so the client address comes from X-Real-IP, which nginx
  // overwrites with $remote_addr. Without a trusted proxy the header is client-controlled and ignored.
  const clientIp = req => { const real = trustProxy && req.headers['x-real-ip']; return typeof real === 'string' && real.trim() ? real.trim() : req.socket.remoteAddress; };
  const LOGIN_FAILURES = 10, LOGIN_LOCK_MS = 15 * 60000;
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
  const sweep=()=>{if(notifyReviewers(db))broadcast();};
  sweep();
  const reviewTimer=setInterval(sweep,60000);reviewTimer.unref();
  let pushing=Promise.resolve();
  const deliver=()=>{pushing=pushing.then(()=>dispatchPushes(db,push)).catch(error=>console.error('Push dispatch failed:',error.message));return pushing;};
  const pushTimer=setInterval(deliver,2000);pushTimer.unref();
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
        const key = `${clientIp(req)}:${(path.startsWith('/api/auth') || path.startsWith('/api/admin/auth')) || path.endsWith('/translate') ? 'auth' : 'write'}`;
        const now = Date.now(); const entry = rate.get(key) || { count: 0, until: now + 60000 };
        if (entry.until < now) { entry.count = 0; entry.until = now + 60000; }
        entry.count++; rate.set(key, entry);
        if (entry.count > ((path.startsWith('/api/auth') || path.startsWith('/api/admin/auth')) || path.endsWith('/translate') ? 20 : 120)) fail('Too many requests. Try again shortly.', 429);
        if (rate.size > 1000) for (const [k,v] of rate) if (v.until < now) rate.delete(k);
      }
      if(req.method === 'GET' && path === '/') {
        res.writeHead(302, {Location:process.env.ADMIN_URL || 'http://127.0.0.1:5174', 'Cache-Control':'no-store'});
        return res.end();
      }
      const user = currentUser(db, req);
      // The account's stored band wins; guests say which band is playing. Without either, nothing is band-filtered.
      const requestedBand = url.searchParams.get('band');
      const band = user?.age_band || (isBand(requestedBand) ? requestedBand : null);
      const forBand = rows => rows.filter(row => postVisibleToBand(JSON.parse(row.data), band));
      if (path.startsWith('/api/admin/') && path !== '/api/admin/auth/login') {
        if (!user) fail('Please sign in.',401);
        const access=accessFor(db,user);
        if(access.status!=='active'||!['viewer','reviewer','admin'].includes(access.role))fail('Administrator or insight access is required.',403);
        if(path==='/api/admin/users'||/^\/api\/admin\/users\/[^/]+$/.test(path)){
          if(access.role!=='admin')fail('Only administrators can manage users.',403);
          const id=path.split('/')[4];
          if((req.method==='POST'&&!id)||(req.method==='PATCH'&&id)){
            const value=await manageUser(db,user,await body(req),id);broadcast();return send(res,id?200:201,value);
          }
        }
        if (req.method === 'GET' && path === '/api/admin/dashboard') return send(res,200,adminSnapshot(db,user));
        // Viewers may read scenarios and the log; only reviewers and admins may submit or decide.
        const canReview=['reviewer','admin'].includes(access.role);
        if (req.method === 'GET' && path === '/api/admin/scenarios') return send(res,200,staffScenarios(db));
        if (req.method === 'GET' && path === '/api/admin/moderation') return send(res,200,moderationLog(db));
        if (req.method === 'GET' && path === '/api/admin/scenarios/retired') return send(res,200,staffRetired(db));
        const retire = /^\/api\/admin\/scenarios\/retired\/([^/]+)$/.exec(path);
        if (req.method === 'PATCH' && retire) {
          if(!canReview)fail('Review permission is required.',403);
          const data = await body(req);
          if (typeof data.retired !== 'boolean') fail('Choose retire or restore.');
          const value=setBundledRetired(db,decodeURIComponent(retire[1]),data.retired,text(data.note,1000,true),user);broadcast();return send(res,200,value);
        }
        if (req.method === 'POST' && path === '/api/admin/scenarios') {
          if(!canReview)fail('Review permission is required.',403);
          const value=createScenario(db,await body(req),user);broadcast();return send(res,201,value);
        }
        const scenarioReview = /^\/api\/admin\/scenarios\/([^/]+)\/review$/.exec(path);
        if (req.method === 'PATCH' && scenarioReview) {
          if(!canReview)fail('Review permission is required.',403);
          const data = await body(req);
          if (!['approved','live','rejected','draft'].includes(data.status)) fail('Choose approve, make live, reject or return to draft.');
          const value=reviewScenario(db,scenarioReview[1],data.status,text(data.note,1000,true),user);broadcast();return send(res,200,value);
        }
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
      // Public: live scenarios for one age band only. Drafts, approved-but-unpublished and rejected rows never leave the server.
      if (req.method === 'GET' && path === '/api/scenarios') return send(res,200,publicScenarios(db,user?.age_band||requestedBand));
      if (req.method === 'GET' && path === '/api/events') {
        res.writeHead(200, { 'Content-Type':'text/event-stream', 'Cache-Control':'no-cache', Connection:'keep-alive' });
        res.write('event: change\ndata: {}\n\n'); clients.add(res);
        const interval = setInterval(() => res.write(': keepalive\n\n'), 25000);
        res.on('close', () => { clearInterval(interval); clients.delete(res); }); return;
      }
      if (req.method === 'GET' && path === '/api/posts') return send(res, 200, db.prepare("SELECT * FROM posts WHERE COALESCE(json_extract(data,'$.seedArchived'),0)=0 ORDER BY created DESC LIMIT 200").all().filter(p => visibleTo(db,p,user?.id)&&(p.user_id===user?.id||postVisibleToBand(bandView(db,p),band))).map(p => postView(db,p,user?.id)));
      const personMatch=/^\/api\/people\/([^/]+)$/.exec(path);
      if(req.method==='GET'&&personMatch){
        const person=db.prepare('SELECT id,name,profile FROM users WHERE id=?').get(personMatch[1]);if(!person)fail('Person not found.',404);
        const posts=db.prepare("SELECT * FROM posts WHERE user_id=? AND COALESCE(json_extract(data,'$.seedArchived'),0)=0 ORDER BY created DESC LIMIT 100").all(person.id).filter(row=>visibleTo(db,row,user?.id)&&(row.user_id===user?.id||postVisibleToBand(JSON.parse(row.data),band))).map(row=>postView(db,row,user?.id));
        return send(res,200,{person:authorView(person),posts});
      }
      const activityMatch=/^\/api\/posts\/([^/]+)\/activity$/.exec(path);
      if(req.method==='GET'&&activityMatch){
        const target=db.prepare('SELECT id,user_id,data FROM posts WHERE id=?').get(activityMatch[1]);if(!target||!visibleTo(db,target,user?.id))fail('Post not found.',404);
        const id=activityMatch[1], people=(sql,...args)=>db.prepare(sql).all(...args).map(authorView);
        return send(res,200,{likes:people('SELECT u.id,u.name,u.profile FROM users u JOIN reactions r ON r.user_id=u.id WHERE r.post_id=? AND r.kind=? ORDER BY u.name',id,'like'),helpful:people('SELECT u.id,u.name,u.profile FROM users u JOIN reactions r ON r.user_id=u.id WHERE r.post_id=? AND r.kind=? ORDER BY u.name',id,'warned'),shares:people('SELECT u.id,u.name,u.profile FROM users u JOIN shares s ON s.user_id=u.id WHERE s.post_id=? ORDER BY u.name',id),reposts:people("SELECT DISTINCT u.id,u.name,u.profile FROM users u JOIN posts p ON p.user_id=u.id WHERE json_extract(p.data,'$.repostOf')=? AND COALESCE(json_extract(p.data,'$.seedArchived'),0)=0 ORDER BY u.name",id)});
      }
      // Quick sign-up for low-tech users: nickname + age group, optional 4-digit PIN. No email.
      // The account gets a short sign-in code (e.g. sati-k7m2p9) that works with the PIN on another phone.
      // Kids need a PIN: it is the parent lock for leaving Kids, like the password on a full account.
      if (req.method === 'POST' && path === '/api/auth/quick') {
        const data = await body(req), name = text(data.name,40,true);
        if (reservedName(name)) fail('This display name is reserved. Choose another name.');
        if (!isBand(data.ageBand)) fail('Choose a valid age group.');
        const pin = data.pin === undefined || data.pin === '' ? null : String(data.pin);
        if (pin !== null && !/^\d{4}$/.test(pin)) fail('The PIN must be 4 numbers.');
        if (data.ageBand === 'kids' && !pin) fail('Kids accounts need a 4-digit parent PIN.');
        const id = randomUUID(), salt = randomBytes(16).toString('hex');
        const hash = await passwordHash(pin ?? randomBytes(24).toString('hex'), salt);
        let code;
        for (let tries = 0; ; tries++) {
          code = 'sati-' + Array.from(randomBytes(6), b => QUICK_CHARS[b % QUICK_CHARS.length]).join('');
          if (!db.prepare('SELECT id FROM users WHERE email=?').get(quickEmail(code))) break;
          if (tries > 20) fail('Please try again.',503);
        }
        db.prepare('INSERT INTO users(id,email,name,password,salt,age_band) VALUES (?,?,?,?,?,?)').run(id,quickEmail(code),name,hash,salt,data.ageBand);
        db.prepare('INSERT INTO user_access(user_id,created,last_login) VALUES (?,?,?)').run(id,Date.now(),Date.now());
        const row = db.prepare('SELECT * FROM users WHERE id=?').get(id);
        return send(res,200,{user:userView(row),token:session(db,row.id),code,pin:!!pin});
      }
      if (req.method === 'POST' && ['/api/auth/register','/api/auth/login','/api/admin/auth/login'].includes(path)) {
        const data = await body(req);
        // A quick account signs in with its code and 4-digit PIN instead of email and password.
        const quick = path === '/api/auth/login' && typeof data.email === 'string' && QUICK_CODE.test(data.email.trim().toLowerCase());
        const email = quick ? quickEmail(data.email.trim().toLowerCase()) : text(data.email,254,true).toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail('Enter a valid email address.');
        const pw = quick ? (typeof data.password === 'string' && /^\d{4}$/.test(data.password) ? data.password : fail('Enter the 4-digit PIN.')) : password(data.password);
        let row = db.prepare('SELECT * FROM users WHERE email=?').get(email);
        if (path.endsWith('register')) {
          if (row) fail('An account already uses this email.',409);
          const name = text(data.name,80,true), id = randomUUID(), salt = randomBytes(16).toString('hex');
          if (reservedName(name)) fail('This display name is reserved. Choose another name.');
          const hash = await passwordHash(pw,salt);
          if (data.ageBand !== undefined && !isBand(data.ageBand)) fail('Choose a valid age group.');
          try { db.prepare('INSERT INTO users(id,email,name,password,salt,age_band) VALUES (?,?,?,?,?,?)').run(id,email,name,hash,salt,data.ageBand ?? null); } catch (e) { if (e.message.includes('UNIQUE')) fail('An account already uses this email.',409); throw e; }
          db.prepare('INSERT INTO user_access(user_id,created) VALUES (?,?)').run(id,Date.now());
          row = db.prepare('SELECT * FROM users WHERE id=?').get(id);
        } else {
          const now = Date.now(), failures = loginFailures.get(email);
          if (failures && failures.until > now && failures.count >= LOGIN_FAILURES) fail('Too many failed sign-in attempts. Try again in 15 minutes or reset your password.',429);
          if (!row || !await passwordMatches(pw,row)) {
            const entry = failures && failures.until > now ? failures : { count: 0, until: now + LOGIN_LOCK_MS };
            entry.count++; loginFailures.set(email, entry);
            if (loginFailures.size > 10000) for (const [k,v] of loginFailures) if (v.until < now) loginFailures.delete(k);
            fail('Incorrect email or password.',401);
          }
          loginFailures.delete(email);
        }
        if(accessFor(db,row).status!=='active')fail('This account is inactive. Contact an administrator.',403);
        if(path === '/api/admin/auth/login' && !['admin','reviewer','viewer'].includes(accessFor(db,row).role)) fail('This account does not have workspace access.',403);
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
        loginFailures.delete(db.prepare('SELECT email FROM users WHERE id=?').get(row.user_id)?.email);
        return send(res,200,{ok:true});
      }
      const match = /^\/api\/posts\/([^/]+)(?:\/(comments|reactions|reposts|translate|share))?$/.exec(path);
      if (req.method === 'GET' && match?.[2] === 'comments') {
        const target=db.prepare('SELECT id,user_id,data FROM posts WHERE id=?').get(match[1]);if (!target||!visibleTo(db,target,user?.id)) fail('Post not found.',404);
        return send(res,200,db.prepare('SELECT comments.*,users.name,users.profile FROM comments JOIN users ON users.id=comments.user_id WHERE post_id=? ORDER BY created').all(match[1]).map(r=>({id:r.id,text:r.text,createdAt:r.created,author:authorView({...r,id:r.user_id})})));
      }
      if (!user) fail('Please sign in.',401);
      if (req.method === 'GET' && path === '/api/assistant/usage') return send(res,200,assistantUsage(db,user.id));
      if (req.method === 'POST' && path === '/api/assistant') {
        const data=await body(req);
        if(!['text','post'].includes(data.kind)||!['auto','ask','check'].includes(data.mode||'auto'))fail('Choose a valid check type and mode.');
        const askBand=user.age_band||(isBand(data.band)?data.band:'youth');
        return send(res,200,await assistantReply(db,user.id,{text:text(data.text,2000,true),kind:data.kind,mode:data.mode||'auto',band:askBand,lang:data.lang==='lo'||data.lang==='en'?data.lang:undefined},assistantServices));
      }
      if (req.method === 'POST' && path === '/api/translate') {
        const data=await body(req),value=text(data.text,2000,true);
        if(!['en','lo'].includes(data.target))fail('Choose English or Lao.');
        if(translationEnabled())return send(res,200,{text:await translateText(value,data.target==='lo'?'en':'lo',data.target)});
        return send(res,200,{text:await hostedTranslation(value,data.target)});
      }
      if (req.method === 'POST' && path === '/api/devices') {
        const data=await body(req), token=text(data.token,200,true);
        if(!/^[0-9a-fA-F]{32,200}$/.test(token)) fail('Invalid device token.');
        db.prepare('INSERT INTO device_tokens(token,user_id,platform,lang,created) VALUES (?,?,?,?,?) ON CONFLICT(token) DO UPDATE SET user_id=excluded.user_id,lang=excluded.lang,created=excluded.created').run(token,user.id,'ios',data.lang==='lo'?'lo':'en',Date.now());
        return send(res,200,{ok:true,push:!!push});
      }
      if (req.method === 'POST' && path === '/api/devices/remove') { const data=await body(req); db.prepare('DELETE FROM device_tokens WHERE token=? AND user_id=?').run(text(data.token,200,true),user.id); return send(res,200,{ok:true}); }
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
        if (name !== user.name && reservedName(name)) fail('This display name is reserved. Choose another name.');
        if (data.bio !== undefined) profile.bio = text(data.bio,500);
        if (data.ageBand !== undefined && data.ageBand !== user.age_band) {
          if (!isBand(data.ageBand)) fail('Choose a valid age group.');
          // Anyone may switch an account to Kids (a parent handing over the phone). Leaving Kids needs the
          // account password, so a child cannot unlock posting and older content with one tap.
          if (user.age_band === 'kids') {
            const failures = loginFailures.get(user.email), now = Date.now();
            if (failures && failures.until > now && failures.count >= LOGIN_FAILURES) fail('Too many wrong passwords. Try again in 15 minutes.',429);
            if (typeof data.password !== 'string' || !await passwordMatches(data.password,user)) {
              const entry = failures && failures.until > now ? failures : { count: 0, until: now + LOGIN_LOCK_MS };
              entry.count++; loginFailures.set(user.email, entry);
              fail('A parent or guardian needs to enter the account password to leave Kids mode.',403);
            }
            loginFailures.delete(user.email);
          }
          db.prepare('UPDATE users SET age_band=? WHERE id=?').run(data.ageBand,user.id);
        }
        if (data.followed !== undefined) { if (!Array.isArray(data.followed) || data.followed.length>10 || data.followed.some(t=>!validTag(t))) fail('Invalid topics.'); profile.followed=cleanTags(data.followed); }
        if(data.following!==undefined){if(!Array.isArray(data.following)||data.following.length>200||data.following.some(id=>typeof id!=='string'||id===user.id||!db.prepare('SELECT id FROM users WHERE id=?').get(id)))fail('Choose valid community accounts to follow.');profile.following=[...new Set(data.following)];}
        if (data.easyMode !== undefined) { if (typeof data.easyMode !== 'boolean') fail('Invalid setting.'); profile.easyMode=data.easyMode; delete profile.simpleMode; }
        for (const k of ['avatar','banner']) if (data[k] !== undefined) profile[k]=image(data[k]) || null;
        db.prepare('UPDATE users SET name=?,profile=? WHERE id=?').run(name,JSON.stringify(profile),user.id); broadcast();
        return send(res,200,userView(db.prepare('SELECT * FROM users WHERE id=?').get(user.id)));
      }
      const kidsNoPost = () => { if (!canPostAsBand(user.age_band)) fail('Kids accounts can read and play, but not post, comment or repost.',403); };
      if (req.method === 'POST' && path === '/api/posts') {
        kidsNoPost();
        const data = await body(req), content = text(data.content,2000), contentLo = text(data.contentLo,2000);
        if (!content && !contentLo) fail('Write your post in English or Lao.');
        if (!Array.isArray(data.tags) || data.tags.length>10 || data.tags.some(t=>!validTag(t))) fail('Use up to 10 hashtags: letters, Lao characters, numbers or underscores, up to 40 characters each.');
        const source = link(data.link); if (data.isNews && !source) fail('News posts need a source URL.');
        const since = Date.parse(new Date(Date.now()+7*3600000).toISOString().slice(0,10)+'T00:00:00+07:00');
        if (db.prepare("SELECT COUNT(*) n FROM posts WHERE user_id=? AND created>? AND json_extract(data,'$.repostOf') IS NULL").get(user.id,since).n >= 5) fail('Limit reached: 5 posts per day. Resets at midnight in Laos.',429);
        const post = {id:randomUUID(),content:content||contentLo,contentLo:contentLo||undefined,contentLanguage:data.contentLanguage==='lo'&&contentLo?'lo':content?'en':'lo',tags:cleanTags(data.tags),link:source||undefined,image:image(data.image),isNews:!!data.isNews,bands:isBand(user.age_band)?[user.age_band]:undefined,state:'clean',likes:0,comments:0,reposts:0,warnedMe:0,timestamp:'Just now'};
        const onProgress=stage=>{if(url.searchParams.get('stream')==='1'){if(!res.headersSent)res.writeHead(200,{'Content-Type':'application/x-ndjson','Cache-Control':'no-store','X-Accel-Buffering':'no'});res.write(JSON.stringify({type:'progress',stage,done:false})+'\n');}};
        await check(post,{onProgress});
        if(!post.tags.length)post.tags=post.check?.on_topic?['DigitalSafety']:['OffTopic'];
        if (db.prepare("SELECT COUNT(*) n FROM posts WHERE user_id=? AND created>? AND json_extract(data,'$.repostOf') IS NULL").get(user.id,since).n>=5)fail('Limit reached: 5 posts per day. Resets at midnight in Laos.',429);
        db.prepare('INSERT INTO posts VALUES (?,?,?,?)').run(post.id,user.id,JSON.stringify(post),Date.now());
        logScreening(db,post);
        if(post.state==='flagged')db.prepare('INSERT INTO notifications(id,user_id,actor_name,kind,post_id,created) VALUES (?,?,?,?,?,?)').run(randomUUID(),user.id,'Safety review','safety',post.id,Date.now());
        if(post.isNews&&['reviewer','admin'].includes(accessFor(db,user).role))alertNews(db,db.prepare('SELECT * FROM posts WHERE id=?').get(post.id));
        sweep();broadcast();
        return send(res,201,postView(db,db.prepare('SELECT * FROM posts WHERE id=?').get(post.id),user.id));
      }
      if (req.method === 'POST' && match) {
        const row = db.prepare('SELECT * FROM posts WHERE id=?').get(match[1]); if (!row || !visibleTo(db,row,user.id)) fail('Post not found.',404);
        if(match[2]!=='translate'){
          const current=JSON.parse(row.data);
          if(!current.check&&!current.review){
            let pending=interactionChecks.get(row.id);
            if(!pending){pending=(async()=>{await check(current);db.prepare('UPDATE posts SET data=? WHERE id=?').run(JSON.stringify(current),row.id);sweep();broadcast();})();interactionChecks.set(row.id,pending);}
            try{await pending;}finally{interactionChecks.delete(row.id);}
            row.data=db.prepare('SELECT data FROM posts WHERE id=?').get(row.id).data;
          }
        }
        if(postLocked(db,row)&&match[2]!=='translate')fail('This post is awaiting moderator review. Likes, comments, reposts and sharing are locked.',409);
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
        if (match[2] === 'share'){if(data.completed===true){db.prepare('INSERT OR IGNORE INTO shares VALUES (?,?,?)').run(row.id,user.id,Date.now());broadcast();}return send(res,200,postView(db,row,user.id));}
        if (match[2] === 'comments' || match[2] === 'reposts') kidsNoPost();
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
          if (db.prepare("SELECT COUNT(*) n FROM posts WHERE user_id=? AND created>? AND json_extract(data,'$.repostOf') IS NOT NULL").get(user.id,Date.parse(new Date(Date.now()+7*3600000).toISOString().slice(0,10)+'T00:00:00+07:00')).n>=10) fail('Limit reached: 10 reposts per day. Resets at midnight in Laos.',429);
          if(!value){const existing=db.prepare("SELECT * FROM posts WHERE user_id=? AND json_extract(data,'$.repostOf')=? AND COALESCE(json_extract(data,'$.repostText'),'')=''").get(user.id,row.id);if(existing)return send(res,200,postView(db,row,user.id));}
          const post={id:randomUUID(),content:value||original.content,contentLo:value?undefined:original.contentLo,contentLanguage:value?(data.lang==='lo'?'lo':'en'):original.contentLanguage,tags:original.tags,state:'clean',likes:0,comments:0,reposts:0,warnedMe:0,repostOf:row.id,repostText:value,timestamp:'Just now'};
          if (value && data.lang==='lo') post.contentLo=value;
          if(value)await check(post);else{post.check=original.check;post.screening=original.screening;post.review=original.review;post.frozen=false;}
          if(postLocked(db,db.prepare('SELECT id,data FROM posts WHERE id=?').get(row.id)))fail('This post is under expert review.',409);
          if(db.prepare("SELECT COUNT(*) n FROM posts WHERE user_id=? AND created>? AND json_extract(data,'$.repostOf') IS NOT NULL").get(user.id,Date.parse(new Date(Date.now()+7*3600000).toISOString().slice(0,10)+'T00:00:00+07:00')).n>=10)fail('Daily repost limit reached.',429);
          db.prepare('INSERT INTO posts VALUES (?,?,?,?)').run(post.id,user.id,JSON.stringify(post),Date.now()); if(value)logScreening(db,post); notify('repost');
        } else fail('Route not found.',404);
        broadcast(); return send(res,200,postView(db,row,user.id));
      }
      fail('Route not found.',404);
    } catch(error) { if (!res.headersSent) send(res,error.status||500,{error:error.status?error.message:'Backend error. Please try again.'}); else {if(res.getHeader('Content-Type')==='application/x-ndjson')res.write(JSON.stringify({type:'error',status:error.status||500,message:error.status?error.message:'Unable to finish checking. Please retry.'})+'\n');res.end();} if (!error.status) console.error(error); }
  });
  return {server,db,deliver,close:async()=>{clearInterval(reviewTimer);clearInterval(pushTimer);await pushing;push?.close?.();for(const client of clients) client.end();server.closeAllConnections(); await new Promise(r=>server.close(r));db.close();}};
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const database=process.env.DATABASE_PATH||resolve('backend/data/sati.sqlite');
  // Hosts without a disk: pull the newest MongoDB snapshot before anything opens the database.
  let restored=false,snapshots=null;
  if(snapshotsEnabled())restored=await restoreSnapshot(database);
  const seed=process.env.SEED_DEMO==='true'||(snapshotsEnabled()&&!restored);
  const app=createApp({database,seed,trustProxy:process.env.TRUST_PROXY==='1',origins:(process.env.ALLOWED_ORIGINS||'').split(',').filter(Boolean)});
  if(snapshotsEnabled())snapshots=startSnapshots(app.db,database,{restored});
  const port=Number(process.env.PORT||process.env.API_PORT||3001),host=process.env.API_HOST||(process.env.NODE_ENV==='production'?'0.0.0.0':'127.0.0.1');
  app.server.on('error',error=>{if(error.code!=='EADDRINUSE')throw error;console.error(`Port ${port} is already in use: another Sati backend is probably still running.\nStop it with:  kill $(lsof -tiTCP:${port} -sTCP:LISTEN)\nThen run npm run dev again.`);process.exit(1);});
  app.server.listen(port,host,()=>console.log(`Sati backend: http://${host}:${port}`));
  let stopping=false;
  for(const signal of ['SIGINT','SIGTERM'])process.on(signal,async()=>{if(stopping)return;stopping=true;try{await snapshots?.flush();}catch(error){console.error('final backup failed:',error.message);}await app.close();process.exit(0);});
}
