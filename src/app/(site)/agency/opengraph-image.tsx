import { ImageResponse } from "next/og";
import { agency } from "@/content/agency";
import { PERSONAS } from "@/lib/personas";
import { OG_SIZE, loadScreenshot, ogFonts, ogTemplate } from "@/lib/og-template";

/**
 * Task 21 (OG Images + Preview Metadata). Agency persona OG image -- see
 * `src/lib/og-template.tsx` for the shared layout/font/Satori-constraint
 * notes this and its two sibling persona files all reuse.
 */
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "KINECT for agencies -- a client portal your clients actually open.";

export default async function Image() {
  const [fonts, screenshot] = await Promise.all([ogFonts(), loadScreenshot("/screenshots/analytics-full.png")]);
  return new ImageResponse(
    await ogTemplate({
      eyebrow: agency.heroExtra.eyebrow,
      headline: agency.hero.headline,
      gradientPhrase: agency.hero.gradientPhrase,
      screenshot,
      persona: agency.persona,
      personaBadge: agency.navBadge,
      footer: PERSONAS.agency.hostname,
    }),
    { ...size, fonts },
  );
}
