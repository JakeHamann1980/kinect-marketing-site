import { ImageResponse } from "next/og";
import { consultant } from "@/content/consultant";
import { PERSONAS } from "@/lib/personas";
import { OG_SIZE, ogFonts, ogTemplate } from "@/lib/og-template";

/**
 * Task 21 (OG Images + Preview Metadata). Consultant persona OG image --
 * see `src/lib/og-template.tsx` for the shared layout/font/Satori-
 * constraint notes this and its two sibling persona files all reuse.
 */
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "KINECT for consultants -- a client portal your clients actually open.";

export default async function Image() {
  const fonts = await ogFonts();
  return new ImageResponse(
    ogTemplate({
      eyebrow: consultant.heroExtra.eyebrow,
      headline: consultant.hero.headline,
      gradientPhrase: consultant.hero.gradientPhrase,
      persona: consultant.persona,
      personaBadge: consultant.navBadge,
      footer: PERSONAS.consultant.hostname,
    }),
    { ...size, fonts },
  );
}
