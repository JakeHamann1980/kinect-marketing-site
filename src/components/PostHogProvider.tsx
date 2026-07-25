"use client";

import { useEffect, useRef, type ReactNode } from "react";
import posthog from "posthog-js";
import { getConsent, onConsentChange, type Consent } from "@/lib/consent";
import { setAnalyticsReady, track } from "@/lib/analytics";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;

/**
 * `api_host: "/ph"` routes through the reverse-proxy rewrites added to
 * next.config.ts (`/ph/static/*` -> PostHog's asset CDN, `/ph/*` -> the
 * ingestion API) so first-party requests aren't blocked by ad blockers /
 * ITP the way a direct `us.i.posthog.com` call would be. `ui_host` stays
 * the real PostHog app origin -- it's only used to build links back into
 * the PostHog UI (e.g. toolbar), never fetched from the browser.
 */
function initPostHog(): boolean {
  if (!POSTHOG_KEY) return false;
  posthog.init(POSTHOG_KEY, {
    api_host: "/ph",
    ui_host: "https://us.posthog.com",
    persistence: "localStorage+cookie",
    capture_pageview: true,
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
 * pageview) followed by `posthog.reset(true)` (posthog-js 1.407 API,
 * confirmed against node_modules/posthog-js/dist/module.d.ts --
 * `reset(reset_device_id?: boolean)`; passing `true` also rotates the
 * anonymous device id, not just the session, so nothing from the
 * opted-in period keeps accumulating under the old id if the user
 * later re-consents).
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
