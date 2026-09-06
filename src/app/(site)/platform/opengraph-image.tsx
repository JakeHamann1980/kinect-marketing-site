import { ImageResponse } from "next/og";
import { platformPage } from "@/content/platform-page";
import { OG_SIZE, loadScreenshot, ogFonts, ogTemplate, SITE_HOST } from "@/lib/og-template";

/**
 * /platform's OG image -- see `src/lib/og-template.tsx` for the shared
 * layout/font/Satori-constraint notes. Like the persona files, this imports
 * the LOCAL content module rather than calling `fetchPlatformPage`: the OG
 * route renders under Satori and must not depend on a CMS round trip.
 * No persona badge: the platform overview belongs to every lane. Product
 * variant: the portal task board, the "one login" the headline promises.
 */
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt =
  "The KINECT platform -- client portal, work, messaging, analytics, AI, billing and scheduling in one login.";

export default async function Image() {
  const [fonts, screenshot] = await Promise.all([ogFonts(), loadScreenshot("/screenshots/portal-board.png")]);
  return new ImageResponse(
    await ogTemplate({
      eyebrow: platformPage.hero.eyebrow,
      screenshot,
      headline: platformPage.hero.title,
      gradientPhrase: platformPage.hero.gradientPhrase,
      footer: SITE_HOST,
    }),
    { ...size, fonts },
  );
}
