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
    "Free for 30 days",
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
        // Storage (user-directed 2026-08-03, numbers confirmed by Jake).
        // NOT YET ENFORCED: the platform has no storage quota column and no
        // metering, and Stripe has no add-on product -- `plans` carries only
        // key/name/stripe_price_id/client_limit/sort, and every
        // stripe_price_id is still null. These rows describe the intended
        // model so the page can be honest about it; the platform spec is in
        // docs/STORAGE-PRICING.md. Do not tighten this into a hard cap
        // without changing the "keep working" wording below, which is the
        // promise a soft cap makes.
        heading: "Files & Storage",
        rows: [
          { label: "Included storage", values: ["100 GB", "500 GB", "2 TB"] },
          {
            label: "Additional storage, per month",
            values: ["$10 / 100 GB", "$10 / 100 GB", "$10 / 100 GB"],
          },
          {
            label: "Uploads keep working past the limit",
            values: ["yes", "yes", "yes"],
          },
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
          // Updated 2026-08-30 after the platform shipped plan capability
          // gating (migration 20260907100000), the workspace-wide two-factor
          // requirement (20260907110000) and client-facing custom domains
          // (20260907120000). Each was verified in the platform repo before
          // this table changed -- see docs/PRO-FEATURES.md for the scoping
          // that preceded the build.
          //
          // Two-factor collapsed from two rows into one. It used to be a
          // yes/yes/yes capability row plus a no/no/soon row for the
          // workspace-wide requirement; now that the requirement ships on
          // EVERY plan (deliberately ungated -- per-user 2FA was already free
          // everywhere, so selling the admin toggle against a $149 customer's
          // security posture was not something we wanted to do), the second
          // row would have been a third consecutive line reading yes/yes/yes
          // and differentiating nothing.
          //
          // Branding is finally TRUE as written. It shipped ungated on
          // 2026-08-28 and this row claimed Pro-exclusivity the platform did
          // not enforce, so every Kinect and Plus customer could set a logo.
          // It is now gated at the database in three places (the set trigger,
          // the logo storage policy, and public_document, which nulls the
          // columns on read so a value set before the gate never renders).
          { label: "Two-factor authentication, optionally required workspace-wide", values: ["yes", "yes", "yes"] },
          { label: "Your own logo and color on client documents", values: ["no", "no", "yes"] },
          // CLIENT-FACING ONLY, and the label has to keep saying so. The
          // domain serves the public /d/<token> document surface -- the
          // proposals and invoices a workspace sends resolve at its own
          // hostname with automatic TLS. Operators still sign in at
          // app.kinectnow.com; multi-domain operator login was deliberately
          // cut as the expensive version. Do not shorten this to "Custom
          // domain", and never write "white-label portal": both imply a
          // login surface that does not exist.
          { label: "Your own domain on client document links", values: ["no", "no", "yes"] },
          { label: "SSO", values: ["no", "no", "soon"] },
          { label: "Multiple workspaces under one bill", values: ["no", "no", "soon"] },
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
        "Flat monthly by plan. Kinect is $149, Kinect Plus is $399, Kinect Pro is $799, and none of them charge per seat or per client. Every workspace starts with 30 days free on Kinect Plus, no card required.",
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
      question: "What happens if I run out of storage?",
      answer:
        "Nothing stops working. Your clients keep uploading and we prompt you to add more space. Extra storage is $10 per 100 GB a month, and you only pay for the blocks you add. A portal that refuses a file in front of your client is not something we are willing to ship.",
    },
    {
      question: "Can I change plans later?",
      answer:
        "Yes. Upgrade or downgrade whenever your roster changes. No lock-in, no repricing call, no penalty.",
    },
    {
      question: "Is there a free trial?",
      answer:
        "Yes. Every workspace starts on Kinect Plus for 30 days, with no card, no demo call and no onboarding fee. Run a real client through it and decide on evidence.",
    },
    {
      question: "Do all plans include the portal?",
      answer:
        "Yes. The branded portal, unlimited clients, task boards, files and invoicing are on every tier. Kinect Plus adds your clients' ad accounts, their profitability, and the AI layer that explains both. Kinect Pro puts your own logo, color and domain on the documents your clients receive.",
    },
  ],

  stat: {
    title: "What The Reporting Day Costs",
    value: "2–5 hrs",
    caption:
      "saved every week on the reporting you used to do by hand. At any billable rate, every plan pays for itself before the first invoice goes out.",
  },

  closing: {
    headline: "Start free for 30 days.",
    gradientPhrase: "for 30 days.",
    subhead: "No card, no demo call, no onboarding fee. You are on Kinect Plus the whole time.",
    cta: "Start free",
  },
};
