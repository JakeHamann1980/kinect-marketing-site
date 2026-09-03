import { describe, it, expect } from "vitest";
import { home } from "./home";
import { agency } from "./agency";
import { coach } from "./coach";
import { services } from "./services";
import { consultant } from "./consultant";
import { settings } from "./settings";
import { pricingPage } from "./pricing-page";
import { platformPage } from "./platform-page";
import { privacy } from "./legal/privacy";
import { terms } from "./legal/terms";
import { security } from "./legal/security";
import { cookies } from "./legal/cookies";
import { waitlistDialogCopy, waitlistEmailCopy } from "./waitlist-copy";

const allText = JSON.stringify([
  home,
  agency,
  coach,
  consultant,
  services,
  settings,
  // Both dedicated-page modules get the same guardrails as everything else:
  // pricingPage predates this list and was simply missing; platformPage
  // joined when /platform shipped (2026-08-30).
  pricingPage,
  platformPage,
  privacy,
  terms,
  security,
  cookies,
  // Task 16 follow-up: the waitlist dialog's UI copy and the Resend
  // confirmation email's subject/body are drafted, not-yet-approved copy
  // (see waitlist-copy.ts's own doc comment) -- they get the same voice
  // guardrails as every other piece of site copy rather than a silent
  // exemption just because they live outside content/*.ts's original set.
  waitlistDialogCopy,
  waitlistEmailCopy,
]);

describe("copy constraints", () => {
  it("contains no em dashes", () => {
    expect(allText).not.toMatch(/—/);
  });
  it("contains no emoji or exclamation points", () => {
    // Voice guide: no exclamation points in site copy.
    expect(allText).not.toMatch(/!/);
    expect(allText).not.toMatch(
      /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/u,
    );
  });
  it("pricing tiers are 149/399/799/1499 with Kinect Plus popular", () => {
    const tiers = settings.pricing.tiers;
    expect(tiers.map((t) => t.price)).toEqual([149, 399, 799, 1499]);
    expect(tiers.find((t) => t.popular)?.name).toBe("Kinect Plus");
  });
});

/**
 * Google OAuth app verification (2026-08-30). kinectnow.com/legal/privacy is
 * the URL on KINECT's Google Cloud OAuth consent screen, and the app itself
 * has no legal routes, so this page is the only privacy policy that exists.
 *
 * Reviewers check for specific things. These pin the ones a well-meaning copy
 * edit would quietly remove, because losing them does not break the site --
 * it fails a re-review weeks later, after the 100-user unverified cap has
 * already started biting.
 */
describe("privacy policy: Google OAuth verification requirements", () => {
  const text = privacy.sections.flatMap((s) => s.paragraphs).join("\n");

  it("carries the Limited Use disclosure essentially verbatim", () => {
    expect(text).toContain(
      "KINECT's use and transfer of information received from Google APIs adheres to the",
    );
    expect(text).toContain("including the Limited Use requirements.");
  });

  it("LINKS the policy name, rather than naming it in plain text", () => {
    expect(text).toContain(
      "[Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy)",
    );
  });

  it("tells the user how to revoke access from Google's own settings", () => {
    expect(text).toContain("myaccount.google.com/permissions");
  });

  it("makes the four Limited Use denials explicitly", () => {
    expect(text).toContain("We do not sell information received from Google APIs");
    expect(text).toContain("We do not use it for advertising");
    expect(text).toMatch(/do not use it to train, retrain or improve any artificial intelligence/);
  });

  /**
   * The scope descriptions must match what the platform actually requests.
   * Calendar is the trap: calendar.events is a WRITE scope, and describing it
   * as read-only is the classic scope/description mismatch that gets an app
   * bounced. If a scope changes in the platform, this page changes with it.
   */
  it("describes each Google surface the platform actually requests", () => {
    expect(text).toContain("Google Search Console");
    expect(text).toContain("Google Ads");
    expect(text).toContain("Google Calendar");
    expect(text).toContain("create and update events");
  });

  it("no longer claims KINECT is pre-launch or waitlist-only", () => {
    const lowered = text.toLowerCase();
    expect(lowered).not.toContain("pre-launch");
    expect(lowered).not.toContain("not yet available to the public");
    expect(lowered).not.toContain("marketing site and waitlist only");
  });

  it("names every subprocessor that handles customer data", () => {
    for (const provider of [
      "Supabase",
      "Vercel",
      "Stripe",
      "Resend",
      "Backblaze",
      "Google",
      "Anthropic",
    ]) {
      expect(text).toContain(provider);
    }
  });
});

/**
 * The security page is what a security-conscious buyer and any future
 * questionnaire reads. It went live claiming a pre-launch waitlist while the
 * product had paying customers; these pin the shape of the rewrite so the
 * next edit cannot quietly reintroduce either failure mode - stale framing,
 * or a control we do not actually have.
 */
describe("security page: says what is true, and only that", () => {
  const text = security.sections.flatMap((s) => s.paragraphs).join("\n");

  it("describes a live product, not a waitlist", () => {
    expect(text).toContain("KINECT is live");
    const lowered = text.toLowerCase();
    expect(lowered).not.toContain("pre-launch");
    expect(lowered).not.toContain("waitlist");
  });

  it("does not claim a certification KINECT has not been audited against", () => {
    expect(text).toContain("We do not hold SOC 2, ISO 27001 or any comparable certification today");
  });

  /**
   * SSO does not exist. It has already been claimed twice on this site as
   * though it shipped (home page, 2026-08-30), so the security page states
   * its absence outright rather than staying silent and letting a reader
   * assume.
   */
  it("states plainly that SSO is not available", () => {
    expect(text).toContain("Single sign-on through an identity provider is not available yet");
  });

  it("does not claim application-level encryption of connected-account tokens", () => {
    expect(text.toLowerCase()).not.toContain("tokens are encrypted");
    expect(text.toLowerCase()).not.toContain("encrypted tokens");
  });

  it("leads on the control that actually matters, enforced where it is enforced", () => {
    expect(text).toContain("row-level security");
    expect(text).toContain("enforced in the database rather than in application code");
  });
});
