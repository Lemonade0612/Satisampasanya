// Off-ground notifications: every new row in `notifications` is delivered to the
// recipient's registered iOS devices through APNs, with the unread count as the
// app-icon badge. The in-app (on-ground) banner is handled by the frontend.
import { connect } from 'node:http2';
import { sign } from 'node:crypto';
import { readFileSync } from 'node:fs';

const MESSAGES = {
  en: { review_requested: 'requested a post review', review_overdue: 'has a review overdue by 48 hours', review: 'reviewed your post', approved: 'approved your post', news: 'published a news update', safety: 'shared a safety alert', comment: 'commented on your post', like: 'liked your post', warned: 'found your warning helpful', repost: 'reposted your post' },
  lo: { review_requested: 'ມີໂພສລໍຖ້າການກວດ', review_overdue: 'ໂພສລໍຖ້າເກີນ 48 ຊົ່ວໂມງ', review: 'ກວດໂພສຂອງທ່ານແລ້ວ', approved: 'ອະນຸມັດໂພສຂອງທ່ານແລ້ວ', news: 'ເຜີຍແຜ່ຂ່າວໃໝ່', safety: 'ແຊຣ໌ຄຳເຕືອນ', comment: 'ສະແດງຄຳຄິດເຫັນໃນໂພສຂອງທ່ານ', like: 'ມັກໂພສຂອງທ່ານ', warned: 'ໄດ້ຮັບຄຳເຕືອນຈາກໂພສຂອງທ່ານ', repost: 'ແບ່ງປັນໂພສຂອງທ່ານ' },
};
// Skip alerts older than this when the dispatcher catches up after downtime.
const MAX_AGE = 15 * 60000;

export function pushMessage(alert, lang = 'en') {
  const words = MESSAGES[lang === 'lo' ? 'lo' : 'en'];
  const verb = alert.kind === 'review' && alert.review_state === 'clean' ? words.approved : words[alert.kind] || words.news;
  return `${alert.actor_name} ${verb}`;
}

// Returns a sender(token, payload) => {status, reason}, or null when APNs is not configured.
export function apnsSender(env = process.env) {
  const keyId = env.APNS_KEY_ID, teamId = env.APNS_TEAM_ID;
  let key = env.APNS_KEY?.replace(/\\n/g, '\n');
  if (!key && env.APNS_KEY_FILE) key = readFileSync(env.APNS_KEY_FILE, 'utf8');
  if (!key || !keyId || !teamId) return null;
  const topic = env.APNS_BUNDLE_ID || 'la.satisampasanya.app';
  const host = env.APNS_ENV === 'production' ? 'https://api.push.apple.com' : 'https://api.sandbox.push.apple.com';
  let jwt = '', issued = 0, session = null;
  const b64 = value => Buffer.from(typeof value === 'string' ? value : JSON.stringify(value)).toString('base64url');
  const token = () => {
    // APNs rejects tokens older than an hour and refreshes faster than every 20 minutes.
    if (Date.now() - issued < 40 * 60000) return jwt;
    issued = Date.now();
    const head = `${b64({ alg: 'ES256', kid: keyId })}.${b64({ iss: teamId, iat: Math.floor(issued / 1000) })}`;
    jwt = `${head}.${sign('sha256', Buffer.from(head), { key, dsaEncoding: 'ieee-p1363' }).toString('base64url')}`;
    return jwt;
  };
  const client = () => {
    if (session && !session.closed && !session.destroyed) return session;
    session = connect(host);
    session.on('error', () => { session = null; });
    session.unref();
    return session;
  };
  const send = (device, payload) => new Promise(resolve => {
    const req = client().request({ ':method': 'POST', ':path': `/3/device/${device}`, authorization: `bearer ${token()}`, 'apns-topic': topic, 'apns-push-type': 'alert', 'apns-priority': '10' });
    let status = 0, body = '';
    req.setTimeout(10000, () => { req.close(); resolve({ status: 0, reason: 'Timeout' }); });
    req.on('response', headers => { status = headers[':status']; });
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => { let reason = ''; try { reason = JSON.parse(body).reason || ''; } catch { /* empty body on success */ } resolve({ status, reason }); });
    req.on('error', error => resolve({ status: 0, reason: error.message }));
    req.end(JSON.stringify(payload));
  });
  send.close = () => session?.close();
  return send;
}

// Sends every pending alert once. Returns the number of pushes attempted.
export async function dispatchPushes(db, send, now = Date.now()) {
  const pending = db.prepare('SELECT * FROM notifications WHERE pushed IS NULL ORDER BY created LIMIT 200').all();
  if (!pending.length) return 0;
  const mark = db.prepare('UPDATE notifications SET pushed=1 WHERE id=?');
  for (const alert of pending) mark.run(alert.id);
  let attempted = 0;
  for (const alert of pending) {
    if (!send || now - alert.created > MAX_AGE) continue;
    const devices = db.prepare('SELECT token,lang FROM device_tokens WHERE user_id=?').all(alert.user_id);
    if (!devices.length) continue;
    const badge = db.prepare('SELECT COUNT(*) n FROM notifications WHERE user_id=? AND read=0').get(alert.user_id).n;
    for (const device of devices) {
      attempted++;
      const result = await send(device.token, { aps: { alert: { title: 'Sati', body: pushMessage(alert, device.lang) }, badge, sound: 'default', 'thread-id': alert.kind }, alertId: alert.id, postId: alert.post_id, kind: alert.kind });
      if (result.status === 410 || ['BadDeviceToken', 'Unregistered', 'DeviceTokenNotForTopic'].includes(result.reason)) db.prepare('DELETE FROM device_tokens WHERE token=?').run(device.token);
      else if (result.status !== 200) console.error(`APNs push failed (${result.status} ${result.reason})`);
    }
  }
  return attempted;
}
