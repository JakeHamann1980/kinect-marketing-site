import type { PricingPageContent } from "./types";

/*
 * Dedicated /pricing page content (user-directed 2026-08-03; structure
 * modeled on momentifyapp.com/pricing, adapted to KINECT's flat model: no
 * billing toggle since there is no annual price yet, no "contact sales"
 * tier since the pricing section publicly promises none, waitlist CTAs
 * since that is the site's conversion path today).
 *
 * Comparison matrix values are derived STRICTLY from claims already
 * shipped elsewhere on the site (tier feature lists in settings.ts, the
 * persona capability cards, the home FAQ and security FAQ). Rows that a
 * reader could interpret as new product commitments were left out rather
 * than invented. FAQ answers reuse approved persona/home FAQ copy where it
 * exists; the "outgrow Starter" and "change plans" answers are NEW copy
 * drafted for this page, pending Jake's read (flagged in the session
 * conversation, 2026-08-03).
 */
export const pricingPage: PricingPageContent = {
  seo: {
    title: "Pricing | KINECT Client Portal from $149, Flat Monthly",
    description:
      "Flat monthly pricing for the KINECT client portal: Starter $149, Growth $399, Scale $799. No per-seat charges, no per-client charges, no contact-sales wall. Compare every plan.",
  },

  hero: {
    eyebrow: "Pricing",
    title: "The price is the price.",
    intro:
      'Flat monthly plans with no per-seat charges, no per-client charges, and no "contact sales" wall. Pick a tier, invite your clients, and the bill stays put.',
  },

  trustLine: [
    "Cancel anytime",
    "Free for your first client",
    "No card, no demo call, no onboarding fee",
  ],

  comparison: {
    title: "Everything In Every Plan",
    intro:
      "The full breakdown. Same platform underneath on every tier; higher tiers add capacity and the heavier tooling.",
    groups: [
      {
        heading: "Clients & Team",
        rows: [
          { label: "Clients", values: ["Up to 5", "Unlimited", "Unlimited"] },
          { label: "Per-seat charges", values: ["None", "None", "None"] },
          { label: "Per-client charges", values: ["None", "None", "None"] },
        ],
      },
      {
        heading: "Client Portal",
        rows: [
          { label: "Branded portal your clients log into", values: ["yes", "yes", "yes"] },
          { label: "Task boards, files, approvals and invoices", values: ["yes", "yes", "yes"] },
          { label: "Client-safe view with role-based access", values: ["yes", "yes", "yes"] },
          { label: "Templates for your services, programs or engagements", values: ["yes", "yes", "yes"] },
        ],
      },
      {
        heading: "Analytics & AI",
        rows: [
          { label: "Live performance analytics", values: ["yes", "yes", "yes"] },
          { label: "Anomaly alerts", values: ["yes", "yes", "yes"] },
          { label: "AI insights and drafted client updates", values: ["no", "yes", "yes"] },
          { label: "Integrations", values: ["no", "yes", "yes"] },
        ],
      },
      {
        heading: "Security & Support",
        rows: [
          { label: "Encryption in transit and at rest", values: ["yes", "yes", "yes"] },
          { label: "SSO", values: ["no", "no", "yes"] },
          { label: "White-label", values: ["no", "no", "yes"] },
          { label: "Priority support", values: ["no", "no", "yes"] },
        ],
      },
    ],
  },

  faqTitle: "Pricing Questions, Answered",
  faq: [
    {
      question: "How is KINECT priced?",
      answer:
        "Flat monthly by plan. Starter is $149, Growth is $399, Scale is $799, and none of them charge per seat or per client. Start free with your first client, athlete or engagement.",
    },
    {
      question: "Why doesn't KINECT charge per seat or per client?",
      answer:
        "Because your portal should get more valuable as more people use it, not more expensive. Every plan is a flat monthly price. Add clients, add teammates, the bill stays the same.",
    },
    {
      question: "What happens when I outgrow Starter's five clients?",
      answer:
        "You move up to Growth and get unlimited clients, AI insights and integrations. That is the only way your client count ever touches your bill: a one-time step to the next tier, never a per-client meter.",
    },
    {
      question: "Can I change plans later?",
      answer:
        "Yes. Upgrade or downgrade whenever your roster changes. No lock-in, no repricing call, no penalty.",
    },
    {
      question: "Is there a free trial?",
      answer:
        "Your first client is free, with no card, no demo call and no onboarding fee. Run a real project in KINECT and bring the second client when you are convinced.",
    },
    {
      question: "Do all plans include the portal and analytics?",
      answer:
        "Yes. The branded portal, live analytics and anomaly alerts are on every tier. Growth adds the AI layer that explains the work and drafts your client updates; Scale adds white-label, SSO and priority support.",
    },
  ],

  stat: {
    title: "What The Reporting Day Costs",
    value: "2–5 hrs",
    caption:
      "saved every week on the reporting you used to do by hand. At any billable rate, every plan pays for itself before the first invoice goes out.",
  },

  closing: {
    headline: "Start with your first client, free.",
    subhead: "No card, no demo call, no onboarding fee. The flat price starts when you bring the roster.",
    cta: "Join the waitlist",
  },
};
