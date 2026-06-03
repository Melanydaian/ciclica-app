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

  // 1. Captura del hero con el botón nuevo
  const page1 = await ctx.newPage()
  await page1.goto('http://localhost:3000/preview/dashboard', { waitUntil: 'networkidle' })
  await page1.waitForTimeout(1800)
  await page1.screenshot({ path: path.resolve(__dirname, 'screenshots/v3-hero-with-button.png') })

  // 2. Click en el botón "Aprender sobre esta fase" y capturar modal abierto
  await page1.click('text=/Aprender sobre esta fase/')
  await page1.waitForTimeout(800)
  await page1.screenshot({ path: path.resolve(__dirname, 'screenshots/v3-modal-top.png') })

  // 3. Scrollear el modal hacia abajo
  await page1.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]')
    const scrollable = dialog?.querySelector('.overflow-y-auto')
    if (scrollable) scrollable.scrollTop = 800
  })
  await page1.waitForTimeout(500)
  await page1.screenshot({ path: path.resolve(__dirname, 'screenshots/v3-modal-mid.png') })

  await page1.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]')
    const scrollable = dialog?.querySelector('.overflow-y-auto')
    if (scrollable) scrollable.scrollTop = scrollable.scrollHeight
  })
  await page1.waitForTimeout(500)
  await page1.screenshot({ path: path.resolve(__dirname, 'screenshots/v3-modal-bottom.png') })

  await page1.close()
  await browser.close()
  console.log('OK')
})().catch(e => { console.error(e.message); process.exit(1) })
