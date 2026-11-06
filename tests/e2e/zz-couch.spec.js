// Capture script for the Spare Change prototype: OUT=<dir> npx playwright test tests/e2e/zz-couch.spec.js
import { test } from "@playwright/test"
const OUT = process.env.OUT || "../ui-shots/tmp"
test("couch captures", async ({ browser }) => {
  test.setTimeout(120_000)
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, baseURL: "http://127.0.0.1:4173" })
  const page = await context.newPage()
  await page.goto("/couch")
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${OUT}/fresh.png` })
  for (let i = 0; i < 40; i += 1) {
    const glint = page.getByRole("button", { name: /glint/i }).first()
    if (await glint.count()) await glint.click({ timeout: 500 }).catch(() => {})
    await page.waitForTimeout(250)
  }
  await page.screenshot({ path: `${OUT}/playing.png` })
  const save = await page.evaluate(() => localStorage.getItem("spareChange.save.v1"))
  const data = JSON.parse(save || "{}")
  Object.assign(data, { cents: 2450, earnedCents: 7400, lint: 31, unlocked: { car: true, lintBall: true, moveHouse: true },
    upgrades: { longFingers: 1, pocketTorch: 1, cushionFlip: 1, sockVacuum: 1, raccoon: 1 },
    collection: { ...(data.collection || {}), button: 2, arcadeToken: 1, earringLeft: 1, steelPenny: 1, carKey: 1, parkingReceipt: 3 }, savedAt: Date.now() - 20 * 60_000 })
  await context.close()
  const context2 = await browser.newContext({ viewport: { width: 1440, height: 900 }, baseURL: "http://127.0.0.1:4173" })
  await context2.addInitScript((text) => { if (!sessionStorage.getItem("seeded")) { localStorage.setItem("spareChange.save.v1", text); sessionStorage.setItem("seeded", "1") } }, JSON.stringify(data))
  const page2 = await context2.newPage()
  await page2.goto("/couch")
  await page2.waitForTimeout(3500)
  await page2.screenshot({ path: `${OUT}/midgame.png` })
  await page2.getByRole("button", { name: /^Car$/ }).click().catch(() => {})
  await page2.waitForTimeout(2500)
  await page2.screenshot({ path: `${OUT}/car.png` })
  await page2.getByRole("button", { name: /moving day/i }).first().click().catch(() => {})
  await page2.waitForTimeout(600)
  await page2.screenshot({ path: `${OUT}/moving.png` })
  await page2.setViewportSize({ width: 390, height: 844 })
  await page2.keyboard.press("Escape")
  await page2.waitForTimeout(400)
  await page2.screenshot({ path: `${OUT}/mobile.png`, fullPage: true })
})
