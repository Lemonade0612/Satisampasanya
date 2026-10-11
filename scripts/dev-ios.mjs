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
  const frontend = 'http://127.0.0.1:5173';
  const ready = async () => (await available(backend)) && (await available(frontend));
  if (await ready()) {
    console.log('Using the development servers already running.');
  } else {
    if ((await available(backend)) || (await available(frontend))) throw new Error('Only one development server is running. Stop the previous app/backend session, then press F5 again.');
    const dev = launch('scripts/dev.mjs');
    const deadline = Date.now() + 30000;
    while (!(await ready())) {
      if (stopping || dev.exitCode !== null || dev.signalCode) throw new Error('Development servers stopped before they were ready.');
      if (Date.now() > deadline) throw new Error('Development servers did not become ready within 30 seconds.');
      await delay(300);
    }
  }
  if (!stopping) {
    const native = launch('scripts/run-ios.mjs', ['--live', ...process.argv.slice(2)]);
    const code = await new Promise(resolve => native.once('exit', resolve));
    if (code !== 0) { process.exitCode = 1; stop(); }
    else console.log('iPhone app is open. Keep this F5 session running for backend access and live updates.');
  }
} catch (error) { console.error(error.message); process.exitCode = 1; stop(); }
