import { defineConfig, devices } from "@playwright/test"

const deployedBaseUrl = process.env["PLAYWRIGHT_BASE_URL"]
const localBaseUrl = "http://127.0.0.1:3010"

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: true,
  retries: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: deployedBaseUrl ?? localBaseUrl,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chromium", use: { ...devices["Pixel 5"] } },
  ],
  webServer: deployedBaseUrl
    ? undefined
    : {
        command: "NEXT_PUBLIC_DISABLE_REACT_DEVTOOLS=1 pnpm start --port 3010 --hostname 127.0.0.1",
        url: localBaseUrl,
        reuseExistingServer: true,
      },
})
