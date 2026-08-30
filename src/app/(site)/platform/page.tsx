import Image from "next/image";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import HeroBackdrop from "@/components/HeroBackdrop";
import SectionHead from "@/components/SectionHead";
import TrackedLink from "@/components/TrackedLink";
import { signupUrl } from "@/lib/checkout";
import { fetchPlatformPage } from "@/lib/sanity";
import { renderWithGradient } from "@/lib/renderWithGradient";
import { pageMetadata, SITE_URL } from "@/lib/seo";
import { cn } from "@/lib/cn";

// Same static + tag-revalidated contract as every other content page (see
// src/lib/sanity.ts FETCH_OPTIONS and src/app/api/revalidate/route.ts).
export const revalidate = false;

/**
 * The /platform product overview, shipped 2026-08-30 (it started life as a
 * draft-gated page; the DraftNotice/notFound gate and the noindex metadata
 * left with the promotion). Content was rebuilt against the platform repo's
 * actual feature set, section by section -- see src/content/platform-page.ts
 * for the claim-by-claim provenance notes.
 *
 * Structure: dark kx-grid hero, alternating light/dark capability sections
 * (each carrying the anchor id the footer's Platform column links to), dark
 * closing CTA. Sections with a real product capture render it under their
 * checklist in the same framed treatment the persona pages use
 * (.kx-shot-glow/.kx-shot-frame on dark; the established light-card border +
 * shadow language on light, where the dark frame's white border and cyan
 * glow would fight the canvas).
 */
export async function generateMetadata() {
  const page = await fetchPlatformPage();
  return pageMetadata({ seo: page.seo, canonicalUrl: `${SITE_URL}/platform` });
}

export default async function PlatformPage() {
  const page = await fetchPlatformPage();

  return (
    <div>
      <Nav />

      <main id="main">
        <section className="kx-grid kx-hero-sec relative overflow-hidden">
          <HeroBackdrop />
          <div className="relative z-10 mx-auto flex max-w-[1000px] flex-col items-center text-center">
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
        </section>

        {/* Capability sections, alternating light/dark the way the persona
            pages do. Each carries the anchor the footer column links to. */}
        {page.sections.map((section, i) => {
          const dark = i % 2 === 1;
          return (
            <section
              key={section.id}
              id={section.id}
              className={cn(
                "kx-sec relative overflow-hidden",
                dark ? "kx-grid" : "bg-light-canvas",
              )}
            >
              <div className="relative mx-auto max-w-[880px]">
                <div className="mx-auto max-w-[760px]">
                  <span
                    className="mb-3 block font-mono text-[11px] uppercase tracking-[.14em]"
                    style={{ color: dark ? "var(--accent)" : "var(--accent-light)" }}
                  >
                    {section.eyebrow}
                  </span>
                  <SectionHead context={dark ? "dark" : "light"}>
                    {section.title}
                  </SectionHead>
                  <p
                    className={cn(
                      "mt-4 max-w-[620px] text-[19px] leading-[1.55] text-pretty",
                      dark ? "text-on-dark-4" : "text-ink-3",
                    )}
                  >
                    {section.body}
                  </p>
                  <ul
                    className={cn(
                      "mt-7 flex flex-col gap-3 text-[16px] leading-[1.55] text-pretty",
                      dark ? "text-on-dark-3" : "text-ink-2",
                    )}
                  >
                    {section.points.map((point) => (
                      <li key={point} className="flex gap-3">
                        <svg
                          viewBox="0 0 16 16"
                          width={16}
                          height={16}
                          aria-hidden="true"
                          className="mt-[5px] flex-none"
                          style={{ color: dark ? "var(--accent)" : "var(--accent-light)" }}
                        >
                          <path
                            d="M3 8.5L6.5 12L13 4.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {section.screenshot ? (
                  <>
                    <div className="relative z-0 mt-12">
                      {dark ? <div aria-hidden="true" className="kx-shot-glow" /> : null}
                      <div
                        className={cn(
                          dark
                            ? "kx-shot-frame"
                            : "overflow-hidden rounded-[14px] border border-border bg-surface shadow-[0_18px_50px_rgba(12,18,32,.14)]",
                        )}
                      >
                        <div
                          className="relative"
                          // Reserve the image's true proportions before it
                          // loads. 2918/1996 matches this repo's standard 2x
                          // capture family when a Sanity doc predates the
                          // aspect field.
                          style={{ aspectRatio: String(section.screenshot.aspect ?? 2918 / 1996) }}
                        >
                          <Image
                            src={section.screenshot.src}
                            alt={section.screenshot.alt}
                            fill
                            sizes="(max-width: 860px) 100vw, 880px"
                            className="object-cover"
                          />
                        </div>
                      </div>
                    </div>
                    <p
                      className={cn(
                        "mt-4 text-center text-[15px]",
                        dark ? "text-on-dark-4" : "text-ink-3",
                      )}
                    >
                      {section.screenshot.caption}
                    </p>
                  </>
                ) : null}
              </div>
            </section>
          );
        })}

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
              <TrackedLink href={signupUrl()} variant="primary" size="lg" trackLocation="platform-closing">
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
