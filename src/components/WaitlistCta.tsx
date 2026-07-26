"use client";

import type { ReactNode } from "react";
import Button, { type ButtonVariant, type ButtonSize } from "@/components/Button";
import { track, type KxEvent } from "@/lib/analytics";
import { CTA_MODE, openWaitlist } from "@/lib/cta";

interface WaitlistCtaProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
  /** Forwarded to Button -- still fires cta_clicked{location} exactly as
   * every other CTA does; opening the dialog is additive, not a replacement
   * for that existing signal. */
  trackLocation?: string;
  /** An additional, more specific event fired on the same click (e.g.
   * pricing_tier_clicked on the Growth tier's "Start free" CTA). */
  event?: KxEvent;
  eventProps?: Record<string, unknown>;
  /** Extra click side effect some call sites need alongside opening the
   * dialog (Nav's mobile-sheet CTA also closes the sheet). */
  onClick?: () => void;
  /** Only consulted when CTA_MODE is "signup-url" -- ignored today. */
  href?: string;
}

/**
 * Task 16 (waitlist): the "Start free" CTA primitive. Every CTA literally
 * labeled "Start free" (nav desktop + mobile sheet, home/persona hero and
 * closing primaries, the pricing Growth tier) renders through this
 * component instead of TrackedLink -- see cta.ts's own doc comment for why
 * a CTA_MODE constant + window event, not a context. Persona-card CTAs and
 * "Not you? Pick another lane" are NOT "Start free" labeled and keep using
 * TrackedLink directly (real navigation), per this task's own brief.
 *
 * `CTA_MODE === "waitlist"` (today): renders a plain `<button>` (no `href`)
 * -- these CTAs already pointed at the "/" placeholder destination with no
 * real page behind it (see e.g. Nav.tsx/PricingSection.tsx's own prior doc
 * comments), so becoming a real, non-navigating button now that a real
 * destination (the dialog) exists is not a behavior regression for
 * anything that depended on the old placeholder link. Button's own
 * `trackLocation`/click handling still fires `cta_clicked` exactly as
 * before; this just adds `openWaitlist(...)` (and, if `event` is set, that
 * more specific track call) to the same click.
 *
 * `CTA_MODE === "signup-url"` (future, not exercised today): falls back to
 * a real navigating link via `href`, still carrying `trackLocation`/
 * `event`/`eventProps` -- the shape TrackedLink already provides, just
 * inlined here since a client component can build the same onClick closure
 * directly without needing that file's Server->Client boundary trick.
 */
export default function WaitlistCta({
  variant,
  size,
  className,
  children,
  trackLocation,
  event,
  eventProps,
  onClick,
  href = "/",
}: WaitlistCtaProps) {
  if (CTA_MODE === "signup-url") {
    return (
      <Button
        variant={variant}
        size={size}
        href={href}
        className={className}
        trackLocation={trackLocation}
        onClick={() => {
          if (event) track(event, eventProps);
          onClick?.();
        }}
      >
        {children}
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      trackLocation={trackLocation}
      onClick={() => {
        if (event) track(event, eventProps);
        openWaitlist(trackLocation);
        onClick?.();
      }}
    >
      {children}
    </Button>
  );
}
