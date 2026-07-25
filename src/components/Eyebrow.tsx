import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface EyebrowProps {
  children: ReactNode;
  /** Background context this eyebrow sits on. Default "dark". */
  context?: "dark" | "light";
  className?: string;
}

/** Mono micro-label used above section headlines and step numbers. */
export default function Eyebrow({
  children,
  context = "dark",
  className = "",
}: EyebrowProps) {
  const colorClass = context === "light" ? "text-muted" : "text-on-dark-5";
  return (
    <span
      className={cn(
        "font-mono text-[11px] uppercase tracking-[.14em]",
        colorClass,
        className,
      )}
    >
      {children}
    </span>
  );
}
