import type { ReactNode } from "react";
import Image from "next/image";
import Nav from "@/components/Nav";
import HeroBackdrop from "@/components/HeroBackdrop";
import AsteriskMark from "@/components/AsteriskMark";
import TrackedLink from "@/components/TrackedLink";
import WaitlistCta from "@/components/WaitlistCta";
import Eyebrow from "@/components/Eyebrow";
import SectionHead from "@/components/SectionHead";
import StepCards from "@/components/StepCards";
import PricingSection from "@/components/PricingSection";
import { Faq } from "@/components/Faq";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { fetchSettings } from "@/lib/sanity";
import { renderWithGradient } from "@/lib/renderWithGradient";
import type { PersonaPageContent } from "@/content/types";
import { cn } from "@/lib/cn";
import { faqPageLd } from "@/lib/jsonld";

interface PersonaPageProps {
  content: PersonaPageContent;
}

/**
 * Small mono eyebrow tinted in the current page's persona accent, used for
 * the hero label, the capabilities intro ("Built for the way you work"),
 * and the workflow/templates eyebrow. Recovered from `KINECT Marketing
 * Site.dc.html`'s shared inline style for these three labels
 * (`color:{{ sub.accent }}`, ~lines 374/405/422). A bespoke local
 * component rather than a new prop on the shared `Eyebrow` (which only
 * takes a "dark"/"light" `context` today): `Eyebrow`'s color comes from a
 * Tailwind utility class, and a caller-supplied override class has no
 * reliable way to win the cascade against it (same-specificity utilities;
 * see `cn`'s own "additive only" doc comment), so the accent color is set
 * via inline `style` against the `--accent` CSS var directly instead,
 * which no class can be shadowed by. Size/tracking match Eyebrow's own
 * 11px scale (README "Typography": "eyebrow / mono 11px uppercase, .14em
 * tracking") rather than the prototype's inconsistent inline 14px, per the
 * established README-wins-conflicts precedent used throughout this
 * codebase.
 */
function AccentEyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn("block font-mono text-[11px] uppercase tracking-[.14em]", className)}
      style={{ color: "var(--accent)" }}
    >
      {children}
    </span>
  );
}

