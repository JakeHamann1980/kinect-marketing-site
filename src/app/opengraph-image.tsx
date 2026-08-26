import { ImageResponse } from "next/og";
import { home } from "@/content/home";
import { OG_SIZE, ogFonts, ogTemplate, SITE_HOST } from "@/lib/og-template";

/**
 * Task 21 (OG Images + Preview Metadata). Home's OG image, via Next's
 * `opengraph-image.tsx` file convention -- Next auto-attaches this route's
 * output as `og:image`/`twitter:image` (absolute URL, since
 * `metadataBase` is set in `src/lib/seo.ts`) for every page under this
 * segment (home only; the persona/legal segments each carry their own
 * sibling file). See `src/lib/og-template.tsx` for the shared layout,
 * font-loading approach, and every Satori constraint this design works
 * around.
 */
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "KINECT -- a client portal for agencies, professional services firms and consultants.";

export default async function Image() {
  const fonts = await ogFonts();
  return new ImageResponse(
    ogTemplate({
      eyebrow: "Client Portal Software",
      headline: home.hero.headline,
      gradientPhrase: home.hero.gradientPhrase,
      footer: SITE_HOST,
    }),
    { ...size, fonts },
  );
}
