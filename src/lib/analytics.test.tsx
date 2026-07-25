// Task 15: analytics wrapper tests.
//
// Same project-placement decision as src/lib/consent.test.tsx (see that
// file's header comment for the full rationale): this is a plain .ts
// module test, but it reads/writes `window.localStorage` and
// `window.location`, so it's named `.tsx` on purpose to run under
// vitest.config.ts's jsdom "component" project instead of the default
// "node" one, which has neither global.
import { beforeEach, describe, expect, it, vi } from "vitest";

// vi.mock factories are hoisted above the rest of the module, so the mock
// fn itself must be created inside vi.hoisted() rather than referenced from
// a plain top-level const (which vitest's own error message here points
// at directly: "Cannot access 'captureMock' before initialization").
const { captureMock } = vi.hoisted(() => ({ captureMock: vi.fn() }));
vi.mock("posthog-js", () => ({
  default: { capture: captureMock },
}));

import { track, firstTouchUtms, setAnalyticsReady } from "./analytics";

function setUrl(path: string) {
  window.history.pushState({}, "", path);
}

beforeEach(() => {
  window.localStorage.clear();
  captureMock.mockClear();
  setAnalyticsReady(false);
  setUrl("/");
});

describe("firstTouchUtms", () => {
  it("captures utm params present on the first call", () => {
    setUrl("/?utm_source=google&utm_medium=cpc&utm_campaign=spring&utm_content=ad1&utm_term=kw1");
    expect(firstTouchUtms()).toEqual({
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "spring",
      utm_content: "ad1",
      utm_term: "kw1",
    });
  });

  it("persists the captured set to localStorage under kx-utm", () => {
    setUrl("/?utm_source=google");
    firstTouchUtms();
    expect(JSON.parse(window.localStorage.getItem("kx-utm")!)).toEqual({ utm_source: "google" });
  });

  it("captures an empty set when no utm params are present on first visit", () => {
    expect(firstTouchUtms()).toEqual({});
    expect(window.localStorage.getItem("kx-utm")).not.toBeNull();
  });

  it("returns the ORIGINAL first-touch set on later calls, ignoring the current URL", () => {
    setUrl("/?utm_source=google&utm_medium=cpc");
    expect(firstTouchUtms()).toEqual({ utm_source: "google", utm_medium: "cpc" });

    // A later visit/call with different (or no) utm params in the URL must
    // not overwrite the first-touch attribution.
    setUrl("/?utm_source=facebook");
    expect(firstTouchUtms()).toEqual({ utm_source: "google", utm_medium: "cpc" });

    setUrl("/");
    expect(firstTouchUtms()).toEqual({ utm_source: "google", utm_medium: "cpc" });
  });

  it("ignores non-utm query params", () => {
    setUrl("/?utm_source=google&ref=abc123");
    expect(firstTouchUtms()).toEqual({ utm_source: "google" });
  });
});

describe("track", () => {
  it("does not call posthog.capture when analytics isn't ready (no key / no consent)", () => {
    setAnalyticsReady(false);
    track("cta_clicked", { location: "hero" });
    expect(captureMock).not.toHaveBeenCalled();
  });

  it("calls posthog.capture with the event and merged persona/utm/props once ready", () => {
    setAnalyticsReady(true);
    setUrl("/?utm_source=google");
    track("cta_clicked", { location: "hero" });

    expect(captureMock).toHaveBeenCalledTimes(1);
    expect(captureMock).toHaveBeenCalledWith("cta_clicked", {
      persona: "home",
      utm_source: "google",
      location: "hero",
    });
  });

  it("derives persona from the current pathname", () => {
    setAnalyticsReady(true);

    setUrl("/agency");
    track("cta_clicked");
    expect(captureMock).toHaveBeenLastCalledWith("cta_clicked", expect.objectContaining({ persona: "agency" }));

    setUrl("/coach");
    track("cta_clicked");
    expect(captureMock).toHaveBeenLastCalledWith("cta_clicked", expect.objectContaining({ persona: "coach" }));

    setUrl("/consultant");
    track("cta_clicked");
    expect(captureMock).toHaveBeenLastCalledWith("cta_clicked", expect.objectContaining({ persona: "consultant" }));

    setUrl("/legal/cookies");
    track("cta_clicked");
    expect(captureMock).toHaveBeenLastCalledWith("cta_clicked", expect.objectContaining({ persona: "home" }));
  });

  it("lets explicit call props override the auto-injected persona", () => {
    setAnalyticsReady(true);
    setUrl("/"); // page-context persona would be "home"
    track("persona_card_clicked", { persona: "agency" });
    expect(captureMock).toHaveBeenCalledWith("persona_card_clicked", expect.objectContaining({ persona: "agency" }));
  });
});
