const { chromium } = require('playwright-core')
const path = require('path')

;(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:/Users/COLMAJ ADMIN/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe',
  })

  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  })
  const desktop = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
  })

  const targets = [
    { ctx: mobile, url: 'http://localhost:3000/preview/dashboard', file: 'v4-mobile.png', fullPage: true },
    { ctx: mobile, url: 'http://localhost:3000/preview/dashboard', file: 'v4-mobile-top.png', fullPage: false },
    { ctx: desktop, url: 'http://localhost:3000/preview/dashboard', file: 'v4-desktop.png', fullPage: true },
    { ctx: desktop, url: 'http://localhost:3000/preview/dashboard', file: 'v4-desktop-top.png', fullPage: false },
  ]

  for (const t of targets) {
    const page = await t.ctx.newPage()
    console.log(`→ ${t.file}`)
    await page.goto(t.url, { waitUntil: 'networkidle', timeout: 30000 })
    await page.evaluate(() => (document.fonts ? document.fonts.ready : Promise.resolve()))
    await page.waitForTimeout(1800)
    await page.screenshot({ path: path.resolve(__dirname, 'screenshots', t.file), fullPage: t.fullPage })
    await page.close()
  }

  await browser.close()
  console.log('OK')
})().catch(e => { console.error(e.message); process.exit(1) })
