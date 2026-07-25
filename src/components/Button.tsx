import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "ghost" | "accent";

interface ButtonProps {
  variant?: ButtonVariant;
  /** Renders a next/link anchor instead of a <button> when provided. */
  href?: string;
  className?: string;
  children: ReactNode;
  type?: "button" | "submit" | "reset";
  /** Optional click handler, e.g. closing a mobile sheet on navigation. */
  onClick?: () => void;
}

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-[10px] px-5 py-[11px] font-sans text-[15px] font-semibold";

// Per design-reference/README.md line 81 (nav CTA) and line 121 (hero CTA row).
const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-on-dark text-[#0B0F17]",
  ghost: "border border-[rgba(255,255,255,.18)] bg-transparent text-on-dark",
  accent: "bg-accent-light text-white",
};

/**
 * Shared button/link primitive. Has no "use client" directive of its own,
 * so it renders as a Server Component when used from server trees; the
 * optional `onClick` only fires when a parent Client Component (e.g. Nav)
 * wires one up.
 */
export default function Button({
  variant = "primary",
  href,
  className = "",
  children,
  type = "button",
  onClick,
}: ButtonProps) {
  const classes = cn(BASE, VARIANTS[variant], className);

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
