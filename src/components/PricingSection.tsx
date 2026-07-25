import { type ButtonVariant } from "@/components/Button";
import TrackedLink from "@/components/TrackedLink";
import SectionHead from "@/components/SectionHead";
import type { Tier } from "@/content/types";
import { cn } from "@/lib/cn";

interface PricingSectionProps {
  headline: string;
  supporting: string;
  tiers: Tier[];
  /**
   * user-directed 2026-07-25: home and the persona subdomain pages want
   * different pricing tones. Home restores the prototype's dark treatment
   * (Jake: pillars -> pricing -> FAQ was three light sections in a row and
   * read as too much sameness); the persona pages keep the original light
   * treatment instead, since they're already dark-heavy through
   * capabilities/workflow/steps and, with their own pain section flipping
   * to light in this same change, a light pricing section balances their
   * rhythm better than a dark one would. Defaults to "light" (the
   * pre-existing, still-live behavior for every caller that doesn't
   * specify a tone).
   */
  tone?: "dark" | "light";
}

/**
 * Pricing section (design-reference/README.md "7. Pricing"). README places
 * this section in the light rhythm ("### 7. Pricing (light)"); the
 * prototype file actually renders the home page's pricing block on the
 * dark `.kx-grid` canvas (`KINECT Marketing Site.dc.html` ~line 341: "7 ·
 * PRICING (dark)"). Task 11 disclosed that conflict and picked light per
 * the README-wins precedent used elsewhere in this codebase.
 *
 * Jake has since split the decision per page (`tone` prop, above) rather
 * than picking one treatment site-wide: `tone="dark"` recovers the
 * prototype's dark card treatment verbatim from the shared `planRow`
 * helper (~line 592-596) -- the same function both the home page's
 * `homePlans` and every persona subpage's `sub.plans` call with no
 * persona-specific values:
 * - default tier card: bg rgba(255,255,255,.035), border
 *   rgba(255,255,255,.1), no shadow.
 * - popular tier card: bg rgba(53,214,232,.06), border
 *   rgba(53,214,232,.34), glow `0 0 50px rgba(53,214,232,.14)`. This cyan
 *   is a literal value in `planRow`, not persona-accent-driven (`sub.plans`
 *   calls the identical `planRow('...', ..., true)` on every persona
 *   subpage), so it stays cyan verbatim rather than inventing an
 *   accent-aware version the source never had -- moot in practice since
 *   only home uses `tone="dark"` today.
 * - popular CTA reuses Button's "primary" variant (bg on-dark, text
 *   #0B0F17), matching the prototype's `hi` branch exactly.
 * - default-tier CTA uses Button's "fill-dark" variant (bg
 *   rgba(255,255,255,.07), no border, on-dark text): the prototype's
 *   non-popular CTA genuinely differs from "ghost" (visible border, fully
 *   transparent background), so it earned its own variant instead of a
 *   ghost reuse.
 * - the section also carries the same `.kx-grid` texture + cyan radial
 *   wash the prototype's PRICING instance uses, consistent with every
 *   other dark section in this codebase carrying that texture (hero,
 *   capabilities, steps, closing).
 *
 * `tone="light"` (the default) is unchanged from Task 11: the same
 * light-card language PersonaCard/PillarCards use elsewhere, the Growth/
 * popular accent border + glow shadow value from the Task 11 brief itself
 * (`shadow-[0_8px_24px_rgba(41,169,224,.14)]`, not the prototype's dark
 * glow, since the brief specified it directly), "accent" for the popular
 * CTA, and "outline-light" for the default-tier CTA.
 *
 * `settings.pricing.note` ("Every plan includes the portal, analytics and
 * AI insights. Pricing varies slightly by lane.") is still deliberately
 * NOT rendered here in either tone: a 2026-07-25 product decision made
 * pricing a single shared table across all three lanes, which the "varies
 * slightly by lane" wording contradicts, so the note is stale and
 * intentionally omitted.
 */
