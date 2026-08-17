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
 * exists; the "more clients" and "change plans" answers are NEW copy
 * drafted for this page, pending Jake's read (flagged in the session
 * conversation, 2026-08-03).
 *
 * Pricing review update: tiers renamed to Kinect / Kinect Plus / Kinect Pro,
 * every tier moved to unlimited clients, and the rows describing features
 * that do not exist were removed rather than reworded (anomaly alerts, the
 * vague "Integrations"). The remaining unbuilt claims are the three Kinect
 * Pro rows, kept deliberately and commented in place. See settings.ts.
 */
export const pricingPage: PricingPageContent = {
  seo: {
    title: "Pricing | KINECT Client Portal from $149, Flat Monthly",
    description:
      "Flat monthly pricing for the KINECT client portal: Kinect $149, Kinect Plus $399, Kinect Pro $799. Unlimited clients on every plan. No per-seat charges, no contact-sales wall. Compare every plan.",
  },

  hero: {
    eyebrow: "Pricing",
    title: "The price is the price.",
    gradientPhrase: "is the price.",
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
      "The full breakdown. Same platform underneath on every tier, and the same unlimited client count. Higher tiers add your clients' data, and then your own name on the door.",
    groups: [
      {
        heading: "Clients & Team",
        rows: [
          { label: "Clients", values: ["Unlimited", "Unlimited", "Unlimited"] },
          { label: "Per-seat charges", values: ["None", "None", "None"] },
          { label: "Per-client charges", values: ["None", "None", "None"] },
        ],
      },
      {
        heading: "Client Portal",
        rows: [
          { label: "Branded portal your clients log into", values: ["yes", "yes", "yes"] },
          { label: "Task boards, files and approvals", values: ["yes", "yes", "yes"] },
          { label: "Invoices, rate cards and proposals", values: ["yes", "yes", "yes"] },
          { label: "Client-safe view with role-based access", values: ["yes", "yes", "yes"] },
          { label: "Templates for your services, programs or engagements", values: ["yes", "yes", "yes"] },
        ],
      },
      {
        heading: "Analytics & AI",
        rows: [
          // "Anomaly alerts" was a row here, marked yes on all three tiers.
          // Removed in the pricing review: no detection, thresholds or
          // alerting exists anywhere in the platform. "Integrations" went
          // with it, replaced by the named ad platforms that are real.
          { label: "Client ad accounts across Google, Meta and LinkedIn", values: ["no", "yes", "yes"] },
          { label: "Client-facing dashboards", values: ["no", "yes", "yes"] },
          { label: "Per-client control over what each client sees", values: ["no", "yes", "yes"] },
          { label: "Profitability and utilization per client", values: ["no", "yes", "yes"] },
          { label: "AI insights and drafted client updates", values: ["no", "yes", "yes"] },
          { label: "Exports and scheduled reports", values: ["no", "yes", "yes"] },
        ],
      },
      {
        heading: "Security & Support",
        rows: [
          { label: "Encryption in transit and at rest", values: ["yes", "yes", "yes"] },
          // The three rows below are NOT BUILT. See the block comment on the
          // Kinect Pro tier in settings.ts: no branding, theming or
          // custom-domain code exists, and authentication is email and
          // password only. They must not ship next to a live Stripe price.
          { label: "Your own domain and branding", values: ["no", "no", "yes"] },
          { label: "SSO and enforced two-factor", values: ["no", "no", "yes"] },
          { label: "Multiple workspaces under one bill", values: ["no", "no", "yes"] },
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
        "Flat monthly by plan. Kinect is $149, Kinect Plus is $399, Kinect Pro is $799, and none of them charge per seat or per client. Start free with your first client, athlete or engagement.",
    },
    {
      question: "Why doesn't KINECT charge per seat or per client?",
      answer:
        "Because your portal should get more valuable as more people use it, not more expensive. Every plan is a flat monthly price. Add clients, add teammates, the bill stays the same.",
    },
    {
      question: "What happens when I add more clients?",
      answer:
        "Nothing. Every plan has unlimited clients, so your roster never touches your bill. You move up when you want your clients' ad accounts, their profitability, and the AI that explains both, not because you signed someone new.",
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
      question: "Do all plans include the portal?",
      answer:
        "Yes. The branded portal, unlimited clients, task boards, files and invoicing are on every tier. Kinect Plus adds your clients' ad accounts, their profitability, and the AI layer that explains both. Kinect Pro puts your own name and domain on the portal.",
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
    gradientPhrase: "free.",
    subhead: "No card, no demo call, no onboarding fee. The flat price starts when you bring the roster.",
    cta: "Join the waitlist",
  },
};
