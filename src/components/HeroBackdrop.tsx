/**
 * Decorative backdrop for dark hero-style sections (home hero, closing CTA).
 *
 * Contract: this component renders ONLY the orbs (layer 2) and trace lines
 * (layer 3) of the three-layer hero background described in
 * design-reference/README.md ("Hero (dark) -> Background, three layers").
 * It does not render the grid + dots layer (layer 1, `.kx-grid`).
 *
 * `.kx-grid` is a plain CSS background-image on the section element itself
 * -- it is cheap, static, and needs to stretch across the full section
 * (including areas outside this component's box), so the PARENT section is
 * responsible for carrying the `.kx-grid` class directly:
 *
 *   <section className="kx-grid relative overflow-hidden">
 *     <HeroBackdrop />
 *     <div className="relative z-10"> ...actual hero content... </div>
 *   </section>
 *
 * This component renders a single absolutely-positioned, `overflow:hidden`,
 * `aria-hidden` container that fills its nearest positioned ancestor (the
 * parent section above must be `position: relative` or similar). Render it
 * before the section's real content in DOM order so the content paints on
 * top without needing its own stacking context, though giving the content
 * an explicit `position: relative` (or `z-10`+) is recommended for safety.
 *
 * All motion here is decorative and is disabled under
 * `prefers-reduced-motion: reduce` via the `.kx-orb`/`.kx-trace` rules in
 * globals.css.
 */
export default function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="kx-orb kx-orb-left" />
      <div className="kx-orb kx-orb-right" />

      <span className="kx-trace kx-trace-h" style={{ top: 104, animationDelay: "-3s", animationDuration: "29s", opacity: 0.85 }} />
      <span className="kx-trace kx-trace-h" style={{ top: 416, animationDelay: "11s", animationDuration: "23s", width: "30%" }} />
      <span className="kx-trace kx-trace-h" style={{ top: 624, animationDelay: "19.5s", animationDuration: "34s", width: "46%", opacity: 0.7 }} />

      <span className="kx-trace kx-trace-v" style={{ left: 208, animationDelay: "-7s", animationDuration: "37s", height: "28%" }} />
      <span className="kx-trace kx-trace-v" style={{ left: 520, animationDelay: "14.5s", animationDuration: "28s", opacity: 0.75 }} />
      <span className="kx-trace kx-trace-v" style={{ left: 936, animationDelay: "24s", animationDuration: "41s", height: "40%", opacity: 0.6 }} />
    </div>
  );
}
