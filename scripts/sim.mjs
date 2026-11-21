// Mobile simulators. Usage: node scripts/sim.mjs ios | android | mobile
//   ios      build the web app, cap sync, open the iOS Simulator (iPhone 15, 390x844; falls back to the first iPhone)
//   android  build the web app, cap sync, run on the Android emulator (AVD Pixel_7)
//   mobile   live reload on the iOS Simulator from the Vite dev server, reached by the Mac's LAN IP (not localhost)
// The API address is baked in through VITE_API_URL: iOS uses http://localhost:PORT/api, Android http://10.0.2.2:PORT/api.
import { execFileSync, spawn } from 'node:child_process';
import { networkInterfaces, homedir } from 'node:os';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const mode = process.argv[2], port = process.env.API_PORT || 3001;
const run = (cmd, args, options = {}) => execFileSync(cmd, args, { stdio: 'inherit', ...options });
const lanIp = () => Object.values(networkInterfaces()).flat().find(i => i && i.family === 'IPv4' && !i.internal)?.address;
async function backendUp(base) { try { return (await fetch(base, { signal: AbortSignal.timeout(2500) })).ok; } catch { return false; } }
async function warnBackend(host) { if (!(await backendUp(`http://${host}:${port}/health`))) console.warn(`\nBackend not reachable at http://${host}:${port}/health. Start it with: npm run backend   (or: docker compose up backend)\n`); }
const build = apiUrl => run('npm', ['run', 'build'], { env: { ...process.env, VITE_API_URL: apiUrl } });
const iosDevice = () => {
  const { devices } = JSON.parse(execFileSync('xcrun', ['simctl', 'list', 'devices', 'available', '--json'], { encoding: 'utf8' }));
  const all = Object.values(devices).flat().filter(d => d.isAvailable && d.name.startsWith('iPhone'));
  const pick = all.find(d => d.name === 'iPhone 15') || all[0];
  if (!pick) throw new Error('No iPhone simulator found. Install one in Xcode > Settings > Platforms.');
  if (pick.name !== 'iPhone 15') console.warn(`iPhone 15 is not installed; using ${pick.name}.`);
  return pick;
};
try {
  if (mode === 'ios') {
    const device = iosDevice(); await warnBackend('localhost');
    build(`http://localhost:${port}/api`);
    run('npx', ['cap', 'sync', 'ios']);
    run('node', ['scripts/run-ios.mjs', '--target', device.udid]);
  } else if (mode === 'android') {
    const sdk = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || join(homedir(), 'Library/Android/sdk');
    const emulator = join(sdk, 'emulator/emulator');
    if (!existsSync(emulator)) throw new Error(`Android emulator not found in ${sdk}. Install it: sdkmanager "emulator" "platform-tools" "system-images;android-34;google_apis;arm64-v8a"`);
    const avds = execFileSync(emulator, ['-list-avds'], { encoding: 'utf8' }).split('\n').filter(Boolean);
    if (!avds.includes('Pixel_7')) throw new Error('AVD Pixel_7 not found. Create it: avdmanager create avd -n Pixel_7 -d pixel_7 -k "system-images;android-34;google_apis;arm64-v8a"');
    await warnBackend('localhost');
    build(`http://10.0.2.2:${port}/api`);
    run('npx', ['cap', 'sync', 'android']);
    // Dev only: the emulator reaches the backend over plain http, which a https://localhost WebView would block as mixed content.
    const cfgPath = 'android/app/src/main/assets/capacitor.config.json';
    if (existsSync(cfgPath)) { const cfg = JSON.parse(readFileSync(cfgPath, 'utf8')); cfg.server = { ...cfg.server, androidScheme: 'http', cleartext: true }; writeFileSync(cfgPath, JSON.stringify(cfg, null, 2) + '\n'); }
    run('npx', ['cap', 'run', 'android', '--target', 'Pixel_7']);
  } else if (mode === 'mobile') {
    const ip = lanIp(); if (!ip) throw new Error('No LAN address found. Connect to a network, or use npm run ios:live with http://127.0.0.1:5173.');
    console.log(`Live reload from http://${ip}:5173 (backend http://${ip}:${port}). Start the backend with API_HOST=0.0.0.0 npm run backend.`);
    const vite = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '5173'], { stdio: 'inherit', env: { ...process.env, VITE_API_URL: `http://${ip}:${port}/api` } });
    process.on('exit', () => vite.kill());
    for (let i = 0; i < 40 && !(await backendUp(`http://127.0.0.1:5173/`)); i++) await new Promise(r => setTimeout(r, 500));
    run('node', ['scripts/run-ios.mjs', '--live', '--target', iosDevice().udid, '--url', `http://${ip}:5173`]);
    console.log('Simulator is running. Press Ctrl+C to stop the dev server.'); await new Promise(() => {});
  } else { console.error('Usage: node scripts/sim.mjs ios | android | mobile'); process.exit(1); }
} catch (error) { console.error(error.message); process.exit(1); }
