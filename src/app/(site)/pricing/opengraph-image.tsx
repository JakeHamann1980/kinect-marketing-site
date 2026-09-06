import { ImageResponse } from "next/og";
import { pricingPage } from "@/content/pricing-page";
import { settings } from "@/content/settings";
import { OG_SIZE, ogFonts, ogTemplate, SITE_HOST } from "@/lib/og-template";

/**
 * /pricing's OG image. Statement variant (no screenshot): the headline
 * plus one muted line carrying the four monthly prices and the annual
 * rule, both derived from the local `settings.pricing.tiers` table so a
 * price change in content changes the card in the same build (Next
 * content-hashes the route URL, which busts crawler caches). Like every
 * OG route it reads the LOCAL content module, not Sanity: a price edited
 * only in the Studio will not reach this card until the next deploy, the
 * same caveat docs/LAUNCH.md already records for every OG image.
 */
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt =
  "KINECT pricing -- flat plans from $149 a month, unlimited clients, no per-seat charges.";

function priceLine(): string {
  const tiers = settings.pricing.tiers.map((tier) => `${tier.name} $${tier.price.toLocaleString("en-US")}`);
  const last = tiers.pop();
  return `${tiers.join(", ")} and ${last} a month. Annual is twelve months for the price of ten.`;
}

export default async function Image() {
  const fonts = await ogFonts();
  return new ImageResponse(
    await ogTemplate({
      eyebrow: pricingPage.hero.eyebrow,
      headline: pricingPage.hero.title,
      gradientPhrase: pricingPage.hero.gradientPhrase,
      detail: priceLine(),
      footer: SITE_HOST,
    }),
    { ...size, fonts },
  );
}
