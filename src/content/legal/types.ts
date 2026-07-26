/**
 * Shared shape for the four legal pages (Task 14: Legal Pages). Each of
 * privacy.ts, terms.ts, security.ts and cookies.ts exports one `LegalPage`
 * object consumed by the single `/legal/[slug]` template
 * (src/app/(site)/legal/[slug]/page.tsx). `slug` doubles as the route param and the
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
  /**
   * Task 19 (Metadata, Robots, Sitemaps, Canonicals): per-page SEO fields,
   * matching the `Seo` shape used by home/persona content. Legal pages get
   * simple "<Title> | KINECT" titles and a one-line description rather than
   * the persona-targeted copy the marketing pages carry.
   */
  seo: { title: string; description: string };
}