export default function PricingSection({
  headline,
  supporting,
  tiers,
  tone = "light",
}: PricingSectionProps) {
  const dark = tone === "dark";

  return (
    <section className={cn("kx-sec relative overflow-hidden", dark ? "kx-grid" : "bg-light-canvas")}>
      {dark ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(780px 520px at 50% 100%, rgba(53,214,232,.24), transparent 64%)",
          }}
        />
      ) : null}
      <div className="relative mx-auto max-w-[1000px]">
        <div className="text-center">
          <SectionHead context={dark ? "dark" : "light"}>{headline}</SectionHead>
          <p
            className={cn(
              "mx-auto mt-4 max-w-[520px] text-[19px] leading-[1.55]",
              dark ? "text-on-dark-4" : "text-ink-3",
            )}
          >
            {supporting}
          </p>
        </div>

        {/* 3-col grid: holds 3 columns from kx-md straight through to
            desktop, no kx-lg tier -- see the matching comment in
            PillarCards.tsx for the prototype evidence (dc.html's
            max-width:1024px block only overrides the literal
            `repeat(4,1fr)` selector, never `repeat(3,1fr)`). */}
        <div className="mt-[50px] grid grid-cols-1 gap-[18px] kx-md:grid-cols-3">
          {tiers.map((tier) => {
            const cardClass = dark
              ? tier.popular
                ? "flex flex-col rounded-[18px] border border-[rgba(53,214,232,.34)] bg-[rgba(53,214,232,.06)] p-[30px_28px] shadow-[0_0_50px_rgba(53,214,232,.14)]"
                : "flex flex-col rounded-[18px] border border-[rgba(255,255,255,.1)] bg-[rgba(255,255,255,.035)] p-[30px_28px]"
              : tier.popular
                ? "flex flex-col rounded-[18px] border border-accent-light bg-surface p-[30px_28px] shadow-[0_8px_24px_rgba(41,169,224,.14)]"
                : "flex flex-col rounded-[18px] border border-border bg-surface p-[30px_28px]";
            const tagClass = dark ? (tier.popular ? "text-cyan" : "text-on-dark-5") : "text-accent-light";
            const headingClass = dark ? "text-on-dark" : "text-ink";
            const bodyClass = dark ? "text-on-dark-3" : "text-ink-2";
            const moClass = dark ? "text-on-dark-4" : "text-muted";
            const ctaVariant: ButtonVariant = tier.popular
              ? dark
                ? "primary"
                : "accent"
              : dark
                ? "fill-dark"
                : "outline-light";

            return (
              <div key={tier.name} className={cardClass}>
                <div
                  className={cn(
                    "mb-[10px] h-[16px] font-mono text-[11px] uppercase tracking-[.14em]",
                    tagClass,
                  )}
                >
                  {tier.popular ? "Most popular" : ""}
                </div>
                <div className={cn("font-display text-[21px] font-bold text-balance", headingClass)}>
                  {tier.name}
                </div>
                <div className={cn("mt-2 mb-1 font-display text-[42px] font-bold", headingClass)}>
                  {"$" + tier.price}
                  <span className={cn("text-[16px] font-medium", moClass)}>/mo</span>
                </div>
                <ul
                  className={cn(
                    "mb-[22px] flex flex-col gap-2 text-[16px] leading-[1.55] text-pretty",
                    bodyClass,
                  )}
                >
                  {tier.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>

                <div className="mt-auto">
                  {/* Placeholder destination: checkout/signup routing is
                      wired up in a later task (same "/" placeholder
                      convention as Nav's primary CTA).
                      Task 15: PricingSection is a Server Component, so the
                      click handler goes through TrackedLink (see its doc
                      comment) rather than Button directly. Fires both the
                      generic cta_clicked{location:"pricing"} (this is one
                      of the task brief's named trackLocation call sites)
                      AND the tier-specific pricing_tier_clicked -- a
                      rollup "any CTA click" metric plus the more precise
                      "which tier" one, not a duplicate of the same signal. */}
                  <TrackedLink
                    variant={ctaVariant}
                    href="/"
                    className="w-full justify-center"
                    trackLocation="pricing"
                    event="pricing_tier_clicked"
                    eventProps={{ tier: tier.name }}
                  >
                    {tier.cta}
                  </TrackedLink>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
