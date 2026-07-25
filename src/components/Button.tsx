import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "ghost" | "accent" | "outline-light";
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
// row). "outline-light" is the light-context bordered treatment recovered
// verbatim from the non-popular pricing tier CTAs in
// KINECT Marketing Site.dc.html (`hi?...:'rgba(255,255,255,.07)'` branch
// adapted to the light rhythm PricingSection/PersonaCard/PillarCards already
// use elsewhere: border-border, text-ink, transparent background).
const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-on-dark text-[#0B0F17]",
  ghost: "border border-[rgba(255,255,255,.18)] bg-transparent text-on-dark",
  accent: "bg-accent-light text-white",
  "outline-light": "border border-border bg-transparent text-ink",
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
}: ButtonProps) {
  const classes = cn(BASE, SIZES[size], VARIANTS[variant], className);

  if (href) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick}>
      {children}
    </button>
  );
}
