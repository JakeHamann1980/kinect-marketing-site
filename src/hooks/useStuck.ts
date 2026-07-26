"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Tracks whether the sticky nav has scrolled past its 1px sentinel.
 * Per design-reference/README.md "Global Elements -> Sticky transparent nav":
 * an IntersectionObserver watches a sentinel placed just above the sticky
 * wrapper; once it leaves the viewport the nav should gain its "stuck"
 * (opaque, blurred) treatment.
 */
export function useStuck() {
  const sentinelRef = useRef<HTMLSpanElement>(null);
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    // Geometry-based fallback used for the initial state and whenever the
    // observer can't be trusted. Backgrounded/throttled documents (embedded
    // preview panes, bfcache restores) can deliver a single bogus
    // non-intersecting entry and then stop firing entirely, freezing the nav
    // in the stuck state; the scroll listener keeps the state truthful there.
    const sync = () => setStuck(el.getBoundingClientRect().bottom < 0);
    const obs = new IntersectionObserver(([e]) => {
      if (document.visibilityState === "hidden") return;
      setStuck(!e.isIntersecting);
    });
    obs.observe(el);
    sync();
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("scroll", sync, { passive: true });
    return () => {
      obs.disconnect();
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("scroll", sync);
    };
  }, []);
  return { sentinelRef, stuck };
}
