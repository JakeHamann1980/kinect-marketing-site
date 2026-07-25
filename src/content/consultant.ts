import type { PersonaPageContent } from "./types";

export const consultant: PersonaPageContent = {
  persona: "consultant",
  seo: { title: "", description: "" },

  hero: {
    headline: "You sell judgment. Show your work.",
    gradientPhrase: "Show your work.",
    subhead:
      "Engagements, deliverables, billable hours, and client KPI movement in one place, so renewal conversations start with evidence instead of rapport.",
    primaryCta: "Start free",
    secondaryCta: "Watch the 2-min tour",
  },
  heroExtra: {
    eyebrow: "For consultants, advisors & mentors",
    proofPoints: ["Time against fee budgets", "SOWs with e-signature"],
  },
  navBadge: "for Consultants",

  pain: {
    title: "The hardest part of advisory is proving the advice landed.",
    cards: [
      {
        title: "Scope creeps quietly",
        body: "You are 78% through the hours and 60% through the milestones, and nobody flagged it.",
      },
      {
        title: "Session notes go nowhere",
        body: "Decisions and action items live in a notebook, and then in nobody's inbox at all.",
      },
      {
        title: "Renewals rest on vibes",
        body: "No line between your work and the number that moved, so each renewal is a fresh sell.",
      },
    ],
  },

  capabilities: {
    intro: "Built for the way you work",
    title: "The practice management layer advisors keep rebuilding in Notion.",
    cards: [
      {
        title: "Engagements, fully scoped",
        body: "Fixed fee or retainer, milestones and hour budgets, with pacing warnings built right in.",
      },
      {
        title: "Sessions become artifacts",
        body: "Notes turn into decisions, action items and a client recap the AI drafts for you.",
      },
      {
        title: "Impact you can point at",
        body: "Track the client KPI you were hired to move, and the ROI multiple on your total fee.",
      },
    ],
  },

  screenshot: {
    src: "/screenshots/consultant-hq.png",
    alt: "KINECT practice HQ",
    caption:
      "Deliverables tracked against hours, with the AI warning you before scope quietly eats the fee.",
  },

  workflow: {
    eyebrow: "Engagement templates",
    title: "However you package your thinking.",
    subhead:
      "Diagnostics, sprints, retainers, coaching, each with milestones and a fee basis.",
    items: [
      "Ops Diagnostic",
      "GTM Strategy Sprint",
      "Leadership Coaching",
      "Board Advisory",
      "Org Design",
      "Fractional Retainer",
      "M&A Readiness",
      "Executive Mentoring",
    ],
  },

  steps: {
    title: "Live in ten minutes, not ten days",
    items: [
      { number: "1", title: "Sign up", body: "Email or Google. No sales call." },
      {
        number: "2",
        title: "Scope the work",
        body: "Milestones, fee basis, hour budget.",
      },
      {
        number: "3",
        title: "Send the SOW",
        body: "E-signature and deposit built in.",
      },
      {
        number: "4",
        title: "Invite stakeholders",
        body: "One portal for the whole team.",
      },
    ],
  },

  // NEEDS_CONTEXT: no persona-specific FAQ copy exists in the design source
  // for the consultant subdomain page. See agency.ts for the same note; the
  // .dc.html only implements an FAQ section on the home page.
  faq: [],

  closing: {
    headline: "Advice is easy to doubt. Evidence is not.",
    gradientPhrase: "Evidence is not.",
    subhead: "Free for your first engagement. Renew on proof, not goodwill.",
    secondaryCta: "Not you? Pick another lane",
  },
};
