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
    // Points at the /platform overview. It carried the same `draft` gate
    // as Docs from 2026-08-03 (hidden on live until the page was approved);
    // Jake asked for the page on 2026-08-30, so the content was rebuilt
    // against the platform repo's real feature set and the gate came off.
    // Relabeled "Product" -> "Platform" (user-directed 2026-08-31) to match
    // the page and the footer column. Remember: the Footer reads this
    // file's Sanity copy, so this change needs a reseed (npm run
    // seed:sanity) to reach production.
    { label: "Platform", href: "/platform" },
    { label: "Pricing", href: "/pricing" },
    { label: "Docs", href: "/docs", draft: true },
  ],

  // Points at the marketing home page until a real scheduling link exists.
  // Change it in the Studio (Site Settings -> Demo URL), not here.
  demoUrl: "https://kinectnow.com/",

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
    supporting: 'Flat pricing. No per-seat, no per-client, no "contact sales."',
    // `tagline`/`detail` (user-directed 2026-08-03): the /pricing page's
    // detailed card rendering -- see the Tier type's own doc comment. The
    // compact `features` lists above them are unchanged handoff copy and
    // still what the home/persona teaser sections render. Detail lines are
    // drawn strictly from claims already shipped elsewhere on the site.
    // Tier names (pricing review): Starter/Growth/Scale became
    // Kinect/Kinect Plus/Kinect Pro. The fourth slot was reserved for a
    // planned "Kinect Infinity" built around the Growth Engine; as of
    // 2026-09-01 KINECT ENTERPRISE TAKES IT, aimed at multi-location firms
    // rather than at the Growth Engine. Infinity is not deferred, it is
    // superseded -- do not reintroduce it as a fifth tier without deciding
    // what it sells that Enterprise does not.
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
        annualPrice: 1490,
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
        annualPrice: 3990,
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
        annualPrice: 7990,
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
        // 2026-08-30: the platform shipped the capability gate, the
        // workspace-wide 2FA requirement and client-facing custom domains
        // (migrations 20260907100000/110000/120000, each verified in the
        // platform repo before this copy changed). Two lines therefore left
        // the Pro card for OPPOSITE reasons, and neither should come back:
        //
        //   "Two-factor authentication" -- removed because it is on EVERY
        //   plan and always was. Listing it under Pro implied an exclusivity
        //   that never existed. The workspace-wide REQUIREMENT that shipped
        //   is also ungated, so it is not a Pro differentiator either; it
        //   lives in the /pricing comparison table as a yes/yes/yes row.
        //
        //   "Custom domain, coming soon" -- removed because it now ships.
        //
        // The domain line is worded for the CLIENT-FACING cut that was
        // actually built: the public /d/<token> document surface resolves at
        // the workspace's own hostname. Operator sign-in stays on
        // app.kinectnow.com. "Your own domain" unqualified would read as a
        // white-label login, which is the expensive version we cut.
        //
        // 2026-09-01: "SSO, coming soon" and "Multiple workspaces under one
        // bill, coming soon" LEFT this card and moved up to Kinect Enterprise,
        // where multi-location is the whole proposition. That is a takeaway
        // from published copy, so it is recorded rather than quietly done:
        // every plan's `stripe_price_id` is still NULL, nobody has ever been
        // able to buy Pro, and so nobody bought it on the strength of either
        // line. If that stops being true, this is the paragraph to reread.
        features: ["Your own branding", "your own domain", "priority support"],
        detail: [
          "Everything in Kinect Plus",
          "Your own logo and color on client documents",
          "Your own domain on client document links",
          "Priority support",
          "2 TB storage, more available",
        ],
        cta: "Choose Kinect Pro",
      },
      {
        // Kinect Enterprise (2026-09-01). The multi-location tier: one bill
        // across several offices instead of one workspace, one subscription
        // and one trial per office.
        //
        // BE HONEST ABOUT WHAT SHIPS. On day one this is Kinect Pro plus a
        // larger storage number plus a named human. The four "coming soon"
        // lines are carrying the proposition, and they are not decoration:
        // consolidated billing does not exist, is not started, and needs an
        // org entity above `workspaces` before it can (see
        // docs/PRO-FEATURES.md). The tier ships now so a real multi-location
        // buyer can surface; the doc's own advice is to build it against a
        // named customer rather than a guess.
        //
        // `price` stays a plain number. The per-location rate lives here in
        // `detail` and as a comparison row, never in `price` -- jsonld.ts runs
        // Math.min/Math.max over every tier price to build the site-wide
        // AggregateOffer, so a non-numeric price would emit NaN on every page.
        //
        // "Pooled" is deliberate and is the one storage word that is a
        // promise rather than a fact: the platform enforces 5 TB per
        // workspace, because per-workspace is the only quota machinery that
        // exists (20260921100000_enterprise_plan.sql says so in the same
        // words). It becomes true when the org entity lands.
        //
        // No `popular` flag. Kinect Plus keeps it, and two flagged tiers would
        // render two "Most popular" badges.
        name: "Kinect Enterprise",
        price: 1499,
        annualPrice: 14990,
        tagline: "For firms running more than one location.",
        features: ["Every location", "one bill", "one roll-up"],
        detail: [
          "Everything in Kinect Pro",
          "3 locations included, $250 per location after",
          "5 TB pooled storage, more available",
          "Named support contact",
          "Multiple locations under one bill, coming soon",
          "Cross-location roll-up, coming soon",
          "SSO, coming soon",
        ],
        cta: "Choose Kinect Enterprise",
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
        // Points at the /platform overview's section anchors. Hidden as a
        // draft from 2026-08-03 (every link was a dead "#" before that);
        // shipped 2026-08-30 with the page itself. The anchor ids live in
        // src/content/platform-page.ts -- change them together.
        heading: "Platform",
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
