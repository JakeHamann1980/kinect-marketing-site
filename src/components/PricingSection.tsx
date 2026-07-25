import Button from "@/components/Button";
import SectionHead from "@/components/SectionHead";
import type { Tier } from "@/content/types";

interface PricingSectionProps {
  headline: string;
  supporting: string;
  tiers: Tier[];
}

/**
 * Pricing section (design-reference/README.md "7. Pricing"). README places
 * this section in the light rhythm ("### 7. Pricing (light)"); the
 * prototype file actually renders the home page's pricing block on the
 * dark `.kx-grid` canvas (`KINECT Marketing Site.dc.html` ~line 341: "7 ·
 * PRICING (dark)"). Per the handoff's own fidelity note ("README wins
 * conflicts"), this implements the light treatment README documents, using
 * the same light-card language as PersonaCard/PillarCards for visual
 * consistency across the light rhythm.
 *
 * Card base treatment, per-tier feature list, and the "$149/mo" price
 * format follow the prototype's shared `planRow` helper (~line 592-596)
 * adapted from dark to light surfaces. The Growth/popular accent border +
 * glow shadow value is the Task 11 brief's own figure
 * (`shadow-[0_8px_24px_rgba(41,169,224,.14)]`), not the prototype's dark-
 * card glow (`0 0 50px rgba(53,214,232,.14)`), since the brief specifies it
 * directly.
 *
 * `settings.pricing.note` ("Every plan includes the portal, analytics and
 * AI insights. Pricing varies slightly by lane.") is deliberately NOT
 * rendered here: a 2026-07-25 product decision made pricing a single
 * shared table across all three lanes, which the "varies slightly by lane"
 * wording contradicts, so the note is stale and intentionally omitted.
 */
export default function PricingSection({
  headline,
  supporting,
  tiers,
}: PricingSectionProps) {
  return (
    <div className="kx-sec bg-light-canvas">
      <div className="mx-auto max-w-[1000px]">
        <div className="text-center">
          <SectionHead context="light">{headline}</SectionHead>
          <p className="mx-auto mt-4 max-w-[520px] text-[19px] leading-[1.55] text-ink-3">
            {supporting}
          </p>
        </div>

        <div className="mt-[50px] grid grid-cols-1 gap-[18px] kx-md:grid-cols-2 kx-lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={
                tier.popular
                  ? "flex flex-col rounded-[18px] border border-accent-light bg-surface p-[30px_28px] shadow-[0_8px_24px_rgba(41,169,224,.14)]"
                  : "flex flex-col rounded-[18px] border border-border bg-surface p-[30px_28px]"
              }
            >
              <div className="mb-[10px] h-[16px] font-mono text-[11px] uppercase tracking-[.14em] text-accent-light">
                {tier.popular ? "Most popular" : ""}
              </div>
              <div className="font-display text-[21px] font-bold text-ink">{tier.name}</div>
              <div className="mt-2 mb-1 font-display text-[42px] font-bold text-ink">
                {"$" + tier.price}
                <span className="text-[16px] font-medium text-muted">/mo</span>
              </div>
              <ul className="mb-[22px] flex flex-col gap-2 text-[16px] leading-[1.55] text-ink-2">
                {tier.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>

              <div className="mt-auto">
                {tier.popular ? (
                  // Placeholder destination: checkout/signup routing is
                  // wired up in a later task (same "/" placeholder
                  // convention as Nav's primary CTA).
                  <Button variant="accent" href="/" className="w-full justify-center">
                    {tier.cta}
                  </Button>
                ) : (
                  // Light-context bordered CTA, now Button's own
                  // "outline-light" variant (see Button.tsx) instead of a
                  // duplicated plain-markup class literal.
                  <Button
                    variant="outline-light"
                    href="/"
                    className="w-full justify-center"
                  >
                    {tier.cta}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
