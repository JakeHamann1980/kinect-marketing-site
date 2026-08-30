import { test, expect } from "@playwright/test";

/**
 * Draft pages gate (user-directed 2026-08-03): destinations that are built
 * but not approved are hidden on the live site. As of 2026-08-30 that is
 * just "Docs" -- /platform shipped (with the nav "Product" link and the
 * footer "Platform" column), so this suite now asserts it RENDERS while
 * /docs still 404s. The /platform page's own coverage lives in
 * e2e/platform.spec.ts.
 *
 * This suite runs with `NEXT_PUBLIC_ENABLE_DRAFT_PAGES` blanked (see
 * playwright.config.ts) so it asserts the PRODUCTION state -- the one that
 * actually matters. The enabled state is covered by the pure-filter unit
 * tests in src/lib/draft-pages.test.ts and exercised by hand on localhost.
 */

test("draft nav items are absent, and no shipped nav link points at '#'", async ({
  page,
}) => {
  await page.goto("/");
  const nav = page.getByRole("navigation");
  await expect(nav.getByRole("link", { name: "Docs" })).toHaveCount(0);
  // "Product" left the gate when /platform shipped (2026-08-30).
  await expect(nav.getByRole("link", { name: "Product" })).toHaveAttribute(
    "href",
    "/platform",
  );

  // What survives must be a real destination: no placeholder hrefs in the
  // nav.
  const hrefs = await nav.getByRole("link").evaluateAll((links) =>
    links.map((l) => l.getAttribute("href")),
  );
  expect(hrefs).not.toContain("#");
  await expect(nav.getByRole("link", { name: "Pricing" })).toBeVisible();
});

test("the footer ships no dead links", async ({ page }) => {
  await page.goto("/");
  const footer = page.getByRole("contentinfo");

  // Shipped 2026-08-30: the Platform column, pointing at /platform's
  // section anchors.
  await expect(footer.getByText("Platform", { exact: true })).toBeVisible();
  await expect(footer.getByRole("link", { name: "Client portal" })).toHaveAttribute(
    "href",
    "/platform#client-portal",
  );

  // Still gated: the all-draft Resources column (dropping the column, not
  // leaving a bare heading), the profile-less social icons, and the legal
  // entries with no document behind them.
  await expect(footer.getByText("Resources", { exact: true })).toHaveCount(0);
  await expect(footer.getByRole("link", { name: "Onboarding guide" })).toHaveCount(0);
  await expect(footer.getByRole("link", { name: "About" })).toHaveCount(0);
  await expect(footer.getByRole("link", { name: "Status" })).toHaveCount(0);
  await expect(footer.getByRole("link", { name: "DPA" })).toHaveCount(0);
  await expect(footer.getByRole("link", { name: "Accessibility" })).toHaveCount(0);
  // YouTube was swapped out for Instagram (user-directed 2026-08-03), so it
  // must no longer render even though the channel exists.
  await expect(footer.getByRole("link", { name: "YouTube" })).toHaveCount(0);

  // Kept, because each has a real destination.
  await expect(footer.getByText("Solutions", { exact: true })).toBeVisible();
  await expect(footer.getByRole("link", { name: "For agencies" })).toBeVisible();
  await expect(footer.getByRole("link", { name: "Security" }).first()).toBeVisible();
  // "Contact" was fixed rather than hidden: hello@kinectnow.com is already
  // the contact address on every legal page.
  await expect(footer.getByRole("link", { name: "Contact" })).toHaveAttribute(
    "href",
    "mailto:hello@kinectnow.com",
  );
  // Confirmed profiles ship, and every one opens externally.
  for (const [name, href] of [
    ["X", "https://x.com/KinectNow"],
    ["Facebook", "https://www.facebook.com/profile.php?id=61593554393471"],
    ["LinkedIn", "https://www.linkedin.com/company/kinectnow"],
    ["Instagram", "https://www.instagram.com/kinect.now"],
  ]) {
    const link = footer.getByRole("link", { name });
    await expect(link).toHaveAttribute("href", href);
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  }
});

test("no link anywhere on the live home page points at '#'", async ({ page }) => {
  // The rule, rather than a list of known offenders -- this is what would
  // have caught "Product" and the footer placeholders without anyone
  // spotting them by eye.
  await page.goto("/");
  const dead = await page.evaluate(() =>
    [...document.querySelectorAll("a[href='#']")].map(
      (a) => a.textContent?.trim() || a.getAttribute("aria-label") || "(unlabelled)",
    ),
  );
  expect(dead, `dead '#' links still shipping: ${dead.join(", ")}`).toEqual([]);
});

test("/docs 404s rather than sitting there unlinked", async ({ request }) => {
  // Unlinked-but-reachable is still public and still crawlable, so the
  // route itself has to refuse, not just the links to it.
  const res = await request.get("/docs", { maxRedirects: 0 });
  expect(res.status(), "/docs should 404 on the live build").toBe(404);
});

test("the sitemap lists shipped routes and no draft ones", async ({ request }) => {
  const body = await (await request.get("/sitemap.xml")).text();
  expect(body).not.toContain("/docs");
  expect(body).toContain("/platform");
  // Sanity check that the sitemap is actually populated.
  expect(body).toContain("/pricing");
});
