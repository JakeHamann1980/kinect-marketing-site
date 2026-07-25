import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { track } from "@/lib/analytics";

export type ButtonVariant = "primary" | "ghost" | "accent" | "outline-light" | "fill-dark";
export type ButtonSize = "md" | "lg" | "xl";

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Renders a next/link anchor instead of a <button> when provided. */
  href?: string;
  className?: string;
  children: ReactNode;
  type?: "button" | "submit" | "reset";
  /** Optional click handler, e.g. closing a mobile sheet on navigation. */
  onClick?: () => void;
  /**
   * Task 15: when set, fires `cta_clicked {location: trackLocation}` on
   * click, in addition to any `onClick` above (both run). Button itself
   * still carries no "use client" directive -- this only does anything
   * useful when Button ends up bundled into a Client Component's tree at
   * runtime (a client caller like Nav passing it directly, or a server
   * caller going through the `TrackedLink` wrapper). A Server Component
   * passing `trackLocation` to Button *directly* (no TrackedLink) would
   * still render, but the click handler this prop implies can't actually
   * attach in a purely server-rendered subtree -- see TrackedLink.tsx's own
   * doc comment for the full explanation and which call sites need it.
   */
  trackLocation?: string;
}

const BASE = "inline-flex items-center justify-center gap-2 font-sans font-semibold";

/**
 * Size scale (design-reference/KINECT Marketing Site.dc.html, home page
 * instance -- README only describes sizing qualitatively):
 * - "md" (default) -- nav CTA / persona-card CTA / pricing CTAs: 11px 20px,
 *   15px, radius 10px (dc.html line 166 nav button; line 596 plan button
 *   uses 13px vertical but the same 10/15 family -- 11px/20px is the
 *   original, already-shipped Task 6 value and stays the default).
 * - "lg" (home hero + closing-adjacent CTA row, dc.html line 201-202):
 *   13px 22px, 15px, radius 10px. Disclosed deviation from this task's own
 *   initial estimate of radius 12 for "lg" -- the recovered value is 10px,
 *   matching every other home-page button radius; only the closing CTA
 *   ("xl", below) actually uses 12px in the reference.
 * - "xl" (home closing CTA, dc.html line 362): 16px 32px, 18px, radius 12px.
 */
const SIZES: Record<ButtonSize, string> = {
  md: "rounded-[10px] px-5 py-[11px] text-[15px]",
  lg: "rounded-[10px] px-[22px] py-[13px] text-[15px]",
  xl: "rounded-[12px] px-8 py-[16px] text-[18px]",
};

// Per design-reference/README.md line 81 (nav CTA) and line 121 (hero CTA
// row). "outline-light" is the light-context bordered treatment originally
// adapted from the non-popular pricing tier CTAs in
// KINECT Marketing Site.dc.html (`hi?...:'rgba(255,255,255,.07)'` branch)
// for the light rhythm PersonaCard/PillarCards already use elsewhere:
// border-border, text-ink, transparent background. Kept defined even
// though PricingSection no longer uses it (see "fill-dark" below) since
// it remains a reasonable light-context bordered primitive.
//
// "fill-dark" (user-directed 2026-07-25): the UNADAPTED dark-context
// version of that same prototype branch -- bg rgba(255,255,255,.07), no
// border, on-dark text -- recovered verbatim once PricingSection's
// non-popular tier CTA needed to go back to dark. Genuinely differs from
// "ghost" (which has a visible border and a fully transparent background)
// so it's its own variant rather than a ghost reuse.
const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-on-dark text-[#0B0F17]",
  ghost: "border border-[rgba(255,255,255,.18)] bg-transparent text-on-dark",
  accent: "bg-accent-light text-white",
  "outline-light": "border border-border bg-transparent text-ink",
  "fill-dark": "bg-[rgba(255,255,255,.07)] text-on-dark",
};

/**
 * Shared button/link primitive. Has no "use client" directive of its own,
 * so it renders as a Server Component when used from server trees; the
 * optional `onClick` only fires when a parent Client Component (e.g. Nav)
 * wires one up.
 */
export default function Button({
  variant = "primary",
  size = "md",
  href,
  className = "",
  children,
  type = "button",
  onClick,
  trackLocation,
}: ButtonProps) {
  const classes = cn(BASE, SIZES[size], VARIANTS[variant], className);

  // Deliberately left `undefined` (not a defined-but-empty closure) when
  // neither prop is set, matching the pre-Task-15 behavior exactly: a
  // Server Component caller that passes neither (still the common case --
  // see PersonaCard/PricingSection/hero-closing before their TrackedLink
  // conversion) must keep getting a plain, non-interactive `undefined`
  // onClick here, not a function value.
  const handleClick =
    trackLocation || onClick
      ? () => {
          if (trackLocation) track("cta_clicked", { location: trackLocation });
          onClick?.();
        }
      : undefined;

  if (href) {
    return (
      <Link href={href} className={classes} onClick={handleClick}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} onClick={handleClick}>
      {children}
    </button>
  );
}
