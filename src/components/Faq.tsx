"use client";

import { useState } from "react";
import type { Faq as FaqItem } from "@/content/types";
import { cn } from "@/lib/cn";

interface FaqProps {
  items: FaqItem[];
}

/**
 * FAQ accordion, light-section only (design-reference/README.md "8. FAQ
 * (light)"). Single `openIndex` keeps at most one answer open at a time.
 * The answer panel is conditional-rendered (not CSS-hidden) so it is
 * removed from the accessibility tree and the DOM when collapsed; only the
 * circular indicator carries a transition, per the spec.
 */
export function Faq({ items }: FaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-[10px]">
      {items.map((item, index) => {
        const open = openIndex === index;
        const panelId = `faq-answer-${index}`;

        return (
          <div
            key={item.question}
            className="rounded-[12px] border border-border"
          >
            <button
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpenIndex(open ? null : index)}
              className="flex min-h-[56px] w-full items-center justify-between gap-4 px-6 py-3 text-left text-[17px] font-semibold text-ink"
            >
              <span>{item.question}</span>
              <span
                aria-hidden="true"
                className={cn(
                  "flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full border border-border text-[15px] leading-none text-ink transition-transform duration-200",
                  // Only one of these may be present at a time -- Tailwind's
                  // cascade order (not JSX class order) decides which
                  // `rotate-*`/`bg-*` utility wins if both appear together,
                  // so the closed state must omit them entirely rather than
                  // pairing them with a "rotate-0"/no-bg counterpart.
                  open && "rotate-45 bg-[#EEF2F8]",
                )}
              >
                {"＋"}
              </span>
            </button>
            {open ? (
              <div
                id={panelId}
                className="px-6 pb-5 text-base leading-[1.6] text-ink-3"
              >
                {item.answer}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
