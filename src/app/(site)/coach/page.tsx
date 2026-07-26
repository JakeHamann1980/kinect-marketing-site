import PersonaPage from "@/components/PersonaPage";
import { fetchPersona } from "@/lib/sanity";
import { pageMetadata, personaUrl } from "@/lib/seo";

// Task 18 (Seed Script + Page Wiring + Revalidation): see agency/page.tsx's
// matching comment.
export const revalidate = false;

// Task 19: canonical = subdomain root (https://coach.kinectnow.com/), not
// this internal `/coach` path -- see agency/page.tsx's matching comment.
// Task 18: `seo` now comes from `fetchPersona` (Sanity-or-local-fallback).
export async function generateMetadata() {
  const coach = await fetchPersona("coach");
  return pageMetadata({ seo: coach.seo, canonicalUrl: `${personaUrl("coach")}/` });
}

export default async function CoachPage() {
  const coach = await fetchPersona("coach");
  return <PersonaPage content={coach} />;
}
