import PersonaPage from "@/components/PersonaPage";
import { fetchPersona } from "@/lib/sanity";
import { pageMetadata, personaUrl } from "@/lib/seo";

// Task 18 (Seed Script + Page Wiring + Revalidation): see agency/page.tsx's
// matching comment.
export const revalidate = false;

// Task 19: canonical = subdomain root (https://consultant.kinectnow.com/),
// not this internal `/consultant` path -- see agency/page.tsx's matching
// comment. Task 18: `seo` now comes from `fetchPersona`
// (Sanity-or-local-fallback).
export async function generateMetadata() {
  const consultant = await fetchPersona("consultant");
  return pageMetadata({ seo: consultant.seo, canonicalUrl: `${personaUrl("consultant")}/` });
}

export default async function ConsultantPage() {
  const consultant = await fetchPersona("consultant");
  return <PersonaPage content={consultant} />;
}
