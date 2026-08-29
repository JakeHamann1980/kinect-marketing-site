import { describe, it, expect } from "vitest";
import { planKeyForTier, signupUrlForTier, shippedTierNames } from "./checkout";

describe("checkout handoff", () => {
  it("maps every shipped tier to a plan key", () => {
    // The guard that matters: rename a tier in settings.ts without updating
    // the map and this fails, instead of quietly sending buyers to a signup
    // with no plan selected.
    for (const name of shippedTierNames()) {
      expect(planKeyForTier(name), `no plan key for tier "${name}"`).not.toBeNull();
    }
  });

  it("uses the platform's own keys, which Stripe metadata depends on", () => {
    expect(planKeyForTier("Kinect")).toBe("starter");
    expect(planKeyForTier("Kinect Plus")).toBe("growth");
    expect(planKeyForTier("Kinect Pro")).toBe("scale");
  });

  it("builds a signup URL carrying the plan", () => {
    expect(signupUrlForTier("Kinect Plus")).toMatch(/\/signup\?plan=growth$/);
  });

  it("degrades to plain signup for an unknown tier rather than breaking", () => {
    expect(signupUrlForTier("Kinect Infinity")).toMatch(/\/signup$/);
  });

  it("never points at Stripe directly", () => {
    // A raw payment link would arrive with no workspace_id, which the
    // platform webhook cannot attribute. See this module's header.
    for (const name of shippedTierNames()) {
      expect(signupUrlForTier(name)).not.toMatch(/stripe|buy\.stripe/i);
    }
  });
});
