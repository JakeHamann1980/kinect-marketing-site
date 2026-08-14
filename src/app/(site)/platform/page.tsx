import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import HeroBackdrop from "@/components/HeroBackdrop";
import SectionHead from "@/components/SectionHead";
import WaitlistCta from "@/components/WaitlistCta";
import DraftNotice from "@/components/DraftNotice";
import { platformPage as page } from "@/content/draft/platform-page";
import { DRAFT_PAGES_ENABLED } from "@/lib/draft-pages";
import { renderWithGradient } from "@/lib/renderWithGradient";
import { cn } from "@/lib/cn";

export const revalidate = false;

/**
 * DRAFT product overview (user-directed 2026-08-03). The footer's "Platform"
 * column used to be five dead "#" links; it now points at this page's
 * section anchors, and both the column and this route are hidden on the
 * live site until Jake approves them.
 *
 * `notFound()` rather than an unlinked-but-reachable page: a half-approved
 * page sitting at a guessable URL is still public, still crawlable, and
 * still quotable by an AI answer engine.
 */
export const metadata: Metadata = {
  title: page.seo.title,
  description: page.seo.description,
  // Belt and braces -- the route 404s in production anyway, but any preview
  // deploy that enables drafts must not get indexed.
  robots: { index: false, follow: false },
};

export default function PlatformPage() {
  if (!DRAFT_PAGES_ENABLED) notFound();

  return (
    <div>
      <DraftNotice>/platform is local-only until approved</DraftNotice>
      <Nav />

      <main id="main">
        <section className="kx-grid kx-hero-sec relative overflow-hidden">
          <HeroBackdrop />
          <div className="relative z-10 mx-auto flex max-w-[1000px] flex-col items-center text-center">
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
              <div className="relative mx-auto max-w-[760px]">
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
              <WaitlistCta variant="primary" size="lg" trackLocation="platform-closing">
                {page.closing.cta} <span aria-hidden="true">{"→"}</span>
              </WaitlistCta>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
