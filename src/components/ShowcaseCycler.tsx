"use client";

import { useState } from "react";
import Image from "next/image";
import { PERSONA_IDS, type Persona } from "@/lib/personas";
import { clickLabel, type CyclerState } from "@/lib/cycler";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

/**
 * Product showcase cycler (Task 10; design-reference/README.md "5. Product
 * showcase with cycling screenshots"). Three persona screenshots cross-fade
 * on a 15s CSS loop (`.kx-cyc`/`.kx-lab` keyframes in globals.css, offset by
 * 0/-5s/-10s per layer/label so they're always in sync with each other).
 *
 * Clicking a label pins that persona via real state (`clickLabel` in
 * src/lib/cycler.ts) rather than a CSS-only toggle: the pinned index is
 * applied as a `kx-pin-N` class to the image stage and the label row, which
 * globals.css uses to pause every layer/label and force the pinned one
 * visible/highlighted. Clicking the already-pinned label resumes
 * auto-cycling. Screenshots are 2x captures sharing a fixed 2962:1996
 * aspect-ratio stage with `object-fit: cover`, so each is cropped/cover-fit
 * identically regardless of its native width.
 */
const SCREENSHOTS: Record<Persona, { src: string; alt: string }> = {
  agency: { src: "/screenshots/portal-board.png", alt: "KINECT agency portal dashboard" },
  coach: { src: "/screenshots/coach-hq.png", alt: "KINECT coach program dashboard" },
  consultant: { src: "/screenshots/consultant-hq.png", alt: "KINECT consultant engagement dashboard" },
};

const LAYER_CLASS: readonly string[] = ["kx-cyc", "kx-cyc kx-cyc-2", "kx-cyc kx-cyc-3"];
const LABEL_CLASS: readonly string[] = ["kx-lab", "kx-lab kx-lab-2", "kx-lab kx-lab-3"];

interface ShowcaseCyclerProps {
  /** home.showcase.labels -- persona -> display label ("agency", "coach", "consultant"). */
  labels: Record<Persona, string>;
}

export default function ShowcaseCycler({ labels }: ShowcaseCyclerProps) {
  const [state, setState] = useState<CyclerState>({ pinned: null });
  const pinClass = state.pinned !== null ? `kx-pin-${state.pinned + 1}` : "";

  return (
    <div className="relative z-0 mx-auto max-w-[880px]">
      <div aria-hidden="true" className="kx-shot-glow" />
      <div className="kx-shot-frame">
        <div
          className={cn("relative", pinClass)}
          style={{ aspectRatio: "2962 / 1996" }}
        >
          {PERSONA_IDS.map((persona, i) => (
            <Image
              key={persona}
              src={SCREENSHOTS[persona].src}
              alt={SCREENSHOTS[persona].alt}
              fill
              sizes="(max-width: 860px) 100vw, 880px"
              className={LAYER_CLASS[i]}
            />
          ))}
        </div>
      </div>

      <div className={cn("mt-5 flex justify-center gap-[10px]", pinClass)}>
        {PERSONA_IDS.map((persona, i) => (
          <button
            key={persona}
            type="button"
            aria-pressed={state.pinned === i}
            onClick={() => {
              // Decided from the outer `state` (not inside the setState
              // updater below -- React may invoke updater functions more
              // than once, e.g. under StrictMode's dev double-render, which
              // would double-fire this side effect). state.pinned !== i
              // means this click transitions INTO pinned-at-i (a pin);
              // state.pinned === i means it's already pinned here and this
              // click resumes auto-cycling instead (clickLabel's own doc
              // comment) -- matches the Task 15 brief's "only when
              // pinning, not unpinning".
              if (state.pinned !== i) track("screenshot_pinned", { persona });
              setState((s) => clickLabel(s, i));
            }}
            className={cn(
              LABEL_CLASS[i],
              // NOTE: no Tailwind `transition-colors` here -- see the
              // `.kx-lab` comment in globals.css. That utility transitions
              // background-color/border-color too; this rule's pinned-state
              // override previously needed `!important` on those two
              // properties to win, and transitioning INTO an
              // `!important`-declared end value is a known cross-browser
              // weak spot (observed: the computed value never left its
              // pre-pin state). `.kx-lab` instead declares a `color`-only
              // transition directly, which no longer has any `!important`
              // to contend with.
              "cursor-pointer rounded-[20px] px-[15px] py-[7px] font-mono text-[12px] uppercase tracking-[.1em]",
            )}
          >
            {labels[persona]}
          </button>
        ))}
      </div>
    </div>
  );
}
