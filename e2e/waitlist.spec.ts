import { test, expect, type Page } from "@playwright/test";

/**
 * Task 22 (Playwright Suite). Regression suite for the waitlist dialog
 * (src/components/WaitlistDialog.tsx), its shared validation
 * (src/lib/waitlist-validation.ts) and the server action
 * (src/app/actions/waitlist.ts). No Supabase/Resend credentials are
 * configured in this environment (see .env.example), so the "valid email"
 * path below exercises the real, disclosed "unavailable" error branch of
 * the server action rather than a mocked success -- that is the actual,
 * currently-shipped behavior of a production build with no env creds, not a
 * simulation of it.
 */

/**
 * Opens the dialog from the hero's SECONDARY CTA. It used to open from the
 * nav's "Start free", but as of 2026-08-03 every primary CTA hands off to
 * app signup instead (the waitlist is closed). "View demo" is one of the
 * remaining openers, because no demo asset exists for it to link to yet.
 */
async function openDialog(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "View demo" }).first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
}

test("a waitlist opener focuses the email input, and Escape closes it and restores focus", async ({
  page,
}) => {
  await page.goto("/");
  const opener = page.getByRole("button", { name: "View demo" }).first();
  await opener.click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const emailInput = page.getByLabel("Email");
  await expect(emailInput).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();
});

test("pricing tier CTAs hand off to app signup carrying the plan", async ({
  page,
}) => {
  // user-directed 2026-08-03: these used to open the waitlist dialog. They
  // now link to the app's signup with the plan preselected -- NOT to a Stripe
  // payment link, which would arrive with no workspace_id for the webhook to
  // attribute (see src/lib/checkout.ts).
  await page.goto("/");
  const pricing = page.locator("section").filter({ hasText: "Priced like a tool, not a tax" });

  for (const [label, planKey] of [
    ["Choose Kinect", "starter"],
    ["Start free", "growth"],
    ["Choose Kinect Pro", "scale"],
  ]) {
    await expect(
      pricing.getByRole("link", { name: label, exact: true }),
    ).toHaveAttribute("href", `https://app.kinectnow.com/signup?plan=${planKey}`);
  }
});

test("an invalid-but-HTML5-valid email is rejected instantly, client-side, with no network request", async ({
  page,
}) => {
  await openDialog(page);

  const posted: string[] = [];
  page.on("request", (req) => {
    if (req.method() === "POST") posted.push(req.url());
  });

  await page.getByLabel("Email").fill("jake@localhost");
  await page.getByRole("button", { name: "Join the waitlist" }).click();

  // Scoped to the dialog's own error <p role="alert">, not Next's
  // route-announcer div (also role="alert", always present in the DOM).
  await expect(page.getByRole("dialog").getByRole("alert")).toHaveText(
    "Enter a valid email address and try again.",
  );
  expect(posted).toEqual([]);
});

test("a valid email submitted after the human-delay window hits the real server action (no creds -> warming-up error)", async ({
  page,
}) => {
  await openDialog(page);

  await page.getByLabel("Email").fill("jake@example.com");
  // MIN_HUMAN_DELAY_MS is 2000ms, measured from the moment the dialog opened.
  await page.waitForTimeout(2100);
  await page.getByRole("button", { name: "Join the waitlist" }).click();

  await expect(page.getByRole("dialog").getByRole("alert")).toHaveText(
    "The waitlist is warming up. Try again shortly.",
    { timeout: 10_000 },
  );
});

test("honeypot: a filled hidden company field still shows a fake success", async ({ page }) => {
  await openDialog(page);

  await page.getByLabel("Email").fill("jake+honeypot@example.com");
  // Real visitors never see or focus this field; a bot filling every input
  // it finds is what this simulates, so it's set directly rather than via
  // a user-facing interaction.
  await page.locator('input[name="company"]').evaluate((el) => {
    (el as HTMLInputElement).value = "Bot Co";
  });
  await page.getByRole("button", { name: "Join the waitlist" }).click();

  // Anti-bot contract: rejected server-side, but the client is told it
  // succeeded (no signal to the bot that anything was detected).
  await expect(page.getByText("You are on the list.", { exact: true })).toBeVisible({
    timeout: 10_000,
  });
});

test("nav Start free links to app signup, not the waitlist", async ({ page }) => {
  // The waitlist closed 2026-08-03; every primary CTA hands off to the app.
  await page.goto("/");
  await expect(
    page.locator("#kx-nav").getByRole("link", { name: "Start free" }),
  ).toHaveAttribute("href", "https://app.kinectnow.com/signup");
  await expect(
    page.locator("#kx-nav").getByRole("button", { name: "Start free" }),
  ).toHaveCount(0);
});
