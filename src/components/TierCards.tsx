"use client";

import { useState } from "react";
import { type ButtonVariant } from "@/components/Button";
import TrackedLink from "@/components/TrackedLink";
import { signupUrlForTier } from "@/lib/checkout";
import { track } from "@/lib/analytics";
import type { Tier } from "@/content/types";
import { cn } from "@/lib/cn";

type Interval = "month" | "year";

interface TierCardsProps {
  tiers: Tier[];
  dark: boolean;
  /** /pricing renders tagline + the fuller `detail` list; teasers do not. */
  detailed: boolean;
  /**
   * Whether to offer the Monthly / Annual switch. Only /pricing does: the
   * home and persona teasers show the compact monthly card and leave annual
   * one click away on the page that exists for comparing. A Sanity tier
   * without `annualPrice` keeps showing monthly under either setting.
   */
  showToggle: boolean;
}

/**
 * The tier grid, split out of PricingSection (a Server Component) because the
 * Monthly / Annual choice is client state. Everything visual is carried over
 * verbatim from where it lived before; the only additions are the toggle and
 * the interval-aware price block.
 *
 * MONTHLY IS THE DEFAULT, deliberately. Every published number -- the SEO
 * description, the JSON-LD AggregateOffer, llms.txt -- is the monthly one, so
 * the first figure a reader sees here should match. State is local: no URL
 * param, which would fight the page's `revalidate = false` static render.
 *
 * Annual is ten times monthly, shown as the BILLED TOTAL ("$1,490/yr") with
 * "Two months free, billed annually" beneath. Not an effective monthly, which
 * would put a figure in the headline that nobody is ever charged, and not a
 * strikethrough, which would make a standing structure read as a sale.
 */
export default function TierCards({ tiers, dark, detailed, showToggle }: TierCardsProps) {
  const [interval, setInterval_] = useState<Interval>("month");

  function choose(next: Interval) {
    if (next === interval) return;
    setInterval_(next);
    // Side effects stay outside the state updater (ShowcaseCycler.tsx and
    // Faq.tsx both restate this rule; React may replay updaters).
    track("billing_interval_toggled", { interval: next });
  }

  const anyAnnual = tiers.some((t) => typeof t.annualPrice === "number");

  return (
    <>
      {showToggle && anyAnnual ? (
        <div className="mt-8 flex justify-center">
          <div
            role="group"
            aria-label="Billing period"
            className={cn(
              "inline-flex rounded-full border p-1",
              dark
                ? "border-[rgba(255,255,255,.14)] bg-[rgba(255,255,255,.04)]"
                : "border-border bg-surface",
            )}
          >
            {(
              [
                ["month", "Monthly"],
                ["year", "Annual"],
              ] as const
            ).map(([value, label]) => {
              const active = interval === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => choose(value)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-[14px] font-semibold transition-colors",
                    active
                      ? dark
                        ? "bg-[rgba(53,214,232,.16)] text-cyan"
                        : "bg-light-canvas text-accent-light"
                      : dark
                        ? "text-on-dark-4 hover:text-on-dark-2"
                        : "text-muted hover:text-ink-3",
                  )}
                >
                  {label}
                  {value === "year" ? (
                    <span className={cn("ml-1.5 font-normal", active ? "" : "opacity-70")}>
                      2 months free
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* 4-col grid as of 2026-09-01 (Kinect Enterprise). This WAS
          `kx-md:grid-cols-3` with no kx-lg step, on the evidence that
          dc.html's max-width:1024px block only overrides the literal
          `repeat(4,1fr)` selector and never `repeat(3,1fr)`. That evidence
          now cuts the other way: at four cards the prototype's own rule
          applies, and design-reference/README.md:220 states it -- "≤1024px,
          4-column grids become 2".
          So: two columns from kx-md, four only at kx-xl (1280). NOT kx-lg,
          which is what StepCards.tsx uses for its own 4-up -- measured at a
          1024px viewport these cards land at 226px, about twenty characters
          a line, and one detail line wrapped to four. StepCards gets away
          with 1024 because its cards carry a title and a sentence; these
          carry a 42px price and a seven-line list. See the kx-xl note in
          globals.css. Three-across is gone deliberately. */}
      <div className="mt-[50px] grid grid-cols-1 gap-[18px] kx-md:grid-cols-2 kx-xl:grid-cols-4">
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

          // Annual only when it is chosen AND this tier has a figure for it.
          const annual = interval === "year" && typeof tier.annualPrice === "number";
          const amount = annual ? (tier.annualPrice as number) : tier.price;

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
              {detailed && tier.tagline ? (
                <p className={cn("mt-1 text-[14px] leading-[1.5] text-pretty", moClass)}>
                  {tier.tagline}
                </p>
              ) : null}
              <div className={cn("mt-2 mb-1 font-display text-[42px] font-bold", headingClass)}>
                {"$" + amount.toLocaleString("en-US")}
                <span className={cn("text-[16px] font-medium", moClass)}>
                  {annual ? "/yr" : "/mo"}
                </span>
              </div>
              {annual ? (
                <p
                  className={cn(
                    "mb-2 text-[13px] font-medium",
                    dark ? "text-cyan" : "text-accent-light",
                  )}
                >
                  Two months free, billed annually
                </p>
              ) : null}
              <ul
                className={cn(
                  "mb-[22px] flex flex-col gap-2 text-[16px] leading-[1.55] text-pretty",
                  bodyClass,
                )}
              >
                {/* A line ending "coming soon" is a promise, not a
                    capability, and it should not read at the same weight as
                    the lines above it. Italic + reduced opacity is the
                    lightest treatment that says so without a second colour
                    or a marker: an asterisk here would repeat the mistake
                    settings.ts documents at length (a glyph that reads
                    "conditions apply" while stating no condition).
                    Matched on the copy rather than a new content field so
                    the sentinel stays in one vocabulary with the comparison
                    table's "soon", and an editor writing the phrase in
                    Sanity gets the treatment for free. */}
                {(detailed ? (tier.detail ?? tier.features) : tier.features).map((feature) => (
                  <li
                    key={feature}
                    className={cn(/\bcoming soon\b/i.test(feature) && "italic opacity-60")}
                  >
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                {/* Task 15: the click handler goes through TrackedLink (a
                    client boundary -- see its own doc comment) rather than
                    Button directly. Fires both the generic
                    cta_clicked{location:"pricing"} (one of the task brief's
                    named trackLocation call sites) AND the tier-specific
                    pricing_tier_clicked -- a rollup "any CTA click" metric
                    plus the more precise "which tier" one, not a duplicate
                    of the same signal. */}
                {/* user-directed 2026-08-03: tier CTAs hand off to the app's
                    signup carrying the plan, instead of opening the waitlist.
                    Deliberately NOT a Stripe payment link -- see
                    src/lib/checkout.ts for why one would orphan the payment.
                    The interval is NOT carried on the URL: the platform's
                    signup page reads neither plan nor interval, and the
                    choice is made in-app at checkout after the trial, which
                    is the moment it actually applies. */}
                <TrackedLink
                  href={signupUrlForTier(tier.name)}
                  variant={ctaVariant}
                  className="w-full justify-center"
                  trackLocation="pricing"
                  event="pricing_tier_clicked"
                  eventProps={{ tier: tier.name, interval }}
                >
                  {tier.cta}
                </TrackedLink>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
