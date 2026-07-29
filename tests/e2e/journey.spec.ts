import type { Page } from "@playwright/test"
import { expect, test } from "@playwright/test"

const CORRECT_ANSWERS = [
  "OP Stack 기반 Ethereum Layer 2",
  "약 1초",
  "신뢰할 수 있는 발급자가 확인한 KYC 완료 여부",
  "검증된 지갑만 보상을 받도록 제한하기 위해",
  "ETH",
]

function monitorBrowserErrors(page: Page) {
  const errors: string[] = []
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text())
  })
  page.on("pageerror", (error) => errors.push(error.message))
  return errors
}

test("a learner finishes the no-wallet demo journey", async ({ page }) => {
  const browserErrors = monitorBrowserErrors(page)
  await page.goto("/")
  await expect(page.getByRole("heading", { name: /에어드랍을.*학습 인프라로/ })).toBeVisible()
  await expect(page.getByRole("link", { name: "바로 체험하기" })).toBeVisible()
  await page.getByRole("link", { name: /3분 체험 시작/ }).click()

  for (let index = 0; index < 3; index += 1) {
    await page.getByRole("button", { name: "읽었어요" }).first().click()
  }
  await page.getByRole("link", { name: /퀴즈 시작/ }).click()

  for (const [index, answer] of CORRECT_ANSWERS.entries()) {
    await page.getByRole("radio", { name: answer }).check()
    const buttonName = index === CORRECT_ANSWERS.length - 1 ? /결과 확인/ : /다음/
    await page.getByRole("button", { name: buttonName }).click()
  }

  await expect(page).toHaveURL(/\/claim\/giwa-basics/)
  await expect(page.getByText("QUIZ PASSED")).toBeVisible()
  await page.getByRole("button", { name: "데모 지갑으로 체험" }).click()
  await expect(page.getByText("DEMO VERIFIED")).toBeVisible()
  await page.getByRole("button", { name: "10 gLEARN 데모 청구" }).click()
  await expect(page.getByText("10 gLEARN 청구 완료")).toBeVisible()
  await expect(page.getByText("DEMO TRANSACTION")).toBeVisible()
  expect(browserErrors).toEqual([])
})

test("the GIWA operator can pause and resume the campaign", async ({ page }) => {
  const browserErrors = monitorBrowserErrors(page)
  await page.goto("/operator")
  await expect(page.getByRole("heading", { name: /한 번 승인하고/ })).toBeVisible()
  await expect(page.getByText("GASOK PROTOTYPE · SAMPLE DATA", { exact: true })).toBeVisible()
  await expect(page.getByText("지금 할 일 없음", { exact: true })).toBeVisible()
  await page.getByRole("button", { name: "긴급 중지" }).click()
  await expect(page.getByText("캠페인 중지됨", { exact: true })).toBeVisible()
  await page.getByRole("button", { name: "캠페인 재개" }).click()
  await expect(page.getByText("지금 할 일 없음", { exact: true })).toBeVisible()
  expect(browserErrors).toEqual([])
})
