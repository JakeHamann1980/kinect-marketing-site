/**
 * DRAFT content (user-directed 2026-08-03). Rendered at /platform, which is
 * gated behind NEXT_PUBLIC_ENABLE_DRAFT_PAGES and 404s on the live site.
 *
 * Deliberately NOT wired into Sanity: draft copy that is still changing
 * shape does not belong in the CMS, and adding a schema + seed for a page
 * that may never ship would be work thrown away. If /platform is approved,
 * wiring it up is the same pattern the pricing page already follows
 * (schema -> projection -> fetcher -> seed).
 *
 * Every claim below is drawn from what the site already says elsewhere
 * (pillars, persona capability cards, the pricing comparison matrix). No
 * new product promises were invented for a page nobody has approved.
 */
export interface PlatformSection {
  /** Anchor id -- the footer's Platform column links straight to these. */
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
}

export interface PlatformPageContent {
  seo: { title: string; description: string };
  hero: { eyebrow: string; title: string; gradientPhrase: string; intro: string };
  sections: PlatformSection[];
  closing: { headline: string; gradientPhrase: string; subhead: string; cta: string };
}

export const platformPage: PlatformPageContent = {
  seo: {
    title: "Platform | KINECT Client Portal, Analytics and AI",
    description:
      "The KINECT platform: a branded client portal, live analytics beside the work, AI that explains results, proposals and billing, and the integrations that feed it.",
  },

  hero: {
    eyebrow: "Platform",
    title: "Three products, one login.",
    gradientPhrase: "one login.",
    intro:
      "The portal your clients open, the numbers that prove the work, and the AI that explains both. No tab-hopping, no exports, no \"let me pull that for you.\"",
  },

  sections: [
    {
      id: "client-portal",
      eyebrow: "Client portal",
      title: "A portal they actually open",
      body: "Tasks, files, approvals and invoices in one place, behind a login clients use instead of emailing you for a status update.",
      points: [
        "Branded as yours, fast enough to use on a phone",
        "Board, list and timeline views a client can follow",
        "Client-safe by default: they see their work, never your margins or other clients",
        "Role-based access, so the right people see the right things",
      ],
    },
    {
      id: "analytics",
      eyebrow: "Analytics",
      title: "Numbers, sitting next to the work that caused them",
      body: "Live performance data in the same view as the tasks and deliverables it belongs to, so proof of value is already in the room.",
      points: [
        "Performance, time and budget in one view",
        "Anomaly alerts when something moves before a client notices",
        "Hours against budget and effective rate per client",
        "Always current, so nobody assembles a monthly report by hand",
      ],
    },
    {
      id: "ai-insights",
      eyebrow: "AI insights",
      title: "AI that explains the work to the client",
      body: "Claude reads the data, flags what moved, says why it matters, and drafts the update you were dreading.",
      points: [
        "Plain-language explanations, not another dashboard to squint at",
        "Anomaly explanations with a recommended next step",
        "Drafted client updates you edit instead of write",
        "Included from the Growth plan up",
      ],
    },
    {
      id: "proposals-billing",
      eyebrow: "Proposals & billing",
      title: "From scope to invoice without leaving the portal",
      body: "The commercial side of client work lives where the work does, so approvals and invoices stop living in someone's inbox.",
      points: [
        "Approvals captured against the deliverable they belong to",
        "Invoices visible in the same place as the work they cover",
        "Templates carrying your own service lines and rates",
      ],
    },
    {
      id: "integrations",
      eyebrow: "Integrations",
      title: "Bring the data you already report on",
      body: "Connect the accounts you already pull numbers from. Nothing to migrate, nothing to relearn.",
      points: [
        "Analytics and ads connected by OAuth, least-privilege scopes",
        "Ten-minute setup, no implementation project",
        "Included from the Growth plan up",
      ],
    },
  ],

  closing: {
    headline: "See it with your own client.",
    gradientPhrase: "your own client.",
    subhead: "Free for 14 days. No card, no demo call, no onboarding fee.",
    cta: "Join the waitlist",
  },
};
