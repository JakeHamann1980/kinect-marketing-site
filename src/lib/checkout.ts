import { settings } from "@/content/settings";

/**
 * Where a pricing CTA sends someone (user-directed 2026-08-03).
 *
 * NOT a Stripe payment link, deliberately. The platform's checkout action
 * sets `client_reference_id` and `subscription_data.metadata.{workspace_id,
 * plan_key}`, and the webhook resolves every later event -- renewal,
 * upgrade, cancellation, failed payment -- through that metadata. A raw
 * payment link from the marketing site carries none of it, because at that
 * moment there is no workspace and no user: the money would be captured with
 * nothing to provision it against, and the webhook would drop the event.
 *
 * So the site hands off to signup instead. Creating a workspace starts the
 * 14-day trial automatically, and checkout happens in-app where the ids
 * exist. That also matches the offer: sending someone straight to a payment
 * page would charge a person who is entitled to try it free first.
 *
 * WHY THE PLAN KEY IS CODED AND NOT IN SANITY. `starter`/`growth`/`scale`
 * are written into Stripe checkout metadata and read back by the webhook;
 * the platform's own migration says they must never move. An editor who
 * mistyped one in the Studio would misroute a purchase with no error until
 * money changed hands. Sanity owns what is safe to get wrong -- the button
 * LABEL is still content. Code owns what breaks billing.
 */
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://app.kinectnow.com";

/**
 * Display name -> `public.plans.key`. Keyed by name because that is what the
 * rendered tier carries; `tierPlanKeysAreComplete` (see checkout.test.ts)
 * asserts every tier in the local content module has an entry, so a rename
 * fails the build rather than silently degrading.
 */
const PLAN_KEY_BY_TIER: Record<string, string> = {
  Kinect: "starter",
  "Kinect Plus": "growth",
  "Kinect Pro": "scale",
};

export function planKeyForTier(tierName: string): string | null {
  return PLAN_KEY_BY_TIER[tierName] ?? null;
}

/**
 * Signup URL for a tier. An unknown tier degrades to plain signup rather
 * than returning nothing: a renamed tier should still be buyable, just
 * without the plan preselected.
 */
export function signupUrlForTier(tierName: string): string {
  const key = planKeyForTier(tierName);
  return key ? `${APP_URL}/signup?plan=${key}` : `${APP_URL}/signup`;
}

/** Signup with no plan preselected, for the generic "Start free" CTAs. */
export function signupUrl(): string {
  return `${APP_URL}/signup`;
}

/** Every tier name the site currently ships, for the completeness test. */
export function shippedTierNames(): string[] {
  return settings.pricing.tiers.map((t) => t.name);
}
