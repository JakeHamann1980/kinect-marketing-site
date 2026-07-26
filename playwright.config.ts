import { defineConfig, devices } from "@playwright/test";

/**
 * Task 22 (Playwright Suite). Runs against a production build (`next build`
 * + `next start`), not `next dev`: several specs exercise Host-header
 * routing (src/proxy.ts), robots.txt/sitemap.xml host-awareness, and the
 * opengraph-image file-convention routes, all of which are more faithfully
 * represented by the production server than the dev server's own request
 * handling. `next dev` would also work for the DOM-interaction specs
 * (nav/interactions/waitlist/consent) but "start" is the single choice that
 * is correct for every spec in this suite, so it's used everywhere rather
 * than splitting the config.
 *
 * Port 3200 (not 3000): a preview dev server may already be running on 3000
 * per this task's own brief; `reuseExistingServer: false` additionally
 * guarantees this suite always boots its own fresh server rather than ever
 * attaching to whatever happens to already be listening on 3200.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3200",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run build && npm run start -- -p 3200",
    url: "http://localhost:3200",
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
