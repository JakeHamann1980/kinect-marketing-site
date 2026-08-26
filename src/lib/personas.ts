export type Persona = "agency" | "coach" | "consultant" | "services";

/**
 * Every persona this site can SERVE. Routing, canonicals, sitemaps, robots
 * and the Organization `sameAs` cross-links all read this.
 *
 * `coach` is still here on purpose. The lane is retired from marketing, but
 * coach.kinectnow.com keeps serving its page for the pilot customers who were
 * sold from it and whose links are in the wild. Removing it from this list
 * would NOT retire the host, it would break it silently: `personaFromHost`
 * would return null, the proxy's persona branch would never fire, and
 * coach.kinectnow.com would fall through to the final `NextResponse.next()`
 * and answer 200 with the HOME page. That is the dual-serve failure this
 * file's own I5 fix exists to prevent, and it looks like success from the
 * outside.
 */
export const PERSONA_IDS = ["agency", "coach", "consultant", "services"] as const;

/**
 * Every persona this site PROMOTES: the home lane picker, the Solutions nav
 * and footer, and the showcase cycler.
 *
 * The split between this and PERSONA_IDS is the whole mechanism of the
 * Professional Services pivot. Serving and selling used to be one list; they
 * are now two, so a lane can be quietly retired without breaking anyone
 * already on it.
 *
 * Order is the render order, and `services` sits in the middle slot the coach
 * lane used to occupy. Length is load-bearing in three places that are all
 * hardcoded to three: the showcase cycler's LAYER_CLASS/LABEL_CLASS arrays,
 * the nine `.kx-pin-N` rules and 15s keyframes in globals.css, and the
 * `personaCards` `.length(3)` validation in the Sanity homePage schema. A
 * fourth promoted lane means touching all three.
 */
export const PROMOTED_PERSONA_IDS = ["agency", "services", "consultant"] as const;
export type PromotedPersona = (typeof PROMOTED_PERSONA_IDS)[number];

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
  services: {
    name: "Professional Services",
    // Taken from the platform's own services persona config so the two
    // repos' accents cannot drift. PLACEHOLDER NAVY: the attorney draft spec
    // that introduced it flags it as "needing a design eye", and it has now
    // propagated to three repos. Settle it before it spreads further.
    accent: "#6FA8D0",
    accentLight: "#1E5C8A",
    tint: "rgba(30,92,138,.14)",
    hostname: "services.kinectnow.com",
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

/**
 * Destination for the nav/footer logo ("return home"). The relative-path
 * convention documented on `personaHref` above covers persona pages but NOT
 * the home page: on a persona subdomain there is no relative path that
 * reaches home, because src/proxy.ts rewrites "/" back to that persona's own
 * page (user-reported 2026-07-27: logo click on a persona page went nowhere).
 * So home is the one link that must be host-aware: on a persona subdomain it
 * targets the apex origin (strip the persona label, keep the port -- so
 * `coach.localhost:3000` dev hosts go to `http://localhost:3000/`), and on
 * every other host the plain relative "/" already serves home. Callers pass
 * `window.location.host`/`.protocol`, so this runs client-side only (the
 * static HTML is shared by both host shapes and can't bake in either URL).
 */
export function homeHrefForHost(host: string, protocol: string): string {
  const persona = personaFromHost(host);
  if (persona && host.startsWith(`${persona}.`)) {
    return `${protocol}//${host.slice(persona.length + 1)}/`;
  }
  return "/";
}
