import { test, expect } from "@playwright/test";

/**
 * Task 22 (Playwright Suite). Regression suite for src/proxy.ts's Host-based
 * persona rewriting/redirecting, plus the host-aware robots.txt/sitemap.xml
 * route handlers (src/app/robots.txt/route.ts, src/app/sitemap.xml/route.ts).
 * Uses the `request` fixture directly against the running server with an
 * overridden `Host` header, rather than the browser, since these are pure
 * HTTP-routing behaviors with no DOM to interact with -- and a real
 * `next start` build is what makes the Host-header dispatch faithful (see
 * playwright.config.ts's own doc comment on choosing "start" over "dev").
 *
 * NOTE: the task brief's example deep path was `/coach/pricing`, but no such
 * route exists in this app (persona segments only have `page.tsx` +
 * `opengraph-image.tsx` today -- see src/proxy.ts's own "TRIPWIRE" comment
 * about a hypothetical future `/agency/vs-suitedash`). `/coach/opengraph-image`
 * is used instead: a real, existing deep path one segment under a persona
 * root, which is exactly what the proxy's Task 21 narrowing (redirect only
 * fires on the exact persona root, "/coach", not anything nested under it)
 * is meant to exercise.
 *
 * Task 18 (Seed Script + Page Wiring + Revalidation) fix: this test
 * previously hardcoded the literal path `/coach/opengraph-image`, but Next's
 * `opengraph-image.tsx` file convention actually serves that route at a
 * content-hashed sibling path (e.g. `/coach/opengraph-image-1yemz3`) --
 * confirmed pre-existing on the base commit this task started from (639e492),
 * so it isn't something Task 18's page-wiring changes introduced, just the
 * first `test:e2e` run to actually exercise this assertion end to end. Rather
 * than hardcode a build-specific hash, the test now discovers the real path
 * from the rendered page's own `og:image` meta tag (absolute, pointing at
 * this exact hashed route -- see src/lib/og-template.tsx/opengraph-image.tsx),
 * then confirms requesting that real deep path on the apex host serves it in
 * place with no redirect, same intent as before.
 */

const PROD_ROOT = "kinectnow.com";

test("root path on a persona subdomain host rewrites internally to that persona's page", async ({
  request,
}) => {
  const res = await request.get("/", {
    headers: { Host: `coach.localhost:3200` },
    maxRedirects: 0,
  });
  expect(res.status()).toBe(200);
  const body = await res.text();
  expect(body).toContain("athletes");
});

test("persona root on the production apex host redirects (308) to the persona subdomain", async ({
  request,
}) => {
  const res = await request.get("/coach", {
    headers: { Host: PROD_ROOT },
    maxRedirects: 0,
  });
  expect(res.status()).toBe(308);
  expect(res.headers()["location"]).toBe(`https://coach.${PROD_ROOT}/`);
});

test("a deep path under a persona segment on the apex host serves in place (no redirect)", async ({
  request,
}) => {
  // Discover the real (content-hashed) opengraph-image path for /coach from
  // the rendered page's own og:image meta tag -- see this file's top-level
  // doc comment. `coach.localhost` is used purely to render the page
  // without hitting the apex-host persona-root redirect (test above); the
  // hashed path itself is host-independent (SITE_URL-absolute).
  const pageRes = await request.get("/", { headers: { Host: "coach.localhost:3200" } });
  const html = await pageRes.text();
  const match = html.match(/property="og:image" content="([^"]+)"/);
  expect(match).not.toBeNull();
  const ogImageUrl = new URL(match![1]);
  expect(ogImageUrl.pathname).not.toBe("/coach");

  const res = await request.get(`${ogImageUrl.pathname}${ogImageUrl.search}`, {
    headers: { Host: PROD_ROOT },
    maxRedirects: 0,
  });
  expect(res.status()).toBe(200);
});

test("www is canonicalized (308) to the apex domain", async ({ request }) => {
  const res = await request.get("/", {
    headers: { Host: `www.${PROD_ROOT}` },
    maxRedirects: 0,
  });
  expect(res.status()).toBe(308);
  expect(res.headers()["location"]).toBe(`https://${PROD_ROOT}/`);
});

test("robots.txt Sitemap line points at the requesting host's own sitemap", async ({
  request,
}) => {
  const res = await request.get("/robots.txt", {
    headers: { Host: `agency.${PROD_ROOT}` },
  });
  expect(res.status()).toBe(200);
  const body = await res.text();
  expect(body).toContain(`Sitemap: https://agency.${PROD_ROOT}/sitemap.xml`);
});

test("sitemap.xml varies its URL set by requesting host", async ({ request }) => {
  const agencyRes = await request.get("/sitemap.xml", {
    headers: { Host: `agency.${PROD_ROOT}` },
  });
  const agencyBody = await agencyRes.text();
  expect(agencyBody).toContain(`<loc>https://agency.${PROD_ROOT}/</loc>`);
  expect(agencyBody).not.toContain("/legal/");

  const rootRes = await request.get("/sitemap.xml", {
    headers: { Host: PROD_ROOT },
  });
  const rootBody = await rootRes.text();
  expect(rootBody).toContain(`<loc>https://${PROD_ROOT}/</loc>`);
  expect(rootBody).toContain(`<loc>https://${PROD_ROOT}/legal/privacy</loc>`);
});
