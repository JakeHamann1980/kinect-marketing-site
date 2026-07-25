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
    { label: "Product", href: "#" },
    { label: "Pricing", href: "#" },
    { label: "Docs", href: "#" },
  ],

  solutions: [
    {
      persona: "agency",
      name: "Agencies",
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
    supporting: 'Flat monthly. No per-seat, no per-feature, no "contact sales."',
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
          { label: "For agencies", href: "#" },
          { label: "For coaches", href: "#" },
          { label: "For consultants", href: "#" },
          { label: "Compare plans", href: "#" },
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
          { label: "About", href: "#" },
          { label: "Security", href: "#" },
          { label: "Contact", href: "#" },
          { label: "Status", href: "#" },
        ],
      },
    ],
    legalLinks: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms & Conditions", href: "#" },
      { label: "Cookie Policy", href: "#" },
      { label: "DPA", href: "#" },
      { label: "Accessibility", href: "#" },
    ],
    copyright: "© 2026 KINECT · kinectnow.com",
  },
};
