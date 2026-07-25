import type { PersonaPageContent } from "./types";

export const agency: PersonaPageContent = {
  persona: "agency",
  seo: { title: "", description: "" },

  hero: {
    headline: "Your best work is invisible until the data agrees.",
    gradientPhrase: "until the data agrees.",
    subhead:
      'KINECT puts the portal, the campaign numbers, and the AI read-out in one place, so "is it working?" answers itself before the client asks.',
    primaryCta: "Start free",
    secondaryCta: "Watch the 2-min tour",
  },
  heroExtra: {
    eyebrow: "For full-service agencies",
    proofPoints: ["Native GA + Google Ads", "No per-seat pricing"],
  },
  navBadge: "for Agencies",

  pain: {
    title: "You did not start an agency to build slide decks about the agency.",
    cards: [
      {
        title: "Five tools, one story",
        body: "Portal here, analytics there, email everywhere. Context lives in whatever tab stayed open.",
      },
      {
        title: "Proof takes all day",
        body: "Every month you rebuild a report in Data Studio to say what the dashboard already knew.",
      },
      {
        title: "Portals they ignore",
        body: "When a login feels like paperwork, clients stop opening it and start booking calls instead.",
      },
    ],
  },

  capabilities: {
    intro: "Built for the way you work",
    title: "Everything on one login, in the language of client work.",
    cards: [
      {
        title: "Analytics beside the work",
        body: "Sessions, conversions, ROAS and CPA sitting right next to the tasks that moved them.",
      },
      {
        title: "Templates per service line",
        body: "Web, SEO, paid, social, email and print, each with its own tasks, KPIs and billing rate.",
      },
      {
        title: "Time and budget, honestly",
        body: "Hours against budget and effective rate per client, so you know which accounts pay off.",
      },
    ],
  },

  screenshot: {
    src: "/screenshots/portal-board.png",
    alt: "KINECT client portal board",
    caption:
      "Kanban, list and timeline views, with the AI flagging what is about to slip.",
  },

  workflow: {
    eyebrow: "Project templates",
    title: "Spin up a client in one click.",
    subhead:
      "Every service you sell, pre-built with tasks, milestones, and the metrics that matter.",
    items: [
      "Website Design",
      "SEO Retainer",
      "Paid Ads",
      "Social Media",
      "Email Marketing",
      "Branding & Creative",
      "Print & Collateral",
      "Ops Retainer",
    ],
  },

  steps: {
    title: "Live in ten minutes, not ten days",
    items: [
      { number: "1", title: "Sign up", body: "Email or Google. No sales call." },
      {
        number: "2",
        title: "Connect data",
        body: "Google Analytics and Ads via OAuth.",
      },
      {
        number: "3",
        title: "Pick a template",
        body: "First client project, pre-scoped.",
      },
      {
        number: "4",
        title: "Invite the client",
        body: "One link into a branded portal.",
      },
    ],
  },

  // NEEDS_CONTEXT: no persona-specific FAQ copy exists in the design source
  // for the agency subdomain page. The .dc.html only implements an FAQ
  // section on the home page (`faqDefs` in the shared render function); the
  // per-persona `subs.agency` object has no `faq` key, and the section is
  // not rendered at all for subdomain pages. Left empty rather than
  // fabricated. See report for detail.
  faq: [],

  closing: {
    headline: "Be the agency that shows, not the one that tells.",
    gradientPhrase: "not the one that tells.",
    subhead:
      "Free for your first client. Bring the second one when you are convinced.",
    secondaryCta: "Not you? Pick another lane",
  },
};
