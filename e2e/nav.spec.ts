import { test, expect, type Page, type Locator } from "@playwright/test";

/**
 * Task 22 (Playwright Suite). Regression suite for src/components/Nav.tsx +
 * src/hooks/useStuck.ts: the sticky/transparent-to-stuck transition, the
 * Solutions hover panel (including the hover-gap bridge and the
 * focus-restoration/suppress-reopen contract around Escape), and the mobile
 * hamburger sheet. These behaviors depend on real scroll/IntersectionObserver
 * events and real pointer travel through a bridging zone, neither of which
 * this environment's own automation pane can deliver -- Playwright's actual
 * Chromium is what makes this suite the definitive check.
 */

/** Presses Tab (from whatever currently has focus) until `locator` becomes
 * document.activeElement, or throws via the final assertion if it never
 * does. Used instead of `locator.focus()` so the Solutions trigger's
 * `onFocus` handler fires exactly as it would for a real keyboard user
 * tabbing through the page, not a synthetic focus() call bypassing tab
 * order entirely. */
async function tabUntilFocused(page: Page, locator: Locator, maxTries = 20) {
  for (let i = 0; i < maxTries; i++) {
    await page.keyboard.press("Tab");
    if (await locator.evaluate((el) => el === document.activeElement).catch(() => false)) {
      return;
    }
  }
  await expect(locator).toBeFocused();
}

test.describe("Nav: sticky transparent -> stuck transition", () => {
  test("at load: not stuck, transparent background, nav wrapper collapses to 0 height", async ({
    page,
  }) => {
    await page.goto("/");
    const nav = page.locator("#kx-nav");
    await expect(nav).not.toHaveClass(/kx-stuck/);

    const bg = await nav.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toBe("rgba(0, 0, 0, 0)");

    // The sticky wrapper (nav's parent) is `height: 0` so the hero canvas
    // extends up behind the transparent nav -- see Nav.tsx's own comment.
    const wrapperHeight = await nav.evaluate(
      (el) => getComputedStyle(el.parentElement as Element).height,
    );
    expect(wrapperHeight).toBe("0px");
  });

  test("after scrolling past the sentinel: stuck, opaque background, blur(14px)", async ({
    page,
  }) => {
    await page.goto("/");
    const nav = page.locator("#kx-nav");

    // Fix (final review, M1): wait for hydration before scrolling. This test
    // was flaky because `window.scrollTo` could fire before React had
    // attached the IntersectionObserver useStuck relies on (goto's
    // "load"/networkidle-ish default wait settles on the initial HTML/CSS/JS
    // response, not on React having finished hydrating and running effects)
    // -- a scroll that lands before the observer exists never gets seen, so
    // `stuck` never flips and the very next assertion below flakes. Waiting
    // for a real interactive element (the Solutions button, which only
    // renders meaningfully once its client-side handlers are attached) is a
    // cheap, real signal that hydration has completed.
    await expect(page.getByRole("button", { name: /solutions/i })).toBeVisible();

    await page.evaluate(() => window.scrollTo(0, 400));
    // Confirm the scroll itself actually landed before asserting on its
    // effect -- same flakiness class as above, just for the scroll call
    // rather than hydration.
    await page.waitForFunction(() => window.scrollY > 0);

    await expect(async () => {
      await expect(nav).toHaveClass(/kx-stuck/);
    }).toPass({ timeout: 2000 });
    // #kx-nav's background/border-color carry a .25s CSS transition; let it
    // settle before reading the computed color, or this reads a mid-fade
    // value instead of the final one.
    await expect(async () => {
      const bg = await nav.evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(bg).toBe("rgba(11, 15, 23, 0.82)");
    }).toPass({ timeout: 2000 });

    // THE regression test for the minifier bug: production Lightning CSS
    // previously collapsed the unprefixed + -webkit- backdrop-filter
    // declarations into one block and dropped the unprefixed standard
    // property. Checking the computed value against the real built CSS
    // (this suite runs against `next build` + `next start`, not dev) is
    // the only way to catch that class of regression.
    const blur = await nav.evaluate((el) => getComputedStyle(el).backdropFilter);
    expect(blur).toContain("blur(14px)");
  });

  test("scrolling back to top removes stuck", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("#kx-nav");

    await page.evaluate(() => window.scrollTo(0, 400));
    await expect(nav).toHaveClass(/kx-stuck/);

    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(nav).not.toHaveClass(/kx-stuck/);
  });
});

