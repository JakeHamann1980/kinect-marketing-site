/**
 * Task 16 (waitlist): where every "Start free" CTA sends the visitor.
 *
 * "waitlist" (today): there is no live signup flow yet
 * (design-reference/README.md "Start free destination ... Not designed"),
 * so every "Start free" CTA opens WaitlistDialog instead. "signup-url" is
 * the value a later task flips this to once a real signup flow exists;
 * WaitlistCta.tsx's own fallback branch documents exactly what that would
 * render.
 */
export const CTA_MODE: "waitlist" | "signup-url" = "waitlist";

/**
 * Dialog-opening mechanism: a `window` CustomEvent, matching
 * consent.ts/ConsentBanner.tsx's own `kx-open-consent` reopen-event pattern
 * exactly (see consent.ts's top-of-file doc comment) rather than a new
 * React context. WaitlistDialog mounts once in the root layout as a
 * sibling of every CTA that needs to open it (Nav, the home/persona hero
 * and closing sections, PricingSection), not an ancestor -- a context
 * would need its own provider mounted above all of those anyway, and a
 * plain window event needs no such wiring while reusing a pattern this
 * codebase already has a proven precedent for.
 */
const OPEN_EVENT = "kx-open-waitlist";

export interface OpenWaitlistDetail {
  /**
   * Which CTA triggered the open (the same "nav" / "hero" / "closing" /
   * "pricing" / "mobile-sheet" location strings `cta_clicked` already
   * uses), carried through so WaitlistDialog's own `waitlist_opened` track
   * call can attach it -- traceable to a location the same way
   * `cta_clicked` already is, instead of a bare, contextless event.
   */
  location?: string;
}

/** Dispatched by WaitlistCta.tsx on click. SSR-safe no-op (matches
 * consent.ts's own convention: every export checks for `window` first). */
export function openWaitlist(location?: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<OpenWaitlistDetail>(OPEN_EVENT, { detail: { location } }));
}

/** Subscribed by WaitlistDialog.tsx. Returns an unsubscribe function (a
 * no-op during SSR), same shape as consent.ts's `onConsentChange`. */
export function onOpenWaitlist(cb: (detail: OpenWaitlistDetail) => void): () => void {
  if (typeof window === "undefined") return () => {};
  function handler(event: Event) {
    cb((event as CustomEvent<OpenWaitlistDetail>).detail ?? {});
  }
  window.addEventListener(OPEN_EVENT, handler);
  return () => window.removeEventListener(OPEN_EVENT, handler);
}
