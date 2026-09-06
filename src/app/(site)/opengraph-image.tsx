import { ImageResponse } from "next/og";
import { home } from "@/content/home";
import { OG_SIZE, loadScreenshot, ogFonts, ogTemplate, SITE_HOST } from "@/lib/og-template";

/**
 * Home's OG image, via Next's `opengraph-image.tsx` file convention. It
 * lives HERE, in the `(site)` segment next to `page.tsx`, not at
 * `src/app/`: a file one level up is never attached to `/`, because this
 * page's `generateMetadata` replaces the inherited `openGraph` block and
 * only the same segment's file is re-attached afterwards (the placement
 * rule in `src/lib/og-template.tsx`). Product variant: the agency
 * analytics screenshot the hero showcase opens on, so the preview shows
 * the product rather than a sentence about it.
 */
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "KINECT -- a client portal for agencies, professional services firms and consultants.";

export default async function Image() {
  const [fonts, screenshot] = await Promise.all([
    ogFonts(),
    loadScreenshot(home.showcase.screenshots.agency.src),
  ]);
  return new ImageResponse(
    await ogTemplate({
      eyebrow: "Client Portal Software",
      headline: home.hero.headline,
      gradientPhrase: home.hero.gradientPhrase,
      screenshot,
      footer: SITE_HOST,
    }),
    { ...size, fonts },
  );
}
