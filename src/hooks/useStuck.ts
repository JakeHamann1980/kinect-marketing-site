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
    const obs = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { sentinelRef, stuck };
}
