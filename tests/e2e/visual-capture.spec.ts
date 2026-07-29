import { test } from "@playwright/test"

const VIEWPORTS = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 900 },
]

const PAGES = [
  { name: "home", path: "/" },
  { name: "learn", path: "/learn/giwa-basics" },
  { name: "quiz", path: "/quiz/giwa-basics" },
  { name: "claim-empty", path: "/claim/giwa-basics" },
  { name: "operator", path: "/operator" },
]

const CORRECT_ANSWERS = [
  "OP Stack 기반 Ethereum Layer 2",
  "약 1초",
  "신뢰할 수 있는 발급자가 확인한 KYC 완료 여부",
  "검증된 지갑만 보상을 받도록 제한하기 위해",
  "ETH",
]

test.skip(process.env["CAPTURE_VISUALS"] !== "1", "visual capture is opt-in")

test("capture every principal page and completed state", async ({ page }) => {
  test.setTimeout(120_000)
  for (const viewport of VIEWPORTS) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.goto("/")
    await page.evaluate(() => window.sessionStorage.clear())
    for (const item of PAGES) {
      await page.goto(item.path)
      await page.screenshot({
        fullPage: true,
        path: `.omx/visual/giwa-learn/${viewport.name}-${item.name}.png`,
      })
    }

    await page.goto("/learn/giwa-basics")
    for (let index = 0; index < 3; index += 1) {
      await page.getByRole("button", { name: "읽었어요" }).first().click()
    }
    await page.getByRole("link", { name: /퀴즈 시작/ }).click()
    for (const [index, answer] of CORRECT_ANSWERS.entries()) {
      await page.getByRole("radio", { name: answer }).check()
      const buttonName = index === CORRECT_ANSWERS.length - 1 ? /결과 확인/ : /다음/
      await page.getByRole("button", { name: buttonName }).click()
    }
    await page.getByRole("button", { name: "데모 지갑으로 체험" }).click()
    await page.getByRole("button", { name: "10 gLEARN 데모 청구" }).click()
    await page.evaluate(() => {
      window.scrollTo(0, 0)
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
      }
    })
    const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight)
    await page.setViewportSize({ width: viewport.width, height: pageHeight })
    await page.screenshot({
      fullPage: false,
      path: `.omx/visual/giwa-learn/${viewport.name}-claim-complete.png`,
    })
  }
})
