import { test, expect, type Locator } from "@playwright/test";

/**
 * Task 22 (Playwright Suite). Regression suite for the FAQ accordion
 * (src/components/Faq.tsx), the showcase cycler
 * (src/components/ShowcaseCycler.tsx + its globals.css keyframes), the
 * pricing headline's single-line contract, and prefers-reduced-motion.
 * The cycler's computed animation-play-state/opacity/background and the
 * indicator's computed rotate() are exactly the class of assertion this
 * environment's own automation pane could not verify by hand -- Playwright's
 * real Chromium computes them for real.
 */

/** Parses the degrees out of a computed CSS `rotate` property value (e.g.
 * "45deg" -> 45, "none" -> 0). Tailwind v4 compiles `rotate-45` to the
 * standalone CSS `rotate` property (confirmed against this build's own
 * compiled output, `.rotate-45{rotate:45deg}`), not a `transform:
 * rotate(...)` composite the way Tailwind v3 did -- `getComputedStyle(el)
 * .transform` stays "none" for this element regardless of pin state, so it
 * is not the property to assert against here. */
function rotationDegrees(rotate: string): number {
  if (rotate === "none") return 0;
  const match = /(-?\d+(?:\.\d+)?)deg/.exec(rotate);
  if (!match) throw new Error(`unexpected rotate value: ${rotate}`);
  return Math.round(parseFloat(match[1]));
}

test.describe("FAQ accordion", () => {
  const q1 = "Is this just another client portal?";
  const q2 = "Do I need to migrate everything?";

  test("all questions collapsed initially", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: q1 })).toBeVisible();
    await expect(page.getByText("table stakes")).toHaveCount(0);
  });

  test("opening Q1 shows its answer; opening Q2 closes Q1", async ({ page }) => {
    await page.goto("/");
    const btn1 = page.getByRole("button", { name: q1 });
    const btn2 = page.getByRole("button", { name: q2 });

    await btn1.click();
    await expect(page.getByText("table stakes")).toBeVisible();
    await expect(btn1).toHaveAttribute("aria-expanded", "true");

    await btn2.click();
    await expect(page.getByText("table stakes")).toHaveCount(0);
    await expect(btn1).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByText("Connect the accounts")).toBeVisible();
    await expect(btn2).toHaveAttribute("aria-expanded", "true");
  });

  test("clicking an open question closes it", async ({ page }) => {
    await page.goto("/");
    const btn1 = page.getByRole("button", { name: q1 });
    await btn1.click();
    await expect(page.getByText("table stakes")).toBeVisible();
    await btn1.click();
    await expect(page.getByText("table stakes")).toHaveCount(0);
    await expect(btn1).toHaveAttribute("aria-expanded", "false");
  });

  test("the indicator rotates 45deg when open (computed rotate)", async ({ page }) => {
    await page.goto("/");
    const btn1 = page.getByRole("button", { name: q1 });
    const indicator = btn1.locator("span[aria-hidden='true']");

    const closedRotate = await indicator.evaluate((el) => getComputedStyle(el).rotate);
    expect(rotationDegrees(closedRotate)).toBe(0);

    await btn1.click();
    // The indicator carries a 200ms transition on the `rotate` property;
    // let it settle before reading the computed value, or this reads a
    // mid-rotation value instead of the resting 45deg.
    await expect(async () => {
      const openRotate = await indicator.evaluate((el) => getComputedStyle(el).rotate);
      expect(rotationDegrees(openRotate)).toBe(45);
    }).toPass({ timeout: 2000 });
  });
});

test.describe("Showcase cycler", () => {
  async function layers(page: import("@playwright/test").Page): Promise<Locator> {
    return page.locator("img.kx-cyc");
  }

  test("three layers carry 0 / -5s / -10s animation delays", async ({ page }) => {
    await page.goto("/");
    const layerLocator = await layers(page);
    await expect(layerLocator).toHaveCount(3);

    const delays = await layerLocator.evaluateAll((els) =>
      els.map((el) => getComputedStyle(el).animationDelay),
    );
    expect(delays).toEqual(["0s", "-5s", "-10s"]);
  });

  test("clicking a label pins that layer: paused animation, forced opacity, aria-pressed, pinned background", async ({
    page,
  }) => {
    await page.goto("/");
    const layerLocator = await layers(page);
    const label2 = page.locator("button.kx-lab-2");

    await label2.click();
    await expect(label2).toHaveAttribute("aria-pressed", "true");

    const playStates = await layerLocator.evaluateAll((els) =>
      els.map((el) => getComputedStyle(el).animationPlayState),
    );
    expect(playStates).toEqual(["paused", "paused", "paused"]);

    const opacities = await layerLocator.evaluateAll((els) =>
      els.map((el) => getComputedStyle(el).opacity),
    );
    expect(opacities).toEqual(["0", "1", "0"]);

    // Regression test for the transition/!important bug: the pinned
    // label's background must actually reach rgba(255,255,255,.08), not
    // get stuck at its pre-pin transparent value.
    const bg = await label2.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toBe("rgba(255, 255, 255, 0.08)");

    // Clicking the already-pinned label resumes auto-cycling.
    await label2.click();
    await expect(label2).toHaveAttribute("aria-pressed", "false");
    const resumedStates = await layerLocator.evaluateAll((els) =>
      els.map((el) => getComputedStyle(el).animationPlayState),
    );
    expect(resumedStates).toEqual(["running", "running", "running"]);
  });
});

test.describe("Pricing headline", () => {
  test("renders on a single line at 1280px", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    const headline = page.getByRole("heading", { name: "Priced like a tool, not a tax" });
    await headline.scrollIntoViewIfNeeded();

    const box = await headline.boundingBox();
    const lineHeight = await headline.evaluate((el) => parseFloat(getComputedStyle(el).lineHeight));
    if (!box) throw new Error("expected a bounding box");
    // A wrapped headline would be roughly 2x (or more) the single-line
    // height; allow a couple pixels of rendering slop either side of one
    // line.
    expect(box.height).toBeLessThan(lineHeight * 1.4);
  });
});

test.describe("prefers-reduced-motion", () => {
  test("orb/trace/cycler animations are disabled, but label pinning still works", async ({
    page,
  }) => {
    // `page.emulateMedia` (rather than the `reducedMotion` context/test.use
    // option, which did not reliably flip `matchMedia` in this environment)
    // is what actually engages `prefers-reduced-motion: reduce` here --
    // verified directly via `matchMedia(...).matches` before relying on it.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const orbName = await page
      .locator(".kx-orb")
      .first()
      .evaluate((el) => getComputedStyle(el).animationName);
    expect(orbName).toBe("none");

    const traceName = await page
      .locator(".kx-trace")
      .first()
      .evaluate((el) => getComputedStyle(el).animationName);
    expect(traceName).toBe("none");

    const cycNames = await page
      .locator("img.kx-cyc")
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).animationName));
    expect(cycNames).toEqual(["none", "none", "none"]);

    const label2 = page.locator("button.kx-lab-2");
    await label2.click();
    const layer2Opacity = await page
      .locator("img.kx-cyc-2")
      .evaluate((el) => getComputedStyle(el).opacity);
    expect(layer2Opacity).toBe("1");
  });
});
