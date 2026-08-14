/**
 * Local-only banner marking a page as an unapproved draft (user-directed
 * 2026-08-03). These routes 404 on the live site, so this only ever renders
 * for someone running the site locally with NEXT_PUBLIC_ENABLE_DRAFT_PAGES=1
 * -- its job is to stop a work-in-progress page from being mistaken for
 * finished work in a screenshot or a screen share.
 */
export default function DraftNotice({ children }: { children: string }) {
  return (
    <div className="bg-amber/15 border-b border-amber/30">
      <p className="mx-auto max-w-[1000px] px-6 py-2 text-center font-mono text-[11px] uppercase tracking-[.14em] text-amber">
        Draft, not live · {children}
      </p>
    </div>
  );
}
