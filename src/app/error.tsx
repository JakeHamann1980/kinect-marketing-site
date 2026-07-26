"use client";

import AsteriskMark from "@/components/AsteriskMark";

/**
 * Release-review defense-in-depth (2026-07-26): a render-time throw
 * anywhere under this segment (the actual bug this task fixed was a
 * malformed Sanity projection reaching a component with no null-guard --
 * see src/lib/sanity.ts's `assert*Shape` functions, now the primary fix)
 * used to have nowhere to land, so Next served its own bare, unstyled 500
 * page. This file is the App Router's `error.js` convention -- it wraps
 * every page/layout below it in a React error boundary and Next renders it
 * automatically on any uncaught error, no wiring required. Error boundaries
 * must be Client Components (Next's own requirement).
 *
 * Kept deliberately tiny: no fetched content (an error here may itself be
 * caused by a fetch failure, so this can't depend on one succeeding), just
 * the brand mark, a plain-language message and a recovery button. `light`
 * canvas/ink tokens (not the site's usual dark hero canvas) since this is
 * meant to read as a plain, calm utility screen, not another marketing
 * section.
 */
export default function Error({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-light-canvas px-6 text-center">
      <AsteriskMark size={32} stroke="var(--accent)" className="mb-6" />
      <h1 className="font-display text-[26px] font-bold text-ink">Something went wrong.</h1>
      <p className="mt-3 max-w-[420px] text-[16px] leading-[1.55] text-ink-3">
        Please give it another try. If it keeps happening, come back in a few minutes.
      </p>
      {/*
        unstable_retry (not plain reset): this Next version's own docs
        recommend it "in most cases" -- it re-fetches/re-renders the
        segment (router.refresh()) before clearing the error, rather than
        reset()'s "clear local state, re-render with whatever's already in
        memory". A malformed-content crash like the one this task fixed is
        exactly the case a plain reset() wouldn't actually recover from
        without a real refetch.
      */}
      <button
        type="button"
        onClick={() => unstable_retry()}
        className="mt-8 inline-flex items-center justify-center rounded-[10px] bg-accent-light px-6 py-[11px] text-[15px] font-semibold text-white"
      >
        Reload
      </button>
    </div>
  );
}
