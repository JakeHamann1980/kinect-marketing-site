"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Button from "@/components/Button";
import { getConsent, onConsentChange, setConsent, type Consent } from "@/lib/consent";
import { cn } from "@/lib/cn";

/** Also referenced by CookiePreferencesButton below (same file, one shared constant). */
const REOPEN_EVENT = "kx-open-consent";

/** Unknown during SSR (no localStorage on the server) -- reconciled against the real value on hydration, see the component's own doc comment. */
function getServerConsentSnapshot(): Consent | null {
  return null;
}

/**
 * Task 15 consent banner (design-reference/README.md flags "Cookie
 * preferences implies a consent mechanism" as an open gap, ~line 414 --
 * this is that mechanism). Fixed to the bottom of the viewport, styled
 * like the existing dark floating surfaces in this codebase (Nav's
 * Solutions dropdown panel: `bg-dropdown-bg`, `border-[rgba(255,255,255,.1)]`,
 * `rounded-[14px]`, the same `shadow-[0_24px_60px_rgba(0,0,0,.5)]`), body
 * copy at `text-on-dark-3` per the brief. Accept uses Button's "primary"
 * variant, Decline "ghost", both "md" -- the same trio PersonaCard/Nav's
 * own CTA already use elsewhere.
 *
 * The recorded consent value is read via `useSyncExternalStore` (subscribe:
 * `onConsentChange`, snapshot: `getConsent`) rather than
 * `useState`+`useEffect`: an effect that calls `setState` synchronously in
 * its own body (not from inside a subscription callback) is a lint error
 * under this repo's `react-hooks/set-state-in-effect` rule, and rightly so
 * here -- `useSyncExternalStore` is the hook actually designed for "a value
 * lives in some external store (localStorage), keep a component in sync
 * with it," including the SSR case via `getServerSnapshot` above (consent
 * is unknowable on the server, so it reports null there; React reconciles
 * against the real client value on hydration without a mismatch warning,
 * which is exactly what that parameter exists for). One side benefit: a
 * first-time visitor now sees the banner in the very first paint instead
 * of a post-mount pop-in.
 *
 * `reopened` is separate, ordinary component state -- it's not itself
 * persisted anywhere, just a local override so the footer's Cookie
 * Preferences button (below) can bring the banner back for someone who
 * already has a recorded choice.
 */
export default function ConsentBanner() {
  const consent = useSyncExternalStore(onConsentChange, getConsent, getServerConsentSnapshot);
  const [reopened, setReopened] = useState(false);

  useEffect(() => {
    function reopen() {
      setReopened(true);
    }
    window.addEventListener(REOPEN_EVENT, reopen);
    return () => window.removeEventListener(REOPEN_EVENT, reopen);
  }, []);

  const visible = consent === null || reopened;
  if (!visible) return null;

  function choose(value: "granted" | "denied") {
    setConsent(value);
    setReopened(false);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4 sm:px-6">
      <div className="flex w-full max-w-[640px] flex-col gap-4 rounded-[14px] border border-[rgba(255,255,255,.1)] bg-dropdown-bg p-5 shadow-[0_24px_60px_rgba(0,0,0,.5)] sm:flex-row sm:items-center">
        <p className="flex-1 text-[14px] leading-[1.5] text-on-dark-3">
          We use cookies to understand how KINECT is used and improve it. See our{" "}
          <Link href="/legal/cookies" className="text-on-dark-2 underline">
            Cookie Policy
          </Link>
          .
        </p>
        <div className="flex flex-none gap-2">
          <Button variant="ghost" size="md" onClick={() => choose("denied")}>
            Decline
          </Button>
          <Button variant="primary" size="md" onClick={() => choose("granted")}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Footer "Cookie Preferences" action (design-reference/README.md ~line 94:
 * "...Privacy Policy, Terms and Conditions, Security, and Cookie
 * Preferences" in the footer bottom bar). `settings.footer.legalLinks`
 * already has its own "Cookie Policy" entry routing to the informational
 * `/legal/cookies` page (a Task 14 addition, substituted for the design
 * reference's own "Cookie Preferences" wording -- see Footer.tsx's doc
 * comment on `LEGAL_HREFS`); this is a distinct, additional control for
 * reopening the consent choice itself, not a page navigation, so it's a
 * `<button>` dispatching `kx-open-consent` rather than another `Link`.
 * Lives in this file (not a new file) since it shares the reopen event
 * name/contract directly with ConsentBanner above and the two need to stay
 * in sync.
 *
 * A plain function-typed export from a "use client" module -- Footer.tsx
 * imports and renders it directly (a Server Component rendering a Client
 * Component child is always fine; this is not the "passing a function
 * prop across a Server->Client boundary" restriction TrackedLink.tsx's own
 * doc comment describes, since Footer passes no function props here, only
 * an optional className string).
 */
export function CookiePreferencesButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(REOPEN_EVENT))}
      className={cn("text-[13px] text-[#707B8E]", className)}
    >
      Cookie Preferences
    </button>
  );
}
