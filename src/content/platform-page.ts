import type { PlatformPageContent } from "./types";

/**
 * The /platform product overview. Promoted out of src/content/draft/ when
 * Jake asked for the page (2026-08-30); now Sanity-wired on the same
 * pattern as the pricing page (schema -> projection -> fetcher -> seed).
 *
 * Every claim below was verified against the platform repo before it was
 * written, feature by feature (kinect-platform: src/lib/personas.ts, the
 * supabase/migrations series, docs/help/*, docs/PLATFORM-GAPS.md). Claims
 * the platform cannot back yet were deliberately left out, the same
 * discipline settings.ts documents for the pricing cards:
 *
 *   "Anomaly alerts"          no detection or thresholds exist anywhere
 *   Live ad-spend numbers     ad accounts CONNECT (OAuth + per-client
 *                             mapping) but no metrics fetch is built, so
 *                             the copy says "connect", never "see spend"
 *   Smart Docs export         generated docs are copy-text only, so the
 *                             copy stops at merge + preview
 *   Google Analytics          not integrated at all
 *
 * Tier references use the DISPLAY names (Kinect, Kinect Plus, Kinect Pro),
 * matching settings.ts's tier table; the gating claims mirror that table
 * (AI + client ad accounts at Plus, branding/domain at Pro, 2FA on every
 * plan).
 *
 * Screenshots are the same real captures the persona pages use
 * (public/screenshots/*, from the platform repo's
 * e2e/marketing-screenshots.spec.ts pipeline), and each caption is reused
 * from, or scoped to, what its picture actually shows -- see the per-image
 * comments. `aspect` values are the PNGs' true pixel ratios.
 */
