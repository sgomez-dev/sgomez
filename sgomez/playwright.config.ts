import { defineConfig, devices } from "@playwright/test";

/**
 * El puerto es configurable (E2E_PORT, por defecto 3000) porque en una máquina
 * de desarrollo es fácil que 3000 ya esté ocupado por otro servidor. Con
 * `reuseExistingServer` un servidor ajeno en ese puerto se usaría sin avisar,
 * así que en local conviene fijar un puerto libre.
 */
const PORT = Number(process.env.E2E_PORT ?? 3000);
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
  },
  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 300_000,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
    {
      name: "mobile",
      use: { ...devices["Desktop Chrome"], viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true },
    },
    { name: "small", use: { ...devices["Desktop Chrome"], viewport: { width: 320, height: 640 } } },
    { name: "tablet", use: { ...devices["Desktop Chrome"], viewport: { width: 768, height: 1024 } } },
    {
      name: "landscape",
      use: { ...devices["Desktop Chrome"], viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true },
    },
  ],
});
