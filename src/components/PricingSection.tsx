import Link from "next/link";
import TierCards from "@/components/TierCards";
import SectionHead from "@/components/SectionHead";
import type { Tier } from "@/content/types";
import { cn } from "@/lib/cn";

interface PricingSectionProps {
  headline: string;
  supporting: string;
  tiers: Tier[];
  /**
   * user-directed 2026-08-03: when set, a centered text link under the tier
   * grid routes to the dedicated /pricing page (full comparison matrix +
   * pricing FAQ). Home and the persona pages pass "/pricing"; the /pricing
   * page itself omits it (linking to yourself is noise). A relative path is
   * correct on every hostname: the proxy serves /pricing in place on
   * persona hosts, same as /legal/*.
   */
  compareHref?: string;
  /**
   * user-directed 2026-08-03: the /pricing page renders richer cards
   * (tier tagline + the fuller `detail` feature list); the home/persona
   * teaser sections stay on the compact handoff `features` list.
   */
  detailed?: boolean;
  /**
   * user-directed 2026-08-03: when this section is nested inside an
   * ancestor that already paints the dark canvas and its orb wash (the
   * /pricing page runs hero + cards + trust chips as one block so the orbs
   * carry all the way down), the section must not paint its own -- both
   * `.kx-grid`'s opaque `background-color` and the local cyan radial would
   * cover the shared backdrop. Dark tone only; ignored when light.
   */
  inheritsBackdrop?: boolean;
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
  compareHref,
  detailed = false,
  inheritsBackdrop = false,
}: PricingSectionProps) {
  const dark = tone === "dark";

  return (
    // id="pricing": Fix (final review, I1) -- the nav's "Pricing" link
    // (settings.ts) now points at the in-page `#pricing` anchor. Every page
    // that renders Nav also mounts this section (home via page.tsx, all
    // three persona pages via PersonaPage.tsx), so a bare same-page hash
    // resolves correctly regardless of which page it's clicked from.
    // Light tone sits on --light-canvas-2, one deeper step than the FAQ's
    // --light-canvas, so the two adjacent light sections on persona pages
    // read as distinct bands (user-directed 2026-07-25).
    <section
      id="pricing"
      className={cn(
        "kx-sec relative overflow-hidden",
        dark ? (inheritsBackdrop ? null : "kx-grid") : "bg-light-canvas-2",
      )}
    >
      {dark && !inheritsBackdrop ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(780px 520px at 50% 100%, rgba(53,214,232,.24), transparent 64%)",
          }}
        />
      ) : null}
      {/* Widened from 1000px with the fourth tier. At 1000px, four cards are
          ~236px each; at 1200px they are ~286px, close to the ~321px three
          cards had. The section head's own copy stays at max-w-[520px] below,
          so the wider container only affects the card row. */}
      <div className="relative mx-auto max-w-[1200px]">
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

        {/* The tier grid and the Monthly / Annual switch live in TierCards, a
            client component, because the interval is client state and this
            section stays a Server Component. Only the detailed /pricing
            render gets the switch; teasers stay monthly. */}
        <TierCards tiers={tiers} dark={dark} detailed={detailed} showToggle={detailed} />

        {compareHref ? (
          <div className="mt-9 text-center">
            <Link
              href={compareHref}
              className={cn(
                "text-[16px] font-semibold underline-offset-4 hover:underline",
                dark ? "text-cyan" : "text-accent-light",
              )}
            >
              {"See everything in every plan →"}
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
