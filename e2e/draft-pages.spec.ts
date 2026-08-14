import { test, expect } from "@playwright/test";

/**
 * Draft pages gate (user-directed 2026-08-03): "Docs" and the footer's
 * "Platform" column are built out for local testing but must NOT reach the
 * live site until approved.
 *
 * This suite runs with `NEXT_PUBLIC_ENABLE_DRAFT_PAGES` blanked (see
 * playwright.config.ts) so it asserts the PRODUCTION state -- the one that
 * actually matters. The enabled state is covered by the pure-filter unit
 * tests in src/lib/draft-pages.test.ts and exercised by hand on localhost.
 */

test("the Docs nav item is absent from every nav surface", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation");
  await expect(nav.getByRole("link", { name: "Docs" })).toHaveCount(0);
  // The links that DO ship are untouched.
  await expect(nav.getByRole("link", { name: "Pricing" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Product" })).toBeVisible();
});

test("the footer drops the Platform column and its Docs link", async ({ page }) => {
  await page.goto("/");
  const footer = page.getByRole("contentinfo");
  await expect(footer.getByText("Platform", { exact: true })).toHaveCount(0);
  await expect(footer.getByRole("link", { name: "Client portal" })).toHaveCount(0);
  await expect(footer.getByRole("link", { name: "Docs" })).toHaveCount(0);
  // Sibling columns still render.
  await expect(footer.getByText("Resources", { exact: true })).toBeVisible();
  await expect(footer.getByRole("link", { name: "Onboarding guide" })).toBeVisible();
});

test("/docs and /platform 404 rather than sitting there unlinked", async ({
  request,
}) => {
  // Unlinked-but-reachable is still public and still crawlable, so the
  // routes themselves have to refuse, not just the links to them.
  for (const path of ["/docs", "/platform"]) {
    const res = await request.get(path, { maxRedirects: 0 });
    expect(res.status(), `${path} should 404 on the live build`).toBe(404);
  }
});

test("neither draft route appears in the sitemap", async ({ request }) => {
  const body = await (await request.get("/sitemap.xml")).text();
  expect(body).not.toContain("/docs");
  expect(body).not.toContain("/platform");
  // Sanity check that the sitemap is actually populated.
  expect(body).toContain("/pricing");
});
