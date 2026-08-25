import type { HomeContent } from "./types";

export const home: HomeContent = {
  seo: {
    title: "KINECT | Client Portal Software Clients Actually Open",
    description:
      "A branded client portal for agencies, coaches and consultants: task boards, analytics and AI that explains the work. Flat pricing from $149, no per-seat fees.",
  },

  hero: {
    headline:
      "Your clients shouldn't need a status meeting to know the work is working.",
    gradientPhrase: "the work is working.",
    subhead:
      'One place where the work, the numbers, and the "so what" finally live together.',
    primaryCta: "Start free",
    secondaryCta: "View demo",
  },

  logoStrip: {
    eyebrow:
      "Built with agencies, coaches and advisors who bill by the outcome",
  },

  personaSelector: {
    eyebrow: "Pick your lane",
    title: "One engine, three very different jobs.",
    intro:
      "Templates, metrics and language tuned to how you actually bill. Pick the version built for your work; the platform underneath is the same.",
  },

  personaCards: [
    {
      // user-directed 2026-07-26: "Agencies & Studios" umbrella; photographers
      // named explicitly so they see themselves in the lane picker.
      persona: "agency",
      title: "Agencies & Studios",
      body: "Portal, analytics, and AI insight for agencies, studios and photographers.",
      features: [
        "Native GA + Google Ads dashboards",
        "Project templates per service line",
        "Client-facing portal they actually open",
      ],
      cta: "Enter agency.kinectnow.com",
    },
    {
      persona: "coach",
      title: "Coaches & Trainers",
      body: "Program delivery, check-ins, and progress proof for fitness pros with a full roster.",
      features: [
        "Training blocks + adherence tracking",
        "Video form review with timestamps",
        "Weekly check-ins and progress photos",
      ],
      cta: "Enter coach.kinectnow.com",
    },
    {
      persona: "consultant",
      title: "Consultants & Mentors",
      body: "Engagements, deliverables, and billable hours for advisors selling judgment.",
      features: [
        "Scoped engagements with milestones",
        "Time tracking against fee budgets",
        "Session notes → decisions → recap",
      ],
      cta: "Enter consultant.kinectnow.com",
    },
  ],

  stepsSection: {
    title: "Anyone can run KINECT, it's that simple",
    subhead:
      "Ten minutes from signup to a client logging into a branded portal.",
  },

  steps: [
    {
      number: "01",
      title: "Sign up",
      body: "Email or Google. No sales call, no onboarding fee.",
    },
    {
      number: "02",
      title: "Connect your data",
      body: "Bring the analytics and numbers you already report on.",
    },
    {
      number: "03",
      title: "Pick a template",
      body: "Your service, program or engagement, already scoped.",
    },
    {
      number: "04",
      title: "Invite the client",
      body: "One link into a portal branded as yours.",
    },
  ],

  showcase: {
    title: "KINECT fits how you already work, not the other way around",
    subhead:
      "Bring your data, your templates and your rates. Nothing to migrate, nothing to relearn.",
    labels: {
      agency: "agency",
      coach: "coach",
      consultant: "consultant",
    },
    // Fallback screenshot paths (see src/lib/sanity.ts's fetchHome fallback
    // contract) -- alts match the ones ShowcaseCycler used to hardcode
    // directly before screenshots became Sanity image fields.
    screenshots: {
      agency: { src: "/screenshots/analytics-full.png", alt: "KINECT agency analytics dashboard" },
      coach: { src: "/screenshots/coach-checkin.png", alt: "KINECT coach check-in dashboard" },
      consultant: { src: "/screenshots/consultant-hq.png", alt: "KINECT consultant engagement dashboard" },
    },
    workflow: [
      {
        title: "Ten-minute setup",
        body: "No implementation project. You are live before the coffee cools.",
      },
      {
        title: "Your data, connected",
        body: "Analytics, ads and the numbers you already report on.",
      },
      {
        title: "Your templates",
        body: "Service lines, programs or engagements, with your rates.",
      },
      {
        title: "A portal clients open",
        body: "Branded, fast, and simple enough to use on a phone.",
      },
      {
        title: "Secure by default",
        body: "SSO, role-based access and encryption in transit and at rest.",
      },
    ],
  },

  pillarsSection: {
    title: "Report less, prove more.",
    intro:
      'Three products in one login: portal, analytics and AI. No tab-hopping, no exports, no "let me pull that for you."',
  },

  pillars: [
    {
      title: "A portal they open",
      body: "Tasks, files, approvals and invoices in one place, behind a login clients actually use.",
    },
    {
      title: "Numbers, not vibes",
      body: "Live performance data sitting next to the work that caused it. The proof is in the room.",
    },
    {
      title: "AI that explains itself",
      body: "Claude reads the data, flags what moved, says why, and drafts the update you dreaded.",
    },
  ],

  bento: {
    workVisible: {
      title: "The work, visible",
      body: "Board, list and timeline views your client can actually follow, with AI flagging what is about to slip.",
      image: { src: "/screenshots/portal-board.png", alt: "KINECT task board" },
    },
    aiInsight: {
      eyebrow: "AI insight",
      quote:
        "Sessions fell 15% in week 3. the Spring Launch campaign was paused Tuesday. Resume it, or move about $1.2k a week to Organic (converting 1.9× better).",
    },
    stat: {
      value: "2–5 hrs",
      caption: "saved every week on the reporting you used to do by hand.",
    },
  },

  faqTitle: "Questions worth asking",

  faq: [
    {
      question: "Is this just another client portal?",
      answer:
        "No. The portal is table stakes. What sets KINECT apart is that live performance data and AI explanations sit right next to the work, so proof of value is already in the room.",
    },
    {
      question: "Do I need to migrate everything?",
      answer:
        "No. Connect the accounts you already report on, pick a template, and run your next project in KINECT. Keep old work where it is.",
    },
    {
      question: "What does the AI actually do?",
      answer:
        "It watches your data for anomalies, explains why something moved in plain language, recommends what to do, and drafts the client update you were dreading.",
    },
    {
      question: "Can my clients see everything?",
      answer:
        "You control it. Client view shows the work, files, approvals and their own numbers, never your margins, rates or other clients.",
    },
    {
      question: "How is it priced?",
      answer:
        "Flat monthly by plan, no per-seat charges. Every workspace starts with 14 days free on Kinect Plus, no card required.",
    },
    {
      question: "Is my client data secure?",
      answer:
        "TLS 1.3 in transit, AES-256 at rest, SSO and role-based access, least-privilege OAuth scopes, audit logs and point-in-time backups.",
    },
  ],

  closing: {
    headline: "Stop reporting on the work. Start showing it.",
    gradientPhrase: "Start showing it.",
    subhead:
      "Free for 14 days on Kinect Plus. No card, no demo call, no onboarding fee.",
  },
};
