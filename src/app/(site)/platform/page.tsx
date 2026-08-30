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
import type { PlatformSection } from "@/content/types";

// Same static + tag-revalidated contract as every other content page (see
// src/lib/sanity.ts FETCH_OPTIONS and src/app/api/revalidate/route.ts).
export const revalidate = false;

/**
 * The /platform product overview (shipped 2026-08-30; content provenance
 * notes live in src/content/platform-page.ts).
 *
 * Layout (user-directed 2026-08-30, second pass): the first cut rendered
 * every section as the same centered text stack over a full-width
 * screenshot and read as a wall; this revision lays the page out like a
 * product features page while staying inside the established visual
 * language:
 *
 * - Hero carries the standard CTA pair + mono trust chips (pricing's
 *   trustLine idiom) and a pill "jump nav" of anchor links, one per
 *   section, so the page is scannable from the top.
 * - Sections WITH a product capture render as a two-column split (text
 *   beside the framed shot, sides alternating shot to shot); the
 *   .kx-shot-frame/.kx-shot-glow treatment on dark bands, the light-card
 *   border language on light ones.
 * - Sections WITHOUT a capture render their points as a card grid
 *   (PersonaPage's dark capability-card idiom on dark bands, the standard
 *   white surface card on light).
 * - A consolidation stat band (bg-light-canvas-2, gradient value like the
 *   bento stat card) breaks the rhythm after the first three sections.
 * - The AI section pairs its checklist with the gradient quote card
 *   (PillarCards' aiInsight idiom) instead of a screenshot.
 *
 * Band parity stays dark = odd section index, so the page still alternates
 * cleanly between the dark hero and dark closing. Each section keeps the
 * anchor id the footer's Platform column links to.
 */
export async function generateMetadata() {
  const page = await fetchPlatformPage();
  return pageMetadata({ seo: page.seo, canonicalUrl: `${SITE_URL}/platform` });
}

function CheckIcon({ dark, className }: { dark: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={16}
      height={16}
      aria-hidden="true"
      className={cn("flex-none", className)}
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
  );
}

function SectionIntro({ section, dark }: { section: PlatformSection; dark: boolean }) {
  return (
    <>
      <span
        className="mb-3 block font-mono text-[11px] uppercase tracking-[.14em]"
        style={{ color: dark ? "var(--accent)" : "var(--accent-light)" }}
      >
        {section.eyebrow}
      </span>
      <SectionHead context={dark ? "dark" : "light"}>{section.title}</SectionHead>
      <p
        className={cn(
          "mt-4 max-w-[620px] text-[19px] leading-[1.55] text-pretty",
          dark ? "text-on-dark-4" : "text-ink-3",
        )}
      >
        {section.body}
      </p>
    </>
  );
}

/** The framed product capture, dark (glow + kx-shot-frame) or light
 * (surface card border) depending on the band it sits in. */
function Shot({
  screenshot,
  dark,
  sizes,
}: {
  screenshot: NonNullable<PlatformSection["screenshot"]>;
  dark: boolean;
  sizes: string;
}) {
  return (
    <div>
      <div className="relative z-0">
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
            // Reserve the image's true proportions before it loads.
            // 2918/1996 matches this repo's standard 2x capture family when
            // a Sanity doc predates the aspect field.
            style={{ aspectRatio: String(screenshot.aspect ?? 2918 / 1996) }}
          >
            <Image
              src={screenshot.src}
              alt={screenshot.alt}
              fill
              sizes={sizes}
              className="object-cover"
            />
          </div>
        </div>
      </div>
      <p
        className={cn(
          "mt-4 text-center text-[14px] leading-[1.5]",
          dark ? "text-on-dark-4" : "text-ink-3",
        )}
      >
        {screenshot.caption}
      </p>
    </div>
  );
}

