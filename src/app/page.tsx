import Nav from "@/components/Nav";
import HeroBackdrop from "@/components/HeroBackdrop";
import AsteriskMark from "@/components/AsteriskMark";
import Button from "@/components/Button";
import Eyebrow from "@/components/Eyebrow";
import SectionHead from "@/components/SectionHead";
import LogoStrip from "@/components/LogoStrip";
import PersonaCard from "@/components/PersonaCard";
import StepCards from "@/components/StepCards";
import ShowcaseCycler from "@/components/ShowcaseCycler";
import PillarCards from "@/components/PillarCards";
import PricingSection from "@/components/PricingSection";
import { Faq } from "@/components/Faq";
import Footer from "@/components/Footer";
import { home } from "@/content/home";
import { settings } from "@/content/settings";
import { renderWithGradient } from "@/lib/renderWithGradient";
import { cn } from "@/lib/cn";

/**
 * Workflow-grid icon glyphs (Section 5, "fits how you already work"),
 * recovered verbatim from `design-reference/KINECT Marketing Site.dc.html`
 * (~line 551-558: the `W` icon-path table and per-item colors feeding
 * `workflowTop`/`workflowBottom`). `home.showcase.workflow` (a flat
 * `Card[]`) has no icon field of its own, so this table is index-keyed to
 * that array in source order (0-2 render in the 3-col top row, 3-4 in the
 * 2-col bottom row), the same convention StepCards/PillarCards already use
 * for their own icon tables.
 */
const WORKFLOW_ICONS: { paths: string[]; color: string }[] = [
  { paths: ["M13 2L4 14h7l-1 8 9-12h-7z"], color: "#F0913A" },
  { paths: ["M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"], color: "#35D6E8" },
  { paths: ["M12 3l9 5-9 5-9-5z", "M3 12l9 5 9-5"], color: "#C7A0C0" },
  { paths: ["M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2", "M9 7a4 4 0 100 8 4 4 0 000-8z"], color: "#35D6E8" },
  { paths: ["M12 3l7 3v6c0 4.2-2.9 7.4-7 9-4.1-1.6-7-4.8-7-9V6z", "M9 12l2 2 4-4"], color: "#0E9E6E" },
];

function WorkflowIcon({ paths, color }: { paths: string[]; color: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={20}
      height={20}
      fill="none"
      stroke={color}
      strokeWidth={2}
      aria-hidden="true"
      className="flex-none"
    >
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

function WorkflowCell({
  title,
  body,
  icon,
  divider,
}: {
  title: string;
  body: string;
  icon: { paths: string[]; color: string };
  /** Right-hand divider, desktop only (kx-md+); the last cell in each row has none. */
  divider: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center p-[34px_26px] text-center",
        divider && "kx-md:border-r kx-md:border-[rgba(255,255,255,.08)]",
      )}
    >
      <div className="mb-4 flex h-[42px] w-[42px] items-center justify-center rounded-[11px] bg-[rgba(255,255,255,.07)]">
        <WorkflowIcon paths={icon.paths} color={icon.color} />
      </div>
      <h3 className="mb-2 font-display text-[21px] font-bold text-on-dark">{title}</h3>
      <p className="max-w-[250px] text-[15px] leading-[1.5] text-on-dark-4">{body}</p>
    </div>
  );
}

/**
 * The real KINECT home page (design-reference/README.md "Home Page"
 * sections 1-9). Replaces the earlier component-verification scaffold
 * entirely -- see git history for that prior version of this file.
 *
 * Section rhythm alternates dark/light per README's own framing ("that
 * rhythm is the primary structural device"): hero(dark) -> logo
 * strip(dark) -> persona selector(light) -> how it works(dark) ->
 * showcase(dark) -> pillars(light) -> pricing(light) -> FAQ(light) ->
 * closing(dark). This is the README's documented order; the prototype file
 * itself renders pricing and FAQ on the dark canvas instead, a known
 * prototype/handoff discrepancy already resolved in PricingSection's own
 * doc comment (and Faq.tsx's light-only styling) in favor of README, so
 * this page follows suit for both.
 *
 * Section padding uses the shared `.kx-sec` (light/dark rhythm sections)
 * and `.kx-hero-sec`/`.kx-closing-sec` (the two kx-grid bookends) cascade
 * classes in globals.css -- plain max-width media queries at 1024/860/480,
 * matching the pre-existing `.kx-section-head` convention. Grid column
 * counts instead use the new kx-sm/kx-md/kx-lg Tailwind breakpoints (see
 * globals.css `@theme` block) added in this same task for exactly this
 * purpose.
 */
