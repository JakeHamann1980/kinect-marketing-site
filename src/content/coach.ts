import type { PersonaPageContent } from "./types";

export const coach: PersonaPageContent = {
  persona: "coach",
  seo: { title: "", description: "" },

  hero: {
    headline: "Your athletes need more than a PDF.",
    gradientPhrase: "more than a PDF.",
    subhead:
      "Programs, check-ins, form reviews, and progress in one place, so your clients see momentum between sessions, not just during them.",
    primaryCta: "Start free",
    secondaryCta: "Watch the 2-min tour",
  },
  heroExtra: {
    eyebrow: "For coaches & personal trainers",
    proofPoints: ["Adherence tracking built in", "Unlimited program templates"],
  },

  pain: {
    title: "Great coaching dies in a spreadsheet and a group chat.",
    cards: [
      {
        title: "Programs stuck in PDFs",
        body: "Version four of a spreadsheet nobody opens on a phone, in a gym, halfway through a set.",
      },
      {
        title: "Check-ins lost in DMs",
        body: "Progress photos, weights and sleep notes buried across three different apps and threads.",
      },
      {
        title: "No proof of progress",
        body: "Clients quit around week six because nobody ever showed them the line trending up.",
      },
    ],
  },

  capabilities: {
    intro: "Built for the way you work",
    title: "Built around the coaching loop, not generic tasks.",
    cards: [
      {
        title: "Programs that adapt weekly",
        body: "Build blocks by week, track adherence per session and see exactly which day slips.",
      },
      {
        title: "Form review with real cues",
        body: "Athletes upload video and you drop timestamped feedback they rewatch before every lift.",
      },
      {
        title: "Progress they can feel",
        body: "Est. 1RM, body comp, sleep and photos in one trend line, the retention tool you earned.",
      },
    ],
  },

  screenshot: {
    src: "/screenshots/coach-hq.png",
    alt: "KINECT coaching HQ",
    caption:
      "Weekly check-ins, form review with timestamped cues, and AI that spots the pattern you missed.",
  },

  workflow: {
    eyebrow: "Program templates",
    title: "Every kind of client you take on.",
    subhead:
      "Start from a proven block and adjust, instead of rebuilding week one every time.",
    items: [
      "12-Week Strength",
      "Fat Loss Phase",
      "Marathon Prep",
      "Hypertrophy Block",
      "Nutrition Reset",
      "Postnatal Recovery",
      "Return to Sport",
      "Group Training",
    ],
  },

  steps: {
    title: "Live in ten minutes, not ten days",
    items: [
      { number: "1", title: "Sign up", body: "Email or Google. No sales call." },
      {
        number: "2",
        title: "Build a block",
        body: "Start from a template you trust.",
      },
      {
        number: "3",
        title: "Add your athlete",
        body: "Goals, baselines and check-in cadence.",
      },
      {
        number: "4",
        title: "Send the link",
        body: "They log in on a phone and train.",
      },
    ],
  },

  // NEEDS_CONTEXT: no persona-specific FAQ copy exists in the design source
  // for the coach subdomain page. See agency.ts for the same note; the
  // .dc.html only implements an FAQ section on the home page.
  faq: [],

  closing: {
    headline: "Coach the work. Let KINECT prove it.",
    gradientPhrase: "Let KINECT prove it.",
    subhead: "Free for your first three athletes. Keep the ones who stay.",
  },
};
