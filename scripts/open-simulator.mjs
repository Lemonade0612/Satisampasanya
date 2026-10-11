import { execFileSync } from 'node:child_process';

const [url = 'http://127.0.0.1:5173', requestedDevice] = process.argv.slice(2);

try {
  const parsed = new URL(url);
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Use an http:// or https:// website URL.');
  }
  const { devices } = JSON.parse(execFileSync('xcrun', ['simctl', 'list', 'devices', 'booted', '--json'], { encoding: 'utf8' }));
  const booted = Object.values(devices).flat().filter(device => device.state === 'Booted');
  const device = requestedDevice ? booted.find(device => device.udid === requestedDevice) : booted[0];
  if (!requestedDevice && booted.length > 1) {
    throw new Error('Multiple simulators are running. Pass the URL and device ID to select one.');
  }
  if (!device) throw new Error('Start your iPhone in Device Hub first.');
  execFileSync('xcrun', ['simctl', 'openurl', device.udid, parsed.href], { stdio: 'inherit' });
  console.log(`Opened ${parsed.href} on ${device.name}. Keep the Vite server running.`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
