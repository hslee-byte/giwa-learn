import { mkdir, rename } from "node:fs/promises"
import { chromium } from "@playwright/test"

const baseUrl = "https://giwa-learn-gasok.vercel.app"
const outputDir = "/tmp/giwa-learn-demo-recording"
const outputPath = `${outputDir}/giwa-learn-gasok-demo.webm`

await mkdir(outputDir, { recursive: true })

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  deviceScaleFactor: 1,
  recordVideo: {
    dir: outputDir,
    size: { width: 1280, height: 720 },
  },
})
const page = await context.newPage()
const video = page.video()

async function pause(milliseconds) {
  await page.waitForTimeout(milliseconds)
}

async function clickVisible(locator) {
  await locator.waitFor({ state: "visible" })
  await locator.hover()
  await pause(350)
  await locator.click()
}

await page.goto(baseUrl, { waitUntil: "networkidle" })
await page.evaluate(() => sessionStorage.clear())
await page.reload({ waitUntil: "networkidle" })
await pause(9_000)

await clickVisible(page.getByRole("link", { name: "바로 체험하기", exact: true }))
await pause(1_000)

for (let cardIndex = 0; cardIndex < 3; cardIndex += 1) {
  await pause(4_800)
  await clickVisible(page.getByRole("button", { name: "읽었어요" }).first())
}

await pause(1_000)
await clickVisible(page.getByRole("link", { name: /퀴즈 시작/ }))
await pause(1_500)

const answers = [
  "OP Stack 기반 Ethereum Layer 2",
  "약 1초",
  "신뢰할 수 있는 발급자가 확인한 KYC 완료 여부",
  "검증된 지갑만 보상을 받도록 제한하기 위해",
  "ETH",
]

for (const [answerIndex, answer] of answers.entries()) {
  await pause(2_200)
  await clickVisible(page.getByLabel(answer))
  await pause(500)
  await clickVisible(
    page.getByRole("button", {
      name: answerIndex === answers.length - 1 ? /결과 확인/ : /다음/,
    }),
  )
}

await page.getByText("QUIZ PASSED").waitFor({ state: "visible" })
await pause(4_500)

await clickVisible(page.getByRole("button", { name: "데모 지갑으로 체험" }))
await pause(4_500)
await clickVisible(page.getByRole("button", { name: /10 gLEARN 데모 청구/ }))
await page
  .getByText(/청구 완료|학습 완료/)
  .first()
  .waitFor({ state: "visible" })
await pause(12_000)

await page.goto(`${baseUrl}/operator`, { waitUntil: "networkidle" })
await page.getByText(/GASOK PROTOTYPE · SAMPLE DATA/).waitFor({ state: "visible" })
await pause(6_500)

await clickVisible(page.getByRole("button", { name: "긴급 중지" }))
await page.getByText("캠페인 중지됨").waitFor({ state: "visible" })
await pause(2_000)
await clickVisible(page.getByRole("button", { name: "캠페인 재개" }))
await page.getByText("지금 할 일 없음").waitFor({ state: "visible" })
await pause(2_000)

await page.close()
await context.close()
await browser.close()

const recordedPath = await video.path()
await rename(recordedPath, outputPath)
console.log(outputPath)
