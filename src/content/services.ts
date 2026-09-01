import type { PersonaPageContent } from "./types";

/**
 * The Professional Services lane, added when the coach lane was retired from
 * marketing (2026-08-31).
 *
 * Scope: firms whose clients are organizations in an ongoing relationship and
 * who bill in arrears, flat, or on subscription. Law firms first, because the
 * platform persona was built for them and there is a design partner, then
 * accounting and advisory firms. The copy deliberately names attorneys as the
 * leading example WITHOUT narrowing to them, matching the platform's own
 * services persona.
 *
 * Deliberately out of scope, and never implied anywhere below: trust
 * accounting (IOLTA), docketing and deadline management, conflict-of-interest
 * checking, and e-filing. The platform's attorney draft spec treats those as
 * load-bearing exclusions rather than a backlog, and marketing copy that
 * gestures at them would write a cheque the product cannot cash. This is why
 * nothing here says "compliance", "deadlines", or "filing".
 *
 * Voice guardrails apply (src/content/content.test.ts): no em dashes, no
 * exclamation points, no emoji. `gradientPhrase` must be a literal substring
 * of its `headline`, in both `hero` and `closing`, or renderWithGradient
 * silently renders the headline flat.
 */
export const services: PersonaPageContent = {
  persona: "services",
  seo: {
    title: "Client Portal for Professional Services Firms | KINECT",
    description:
      "Engagements, documents and billable hours in one client portal for law, accounting and advisory firms. Flat pricing from $149 a month, no per-seat fees.",
  },

  hero: {
    headline: "Your clients pay for expertise, then wait in the dark.",
    gradientPhrase: "then wait in the dark.",
    subhead:
      "Every engagement, document and hour in one place your client can open, so the status email stops being your job.",
    primaryCta: "Start free",
    secondaryCta: "Schedule Demo",
  },
  heroExtra: {
    eyebrow: "For law, accounting & advisory firms",
    proofPoints: ["Hours against fee budgets", "Documents your client can find"],
  },
  navBadge: "for Firms",

  pain: {
    title: "The work is excellent. The visibility is a phone call.",
    cards: [
      {
        title: "Status lives in your head",
        body: "Clients ask where things stand, and answering takes a partner twenty minutes and an apology.",
      },
      {
        title: "Documents scatter",
        body: "The executed version is in an email thread, and nobody is sure which one it is.",
      },
      {
        title: "Write-offs surface late",
        body: "The engagement went over at month two and the invoice found out at month three.",
      },
    ],
  },

  capabilities: {
    intro: "Built for the way firms work",
    title: "The client-facing half of practice management, without the suite.",
    cards: [
      {
        title: "Engagements, properly scoped",
        body: "Flat fee, hourly or retainer, with hour budgets and pacing warnings before the write-off.",
      },
      {
        title: "One home for documents",
        body: "Drafts, executed versions and client uploads in the place your client already looks.",
      },
      {
        title: "Time that reaches the invoice",
        body: "Log against the engagement, see effective rate and margin, bill without rebuilding it.",
      },
    ],
  },

  screenshot: {
    // A real capture of this persona, from the seeded `fulcrum-law` workspace
    // (platform: e2e/marketing-screenshots.spec.ts). Replaced the generic
    // portal-board placeholder this lane launched with.
    //
    // The alt and caption describe THIS image and nothing more. The
    // placeholder's caption promised "engagements tracked against hours, with
    // the AI flagging the ones drifting past their fee" -- Firm HQ shows
    // neither hours nor fee drift, so keeping that line would have been a
    // claim the picture does not support.
    src: "/screenshots/services-firm-hq.png",
    alt: "KINECT firm HQ",
    caption:
      "Every client in the firm on one screen, with what is open, what is overdue, and what is still in flight.",
  },

  workflow: {
    eyebrow: "Engagement templates",
    title: "However your firm packages its work.",
    subhead:
      "Registrations, drafting, diligence and advisory, each with its own tasks and fee basis.",
    items: [
      "Trademark Registration",
      "Commercial Agreement",
      "Privacy Programme Build",
      "Regulatory Assessment",
      "Diligence Support",
      "Employment Advisory",
      "Incident Response",
      "Fractional Counsel",
    ],
  },

  steps: {
    title: "Live in ten minutes, not ten days",
    items: [
      { number: "1", title: "Sign up", body: "Email or Google. No sales call." },
      {
        number: "2",
        title: "Open an engagement",
        body: "Fee basis, tasks, hour budget.",
      },
      {
        number: "3",
        title: "Invite the client",
        body: "One portal for their whole team.",
      },
      {
        number: "4",
        title: "Do the work",
        body: "Status answers itself from here.",
      },
    ],
  },

  faq: [
    {
      question: "Is this practice management software?",
      answer:
        "It is the client-facing half. KINECT does not do trust accounting, docketing or e-filing, and does not try to replace the system your firm already runs on. It handles the part your clients see: engagements, documents, status and time.",
    },
    {
      question: "Will clients actually log in?",
      answer:
        "Yes, because it answers the question they would otherwise email you: where does this stand. Status, documents and progress are there before they think to ask.",
    },
    {
      question: "Is it only for law firms?",
      answer:
        "Law firms first, because that is where the engagement model, the hour budgets and the document flow were built. Accounting and advisory firms run the same shape, and the vocabulary follows your firm rather than a practice area.",
    },
    {
      question: "Why flat pricing?",
      answer:
        "Firm headcount moves and matter volume moves more. KINECT costs the same flat price every month, whatever your client or engagement count, with no per-seat math.",
    },
    {
      question: "What does the AI do?",
      answer:
        "It explains the work in your client's language: what happened this month, what it means for them, what comes next. Your judgment, easier for a non-lawyer to absorb.",
    },
  ],

  closing: {
    headline: "Stop being the status report.",
    gradientPhrase: "the status report.",
    subhead: "Free for 30 days. Open one engagement and see what your client sees.",
    secondaryCta: "Not you? Pick another lane",
  },
};
