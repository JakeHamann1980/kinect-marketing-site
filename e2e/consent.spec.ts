import { test, expect, type Page } from "@playwright/test";

/**
 * Task 22 (Playwright Suite). Regression suite for the consent banner
 * (src/components/ConsentBanner.tsx) and its gate on PostHog
 * (src/components/PostHogProvider.tsx): no PostHog request should ever
 * leave the browser before (or after declining) a choice, and the banner's
 * reopen affordance in the footer must work. Each test gets Playwright's
 * normal per-test fresh browser context, so localStorage starts empty every
 * time -- no explicit reset needed.
 *
 * NEXT_PUBLIC_POSTHOG_KEY is unset in this environment (see .env.example),
 * so PostHogProvider never calls posthog.init even on Accept -- the
 * "Accept still produces zero /ph requests" assertions below are exercising
 * that real, disclosed graceful-no-op path, not a mock.
 */

function trackPhRequests(page: Page): string[] {
  const urls: string[] = [];
  page.on("request", (req) => {
    if (req.url().includes("/ph/")) urls.push(req.url());
  });
  return urls;
}

test("fresh visit: banner is visible and zero PostHog requests fire before any choice", async ({
  page,
}) => {
  const phRequests = trackPhRequests(page);
  await page.goto("/");

  await expect(page.getByText(/We use cookies to understand how KINECT is used/)).toBeVisible();

  // A few instrumented interactions elsewhere on the page -- none of them
  // should be able to trigger a PostHog call while consent is unresolved.
  await page.getByRole("button", { name: "Is this just another client portal?" }).click();
  await page.getByRole("button", { name: "Solutions" }).hover();

  expect(phRequests).toEqual([]);
});

test("Decline hides the banner, persists denied, and still sends zero PostHog requests", async ({
  page,
}) => {
  const phRequests = trackPhRequests(page);
  await page.goto("/");

  await page.getByRole("button", { name: "Decline" }).click();
  await expect(page.getByText(/We use cookies to understand how KINECT is used/)).toHaveCount(0);

  const stored = await page.evaluate(() => window.localStorage.getItem("kx-consent"));
  expect(stored).toBe("denied");

  await page.getByRole("button", { name: "Is this just another client portal?" }).click();
  expect(phRequests).toEqual([]);
});

test("Footer 'Cookie Preferences' reopens the banner after a choice was made", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Decline" }).click();
  await expect(page.getByText(/We use cookies to understand how KINECT is used/)).toHaveCount(0);

  await page.getByRole("button", { name: "Cookie Preferences" }).click();
  await expect(page.getByText(/We use cookies to understand how KINECT is used/)).toBeVisible();
});

test("Accept does not crash and still sends zero PostHog requests (no project key configured)", async ({
  page,
}) => {
  const phRequests = trackPhRequests(page);
  await page.goto("/");

  await page.getByRole("button", { name: "Accept" }).click();
  await expect(page.getByText(/We use cookies to understand how KINECT is used/)).toHaveCount(0);

  // Page is still alive and interactive post-accept.
  await expect(page.getByRole("button", { name: "Solutions" })).toBeVisible();

  expect(phRequests).toEqual([]);
});
