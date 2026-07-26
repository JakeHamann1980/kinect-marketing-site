import { ImageResponse } from "next/og";
import { coach } from "@/content/coach";
import { PERSONAS } from "@/lib/personas";
import { OG_SIZE, ogFonts, ogTemplate } from "@/lib/og-template";

/**
 * Task 21 (OG Images + Preview Metadata). Coach persona OG image -- see
 * `src/lib/og-template.tsx` for the shared layout/font/Satori-constraint
 * notes this and its two sibling persona files all reuse.
 */
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "KINECT for coaches -- a client portal your clients actually open.";

export default async function Image() {
  const fonts = await ogFonts();
  return new ImageResponse(
    ogTemplate({
      eyebrow: coach.heroExtra.eyebrow,
      headline: coach.hero.headline,
      gradientPhrase: coach.hero.gradientPhrase,
      persona: coach.persona,
      personaBadge: coach.navBadge,
      footer: PERSONAS.coach.hostname,
    }),
    { ...size, fonts },
  );
}
