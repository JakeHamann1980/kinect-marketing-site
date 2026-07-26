import { NextRequest } from "next/server";
import { personaFromHost } from "@/lib/personas";
import { SITE_URL, personaUrl } from "@/lib/seo";
import { privacy } from "@/content/legal/privacy";
import { terms } from "@/content/legal/terms";
import { security } from "@/content/legal/security";
import { cookies } from "@/content/legal/cookies";

const LEGAL_SLUGS = [privacy.slug, terms.slug, security.slug, cookies.slug];

/**
 * Task 19 (Metadata, Robots, Sitemaps, Canonicals). Spec §8b: "Sitemaps ...
 * served per hostname". One Next app serves all four hostnames (root
 * domain + three persona subdomains) via src/proxy.ts rewrites, but the
 * Metadata Route file convention (`sitemap.ts`) has no access to the
 * incoming Host header -- it always runs at build/request time with no
 * request object. A route handler does get the request, so the sitemap
 * has to live here instead, at `src/app/sitemap.xml/route.ts`.
 *
 * This only works because `sitemap.xml` is in the proxy's exclusion list
 * (see src/proxy.ts's matcher regex: `...|sitemap.xml|...`), so the proxy
 * never rewrites or redirects this path -- the original Host header always
 * reaches this handler unchanged, for every hostname.
 *
 * Per hostname:
 * - Root domain (kinectnow.com and any other non-persona host, e.g. local
 *   dev on plain localhost): home plus the four legal pages.
 * - A persona subdomain (agency./coach./consultant.kinectnow.com, or
 *   `<persona>.localhost` in dev): just that persona's root URL -- personas
 *   have no sub-pages yet.
 *
 * URLs always use the canonical production origin (via `personaUrl`/
 * `SITE_URL`), never the request's own host, the same "canonical absolute
 * prod URL regardless of environment" rule `pageMetadata` follows -- a
 * sitemap entry should never advertise a preview or `*.localhost` URL.
 */
export function GET(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const persona = personaFromHost(host);

  const urls = persona
    ? [`${personaUrl(persona)}/`]
    : [
        `${SITE_URL}/`,
        ...LEGAL_SLUGS.map((slug) => `${SITE_URL}/legal/${slug}`),
      ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((loc) => `  <url>\n    <loc>${loc}</loc>\n  </url>`).join("\n")}
</urlset>
`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml",
      // Pre-step (Task 19 review): sitemaps change rarely (new pages,
      // occasional legal-slug additions) -- an hour of shared/edge caching
      // plus a day of stale-while-revalidate keeps crawlers off the origin
      // for every hostname without ever serving badly stale content.
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
