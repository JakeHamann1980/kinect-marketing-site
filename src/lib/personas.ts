export type Persona = "agency" | "coach" | "consultant";
export const PERSONA_IDS = ["agency", "coach", "consultant"] as const;

export const PERSONAS: Record<
  Persona,
  {
    name: string;
    accent: string;
    accentLight: string;
    tint: string;
    hostname: string;
  }
> = {
  agency: {
    name: "Agency",
    accent: "#35D6E8",
    accentLight: "#0E93AC",
    tint: "rgba(14,147,172,.12)",
    hostname: "agency.kinectnow.com",
  },
  coach: {
    name: "Coach",
    accent: "#F0913A",
    accentLight: "#C4501F",
    tint: "rgba(240,145,58,.16)",
    hostname: "coach.kinectnow.com",
  },
  consultant: {
    name: "Consultant",
    accent: "#C7A0C0",
    accentLight: "#6E5AA8",
    tint: "rgba(139,120,192,.18)",
    hostname: "consultant.kinectnow.com",
  },
};

/** Resolves a Host header to a persona; null for root, www, and unknown hosts. Assumes hostname:port form (not IPv6 literals). */
export function personaFromHost(host: string): Persona | null {
  const sub = host.split(":")[0].split(".")[0];
  return (PERSONA_IDS as readonly string[]).includes(sub)
    ? (sub as Persona)
    : null;
}

/**
 * Fix (final review, I5): single definition of the "link to a persona's own
 * page" convention, deduped from what used to be two near-identical local
 * `personaHref` functions (Nav.tsx and PersonaCard.tsx each had their own
 * copy with a TODO(Task 19) about needing environment-aware absolute URLs
 * in production). Both TODOs are resolved by this fix, not by making the
 * URLs absolute: a plain relative `/${persona}` path is correct EVERYWHERE
 * this app renders -- home, and every persona subdomain -- because
 * src/proxy.ts's persona-host branch now canonicalizes any cross-persona (or
 * same-persona) segment hit on a persona subdomain host with a 308 redirect
 * to that other persona's real subdomain root (e.g. clicking a "For
 * Coaches" row while on agency.kinectnow.com navigates the browser to
 * `/coach`, and the proxy immediately redirects that to
 * `https://coach.kinectnow.com/`). No client-side host detection or
 * environment-aware URL construction is needed for that to work correctly.
 */
export function personaHref(persona: Persona): string {
  return `/${persona}`;
}
