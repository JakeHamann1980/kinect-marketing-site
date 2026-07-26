/**
 * Task 15: minimal consent store backing the ConsentBanner + PostHogProvider.
 * Persists a single granted/denied choice to localStorage (`kx-consent`) and
 * broadcasts changes via a `kx-consent` CustomEvent on `window` so any
 * number of listeners (PostHogProvider, ConsentBanner, future callers) can
 * react without a shared React tree/context -- there's no ambient consent
 * provider elsewhere in this codebase to hook into, and a window event is
 * the simplest thing that works across the App Router's server/client
 * split (PostHogProvider and ConsentBanner mount independently in
 * src/app/layout.tsx).
 *
 * SSR-safe: every export checks for `window` first and no-ops (or returns
 * null) when absent, since these are also imported by files that render on
 * the server before any client boundary is reached.
 */
export type Consent = "granted" | "denied";

const STORAGE_KEY = "kx-consent";
const EVENT_NAME = "kx-consent";

function isConsent(value: string | null): value is Consent {
  return value === "granted" || value === "denied";
}

/** Reads the persisted choice. Returns null if unset, SSR, or a garbage value. */
export function getConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return isConsent(stored) ? stored : null;
}

/** Persists the choice and notifies subscribers (see onConsentChange). No-ops during SSR. */
export function setConsent(value: Consent): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, value);
  window.dispatchEvent(new CustomEvent<Consent>(EVENT_NAME, { detail: value }));
}

/** Subscribes to consent changes made via setConsent. Returns an unsubscribe function (a no-op during SSR). */
export function onConsentChange(cb: (value: Consent) => void): () => void {
  if (typeof window === "undefined") return () => {};
  function handler(event: Event) {
    cb((event as CustomEvent<Consent>).detail);
  }
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}
