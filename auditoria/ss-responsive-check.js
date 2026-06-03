const { chromium } = require('playwright-core')
const path = require('path')

;(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:/Users/COLMAJ ADMIN/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe',
  })

  const sizes = [
    { name: 'mobile-360', width: 360, height: 800 },  // iPhone SE / Android chico
    { name: 'mobile-390', width: 390, height: 844 },  // iPhone estándar
    { name: 'mobile-428', width: 428, height: 926 },  // iPhone Pro Max
  ]

  for (const sz of sizes) {
    const ctx = await browser.newContext({
      viewport: { width: sz.width, height: sz.height },
      deviceScaleFactor: 2,
    })
    await ctx.addInitScript(() => {
      localStorage.setItem('ciclica-theme', 'dark')
      document.documentElement.classList.add('dark')
    })

    const page = await ctx.newPage()
    await page.goto('http://localhost:3000/preview/dashboard', { waitUntil: 'networkidle' })
    await page.evaluate(() => document.documentElement.classList.add('dark'))
    await page.waitForTimeout(1500)

    // Detectar overflow horizontal
    const hasOverflow = await page.evaluate(() => {
      const docW = document.documentElement.scrollWidth
      const winW = window.innerWidth
      const overflowingEls = []
      document.querySelectorAll('*').forEach(el => {
        const r = el.getBoundingClientRect()
        if (r.right > winW + 1) {
          overflowingEls.push({
            tag: el.tagName,
            cls: (el.className || '').toString().slice(0, 80),
            right: Math.round(r.right),
            winW,
          })
        }
      })
      return { docW, winW, hasOverflow: docW > winW, overflowingEls: overflowingEls.slice(0, 5) }
    })

    console.log(`[${sz.name}]`, JSON.stringify(hasOverflow, null, 0))

    await page.screenshot({ path: path.resolve(__dirname, `screenshots/responsive-${sz.name}.png`), fullPage: true })
    await page.close()
    await ctx.close()
  }

  await browser.close()
  console.log('OK')
})().catch(e => { console.error(e.message); process.exit(1) })
