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
  await ctx.addInitScript(() => {
    try {
      localStorage.setItem('ciclica-theme', 'dark')
      document.documentElement.classList.add('dark')
    } catch {}
  })

  // Modal de Sex registrar
  const p1 = await ctx.newPage()
  await p1.goto('http://localhost:3000/preview/intimidad', { waitUntil: 'networkidle' })
  await p1.evaluate(() => document.documentElement.classList.add('dark'))
  await p1.waitForTimeout(1500)
  await p1.getByRole('button', { name: /Registrar momento íntimo/ }).click()
  await p1.waitForTimeout(600)
  await p1.screenshot({ path: path.resolve(__dirname, 'screenshots/dark-modal-sex.png') })
  await p1.close()

  // Modal de Sintoma registrar
  const p2 = await ctx.newPage()
  await p2.goto('http://localhost:3000/preview/sintomas', { waitUntil: 'networkidle' })
  await p2.evaluate(() => document.documentElement.classList.add('dark'))
  await p2.waitForTimeout(1500)
  await p2.getByRole('button', { name: /Registrar cómo me siento/ }).click()
  await p2.waitForTimeout(600)
  await p2.screenshot({ path: path.resolve(__dirname, 'screenshots/dark-modal-sintoma.png') })
  await p2.close()

  // PhaseInfoModal en dashboard
  const p3 = await ctx.newPage()
  await p3.goto('http://localhost:3000/preview/dashboard', { waitUntil: 'networkidle' })
  await p3.evaluate(() => document.documentElement.classList.add('dark'))
  await p3.waitForTimeout(1500)
  await p3.getByRole('button', { name: /Aprender sobre esta fase/ }).click()
  await p3.waitForTimeout(600)
  await p3.screenshot({ path: path.resolve(__dirname, 'screenshots/dark-modal-phase.png') })
  await p3.close()

  // FAB menu abierto
  const p4 = await ctx.newPage()
  await p4.goto('http://localhost:3000/preview/dashboard', { waitUntil: 'networkidle' })
  await p4.evaluate(() => document.documentElement.classList.add('dark'))
  await p4.waitForTimeout(1500)
  await p4.locator('button[aria-label*="rápidas"], button[aria-label*="Cerrar acciones"]').first().click({ force: true })
  await p4.waitForTimeout(500)
  await p4.screenshot({ path: path.resolve(__dirname, 'screenshots/dark-fab.png') })
  await p4.close()

  await browser.close()
  console.log('OK')
})().catch(e => { console.error(e.message); process.exit(1) })
