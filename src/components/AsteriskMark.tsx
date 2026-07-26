import { cn } from "@/lib/cn";

interface AsteriskMarkProps {
  /** Rendered pixel size (viewBox is always 32x32). */
  size?: number;
  /** Stroke color for the mark. Defaults to the current persona accent. */
  stroke?: string;
  className?: string;
}

/**
 * The KINECT asterisk mark (design-reference/README.md "Assets -> Logo"):
 * a 32x32 viewBox, four `stroke-width:3` round-capped lines. Solid fills
 * only; gradient marks were explicitly rejected. Extracted out of Lockup so
 * the hero/closing badge (a standalone circle containing the mark in dark,
 * with no wordmark or divider) can reuse the exact same glyph instead of a
 * second inline copy.
 */
export default function AsteriskMark({
  size = 25,
  stroke = "var(--accent)",
  className,
}: AsteriskMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={cn("flex-none", className)}
      aria-hidden="true"
    >
      <g stroke={stroke} strokeWidth={3} strokeLinecap="round">
        <line x1={16} y1={4} x2={16} y2={28} />
        <line x1={4} y1={16} x2={28} y2={16} />
        <line x1={7.5} y1={7.5} x2={24.5} y2={24.5} />
        <line x1={24.5} y1={7.5} x2={7.5} y2={24.5} />
      </g>
    </svg>
  );
}
