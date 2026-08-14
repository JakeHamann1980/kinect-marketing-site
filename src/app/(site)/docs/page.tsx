import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import HeroBackdrop from "@/components/HeroBackdrop";
import SectionHead from "@/components/SectionHead";
import DraftNotice from "@/components/DraftNotice";
import { docsPage as page } from "@/content/draft/docs-page";
import { DRAFT_PAGES_ENABLED } from "@/lib/draft-pages";
import { renderWithGradient } from "@/lib/renderWithGradient";

export const revalidate = false;

/**
 * DRAFT docs index (user-directed 2026-08-03). See
 * src/content/draft/docs-page.ts for the open question this page does not
 * answer: what Docs is actually FOR. This renders the help-centre reading
 * of it -- category index, article titles, no article bodies -- so the
 * information architecture can be judged before anyone writes help content
 * for features that have not shipped.
 *
 * Categories are not links yet: routing to article pages that do not exist
 * would be worse than showing the shape honestly.
 */
export const metadata: Metadata = {
  title: page.seo.title,
  description: page.seo.description,
  robots: { index: false, follow: false },
};

export default function DocsPage() {
  if (!DRAFT_PAGES_ENABLED) notFound();

  return (
    <div>
      <DraftNotice>/docs is local-only, and its purpose is undecided</DraftNotice>
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

        <section className="kx-sec bg-light-canvas">
          <div className="mx-auto max-w-[1000px]">
            <div className="grid grid-cols-1 gap-[18px] kx-md:grid-cols-2">
              {page.categories.map((category) => (
                <div
                  key={category.title}
                  className="rounded-[18px] border border-border bg-surface p-[28px_26px]"
                >
                  <h2 className="font-display text-[19px] font-bold text-ink text-balance">
                    {category.title}
                  </h2>
                  <p className="mt-2 text-[15px] leading-[1.55] text-ink-3 text-pretty">
                    {category.body}
                  </p>
                  <ul className="mt-5 flex flex-col gap-2 border-t border-divider pt-4">
                    {category.articles.map((article) => (
                      <li
                        key={article}
                        className="text-[15px] leading-[1.5] text-ink-2 text-pretty"
                      >
                        {article}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="kx-sec bg-light-canvas-2">
          <div className="mx-auto max-w-[620px] text-center">
            <SectionHead context="light">{page.help.title}</SectionHead>
            <p className="mx-auto mt-4 text-[17px] leading-[1.6] text-ink-3 text-pretty">
              {page.help.body}
            </p>
            <a
              href="mailto:hello@kinectnow.com"
              className="mt-6 inline-block text-[16px] font-semibold text-accent-light underline-offset-4 hover:underline"
            >
              {page.help.cta}
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
