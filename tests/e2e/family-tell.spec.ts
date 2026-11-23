import { test, expect, type Page } from '@playwright/test';

// Elder family setup, Tell and Inform at phone width (390 px). Everything is on the phone: no backend is needed.
const SCAM = 'Your account is locked. Send the OTP code you received to 020 5555 1234 or pay a 500,000 kip fee to unlock.';

async function openElder(page: Page, { seen = true, demo = false, phone = '' }: { seen?: boolean; demo?: boolean; phone?: string } = {}) {
  await page.addInitScript(([s, p]) => {
    localStorage.setItem('sati-lang', 'lo'); localStorage.setItem('sati-age-tier', '"elder"');
    localStorage.setItem('sati-elder-guest', '1'); localStorage.setItem('sati-simple-mode', 'true');
    if (s) localStorage.setItem('sati-family-setup-seen', '1');
    if (p) { localStorage.setItem('sati-family-phone', p); localStorage.setItem('sati-family-name', 'ນ້ອຍ'); }
  }, [seen ? '1' : '', phone] as const);
  await page.goto(demo ? '/?demo' : '/');
  await page.getByRole('button', { name: /ກວດ/ }).first().waitFor({ timeout: 20000 });
}
async function getResult(page: Page) {
  await page.getByRole('button', { name: 'ກວດ', exact: true }).click();
  await page.locator('textarea').fill(SCAM);
  await page.getByRole('button', { name: 'ກວດເລີຍ' }).click();
  await expect(page.getByText('ຫຼອກລວງ').first()).toBeVisible({ timeout: 10000 });
}

test('first launch asks for the family number once, can be skipped, and validates the number', async ({ page }) => {
  await openElder(page, { seen: false });
  await expect(page.getByRole('heading', { name: 'ຕັ້ງເບີລູກ' })).toBeVisible();
  await page.getByLabel('ເບີ WhatsApp').fill('020 55');
  await page.getByRole('button', { name: 'ບັນທຶກ' }).click();
  await expect(page.getByRole('alert')).toContainText('020 5555 1234');
  await page.getByLabel('ພໍ່ແມ່ເອີ້ນເຈົ້າວ່າ').fill('ນ້ອຍ');
  await page.getByLabel('ເບີ WhatsApp').fill('020 5555 1234');
  await page.getByRole('button', { name: 'ບັນທຶກ' }).click();
  await expect(page.getByRole('heading', { name: 'ຕັ້ງເບີລູກ' })).toBeHidden();
  expect(await page.evaluate(() => [localStorage.getItem('sati-family-phone'), localStorage.getItem('sati-family-name')])).toEqual(['02055551234', 'ນ້ອຍ']);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'ຕັ້ງເບີລູກ' })).toBeHidden();
});

test('skipping the first-launch setup is remembered', async ({ page }) => {
  await openElder(page, { seen: false });
  await page.getByRole('button', { name: 'ຂ້າມກ່ອນ' }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'ຕັ້ງເບີລູກ' })).toBeHidden();
  await expect(page.getByRole('button', { name: 'ຕັ້ງເບີລູກ' })).toBeVisible(); // the Home row stays available
});

test('Tell with no number saved says "set the number" and opens setup', async ({ page }) => {
  await openElder(page);
  await getResult(page);
  await expect(page.getByTestId('sati-row')).toBeVisible();
  await expect(page.getByTestId('sati-row').locator('[data-done="true"]')).toHaveCount(2);
  await page.getByRole('button', { name: 'ຕັ້ງເບີລູກ' }).click();
  await expect(page.getByRole('heading', { name: 'ຕັ້ງເບີລູກ' })).toBeVisible();
});

test('Tell opens WhatsApp with the saved number and the message; Call uses the same number', async ({ page }) => {
  await openElder(page, { phone: '02055551234' });
  await page.addInitScript(() => { Object.defineProperty(navigator, 'share', { value: undefined, configurable: true }); (window as any).__opened = []; window.open = ((u: string) => { (window as any).__opened.push(u); return {} as Window; }) as typeof window.open; });
  await page.reload(); await page.getByRole('button', { name: 'ກວດ', exact: true }).waitFor();
  await getResult(page);
  await expect(page.getByRole('link', { name: 'ໂທຫາລູກຫຼານ' })).toHaveAttribute('href', 'tel:02055551234');
  await page.getByRole('button', { name: 'ບອກນ້ອຍ' }).click();
  const url = await page.evaluate(() => (window as any).__opened[0] as string);
  expect(url.startsWith('https://wa.me/8562055551234?text=')).toBe(true);
  const text = decodeURIComponent(url.split('?text=')[1]);
  expect(text).toContain('ແມ່/ພໍ່ ໄດ້ຮັບຂໍ້ຄວາມນີ້: "Your account is locked.');
  expect(text).toContain('ສະຕິ: ຫຼອກລວງ. ໂທຫາແມ່/ພໍ່ແດ່.');
  await expect(page.getByTestId('sati-row').locator('[data-done="true"]')).toHaveCount(3);
});

