"use client";

import type { ReactNode } from "react";
import Button, { type ButtonVariant, type ButtonSize } from "@/components/Button";
import { track, type KxEvent } from "@/lib/analytics";

interface TrackedLinkProps {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
  /** Forwarded straight through to Button -- fires cta_clicked {location}. */
  trackLocation?: string;
  /** An additional, more specific event fired on the same click (e.g. persona_card_clicked, pricing_tier_clicked). */
  event?: KxEvent;
  eventProps?: Record<string, unknown>;
}

/**
 * Task 15: Button.tsx deliberately carries no "use client" of its own (see
 * its own doc comment) -- it's a "universal" component that server-renders
 * fine when a Server Component imports it directly, and only becomes
 * interactive once it's part of some Client Component's bundle. That's
 * exactly how Nav.tsx already uses it (Nav has "use client", so Button's
 * onClick works there today).
 *
 * PersonaCard, PricingSection, and the hero/closing CTA rows in
 * src/app/page.tsx and PersonaPage.tsx are Server Components with no such
 * boundary. A Server Component cannot pass a function (an onClick, or the
 * closure Button.tsx's own `trackLocation` handling would build) into any
 * element it renders -- there's no client runtime attached to a purely
 * server-rendered subtree to hold onto it, and React's RSC contract only
 * allows functions to cross a Server->Client boundary when that boundary
 * actually exists (i.e. the thing being rendered is itself a real Client
 * Component). Button.tsx's own render function has no directive, so
 * inlining `trackLocation`/`onClick` directly from one of those Server
 * Component parents wouldn't attach any real click handler.
 *
 * TrackedLink is that boundary: a tiny "use client" wrapper that renders
 * the exact same Button (so all styling/variant/size behavior is
 * unchanged), passing only serializable data (`trackLocation`, `event`,
 * `eventProps` -- strings/plain objects, never functions) across from the
 * Server Component parent as props, and builds the actual onClick closure
 * itself, entirely on the client side of that boundary.
 */
export default function TrackedLink({
  trackLocation,
  event,
  eventProps,
  ...buttonProps
}: TrackedLinkProps) {
  return (
    <Button
      {...buttonProps}
      trackLocation={trackLocation}
      onClick={event ? () => track(event, eventProps) : undefined}
    />
  );
}
