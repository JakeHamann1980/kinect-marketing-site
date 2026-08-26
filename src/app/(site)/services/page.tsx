import PersonaPage from "@/components/PersonaPage";
import { fetchPersona } from "@/lib/sanity";
import { pageMetadata, personaUrl } from "@/lib/seo";

// Task 18 (Seed Script + Page Wiring + Revalidation): see agency/page.tsx's
// matching comment.
export const revalidate = false;

// Task 19: canonical = subdomain root (https://services.kinectnow.com/), not
// this internal `/services` path -- see agency/page.tsx's matching comment.
// Task 18: `seo` now comes from `fetchPersona` (Sanity-or-local-fallback).
export async function generateMetadata() {
  const services = await fetchPersona("services");
  return pageMetadata({ seo: services.seo, canonicalUrl: `${personaUrl("services")}/` });
}

export default async function ServicesPage() {
  const services = await fetchPersona("services");
  return <PersonaPage content={services} />;
}
