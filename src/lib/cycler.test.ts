import { describe, it, expect } from "vitest";
import { clickLabel, type CyclerState } from "./cycler";

describe("clickLabel", () => {
  it("pins a label when unpinned", () => {
    const s: CyclerState = { pinned: null };
    expect(clickLabel(s, 0)).toEqual({ pinned: 0 });
  });

  it("unpins (resumes auto-cycle) when clicking the already-pinned label", () => {
    const s: CyclerState = { pinned: 1 };
    expect(clickLabel(s, 1)).toEqual({ pinned: null });
  });

  it("re-pins directly to a different label without passing through unpinned", () => {
    const s: CyclerState = { pinned: 0 };
    expect(clickLabel(s, 2)).toEqual({ pinned: 2 });
  });

  it("pins from unpinned for every index", () => {
    const s: CyclerState = { pinned: null };
    expect(clickLabel(s, 0)).toEqual({ pinned: 0 });
    expect(clickLabel(s, 1)).toEqual({ pinned: 1 });
    expect(clickLabel(s, 2)).toEqual({ pinned: 2 });
  });
});
