import { describe, it, expect } from "vitest";
import { PERSONAS, personaFromHost, homeHrefForHost } from "./personas";

describe("personaFromHost", () => {
  it("maps subdomains to personas", () => {
    expect(personaFromHost("agency.kinectnow.com")).toBe("agency");
    expect(personaFromHost("coach.kinectnow.com")).toBe("coach");
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
    for (const p of ["agency", "coach", "consultant"] as const)
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
