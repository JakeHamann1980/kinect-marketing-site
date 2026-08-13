import type { SiteSettings } from "./types";

/*
 * Pricing note: the .dc.html prototype's live state (`homePlans` in the
 * render function) shows the home page's own pricing table as ranges
 * ("$49–149", "$99–399", "$249–799") that vary by lane, while each
 * persona subdomain's `subs.<persona>.plans` shows different flat numbers
 * per persona (coach: $49/$99/$249, consultant: $99/$249/$599, agency:
 * $149/$399/$799). The handoff README documents a single, final, shared
 * figure instead ("Three tiers matching the app: Starter $149, Growth
 * $399 (most popular, accent border and glow), Scale $799") and the
 * `SiteSettings` contract has exactly one `pricing` slot shared by every
 * page. Per the README's documented (and task-mandated) numbers, which
 * happen to match the agency subdomain's tiers exactly, this file encodes
 * that single shared table. The home page's own range-based table and the
 * coach/consultant-specific numbers were not transcribed as a second
 * pricing structure since the type has no slot for one and the README
 * treats the $149/$399/$799 table as the final, cross-site figure.
 */
export const settings: SiteSettings = {
  navLinks: [
    // Fix (final review, I1): "Product" and "Docs" have no real destination
    // page anywhere in this app yet, so they stay "#" (see docs/LAUNCH.md's
    // recounted "#" link inventory). user-directed 2026-08-03: "Pricing"
    // now routes to the dedicated /pricing page (tier cards + full
    // comparison matrix + pricing FAQ) instead of the in-page `#pricing`
    // anchor; the on-page pricing sections remain as teasers with their own
    // "See everything in every plan" link to the same page. A relative
    // path serves correctly on every hostname (the proxy passes /pricing
    // through in place, same as /legal/*).
    { label: "Product", href: "#" },
    { label: "Pricing", href: "/pricing" },
    { label: "Docs", href: "#" },
  ],

  solutions: [
    {
      // user-directed 2026-07-26: agency lane renamed to the "Agencies &
      // Studios" umbrella (photographers and creative studios bucket here).
      persona: "agency",
      name: "Agencies & Studios",
      description: "Client portal, campaign analytics and AI reporting.",
    },
    {
      persona: "coach",
      name: "Coaches & Trainers",
      description: "Programs, check-ins and adherence for every athlete.",
    },
    {
      persona: "consultant",
      name: "Consultants & Mentors",
      description: "Engagements, deliverables and outcome tracking.",
    },
  ],

  pricing: {
    headline: "Priced like a tool, not a tax",
    // user-directed 2026-07-27: "no per-feature" dropped -- tiers do gate
    // features (AI insights at Growth, white-label/SSO at Scale), so the
    // claim was attackable. "No per-client" replaces it: the actual pricing
    // principle Jake + Will decided (flat rate, never per-seat/per-client).
    supporting: 'Flat monthly. No per-seat, no per-client, no "contact sales."',
    tiers: [
      {
        name: "Starter",
        price: 149,
        features: ["Up to 5 clients", "analytics", "anomaly alerts"],
        cta: "Choose Starter",
      },
      {
        name: "Growth",
        price: 399,
        popular: true,
        features: ["Unlimited clients", "AI insights", "integrations"],
        cta: "Start free",
      },
      {
        name: "Scale",
        price: 799,
        features: ["White-label", "priority support", "SSO"],
        cta: "Choose Scale",
      },
    ],
    // Transcribed verbatim from the home pricing section's trailing note
    // (line 351). This sentence presumes per-lane pricing variation ("varies
    // slightly by lane"), which conflicts with the single canonical shared
    // tier table above (see the pricing note at the top of this file).
    // Whether/how this renders is pending a product decision; flagged here,
    // not yet wired into any component.
    note: "Every plan includes the portal, analytics and AI insights. Pricing varies slightly by lane.",
  },

  footer: {
    positioning: "Where clients live. Where data lives. Where insights live.",
    columns: [
      {
        heading: "Solutions",
        links: [
          // Fix (final review, I1): these three route to the matching
          // persona's own page (dedupe'd `personaHref`-equivalent relative
          // paths -- see src/lib/personas.ts). user-directed 2026-08-03:
          // "Compare plans" now has a real destination, the dedicated
          // /pricing page's comparison matrix.
          { label: "For agencies", href: "/agency" },
          { label: "For coaches", href: "/coach" },
          { label: "For consultants", href: "/consultant" },
          { label: "Compare plans", href: "/pricing" },
        ],
      },
      {
        heading: "Platform",
        links: [
          { label: "Client portal", href: "#" },
          { label: "Analytics", href: "#" },
          { label: "AI insights", href: "#" },
          { label: "Proposals & billing", href: "#" },
          { label: "Integrations", href: "#" },
        ],
      },
      {
        heading: "Resources",
        links: [
          { label: "Docs", href: "#" },
          { label: "Onboarding guide", href: "#" },
          { label: "Templates", href: "#" },
          { label: "Changelog", href: "#" },
        ],
      },
      {
        heading: "Company",
        links: [
          // Fix (final review, I1): "Security" now routes to the real
          // /legal/security page (same destination as the "Security" entry
          // in legalLinks below). About/Contact/Status have no dedicated
          // pages, so they stay "#".
          { label: "About", href: "#" },
          { label: "Security", href: "/legal/security" },
          { label: "Contact", href: "#" },
          { label: "Status", href: "#" },
        ],
      },
    ],
    // Fix (final review, I6): real hrefs sourced directly from content, not
    // a separate `LEGAL_HREFS` label-keyed map in Footer.tsx (deleted --
    // Footer now renders `link.href` directly). DPA and Accessibility have
    // no route yet, so they stay "#" with a TODO (post-launch backlog, see
    // docs/LAUNCH.md §7).
    legalLinks: [
      { label: "Privacy Policy", href: "/legal/privacy" },
      { label: "Terms & Conditions", href: "/legal/terms" },
      { label: "Security", href: "/legal/security" },
      { label: "Cookie Policy", href: "/legal/cookies" },
      // TODO(Task 14 backlog): DPA and Accessibility pages don't have a route yet.
      { label: "DPA", href: "#" },
      { label: "Accessibility", href: "#" },
    ],
    copyright: "© 2026 KINECT · kinectnow.com",
  },
};
