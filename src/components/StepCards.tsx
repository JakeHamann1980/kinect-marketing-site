import type { Step } from "@/content/types";

interface StepCardsProps {
  steps: Step[];
}

/**
 * "How it works" step grid.
 *
 * user-directed 2026-07-25: prototype's colored treatment chosen over
 * README's "quiet" description. README ("4. How it works (dark)") calls
 * these cards "deliberately quiet, not bold", "toned down from an earlier
 * heavier treatment", and Task 11 implemented exactly that (a flat
 * `border-[rgba(255,255,255,.1)]` / `bg-[rgba(255,255,255,.03)]` treatment
 * with no per-step color). Jake reviewed the live home page and asked for
 * the color back -- the prototype's actual RENDERED markup
 * (`KINECT Marketing Site.dc.html`'s `stepCards` table, ~line 547) never
 * shipped the quiet version at all: it cycles a coral/amber/violet/cyan
 * tint across the four cards (tinted background + tinted border + a
 * matching mono step-number color). The design-authority order for this
 * project is Jake > README > prototype, so that recovered, colored
 * treatment (transcribed verbatim below) replaces the README-quiet one.
 *
 * Colors are index-keyed (cycle of 4, wrapping if more/fewer than 4 steps
 * are ever passed) rather than content-keyed since `Step` carries no color
 * field of its own -- same convention as the WORKFLOW_ICONS/PILLAR_ICONS/
 * ICON_PATHS tables elsewhere in this codebase. Persona pages reuse this
 * same component (and the same 4-color cycle) for their own 4-step
 * "Live in ten minutes, not ten days" sections.
 */
const STEP_COLORS: { text: string; bg: string; border: string }[] = [
  { text: "#EC5242", bg: "rgba(236,82,66,.10)", border: "rgba(236,82,66,.32)" },
  { text: "#F0913A", bg: "rgba(240,145,58,.10)", border: "rgba(240,145,58,.32)" },
  { text: "#C7A0C0", bg: "rgba(199,160,192,.10)", border: "rgba(199,160,192,.32)" },
  { text: "#35D6E8", bg: "rgba(53,214,232,.10)", border: "rgba(53,214,232,.32)" },
];

export default function StepCards({ steps }: StepCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-[18px] kx-md:grid-cols-2 kx-lg:grid-cols-4">
      {steps.map((step, i) => {
        const color = STEP_COLORS[i % STEP_COLORS.length];
        return (
          <div
            key={step.number}
            className="flex flex-col rounded-[14px] border p-[22px]"
            style={{ background: color.bg, borderColor: color.border }}
          >
            <span
              className="font-mono text-[13px] font-semibold uppercase tracking-[.12em]"
              style={{ color: color.text }}
            >
              {step.number}
            </span>
            <h3 className="mt-3 mb-[7px] font-display text-[18px] font-bold text-on-dark">
              {step.title}
            </h3>
            <p className="text-[14px] leading-[1.5] text-on-dark-4">{step.body}</p>
          </div>
        );
      })}
    </div>
  );
}
