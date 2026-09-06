import posthog from "posthog-js";
import { PERSONA_IDS, type Persona } from "@/lib/personas";

/**
 * Task 15 event taxonomy. Every call site names one of these exactly --
 * kept as a closed union (rather than a bare `string`) so a typo'd event
 * name is a compile error, not a silent miss in PostHog.
 */
export type KxEvent =
  | "cta_clicked"
  | "waitlist_opened"
  | "waitlist_submitted"
  | "persona_card_clicked"
  | "solutions_nav_clicked"
  | "screenshot_pinned"
  | "faq_opened"
  | "pricing_tier_clicked"
  | "consent_updated"
  | "billing_interval_toggled";

/**
 * Whether PostHog has actually been initialized (consent granted AND
 * `NEXT_PUBLIC_POSTHOG_KEY` present -- see PostHogProvider). `track` no-ops
 * entirely while this is false, so nothing in this module ever calls
 * `posthog.capture` before consent, and calling it costs nothing when the
 * env key hasn't been wired up yet (per this task's "code-complete, key
 * wired later" brief).
 */
let ready = false;

/** Set by PostHogProvider; exported for its own use and for test setup. */
export function setAnalyticsReady(value: boolean): void {
  ready = value;
}

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
const UTM_STORAGE_KEY = "kx-utm";

/**
 * First-touch UTM attribution: the very first call (per browser) reads
 * whichever of the five utm_* params are present on the current URL
 * (possibly none) and freezes that set into localStorage under `kx-utm`.
 * Every subsequent call -- regardless of what the URL looks like by
 * then -- returns that frozen set instead of re-reading the URL, so a
 * visitor's original campaign attribution survives later organic/direct
 * visits or a second campaign link. SSR-safe: returns `{}` when there's no
 * `window` (matching "no attribution available yet" rather than throwing).
 */
export function firstTouchUtms(): Record<string, string> {
  if (typeof window === "undefined") return {};

  const stored = window.localStorage.getItem(UTM_STORAGE_KEY);
  if (stored !== null) {
    try {
      return JSON.parse(stored) as Record<string, string>;
    } catch {
      // Corrupted value (e.g. hand-edited devtools) -- treat as no
      // attribution rather than throwing, and don't attempt to re-capture
      // (the "first touch" already happened; a parse failure shouldn't
      // silently re-open that window).
      return {};
    }
  }

  const params = new URLSearchParams(window.location.search);
  const captured: Record<string, string> = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) captured[key] = value;
  }
  window.localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(captured));
  return captured;
}

/**
 * /agency, /coach, /consultant (any subpath) -> that persona; everything
 * else -> "home". Exported (Task 16) so the waitlist dialog can attach the
 * same persona value to a form submission that `track()` already attaches
 * to every analytics event, without a second, drifting implementation of
 * "which persona is this page" living in two files.
 */
export function currentPersona(): Persona | "home" {
  if (typeof window === "undefined") return "home";
  const seg = window.location.pathname.split("/")[1];
  return (PERSONA_IDS as readonly string[]).includes(seg) ? (seg as Persona) : "home";
}

/**
 * Fires a typed analytics event. No-ops entirely (no PostHog call, no
 * network request) until PostHogProvider has actually initialized PostHog,
 * which only happens post-consent with a key present -- see that
 * component's own doc comment. Every call is merged with the page-context
 * `persona` and the first-touch UTM set; an explicit `props.persona` (e.g.
 * "which persona card was clicked") wins over the page-context default
 * since it's spread last.
 */
export function track(event: KxEvent, props?: Record<string, unknown>): void {
  if (!ready) return;
  posthog.capture(event, { persona: currentPersona(), ...firstTouchUtms(), ...props });
}
