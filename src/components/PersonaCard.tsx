import Button from "@/components/Button";
import { PERSONAS, type Persona } from "@/lib/personas";

interface PersonaCardProps {
  persona: Persona;
  title: string;
  body: string;
  features?: string[];
  cta: string;
}

/**
 * TODO(Task 19): production should route to the persona's own subdomain
 * (`https://${PERSONAS[persona].hostname}/`). Mirrors the same placeholder
 * convention as `personaHref` in src/components/Nav.tsx -- link within the
 * current app until environment-aware URLs are wired up.
 */
function personaHref(persona: Persona): string {
  return `/${persona}`;
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
    <div className="flex flex-col rounded-[18px] border border-border bg-surface p-[32px_30px] shadow-[0_1px_3px_rgba(12,18,32,.05)]">
      <div
        className="mb-[22px] flex h-[52px] w-[52px] flex-none items-center justify-center rounded-[14px]"
        style={{ background: tint, color: accentLight }}
      >
        <PersonaIcon persona={persona} />
      </div>

      <h3 className="font-display text-[23px] font-bold text-ink">{title}</h3>
      <p className="mt-[11px] text-[17px] leading-[1.6] text-ink-3">{body}</p>

      {features && features.length > 0 ? (
        <ul className="mt-5 flex flex-col gap-[9px]">
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

      <div className="mt-6">
        <Button variant="accent" href={personaHref(persona)}>
          {cta}
          <span aria-hidden="true">{"→"}</span>
        </Button>
      </div>
    </div>
  );
}

// Re-export so callers that only need the link convention (e.g. a future
// persona index) don't have to duplicate the TODO(Task 19) resolution.
export { personaHref };
export type { PersonaCardProps };