/**
 * Persona subdomain page template (design-reference/README.md "Persona
 * Subdomain Pages"), shared by the `/agency`, `/coach` and `/consultant`
 * routes. Reuses the exact section-level components/patterns Task 12
 * proved out on the home page (Nav, HeroBackdrop, Button, SectionHead,
 * StepCards, PricingSection, Faq, Footer), substituting persona-specific
 * copy from `content`.
 *
 * `data-persona={content.persona}` sits on the page's own root element (a
 * plain wrapping `<div>` -- home has no equivalent root since it needs no
 * such attribute and renders a bare fragment instead) so the
 * `[data-persona="..."]` rules in globals.css rebind `--accent`/
 * `--accent-light`/`--accent-tint` for this entire subtree. Every consumer
 * that already reads those vars picks up the right persona color
 * automatically with no per-page wiring: Lockup/AsteriskMark's own
 * `var(--accent)` default (the nav mark, the hero badge), Nav's persona
 * badge, and this file's own `AccentEyebrow`/gradient-dot accents.
 *
 * Section order (README "Persona Subdomain Pages", "same section order"
 * across all three persona pages), each numbered per the brief:
 *   1. Hero (dark, kx-grid + HeroBackdrop)         -- same structure as
 *      home's hero, plus `heroExtra`'s accent eyebrow above the headline
 *      and its two proof-point checkmarks below the CTA row (recovered
 *      from the prototype's sub-page hero instance, ~line 370-381). No
 *      hero screenshot, matching the brief's explicit "same structure as
 *      home" instruction (home's hero deliberately has none either) even
 *      though the prototype's own two-column sub-page hero variant does
 *      show one -- that image reappears framed in section 3+4 below via
 *      `content.screenshot`, so repeating it in the hero would be
 *      redundant, and the brief is explicit that this section should
 *      match home's structure.
 *   2. Pain                                         -- LIGHT section
 *      (user-directed 2026-07-25, see the section's own inline comment
 *      below for the full rationale). Not in README's own numbered
 *      persona-page list, but present in every sub-page instance in the
 *      prototype (`KINECT Marketing Site.dc.html` "PAIN", ~line 391)
 *      directly after the hero and before "Built for the way you work" --
 *      originally recovered there as a dark quiet-card treatment;
 *      `content.pain` is real, approved copy with no other section to
 *      render in, so it keeps its own section here regardless of tone.
 *   3+4. Capabilities ("Built for the way you work") + product screenshot
 *      -- one continuous dark `kx-grid`-textured section in the
 *      prototype's own FEATURES instance (~line 402-417: the capability
 *      cards and the framed screenshot share one wrapping div with no
 *      divider between them), kept as one section here for the same
 *      reason. The screenshot reuses ShowcaseCycler's own
 *      `.kx-shot-frame`/`.kx-shot-glow` classes (globals.css) rather than
 *      duplicating that CSS, just with a single static `next/image` in
 *      place of the cycling three-layer stack.
 *   5. Workflow / templates                         -- flat dark canvas
 *      (no kx-grid), eyebrow + title + subhead + a flat-wrapped row of
 *      template/program/engagement chips.
 *   6. Steps ("Live in ten minutes, not ten days")    -- dark `kx-grid`
 *      texture + the same `StepCards` component/treatment the home page
 *      uses (including its Jake-directed colored card treatment), per the
 *      brief's explicit "StepCards with content.steps" instruction.
 *   7. Pricing                                       -- the shared,
 *      self-contained `PricingSection` (same three tiers as home), left at
 *      its default `tone="light"` (user-directed 2026-07-25: home passes
 *      `tone="dark"` instead -- see PricingSection.tsx's own doc comment --
 *      but the persona pages are already dark-heavy through capabilities/
 *      workflow/steps, and with the pain section above flipping to light,
 *      a light pricing section balances the rhythm better here than a
 *      dark one would).
 *   8. FAQ                                            -- light section
 *      using the same `Faq` accordion as home. `PersonaPageContent` has
 *      no section-title field of its own (unlike home's `faqTitle`) since
 *      persona FAQs were a new, approved addition with no equivalent
 *      title in the design source (see content/types.ts's own doc
 *      comment) -- a small generic "FAQ" eyebrow anchors the section
 *      without inventing marketing copy the content contract doesn't
 *      carry.
 *   9. Closing                                       -- same treatment as
 *      home's closing (kx-grid + HeroBackdrop + gradient headline +
 *      subhead), plus `content.closing.secondaryCta` ("Not you? Pick
 *      another lane") as a second, ghost-styled button routing back to
 *      "/" (home's persona picker). The primary button reuses
 *      `content.hero.primaryCta` ("Start free") since, like home's own
 *      closing section, `PersonaPageContent["closing"]` carries no primary
 *      CTA label of its own -- the same resolution the home page's closing
 *      section already documents for the identical gap.
 *
 * Task 18 (Seed Script + Page Wiring + Revalidation): `content` (the page
 * body -- hero, pain, capabilities, workflow, steps, FAQ, closing) is
 * fetched by the caller (`fetchPersona`, see src/app/(site)/agency|coach|
 * consultant/page.tsx) and passed in as before; `settings.pricing` (section
 * 7 below) is fetched here directly instead, the same self-contained
 * approach Footer.tsx takes, since all three persona routes share this one
 * template and would otherwise each need to duplicate the same
 * `fetchSettings()` call and prop.
 */
