import type { ReactNode } from "react";

/**
 * Inline markup inside legal prose: links and bold, nothing else.
 *
 * `LegalSection.paragraphs` is `string[]` and the Sanity schema mirrors that,
 * so the cheapest way to get ONE hyperlink into the privacy policy without a
 * schema migration and a reseed of every legal document is a tiny markdown
 * subset: `[text](url)` and `**bold**`.
 *
 * BOLD (2026-08-30): Texas applies a CONSPICUOUSNESS requirement to warranty
 * disclaimers and limitations of liability. KINECT is a Texas LLC, so the
 * Terms of Service being drafted (docs/TERMS-OF-SERVICE-DRAFT.md) may need
 * those sections visually set apart to be enforceable. Discovering that on
 * the day counsel approves the terms would be the wrong time.
 *
 * Why it exists at all (2026-08-30): Google's OAuth verification reviewers
 * look for the Limited Use disclosure with "Google API Services User Data
 * Policy" LINKED to the policy itself. A bare URL in prose is weaker, and an
 * unlinked policy name is the specific thing that gets a submission bounced.
 *
 * Deliberately NOT a markdown renderer. No headings, lists, italics or raw HTML,
 * and nothing is ever passed to dangerouslySetInnerHTML — every piece comes
 * back as a React node, so text stays escaped by React itself.
 *
 * Not nestable. `[**a**](url)` renders the asterisks literally inside the
 * link, and `**[a](url)**` bolds the literal bracket text. Both are trivially
 * avoidable when authoring, and supporting them means a real parser.
 */

const MARKUP = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

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
  MARKUP.lastIndex = 0;

  while ((match = MARKUP.exec(text)) !== null) {
    const [full, bold, label, href] = match;
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));

    if (bold !== undefined) {
      nodes.push(
        <strong key={`${match.index}-b`} className="font-semibold text-ink">
          {bold}
        </strong>
      );
    } else if (isSafeHref(href)) {
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
