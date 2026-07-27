/**
 * Minimal sliding-window rate limiter for the waitlist server action
 * (docs/LAUNCH.md: blocking before Resend goes live). In-memory by intent:
 * on Vercel each warm serverless instance keeps its own counters, so the cap
 * is per-instance, not global. That is the accepted tradeoff for zero added
 * infrastructure -- a burst from one abuser lands on a warm instance and is
 * capped there, which is the attack this exists to stop (bulk inserts into
 * the platform DB / mass confirmation email sends). A distributed attacker
 * spread across many instances needs a shared store (e.g. Upstash) -- noted
 * in docs/LAUNCH.md, not this module's job.
 *
 * Pure and clock-injectable so the window arithmetic is unit-testable.
 */
export function createRateLimiter({
  windowMs,
  max,
}: {
  windowMs: number;
  max: number;
}): (key: string, now?: number) => boolean {
  const hits = new Map<string, number[]>();

  return function allow(key: string, now: number = Date.now()): boolean {
    const cutoff = now - windowMs;

    // Bound memory: once the map grows past plausible-legit size, drop keys
    // whose newest hit already aged out of the window.
    if (hits.size > 1000) {
      for (const [k, stamps] of hits) {
        if (stamps.length === 0 || stamps[stamps.length - 1] <= cutoff) {
          hits.delete(k);
        }
      }
    }

    const live = (hits.get(key) ?? []).filter((t) => t > cutoff);
    if (live.length >= max) {
      // Do not record blocked attempts: hammering while blocked must not
      // push the caller's reset time forward.
      hits.set(key, live);
      return false;
    }
    live.push(now);
    hits.set(key, live);
    return true;
  };
}
