import Link from "next/link";
import AsteriskMark from "@/components/AsteriskMark";
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
      <AsteriskMark size={size} stroke={stroke} />
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
