import Link from "next/link";
import { cn } from "@/lib/cn";

interface LockupProps {
  /** Destination for the whole lockup. Defaults to the site root. */
  href?: string;
  /** Rendered pixel size of the asterisk mark (viewBox is always 32x32). */
  size?: number;
  /** Stroke color for the mark. Defaults to the current persona accent. */
  stroke?: string;
  className?: string;
}

/**
 * The KINECT logo lockup: asterisk mark, hairline divider, wordmark.
 * Per design-reference/README.md "Assets -> Logo" and "Global Elements -> nav":
 * solid fills only, never a gradient. Always links home (or `href`).
 */
export default function Lockup({
  href = "/",
  size = 25,
  stroke = "var(--accent)",
  className = "",
}: LockupProps) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-[11px]", className)}
    >
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        className="flex-none"
        aria-hidden="true"
      >
        <g stroke={stroke} strokeWidth={3} strokeLinecap="round">
          <line x1={16} y1={4} x2={16} y2={28} />
          <line x1={4} y1={16} x2={28} y2={16} />
          <line x1={7.5} y1={7.5} x2={24.5} y2={24.5} />
          <line x1={24.5} y1={7.5} x2={7.5} y2={24.5} />
        </g>
      </svg>
      <span
        aria-hidden="true"
        className="block h-[19px] w-px flex-none bg-rule-strong"
      />
      <span className="font-display text-base font-bold uppercase tracking-[.16em] text-on-dark">
        KINECT
      </span>
    </Link>
  );
}
