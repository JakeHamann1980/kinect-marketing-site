import { test, expect } from "@playwright/test";

/**
 * The waitlist is CLOSED (user-directed 2026-08-03). Every CTA now either
 * hands off to app signup or opens the demo link, so the dialog has no
 * opener anywhere and its interaction tests were deleted rather than kept
 * limping -- a test that has to manufacture its own entry point is not
 * testing the product.
 *
 * The server action itself is untouched and still reachable in code; its
 * logic keeps unit coverage in src/lib/waitlist-validation.test.ts (the
 * honeypot, the timing gate, email shape) and src/lib/rate-limit.test.ts
 * (the per-IP window). What is gone is only the UI path.
 *
 * What this file guards now is the handoff: every conversion button points
 * somewhere real, and none of them reopens the dialog by accident.
 */

test("no CTA anywhere reopens the waitlist dialog", async ({ page }) => {
  for (const path of ["/", "/agency", "/pricing"]) {
    await page.goto(path);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    // The dialog opened from buttons; every conversion CTA is a link now.
    await expect(
      page.getByRole("button", { name: /Start free|Schedule Demo|Choose Kinect/ }),
    ).toHaveCount(0);
  }
});

test("pricing tier CTAs hand off to app signup carrying the plan", async ({
  page,
}) => {
  // NOT Stripe payment links: one would arrive with no workspace_id for the
  // platform webhook to attribute (see src/lib/checkout.ts).
  await page.goto("/");
  const pricing = page.locator("section").filter({ hasText: "Priced like a tool, not a tax" });

  for (const [label, planKey] of [
    ["Choose Kinect", "starter"],
    ["Start free", "growth"],
    ["Choose Kinect Pro", "scale"],
    ["Choose Kinect Enterprise", "enterprise"],
  ]) {
    await expect(
      pricing.getByRole("link", { name: label, exact: true }),
    ).toHaveAttribute("href", `https://app.kinectnow.com/signup?plan=${planKey}`);
  }
});

test("nav Start free links to app signup", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.locator("#kx-nav").getByRole("link", { name: "Start free" }),
  ).toHaveAttribute("href", "https://app.kinectnow.com/signup");
});

test("Schedule Demo points at the Sanity-managed demo URL", async ({ page }) => {
  // Editable in the Studio precisely because it is a placeholder today: it
  // points at the marketing home page until a real scheduling link exists.
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: "Schedule Demo" }).first(),
  ).toHaveAttribute("href", "https://kinectnow.com/");
});
