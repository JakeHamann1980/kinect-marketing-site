import type { PersonaPageContent } from "./types";

export const coach: PersonaPageContent = {
  persona: "coach",
  seo: {
    title: "Client Check-In and Progress Portal for Fitness Coaches | KINECT",
    description:
      "Check-ins, program delivery and progress proof for fitness coaches, in one branded portal your clients open. Flat pricing from $149, no per-seat fees.",
  },

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
  navBadge: "for Coaches",

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

  // Persona FAQs were absent from the design source (it only ships home-page
  // FAQs). This copy was drafted new and approved by Jake on 2026-07-25.
  faq: [
    {
      question: "Will my clients actually check in?",
      answer:
        "Check-ins live in the same place as their program and progress, so completing one is part of the routine, not an extra chore. And you can see at a glance who is engaged and who is drifting, before the slow fade becomes a goodbye.",
    },
    {
      question: "Does my price go up as my roster grows?",
      answer:
        "No. Every plan is flat. Ten clients or fifty, the monthly price is the monthly price.",
    },
    {
      question: "What do my clients see?",
      answer:
        "Their program, their progress, and their check-ins in one clean portal with your name on it, not a PDF lost in their downloads folder.",
    },
    {
      question: "Does KINECT replace my programming software?",
      answer:
        "KINECT is the client relationship layer: check-ins, progress, accountability, and communication. If a dedicated program builder is core to your workflow, KINECT works alongside it.",
    },
    {
      question: "What does the AI do for a coach?",
      answer:
        "It turns raw check-in data into the read you would give it yourself: who is on track, who needs a nudge, and what changed this week.",
    },
  ],

  closing: {
    headline: "Coach the work. Let KINECT prove it.",
    gradientPhrase: "Let KINECT prove it.",
    subhead: "Free for your first three athletes. Keep the ones who stay.",
    secondaryCta: "Not you? Pick another lane",
  },
};