export default async function PersonaPage({ content }: PersonaPageProps) {
  const settings = await fetchSettings();

  return (
    <div data-persona={content.persona}>
      {/* Task 20: FAQPage JSON-LD for this persona's own FAQ section (spec
          §8b: "FAQPage on every page with FAQs"). Shared here (not
          duplicated per agency/coach/consultant route) since all three
          persona routes render through this one template. */}
      <JsonLd data={faqPageLd(content.faq)} />
      <Nav badge={content.navBadge} />

      {/* Fix (final review, M7): `<main id="main">` -- see the matching
          comment in (site)/page.tsx for why this landmark excludes both
          Nav and Footer. */}
      <main id="main">
      {/* 1 - HERO (dark) */}
      <section className="kx-grid kx-hero-sec relative overflow-hidden">
        <HeroBackdrop />
        <div className="relative z-10 mx-auto flex max-w-[1000px] flex-col items-center text-center">
          <div className="mb-[34px] flex w-full items-center justify-center">
            <span
              className="kx-hero-badge flex flex-none items-center justify-center rounded-full bg-[#EEF2F8]"
              style={{ boxShadow: "0 0 60px rgba(255,255,255,.22), 0 10px 30px rgba(0,0,0,.35)" }}
            >
              <AsteriskMark size={38} stroke="#0B0F17" />
            </span>
          </div>

          <AccentEyebrow className="mb-4">{content.heroExtra.eyebrow}</AccentEyebrow>

          <h1 className="kx-hero-head max-w-[920px] font-display text-on-dark">
            {renderWithGradient(content.hero.headline, content.hero.gradientPhrase)}
          </h1>
          <p className="kx-hero-sub mt-[26px] max-w-[560px] text-on-dark-4">
            {content.hero.subhead}
          </p>

          <div className="kx-ctarow mt-[30px]">
            {/* Task 15: this page is a Server Component -- TrackedLink is
                the client boundary that lets these CTAs fire
                cta_clicked{location:"hero"} (see its own doc comment).
                Task 16: the primary "Start free" CTA now opens the
                waitlist dialog instead (WaitlistCta) -- see
                WaitlistCta.tsx's own doc comment. */}
            <WaitlistCta variant="primary" size="lg" trackLocation="hero">
              {content.hero.primaryCta} <span aria-hidden="true">{"→"}</span>
            </WaitlistCta>
            {/* user-directed 2026-07-25: "Watch the 2-min tour" opens the
                waitlist (no tour video exists yet), same as home's View
                demo. The closing "Not you? Pick another lane" below stays
                real navigation back to the persona picker. */}
            <WaitlistCta variant="ghost" size="lg" trackLocation="hero">
              {content.hero.secondaryCta}
            </WaitlistCta>
          </div>

          <div className="mt-[30px] flex flex-wrap items-center justify-center gap-[26px] text-[15px] text-on-dark-4">
            <span>{"✓ " + content.heroExtra.proofPoints[0]}</span>
            <span>{"✓ " + content.heroExtra.proofPoints[1]}</span>
          </div>
        </div>
      </section>

      {/* 2 - PAIN (light).
          user-directed 2026-07-25: light treatment chosen over the
          prototype's dark quiet-card version (originally recovered from
          KINECT Marketing Site.dc.html's PAIN instance, ~line 391-399:
          bg rgba(255,255,255,.03), border rgba(255,255,255,.09), a coral
          "✕" mark). user-directed 2026-07-25: Jake asked for this section
          to flip to light so the page doesn't stack five dark sections in a row right after the
          hero (pain -> capabilities+screenshot -> workflow -> steps ->
          [pricing, itself staying light on persona pages -- see section 7
          below]); a light section directly under the hero restores some
          alternation early in the page. Converted to the established
          light-card language PersonaCard/PillarCards already use
          elsewhere: bg-light-canvas section, white surface cards,
          border-border, 18px radius, the standard
          shadow-[0_1px_3px_rgba(12,18,32,.05)] card shadow, ink text
          colors. The prototype has no light-context precedent for the "✕"
          pain marks (they only ever appear on its dark PAIN instance), so
          they're recolored to --coral-light (#C4501F) here, the same
          light-context red-family token this codebase uses elsewhere --
          a disclosed choice, not a recovered one. */}
      <section className="kx-sec bg-light-canvas">
        <div className="mx-auto max-w-[1180px]">
          <SectionHead context="light" className="max-w-[780px]">
            {content.pain.title}
          </SectionHead>
          <div className="mt-10 grid grid-cols-1 gap-5 kx-md:grid-cols-3">
            {content.pain.cards.map((card) => (
              <div
                key={card.title}
                className="rounded-[18px] border border-border bg-surface p-[32px_30px] shadow-[0_1px_3px_rgba(12,18,32,.05)]"
              >
                <div aria-hidden="true" className="mb-3 text-[20px] text-coral-light">
                  {"✕"}
                </div>
                <h3 className="mb-[9px] font-display text-[21px] font-bold text-ink">
                  {card.title}
                </h3>
                <p className="text-[16px] leading-[1.55] text-ink-3">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3+4 - CAPABILITIES ("Built for the way you work") + PRODUCT
          SCREENSHOT (dark, kx-grid texture). One continuous section,
          matching the prototype's own FEATURES instance. */}
      <section className="kx-grid kx-sec relative overflow-hidden border-t border-[rgba(255,255,255,.06)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[520px]"
          style={{
            background: "radial-gradient(760px 500px at 92% 6%, rgba(53,214,232,.13), transparent 62%)",
          }}
        />
        <div className="relative mx-auto max-w-[1180px]">
          <AccentEyebrow className="mb-[14px]">{content.capabilities.intro}</AccentEyebrow>
          <SectionHead context="dark" className="mb-10">
            {content.capabilities.title}
          </SectionHead>

          <div className="mb-11 grid grid-cols-1 gap-5 kx-md:grid-cols-3">
            {content.capabilities.cards.map((card) => (
              <div
                key={card.title}
                className="rounded-[18px] border border-[rgba(255,255,255,.1)] bg-[rgba(255,255,255,.035)] p-[30px_28px]"
              >
                <h3 className="mb-[10px] kx-card-title font-display font-bold text-on-dark">
                  {card.title}
                </h3>
                <p className="text-[17px] leading-[1.55] text-on-dark-3">{card.body}</p>
              </div>
            ))}
          </div>

          <div className="relative z-0 mx-auto max-w-[880px]">
            <div aria-hidden="true" className="kx-shot-glow" />
            <div className="kx-shot-frame">
              <div className="relative" style={{ aspectRatio: "2962 / 1996" }}>
                <Image
                  src={content.screenshot.src}
                  alt={content.screenshot.alt}
                  fill
                  sizes="(max-width: 860px) 100vw, 880px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
          <p className="mt-4 text-center text-[15px] text-on-dark-4">
            {content.screenshot.caption}
          </p>
        </div>
      </section>

      {/* 5 - WORKFLOW / TEMPLATES (dark, flat canvas) */}
      <section className="kx-sec border-t border-[rgba(255,255,255,.06)] bg-dark-canvas">
        <div className="mx-auto max-w-[1180px]">
          <AccentEyebrow className="mb-[14px]">{content.workflow.eyebrow}</AccentEyebrow>
          <SectionHead context="dark" className="mb-4">
            {content.workflow.title}
          </SectionHead>
          <p className="mb-9 max-w-[640px] text-[19px] leading-[1.55] text-on-dark-4">
            {content.workflow.subhead}
          </p>
          <div className="flex flex-wrap gap-3">
            {content.workflow.items.map((item) => (
              <span
                key={item}
                className="rounded-[30px] border border-[rgba(255,255,255,.12)] bg-[rgba(255,255,255,.05)] px-[22px] py-3 text-[17px] text-on-dark-2"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 6 - STEPS ("Live in ten minutes, not ten days") (dark, kx-grid
          texture). Same StepCards component/treatment as home. */}
      <section className="kx-grid kx-sec relative overflow-hidden border-t border-[rgba(255,255,255,.06)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(700px 460px at 8% 100%, rgba(236,82,66,.16), transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-[1180px]">
          <SectionHead context="dark" className="mb-[44px]">
            {content.steps.title}
          </SectionHead>
          <StepCards steps={content.steps.items} />
        </div>
      </section>

      {/* 7 - PRICING (light). Shared, self-contained section. */}
      <PricingSection
        headline={settings.pricing.headline}
        supporting={settings.pricing.supporting}
        tiers={settings.pricing.tiers}
      />

      {/* 8 - FAQ (light). Same Faq accordion as home; see this file's own
          top-level doc comment for why the section uses a generic "FAQ"
          eyebrow rather than a fabricated title. */}
      <section className="kx-sec bg-light-canvas">
        <div className="mx-auto max-w-[820px]">
          <Eyebrow context="light" className="mb-4 block text-center">
            FAQ
          </Eyebrow>
          <Faq items={content.faq} />
        </div>
      </section>

      {/* 9 - CLOSING (dark). Same treatment as home's closing (kx-grid +
          HeroBackdrop + gradient headline), plus the persona secondary CTA
          routing back to the home persona picker. */}
      <section className="kx-grid kx-closing-sec relative overflow-hidden">
        <HeroBackdrop />
        <div className="relative z-10 mx-auto max-w-[820px] text-center">
          <h2 className="kx-closing-head font-display text-on-dark">
            {renderWithGradient(content.closing.headline, content.closing.gradientPhrase)}
          </h2>
          <p className="kx-closing-sub mx-auto mt-[22px] mb-8 max-w-[760px] text-on-dark-3">
            {content.closing.subhead}
          </p>
          <div className="kx-ctarow">
            {/* Task 16: same "Start free" -> WaitlistCta swap as the hero
                pair above. "Not you? Pick another lane" is not "Start
                free"-labeled and keeps navigating. */}
            <WaitlistCta variant="primary" size="xl" trackLocation="closing">
              {content.hero.primaryCta} <span aria-hidden="true">{"→"}</span>
            </WaitlistCta>
            <TrackedLink variant="ghost" size="xl" href="/" trackLocation="closing">
              {content.closing.secondaryCta}
            </TrackedLink>
          </div>
        </div>
      </section>
      </main>

      <Footer />
    </div>
  );
}
