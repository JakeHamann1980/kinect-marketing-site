# KINECT Marketing Site — Design Spec

**Date:** 2026-07-25
**Status:** Complete — pending user review
**Source design:** `KINECT Marketing Site.dc.html` / `KINECT Marketing Site.html` + `README.md` handoff in repo root. The handoff is high-fidelity and final: colors, typography, spacing, motion timings, and copy are exact and must be recreated faithfully.

## Overview

The public marketing site for KINECT, a client-portal SaaS sold to three personas. Four pages across four hostnames:

| Page | Hostname | Audience |
|---|---|---|
| Home | `kinectnow.com` | Anyone; routes visitors to their lane |
| Agency | `agency.kinectnow.com` | Marketing / creative agencies (primary) |
| Coach | `coach.kinectnow.com` | Fitness coaches and trainers |
| Consultant | `consultant.kinectnow.com` | Consultants and mentors |

The KINECT application is a separate build (separate handoff, separate session). The marketing site shares only design tokens and the logo lockup with it.

## 1. Stack & Repo

- **Separate repo** from the app; this directory becomes that repo.
- **Next.js (App Router) + TypeScript + Tailwind**, matching the platform overview doc's prescribed stack (Next.js App Router, TypeScript, Tailwind, Supabase, Vercel).
- **One Vercel project** with all four domains attached.
- **Fonts self-hosted** via `next/font`: Hanken Grotesk (700), Instrument Sans (400/500/600), IBM Plex Mono (400/500).
- Product screenshots from `assets/` served as optimized static images (`next/image`).

## 2. Routing & Persona Resolution

