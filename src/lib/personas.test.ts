import { describe, it, expect } from "vitest";
import { PERSONAS, personaFromHost } from "./personas";

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
