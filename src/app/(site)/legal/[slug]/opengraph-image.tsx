import { ImageResponse } from "next/og";
import { privacy } from "@/content/legal/privacy";
import { terms } from "@/content/legal/terms";
import { security } from "@/content/legal/security";
import { cookies } from "@/content/legal/cookies";
import type { LegalPage } from "@/content/legal/types";
import { OG_SIZE, ogFonts, ogTemplate, SITE_HOST } from "@/lib/og-template";

/**
 * Task 21 (OG Images + Preview Metadata). Generic OG image variant for the
 * four `/legal/[slug]` routes (privacy/terms/security/cookies) -- these
 * pages carry no persona and no gradient-phrase headline (unlike home/
 * persona pages, `LegalPage` has no `hero` field at all: see
 * `src/content/legal/types.ts`), so this renders the shared `ogTemplate`
 * with a plain (non-gradient) headline built from the page's own `title`,
 * matching `page.tsx`'s own `PAGES` lookup-by-slug pattern one file over.
 */
const PAGES: Record<string, LegalPage> = {
  [privacy.slug]: privacy,
  [terms.slug]: terms,
  [security.slug]: security,
  [cookies.slug]: cookies,
};

export function generateStaticParams() {
  return Object.keys(PAGES).map((slug) => ({ slug }));
}

export const size = OG_SIZE;
export const contentType = "image/png";
// A single generic `alt` (rather than a per-slug `generateImageMetadata`)
// -- the brief calls this the "generic variant" precisely because all
// four legal routes share one plain-headline template; a fixed string
// keeps that contract simple instead of reaching for the more elaborate,
// multi-image `generateImageMetadata` convention this route has no actual
// need for (each slug renders exactly one image, not several).
export const alt = "KINECT legal page";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = PAGES[slug];
  const fonts = await ogFonts();

  return new ImageResponse(
    await ogTemplate({
      eyebrow: "KINECT",
      headline: page?.title ?? "KINECT",
      footer: `${SITE_HOST}/legal/${slug}`,
    }),
    { ...size, fonts },
  );
}
