import type { ReactNode } from "react";
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

function CheckIcon({
  dark,
  size = 18,
  className,
}: {
  dark: boolean;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
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

/**
 * The feature cards' stroke-icon set (user-directed 2026-08-31: each card
 * carries an icon naming what its line is about, not a generic check).
 * Hand-drawn on the checkmark's own grammar: 16 viewBox, ~1.7 stroke,
 * round caps/joins, currentColor. Names are the `PlatformIcon` union in
 * src/content/types.ts and the Sanity schema's options list; anything
 * unrecognized falls back to the check so an older doc or a typo renders
 * a sane badge instead of an empty one.
 */
const ICON_PATHS: Record<string, ReactNode> = {
  bell: (
    <>
      <path d="M8 2.2a3.8 3.8 0 0 0-3.8 3.8v2.6L2.8 11h10.4l-1.4-2.4V6A3.8 3.8 0 0 0 8 2.2z" />
      <path d="M6.6 13.2a1.5 1.5 0 0 0 2.8 0" />
    </>
  ),
  chat: (
    <>
      <path d="M3.2 3h9.6a1 1 0 0 1 1 1v5.4a1 1 0 0 1-1 1H7.4L4.2 13v-2.6h-1a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
    </>
  ),
  paperclip: (
    <path d="M12.6 7.4l-4.8 4.8a3 3 0 0 1-4.2-4.2L9 2.6a2 2 0 0 1 2.8 2.8L6.6 10.6a1 1 0 0 1-1.4-1.4l4.4-4.4" />
  ),
  lock: (
    <>
      <rect x="4" y="7" width="8" height="6.2" rx="1.2" />
      <path d="M5.8 7V5.2a2.2 2.2 0 0 1 4.4 0V7" />
    </>
  ),
  calendar: (
    <>
      <rect x="2.4" y="3.4" width="11.2" height="10.2" rx="1.2" />
      <path d="M2.4 6.6h11.2M5.4 1.8v2.6M10.6 1.8v2.6" />
    </>
  ),
  clock: (
    <>
      <circle cx="8" cy="8" r="5.6" />
      <path d="M8 5v3.2l2.2 1.4" />
    </>
  ),
  grid: (
    <>
      <rect x="2.4" y="2.4" width="11.2" height="11.2" rx="1.2" />
      <path d="M2.4 6.8h11.2M6.8 6.8v6.8M10.8 6.8v6.8" />
    </>
  ),
  form: (
    <>
      <rect x="3.4" y="3" width="9.2" height="11" rx="1.2" />
      <path d="M6 2h4v2.2H6zM5.8 8h4.4M5.8 10.6h3" />
    </>
  ),
  doc: (
    <>
      <path d="M4 2.4h4.8L12 5.6v8H4z" />
      <path d="M8.8 2.4v3.2H12M6 9h4M6 11.2h2.6" />
    </>
  ),
  search: (
    <>
      <circle cx="7" cy="7" r="4.2" />
      <path d="M10.2 10.2l3.4 3.4" />
    </>
  ),
  megaphone: (
    <>
      <path d="M13.2 2.8L5.4 5.6H3.2a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2.2l7.8 2.8z" />
      <path d="M6 10l1 3.4" />
    </>
  ),
  card: (
    <>
      <rect x="2" y="3.8" width="12" height="8.6" rx="1.2" />
      <path d="M2 6.8h12M4.4 10.4h3.2" />
    </>
  ),
  key: (
    <>
      <circle cx="5.4" cy="10.6" r="2.6" />
      <path d="M7.4 8.6L13 3M10.8 5.2l2 2" />
    </>
  ),
  users: (
    <>
      <circle cx="5.8" cy="5.6" r="2.2" />
      <path d="M2.2 13.2c0-2.2 1.6-3.8 3.6-3.8s3.6 1.6 3.6 3.8" />
      <path d="M10.4 3.8a2.2 2.2 0 0 1 0 3.8M11.4 9.6c1.4.5 2.4 1.9 2.4 3.6" />
    </>
  ),
  shield: (
    <>
      <path d="M8 1.8l5 1.9v4c0 3-2 4.7-5 6.3-3-1.6-5-3.3-5-6.3v-4z" />
      <path d="M5.8 7.8l1.6 1.6 2.8-3" />
    </>
  ),
  database: (
    <>
      <ellipse cx="8" cy="3.8" rx="5" ry="1.9" />
      <path d="M3 3.8v8.2c0 1 2.2 1.9 5 1.9s5-.9 5-1.9V3.8" />
      <path d="M3 8c0 1 2.2 1.9 5 1.9s5-.9 5-1.9" />
    </>
  ),
  globe: (
    <>
      <circle cx="8" cy="8" r="5.6" />
      <path d="M2.4 8h11.2M8 2.4c1.9 1.8 1.9 9.4 0 11.2M8 2.4c-1.9 1.8-1.9 9.4 0 11.2" />
    </>
  ),
};

/** A card's icon on the tinted rounded badge. --accent-tint is the token
 * globals.css defines for exactly this tinted-chip treatment; on dark
 * bands the equivalent tint of the bright accent is hardcoded the same
 * way the dark bands' cyan washes already are (rgba(53,214,232,...) in
 * pricing/persona sections). */
function IconBadge({ dark, icon }: { dark: boolean; icon?: string }) {
  const glyph = icon ? ICON_PATHS[icon] : undefined;
  return (
    <span
      aria-hidden="true"
      className="mb-4 inline-flex h-[38px] w-[38px] items-center justify-center rounded-[11px]"
      style={{
        background: dark ? "rgba(53,214,232,.12)" : "var(--accent-tint)",
      }}
    >
      {glyph ? (
        <svg
          viewBox="0 0 16 16"
          width={20}
          height={20}
          aria-hidden="true"
          className="flex-none"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: dark ? "var(--accent)" : "var(--accent-light)" }}
        >
          {glyph}
        </svg>
      ) : (
        <CheckIcon dark={dark} size={20} />
      )}
    </span>
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
                          {(section.points ?? []).map((point) => (
                            <li key={point} className="flex gap-3">
                              <CheckIcon dark={dark} className="mt-[4px]" />
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
                    /* CARD GRID: centered head, one feature card per entry,
                       each with its own icon. A section that still carries
                       plain `points` (an older Sanity doc) renders them as
                       cards with the check fallback. */
                    (() => {
                      const cards =
                        section.cards ??
                        (section.points ?? []).map((text) => ({
                          icon: undefined,
                          text,
                        }));
                      return (
                        <>
                          <div className="mx-auto max-w-[760px] text-center [&_p]:mx-auto">
                            <SectionIntro section={section} dark={dark} />
                          </div>
                          <div
                            className={cn(
                              "mt-11 grid grid-cols-1 gap-5",
                              cards.length > 4
                                ? "kx-sm:grid-cols-2 kx-lg:grid-cols-3"
                                : "kx-md:grid-cols-2",
                            )}
                          >
                            {cards.map((cardItem) => (
                              <div
                                key={cardItem.text}
                                className={cn(
                                  "rounded-[18px] p-[26px_24px]",
                                  dark
                                    ? "border border-[rgba(255,255,255,.1)] bg-[rgba(255,255,255,.035)]"
                                    : "border border-border bg-surface shadow-[0_1px_3px_rgba(12,18,32,.05)]",
                                )}
                              >
                                <IconBadge dark={dark} icon={cardItem.icon} />
                                <p
                                  className={cn(
                                    "text-[16px] leading-[1.55] text-pretty",
                                    dark ? "text-on-dark-3" : "text-ink-2",
                                  )}
                                >
                                  {cardItem.text}
                                </p>
                              </div>
                            ))}
                          </div>
                        </>
                      );
                    })()
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
