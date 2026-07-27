import { describe, it, expect } from "vitest";
import { createRateLimiter } from "./rate-limit";

const MIN = 60_000;

describe("createRateLimiter", () => {
  it("allows up to `max` hits inside the window, then blocks", () => {
    const allow = createRateLimiter({ windowMs: 10 * MIN, max: 3 });
    expect(allow("ip-a", 0)).toBe(true);
    expect(allow("ip-a", 1)).toBe(true);
    expect(allow("ip-a", 2)).toBe(true);
    expect(allow("ip-a", 3)).toBe(false);
    expect(allow("ip-a", 4)).toBe(false);
  });

  it("slides: hits older than the window stop counting", () => {
    const allow = createRateLimiter({ windowMs: 10 * MIN, max: 2 });
    expect(allow("ip-a", 0)).toBe(true);
    expect(allow("ip-a", 1 * MIN)).toBe(true);
    expect(allow("ip-a", 2 * MIN)).toBe(false);
    // 10.5 minutes in, the hit at t=0 has aged out; the one at t=1min has not.
    expect(allow("ip-a", 10 * MIN + 30_000)).toBe(true);
    expect(allow("ip-a", 10 * MIN + 31_000)).toBe(false);
  });

  it("blocked attempts do not extend the window", () => {
    const allow = createRateLimiter({ windowMs: 10 * MIN, max: 1 });
    expect(allow("ip-a", 0)).toBe(true);
    // Hammering while blocked must not push the reset time forward.
    for (let t = 1; t <= 9; t++) expect(allow("ip-a", t * MIN)).toBe(false);
    expect(allow("ip-a", 10 * MIN + 1)).toBe(true);
  });

  it("tracks keys independently", () => {
    const allow = createRateLimiter({ windowMs: 10 * MIN, max: 1 });
    expect(allow("ip-a", 0)).toBe(true);
    expect(allow("ip-b", 0)).toBe(true);
    expect(allow("ip-a", 1)).toBe(false);
    expect(allow("ip-b", 1)).toBe(false);
  });

  it("survives the memory sweep without losing live windows", () => {
    const allow = createRateLimiter({ windowMs: 10 * MIN, max: 1 });
    expect(allow("hot-ip", 0)).toBe(true);
    // Flood with distinct stale keys to force the internal sweep...
    for (let i = 0; i < 2000; i++) allow(`cold-${i}`, 1);
    // ...the still-live window must not have been swept away with them.
    expect(allow("hot-ip", 2 * MIN)).toBe(false);
  });
});
