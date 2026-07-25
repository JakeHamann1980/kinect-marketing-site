// Task 15: consent store tests.
//
// This module (src/lib/consent.ts) is a plain .ts file with no JSX of its
// own -- everywhere else in this codebase, plain-logic unit tests live in a
// sibling `*.test.ts` file, which vitest.config.ts's "unit" project runs
// under the "node" environment (see that config's own header comment).
// consent.ts reads/writes `window.localStorage` and dispatches a
// `window.CustomEvent`, neither of which the plain "node" environment
// provides (no `window` global at all) -- see cycler.test.ts /
// personas.test.ts for what a "node" project test normally looks like, none
// of which touch globals like this.
//
// Two ways to keep this TDD-able under "unit": (a) mock `window`/
// `localStorage` by hand in a .ts file, or (b) place the test file so it
// runs under the "component" (jsdom) project instead, which already
// provides a real `window`/`localStorage`/`CustomEvent` with no mocking.
// Vitest 4's `test.projects` selects a project purely by the test file's
// extension/glob (`src/**/*.test.ts` -> unit/node, `src/**/*.test.tsx` ->
// component/jsdom; see vitest.config.ts), not by any per-file directive, so
// (b) only requires naming this file `consent.test.tsx` even though it
// renders no JSX and imports no React -- disclosed here rather than
// silently relying on the extension. Chosen over (a): real jsdom globals
// exercise the actual `window.localStorage`/`CustomEvent` codepaths end to
// end, instead of a hand-rolled mock that could quietly drift from the
// browser APIs consent.ts actually calls.
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getConsent, setConsent, onConsentChange, type Consent } from "./consent";

const KEY = "kx-consent";

beforeEach(() => {
  window.localStorage.clear();
});

describe("getConsent", () => {
  it("returns null when nothing is stored", () => {
    expect(getConsent()).toBeNull();
  });

  it("returns the stored value", () => {
    window.localStorage.setItem(KEY, "granted");
    expect(getConsent()).toBe("granted");

    window.localStorage.setItem(KEY, "denied");
    expect(getConsent()).toBe("denied");
  });

  it("returns null for a garbage stored value", () => {
    window.localStorage.setItem(KEY, "yes-please");
    expect(getConsent()).toBeNull();
  });
});

describe("setConsent", () => {
  it("persists the value to localStorage under kx-consent", () => {
    setConsent("granted");
    expect(window.localStorage.getItem(KEY)).toBe("granted");
  });

  it("makes the persisted value visible to a subsequent getConsent call", () => {
    setConsent("denied");
    expect(getConsent()).toBe("denied");
  });

  it("dispatches a kx-consent CustomEvent on window carrying the new value", () => {
    const handler = vi.fn();
    window.addEventListener("kx-consent", handler);
    setConsent("granted");
    window.removeEventListener("kx-consent", handler);

    expect(handler).toHaveBeenCalledTimes(1);
    const event = handler.mock.calls[0][0] as CustomEvent<Consent>;
    expect(event.detail).toBe("granted");
  });
});

describe("onConsentChange", () => {
  it("invokes the callback with the new value when consent changes", () => {
    const cb = vi.fn();
    onConsentChange(cb);
    setConsent("granted");
    expect(cb).toHaveBeenCalledWith("granted");
  });

  it("returns an unsubscribe function that stops future notifications", () => {
    const cb = vi.fn();
    const unsubscribe = onConsentChange(cb);
    unsubscribe();
    setConsent("denied");
    expect(cb).not.toHaveBeenCalled();
  });

  it("supports multiple independent subscribers", () => {
    const a = vi.fn();
    const b = vi.fn();
    onConsentChange(a);
    onConsentChange(b);
    setConsent("granted");
    expect(a).toHaveBeenCalledWith("granted");
    expect(b).toHaveBeenCalledWith("granted");
  });
});
