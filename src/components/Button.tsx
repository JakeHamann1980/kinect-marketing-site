import Link from "next/link";
import type { ReactNode } from "react";

export type ButtonVariant = "primary" | "ghost" | "accent";

interface ButtonProps {
  variant?: ButtonVariant;
  /** Renders a next/link anchor instead of a <button> when provided. */
  href?: string;
  className?: string;
  children: ReactNode;
  type?: "button" | "submit" | "reset";
}

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-[10px] px-5 py-[11px] font-sans text-[15px] font-semibold";

// Per design-reference/README.md line 81 (nav CTA) and line 121 (hero CTA row).
const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-on-dark text-[#0B0F17]",
  ghost: "border border-[rgba(255,255,255,.18)] bg-transparent text-on-dark",
  accent: "bg-accent-light text-white",
};

/** Shared button/link primitive. Server component -- no client interactivity yet. */
export default function Button({
  variant = "primary",
  href,
  className = "",
  children,
  type = "button",
}: ButtonProps) {
  const classes = `${BASE} ${VARIANTS[variant]} ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes}>
      {children}
    </button>
  );
}
