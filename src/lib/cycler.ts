/**
 * Pin-state reducer for the screenshot showcase cycler (Task 10; see
 * design-reference/README.md "5. Product showcase with cycling screenshots"
 * and "State Management" -> `pinnedShot`).
 *
 * `pinned: null` means the three screenshots are auto-cycling (the CSS
 * `kx-cyc`/`kx-lab` keyframe animations drive opacity/color). `pinned: i`
 * means layer/label `i` is pinned: animation is paused and that layer is
 * forced visible. Clicking the already-pinned label resumes auto-cycling;
 * clicking a different label re-pins directly to it without passing
 * through the unpinned state.
 */
export type CyclerState = { pinned: number | null };

export function clickLabel(s: CyclerState, i: number): CyclerState {
  return s.pinned === i ? { pinned: null } : { pinned: i };
}
