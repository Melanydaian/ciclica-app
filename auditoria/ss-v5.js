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
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  })

  // Desktop navbar
  const d1 = await desktop.newPage()
  await d1.goto('http://localhost:3000/preview/dashboard', { waitUntil: 'networkidle' })
  await d1.evaluate(() => (document.fonts ? document.fonts.ready : Promise.resolve()))
  await d1.waitForTimeout(1500)
  await d1.screenshot({ path: path.resolve(__dirname, 'screenshots/v5-desktop-navbar.png'), clip: { x: 0, y: 0, width: 1440, height: 80 } })

  // Mobile navbar
  const m1 = await mobile.newPage()
  await m1.goto('http://localhost:3000/preview/dashboard', { waitUntil: 'networkidle' })
  await m1.waitForTimeout(1500)
  await m1.screenshot({ path: path.resolve(__dirname, 'screenshots/v5-mobile-navbar.png'), clip: { x: 0, y: 0, width: 390, height: 100 } })

  // Modal de sex abierto en mobile — clickeamos el último visible (mobile)
  await m1.locator('button[aria-label="Registrar momento íntimo"]:visible').first().click()
  await m1.waitForTimeout(600)
  await m1.screenshot({ path: path.resolve(__dirname, 'screenshots/v5-sex-modal.png') })

  // Modal con "No" seleccionado
  await m1.getByRole('button', { name: 'No', exact: true }).click()
  await m1.waitForTimeout(300)
  await m1.screenshot({ path: path.resolve(__dirname, 'screenshots/v5-sex-modal-no.png') })

  await m1.close()
  await d1.close()
  await browser.close()
  console.log('OK')
})().catch(e => { console.error(e.message); process.exit(1) })