test('Tell uses the phone share sheet when there is one, with the same message', async ({ page }) => {
  await openElder(page, { phone: '02055551234' });
  await page.addInitScript(() => { (window as any).__shared = []; Object.defineProperty(navigator, 'share', { value: async (d: { text: string }) => { (window as any).__shared.push(d.text); }, configurable: true }); });
  await page.reload(); await page.getByRole('button', { name: 'ກວດ', exact: true }).waitFor();
  await getResult(page);
  await page.getByRole('button', { name: 'ບອກນ້ອຍ' }).click();
  await expect(page.getByTestId('sati-row').locator('[data-done="true"]')).toHaveCount(3);
  const shared = await page.evaluate(() => (window as any).__shared as string[]);
  expect(shared).toHaveLength(1);
  expect(shared[0]).toMatch(/^ແມ່\/ພໍ່ ໄດ້ຮັບຂໍ້ຄວາມນີ້: "Your account is locked\./);
});

test('demo mode shows a full-screen preview first and sends only from "ສົ່ງແທ້"', async ({ page }) => {
  await openElder(page, { phone: '02055551234', demo: true });
  await page.addInitScript(() => { Object.defineProperty(navigator, 'share', { value: undefined, configurable: true }); (window as any).__opened = []; window.open = ((u: string) => { (window as any).__opened.push(u); return {} as Window; }) as typeof window.open; });
  await page.reload(); await page.getByRole('button', { name: 'ກວດ', exact: true }).waitFor();
  await getResult(page);
  await page.getByRole('button', { name: 'ບອກນ້ອຍ' }).click();
  await expect(page.getByTestId('tell-preview')).toBeVisible();
  await expect(page.getByTestId('tell-preview-text')).toContainText('ແມ່/ພໍ່ ໄດ້ຮັບຂໍ້ຄວາມນີ້');
  expect(await page.evaluate(() => (window as any).__opened.length)).toBe(0);
  await page.getByRole('button', { name: 'ສົ່ງແທ້' }).click();
  expect(await page.evaluate(() => (window as any).__opened.length)).toBe(1);
});

test('Inform: confirm screen shows only the type, saves type + verdict + time on the phone, then says thanks', async ({ page }) => {
  await openElder(page, { phone: '02055551234' });
  await getResult(page);
  await page.getByRole('button', { name: 'ເຕືອນຄົນອື່ນ' }).click();
  await expect(page.getByTestId('inform-type')).toContainText('ຂໍລະຫັດ OTP');
  await expect(page.getByText('ບໍ່ສົ່ງຊື່')).toBeVisible(); await expect(page.getByText('ບໍ່ສົ່ງເບີໂທ')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('sati-inform-log'))).toBeNull();
  await page.getByRole('button', { name: 'ສົ່ງການເຕືອນ' }).click();
  await expect(page.getByTestId('inform-thanks')).toBeVisible();
  const log = await page.evaluate(() => localStorage.getItem('sati-inform-log') || '');
  const rec = JSON.parse(log);
  expect(rec).toHaveLength(1);
  expect(Object.keys(rec[0]).sort()).toEqual(['category', 'createdAt', 'verdict']);
  expect(rec[0]).toMatchObject({ category: 'otp', verdict: 'scam' });
  expect(log).not.toMatch(/0205555|ນ້ອຍ|OTP code/);
});

test('a safe result has no Tell or Inform buttons', async ({ page }) => {
  await openElder(page, { phone: '02055551234' });
  await page.getByRole('button', { name: 'ກວດ', exact: true }).click();
  await page.locator('textarea').fill('mom i will be home late, save me some food');
  await page.getByRole('button', { name: 'ກວດເລີຍ' }).click();
  await expect(page.getByText('ປອດໄພ').first()).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole('button', { name: 'ເຕືອນຄົນອື່ນ' })).toHaveCount(0);
  await expect(page.getByTestId('sati-row')).toHaveCount(0);
});
