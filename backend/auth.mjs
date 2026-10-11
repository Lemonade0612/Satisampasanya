import { randomBytes, scrypt, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
const derive = promisify(scrypt);
export const digest = token => createHash('sha256').update(token).digest('hex');
export async function passwordHash(password, salt) { return (await derive(password, salt, 64)).toString('hex'); }
export async function passwordMatches(password, row) { return timingSafeEqual(Buffer.from(await passwordHash(password, row.salt), 'hex'), Buffer.from(row.password, 'hex')); }
export function session(db, userId) {
  const token = randomBytes(32).toString('hex');
  db.prepare('DELETE FROM sessions WHERE expires<?').run(Date.now());
  db.prepare('INSERT INTO sessions VALUES (?,?,?)').run(digest(token), userId, Date.now() + 30 * 86400000);
  return token;
}
export function currentUser(db, req) {
  const token = req.headers.authorization?.replace(/^Bearer /, '');
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const user = db.prepare('SELECT users.* FROM users JOIN sessions ON users.id=sessions.user_id WHERE sessions.token=? AND sessions.expires>?').get(digest(token), Date.now());
  if(user&&db.prepare('SELECT status FROM user_access WHERE user_id=?').get(user.id)?.status==='inactive')return null;
  return user;
}
