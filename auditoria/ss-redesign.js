const { chromium } = require('playwright-core')
const path = require('path')
const fs = require('fs')

const OUT = path.resolve(__dirname, 'screenshots')
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true })

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
    { ctx: mobile, url: 'http://localhost:3020/preview/dashboard', file: 'redesign-mobile.png', fullPage: true },
    { ctx: desktop, url: 'http://localhost:3020/preview/dashboard', file: 'redesign-desktop.png', fullPage: true },
    { ctx: mobile, url: 'http://localhost:3020/preview/dashboard', file: 'redesign-mobile-hero.png', fullPage: false },
  ]

  for (const t of targets) {
    const page = await t.ctx.newPage()
    console.log(`→ ${t.url} → ${t.file}`)
    await page.goto(t.url, { waitUntil: 'networkidle', timeout: 30000 })
    await page.evaluate(() => (document.fonts ? document.fonts.ready : Promise.resolve()))
    await page.waitForTimeout(1800) // dar tiempo a la animación del anillo
    await page.screenshot({ path: path.join(OUT, t.file), fullPage: t.fullPage })
    await page.close()
  }

  await browser.close()
  console.log('\n✓ Screenshots guardadas')
})().catch(e => {
  console.error('FAIL:', e.message)
  process.exit(1)
})
