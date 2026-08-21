import { test, expect } from "@playwright/test";

/**
 * Dedicated /pricing page (user-directed 2026-08-03; structure modeled on
 * momentifyapp.com/pricing). Covers the page itself plus the three link
 * surfaces that now route to it: the nav's "Pricing" item, the footer's
 * "Compare plans" link, and the teaser pricing sections' "See everything
 * in every plan" link.
 */

test("/pricing renders the hero, tier cards, comparison matrix and FAQ", async ({
  page,
}) => {
  await page.goto("/pricing");

  await expect(
    page.getByRole("heading", { level: 1, name: "The price is the price." }),
  ).toBeVisible();

  // Tier cards come from the same shared settings.pricing table the home
  // section renders -- all three names and prices present.
  for (const [name, price] of [
    ["Kinect", "$149"],
    ["Kinect Plus", "$399"],
    ["Kinect Pro", "$799"],
  ]) {
    await expect(page.getByText(name).first()).toBeVisible();
    await expect(page.getByText(price).first()).toBeVisible();
  }

  // Detailed card rendering (taglines + fuller feature lists) is exclusive
  // to this page -- the home/persona teasers keep the compact lists.
  await expect(
    page.getByText("For rosters that need the numbers, and the story behind them."),
  ).toBeVisible();
  await expect(page.getByText("Everything in Kinect", { exact: true })).toBeVisible();

  // Comparison matrix: group headings + a value cell. Scoped to the table
  // because the same data also renders as per-tier cards for phones
  // (display:none at this viewport, but still matched by a bare getByText).
  const matrix = page.getByRole("table");
  await expect(matrix).toBeVisible();
  await expect(matrix.getByText("Clients & Team")).toBeVisible();
  await expect(
    matrix.getByRole("cell", { name: "Unlimited", exact: true }).first(),
  ).toBeVisible();

  // Pricing FAQ present and interactive.
  const faqButton = page.getByRole("button", { name: "How is KINECT priced?" });
  await expect(faqButton).toBeVisible();
  await faqButton.click();
  await expect(page.getByText("Flat monthly by plan.")).toBeVisible();
});

test("nav Pricing routes to /pricing from the home page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("navigation").getByRole("link", { name: "Pricing" }).click();
  await expect(page).toHaveURL("http://localhost:3200/pricing");
});

test("the home pricing teaser links to the full pricing page", async ({ page }) => {
  await page.goto("/");
  const compare = page.getByRole("link", { name: /See everything in every plan/ });
  await expect(compare).toHaveAttribute("href", "/pricing");
});

test("footer Compare plans links to /pricing", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("contentinfo").getByRole("link", { name: "Compare plans" }),
  ).toHaveAttribute("href", "/pricing");
});

test("/pricing serves in place on a persona subdomain host (no redirect)", async ({
  request,
}) => {
  const res = await request.get("/pricing", {
    headers: { Host: "coach.localhost:3200" },
    maxRedirects: 0,
  });
  expect(res.status()).toBe(200);
  const body = await res.text();
  // The hero headline is split across gradient spans in raw HTML, so this
  // asserts the (unsplit) comparison title instead.
  expect(body).toContain("Everything In Every Plan");
  // Canonical always points at the apex variant, same policy as /legal/*.
  expect(body).toContain('<link rel="canonical" href="https://kinectnow.com/pricing"');
});

test("/pricing never scrolls the page sideways on a phone viewport", async ({
  page,
}) => {
  // Regression guard (2026-08-03): the comparison table shipped with
  // `min-width: 640px`, which made the whole document pan 158px sideways at
  // 390px wide and pushed iPhone into laying the page out at 548px and
  // zooming the type down. `overflow-x: auto` on the table's wrapper did
  // NOT contain it. The table now shrinks to fit instead.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/pricing");
  const overflows = await page.evaluate(() => {
    const de = document.documentElement;
    return { scrollWidth: de.scrollWidth, clientWidth: de.clientWidth };
  });
  expect(overflows.scrollWidth).toBe(overflows.clientWidth);
});

test("the comparison matrix swaps to per-tier cards on a phone", async ({
  page,
}) => {
  // user-directed 2026-08-03: a 4-column matrix does not survive a phone
  // (labels wrapped to three lines and the tier headers scrolled away), so
  // below kx-md the same data renders as one card per tier. Asserted in
  // both directions so neither layout can silently go missing.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/pricing");
  await expect(page.getByRole("table")).toBeHidden();

  // Each tier gets its own card carrying every group heading once.
  const proCard = page
    .getByText("Kinect Pro", { exact: true })
    .last()
    .locator("xpath=ancestor::div[contains(@class,'rounded-[14px]')][1]");
  await expect(proCard.getByText("Security & Support")).toBeVisible();
  await expect(proCard.getByText("Priority support")).toBeVisible();
  // Storage renders in the stacked layout too, not just the table.
  await expect(proCard.getByText("Files & Storage")).toBeVisible();
  await expect(proCard.getByText("2 TB")).toBeVisible();

  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(page.getByRole("table")).toBeVisible();
});

test("the comparison matrix publishes the storage tiers and add-on price", async ({
  page,
}) => {
  // user-directed 2026-08-03. These numbers are published pricing, so they
  // are asserted literally: a silent edit to any of them is a pricing change
  // and should fail the build, not ship quietly.
  await page.goto("/pricing");
  const matrix = page.getByRole("table");
  await expect(matrix.getByText("Files & Storage")).toBeVisible();

  for (const value of ["100 GB", "500 GB", "2 TB"]) {
    await expect(
      matrix.getByRole("cell", { name: value, exact: true }),
    ).toBeVisible();
  }
  // The add-on price appears once per tier column.
  await expect(
    matrix.getByRole("cell", { name: "$10 / 100 GB", exact: true }),
  ).toHaveCount(3);

  // The soft cap is a promise, not a detail: uploads must never be described
  // as stopping. See docs/STORAGE-PRICING.md.
  await expect(
    matrix.getByText("Uploads keep working past the limit"),
  ).toBeVisible();
});
