import { describe, it, expect } from "vitest";
import { home } from "./home";
import { agency } from "./agency";
import { coach } from "./coach";
import { consultant } from "./consultant";
import { settings } from "./settings";

const allText = JSON.stringify([home, agency, coach, consultant, settings]);

describe("copy constraints", () => {
  it("contains no em dashes", () => {
    expect(allText).not.toMatch(/—/);
  });
  it("contains no emoji or exclamation points", () => {
    expect(allText).not.toMatch(/!/);
    expect(allText).not.toMatch(/[\u{1F300}-\u{1FAFF}]/u);
  });
  it("pricing tiers are 149/399/799 with Growth popular", () => {
    const tiers = settings.pricing.tiers;
    expect(tiers.map((t) => t.price)).toEqual([149, 399, 799]);
    expect(tiers.find((t) => t.popular)?.name).toBe("Growth");
  });
});
