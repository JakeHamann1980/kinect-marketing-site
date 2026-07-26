import PersonaPage from "@/components/PersonaPage";
import { agency } from "@/content/agency";
import { pageMetadata, personaUrl } from "@/lib/seo";

// Task 19: the canonical URL is the subdomain root
// (https://agency.kinectnow.com/), not this internal `/agency` path the
// proxy rewrites requests to -- spec §8b/§2 are explicit that canonicals
// always point at the subdomain, never the path variant.
export const metadata = pageMetadata({
  seo: agency.seo,
  canonicalUrl: `${personaUrl("agency")}/`,
});

export default function AgencyPage() {
  return <PersonaPage content={agency} />;
}
