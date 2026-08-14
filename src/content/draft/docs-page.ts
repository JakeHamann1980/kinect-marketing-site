/**
 * DRAFT content (user-directed 2026-08-03). Rendered at /docs, gated behind
 * NEXT_PUBLIC_ENABLE_DRAFT_PAGES and 404ing on the live site.
 *
 * OPEN QUESTION, deliberately unresolved here: what "Docs" is actually for.
 * The item came from the design handoff's nav as a placeholder pointing at
 * "#", and KINECT has no shipped product to document while the site is a
 * pre-launch waitlist. The three plausible jobs are a help centre, API /
 * developer docs, and SEO-driven how-to guides -- materially different
 * builds. This page is deliberately the SHELL of the first (a help-centre
 * index), because it is the version that needs no product decisions to be
 * legible, and it is the cheapest to throw away if Jake picks another.
 *
 * Article bodies are intentionally absent: writing help content for
 * unshipped features would be fiction. Each category states what it would
 * cover so the information architecture can be judged before anything is
 * written.
 */
export interface DocsCategory {
  title: string;
  body: string;
  /** Article titles this category would hold. Titles only -- see above. */
  articles: string[];
}

export interface DocsPageContent {
  seo: { title: string; description: string };
  hero: { eyebrow: string; title: string; gradientPhrase: string; intro: string };
  categories: DocsCategory[];
  help: { title: string; body: string; cta: string };
}

export const docsPage: DocsPageContent = {
  seo: {
    title: "Docs | KINECT",
    description:
      "Guides for setting up KINECT: connecting your data, building templates, inviting clients, and reading the analytics and AI insights.",
  },

  hero: {
    eyebrow: "Docs",
    title: "Everything you need, ten minutes at a time.",
    gradientPhrase: "ten minutes at a time.",
    intro:
      "Setup guides, feature walkthroughs and answers for the questions that come up once real clients are in the portal.",
  },

  categories: [
    {
      title: "Getting started",
      body: "Signup to a client logging into a branded portal, in about ten minutes.",
      articles: [
        "Create your workspace",
        "Connect your analytics and ad accounts",
        "Pick a template for your first project",
        "Invite your first client",
      ],
    },
    {
      title: "The client portal",
      body: "What your clients see, and how to control it.",
      articles: [
        "Board, list and timeline views",
        "Files, approvals and invoices",
        "Roles and what each one can see",
        "Branding the portal as yours",
      ],
    },
    {
      title: "Templates",
      body: "Reusable service lines, programs and engagements with your own rates.",
      articles: [
        "Building a project template",
        "Tasks, milestones and KPIs",
        "Setting billing rates per service line",
      ],
    },
    {
      title: "Analytics",
      body: "The numbers, where they come from, and what clients can see.",
      articles: [
        "Connecting data sources",
        "Reading the performance view",
        "Time and budget against effective rate",
        "Anomaly alerts",
      ],
    },
    {
      title: "AI insights",
      body: "How the AI reads your data and drafts client updates.",
      articles: [
        "What the AI looks at",
        "Reviewing and editing drafted updates",
        "Turning insights off for a client",
      ],
    },
    {
      title: "Account & billing",
      body: "Plans, invoices and workspace settings.",
      articles: [
        "Changing plans",
        "Managing teammates",
        "Security and data handling",
      ],
    },
  ],

  help: {
    title: "Cannot find it?",
    body: "Docs are being written alongside the product. If something is missing, tell us and it moves up the list.",
    cta: "Email hello@kinectnow.com",
  },
};
