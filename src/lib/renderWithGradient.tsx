import type { ReactNode } from "react";

/**
 * Splits a headline on its gradient phrase and wraps just that phrase in
 * `.kx-grad` (design-reference/README.md "Gradient text"), used by both the
 * home hero and closing CTA headlines (`home.hero.headline` /
 * `home.hero.gradientPhrase`, `home.closing.headline` /
 * `home.closing.gradientPhrase`). Falls back to rendering the headline
 * plain -- and warns in development -- if the phrase isn't found verbatim,
 * e.g. a future copy edit to one field without the other.
 */
export function renderWithGradient(headline: string, phrase: string): ReactNode {
  const index = headline.indexOf(phrase);

  if (index === -1) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `renderWithGradient: gradient phrase ${JSON.stringify(phrase)} not found in headline ${JSON.stringify(headline)}; rendering plain.`,
      );
    }
    return headline;
  }

  const before = headline.slice(0, index);
  const after = headline.slice(index + phrase.length);

  return (
    <>
      {before}
      <span className="kx-grad">{phrase}</span>
      {after}
    </>
  );
}
