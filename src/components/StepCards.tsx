import Eyebrow from "@/components/Eyebrow";
import type { Step } from "@/content/types";

interface StepCardsProps {
  steps: Step[];
}

/**
 * "How it works" step grid (design-reference/README.md "4. How it works
 * (dark)"). README is explicit that these cards were "toned down from an
 * earlier heavier treatment" to something "deliberately quiet, not bold" --
 * the prototype file (`KINECT Marketing Site.dc.html` ~line 240-253) still
 * shows that superseded heavier version (per-step saturated tint
 * background + colored border + colored mono number, e.g.
 * `rgba(236,82,66,.10)` background with a `rgba(236,82,66,.32)` border).
 * README's plain quiet treatment (`border-[rgba(255,255,255,.1)]`,
 * `bg-[rgba(255,255,255,.03)]`) is the current, intentional design and is
 * what's implemented here; padding (22px) is carried over from the
 * prototype's shared card layout since only the color treatment changed.
 */
export default function StepCards({ steps }: StepCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-[18px] md:grid-cols-4">
      {steps.map((step) => (
        <div
          key={step.number}
          className="flex flex-col rounded-[14px] border border-[rgba(255,255,255,.1)] bg-[rgba(255,255,255,.03)] p-[22px]"
        >
          <Eyebrow context="dark">{step.number}</Eyebrow>
          <h3 className="mt-3 mb-[7px] font-display text-[18px] font-bold text-on-dark">
            {step.title}
          </h3>
          <p className="text-[14px] leading-[1.5] text-on-dark-4">{step.body}</p>
        </div>
      ))}
    </div>
  );
}
