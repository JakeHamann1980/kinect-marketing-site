import type { ReactNode } from "react";

/**
 * Inline links inside legal prose.
 *
 * `LegalSection.paragraphs` is `string[]` and the Sanity schema mirrors that,
 * so the cheapest way to get ONE hyperlink into the privacy policy without a
 * schema migration and a reseed of every legal document is a tiny markdown
 * subset: `[text](url)`.
 *
 * Why it exists at all (2026-08-30): Google's OAuth verification reviewers
 * look for the Limited Use disclosure with "Google API Services User Data
 * Policy" LINKED to the policy itself. A bare URL in prose is weaker, and an
 * unlinked policy name is the specific thing that gets a submission bounced.
 *
 * Deliberately NOT a markdown renderer. No emphasis, no lists, no raw HTML,
 * and nothing is ever passed to dangerouslySetInnerHTML — every piece comes
 * back as a React node, so text stays escaped by React itself. The only
 * thing this understands is a link, because the only thing legal prose here
 * needs is a link.
 */

const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;

/**
 * Only absolute https, mailto, and site-relative paths. A `javascript:` or
 * `data:` href in an href position is the classic injection route, and this
 * content is authored in Sanity — where a Studio editor, not a reviewer of
 * this file, decides what the string says.
 */
function isSafeHref(href: string): boolean {
  return (
    href.startsWith("https://") || href.startsWith("mailto:") || href.startsWith("/")
  );
}

export function renderLegalText(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  LINK.lastIndex = 0;

  while ((match = LINK.exec(text)) !== null) {
    const [full, label, href] = match;
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));

    if (isSafeHref(href)) {
      nodes.push(
        <a
          key={`${match.index}-${href}`}
          href={href}
          className="underline decoration-from-font underline-offset-2"
          style={{ color: "var(--accent-light)" }}
          {...(href.startsWith("https://")
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {label}
        </a>
      );
    } else {
      // An unsafe href degrades to the plain label. Dropping the whole
      // paragraph would hide a legal statement; rendering the raw markup
      // would show the reader syntax. The words survive, the link does not.
      nodes.push(label);
    }
    lastIndex = match.index + full.length;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}
