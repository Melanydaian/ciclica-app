const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Users/COLMAJ ADMIN/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe' });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'ss-login.png' });
  await browser.close();
  console.log('Done');
})().catch(e => { console.error(e.message); process.exit(1); });
