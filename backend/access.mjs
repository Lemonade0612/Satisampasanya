import {randomUUID,randomBytes} from 'node:crypto';
import {passwordHash} from './auth.mjs';
const roles=['member','viewer','reviewer','admin'];
const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status});};
// Staff roles come only from rows an administrator (or the bootstrap script) explicitly managed.
// Self-registered accounts are always members: an email address alone never proves ownership.
export function accessFor(db,user){
 const row=db.prepare('SELECT * FROM user_access WHERE user_id=?').get(user.id);
 return {role:row?.managed?row.role:'member',status:row?.status||'active',unit:row?.unit||'',createdAt:row?.created||null,lastLogin:row?.last_login||null};
}
export function managedUsers(db){return db.prepare('SELECT id,name,email FROM users ORDER BY name').all().map(user=>({...user,...accessFor(db,user)}));}
export async function manageUser(db,actor,data,id){
 const existing=id?db.prepare('SELECT id,name,email FROM users WHERE id=?').get(id):null;
 if(id&&!existing)fail('User not found.',404);
 const name=data.name??existing?.name,email=(data.email??existing?.email)?.trim().toLowerCase();
 if(typeof name!=='string'||!name.trim()||name.trim().length>80)fail('Enter a name of 1–80 characters.');
 if(typeof email!=='string'||email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))fail('Enter a valid email address.');
 const previous=existing?accessFor(db,existing):{role:'member',status:'active',unit:''};
 const role=data.role??previous.role,status=data.status??previous.status,unit=data.unit??previous.unit;
 if(!roles.includes(role)||!['active','inactive'].includes(status))fail('Choose a valid role and status.');
 if(typeof unit!=='string'||unit.length>80)fail('Business unit must be 80 characters or fewer.');
 if(existing?.id===actor.id&&(role!=='admin'||status!=='active'))fail('You cannot remove your own administrator access.');
 if(existing&&previous.role==='admin'&&previous.status==='active'&&(role!=='admin'||status!=='active')&&managedUsers(db).filter(u=>u.role==='admin'&&u.status==='active').length<=1)fail('Keep at least one active administrator.');
 let hash,salt;
 if(!existing||data.password!==undefined){
  if(typeof data.password!=='string'||data.password.length<8||data.password.length>128)fail('Password must contain 8–128 characters.');
  salt=randomBytes(16).toString('hex');hash=await passwordHash(data.password,salt);
 }
 const userId=id||randomUUID();
 db.exec('BEGIN');
 try{
  if(existing){db.prepare('UPDATE users SET name=?,email=? WHERE id=?').run(name.trim(),email,userId);if(hash)db.prepare('UPDATE users SET password=?,salt=? WHERE id=?').run(hash,salt,userId);}
  else db.prepare('INSERT INTO users(id,name,email,password,salt) VALUES (?,?,?,?,?)').run(userId,name.trim(),email,hash,salt);
  db.prepare('INSERT INTO user_access(user_id,role,status,unit,created,managed) VALUES (?,?,?,?,?,1) ON CONFLICT(user_id) DO UPDATE SET role=excluded.role,status=excluded.status,unit=excluded.unit,managed=1').run(userId,role,status,unit.trim(),existing?previous.createdAt:Date.now());
  if(existing&&(hash||role!==previous.role||status!==previous.status))db.prepare('DELETE FROM sessions WHERE user_id=?').run(userId);
  db.prepare('INSERT INTO access_audit VALUES (?,?,?,?,?,?)').run(randomUUID(),actor.id,userId,existing?'update-user':'create-user',JSON.stringify({role,status,unit:unit.trim()}),Date.now());
  db.exec('COMMIT');
 }catch(error){db.exec('ROLLBACK');if(error.message.includes('UNIQUE'))fail('An account already uses this email.',409);throw error;}
 return {id:userId,name:name.trim(),email,...accessFor(db,{id:userId,email})};
}
// One-time bootstrap: promote an existing, already-registered account to active administrator.
export function promoteAdmin(db,email){
 const user=db.prepare('SELECT id FROM users WHERE email=?').get(String(email||'').trim().toLowerCase());
 if(!user)fail('No account uses this email. Register it in the app first.',404);
 db.exec('BEGIN');
 try{
  db.prepare("INSERT INTO user_access(user_id,role,status,managed,created) VALUES (?,'admin','active',1,?) ON CONFLICT(user_id) DO UPDATE SET role='admin',status='active',managed=1").run(user.id,Date.now());
  db.prepare('INSERT INTO access_audit VALUES (?,?,?,?,?,?)').run(randomUUID(),'bootstrap',user.id,'bootstrap-admin',JSON.stringify({role:'admin',status:'active'}),Date.now());
  db.exec('COMMIT');
 }catch(error){db.exec('ROLLBACK');throw error;}
 return user.id;
}
