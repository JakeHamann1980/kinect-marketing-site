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
  const res = await request.get("/coach/opengraph-image", {
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
