const { chromium } = require('playwright-core')
const path = require('path')
const fs = require('fs')

const OUT = path.resolve(__dirname, 'screenshots')
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true })

;(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:/Users/COLMAJ ADMIN/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe',
  })

  // Mobile viewport (las usuarias entran desde WhatsApp en celu)
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  })

  // Desktop viewport
  const desktop = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  })

  const targets = [
    { ctx: mobile, url: 'http://localhost:3000/', file: 'predeploy-login-mobile.png', fullPage: true },
    { ctx: desktop, url: 'http://localhost:3000/', file: 'predeploy-login-desktop.png', fullPage: true },
  ]

  for (const t of targets) {
    const page = await t.ctx.newPage()
    console.log(`→ ${t.url} → ${t.file}`)
    await page.goto(t.url, { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)
    await page.screenshot({ path: path.join(OUT, t.file), fullPage: t.fullPage })
    await page.close()
  }

  // Capturar el favicon (lo que el browser pediría al tab)
  const faviconPage = await desktop.newPage()
  await faviconPage.goto('http://localhost:3000/logoflor.png')
  await faviconPage.screenshot({ path: path.join(OUT, 'predeploy-favicon.png') })
  await faviconPage.close()

  await browser.close()
  console.log('\n✓ Screenshots guardadas en:', OUT)
})().catch(e => {
  console.error('FAIL:', e.message)
  process.exit(1)
})
