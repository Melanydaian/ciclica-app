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

  const targets = [
    { url: 'http://localhost:3000/preview/dashboard', file: 'v2-full.png', fullPage: true },
    { url: 'http://localhost:3000/preview/dashboard', file: 'v2-hero.png', fullPage: false },
  ]

  for (const t of targets) {
    const page = await mobile.newPage()
    console.log(`→ ${t.url} → ${t.file}`)
    await page.goto(t.url, { waitUntil: 'networkidle', timeout: 30000 })
    await page.evaluate(() => (document.fonts ? document.fonts.ready : Promise.resolve()))
    await page.waitForTimeout(2000)
    if (!t.fullPage) {
      // scroll a la sección del calendario para captura intermedia
    }
    await page.screenshot({ path: path.join(OUT, t.file), fullPage: t.fullPage })
    await page.close()
  }

  // Captura específica del calendario
  const page = await mobile.newPage()
  await page.goto('http://localhost:3000/preview/dashboard', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  await page.evaluate(() => {
    const heading = Array.from(document.querySelectorAll('div')).find(
      el => el.textContent?.trim().startsWith('Calendario del ciclo')
    )
    if (heading) heading.scrollIntoView({ behavior: 'instant', block: 'start' })
  })
  await page.waitForTimeout(800)
  await page.screenshot({ path: path.join(OUT, 'v2-calendar.png') })
  await page.close()

  await browser.close()
  console.log('\n✓ Screenshots guardadas')
})().catch(e => {
  console.error('FAIL:', e.message)
  process.exit(1)
})