export default async function PlatformPage() {
  const page = await fetchPlatformPage();

  // Sides alternate among the SCREENSHOT sections (not all sections), so
  // consecutive splits never repeat an orientation.
  let shotCount = 0;

  return (
    <div>
      <Nav />

      <main id="main">
        {/* HERO: gradient headline, CTA pair, trust chips and the anchor
            jump nav, all on one kx-grid canvas (the pricing page's
            one-dark-block pattern). */}
        <section className="kx-grid relative overflow-hidden">
          <HeroBackdrop tall />
          <div className="kx-hero-sec relative z-10 pb-0">
            <div className="mx-auto flex max-w-[1000px] flex-col items-center text-center">
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
              <div className="kx-ctarow mt-[30px]">
                <TrackedLink
                  href={signupUrl()}
                  variant="primary"
                  size="lg"
                  trackLocation="platform-hero"
                >
                  {page.hero.primaryCta} <span aria-hidden="true">{"→"}</span>
                </TrackedLink>
                <TrackedLink
                  href="/pricing"
                  variant="ghost"
                  size="lg"
                  trackLocation="platform-hero"
                >
                  {page.hero.secondaryCta}
                </TrackedLink>
              </div>
              <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
                {page.trustChips.map((chip) => (
                  <li
                    key={chip}
                    className="font-mono text-[11px] uppercase tracking-[.14em] text-on-dark-5"
                  >
                    {chip}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Anchor jump nav: one pill per capability section, so the whole
              page is scannable from the fold. Same-page anchors, so plain
              <a>, not TrackedLink. */}
          <nav
            aria-label="Platform capabilities"
            className="relative z-10 mx-auto flex max-w-[900px] flex-wrap items-center justify-center gap-[10px] px-6 pb-[64px] pt-[44px]"
          >
            {page.sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="rounded-full border border-[rgba(255,255,255,.16)] bg-[rgba(255,255,255,.04)] px-[14px] py-[6px] font-mono text-[11px] uppercase tracking-[.12em] text-on-dark-3 transition-colors hover:border-[rgba(255,255,255,.34)] hover:text-on-dark"
              >
                {section.eyebrow}
              </a>
            ))}
          </nav>
        </section>

        {page.sections.map((section, i) => {
          const dark = i % 2 === 1;
          const isAi = section.id === "ai-insights";
          const split = Boolean(section.screenshot) || isAi;
          const mediaFirst = split && !isAi && shotCount++ % 2 === 1;

          return (
            <div key={section.id}>
              <section
                id={section.id}
                className={cn(
                  "kx-sec relative overflow-hidden",
                  dark ? "kx-grid" : "bg-light-canvas",
                )}
              >
                <div className="relative mx-auto max-w-[1180px]">
                  {split ? (
                    /* TWO-COLUMN SPLIT: text beside the framed capture (or,
                       for the AI section, beside the Kai quote card). */
                    <div className="grid grid-cols-1 items-center gap-x-16 gap-y-12 kx-lg:grid-cols-2">
                      <div className={cn(mediaFirst && "kx-lg:order-last")}>
                        <SectionIntro section={section} dark={dark} />
                        <ul
                          className={cn(
                            "mt-7 flex flex-col gap-3 text-[16px] leading-[1.55] text-pretty",
                            dark ? "text-on-dark-3" : "text-ink-2",
                          )}
                        >
                          {section.points.map((point) => (
                            <li key={point} className="flex gap-3">
                              <CheckIcon dark={dark} className="mt-[5px]" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {section.screenshot ? (
                        <Shot
                          screenshot={section.screenshot}
                          dark={dark}
                          sizes="(max-width: 1024px) 100vw, 560px"
                        />
                      ) : isAi ? (
                        /* The gradient Kai quote card -- PillarCards'
                           aiInsight idiom (light warm-to-cool wash, pill
                           eyebrow, ink text), self-contained on either
                           band. */
                        <div
                          className="rounded-[18px] border border-border p-[34px_30px]"
                          style={{
                            background:
                              "linear-gradient(135deg, #F7EFE8 0%, #F0F4F2 48%, #DFF0EF 100%)",
                          }}
                        >
                          <div className="mb-4 inline-flex w-fit items-center rounded-full bg-[rgba(240,145,58,.16)] px-[10px] py-[3px] font-mono text-[11px] uppercase tracking-[.14em] text-coral-light">
                            {page.aiQuote.eyebrow}
                          </div>
                          <p className="text-[19px] leading-[1.6] text-ink-2">
                            {"“"}
                            {page.aiQuote.quote}
                            {"”"}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    /* CARD GRID: centered head, points as feature cards. */
                    <>
                      <div className="mx-auto max-w-[760px] text-center [&_p]:mx-auto">
                        <SectionIntro section={section} dark={dark} />
                      </div>
                      <div
                        className={cn(
                          "mt-11 grid grid-cols-1 gap-5",
                          section.points.length > 4
                            ? "kx-sm:grid-cols-2 kx-lg:grid-cols-3"
                            : "kx-md:grid-cols-2",
                        )}
                      >
                        {section.points.map((point) => (
                          <div
                            key={point}
                            className={cn(
                              "rounded-[18px] p-[26px_24px]",
                              dark
                                ? "border border-[rgba(255,255,255,.1)] bg-[rgba(255,255,255,.035)]"
                                : "border border-border bg-surface shadow-[0_1px_3px_rgba(12,18,32,.05)]",
                            )}
                          >
                            <CheckIcon dark={dark} className="mb-[14px]" />
                            <p
                              className={cn(
                                "text-[16px] leading-[1.55] text-pretty",
                                dark ? "text-on-dark-3" : "text-ink-2",
                              )}
                            >
                              {point}
                            </p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </section>

              {/* CONSOLIDATION BAND after the first three capability
                  sections: the bento stat card's gradient-value treatment
                  at band scale, on the secondary light canvas so it reads
                  as a beat, not another section. */}
              {i === 2 ? (
                <section className="border-y border-divider bg-light-canvas-2">
                  <div className="mx-auto max-w-[720px] px-6 py-[84px] text-center">
                    <span className="mb-4 block font-mono text-[11px] uppercase tracking-[.14em] text-muted">
                      {page.stat.title}
                    </span>
                    <div className="kx-grad font-display text-[64px] font-bold leading-none">
                      {page.stat.value}
                    </div>
                    <p className="mx-auto mt-5 max-w-[560px] text-[17px] leading-[1.6] text-ink-3 text-pretty">
                      {page.stat.caption}
                    </p>
                  </div>
                </section>
              ) : null}
            </div>
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
            <div className="kx-ctarow mt-8">
              <TrackedLink
                href={signupUrl()}
                variant="primary"
                size="lg"
                trackLocation="platform-closing"
              >
                {page.closing.cta} <span aria-hidden="true">{"→"}</span>
              </TrackedLink>
              <TrackedLink
                href="/pricing"
                variant="ghost"
                size="lg"
                trackLocation="platform-closing"
              >
                {page.hero.secondaryCta}
              </TrackedLink>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
