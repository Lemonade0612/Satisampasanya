import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
try { process.loadEnvFile('.env.local'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const children = new Set();
let stopping = false;
const stop = () => { stopping = true; for (const child of children) child.kill('SIGTERM'); };
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, stop);
const launch = (file, args = []) => {
  const child = spawn(process.execPath, [file, ...args], { stdio: 'inherit', env: process.env });
  children.add(child);
  child.on('error', error => { console.error(error.message); process.exitCode = 1; stop(); });
  child.on('exit', () => children.delete(child));
  return child;
};
const available = async (url) => {
  try { return (await fetch(url, { signal: AbortSignal.timeout(1000) })).ok; }
  catch { return false; }
};
try {
  if (process.platform !== 'darwin') throw new Error('The iPhone simulator requires macOS and Xcode.');
  const backend = `http://127.0.0.1:${process.env.API_PORT || 3001}/api/health`;
  if (!(await available(backend))) {
    const api = launch('scripts/start-service.mjs', ['backend']);
    const deadline = Date.now() + 30000;
    while (!(await available(backend))) {
      if (stopping || api.exitCode !== null || api.signalCode) throw new Error('Backend stopped before it was ready.');
      if (Date.now() > deadline) throw new Error('Backend did not become ready within 30 seconds.');
      await delay(300);
    }
  }
  if (process.env.NLLB_URL && existsSync('translation/.venv/bin/python') && !(await available(process.env.NLLB_URL + '/health'))) launch('scripts/start-ai.mjs');
  if (!stopping) {
    const native = launch('scripts/run-ios.mjs', process.argv.slice(2));
    const code = await new Promise(resolve => native.once('exit', resolve));
    if (code !== 0) { process.exitCode = 1; stop(); }
    else console.log('iPhone app is open. Keep this F5 session running for local backend access. The app screens are bundled; no frontend server is needed.');
  }
} catch (error) { console.error(error.message); process.exitCode = 1; stop(); }
