import { createApp } from './server.mjs';
import { promoteAdmin } from './access.mjs';

export async function start(options = {}) {
  const app = createApp({ database: ':memory:', seed: false, ...options });
  await new Promise(r => app.server.listen(0, '127.0.0.1', r));
  const root = `http://127.0.0.1:${app.server.address().port}`;
  const call = async (path, { method = 'GET', body, headers = {}, token } = {}) => {
    const response = await fetch(root + path, { method, headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers }, body: body ? JSON.stringify(body) : undefined });
    const text = await response.text(); let value; try { value = JSON.parse(text); } catch { value = text; }
    return { status: response.status, value, headers: response.headers };
  };
  const register = async (email = 'alice@example.com', extra = {}) => (await call('/api/auth/register', { method: 'POST', body: { name: email.split('@')[0], email, password: 'correct-password', ...extra } })).value;
  const admin = async (email = 'boss@example.com') => { const a = await register(email); promoteAdmin(app.db, email); return a; };
  return { ...app, root, call, register, admin };
}
