import { defineConfig } from '@playwright/test';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// End-to-end tests run their own backend (temporary database, no AI key) and web server, so they never touch dev data.
const API = 3199, WEB = 5199;
const db = join(mkdtempSync(join(tmpdir(), 'sati-e2e-')), 'e2e.sqlite');
export default defineConfig({
  testDir: 'tests/e2e', timeout: 60000, retries: 0, reporter: 'list',
  use: { baseURL: `http://127.0.0.1:${WEB}`, channel: 'chrome', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
  webServer: [
    { command: 'node backend/server.mjs', url: `http://127.0.0.1:${API}/api/health`, reuseExistingServer: false, env: { API_PORT: String(API), DATABASE_PATH: db, OPENAI_API_KEY: '', OPENROUTER_API_KEY: '', GOOGLE_SAFE_BROWSING_KEY: '' } },
    { command: `node node_modules/vite/bin/vite.js --port ${WEB}`, url: `http://127.0.0.1:${WEB}`, reuseExistingServer: false, env: { API_PORT: String(API), VITE_API_URL: '/api' } },
  ],
});
