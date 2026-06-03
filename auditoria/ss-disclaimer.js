const { chromium } = require('playwright-core')
const path = require('path')

;(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:/Users/COLMAJ ADMIN/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe',
  })

  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  })
  const page = await ctx.newPage()
  await page.goto('http://localhost:3000/preview/dashboard', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1800)

  // Scroll al final
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(800)
  await page.screenshot({ path: path.resolve(__dirname, 'screenshots/v2-disclaimer.png') })

  await browser.close()
  console.log('OK')
})().catch(e => { console.error(e.message); process.exit(1) })
