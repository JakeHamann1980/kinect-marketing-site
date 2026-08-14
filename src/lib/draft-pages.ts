/**
 * Draft pages gate (user-directed 2026-08-03).
 *
 * "Docs" (a nav item) and "Platform" (a footer column) were placeholders
 * from the design handoff pointing at "#". Jake asked for them to be built
 * out for local testing while staying OFF the live site until their content
 * and purpose are settled. This module is the single switch.
 *
 * Enabled by `NEXT_PUBLIC_ENABLE_DRAFT_PAGES=1` (set in the local, gitignored
 * `.env.local`; deliberately NOT set in Vercel). It is a NEXT_PUBLIC_ var
 * because Nav is a Client Component, so the value has to survive into the
 * browser bundle -- it is inlined at build time, which also means the live
 * build has no code path that can turn drafts on at runtime.
 *
 * Two layers enforce it, because either alone would leak:
 *  - these filters hide the nav item and footer column, and
 *  - `/docs` and `/platform` call `notFound()` when disabled, so the routes
 *    404 rather than sitting there unlinked but publicly reachable (and
 *    crawlable).
 */
export const DRAFT_PAGES_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_DRAFT_PAGES === "1";

interface MaybeDraft {
  draft?: boolean;
}

/**
 * Any flat list of links, minus anything marked `draft` unless drafts are
 * enabled. Used for the nav, the footer's legal row, and the social icons --
 * the rule is identical for all three, so they share one implementation.
 */
export function visibleLinks<T extends MaybeDraft>(
  links: T[],
  enabled: boolean = DRAFT_PAGES_ENABLED,
): T[] {
  return enabled ? links : links.filter((link) => !link.draft);
}

/**
 * Footer columns, minus draft columns AND draft links inside surviving
 * columns (a shipping column can still list a draft destination -- e.g.
 * "Docs" under Resources -- and that link must disappear with the rest).
 *
 * A column left with NO links is dropped entirely: once every Resources
 * entry was gated, keeping the column would have rendered a bare
 * "Resources" heading over empty space. Returns new objects rather than
 * mutating the fetched settings.
 */
export function visibleFooterColumns<
  L extends MaybeDraft,
  C extends MaybeDraft & { links: L[] },
>(columns: C[], enabled: boolean = DRAFT_PAGES_ENABLED): C[] {
  if (enabled) return columns;
  return columns
    .filter((column) => !column.draft)
    .map((column) => ({ ...column, links: column.links.filter((l) => !l.draft) }))
    .filter((column) => column.links.length > 0);
}
