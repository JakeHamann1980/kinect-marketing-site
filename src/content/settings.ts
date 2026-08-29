import type { SiteSettings } from "./types";

/*
 * Pricing note: the .dc.html prototype's live state (`homePlans` in the
 * render function) shows the home page's own pricing table as ranges
 * ("$49–149", "$99–399", "$249–799") that vary by lane, while each
 * persona subdomain's `subs.<persona>.plans` shows different flat numbers
 * per persona (coach: $49/$99/$249, consultant: $99/$249/$599, agency:
 * $149/$399/$799). The handoff README documents a single, final, shared
 * figure instead ("Three tiers matching the app: Starter $149, Growth
 * $399 (most popular, accent border and glow), Scale $799") and the
 * `SiteSettings` contract has exactly one `pricing` slot shared by every
 * page. Per the README's documented (and task-mandated) numbers, which
 * happen to match the agency subdomain's tiers exactly, this file encodes
 * that single shared table. The home page's own range-based table and the
 * coach/consultant-specific numbers were not transcribed as a second
 * pricing structure since the type has no slot for one and the README
 * treats the $149/$399/$799 table as the final, cross-site figure.
 */
export const settings: SiteSettings = {
  navLinks: [
    // Fix (final review, I1): "Product" and "Docs" have no real destination
    // page anywhere in this app yet, so they stay "#" (see docs/LAUNCH.md's
    // recounted "#" link inventory). user-directed 2026-08-03: "Pricing"
    // now routes to the dedicated /pricing page (tier cards + full
    // comparison matrix + pricing FAQ) instead of the in-page `#pricing`
    // anchor; the on-page pricing sections remain as teasers with their own
    // "See everything in every plan" link to the same page. A relative
    // path serves correctly on every hostname (the proxy passes /pricing
    // through in place, same as /legal/*).
    // user-directed 2026-08-03: "Docs" is built out at /docs but marked
    // `draft`, so it is hidden on the live site and visible only with
    // NEXT_PUBLIC_ENABLE_DRAFT_PAGES=1 (see src/lib/draft-pages.ts). Its
    // purpose is still an open question -- there is no shipped product to
    // document while the site is a pre-launch waitlist.
    // "Product" gets the same treatment (user-directed 2026-08-03, second
    // pass): it was still shipping as a dead "#" on live. Its real
    // destination is the /platform overview, so it now points there and
    // carries the same `draft` gate -- hidden on live until /platform is
    // approved, live-and-clickable locally. That leaves the production nav
    // with only destinations that actually exist: Solutions and Pricing.
    { label: "Product", href: "/platform", draft: true },
    { label: "Pricing", href: "/pricing" },
    { label: "Docs", href: "/docs", draft: true },
  ],

  solutions: [
    {
      // user-directed 2026-07-26: agency lane renamed to the "Agencies &
      // Studios" umbrella (photographers and creative studios bucket here).
      persona: "agency",
      name: "Agencies & Studios",
      description: "Client portal, campaign analytics and AI reporting.",
    },
    {
      // Coaches & Trainers was retired from the picker on 2026-08-31. The
      // lane is still served at coach.kinectnow.com; it is simply no longer
      // sold. See PROMOTED_PERSONA_IDS in src/lib/personas.ts.
      persona: "services",
      name: "Professional Services",
      description: "Engagements, documents and time for law and advisory firms.",
    },
    {
      persona: "consultant",
      name: "Consultants & Mentors",
      description: "Engagements, deliverables and outcome tracking.",
    },
  ],

  pricing: {
    headline: "Priced like a tool, not a tax",
    // user-directed 2026-07-27: "no per-feature" dropped -- tiers do gate
    // features (AI and client ad accounts at Plus, branding/SSO at Pro), so
    // the claim was attackable. "No per-client" replaces it: the actual
    // pricing principle Jake + Will decided (flat rate, never
    // per-seat/per-client).
    //
    // As of the pricing review, "no per-client" is now literal on every tier:
    // client_limit is unlimited across the board, so nobody is ever charged
    // for growing. The ladder is carried by connected data sources, storage
    // and capability instead. Do not reintroduce a client cap without
    // rewriting this line first.
    supporting: 'Flat monthly. No per-seat, no per-client, no "contact sales."',
    // `tagline`/`detail` (user-directed 2026-08-03): the /pricing page's
    // detailed card rendering -- see the Tier type's own doc comment. The
    // compact `features` lists above them are unchanged handoff copy and
    // still what the home/persona teaser sections render. Detail lines are
    // drawn strictly from claims already shipped elsewhere on the site.
    // Tier names (pricing review): Starter/Growth/Scale became
    // Kinect/Kinect Plus/Kinect Pro. A fourth tier, Kinect Infinity, is
    // planned around the Growth Engine and is deliberately absent here until
    // it is scoped and priced.
    //
    // These are DISPLAY names only. The database keys stay `starter`,
    // `growth` and `scale` (platform: public.plans.key), because those are
    // written into Stripe checkout metadata and read back by the webhook to
    // attribute every renewal and cancellation. Display copy is free to
    // change; the keys are not.
    //
    // ---------------------------------------------------------------------
    // CLAIMS REMOVED, AND WHY. Do not restore any of these without checking
    // that the feature exists first. Each was live on this page with no
    // implementation anywhere in the platform:
    //
    //   "Anomaly alerts"  (was Starter)  no detection, thresholds or alerting
    //   "Up to 5 clients" (was Starter)  every tier is unlimited now
    //   "Integrations"    (was Growth)   too vague to be checkable; replaced
    //                                    with the ad platforms that are real
    // ---------------------------------------------------------------------
    // "more available" rather than an asterisk (user-directed 2026-08-31).
    // The additional-storage price already appears twice further down
    // /pricing -- the Files & Storage comparison row and the "What happens if
    // I run out of storage?" FAQ -- so a footnote marker would only point at
    // something the same page already answers. An asterisk on a pricing card
    // is also the visual grammar of a catch, which works against this page's
    // whole claim ("The price is the price", no per-seat, no per-client), and
    // it would misdescribe the mechanic: the cap is SOFT, uploads keep working
    // past it by design (see the platform's 20260829100000_storage_quota.sql).
    tiers: [
      {
        name: "Kinect",
        price: 149,
        tagline: "For operators putting their clients behind one login.",
        features: ["Unlimited clients", "client portal", "invoicing"],
        detail: [
          "Unlimited clients on every plan",
          "Branded client portal",
          "Task boards, files and approvals",
          "Invoices, rate cards and proposals",
          "Templates for your services or programs",
          "100 GB storage, more available",
        ],
        cta: "Choose Kinect",
      },
      {
        name: "Kinect Plus",
        price: 399,
        popular: true,
        tagline: "For rosters that need the numbers, and the story behind them.",
        features: ["Client ad accounts", "profitability", "AI insights"],
        detail: [
          "Everything in Kinect",
          "Client ad accounts across Google, Meta and LinkedIn",
          "Client-facing dashboards, with per-client visibility controls",
          "Profitability and utilization per client",
          "AI insights and drafted client updates",
          "Exports and scheduled reports",
          "500 GB storage, more available",
        ],
        cta: "Start free",
      },
      {
        name: "Kinect Pro",
        price: 799,
        tagline: "For firms that need the portal to carry their own name.",
        // Rewritten 2026-08-03 after scoping each claim against the platform
        // (docs/PRO-FEATURES.md). The previous copy carried a bare "(*)" on
        // three lines with NO footnote anywhere -- PricingSection renders no
        // legend and `pricing.note` is deliberately unrendered -- so the live
        // page showed an asterisk pointing at nothing. An asterisk on a
        // pricing claim reads as "conditions apply"; with no stated condition
        // it is weaker than either saying the thing plainly or omitting it.
        // It also contradicted the storage line's own precedent ("more
        // available" instead of an asterisk, user-directed 2026-08-31).
        //
        // Two of the three claims were half true, so nothing had to leave the
        // page: workspace branding is REAL (logo_url + accent_color on client
        // documents, the public /d page and emails, migration
        // 20260828100000), and two-factor is REAL (/login/mfa, AAL enforced
        // in middleware). What is missing is the custom DOMAIN, the
        // workspace-wide 2FA REQUIREMENT, and SSO. Those now say "coming
        // soon" in words rather than hiding behind a marker.
        //
        // `features` (the compact list on the home/persona teasers) sold "Your
        // own domain" and "SSO" with no caveat at all, which was worse than
        // the asterisks. It now lists only shipped capability.
        features: ["Your own branding", "Two-factor auth", "priority support"],
        detail: [
          "Everything in Kinect Plus",
          "Your own logo and color on client documents",
          "Two-factor authentication",
          "Priority support",
          "2 TB storage, more available",
          "Custom domain, coming soon",
          "Workspace-wide two-factor and SSO, coming soon",
          "Multiple workspaces under one bill, coming soon",
        ],
        cta: "Choose Kinect Pro",
      },
    ],
    // Rewritten in the pricing review. The transcribed original read "Every
    // plan includes the portal, analytics and AI insights. Pricing varies
    // slightly by lane." Both halves were wrong: AI is a Plus feature, not an
    // every-plan one, and the per-lane variation it presumed conflicts with
    // the single shared tier table above (see this file's opening note).
    //
    // What replaced it is the thing that IS true on every plan and is the
    // strongest line on the page. Still not wired into any component.
    note: "Every plan includes the portal and unlimited clients. You are never charged for growing.",
  },

  footer: {
    positioning: "Where clients live. Where data lives. Where insights live.",
    columns: [
      {
        heading: "Solutions",
        links: [
          // Fix (final review, I1): these three route to the matching
          // persona's own page (dedupe'd `personaHref`-equivalent relative
          // paths -- see src/lib/personas.ts). user-directed 2026-08-03:
          // "Compare plans" now has a real destination, the dedicated
          // /pricing page's comparison matrix.
          { label: "For agencies", href: "/agency" },
          { label: "For professional services", href: "/services" },
          { label: "For consultants", href: "/consultant" },
          { label: "Compare plans", href: "/pricing" },
        ],
      },
      {
        // user-directed 2026-08-03: the whole Platform column is hidden on
        // the live site (every link was a dead "#") and now points at the
        // built-out /platform overview's section anchors, visible only with
        // drafts enabled. See src/lib/draft-pages.ts.
        heading: "Platform",
        draft: true,
        links: [
          { label: "Client portal", href: "/platform#client-portal" },
          { label: "Analytics", href: "/platform#analytics" },
          { label: "AI insights", href: "/platform#ai-insights" },
          { label: "Proposals & billing", href: "/platform#proposals-billing" },
          { label: "Integrations", href: "/platform#integrations" },
        ],
      },
      {
        heading: "Resources",
        links: [
          // Same draft gate as the nav's Docs item: hidden on live, points
          // at the built-out /docs index locally.
          { label: "Docs", href: "/docs", draft: true },
          // No near-term destination (user-directed 2026-08-03): all three
          // are post-launch content. With Docs also gated this column has
          // nothing left, so visibleFooterColumns drops the whole heading
          // rather than render it over empty space.
          { label: "Onboarding guide", href: "#", draft: true },
          { label: "Templates", href: "#", draft: true },
          { label: "Changelog", href: "#", draft: true },
        ],
      },
      {
        heading: "Company",
        links: [
          // Fix (final review, I1): "Security" now routes to the real
          // /legal/security page (same destination as the "Security" entry
          // in legalLinks below). About/Contact/Status have no dedicated
          // pages, so they stay "#".
          // About needs a page; Status needs uptime infrastructure that
          // does not exist pre-launch. Both gated. "Contact" is the
          // exception -- hello@kinectnow.com is already the contact address
          // on every legal page, so it gets a real destination rather than
          // being hidden.
          { label: "About", href: "#", draft: true },
          { label: "Security", href: "/legal/security" },
          { label: "Contact", href: "mailto:hello@kinectnow.com" },
          { label: "Status", href: "#", draft: true },
        ],
      },
    ],
    // Fix (final review, I6): real hrefs sourced directly from content, not
    // a separate `LEGAL_HREFS` label-keyed map in Footer.tsx (deleted --
    // Footer now renders `link.href` directly). DPA and Accessibility have
    // no route yet, so they stay "#" with a TODO (post-launch backlog, see
    // docs/LAUNCH.md §7).
    legalLinks: [
      { label: "Privacy Policy", href: "/legal/privacy" },
      { label: "Terms & Conditions", href: "/legal/terms" },
      { label: "Security", href: "/legal/security" },
      { label: "Cookie Policy", href: "/legal/cookies" },
      // TODO(Task 14 backlog): DPA and Accessibility pages don't have a
      // route yet -- DPA needs counsel, Accessibility needs an audit. Gated
      // (user-directed 2026-08-03) so the live legal row carries only real
      // documents.
      { label: "DPA", href: "#", draft: true },
      { label: "Accessibility", href: "#", draft: true },
    ],
    copyright: "© 2026 KINECT · kinectnow.com",
  },
};
