# KINECT Marketing Site — Launch Checklist

Every item lists an owner: **[Jake]** founder-only (accounts, money, legal), **[dev]** doable in a build session, **[both]** needs credentials then wiring.

## 0. Verification gate (run before every deploy)

```bash
npm run build:check && npm run test:e2e
```

`build:check` = production build + typecheck + unit tests + structured-data validation against a live server. `test:e2e` = 39+ Playwright tests (nav, interactions, waitlist, consent, routing, responsive) against a production build.

## 1. Infrastructure

- [ ] **[Jake]** Vercel project created; domains attached: `kinectnow.com`, `agency.`, `coach.`, `consultant.kinectnow.com` (plus `www.kinectnow.com` pointed at the same project; the proxy 308s it to apex).
- [ ] **[both]** Env vars set in Vercel (see `.env.example`): `NEXT_PUBLIC_POSTHOG_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `NEXT_PUBLIC_SITE_URL=https://kinectnow.com`, `NEXT_PUBLIC_SANITY_PROJECT_ID=gxxphuan`, `NEXT_PUBLIC_SANITY_DATASET=production`, `SANITY_REVALIDATE_SECRET` (Task 17-18; no read token needed -- the dataset is public, see `.env.example`'s own comment).
- [ ] **[Jake]** DNS: apex + www + three persona subdomains → Vercel.

## 2. Data & email

- [ ] **[both]** Supabase: apply `supabase/migrations/0001_waitlist.sql` to the chosen project (RLS on, no public policies — writes go through the server action only).
- [ ] **[Jake]** Resend: verify `kinectnow.com` as sending domain (SPF + DKIM records); confirm `hello@kinectnow.com` works as from-address.
- [ ] **[dev]** End-to-end waitlist test with real creds: submit → row appears in `waitlist_signups` with persona/UTM → confirmation email arrives → duplicate submit returns the "already on the list" state.
- [ ] **[dev]** BLOCKING before Resend goes live: add per-IP rate limiting to the waitlist server action (`src/app/actions/waitlist.ts`). Today the only anti-abuse checks are a honeypot field and a client-controlled render-to-submit timing gate (`src/lib/waitlist-validation.ts`) -- both are trivially bypassed by anything that doesn't run the client JS, so nothing currently caps how many distinct-address emails one caller can trigger Resend to send. Wire this up (e.g. a Supabase-backed counter keyed by IP, or an edge-level rate limit) before `RESEND_API_KEY` is set in production.

## 3. CMS (Tasks 17–18)

- [x] **[Jake]** Sanity login/token for project creation.
- [x] **[dev]** Schemas + Studio deployed; `production` dataset flipped to public visibility and seeded from the content modules (`npm run seed:sanity`) with all 9 documents confirmed (`homePage`, `siteSettings`, 3 `personaPage-*`, 4 `legalPage-*`).
- [ ] **[dev]** Revalidation webhook (below) -- `sanity hooks create` requires interactive prompts (no non-interactive flags for dataset/URL/triggers/secret in this CLI version, confirmed via `--help`), so it wasn't run headlessly here. Create it once via the Sanity manage console instead:
  1. Go to `https://www.sanity.io/manage/project/gxxphuan/api/webhooks` (or `npx sanity hooks create` interactively from a terminal).
  2. **Name**: `content-revalidate` (or similar). **Dataset**: `production`.
  3. **URL**: `https://kinectnow.com/api/revalidate`.
  4. **Trigger on**: Create, Update, Delete (all three).
  5. **HTTP method**: POST. **API version**: `v2021-03-25` or later (any recent version -- the payload is just used for its `_id`).
  6. **Secret**: the exact value of `SANITY_REVALIDATE_SECRET` from the deploy's env vars (generate locally with `openssl rand -hex 32` if the one in `.env.local` shouldn't carry over to prod; either way it must byte-match what's set in Vercel).
  7. Leave "Include drafts" off (published dataset only -- this project has no draft workflow).
  8. Save, then trigger any document edit in the Studio and confirm the webhook's delivery log (same manage console page) shows a `200` from `/api/revalidate`.