test.describe("Nav: Solutions dropdown", () => {
  test("hover opens the panel, and moving the pointer down through the bridge into the panel keeps it open", async ({
    page,
  }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Solutions" });
    const panel = page.locator("#kx-solutions-panel");

    await trigger.hover();
    await expect(panel).toBeVisible();

    // Regression test for the hover-gap bug: travel the pointer from the
    // trigger straight down into the panel in small steps, rather than
    // jumping directly to a point inside it, so the path actually crosses
    // the bridging padding zone between trigger and panel (Nav.tsx's own
    // comment: the outer div's padding exists exactly so this travel never
    // fires mouseleave on the hover wrapper mid-transit).
    const triggerBox = await trigger.boundingBox();
    const panelBox = await panel.boundingBox();
    if (!triggerBox || !panelBox) throw new Error("expected boxes");
    const x = triggerBox.x + triggerBox.width / 2;
    const startY = triggerBox.y + triggerBox.height / 2;
    const endY = panelBox.y + 20;
    await page.mouse.move(x, startY);
    await page.mouse.move(x, endY, { steps: 12 });

    await expect(panel).toBeVisible();

    // Click a row -> navigates to the persona's internal route.
    await page.getByRole("link", { name: /Agencies/ }).click();
    await expect(page).toHaveURL(/\/agency$/);
  });

  test("keyboard: Tab opens the panel on focus, Escape closes it and restores focus to the trigger without reopening", async ({
    page,
  }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Solutions" });
    const panel = page.locator("#kx-solutions-panel");

    await tabUntilFocused(page, trigger);
    await expect(panel).toBeVisible();

    // Tab into a row inside the panel -- focus moving within the
    // trigger+panel wrapper must not close it (only leaving the wrapper
    // entirely does, via onBlur's relatedTarget check).
    await page.keyboard.press("Tab");
    await expect(panel).toBeVisible();

    // Escape: closes the panel AND returns focus to the trigger (the
    // focus-restoration fix).
    await page.keyboard.press("Escape");
    await expect(panel).not.toBeVisible();
    await expect(trigger).toBeFocused();

    // Regression for the suppress-reopen flag: the trigger's own onFocus
    // handler would normally reopen the panel, but Escape's programmatic
    // .focus() call must not trigger that -- give it a beat and confirm it
    // stays closed.
    await page.waitForTimeout(200);
    await expect(panel).not.toBeVisible();
  });
});

test.describe("Nav: mobile sheet", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("hamburger visible, desktop links hidden; sheet opens, a persona row navigates and closes the sheet", async ({
    page,
  }) => {
    await page.goto("/");
    const burger = page.getByRole("button", { name: "Menu" });
    await expect(burger).toBeVisible();

    const desktopLinks = page.locator(".kx-nav-links");
    await expect(desktopLinks).toHaveCSS("display", "none");

    await burger.click();
    const sheet = page.locator("#kx-mobile-sheet");
    await expect(sheet).toBeVisible();

    await sheet.getByRole("link", { name: /Coaches & Trainers/ }).click();
    await expect(page).toHaveURL(/\/coach$/);

    // A fresh Nav instance mounts for the new route with mobileOpen reset
    // to its default (false) -- the sheet must not still be open on arrival.
    await expect(page.locator("#kx-mobile-sheet")).toHaveCount(0);
  });
});

test.describe("Nav: legal page forceSolid", () => {
  test("nav is stuck at load on a legal page", async ({ page }) => {
    await page.goto("/legal/privacy");
    await expect(page.locator("#kx-nav")).toHaveClass(/kx-stuck/);
  });
});
