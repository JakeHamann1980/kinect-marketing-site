import PersonaPage from "@/components/PersonaPage";
import { coach } from "@/content/coach";
import { pageMetadata, personaUrl } from "@/lib/seo";

// Task 19: canonical = subdomain root (https://coach.kinectnow.com/), not
// this internal `/coach` path -- see agency/page.tsx's matching comment.
export const metadata = pageMetadata({
  seo: coach.seo,
  canonicalUrl: `${personaUrl("coach")}/`,
});

export default function CoachPage() {
  return <PersonaPage content={coach} />;
}
