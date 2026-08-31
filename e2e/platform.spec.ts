import { test, expect } from "@playwright/test";

/**
 * The /platform product overview (shipped 2026-08-30, promoted out of the
 * draft gate). Covers the page itself plus the two link surfaces that route
 * to it: the nav's "Platform" item and the footer's "Platform" column, whose
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

  // Layout rework (2026-08-30 second pass): the hero jump nav links every
  // section anchor, the trust chips render under the CTAs, and the
  // consolidation band carries the gradient figure.
  await expect(
    page.getByRole("navigation", { name: "Platform capabilities" }).getByRole("link"),
  ).toHaveCount(9);
  await expect(page.getByText("Unlimited clients on every plan")).toBeVisible();
  await expect(page.getByText("Six tools")).toBeVisible();

  // The Kai panel mock: the widget's headline and its cited-tools line.
  // (Playwright treats animated opacity-0 elements as visible, so the CSS
  // interaction loop does not make these assertions timing-dependent.)
  await expect(page.getByText("What do you need to know?")).toBeVisible();
  await expect(page.getByText(/from get_overdue_by_client/)).toBeVisible();

  // Hero and closing each carry the signup CTA (scoped to main: the nav has
  // its own "Start free"), both handing off to app signup.
  const ctas = page.locator("main").getByRole("link", { name: /Start free/ });
  await expect(ctas).toHaveCount(2);
  for (const cta of await ctas.all()) {
    await expect(cta).toHaveAttribute("href", /app\.kinectnow\.com/);
  }
});

test("nav Platform routes to /platform from the home page", async ({ page }) => {
  await page.goto("/");
  // Scoped to the nav: the footer column heading also says "Platform".
  await page.getByRole("navigation").getByRole("link", { name: "Platform" }).click();
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
