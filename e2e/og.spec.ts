import { test, expect } from "@playwright/test";

/**
 * OG image policy guard. Every URL the site lists in its sitemap, on every
 * hostname it serves, must ship HTML carrying an absolute `og:image` and a
 * `twitter:image`, and that image URL must actually serve a PNG.
 *
 * Why this exists: Next's `opengraph-image.tsx` convention only attaches a
 * file to pages in the SAME route segment. A page whose metadata sets an
 * `openGraph` block (all of ours do, via `pageMetadata`) drops any image
 * inherited from a parent segment, so home's card at `src/app/` decorated
 * nothing, and `/pricing`, added later with no file, had none either. Both
 * shipped that way and nothing caught it. This test walks the sitemap
 * rather than a hardcoded list so a new page cannot be added to the
 * sitemap without a card: it fails here before it fails on LinkedIn.
 *
 * The sitemap and pages are fetched with each host's `Host` header, the
 * same way routing.spec.ts exercises the persona rewrite. The image is
 * fetched on the apex host because `metadataBase` pins every image URL
 * to the apex origin (see src/proxy.ts on why persona hosts must not
 * redirect those paths).
 */

const PROD_ROOT = "kinectnow.com";
const HOSTS = [
  "localhost:3200",
  "agency.localhost:3200",
  "services.localhost:3200",
  "consultant.localhost:3200",
  "coach.localhost:3200",
];

for (const host of HOSTS) {
  test(`every sitemap URL on ${host} carries a resolvable OG image`, async ({ request }) => {
    const sitemap = await request.get("/sitemap.xml", { headers: { Host: host } });
    expect(sitemap.status()).toBe(200);
    const paths = [...(await sitemap.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (m) => new URL(m[1]).pathname,
    );
    expect(paths.length, `${host} sitemap lists no URLs`).toBeGreaterThan(0);

    for (const path of paths) {
      const res = await request.get(path, { headers: { Host: host } });
      expect(res.status(), `${host}${path}`).toBe(200);
      const html = await res.text();

      const og = html.match(/<meta property="og:image" content="([^"]+)"/);
      const twitter = html.match(/<meta name="twitter:image" content="([^"]+)"/);
      expect(og, `${host}${path} has no og:image`).not.toBeNull();
      expect(twitter, `${host}${path} has no twitter:image`).not.toBeNull();

      // Crawlers do not resolve relative image URLs; it must be absolute.
      const imageUrl = new URL(og![1]);
      expect(imageUrl.protocol, `${host}${path} og:image is not absolute`).toMatch(/^https?:$/);

      const image = await request.get(`${imageUrl.pathname}${imageUrl.search}`, {
        headers: { Host: PROD_ROOT },
        maxRedirects: 0,
      });
      expect(image.status(), `${host}${path}: ${imageUrl.pathname} did not serve`).toBe(200);
      expect(image.headers()["content-type"], `${host}${path}`).toBe("image/png");
      // A real 1200x630 card is tens of KB; a blank or broken render is not.
      expect((await image.body()).length, `${host}${path}: image suspiciously small`).toBeGreaterThan(10_000);
    }
  });
}
