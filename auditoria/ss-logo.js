const { chromium } = require('playwright-core')
const path = require('path')

;(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:/Users/COLMAJ ADMIN/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe',
  })

  const desktop = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  })
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  })

  const d = await desktop.newPage()
  await d.goto('http://localhost:3000/preview/dashboard', { waitUntil: 'networkidle' })
  await d.waitForTimeout(1500)
  await d.screenshot({ path: path.resolve(__dirname, 'screenshots/logo-desktop.png'), clip: { x: 0, y: 0, width: 1440, height: 110 } })
  await d.close()

  const m = await mobile.newPage()
  await m.goto('http://localhost:3000/preview/dashboard', { waitUntil: 'networkidle' })
  await m.waitForTimeout(1500)
  await m.screenshot({ path: path.resolve(__dirname, 'screenshots/logo-mobile.png'), clip: { x: 0, y: 0, width: 390, height: 130 } })
  await m.close()

  await browser.close()
  console.log('OK')
})().catch(e => { console.error(e.message); process.exit(1) })