export const platformPage: PlatformPageContent = {
  seo: {
    title: "Platform | KINECT Client Portal, Work, Billing and AI",
    description:
      "Everything the KINECT platform does: a branded client portal, work and time management, client messaging, live analytics, AI insights, proposals and billing, scheduling and intake, and the security underneath it.",
  },

  hero: {
    eyebrow: "Platform",
    title: "The whole client relationship, one login.",
    gradientPhrase: "one login.",
    intro:
      "The portal your clients open, the work behind it, the messages around it, the numbers that prove it and the documents that get you paid. No tab-hopping, no exports, no \"let me pull that for you.\"",
    primaryCta: "Start free",
    secondaryCta: "Compare plans",
  },

  // Every chip is copy already shipped on /pricing (trustLine and the tier
  // cards), not a new claim.
  trustChips: [
    "Free for 14 days",
    "No card, no demo call, no onboarding fee",
    "Unlimited clients on every plan",
    "Cancel anytime",
  ],

  sections: [
    {
      id: "client-portal",
      eyebrow: "Client portal",
      title: "A portal they actually open",
      body: "Tasks, files, approvals and invoices in one place, behind a login your clients use instead of emailing you for a status update.",
      points: [
        "Branded as yours, fast enough to use on a phone",
        "Board, list, timeline and calendar views a client can follow",
        "Client-safe by default: they see their work, never your margins or other clients",
        "Preview the portal exactly as your client will see it before you invite them",
        "One-click portal invites for every contact on the client record",
      ],
      // The same capture home's "work, visible" bento tile uses; caption
      // reused from that tile's approved copy (it describes this image).
      screenshot: {
        src: "/screenshots/portal-board.png",
        alt: "KINECT task board",
        caption:
          "Board, list and timeline views your client can actually follow, with AI flagging what is about to slip.",
        aspect: 2918 / 1996,
      },
    },
    {
      id: "work-management",
      eyebrow: "Work management",
      title: "Your work, in your words",
      body: "Agencies run projects and tasks. Firms run engagements and matters. Consultants run engagements and deliverables. One platform, wearing your industry's vocabulary from the day you sign up.",
      points: [
        "A pipeline board from first contact to archived, per client",
        "Start from a template: pre-built task lists for the services you already sell",
        "Budget bars that turn amber at 80 percent, before the overrun",
        "My Tasks pulls everything assigned to you, across every client, into one list",
        "Checklists, attachments and comments on every task, autosaved as you type",
      ],
      // The Professional Services Firm HQ capture; caption is that lane's
      // approved copy (services.ts), written against this exact image.
      screenshot: {
        src: "/screenshots/services-firm-hq.png",
        alt: "KINECT firm HQ",
        caption:
          "Every client in the firm on one screen, with what is open, what is overdue, and what is still in flight.",
        aspect: 2880 / 1960,
      },
    },
    {
      id: "messaging",
      eyebrow: "Messages & files",
      title: "The conversation, next to the work",
      body: "A message channel per client, your internal Team Chat one click away, and a hard wall between the two.",
      // Card copy kept to one visual line-length family (user-directed
      // 2026-08-31): these four render as a 2x2 card grid, so uneven
      // lengths read as ragged tiles. Icons per card (same direction):
      // each names the thing the line is about, from the page's own
      // stroke-icon set.
      cards: [
        { icon: "bell", text: "Mention teammates or client contacts and they get notified" },
        { icon: "chat", text: "Replies, reactions and edits, so threads read like threads" },
        { icon: "paperclip", text: "Attachments land in the client's file library automatically" },
        { icon: "lock", text: "Team Chat stays internal, enforced at the database level" },
      ],
    },
    {
      id: "analytics",
      eyebrow: "Analytics",
      title: "Numbers, sitting next to the work that caused them",
      body: "Live performance data in the same view as the tasks and deliverables it belongs to, so proof of value is already in the room.",
      points: [
        "Client dashboards you arrange per client, with per-client visibility controls",
        "Search Console data synced nightly, from daily clicks to top queries",
        "Calculated cards built from any two metrics, no spreadsheet export",
        "A client report that writes the numbers as sentences, ready to save as a PDF",
        "Hours against budget and effective rate per client",
      ],
      // The agency analytics capture; caption is the agency lane's approved
      // copy (agency.ts), written against this exact image.
      screenshot: {
        src: "/screenshots/analytics-full.png",
        alt: "KINECT agency analytics dashboard",
        caption:
          "Performance, time and budget in one view, with the AI explaining what moved and why.",
        aspect: 2918 / 1996,
      },
    },
    {
      id: "ai-insights",
      eyebrow: "AI insights",
      title: "AI that explains the work to the client",
      body: "Ask your workspace a question in plain English. Kai reads your live data through your own permissions and answers with its sources underneath.",
      points: [
        "Plain-language answers to \"what is overdue\" and \"which clients have gone quiet\"",
        "Every answer cites the records it read, so you can check it",
        "Counts and dates come from your database, never from the model's imagination",
        "Drafted client updates you edit instead of write",
        "Included from Kinect Plus up",
      ],
    },
    {
      id: "proposals-billing",
      eyebrow: "Proposals & billing",
      title: "From scope to invoice without leaving the portal",
      body: "Proposals, SOWs and invoices live where the work does. Your client reads, accepts and pays from one link.",
      points: [
        "Send a proposal or SOW as a link that tracks when it is viewed",
        "When the client accepts online, the draft invoice creates itself",
        "Card payments through your own Stripe account, never ours",
        "Overdue invoices chase themselves at one, seven and fourteen days",
        "Pull unbilled, rated hours onto an invoice as line items",
      ],
      // The consultant engagement-dashboard capture; caption is that lane's
      // approved copy (consultant.ts), written against this exact image.
      screenshot: {
        src: "/screenshots/consultant-hq.png",
        alt: "KINECT consultant engagement dashboard",
        caption:
          "Deliverables tracked against hours, with the AI warning you before scope quietly eats the fee.",
        aspect: 2356 / 1996,
      },
    },
    {
      id: "scheduling",
      eyebrow: "Scheduling & intake",
      title: "Booking pages and intake forms, included",
      body: "The front door of the practice without two more subscriptions. Booking links respect your real calendar, and intake forms land on the client record.",
      cards: [
        {
          icon: "calendar",
          text: "Public booking pages with buffers, booking windows and your published hours",
        },
        {
          icon: "clock",
          text: "Availability subtracts your Google Calendar busy time automatically",
        },
        {
          icon: "grid",
          text: "One month view across every client: due dates, sessions and bookings",
        },
        {
          icon: "form",
          text: "Intake forms published at a link, with responses attached to the right client",
        },
        {
          icon: "doc",
          text: "Smart Docs merge client details into contracts and letters, with a live preview",
        },
        {
          icon: "download",
          text: "Form responses export to CSV, one row per response",
        },
      ],
    },
    {
      id: "integrations",
      eyebrow: "Integrations",
      title: "Bring the data you already report on",
      body: "Connect the accounts you already pull numbers from. Nothing to migrate, nothing to relearn.",
      cards: [
        {
          icon: "search",
          text: "Google Search Console for search performance, synced nightly",
        },
        {
          icon: "megaphone",
          text: "Client ad accounts across Google, Meta and LinkedIn, from Kinect Plus up",
        },
        {
          icon: "calendar",
          text: "Google Calendar per teammate, for availability and bookings",
        },
        { icon: "card", text: "Stripe for card payments on your own account" },
        {
          icon: "key",
          text: "Connected by OAuth with least-privilege scopes, in about ten minutes",
        },
        {
          icon: "spark",
          text: "Anthropic Claude behind Kai, answering from your own workspace",
        },
      ],
    },
    {
      id: "security",
      eyebrow: "Security & control",
      title: "Client-safe down to the database",
      body: "Every workspace is isolated with row-level security. What a client contact can see is enforced where the data lives, not in the navigation.",
      cards: [
        {
          icon: "users",
          text: "Admin, manager and member roles for your team, portal access for client contacts",
        },
        {
          icon: "shield",
          text: "Two-factor authentication on every plan, with a workspace-wide requirement if you want it",
        },
        { icon: "database", text: "Encrypted daily backups held off-provider" },
        {
          icon: "globe",
          text: "Your logo, your color and your own domain on client documents, on Kinect Pro",
        },
      ],
    },
  ],

  // Each of the six is a shipped surface documented in the sections above:
  // the portal, work management, Team Chat, scheduling links, forms, and
  // invoicing with reminders.
  stat: {
    title: "What one login replaces",
    value: "Six tools",
    caption:
      "The client portal, the project tracker, the team chat, the booking link, the form builder and the invoice chaser. One subscription, one place your client already knows.",
  },

  // Illustrative Kai interaction, built strictly from the real widget:
  // `headline` is its hero line and `question` its first suggestion chip,
  // both verbatim from kinect-platform's kai-widget.tsx; the answer draws
  // only on what Kai's tools return (overdue items, stale clients, drafted
  // updates), and `sources` are two of its six actual tool names, rendered
  // the way the widget cites them. The client name is invented for the
  // mock, same as home's aiInsight quote invents a campaign.
  aiQuote: {
    headline: "What do you need to know?",
    question: "What's overdue?",
    quote:
      "Four items are overdue across two clients, and Meridian Consulting has gone quiet for 15 days. I drafted a check-in you can edit before it goes out.",
    sources: ["get_overdue_by_client", "get_stale_clients"],
  },

  closing: {
    headline: "See it with your own client.",
    gradientPhrase: "your own client.",
    subhead: "Free for 14 days. No card, no demo call, no onboarding fee.",
    cta: "Start free",
  },
};
