import Lockup from "@/components/Lockup";
import Button from "@/components/Button";
import Eyebrow from "@/components/Eyebrow";
import SectionHead from "@/components/SectionHead";
import Nav from "@/components/Nav";
import HeroBackdrop from "@/components/HeroBackdrop";
import { Faq } from "@/components/Faq";
import ShowcaseCycler from "@/components/ShowcaseCycler";
import PersonaCard from "@/components/PersonaCard";
import StepCards from "@/components/StepCards";
import PillarCards from "@/components/PillarCards";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";
import { home } from "@/content/home";
import { settings } from "@/content/settings";

// NOTE: this page remains placeholder content for verifying Task 6's shared
// primitives (Lockup, Button, Eyebrow, SectionHead), Task 7's Nav, and
// Task 8's HeroBackdrop (grid/orbs/traces). It will be replaced by the real
// home page in Task 12.
export default function Home() {
  return (
    <>
      <Nav />
      {/*
        Task 8 verification section: the parent carries `.kx-grid` itself
        (background-color + background-image only -- never a `background`
        shorthand here, see globals.css) and is `position: relative` so
        HeroBackdrop's absolute container fills it. Content below is given
        `relative z-10` so it paints above the orbs/traces.
      */}
      <section className="kx-grid relative overflow-hidden">
        <HeroBackdrop />
        <main className="relative z-10 flex flex-1 flex-col items-center gap-4 px-6 py-32 text-center">
          <h1 className="font-display text-4xl font-bold">
            Built for the <span className="kx-grad">agentic</span> era
          </h1>
          <p className="max-w-xl text-on-dark-2">
            Design tokens and self-hosted fonts are wired up. This placeholder
            page will be replaced in a later task.
          </p>

          <section className="mt-16 flex w-full max-w-3xl flex-col items-center gap-6 rounded-2xl border border-rule bg-dark-panel px-8 py-10">
            <Eyebrow context="dark">Dark context primitives</Eyebrow>
            <Lockup />
            <SectionHead context="dark">Section headline on dark</SectionHead>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button variant="primary" href="/">
                Start free
              </Button>
              <Button variant="ghost" href="/">
                Ghost button
              </Button>
            </div>
          </section>

          <section className="flex w-full max-w-3xl flex-col items-center gap-6 rounded-2xl border border-border bg-surface px-8 py-10 text-ink">
            <Eyebrow context="light">Light context primitives</Eyebrow>
            <SectionHead context="light">Section headline on light</SectionHead>
            <Button variant="accent" href="/">
              Accent button
            </Button>
          </section>

          {/*
            Task 9 verification block: placeholder-until-Task-12. Renders
            the real home FAQ copy through the new Faq accordion so it's
            eyeballable against the design reference; will be folded into
            the real home page layout in Task 12.
          */}
          <section className="w-full max-w-3xl rounded-2xl border border-border bg-surface px-8 py-10 text-left text-ink">
            <Eyebrow context="light">FAQ accordion (Task 9 placeholder)</Eyebrow>
            <div className="mt-4">
              <Faq items={home.faq} />
            </div>
          </section>
        </main>
      </section>

      {/*
        Task 10 verification section: placeholder-until-Task-12. Mounts
        ShowcaseCycler on a dark canvas (the frame/glow treatment assumes
        the dark section background it lives in per the design reference)
        so the cross-fade, pinning, and glow are eyeballable ahead of the
        real home page layout landing in Task 12.
      */}
      <section className="bg-dark-canvas px-6 py-24">
        <Eyebrow context="dark">Showcase cycler (Task 10 placeholder)</Eyebrow>
        <div className="mt-10">
          <ShowcaseCycler labels={home.showcase.labels} />
        </div>
      </section>

      {/*
        Task 11 verification section: placeholder-until-Task-12. Persona
        cards on a light canvas so the icon tile tint/CTA are eyeballable
        against the reference; will be folded into the real home page
        layout (with the persona-selector intro row) in Task 12.
      */}
      <section className="bg-light-canvas px-6 py-24">
        <Eyebrow context="light">Persona cards (Task 11 placeholder)</Eyebrow>
        <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-3">
          {home.personaCards.map((card) => (
            <PersonaCard key={card.persona} {...card} />
          ))}
        </div>
      </section>

      {/*
        Task 11 verification section: placeholder-until-Task-12. Steps grid
        on a dark canvas, per the design reference's "How it works" section.
      */}
      <section className="bg-dark-canvas px-6 py-24">
        <Eyebrow context="dark">Step cards (Task 11 placeholder)</Eyebrow>
        <div className="mx-auto mt-10 max-w-5xl">
          <StepCards steps={home.steps} />
        </div>
      </section>

      {/*
        Task 11 verification section: placeholder-until-Task-12. Pillar
        cards plus the bento sub-layout, and the pricing table, on a light
        canvas per the design reference's rhythm.
      */}
      <section className="bg-light-canvas px-6 py-24">
        <Eyebrow context="light">Pillar cards + bento (Task 11 placeholder)</Eyebrow>
        <div className="mx-auto mt-10 max-w-5xl">
          <PillarCards pillars={home.pillars} bento={home.bento} />
        </div>
      </section>

      <PricingSection
        headline={settings.pricing.headline}
        supporting={settings.pricing.supporting}
        tiers={settings.pricing.tiers}
      />

      {/*
        Task 11 verification: real Footer at the bottom of the placeholder
        page (not wrapped in an eyebrow/section shell like the blocks
        above -- the footer is a page-level landmark, not a demo card).
      */}
      <Footer />
    </>
  );
}
