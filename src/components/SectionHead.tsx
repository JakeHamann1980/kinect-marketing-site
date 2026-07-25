import type { ElementType, ReactNode } from "react";

interface SectionHeadProps {
  children: ReactNode;
  /** Background context this headline sits on. Default "dark". */
  context?: "dark" | "light";
  as?: ElementType;
  className?: string;
}

/**
 * Section headline primitive. Sizing/line-height/text-wrap live in the
 * `.kx-section-head` CSS class (globals.css) so the 38px -> 27px -> 24px
 * responsive steps at 860/480px can use plain media queries rather than
 * Tailwind's default breakpoints, which don't land on those values.
 */
export default function SectionHead({
  children,
  context = "dark",
  as: Tag = "h2",
  className = "",
}: SectionHeadProps) {
  const colorClass = context === "light" ? "text-ink" : "text-on-dark";
  return (
    <Tag
      className={`kx-section-head font-display ${colorClass} ${className}`.trim()}
    >
      {children}
    </Tag>
  );
}
