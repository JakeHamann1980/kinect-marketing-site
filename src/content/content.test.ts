import { describe, it, expect } from "vitest";
import { home } from "./home";
import { agency } from "./agency";
import { coach } from "./coach";
import { services } from "./services";
import { consultant } from "./consultant";
import { settings } from "./settings";
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
  it("pricing tiers are 149/399/799 with Growth popular", () => {
    const tiers = settings.pricing.tiers;
    expect(tiers.map((t) => t.price)).toEqual([149, 399, 799]);
    expect(tiers.find((t) => t.popular)?.name).toBe("Kinect Plus");
  });
});
