import { settings } from "@/content/settings";
import type { Faq } from "@/content/types";
import { PERSONA_IDS } from "@/lib/personas";
import { SITE_URL, personaUrl } from "@/lib/seo";

/**
 * Task 20 (JSON-LD Structured Data). Spec §8a/§8b: entity disambiguation is
 * load-bearing because "KINECT" collides with unrelated companies
 * (trykinect.ai, kenect.com, Kinectiv), and small brands without a clean,
 * consistent entity (Organization schema + shared @id + sameAs) have near
 * -zero AI-citation probability regardless of content quality. These
 * builders are pure functions -- no React, no request/host access -- so
 * they can be unit tested directly (see jsonld.test.ts) and reused from
 * both the site-wide layout and per-page mounts (JsonLd.tsx renders
 * whatever object one of these returns).
 *
 * All object literals are typed as plain `object`-shaped return values
 * (not schema.org TS types -- this repo has no such dependency) but every
 * builder is asserted JSON-serializable with a `@context` in the test
 * suite, which is the actual contract Google/AI crawlers care about.
 */

/**
 * The Organization entity anchor. This exact string is the load-bearing
 * value in the whole file: spec §8a requires "a shared Organization
 * JSON-LD @id with sameAs links across all four hostnames" so crawlers
 * resolve the agency/coach/consultant subdomains and the root domain to
 * ONE entity instead of four unrelated ones. It is built from `SITE_URL`
 * (always the canonical production origin, e.g. "https://kinectnow.com" --
 * see seo.ts's own doc comment: canonical/OG/entity values stay pinned to
 * production even when this code runs on a preview deploy or a persona
 * subdomain request), never from the requesting host, so every call from
 * every hostname's render produces the byte-identical @id.
 */
export const ORG_ID = `${SITE_URL}/#org`;

/**
 * Organization JSON-LD, mounted site-wide (layout.tsx) so it renders on
 * every page regardless of hostname. `sameAs` currently lists only the
 * three persona subdomain roots -- the same-entity cross-links spec §8a
 * calls "mitigation" for the subdomain-architecture trade-off (search
 * engines otherwise treat subdomains as more separate than subfolders).
 * Off-site profile URLs (G2, Capterra, Wikidata -- spec §8a-iii's founder
 * -owned action list) get appended to this array once those profiles
 * exist; none do yet, so none are fabricated here.
 */
export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: "KINECT",
    url: SITE_URL,
    // TODO(Task 21): point this at the real favicon/icon asset once it
    // exists -- there is no public/icon.svg in the repo yet (only
    // public/favicon.ico, next.svg, vercel.svg, window.svg). This is a
    // disclosed placeholder path, not a verified asset.
    logo: `${SITE_URL}/icon.svg`,
    sameAs: PERSONA_IDS.map((persona) => `${personaUrl(persona)}/`),
  };
}

/**
 * WebSite JSON-LD, also mounted site-wide. `publisher` references the org
 * by @id (a JSON-LD node reference, `{ "@id": ... }`) rather than
 * duplicating the Organization fields inline -- the standard schema.org
 * pattern for "this website is published by that already-declared entity".
 */
export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "KINECT",
    url: SITE_URL,
    publisher: { "@id": ORG_ID },
  };
}

/**
 * SoftwareApplication + AggregateOffer JSON-LD, mounted site-wide. Spec
 * §8a: "only HoneyBook implements [SoftwareApplication + AggregateOffer
 * with real prices] correctly in the entire category, making it the
 * cleanest rich-snippet opportunity available" -- this is the highest
 * -value block in the file.
 *
 * Tier names/prices are derived from `settings.pricing.tiers` (the single
 * source of truth the pricing section itself renders from) rather than
 * duplicated as literals here, so a future pricing change updates both the
 * visible pricing table and this structured data from one edit.
 */
export function softwareApplicationLd() {
  const tiers = settings.pricing.tiers;
  const prices = tiers.map((tier) => tier.price);
  const lowPrice = Math.min(...prices);
  const highPrice = Math.max(...prices);

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "KINECT",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: SITE_URL,
    // Spec §8b "answer-ready pages": one of the three crawlable surfaces
    // (meta description, this description, the pricing section) that state
    // what/who/price in the first ~50 words, independent of the designed
    // page copy.
    description:
      "KINECT is a client portal for agencies, coaches and consultants, combining task tracking, analytics and AI insights. Flat monthly pricing from " +
      `$${lowPrice} to $${highPrice}, no per-seat fees.`,
    publisher: { "@id": ORG_ID },
    offers: {
      "@type": "AggregateOffer",
      lowPrice: String(lowPrice),
      highPrice: String(highPrice),
      priceCurrency: "USD",
      offerCount: String(tiers.length),
      offers: tiers.map((tier) => ({
        "@type": "Offer",
        name: tier.name,
        price: String(tier.price),
        priceCurrency: "USD",
      })),
    },
  };
}

/**
 * FAQPage JSON-LD, mounted per-page (home + the three persona pages; never
 * legal pages, which carry no `faq` field). Spec §8a demotes FAQ schema as
 * an AI-citation lever specifically ("no measured citation lift") but keeps
 * it for its classic-SERP value ("only 2 of 11 competitors use" it) -- it
 * still ships, just not as load-bearing strategy the way the
 * SoftwareApplication block above is.
 */
export function faqPageLd(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