- **Middleware reads the hostname** and rewrites persona subdomains to internal routes: `agency.kinectnow.com` → `/agency`, `coach.` → `/coach`, `consultant.` → `/consultant`. Root domain serves the home route. (Implemented as `src/proxy.ts` — Next.js 16 renamed the middleware convention to proxy.)
- **One persona page template** rendered from persona config; personas differ only in content, accent color, and screenshot.
- **Canonical URLs are the subdomains.** Direct persona-root access in production (`kinectnow.com/agency`) 308-redirects to the subdomain root. Deep paths under persona segments serve in place (revised in Task 21: Next's file-convention OG images live under the persona segments and resolve via the apex `metadataBase`, so redirecting them broke persona OG images; no persona content sub-pages exist, and a code tripwire flags revisiting if any are added).
- **`www.kinectnow.com` 308-redirects to the apex** with path and query preserved, so www never serves duplicate content.
- **Proxy exclusions are segment-anchored** (`/api/...` excluded; a future `/apiary` page still routes through the proxy).
- **Local dev:** path routes work directly; `*.localhost` hostnames exercise the middleware.

## 3. Content: Sanity CMS

CMS from day one so copy is editable without deploys.

- **Schemas** mirroring the design's structure:
  - `homePage` — hero, persona selector cards, how-it-works steps, product showcase, feature pillars, FAQ, closing CTA.
  - `personaPage` (×3) — hero, capability card grid, screenshot reference, workflow/features, FAQ, closing CTA.
  - `siteSettings` — nav, footer, Solutions dropdown entries, pricing tiers (shared across all pages: Starter $149 / Growth $399 / Scale $799), social links.
  - `legalPage` — title, prose body (Portable Text).
  - Per-page SEO fields (title, description, OG overrides) on every page schema.
- **Static generation + webhook revalidation:** pages are statically generated; a Sanity webhook triggers on-demand revalidation, so the site is fully static between edits.
- **Seed script** imports the final handoff copy verbatim so launch content matches the design exactly (em-dash-free, Title Case card headers, length-normalized card copy).
- **Typed content** via Sanity TypeGen; GROQ queries per page.

## 4. Design System & Components

- **Tokens** from the handoff become the Tailwind theme (colors, radii, shadows, type scale, spacing). Persona accent colors are CSS variables switched by a `data-persona` attribute on the page root.
- **Key components**, each built to the handoff's exact specs:
  - **Sticky nav** — transparent over hero, gains blurred dark background on scroll via a 1px sentinel + IntersectionObserver. Ancestors must use `overflow-x: clip`, never `overflow-x: hidden` (breaks `position: sticky` — known bug from the prototype).
  - **Solutions dropdown** (hover + focus) and **mobile sheet** (≤860px hamburger).
  - **Hero background** — grid + dots (dots exactly on grid intersections, offsets preserved; never set `background` shorthand on the grid element), breathing orbs (~18s/~23s), trace-line sweeps (23–41s, near-subliminal). All pure CSS, all gated behind `prefers-reduced-motion: reduce`.
  - **Screenshot cycler** — client component; 15s three-stage cross-fade with synced labels; clicking a label pins that persona (real state, pauses cycle); clicking the active label resumes.
  - **FAQ accordion** — one open at a time, inverting `＋` indicator.
  - **Pricing cards, persona cards, feature pillars, step cards, footer** per handoff specs.
- **Customer logo strip:** built but not rendered until real logos exist (per handoff: do not ship empty).
- **Demo chrome** (fake browser frame, URL bar, page tabs) is never ported.
- **Copy constraints enforced:** no em dashes anywhere; Title Case card headers and section titles; `text-wrap: balance` on headlines, `text-wrap: pretty` on body; no hard `<br>`s.
- **Breakpoints:** 1024px / 860px / 480px per the handoff's responsive spec.

## 5. Waitlist ("Start free")

- Every "Start free" CTA opens a waitlist form (the app is not yet live).
- Submission via **server action** → Supabase `waitlist_signups` table: email, source page/persona, UTM params, timestamp.
- **Resend** sends a confirmation email.
- Spam protection: honeypot field + basic rate limiting.
- The CTA destination is a single config value so it can be swapped to the real app signup URL later without touching components.

## 6. Analytics & Consent

- **PostHog** with consent-gated initialization: no analytics cookies until opt-in via the consent banner. Loaded via a reverse proxy path on our own domain (Next.js rewrite) so tracking survives ad blockers where consent is given.
- A **dedicated PostHog project for the marketing site** (separate from the app's), so marketing funnels stay clean; cross-domain linking to the app added when the app launches.
- Footer "Cookie Preferences" link reopens the preference panel.
- **Vercel Analytics** (cookieless) for Core Web Vitals.

### Event taxonomy

Every event carries `persona` (home/agency/coach/consultant) and first-touch UTM params as properties.

| Event | Fired when |
|---|---|
| `$pageview` | Route view (per hostname/persona) |
| `cta_clicked` | Any "Start free" or secondary CTA (props: location, e.g. nav/hero/pricing/closing) |
| `waitlist_opened` | Waitlist form opened |
| `waitlist_submitted` | Successful signup (also written to Supabase with the same UTM/persona props) |
| `persona_card_clicked` | Home "Pick your lane" card → persona page |
| `solutions_nav_clicked` | Solutions dropdown row clicked |
| `screenshot_pinned` | Product showcase label pinned |
| `faq_opened` | FAQ row expanded (prop: question) |
| `pricing_tier_clicked` | Pricing card CTA (prop: tier) |
| `consent_updated` | Consent banner choice (prop: granted/denied) |

### Funnels & dashboards (set up in PostHog at launch)

- **Core funnel:** pageview → `cta_clicked` → `waitlist_submitted`, broken down by persona and UTM source.
- **Lane-routing funnel:** home pageview → `persona_card_clicked` / `solutions_nav_clicked` → persona pageview → signup.
- Launch dashboard: signups by persona, conversion rate by page, top UTM sources, FAQ engagement.

## 7. Legal Pages & Consent Banner

- Real drafted copy (not placeholders) for **Privacy Policy, Terms and Conditions, Security, and Cookie Policy**, written to match actual data practices (waitlist emails in Supabase, Resend transactional email, consent-gated PostHog).
- Styled as simple prose pages in the site's light theme, content in Sanity (`legalPage`).
- **Consent management banner** wired to gate analytics; preferences persisted and re-editable.
- All legal copy is flagged for the founder's legal review before launch; drafts are not legal advice.

## 8. Search, AI Discoverability & Previews

### 8a. Research findings (completed 2026-07-25; three parallel research agents)

**Entity & naming.** KINECT currently has zero search or AI-answer presence, and the name collides with trykinect.ai, kenect.com, and Kinectiv. Research on AI citation shows small brands without a clean entity (consistent naming + `Organization` schema + review-site profiles + Wikidata) have citation probability near zero regardless of content quality. The site therefore always pairs the brand with the category ("KINECT client portal"), ships a shared `Organization` JSON-LD `@id` with `sameAs` links across all four hostnames, and the off-site list (below) starts with G2/Capterra profiles and a Wikidata entry. Also: "Practice HQ" collides with an unrelated PracticeHQ product and the (now shut down) coaching platform Practice — it stays as on-page branding for the consultant page but is never a keyword target.

**Competitor landscape corrections.** Copilot has rebranded to Assembly (assembly.com); Practice.do shut down in Nov 2025. Closest analogs: SuiteDash (flat-fee, white-label, dominant on G2), Assembly, FuseBase, ClientVenue, Agency Handy (agencies); Trainerize/TrueCoach/CoachAccountable (coaches); fragmented generalists (consultants — no incumbent owns "client portal for consultants").

**Positioning white space (validated).** No competitor's hero claims the *client's* behavior ("a portal clients actually open" is uncontested); every AI-led competitor points AI at the operator, not at explaining work to the client; "no per-seat" is real differentiation but must be said explicitly (competitors are flat silently); client-facing analytics as a headline claim is unclaimed. The designed copy already occupies all four positions — the research confirms it, no copy changes needed.

**Target search terms per page** (these drive `<title>`/meta, not the designed H1s, which already lead with pain language as the keyword research recommends):

| Page | Primary target | Secondary |
|---|---|---|
| Home | client portal software | client portal that clients actually open (JTBD) |
| Agency | client portal for creative agencies | client portal software for agencies, "clients never open the report" |
| Coach | client check-in app for coaches | coaching client management software |
| Consultant | client portal for consultants | deliverables tracking for consultants |

Example patterns (final wording set during build): Home — "KINECT | Client Portal Software Clients Actually Open"; Agency — "Client Portal Software for Marketing & Creative Agencies | KINECT". Every meta description names the persona pain plus the flat-price hook; no fetched competitor combines both today.

**Evidence-based reprioritization.** Current research demoted two items and promoted two:

- *Demoted:* `llms.txt` (AI crawlers fetch it ~0.1% of the time; no lab commits to reading it) and FAQ schema as an AI-citation lever (no measured citation lift). Both still ship — near-zero cost, and FAQ schema retains classic-SERP value that only 2 of 11 competitors use — but neither is load-bearing strategy.
- *Promoted:* `SoftwareApplication` + `AggregateOffer` JSON-LD with real prices (lowPrice 149, highPrice 799, offerCount 3) — only HoneyBook implements this correctly in the entire category, making it the cleanest rich-snippet opportunity available. And answer-ready formatting: the first ~50 words of each page's crawlable content state what KINECT is, who it's for, and the price (+40% citation visibility for quote-ready direct answers per KDD 2024 research). All JSON-LD is validated with Google's Rich Results Test before ship (one competitor ships a broken schema block today).

**Subdomain architecture: known trade-off, mitigated.** None of the 11 competitors use subdomains for personas; search engines treat subdomains as more separate than subfolders, so authority may not consolidate across the four hostnames. The subdomain decision stands (it is the handoff's intended design), treated as a monitored hypothesis: shared `Organization @id` + `sameAs` across hostnames, contextual cross-links between persona pages (the Solutions dropdown and persona cards already provide these), per-hostname Search Console properties from day one, and a documented pivot path to `/agencies|/coaches|/consultants` subfolders (the middleware architecture makes this a redirect-map change, not a rebuild).

### 8a-ii. Post-launch content roadmap (fast-follow, not in the v1 build)

The research is unambiguous that the highest-impact content for both classic SEO and AI citations is self-authored comparison content — nearly every "best client portal" page that AI engines learn from is a competitor's own listicle. Because the handoff's copy is final, these ship *after* launch as new pages (built on the same section components, copy authored then):

1. Comparison pages: KINECT vs Assembly vs SuiteDash (agency); vs Trainerize/TrueCoach (coach); "best client portal for consultants" (consultant). Honest tables, real screenshots, migration guidance — quality wins against the thin listicles ranking today.
2. A JTBD answer page for "clients never open the portal / report" — the single best content-to-tagline fit found, with no dominant answer page in existence.
3. Additional research-driven FAQ entries (e.g. "Why doesn't KINECT charge per seat?", "Will my clients actually use this instead of email?") — added via Sanity as copy decisions, since launch FAQ copy is final per the handoff.

### 8a-iii. Off-site action list (founder-owned; outside the site build)

Priority-ordered from the AI-citation research; the build cannot do these, but the strategy depends on them:

1. **G2 + Capterra profiles with 10–20 seeded reviews** — presence is effectively a gate: 99–100% of AI-recommended tools have profiles; recency beats volume.
2. **Entity cleanup** — consistent "KINECT client portal" naming everywhere, Wikidata entry attempt, monitoring for brand-collision confusion.
3. **Listicle outreach** — pitch inclusion into the specific pages currently shaping AI answers (FuseBase, Taskip, Softr, Agiled roundups, Zapier/ClickUp blogs).
4. **Disclosed Reddit participation** (r/agency, r/freelance, r/marketing, r/coaching, r/consulting) — Reddit is the largest UGC citation source; disclosed helpful comments survive moderation at 83% vs 18% for disguised promo.
5. **Product Hunt launch** and a simple **YouTube product walkthrough** (YouTube is 14–20% of Perplexity citations; cheap to produce).

### 8b. Technical SEO & AEO/GEO

- Server-rendered semantic HTML (guaranteed by the static build).
- **Structured data (JSON-LD):** `Organization` (shared `@id` + `sameAs` across all four hostnames), `WebSite`, `SoftwareApplication` with `AggregateOffer` (lowPrice 149, highPrice 799, offerCount 3, USD), `FAQPage` on every page with FAQs. All blocks validated with Google's Rich Results Test in CI.
- **Answer-ready pages:** each page carries a direct what/who/price statement in its crawlable surfaces that do not touch the final designed copy: the meta description, the `SoftwareApplication` JSON-LD description, and the pricing section (which already states the three flat tiers). The full "first ~50 words" formatting rule applies as an acceptance criterion to the new content pages in §8a-ii, where copy is authored fresh.
- **robots.txt** explicitly allowing GPTBot, ClaudeBot, PerplexityBot, Google-Extended.
- **`llms.txt`** ships as low-cost hygiene, not strategy (see §8a: crawlers rarely fetch it).
- **Sitemaps** and canonical tags served per hostname; canonicals always point at the subdomain URLs.
- **Search Console properties per hostname** from day one, monitoring the subdomain-consolidation hypothesis (§8a).

### 8c. OpenGraph / Preview Strategy

- **Dynamic OG images** generated at the edge (`ImageResponse`) from brand templates: dark canvas, grid pattern, gradient headline phrase, persona accent. Distinct variants for home, each persona, and pricing/legal pages.
- Full `og:*` + `twitter:card` (`summary_large_image`) sets with absolute per-hostname URLs.
- Metadata and OG overrides editable in Sanity.
- Favicon, touch icons, and `theme-color` derived from the asterisk mark.
- Pre-launch QA through Slack, LinkedIn, X, and iMessage preview validators.

## 9. Testing & Verification

- **Playwright** covering: nav stick/unstick, Solutions dropdown, mobile sheet, FAQ accordion, screenshot pin/resume, waitlist submission (mocked), consent banner gating, subdomain middleware rewrites.
- **Reduced-motion** check: decorative animation disabled under `prefers-reduced-motion: reduce`.
- **Responsive passes** at 1024/860/480 compared against the reference `KINECT Marketing Site.html`.
- **Lighthouse / Core Web Vitals** budget before launch.
- Mobile behavior verified in browser device emulation; real-device pass flagged as a pre-launch task (handoff notes it was never device-tested).

## Out of Scope

- The KINECT application itself (separate build).
- Re-capturing product screenshots (use handoff assets; re-capture planned once the real app exists).
- Real customer logos (strip stays unrendered until they exist).
- Demo chrome from the prototype (never ships).
- Mobile app considerations (platform-side concern).
