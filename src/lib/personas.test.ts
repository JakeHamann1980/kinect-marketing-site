import { describe, it, expect } from "vitest";
import {
  PERSONAS,
  PERSONA_IDS,
  PROMOTED_PERSONA_IDS,
  personaFromHost,
  homeHrefForHost,
} from "./personas";

describe("personaFromHost", () => {
  it("maps subdomains to personas", () => {
    expect(personaFromHost("agency.kinectnow.com")).toBe("agency");
    expect(personaFromHost("coach.kinectnow.com")).toBe("coach");
    expect(personaFromHost("services.kinectnow.com")).toBe("services");
    expect(personaFromHost("consultant.kinectnow.com")).toBe("consultant");
  });
  it("maps root and unknown hosts to null (home)", () => {
    expect(personaFromHost("kinectnow.com")).toBeNull();
    expect(personaFromHost("www.kinectnow.com")).toBeNull();
    expect(personaFromHost("localhost:3000")).toBeNull();
  });
  it("supports *.localhost for dev", () => {
    expect(personaFromHost("coach.localhost:3000")).toBe("coach");
  });
  it("has config for all personas", () => {
    for (const p of PERSONA_IDS)
      expect(PERSONAS[p].accent).toMatch(/^#/);
  });
});

describe("homeHrefForHost", () => {
  it("links to the apex origin from persona subdomains", () => {
    expect(homeHrefForHost("agency.kinectnow.com", "https:")).toBe(
      "https://kinectnow.com/",
    );
    expect(homeHrefForHost("coach.kinectnow.com", "https:")).toBe(
      "https://kinectnow.com/",
    );
  });
  it("links to the apex origin from *.localhost dev hosts, keeping the port", () => {
    expect(homeHrefForHost("coach.localhost:3000", "http:")).toBe(
      "http://localhost:3000/",
    );
  });
  it("stays a relative root path on non-persona hosts", () => {
    expect(homeHrefForHost("kinectnow.com", "https:")).toBe("/");
    expect(homeHrefForHost("www.kinectnow.com", "https:")).toBe("/");
    expect(homeHrefForHost("kinect-marketing-site.vercel.app", "https:")).toBe("/");
    expect(homeHrefForHost("localhost:3000", "http:")).toBe("/");
  });
  it("never builds a cross-origin URL from a dotless persona-named host", () => {
    expect(homeHrefForHost("agency", "http:")).toBe("/");
  });
});

/**
 * The split that makes retiring a lane survivable. Coach is the live case:
 * sold to nobody, still served to the pilots who were.
 *
 * The failure this guards is silent. Drop a persona from PERSONA_IDS and its
 * subdomain does not 404 -- `personaFromHost` returns null, the proxy's
 * persona branch never fires, and the host answers 200 with the HOME page.
 * Nothing errors, monitoring sees a healthy 200, and the lane's traffic
 * quietly lands on the wrong content.
 */
describe("promoted vs routable personas", () => {
  it("every promoted persona is also routable", () => {
    for (const p of PROMOTED_PERSONA_IDS) {
      expect(PERSONA_IDS).toContain(p);
    }
  });

  it("coach is served but not promoted", () => {
    expect(PERSONA_IDS).toContain("coach");
    expect(PROMOTED_PERSONA_IDS).not.toContain("coach");
  });

  it("promoted stays at three, which the cycler and CSS hardcode", () => {
    expect(PROMOTED_PERSONA_IDS).toHaveLength(3);
  });

  it("every routable persona has a hostname matching its id", () => {
    for (const p of PERSONA_IDS) {
      expect(PERSONAS[p].hostname).toBe(`${p}.kinectnow.com`);
    }
  });
});
