"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AsteriskMark from "@/components/AsteriskMark";
import { cn } from "@/lib/cn";
import { homeHrefForHost } from "@/lib/personas";

interface LockupProps {
  /**
   * Destination for the whole lockup. Defaults to home, resolved host-aware
   * on the client: "/" everywhere except persona subdomains, where home only
   * exists on the apex origin (see `homeHrefForHost`).
   */
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
 *
 * Client component solely for the host-aware home link: persona pages are
 * statically generated once and served both as apex paths (/agency) and as
 * persona-subdomain roots, so the correct home destination can't be baked
 * into the HTML -- it's read from `window.location` after hydration. Until
 * then the href is "/", which is only ever wrong on a persona subdomain for
 * the instant before hydration.
 */
export default function Lockup({
  href,
  size = 25,
  stroke = "var(--accent)",
  className = "",
}: LockupProps) {
  const [homeHref, setHomeHref] = useState("/");
  useEffect(() => {
    setHomeHref(
      homeHrefForHost(window.location.host, window.location.protocol),
    );
  }, []);
  return (
    <Link
      href={href ?? homeHref}
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
