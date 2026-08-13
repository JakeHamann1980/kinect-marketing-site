import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Eyebrow from "@/components/Eyebrow";
import SectionHead from "@/components/SectionHead";
import PricingSection from "@/components/PricingSection";
import ComparisonTable from "@/components/ComparisonTable";
import WaitlistCta from "@/components/WaitlistCta";
import JsonLd from "@/components/JsonLd";
import { Faq } from "@/components/Faq";
import { fetchPricingPage, fetchSettings } from "@/lib/sanity";
import { faqPageLd } from "@/lib/jsonld";
import { pageMetadata, SITE_URL } from "@/lib/seo";

// Same static + tag-revalidated contract as every other content page (see
// src/lib/sanity.ts FETCH_OPTIONS and src/app/api/revalidate/route.ts).
export const revalidate = false;

/**
 * Dedicated pricing page (user-directed 2026-08-03; structure modeled on
 * momentifyapp.com/pricing, adapted to KINECT's flat model -- see
 * src/content/pricing-page.ts's own header comment for what was deliberately
 * NOT carried over: billing toggle, contact-sales tier, trial CTAs).
 *
 * Like the legal pages, this is a light prose-rhythm page (Nav forceSolid,
 * no dark hero) served in place on every hostname -- the proxy's matcher
 * passes non-persona single-segment paths through untouched, so
 * agency.kinectnow.com/pricing renders this same page. Canonical therefore
 * always points at the apex variant, mirroring /legal/[slug]'s reasoning.
 *
 * The tier cards come from the SAME shared `settings.pricing` object the
 * home and persona pricing sections render, so the two surfaces cannot
 * drift; this page adds what the teaser sections don't carry (comparison
 * matrix, pricing FAQ, stat, closing).
 */
export async function generateMetadata() {
  const page = await fetchPricingPage();
  return pageMetadata({ seo: page.seo, canonicalUrl: `${SITE_URL}/pricing` });
}

export default async function PricingPage() {
  const [page, settings] = await Promise.all([fetchPricingPage(), fetchSettings()]);

  return (
    <div className="bg-light-canvas">
      <Nav forceSolid />

      <main id="main">
        {/* Hero: light, centered, no backdrop -- the page thesis. */}
        <section className="kx-sec pb-0">
          <div className="mx-auto max-w-[720px] text-center">
            <Eyebrow context="light">{page.hero.eyebrow}</Eyebrow>
            <SectionHead context="light" as="h1" className="mt-3">
              {page.hero.title}
            </SectionHead>
            <p className="mx-auto mt-4 max-w-[560px] text-[19px] leading-[1.55] text-ink-3 text-pretty">
              {page.hero.intro}
            </p>
          </div>
        </section>

        {/* The shared tier cards -- same settings.pricing object the home
            and persona sections render, waitlist CTAs and all. */}
        <PricingSection
          headline={settings.pricing.headline}
          supporting={settings.pricing.supporting}
          tiers={settings.pricing.tiers}
        />

        {/* Trust chips, Momentify's "Cancel anytime / No setup fee" row. */}
        <section className="bg-light-canvas-2 pb-[64px]">
          <ul className="mx-auto flex max-w-[900px] flex-wrap items-center justify-center gap-x-8 gap-y-2 px-6">
            {page.trustLine.map((chip) => (
              <li
                key={chip}
                className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-3"
              >
                {chip}
              </li>
            ))}
          </ul>
        </section>

        {/* Feature comparison matrix. */}
        <section className="kx-sec">
          <div className="mx-auto max-w-[1000px]">
            <div className="text-center">
              <SectionHead context="light">{page.comparison.title}</SectionHead>
              <p className="mx-auto mt-4 max-w-[560px] text-[19px] leading-[1.55] text-ink-3 text-pretty">
                {page.comparison.intro}
              </p>
            </div>
            <div className="mt-[50px]">
              <ComparisonTable
                comparison={page.comparison}
                tiers={settings.pricing.tiers}
              />
            </div>
          </div>
        </section>

        {/* Value stat band, the KINECT stand-in for Momentify's ROI section. */}
        <section className="bg-light-canvas-2">
          <div className="mx-auto max-w-[720px] px-6 py-[72px] text-center">
            <Eyebrow context="light">{page.stat.title}</Eyebrow>
            <div className="mt-4 font-display text-[56px] font-bold leading-none text-ink">
              {page.stat.value}
            </div>
            <p className="mx-auto mt-4 max-w-[480px] text-[17px] leading-[1.6] text-ink-3 text-pretty">
              {page.stat.caption}
            </p>
          </div>
        </section>

        {/* Pricing FAQ + its FAQPage structured data. */}
        <section className="kx-sec">
          <JsonLd data={faqPageLd(page.faq)} />
          <div className="mx-auto max-w-[760px]">
            <div className="text-center">
              <SectionHead context="light">{page.faqTitle}</SectionHead>
            </div>
            <div className="mt-[42px]">
              <Faq items={page.faq} />
            </div>
          </div>
        </section>

        {/* Closing CTA, light treatment. */}
        <section className="bg-light-canvas-2">
          <div className="mx-auto max-w-[720px] px-6 py-[84px] text-center">
            <SectionHead context="light">{page.closing.headline}</SectionHead>
            <p className="mx-auto mt-4 max-w-[520px] text-[19px] leading-[1.55] text-ink-3 text-pretty">
              {page.closing.subhead}
            </p>
            <div className="mt-8 flex justify-center">
              <WaitlistCta
                variant="accent"
                trackLocation="pricing-page-closing"
              >
                {page.closing.cta}
              </WaitlistCta>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
