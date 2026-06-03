const { chromium } = require('playwright-core')
const path = require('path')

;(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:/Users/COLMAJ ADMIN/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe',
  })

  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    colorScheme: 'dark',
  })

  // pre-seed localStorage para que el no-flash script aplique dark antes del primer paint
  await ctx.addInitScript(() => {
    try {
      localStorage.setItem('ciclica-theme', 'dark')
      document.documentElement.classList.add('dark')
    } catch {}
  })

  const targets = [
    { url: 'http://localhost:3000/preview/dashboard', file: 'dark-dashboard.png' },
    { url: 'http://localhost:3000/preview/intimidad', file: 'dark-intimidad.png' },
    { url: 'http://localhost:3000/preview/sintomas', file: 'dark-sintomas.png' },
    { url: 'http://localhost:3000/', file: 'dark-login.png' },
  ]

  for (const t of targets) {
    const page = await ctx.newPage()
    console.log(`→ ${t.file}`)
    await page.goto(t.url, { waitUntil: 'networkidle', timeout: 30000 })
    // forzar dark de nuevo por si el render lo bajó
    await page.evaluate(() => document.documentElement.classList.add('dark'))
    await page.waitForTimeout(2000)
    await page.screenshot({ path: path.resolve(__dirname, 'screenshots', t.file), fullPage: true })
    await page.close()
  }

  await browser.close()
  console.log('OK')
})().catch(e => { console.error(e.message); process.exit(1) })