export default function Home() {
  return (
    <>
      <Nav />

      {/* 1 - HERO (dark). Parent carries `.kx-grid` per HeroBackdrop's own
          JSDoc contract; content is `relative z-10` so it paints above the
          orbs/traces (z-0) HeroBackdrop renders. Deliberately no product
          screenshot -- README is explicit that one was tried and removed. */}
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

          <h1 className="kx-hero-head max-w-[920px] font-display text-on-dark">
            {renderWithGradient(home.hero.headline, home.hero.gradientPhrase)}
          </h1>
          <p className="kx-hero-sub mt-[26px] max-w-[560px] text-on-dark-4">
            {home.hero.subhead}
          </p>

          <div className="kx-ctarow mt-[30px]">
            <Button variant="primary" size="lg" href="/">
              {home.hero.primaryCta} <span aria-hidden="true">{"→"}</span>
            </Button>
            <Button variant="ghost" size="lg" href="/">
              {home.hero.secondaryCta}
            </Button>
          </div>
        </div>
      </section>

      {/* 2 - CUSTOMER LOGO STRIP (dark). No real customer logos exist yet
          (README "Assets -> Customer logos" + "Gaps" #5): LogoStrip returns
          null until some are supplied, so nothing renders here today. Keep
          the mount -- it is not dead code, it is the real Section 2 waiting
          on real logos, per the README's own instruction not to ship it
          empty rather than to omit it. */}
      <LogoStrip eyebrow={home.logoStrip.eyebrow} />

      {/* 3 - PERSONA SELECTOR (light, "Pick your lane"). */}
      <section className="kx-sec bg-light-canvas">
        <div className="mx-auto max-w-[1180px]">
          <div className="kx-intro-row mb-14">
            <div className="kx-intro-title">
              <Eyebrow context="light" className="mb-4 block">
                {home.personaSelector.eyebrow}
              </Eyebrow>
              <SectionHead context="light">{home.personaSelector.title}</SectionHead>
            </div>
            <p className="kx-intro-body text-[18px] leading-[1.6] text-ink-3">
              {home.personaSelector.intro}
            </p>
          </div>

          {/* 3-col grid: holds 3 columns from kx-md straight through to
              desktop, no kx-lg tier -- see the matching comment in
              PillarCards.tsx for the prototype evidence (dc.html's
              max-width:1024px block only overrides the literal
              `repeat(4,1fr)` selector, never `repeat(3,1fr)`). */}
          <div className="grid grid-cols-1 gap-4 kx-md:grid-cols-3">
            {home.personaCards.map((card) => (
              <PersonaCard key={card.persona} {...card} />
            ))}
          </div>
        </div>
      </section>

      {/* 4 - HOW IT WORKS (dark). The soft radial highlight behind the
          headline is recovered verbatim from dc.html's home "STEPS" instance
          (not part of HeroBackdrop's own orbs/traces contract, which is
          reserved for the hero/closing bookends). */}
      <section className="kx-sec relative overflow-hidden bg-dark-canvas">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(820px 520px at 50% 0%, rgba(53,214,232,.24), transparent 64%)",
          }}
        />
        <div className="relative mx-auto max-w-[1180px]">
          <div className="mb-[58px] text-center">
            <SectionHead context="dark">{home.stepsSection.title}</SectionHead>
            <p className="mx-auto mt-[18px] max-w-[560px] text-[19px] leading-[1.55] text-on-dark-4">
              {home.stepsSection.subhead}
            </p>
          </div>
          <StepCards steps={home.steps} />
        </div>
      </section>

      {/* 5 - PRODUCT SHOWCASE (dark). Screenshot/labels centerpiece first,
          then headline/subhead, then the workflow grid -- this order (not
          "headline first") is deliberate, matching dc.html's own home "ARC"
          instance exactly. */}
      <section className="kx-sec relative overflow-hidden bg-dark-canvas">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[520px]"
          style={{
            background:
              "radial-gradient(700px 420px at 22% 30%, rgba(236,82,66,.34), transparent 62%), radial-gradient(700px 420px at 78% 30%, rgba(53,214,232,.34), transparent 62%)",
          }}
        />
        <div className="relative mx-auto max-w-[1080px] text-center">
          <div className="mb-[54px]">
            <ShowcaseCycler labels={home.showcase.labels} />
          </div>

          <SectionHead context="dark">{home.showcase.title}</SectionHead>
          <p className="mx-auto mt-[18px] max-w-[580px] text-[19px] leading-[1.55] text-on-dark-4">
            {home.showcase.subhead}
          </p>

          <div className="mt-[70px] border-t border-[rgba(255,255,255,.08)]">
            <div className="grid grid-cols-1 kx-md:grid-cols-3">
              {home.showcase.workflow.slice(0, 3).map((item, i) => (
                <WorkflowCell
                  key={item.title}
                  title={item.title}
                  body={item.body}
                  icon={WORKFLOW_ICONS[i]}
                  divider={i < 2}
                />
              ))}
            </div>
            <div className="mx-auto grid max-w-[720px] grid-cols-1 border-t border-[rgba(255,255,255,.08)] kx-md:grid-cols-2">
              {home.showcase.workflow.slice(3, 5).map((item, i) => (
                <WorkflowCell
                  key={item.title}
                  title={item.title}
                  body={item.body}
                  icon={WORKFLOW_ICONS[i + 3]}
                  divider={i < 1}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6 - FEATURE PILLARS + bento (light). */}
      <section className="kx-sec bg-light-canvas">
        <div className="mx-auto max-w-[1180px]">
          <div className="kx-intro-row mb-14">
            <div className="kx-intro-title">
              <SectionHead context="light">{home.pillarsSection.title}</SectionHead>
            </div>
            <p className="kx-intro-body text-[18px] leading-[1.6] text-ink-3">
              {home.pillarsSection.intro}
            </p>
          </div>
          <PillarCards pillars={home.pillars} bento={home.bento} />
        </div>
      </section>

      {/* 7 - PRICING (light). PricingSection is a self-contained section
          (own kx-sec padding + light-canvas background). */}
      <PricingSection
        headline={settings.pricing.headline}
        supporting={settings.pricing.supporting}
        tiers={settings.pricing.tiers}
      />

      {/* 8 - FAQ (light). */}
      <section className="kx-sec bg-light-canvas">
        <div className="mx-auto max-w-[820px]">
          <SectionHead context="light" className="mb-[46px] text-center">
            {home.faqTitle}
          </SectionHead>
          <Faq items={home.faq} />
        </div>
      </section>

      {/* 9 - CLOSING CTA (dark). Same canvas contract as the hero (kx-grid +
          HeroBackdrop, content `relative z-10`).
          README (the value authority) says the closing section ends in "the
          CTA pair", but home.ts's `closing` content (per its own type
          comment in content/types.ts) has no CTA-label fields of its own --
          the persona-subdomain equivalent's `secondaryCta` is deliberately
          omitted for home, and dc.html's own home instance renders only one
          button. Resolving in README's favor: the pair reuses
          `home.hero.primaryCta`/`secondaryCta` ("Start free" / "View demo"),
          the same site-wide CTA labels the hero itself uses, at the "xl"
          size recovered for this section. */}
      <section className="kx-grid kx-closing-sec relative overflow-hidden">
        <HeroBackdrop />
        <div className="relative z-10 mx-auto max-w-[820px] text-center">
          <h2 className="kx-closing-head font-display text-on-dark">
            {renderWithGradient(home.closing.headline, home.closing.gradientPhrase)}
          </h2>
          <p className="kx-closing-sub mx-auto mt-[22px] mb-8 max-w-[760px] text-on-dark-3">
            {home.closing.subhead}
          </p>
          <div className="kx-ctarow">
            <Button variant="primary" size="xl" href="/">
              {home.hero.primaryCta} <span aria-hidden="true">{"→"}</span>
            </Button>
            <Button variant="ghost" size="xl" href="/">
              {home.hero.secondaryCta}
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