- [ ] **[Jake]** Studio access granted to the team (invite collaborators in the Sanity manage console).
- **What Sanity edits do NOT reach** (read before assuming an editorial change will show up everywhere): OG images (`opengraph-image.tsx` per route -- static, code-driven, not a Sanity field); `public/llms.txt` (a static file, not generated from any fetched content); Nav chrome labels/links (`navLinks`, the Solutions dropdown rows) come from `settings` inside `src/components/Nav.tsx`, a Client Component that deliberately stays on the local content module rather than fetching Sanity client-side (see that file's own doc comment) -- editing Site Settings in the Studio changes the footer and pricing section but not the nav links or Solutions dropdown copy; and the copy-voice guardrails (`src/content/content.test.ts` -- no em dashes, no exclamation points, no emoji) only run against the local `src/content/*.ts` modules at test time, never against live Sanity content, so an editor publishing a change through the Studio gets no automated check that it still follows the voice guide -- that has to be enforced manually during editorial review.

## 4. Analytics

- [ ] **[Jake]** PostHog: create a dedicated "KINECT marketing" project (separate from the app's); provide the project API key.
- [ ] **[dev]** With the real key: verify consent-gated init, events flowing, reverse proxy working in production (no ad-blocker losses on `/ph/*`).
- [ ] **[dev]** Build the spec §6 funnels in PostHog: core (pageview → cta_clicked → waitlist_submitted by persona/UTM source), lane-routing (home → persona_card/solutions → persona pageview → signup); launch dashboard (signups by persona, conversion by page, top UTM sources, FAQ engagement).
- [x] **[dev]** Vercel Analytics (cookieless) wired in code: `@vercel/analytics` is installed and `<Analytics />` mounts in the `(site)` layout next to `PostHogProvider` (unconditional, no consent gate needed -- see `src/content/legal/cookies.ts`'s "Cookieless performance analytics" disclosure).
- [ ] **[Jake]** Remaining: enable Analytics for this project in the Vercel dashboard (Project → Analytics → Enable) so the already-mounted `<Analytics />` component actually has somewhere to report to.

## 5. Search & AI discoverability

- [ ] **[Jake]** Search Console: verify all four hostname properties; submit each host's own `/sitemap.xml` (robots.txt on each host already advertises its own sitemap).
- [ ] **[dev]** Google Rich Results Test on `/`, all three persona pages, one legal page — expect Organization, SoftwareApplication with AggregateOffer ($149–$799, 3 offers), FAQPage where applicable. (Automated JSON-LD validation already runs in `build:check`; this is the Google-side confirmation.)
- [ ] **[Jake]** Off-site action list from the spec (§8a-iii), in priority order: G2 + Capterra profiles with early reviews; entity cleanup ("KINECT client portal" naming everywhere, Wikidata attempt); listicle outreach (FuseBase/Taskip/Softr/Agiled roundups, Zapier/ClickUp blogs); disclosed Reddit participation; Product Hunt + YouTube walkthrough. See the GTM strategy doc for cadence.

## 6. Link previews

- [ ] **[dev]** Paste each page URL into Slack, LinkedIn, X, and iMessage — confirm the branded OG card renders (dark canvas, gradient headline, persona accents on persona pages). OG endpoints and absolute URLs are already test-covered; this is renderer-side QA.

## 7. Legal (blocking)

- [ ] **[Jake]** Add the company legal name and registered address to the four policies once the entity is formalized (2026-07-25: entity still forming; contact lines currently use hello@kinectnow.com, governing law set to the State of Texas).
- [ ] **[Jake]** Counsel review of all four policies (drafts match actual data practices but are not legal advice).
- [ ] Post-launch backlog: DPA and Accessibility pages (footer legal links currently "#").

## 8. Performance & devices

- [ ] **[dev]** Lighthouse ≥ 90 performance on `/` and one persona page, throttled mobile.
- [ ] **[Jake/dev]** Real-device pass (the design handoff flags that mobile was never verified on hardware): iPhone Safari + one Android Chrome — nav sheet, hero, cycler pinning, waitlist dialog, consent banner.

## 9. Known deferred items

- Customer logo strip: built, renders null until real logos exist (per handoff: never ship it empty).
- Screenshot re-capture from the real app once it ships (marketing must not show stale UI).
- Post-launch content roadmap (spec §8a-ii): comparison pages, "clients never open the portal" answer page, extra FAQ entries via Sanity.
- Persona-segment deep paths serve in place on the apex (Task 21 narrowing); a tripwire comment in `src/proxy.ts` flags revisiting if persona content sub-pages are ever added.
- `CTA_MODE` in `src/lib/cta.ts` flips waitlist → real signup URL when the app launches.
- Recounted "#" (no real destination) links remaining after the final review round's dead-link fixes (I1/I6 fixed the footer Solutions column, Company "Security", and all four legal links; the ones below are unaddressed, no destination page exists for any of them yet):
  - Nav: "Product", "Docs" (`src/content/settings.ts` `navLinks`).
  - Footer legal: "DPA", "Accessibility" (`src/content/settings.ts` `footer.legalLinks`).
  - Footer social icons: X, LinkedIn, Instagram, YouTube (`SOCIAL_ICONS` in `src/components/Footer.tsx`) -- 4 links, no real profiles exist yet (see §5's off-site action list).
  - Also still "#", out of this round's scope: footer "Compare plans" (Solutions column), the entire Platform column (5 links), the entire Resources column (4 links), and Company "About"/"Contact"/"Status" -- none of these have a built destination page.
