import { describe, it, expect } from "vitest";
import { PERSONAS, personaFromHost } from "./personas";

describe("personaFromHost", () => {
  it("maps subdomains to personas", () => {
    expect(personaFromHost("agency.kinectapp.ai")).toBe("agency");
    expect(personaFromHost("coach.kinectapp.ai")).toBe("coach");
    expect(personaFromHost("consultant.kinectapp.ai")).toBe("consultant");
  });
  it("maps root and unknown hosts to null (home)", () => {
    expect(personaFromHost("kinectapp.ai")).toBeNull();
    expect(personaFromHost("www.kinectapp.ai")).toBeNull();
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
