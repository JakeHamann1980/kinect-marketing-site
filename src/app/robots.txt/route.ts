import { NextRequest } from "next/server";
import { personaFromHost } from "@/lib/personas";
import { SITE_URL, personaUrl } from "@/lib/seo";

/**
 * Pre-step (Task 19 review; carried into Task 20). Spec §8b: "robots.txt
 * explicitly allowing GPTBot, ClaudeBot, PerplexityBot, Google-Extended" --
 * AI crawlers are welcomed on purpose (§8a: the site has zero AI-answer
 * presence today and needs it).
 *
 * This mirrors `src/app/sitemap.xml/route.ts`'s host-aware pattern exactly,
 * for the same reason: the Metadata Route file convention (`robots.ts`,
 * which this file replaces) has no access to the incoming Host header, but
 * a route handler does. The allow-all rule plus the four AI-crawler blocks
 * are identical on every hostname -- every hostname allows everything --
 * but the `Sitemap:` line must point at the REQUESTING host's own sitemap
 * (root host -> https://kinectnow.com/sitemap.xml; a persona subdomain host
 * -> https://<persona>.kinectnow.com/sitemap.xml), not always the root
 * sitemap as the old static file did, so each hostname's own Search Console
 * property (§8b: "Search Console properties per hostname from day one")
 * discovers its own sitemap rather than the shared one.
 *
 * This only works because `robots.txt` is in the proxy's exclusion list
 * (see src/proxy.ts's matcher regex: `...|robots.txt|...`), so the proxy
 * never rewrites or redirects this path -- the original Host header always
 * reaches this handler unchanged, for every hostname.
 */
export function GET(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const persona = personaFromHost(host);
  const sitemapOrigin = persona ? personaUrl(persona) : SITE_URL;

  const body = `User-agent: *
Allow: /

# AI crawlers explicitly welcomed (spec §8b), rather than left to the
# wildcard rule's default allow -- an explicit block signals intent and
# survives a future tightening of the wildcard rule.
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: ${sitemapOrigin}/sitemap.xml
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain",
      // Same cache header as sitemap.xml -- rarely changes, safe to cache
      // at the edge for an hour with a day of stale-while-revalidate.
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
