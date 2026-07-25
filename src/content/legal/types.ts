/**
 * Shared shape for the four legal pages (Task 14: Legal Pages). Each of
 * privacy.ts, terms.ts, security.ts and cookies.ts exports one `LegalPage`
 * object consumed by the single `/legal/[slug]` template
 * (src/app/legal/[slug]/page.tsx). `slug` doubles as the route param and the
 * lookup key `generateStaticParams`/the page component use to resolve
 * content, so it must match this module's filename (`privacy`, `terms`,
 * `security`, `cookies`).
 */
export interface LegalSection {
  heading: string;
  paragraphs: string[];
}

export interface LegalPage {
  slug: string;
  title: string;
  /** ISO date string ("YYYY-MM-DD") rendered as the page's "Last updated" line. */
  updated: string;
  sections: LegalSection[];
}
