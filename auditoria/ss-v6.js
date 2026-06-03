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

  const targets = [
    { url: 'http://localhost:3000/preview/dashboard', file: 'v6-dashboard.png', full: true },
    { url: 'http://localhost:3000/preview/intimidad', file: 'v6-intimidad.png', full: true },
    { url: 'http://localhost:3000/preview/sintomas', file: 'v6-sintomas.png', full: true },
  ]

  for (const t of targets) {
    const page = await mobile.newPage()
    console.log(`→ ${t.file}`)
    await page.goto(t.url, { waitUntil: 'networkidle', timeout: 30000 })
    await page.evaluate(() => (document.fonts ? document.fonts.ready : Promise.resolve()))
    await page.waitForTimeout(2000)
    await page.screenshot({ path: path.resolve(__dirname, 'screenshots', t.file), fullPage: t.full })
    await page.close()
  }

  // Modal de síntomas abierto
  const page = await mobile.newPage()
  await page.goto('http://localhost:3000/preview/sintomas', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  await page.locator('text=Registrar cómo me siento').click()
  await page.waitForTimeout(600)
  // Tocar algunos chips
  await page.getByRole('button', { name: 'Cólicos', exact: true }).click()
  await page.getByRole('button', { name: 'Hinchazón', exact: true }).click()
  await page.getByRole('button', { name: 'Ansiedad', exact: true }).click()
  await page.waitForTimeout(300)
  await page.screenshot({ path: path.resolve(__dirname, 'screenshots/v6-sintomas-modal.png') })
  await page.close()

  await browser.close()
  console.log('OK')
})().catch(e => { console.error(e.message); process.exit(1) })
