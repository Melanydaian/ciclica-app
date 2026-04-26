const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Users/COLMAJ ADMIN/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe' });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 390, height: 844 });

  const pages = [
    { url: 'http://localhost:3010', file: 'ss-pg-login.png' },
    { url: 'http://localhost:3010/dashboard', file: 'ss-pg-dashboard.png' },
    { url: 'http://localhost:3010/dashboard/historial', file: 'ss-pg-historial.png' },
    { url: 'http://localhost:3010/dashboard/sintomas', file: 'ss-pg-sintomas.png' },
    { url: 'http://localhost:3010/dashboard/perfil', file: 'ss-pg-perfil.png' },
  ];

  for (const p of pages) {
    await page.goto(p.url);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: p.file, fullPage: true });
    console.log(p.file);
  }

  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
