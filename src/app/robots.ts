import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * Task 19 (Metadata, Robots, Sitemaps, Canonicals). Spec §8b: "robots.txt
 * explicitly allowing GPTBot, ClaudeBot, PerplexityBot, Google-Extended" --
 * AI crawlers are welcomed on purpose (§8a: the site has zero AI-answer
 * presence today and needs it).
 *
 * This one file is served identically on all four hostnames (root domain
 * and the three persona subdomains): the proxy matcher excludes
 * `robots.txt` (see src/proxy.ts's matcher regex), so every hostname hits
 * this same Next.js Metadata Route rather than being rewritten to a
 * persona route. That is an accepted simplification -- a true per-hostname
 * robots.txt (e.g. a different disallow list per persona) isn't needed yet
 * since every hostname allows everything, and the one `sitemap` line below
 * always points at the root sitemap regardless of which host served this
 * file. Per-hostname sitemap discovery instead happens by submitting each
 * subdomain's own sitemap URL directly in its own Search Console property
 * (§8b: "Search Console properties per hostname from day one"), not by
 * varying robots.txt per host.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      // AI crawlers explicitly welcomed (spec §8b), rather than left to the
      // wildcard rule's default allow -- an explicit block signals intent
      // and survives a future tightening of the wildcard rule.
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
