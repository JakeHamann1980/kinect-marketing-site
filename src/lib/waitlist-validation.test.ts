// Task 16 (waitlist): validation/anti-bot rules for the waitlist submission,
// shared by the client dialog (pre-flight) and the server action (the real
// gate -- client-side checks are UX only, never trusted). Plain .ts, no DOM
// needed -- see cycler.test.ts/personas.test.ts for the same "unit"/node
// project convention this file follows (vitest.config.ts routes
// `src/**/*.test.ts` there).
import { describe, expect, it } from "vitest";
import { parseWaitlistInput } from "./waitlist-validation";

const NOW = 1_800_000_000_000; // fixed reference instant, ms epoch

/** A `renderedAt` comfortably more than 2000ms before NOW -- the "human" case. */
const RENDERED_AT_OK = NOW - 5000;

describe("parseWaitlistInput", () => {
  it("accepts a valid, human-timed submission", () => {
    const result = parseWaitlistInput(
      {
        email: "Jake@Example.com",
        renderedAt: RENDERED_AT_OK,
        persona: "agency",
        sourcePath: "/agency",
        utm: { utm_source: "google" },
      },
      NOW,
    );

    expect(result).toEqual({
      ok: true,
      data: {
        email: "jake@example.com",
        persona: "agency",
        sourcePath: "/agency",
        utm: { utm_source: "google" },
      },
    });
  });

  it("normalizes email: trims whitespace and lowercases", () => {
    const result = parseWaitlistInput(
      { email: "  Jake@Example.COM  ", renderedAt: RENDERED_AT_OK },
      NOW,
    );
    expect(result.ok).toBe(true);
    expect(result.ok && result.data.email).toBe("jake@example.com");
  });

  it("passes with only email + renderedAt (persona/sourcePath/utm all optional)", () => {
    const result = parseWaitlistInput({ email: "a@b.com", renderedAt: RENDERED_AT_OK }, NOW);
    expect(result).toEqual({
      ok: true,
      data: { email: "a@b.com", persona: undefined, sourcePath: undefined, utm: undefined },
    });
  });

  it("rejects a missing email", () => {
    const result = parseWaitlistInput({ renderedAt: RENDERED_AT_OK }, NOW);
    expect(result).toEqual({ ok: false, reason: "invalid_email" });
  });

  it("rejects a malformed email", () => {
    const result = parseWaitlistInput({ email: "not-an-email", renderedAt: RENDERED_AT_OK }, NOW);
    expect(result).toEqual({ ok: false, reason: "invalid_email" });
  });

  it("rejects an email missing a TLD", () => {
    const result = parseWaitlistInput({ email: "jake@example", renderedAt: RENDERED_AT_OK }, NOW);
    expect(result).toEqual({ ok: false, reason: "invalid_email" });
  });

  it("rejects when the honeypot field is filled in", () => {
    const result = parseWaitlistInput(
      { email: "a@b.com", company: "Acme Inc", renderedAt: RENDERED_AT_OK },
      NOW,
    );
    expect(result).toEqual({ ok: false, reason: "honeypot" });
  });

  it("accepts when the honeypot field is an empty string", () => {
    const result = parseWaitlistInput({ email: "a@b.com", company: "", renderedAt: RENDERED_AT_OK }, NOW);
    expect(result.ok).toBe(true);
  });

  it("accepts when the honeypot field is only whitespace", () => {
    const result = parseWaitlistInput({ email: "a@b.com", company: "   ", renderedAt: RENDERED_AT_OK }, NOW);
    expect(result.ok).toBe(true);
  });

  it("accepts when the honeypot field is absent entirely", () => {
    const result = parseWaitlistInput({ email: "a@b.com", renderedAt: RENDERED_AT_OK }, NOW);
    expect(result.ok).toBe(true);
  });

  it("rejects a submission faster than 2000ms after render", () => {
    const result = parseWaitlistInput({ email: "a@b.com", renderedAt: NOW - 1999 }, NOW);
    expect(result).toEqual({ ok: false, reason: "too_fast" });
  });

  it("accepts a submission exactly 2000ms after render", () => {
    const result = parseWaitlistInput({ email: "a@b.com", renderedAt: NOW - 2000 }, NOW);
    expect(result.ok).toBe(true);
  });

  it("rejects a missing renderedAt (treated as instant/bot submission)", () => {
    const result = parseWaitlistInput({ email: "a@b.com" }, NOW);
    expect(result).toEqual({ ok: false, reason: "too_fast" });
  });

  it("accepts a string-encoded renderedAt (as FormData delivers it)", () => {
    const result = parseWaitlistInput({ email: "a@b.com", renderedAt: String(RENDERED_AT_OK) }, NOW);
    expect(result.ok).toBe(true);
  });

  it("defaults `now` to Date.now() when omitted", () => {
    // Real-time call, no injected `now` -- exercises the default parameter
    // path directly (every other test above passes `now` explicitly).
    const result = parseWaitlistInput({ email: "a@b.com", renderedAt: Date.now() - 5000 });
    expect(result.ok).toBe(true);
  });
});
