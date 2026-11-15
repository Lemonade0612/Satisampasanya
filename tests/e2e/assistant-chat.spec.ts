import { test, expect, type Page } from '@playwright/test';

// Safety Assistant chat at phone width (390 px): auto-scroll, the "New message" pill, and the input never covering a message.
const API = 'http://127.0.0.1:3199/api';

async function openAssistant(page: Page, request: import('@playwright/test').APIRequestContext) {
  const res = await request.post(`${API}/auth/quick`, { data: { name: `e2e${Date.now() % 100000}`, ageBand: 'youth' } });
  const { token } = await res.json();
  await page.addInitScript(t => { localStorage.setItem('sati-session', t); localStorage.setItem('sati-lang', 'en'); localStorage.setItem('sati-age-tier', '"youth"'); }, token);
  await page.goto('/');
  await page.getByRole('button', { name: 'Ask Sati' }).click({ timeout: 20000 });
  await expect(page.getByTestId('chat-list')).toBeVisible();
}

const overlap = (page: Page) => page.evaluate(() => {
  const list = document.querySelector('[data-testid="chat-list"]')!, last = list.querySelector('.mb-6:last-child');
  const input = document.querySelector('textarea')!.closest('.sticky')!.getBoundingClientRect();
  const box = last!.getBoundingClientRect(), view = list.getBoundingClientRect();
  return { inputTop: input.top, listBottom: view.bottom, lastBottom: box.bottom, scrollGap: list.scrollHeight - list.scrollTop - list.clientHeight };
});

test('auto-scrolls to the newest message and the input never overlaps it', async ({ page, request }) => {
  await openAssistant(page, request);
  const box = page.getByLabel('Your message');
  const send = page.getByRole('button', { name: 'Send' });
  for (const message of ['g00gle-login.xyz', 'https://bit.ly/win', 'google.com', 'Free visa job abroad, pay a deposit first', 'call 1362', 'https://www.facebook.com.secure-login.ru/']) {
    await box.fill(message); await send.click();
    await expect(page.getByText(message, { exact: false }).last()).toBeVisible();
    await expect(send).toBeDisabled(); // cannot send an empty box (and not twice)
    await page.waitForTimeout(500);
    const m = await overlap(page);
    expect(m.scrollGap, 'stays at the bottom').toBeLessThan(40);
    expect(m.lastBottom, 'last message is above the input bar').toBeLessThanOrEqual(m.inputTop + 1);
    expect(m.listBottom).toBeLessThanOrEqual(m.inputTop + 1);
  }
  // The verdict card is on screen with a badge.
  await expect(page.getByText('Likely scam').last()).toBeVisible();
  // Text is at least 18px.
  const size = await box.evaluate(el => parseFloat(getComputedStyle(el).fontSize));
  expect(size).toBeGreaterThanOrEqual(18);
});

test('scrolled-up readers get a "New message" pill instead of being yanked down', async ({ page, request }) => {
  await openAssistant(page, request);
  const box = page.getByLabel('Your message');
  for (const m of ['google.com', 'bit.ly/a', 'call 1362']) { await box.fill(m); await page.getByRole('button', { name: 'Send' }).click(); await page.waitForTimeout(400); }
  // Delay the next answer, scroll up while it is pending, then let it arrive.
  await page.route('**/api/assistant/stream', async route => { await new Promise(r => setTimeout(r, 1200)); await route.continue(); });
  await box.fill('g00gle-login.xyz'); await page.getByRole('button', { name: 'Send' }).click();
  await page.getByTestId('chat-list').evaluate(el => { el.scrollTo({ top: 0 }); el.dispatchEvent(new Event('scroll')); });
  await expect(page.getByRole('button', { name: /New message/ })).toBeVisible({ timeout: 8000 });
  const top = await page.getByTestId('chat-list').evaluate(el => el.scrollTop);
  expect(top).toBeLessThan(50);
  await page.getByRole('button', { name: /New message/ }).click();
  await expect(page.getByRole('button', { name: /New message/ })).toBeHidden();
});

test('the typing indicator shows immediately and the disclaimer links to /about-ai', async ({ page, request }) => {
  await openAssistant(page, request);
  await page.route('**/api/assistant/stream', async route => { await new Promise(r => setTimeout(r, 1500)); await route.continue(); });
  await page.getByLabel('Your message').fill('Is this job real?');
  await page.getByRole('button', { name: 'Send' }).click();
  await expect(page.getByRole('status', { name: 'Sati is typing' })).toBeVisible({ timeout: 300 });
  const link = page.getByRole('link', { name: 'How Sati checks' });
  await expect(link).toHaveAttribute('href', '/about-ai');
  await expect(page.getByText('Sati AI can make mistakes. Please double-check important info.')).toBeVisible();
});

test('/about-ai explains the checks, limits and privacy in both languages', async ({ page }) => {
  await page.goto('/about-ai');
  await expect(page.getByRole('heading', { name: 'How Sati AI checks things' })).toBeVisible();
  await expect(page.getByText('It cannot be sure.')).toBeVisible();
  await page.getByRole('button', { name: 'ລາວ' }).click();
  await expect(page.getByRole('heading', { name: 'Sati AI ກວດສອບແນວໃດ' })).toBeVisible();
});
