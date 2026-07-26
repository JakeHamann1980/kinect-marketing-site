import PersonaPage from "@/components/PersonaPage";
import { fetchPersona } from "@/lib/sanity";
import { pageMetadata, personaUrl } from "@/lib/seo";

// Task 18 (Seed Script + Page Wiring + Revalidation): fully static,
// tag-based on-demand revalidation only (see fetchPersona in
// src/lib/sanity.ts and src/app/api/revalidate/route.ts).
export const revalidate = false;

// Task 19: the canonical URL is the subdomain root
// (https://agency.kinectnow.com/), not this internal `/agency` path the
// proxy rewrites requests to -- spec §8b/§2 are explicit that canonicals
// always point at the subdomain, never the path variant.
// Task 18: `seo` now comes from `fetchPersona` (Sanity-or-local-fallback)
// rather than the local module directly.
export async function generateMetadata() {
  const agency = await fetchPersona("agency");
  return pageMetadata({ seo: agency.seo, canonicalUrl: `${personaUrl("agency")}/` });
}

export default async function AgencyPage() {
  const agency = await fetchPersona("agency");
  return <PersonaPage content={agency} />;
}
