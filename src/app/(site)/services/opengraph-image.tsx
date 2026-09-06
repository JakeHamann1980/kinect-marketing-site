import { ImageResponse } from "next/og";
import { services } from "@/content/services";
import { PERSONAS } from "@/lib/personas";
import { OG_SIZE, loadScreenshot, ogFonts, ogTemplate } from "@/lib/og-template";

/**
 * Professional Services persona OG image -- see `src/lib/og-template.tsx` for
 * the shared layout/font/Satori-constraint notes this and its sibling persona
 * files all reuse.
 *
 * Like its siblings, this imports the LOCAL content module rather than calling
 * `fetchPersona`. That is deliberate and pre-existing: the OG route runs at
 * the edge under Satori and must not depend on a CMS round trip.
 */
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt =
  "KINECT for professional services firms -- a client portal your clients actually open.";

export default async function Image() {
  const [fonts, screenshot] = await Promise.all([ogFonts(), loadScreenshot("/screenshots/services-firm-hq.png")]);
  return new ImageResponse(
    await ogTemplate({
      eyebrow: services.heroExtra.eyebrow,
      headline: services.hero.headline,
      gradientPhrase: services.hero.gradientPhrase,
      screenshot,
      persona: services.persona,
      personaBadge: services.navBadge,
      footer: PERSONAS.services.hostname,
    }),
    { ...size, fonts },
  );
}
