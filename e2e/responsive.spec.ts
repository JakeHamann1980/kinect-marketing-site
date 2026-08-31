import { test, expect } from "@playwright/test";

/**
 * Task 22 (Playwright Suite). Cross-viewport regression: no horizontal
 * overflow, the hero headline's 66/34/29px responsive scale (globals.css
 * `.kx-hero-head`, breakpoints at 860px/480px), and a spot-check that a
 * 3-column grid actually collapses to 1 column below its `kx-md` (860px)
 * breakpoint.
 */

const SIZES: { width: number; expectedFontSize: string }[] = [
  { width: 1280, expectedFontSize: "66px" },
  { width: 800, expectedFontSize: "34px" },
  { width: 400, expectedFontSize: "29px" },
];

const PAGES = ["/", "/agency", "/platform"];

for (const path of PAGES) {
  test.describe(`responsive ${path}`, () => {
    for (const { width, expectedFontSize } of SIZES) {
      test(`at ${width}px: no horizontal scroll, hero h1 is ${expectedFontSize}`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path);

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow).toBe(0);

        const h1 = page.locator("h1.kx-hero-head");
        const fontSize = await h1.evaluate((el) => getComputedStyle(el).fontSize);
        expect(fontSize).toBe(expectedFontSize);
      });
    }
  });
}

test("grid spot-check: the pillar cards grid is 3-col at 1280px and 1-col at 400px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");

  const grid = page.locator('div[class*="kx-md:grid-cols-3"]').first();
  await grid.scrollIntoViewIfNeeded();

  const wideCols = await grid.evaluate(
    (el) => getComputedStyle(el).gridTemplateColumns.trim().split(/\s+/).length,
  );
  expect(wideCols).toBe(3);

  await page.setViewportSize({ width: 400, height: 900 });
  const narrowCols = await grid.evaluate(
    (el) => getComputedStyle(el).gridTemplateColumns.trim().split(/\s+/).length,
  );
  expect(narrowCols).toBe(1);
});
