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
    // A local e2e run must never write to the real waitlist DB or send real
    // email (2026-07-27: a run with a populated .env.local inserted the
    // waitlist spec's jake@example.com into the production table). Empty
    // strings count as "defined" to @next/env, so .env.local can't backfill
    // them, and src/app/actions/waitlist.ts treats "" as unset -- restoring
    // the deterministic no-creds "warming up" path the waitlist spec asserts.
    env: {
      SUPABASE_URL: "",
      SUPABASE_SERVICE_ROLE_KEY: "",
      RESEND_API_KEY: "",
      // Hermetic content too (2026-08-03): with Sanity env present, pages
      // render whatever the production dataset currently holds, so any spec
      // asserting copy/links added in the same commit fails until a reseed
      // -- and reseeding before deploy would point live content at routes
      // that don't exist yet. Blanking these forces every e2e render down
      // the local-content fallback path (src/content/* is the source of
      // truth the seed script pushes anyway), so e2e always tests the
      // checked-out code, not the CMS's current state.
      NEXT_PUBLIC_SANITY_PROJECT_ID: "",
      NEXT_PUBLIC_SANITY_DATASET: "",
      // Drafts OFF so e2e matches PRODUCTION, not a dev machine: the
      // suite's job here is proving /docs stays 404 and its links stay
      // hidden (and, since /platform shipped 2026-08-30, that /platform
      // renders). `.env.local` sets this to "1" for local dev, and next
      // build would otherwise pick that up.
      NEXT_PUBLIC_ENABLE_DRAFT_PAGES: "",
    },
  },
});
