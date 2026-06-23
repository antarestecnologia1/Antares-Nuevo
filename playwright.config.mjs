/** @type {import('@playwright/test').PlaywrightTestConfig} */
export default {
  testDir: "qa",
  testMatch: "**/*.spec.mjs",
  fullyParallel: false,
  workers: 1,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: process.env.PORTAL_BASE_URL || "http://127.0.0.1:4173/",
    headless: true,
    trace: "on-first-retry"
  },
  webServer: {
    command: "node scripts/portal-static-server.mjs",
    url: "http://127.0.0.1:4173/",
    // No reutilizar servidores ajenos (p. ej. `python -m http.server` sirve .js como text/plain).
    reuseExistingServer: false,
    timeout: 60_000
  },
  reporter: [["list"]]
};
