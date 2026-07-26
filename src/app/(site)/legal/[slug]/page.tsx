import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SectionHead from "@/components/SectionHead";
import { privacy } from "@/content/legal/privacy";
import { terms } from "@/content/legal/terms";
import { security } from "@/content/legal/security";
import { cookies } from "@/content/legal/cookies";
import type { LegalPage } from "@/content/legal/types";
import { fetchLegal } from "@/lib/sanity";
import { pageMetadata, SITE_URL } from "@/lib/seo";

// Task 18 (Seed Script + Page Wiring + Revalidation): fully static,
// tag-based on-demand revalidation only.
export const revalidate = false;

/**
 * Task 14 (Legal Pages): a single light-prose template shared by all four
 * legal routes (/legal/privacy, /legal/terms, /legal/security,
 * /legal/cookies), keyed by `LegalPage.slug` rather than duplicating a page
 * component per route. The proxy's route matcher already passes `/legal/*`
 * through untouched (see `src/proxy.ts`'s "shared routes (legal, api) serve
 * as-is" branch), so no persona rewrite ever reaches this route.
 *
 * Unlike the dark hero-driven home/persona templates, legal pages have no
 * hero section: a plain light canvas, the title as the page's own
 * `SectionHead`, a "Last updated" line, and a single prose column capped at
 * 68 characters per line (`max-w-[68ch]`) for readability, per the task
 * brief. `Nav` renders with no `badge` prop (these are shared root-domain
 * routes, not persona subdomain pages, so no "for Agencies"-style badge
 * applies).
 */
const PAGES: Record<string, LegalPage> = {
  [privacy.slug]: privacy,
  [terms.slug]: terms,
  [security.slug]: security,
  [cookies.slug]: cookies,
};

export function generateStaticParams() {
  return Object.keys(PAGES).map((slug) => ({ slug }));
}

// Task 19: canonical is always the root-domain legal path
// (https://kinectnow.com/legal/<slug>) -- legal pages are shared routes the
// proxy passes through untouched on every hostname (see src/proxy.ts's
// "shared routes (legal, api) serve as-is" branch), so there is no
// subdomain variant to canonicalize toward the way persona pages do.
// Task 18: the page content/seo now comes from `fetchLegal(slug)`
// (Sanity-or-local-fallback -- see src/lib/sanity.ts); `PAGES` above still
// supplies the definitive list of the four known slugs for
// `generateStaticParams` and the "unknown slug" 404 check, since that list
// doesn't change independent of Sanity content.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!PAGES[slug]) return {};
  const page = await fetchLegal(slug);
  if (!page) return {};
  return pageMetadata({
    seo: page.seo,
    canonicalUrl: `${SITE_URL}/legal/${page.slug}`,
  });
}

export default async function LegalPageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!PAGES[slug]) notFound();
  const page = await fetchLegal(slug);
  if (!page) notFound();

  return (
    <div className="bg-light-canvas">
      {/* No dark hero on prose pages: nav wears its solid treatment always. */}
      <Nav forceSolid />

      {/* Fix (final review, M7): `<main id="main">` -- see the matching
          comment in (site)/page.tsx for why this landmark excludes both
          Nav and Footer. */}
      <main id="main">
      <section className="kx-sec">
        <div className="mx-auto max-w-[68ch]">
          <SectionHead context="light" as="h1">
            {page.title}
          </SectionHead>
          <p className="mt-3 text-[14px] text-muted">
            Last updated {page.updated}
          </p>

          <div className="mt-11 flex flex-col gap-9">
            {page.sections.map((section) => (
              <div key={section.heading}>
                <h2 className="mb-3 font-display text-[21px] font-bold text-ink">
                  {section.heading}
                </h2>
                <div className="flex flex-col gap-4">
                  {section.paragraphs.map((paragraph, i) => (
                    <p
                      key={i}
                      className="text-[17px] leading-[1.65] text-ink-2 text-pretty"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      </main>

      <Footer />
    </div>
  );
}
