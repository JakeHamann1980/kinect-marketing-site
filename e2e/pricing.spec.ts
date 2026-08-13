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
    ["Starter", "$149"],
    ["Growth", "$399"],
    ["Scale", "$799"],
  ]) {
    await expect(page.getByText(name).first()).toBeVisible();
    await expect(page.getByText(price).first()).toBeVisible();
  }

  // Comparison matrix: group headings + a value cell.
  await expect(page.getByRole("table")).toBeVisible();
  await expect(page.getByText("Clients & Team")).toBeVisible();
  await expect(page.getByRole("cell", { name: "Up to 5", exact: true })).toBeVisible();

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
  expect(body).toContain("The price is the price.");
  // Canonical always points at the apex variant, same policy as /legal/*.
  expect(body).toContain('<link rel="canonical" href="https://kinectnow.com/pricing"');
});
