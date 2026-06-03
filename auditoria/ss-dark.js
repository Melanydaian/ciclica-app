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
  const page = await mobile.newPage()
  // Set theme via localStorage before navigation
  await page.goto('http://localhost:3000/preview/dashboard', { waitUntil: 'networkidle' })
  await page.evaluate(() => {
    localStorage.setItem('ciclica-theme', 'dark')
    document.documentElement.classList.add('dark')
  })
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(1800)
  await page.screenshot({ path: path.resolve(__dirname, 'screenshots/dark-dashboard.png'), fullPage: true })

  // Switch back to light
  await page.evaluate(() => {
    localStorage.setItem('ciclica-theme', 'light')
    document.documentElement.classList.remove('dark')
  })
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(1800)
  await page.screenshot({ path: path.resolve(__dirname, 'screenshots/light-dashboard.png'), fullPage: true })

  await page.close()
  await browser.close()
  console.log('OK')
})().catch(e => { console.error(e.message); process.exit(1) })
