import { test, expect } from "@playwright/test";

/**
 * The /platform product overview (shipped 2026-08-30, promoted out of the
 * draft gate). Covers the page itself plus the two link surfaces that route
 * to it: the nav's "Product" item and the footer's "Platform" column, whose
 * links target this page's section anchors.
 *
 * Like e2e/pricing.spec.ts, this runs against the production build with
 * Sanity env blanked, so it exercises the local content module
 * (src/content/platform-page.ts) through the same fallback path production
 * uses before its first seed.
 */

test("/platform renders the hero and every anchored capability section", async ({
  page,
}) => {
  await page.goto("/platform");

  await expect(
    page.getByRole("heading", { level: 1, name: "The whole client relationship, one login." }),
  ).toBeVisible();

  // Every section the footer's Platform column links to must exist as a
  // real anchor target, alongside the sections added when the page was
  // rebuilt from the platform repo's feature set.
  for (const id of [
    "client-portal",
    "work-management",
    "messaging",
    "analytics",
    "ai-insights",
    "proposals-billing",
    "scheduling",
    "integrations",
    "security",
  ]) {
    await expect(page.locator(`section#${id}`)).toHaveCount(1);
  }

  await expect(
    page.getByRole("heading", { name: "A portal they actually open" }),
  ).toBeVisible();

  // The product captures: real screenshots, same assets the persona pages
  // frame. Presence + resolvable src, not pixel comparison.
  const shots = page.locator("main img[alt^='KINECT']");
  await expect(shots).toHaveCount(4);

  // Closing CTA hands off to signup like every other closing section.
  const cta = page.getByRole("link", { name: /Start free/ });
  await expect(cta).toBeVisible();
  await expect(cta).toHaveAttribute("href", /app\.kinectnow\.com/);
});

test("nav Product routes to /platform from the home page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("navigation").getByRole("link", { name: "Product" }).click();
  await expect(page).toHaveURL("http://localhost:3200/platform");
});

test("footer Platform links land on their section anchors", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("contentinfo")
    .getByRole("link", { name: "Proposals & billing" })
    .click();
  await expect(page).toHaveURL("http://localhost:3200/platform#proposals-billing");
  await expect(page.locator("section#proposals-billing")).toBeInViewport();
});
