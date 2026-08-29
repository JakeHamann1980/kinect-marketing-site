import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import HeroBackdrop from "@/components/HeroBackdrop";
import Eyebrow from "@/components/Eyebrow";
import SectionHead from "@/components/SectionHead";
import PricingSection from "@/components/PricingSection";
import ComparisonTable from "@/components/ComparisonTable";
import TrackedLink from "@/components/TrackedLink";
import { signupUrl } from "@/lib/checkout";
import JsonLd from "@/components/JsonLd";
import { Faq } from "@/components/Faq";
import { fetchPricingPage, fetchSettings } from "@/lib/sanity";
import { renderWithGradient } from "@/lib/renderWithGradient";
import { faqPageLd } from "@/lib/jsonld";
import { pageMetadata, SITE_URL } from "@/lib/seo";

// Same static + tag-revalidated contract as every other content page (see
// src/lib/sanity.ts FETCH_OPTIONS and src/app/api/revalidate/route.ts).
export const revalidate = false;

/**
 * Dedicated pricing page (user-directed 2026-08-03; SECTION STRUCTURE
 * modeled on momentifyapp.com/pricing -- see src/content/pricing-page.ts
 * for what was deliberately not carried over -- but the VISUAL LANGUAGE is
 * KINECT's own: Jake rejected the first light-throughout cut for reading
 * like the Momentify reference instead of the brand. This revision wears
 * the home page's rhythm: dark kx-grid hero with the gradient phrase, the
 * dark tier-card treatment (tone="dark", cyan glow), dark stat and closing
 * bands, with the comparison matrix and FAQ in light bands exactly the way
 * home/persona pages alternate (the Faq accordion is light-section-only by
 * design, see its own doc comment).
 *
 * Like the legal pages, this route is served in place on every hostname
 * and canonicalizes to the apex. The tier cards come from the SAME shared
 * `settings.pricing` object the home and persona pricing sections render,
 * so the surfaces cannot drift; this page adds what the teasers don't
 * carry (comparison matrix, pricing FAQ, stat, closing).
 */
export async function generateMetadata() {
  const page = await fetchPricingPage();
  return pageMetadata({ seo: page.seo, canonicalUrl: `${SITE_URL}/pricing` });
}

export default async function PricingPage() {
  const [page, settings] = await Promise.all([fetchPricingPage(), fetchSettings()]);

  return (
    <div>
      <Nav />

      <main id="main">
        {/* 1 - THE DARK BLOCK: hero, tier cards and trust chips share ONE
            kx-grid canvas and ONE HeroBackdrop (user-directed 2026-08-03),
            so the blue orb wash carries from the headline all the way down
            to the trust line instead of ending at the hero's own bottom
            edge and leaving the cards on flat black. `tall` stretches the
            orb pools to this block's height (see HeroBackdrop/globals.css);
            PricingSection takes `inheritsBackdrop` so it stops painting its
            own opaque canvas over that shared wash. The trust chips keep
            their existing position at the very bottom of the block. */}
        <section className="kx-grid relative overflow-hidden">
          <HeroBackdrop tall />

          <div className="kx-hero-sec relative z-10">
            <div className="mx-auto flex max-w-[1000px] flex-col items-center text-center">
              {/* Accent-tinted hero eyebrow -- same inline-style approach as
                  PersonaPage's AccentEyebrow (Eyebrow's color comes from a
                  Tailwind utility a caller class can't reliably override). */}
              <span
                className="mb-4 block font-mono text-[11px] uppercase tracking-[.14em]"
                style={{ color: "var(--accent)" }}
              >
                {page.hero.eyebrow}
              </span>
              <h1 className="kx-hero-head max-w-[920px] font-display text-on-dark">
                {renderWithGradient(page.hero.title, page.hero.gradientPhrase)}
              </h1>
              <p className="kx-hero-sub mt-[26px] max-w-[620px] text-on-dark-4">
                {page.hero.intro}
              </p>
            </div>
          </div>

          {/* Tier cards: the home page's dark treatment (cyan-glow popular
              card), rendered detailed here, from the same shared
              settings.pricing object every other surface uses. */}
          <div className="kx-hero-join relative z-10">
            <PricingSection
              headline={settings.pricing.headline}
              supporting={settings.pricing.supporting}
              tiers={settings.pricing.tiers}
              tone="dark"
              detailed
              inheritsBackdrop
            />
          </div>

          {/* Trust chips, Momentify's reassurance row in KINECT's
              mono-eyebrow voice. */}
          <div className="relative z-10 pb-[72px]">
            <ul className="mx-auto flex max-w-[900px] flex-wrap items-center justify-center gap-x-8 gap-y-2 px-6">
              {page.trustLine.map((chip) => (
                <li
                  key={chip}
                  className="font-mono text-[11px] uppercase tracking-[.14em] text-on-dark-5"
                >
                  {chip}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 3 - COMPARISON MATRIX (light band, like the persona pages'
            pricing/pain sections -- tables read best on the light canvas). */}
        <section className="kx-sec bg-light-canvas">
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

        {/* 4 - VALUE STAT (dark kx-grid band with the cyan wash). */}
        <section className="kx-grid relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(780px 520px at 50% 100%, rgba(53,214,232,.18), transparent 64%)",
            }}
          />
          <div className="relative mx-auto max-w-[720px] px-6 py-[84px] text-center">
            <Eyebrow>{page.stat.title}</Eyebrow>
            <div className="mt-4 font-display text-[64px] font-bold leading-none text-on-dark">
              {page.stat.value}
            </div>
            <p className="mx-auto mt-4 max-w-[480px] text-[17px] leading-[1.6] text-on-dark-4 text-pretty">
              {page.stat.caption}
            </p>
          </div>
        </section>

        {/* 5 - PRICING FAQ (light band; the Faq accordion is
            light-section-only by design) + its FAQPage structured data. */}
        <section className="kx-sec bg-light-canvas">
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

        {/* 6 - CLOSING (dark, the home/persona closing treatment: kx-grid,
            HeroBackdrop, gradient headline). */}
        <section className="kx-grid relative overflow-hidden">
          <HeroBackdrop />
          <div className="relative z-10 mx-auto flex max-w-[820px] flex-col items-center px-6 py-[110px] text-center">
            <h2 className="kx-section-head font-display text-on-dark">
              {renderWithGradient(page.closing.headline, page.closing.gradientPhrase)}
            </h2>
            <p className="mt-4 max-w-[520px] text-[19px] leading-[1.55] text-on-dark-4 text-pretty">
              {page.closing.subhead}
            </p>
            <div className="mt-8">
              <TrackedLink
                href={signupUrl()}
                variant="primary"
                size="lg"
                trackLocation="pricing-page-closing"
              >
                {page.closing.cta} <span aria-hidden="true">{"→"}</span>
              </TrackedLink>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
