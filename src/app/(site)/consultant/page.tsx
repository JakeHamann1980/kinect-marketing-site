import PersonaPage from "@/components/PersonaPage";
import { consultant } from "@/content/consultant";
import { pageMetadata, personaUrl } from "@/lib/seo";

// Task 19: canonical = subdomain root (https://consultant.kinectnow.com/),
// not this internal `/consultant` path -- see agency/page.tsx's matching
// comment.
export const metadata = pageMetadata({
  seo: consultant.seo,
  canonicalUrl: `${personaUrl("consultant")}/`,
});

export default function ConsultantPage() {
  return <PersonaPage content={consultant} />;
}
