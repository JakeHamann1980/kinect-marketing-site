import TrackedLink from "@/components/TrackedLink";
import { PERSONAS, personaHref, type Persona } from "@/lib/personas";

interface PersonaCardProps {
  persona: Persona;
  title: string;
  body: string;
  features?: string[];
  cta: string;
}

/**
 * Icon glyphs recovered verbatim from `design-reference/KINECT Marketing
 * Site.dc.html` (the `I` icon-path table, ~line 515-518: `I.agency`,
 * `I.coach`, `I.consultant`). Each is a 24x24 viewBox, `fill="none"`,
 * `stroke="currentColor"`, `stroke-width="2"`, no linecap/linejoin override
 * (matching the prototype's shared `icon()` helper exactly).
 */
const ICON_PATHS: Record<Persona, string[]> = {
  agency: ["M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"],
  coach: ["M6 8v8M18 8v8M4 10v4M20 10v4M6 12h12"],
  consultant: ["M3 21h18", "M5 21V7l7-4 7 4v14", "M9 21v-6h6v6"],
  /**
   * Professional Services: scales. Adapted from lucide's `scale` glyph, which
   * is drawn for this exact grid (24x24, stroke-width 2, no fill) and so sits
   * at the same optical weight as the three above.
   *
   * The first attempt was hand-drawn and wrong twice over: it lived between
   * y=5 and y=13, leaving the bottom third of the box empty so it read small
   * next to its neighbours, and its pans were 5-unit closed triangles that
   * fill in to blobs once a 2px stroke is applied at 26px. These pans are
   * open curves and the post runs the full height, matching consultant's
   * y=3..21.
   */
  services: [
    "M12 3v18",
    "M7 21h10",
    "M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2",
    "m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z",
    "m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z",
  ],
};

function PersonaIcon({ persona }: { persona: Persona }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={26}
      height={26}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
      className="flex-none"
    >
      {ICON_PATHS[persona].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

/**
 * Persona selector card (design-reference/README.md "3. Persona selector:
 * 'Pick your lane' (light)"). White card, 52px icon tile in the persona's
 * light tint (`PERSONAS[persona].tint` background, `.accentLight` glyph
 * color -- the same accent tokens Nav.tsx's Solutions dropdown already
 * uses, not the prototype's separately-hardcoded `lightAccent`/`lightBg`
 * table, which carries slightly different hex values for the same roles).
 * Icon tile radius (14px) recovered from the prototype's shared `iconWrap`
 * helper (~line 523).
 */
export default function PersonaCard({
  persona,
  title,
  body,
  features,
  cta,
}: PersonaCardProps) {
  const { tint, accentLight } = PERSONAS[persona];

  return (
    // h-full: grid items stretch by default (no align-items override on the
    // parent grid), but that only sizes THIS element's box to the row's
    // tallest cell -- h-full makes the box explicitly fill that stretched
    // height rather than relying on stretch alone, so the mt-auto CTA below
    // has real free space to consume. user-directed 2026-07-25: Jake
    // flagged that the three "Pick your lane" cards were rendering unequal
    // heights with the CTA immediately trailing the shortest card's
    // content.
    <div className="flex h-full flex-col rounded-[18px] border border-border bg-surface p-[32px_30px] shadow-[0_1px_3px_rgba(12,18,32,.05)]">
      <div
        className="mb-[22px] flex h-[52px] w-[52px] flex-none items-center justify-center rounded-[14px]"
        style={{ background: tint, color: accentLight }}
      >
        <PersonaIcon persona={persona} />
      </div>

      <h3 className="kx-card-title font-display font-bold text-ink">{title}</h3>
      <p className="mt-[11px] text-[17px] leading-[1.6] text-ink-3">{body}</p>

      {features && features.length > 0 ? (
        <ul className="mt-5 flex flex-col gap-[9px] text-pretty">
          {features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-[9px] text-[15px] leading-[1.4] text-ink-2"
            >
              <span aria-hidden="true" style={{ color: accentLight }}>
                {"◆"}
              </span>
              {feature}
            </li>
          ))}
        </ul>
      ) : null}

      {/* mt-auto (not mt-6): pushes the CTA to the bottom of the flex
          column, consuming whatever free space the stretched card height
          leaves above it, so all three cards' CTAs land on one line
          regardless of how much body/feature copy precedes them. */}
      <div className="mt-auto pt-6">
        {/* Task 15: PersonaCard is a Server Component (this file has no
            "use client") -- TrackedLink is the client boundary that lets
            this CTA fire persona_card_clicked on click; see its own doc
            comment. No trackLocation here: the "nav/hero/pricing/closing/
            mobile-sheet" cta_clicked locations don't include the persona
            picker cards, so this fires only the more specific event. */}
        <TrackedLink
          variant="accent"
          href={personaHref(persona)}
          event="persona_card_clicked"
          eventProps={{ persona }}
        >
          {cta}
          <span aria-hidden="true">{"→"}</span>
        </TrackedLink>
      </div>
    </div>
  );
}

export type { PersonaCardProps };
