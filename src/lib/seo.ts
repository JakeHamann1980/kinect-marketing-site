import type { Metadata } from "next";
import type { Seo } from "@/content/types";
import type { Persona } from "@/lib/personas";

/**
 * Task 19 (Metadata, Robots, Sitemaps, Canonicals). Spec §8b: "Sitemaps and
 * canonical tags served per hostname; canonicals always point at the
 * subdomain URLs."
 *
 * `NEXT_PUBLIC_SITE_URL` (see .env.example) overrides the production
 * default, but for canonical/OG purposes the absolute production URL is
 * correct even when this build is running in preview/staging -- a preview
 * deploy should still claim `https://kinectnow.com/...` as the canonical
 * home for that content rather than its own preview host, so search engines
 * consolidate on the real domain instead of indexing the preview URL.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kinectnow.com";

/** The production root domain, derived from SITE_URL (drops protocol/path). */
const SITE_HOST = new URL(SITE_URL).host;

/**
 * The canonical (production) origin for a persona subdomain, e.g.
 * `https://agency.kinectnow.com`. Canonicals for persona pages always point
 * here -- never at the `/agency`-style internal path the proxy rewrites
 * to -- per spec §2 ("Canonical URLs are the subdomains").
 */
export function personaUrl(persona: Persona): string {
  const protocol = new URL(SITE_URL).protocol;
  return `${protocol}//${persona}.${SITE_HOST}`;
}

/**
 * Builds a Next `Metadata` object from a page's `seo` content fields plus its
 * canonical URL. `metadataBase` is set to `SITE_URL` on every call so any
 * relative OG/twitter image paths resolve against the production origin
 * even when Next renders this on a preview deployment.
 */
export function pageMetadata({
  seo,
  canonicalUrl,
}: {
  seo: Seo;
  canonicalUrl: string;
}): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    title: seo.title,
    description: seo.description,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
