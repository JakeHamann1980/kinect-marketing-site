"use client";

import { useEffect, useRef, type ReactNode } from "react";
import posthog from "posthog-js";
import { getConsent, onConsentChange, type Consent } from "@/lib/consent";
import { setAnalyticsReady, track } from "@/lib/analytics";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;

/**
 * `api_host: "/ph"` routes through the reverse-proxy rewrites added to
 * next.config.ts (`/ph/static/*` and `/ph/array/*` -> PostHog's asset CDN,
 * `/ph/*` -> the ingestion API) so first-party requests aren't blocked by
 * ad blockers / ITP the way a direct `us.i.posthog.com` call would be.
 * `ui_host` stays the real PostHog app origin -- it's only used to build
 * links back into the PostHog UI (e.g. toolbar), never fetched from the
 * browser.
 *
 * `autocapture: false` and `capture_pageleave: false` (post-launch fix,
 * adversarial review 2026-07-25): PostHog's default `autocapture: true`
 * sends a `$autocapture` event for essentially every click/submit/change
 * site-wide the moment consent is granted -- an entirely separate,
 * undisclosed capture path that bypasses `src/lib/analytics.ts`'s `track()`
 * seam and the closed `KxEvent` union entirely. The product decision is
 * that the typed taxonomy (`cta_clicked`, `faq_opened`, etc. -- see
 * analytics.ts) IS the analytics contract: if a click matters, it gets a
 * named event through `track()`; nothing else should be silently
 * capturing every DOM interaction on top of that. `capture_pageleave`
 * defaults to true alongside `capture_pageview` and isn't part of this
 * taxonomy either, so it's disabled for the same reason. `capture_pageview`
 * stays on -- it's the one built-in PostHog capture this task's brief
 * explicitly asked for.
 */
function initPostHog(): boolean {
  if (!POSTHOG_KEY) return false;
  posthog.init(POSTHOG_KEY, {
    api_host: "/ph",
    ui_host: "https://us.posthog.com",
    persistence: "localStorage+cookie",
    capture_pageview: true,
    autocapture: false,
    capture_pageleave: false,
  });
  return true;
}

/**
 * Task 15: consent-gated PostHog bootstrap. Mounted once in the root
 * layout, wrapping the rest of the tree (it renders `children` unchanged --
 * this component's only job is the side effect).
 *
 * Two distinct moments matter here, handled differently:
 *  - Page load with consent already "granted" from an earlier session: init
 *    PostHog silently so analytics resumes. This is NOT a "flip" -- no
 *    consent_updated fire, since nothing about the user's choice actually
 *    changed just now.
 *  - A live consent change (the ConsentBanner calling setConsent): granted
 *    initializes PostHog (if not already) and fires `consent_updated
 *    {granted: true}`; denied opts out and tears down any initialized
 *    client so no further events/identifiers persist.
 *
 * Teardown on denied-after-init uses `posthog.opt_out_capturing()` (stops
 * all future capture calls immediately, including the autocaptured
 * pageview -- "autocaptured" here means PostHog's own built-in
 * `capture_pageview` pageview event, not the `autocapture` DOM-click
 * feature, which is disabled entirely, see `initPostHog`'s own doc
 * comment) followed by `posthog.reset(true)` (posthog-js 1.407 API,
 * confirmed against node_modules/posthog-js/dist/module.d.ts --
 * `reset(reset_device_id?: boolean)`; passing `true` also rotates the
 * anonymous device id, not just the session, so nothing from the
 * opted-in period keeps accumulating under the old id if the user
 * later re-consents).
 *
 * Two disclosed limitations of that teardown (adversarial review
 * 2026-07-25):
 *  (a) `reset(true)` rotates posthog-js's own stored identifiers, but it
 *      does not delete its localStorage/cookie entries outright -- a new
 *      anonymous entry lands in their place (empty/reset, not absent).
 *      This is harmless here: a fresh reload after a live Decline reads
 *      `getConsent()` (this app's own `kx-consent` key, a separate
 *      mechanism from posthog-js's storage) as "denied" and never calls
 *      `initPostHog` at all, so a reload post-decline produces zero `/ph`
 *      activity regardless of whatever posthog-js left behind locally.
 *  (b) There is a narrow, accepted race at the live-decline transition
 *      itself: a `/ph/e` (capture) or `/ph/flags` request already
 *      in-flight at the moment `opt_out_capturing`/`reset` run is not
 *      cancelled, and may complete a moment after the user clicked
 *      Decline. This is a one-time, already-in-flight request tied to
 *      activity that happened *before* the decline (never a *new*
 *      request afterward, since `setAnalyticsReady(false)` and
 *      `opt_out_capturing()` both take effect synchronously), and matches
 *      standard PostHog/browser-SDK opt-out behavior generally -- treated
 *      as a known, accepted limitation rather than something this
 *      component tries to abort.
 *
 * Graceful no-op: `NEXT_PUBLIC_POSTHOG_KEY` is not set yet (per this
 * task's brief, the project key isn't available until a later task).
 * `initPostHog` returns false without calling `posthog.init` at all in that
 * case, so `setAnalyticsReady` stays false and every `track()` call from
 * `src/lib/analytics.ts` no-ops -- no crash, no network request, even if
 * the user clicks Accept.
 */
export default function PostHogProvider({ children }: { children: ReactNode }) {
  const initializedRef = useRef(false);

  useEffect(() => {
    if (getConsent() === "granted") {
      const ok = initPostHog();
      initializedRef.current = ok;
      setAnalyticsReady(ok);
    }

    function handleChange(next: Consent) {
      if (next === "granted") {
        if (!initializedRef.current) {
          const ok = initPostHog();
          initializedRef.current = ok;
          setAnalyticsReady(ok);
        }
        if (initializedRef.current) track("consent_updated", { granted: true });
      } else {
        if (initializedRef.current) {
          posthog.opt_out_capturing();
          posthog.reset(true);
          initializedRef.current = false;
        }
        setAnalyticsReady(false);
      }
    }

    return onConsentChange(handleChange);
  }, []);

  return <>{children}</>;
}
